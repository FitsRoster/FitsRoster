
import { CrewMember } from './crewService';
import { RosterRule, RosterAssignment } from '../types/rosterTypes';

export class RosterRulesEngine {
  private static readonly RULES: RosterRule[] = [
    {
      id: 'max_100_hours_28_days',
      type: 'flight_time',
      description: 'Maximum 100 hours of flying in any consecutive 28 days',
      validate: (crewMember: CrewMember, assignments: RosterAssignment[]) => {
        const last28Days = new Date();
        last28Days.setDate(last28Days.getDate() - 28);
        
        const recentFlightHours = assignments
          .filter(a => a.eventType === 'flight' && a.startTime >= last28Days)
          .reduce((total, a) => {
            const duration = (a.endTime.getTime() - a.startTime.getTime()) / (1000 * 60 * 60);
            return total + duration;
          }, 0);
        
        return recentFlightHours <= 100;
      }
    },
    {
      id: 'max_900_hours_12_months',
      type: 'flight_time',
      description: 'Maximum 900 hours of flying in last 12 months',
      validate: (crewMember: CrewMember, assignments: RosterAssignment[]) => {
        const last12Months = new Date();
        last12Months.setMonth(last12Months.getMonth() - 12);
        
        const yearlyFlightHours = assignments
          .filter(a => a.eventType === 'flight' && a.startTime >= last12Months)
          .reduce((total, a) => {
            const duration = (a.endTime.getTime() - a.startTime.getTime()) / (1000 * 60 * 60);
            return total + duration;
          }, 0);
        
        return yearlyFlightHours <= 900;
      }
    },
    {
      id: 'duty_hours_validation',
      type: 'duty_time',
      description: 'Duty hours: 7 days (55h), 14 days (95h), 28 days (190h)',
      validate: (crewMember: CrewMember, assignments: RosterAssignment[]) => {
        const now = new Date();
        
        // Check 7 days
        const last7Days = new Date(now);
        last7Days.setDate(now.getDate() - 7);
        const dutyHours7Days = RosterRulesEngine.calculateDutyHours(assignments, last7Days);
        
        // Check 14 days
        const last14Days = new Date(now);
        last14Days.setDate(now.getDate() - 14);
        const dutyHours14Days = RosterRulesEngine.calculateDutyHours(assignments, last14Days);
        
        // Check 28 days
        const last28Days = new Date(now);
        last28Days.setDate(now.getDate() - 28);
        const dutyHours28Days = RosterRulesEngine.calculateDutyHours(assignments, last28Days);
        
        return dutyHours7Days <= 55 && dutyHours14Days <= 95 && dutyHours28Days <= 190;
      }
    },
    {
      id: 'minimum_rest_between_duties',
      type: 'rest',
      description: 'Minimum 12 hours rest between duties',
      validate: (crewMember: CrewMember, assignments: RosterAssignment[]) => {
        const sortedAssignments = assignments
          .filter(a => a.crewMemberId === crewMember.id && (a.eventType === 'flight' || a.eventType === 'office_duty'))
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        
        for (let i = 1; i < sortedAssignments.length; i++) {
          const previousEnd = sortedAssignments[i - 1].endTime;
          const currentStart = sortedAssignments[i].startTime;
          const restHours = (currentStart.getTime() - previousEnd.getTime()) / (1000 * 60 * 60);
          
          if (restHours < 12) {
            return false;
          }
        }
        
        return true;
      }
    },
    {
      id: 'off_days_requirements',
      type: 'off_days',
      description: 'Off days requirements: 1 in 7 days, 2 consecutive in 14 days',
      validate: (crewMember: CrewMember, assignments: RosterAssignment[]) => {
        const now = new Date();
        const last7Days = new Date(now);
        last7Days.setDate(now.getDate() - 7);
        
        const last14Days = new Date(now);
        last14Days.setDate(now.getDate() - 14);
        
        // Count off days in last 7 days
        const offDays7 = assignments.filter(a => 
          a.crewMemberId === crewMember.id &&
          a.eventType === 'off' && 
          a.startTime >= last7Days
        ).length;
        
        // Get off days in last 14 days for consecutive check
        const offDays14 = assignments.filter(a => 
          a.crewMemberId === crewMember.id &&
          a.eventType === 'off' && 
          a.startTime >= last14Days
        );
        
        // Check for consecutive off days in last 14 days
        const hasConsecutiveOffDays = RosterRulesEngine.hasConsecutiveOffDays(offDays14, 2);
        
        return offDays7 >= 1 && hasConsecutiveOffDays;
      }
    },
    {
      id: 'max_consecutive_duty_days',
      type: 'duty_time',
      description: 'Maximum 6 consecutive duty days',
      validate: (crewMember: CrewMember, assignments: RosterAssignment[]) => {
        const sortedAssignments = assignments
          .filter(a => a.crewMemberId === crewMember.id && a.eventType === 'flight')
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        
        let consecutiveDays = 0;
        let lastDutyDate: Date | null = null;
        
        for (const assignment of sortedAssignments) {
          const currentDate = new Date(assignment.startTime);
          currentDate.setHours(0, 0, 0, 0);
          
          if (lastDutyDate) {
            const daysDiff = Math.floor((currentDate.getTime() - lastDutyDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
              consecutiveDays++;
            } else if (daysDiff > 1) {
              consecutiveDays = 1;
            }
          } else {
            consecutiveDays = 1;
          }
          
          if (consecutiveDays > 6) {
            return false;
          }
          
          lastDutyDate = currentDate;
        }
        
        return true;
      }
    }
  ];

  private static calculateDutyHours(assignments: RosterAssignment[], fromDate: Date): number {
    return assignments
      .filter(a => (a.eventType === 'flight' || a.eventType === 'office_duty') && a.startTime >= fromDate)
      .reduce((total, a) => {
        const duration = (a.endTime.getTime() - a.startTime.getTime()) / (1000 * 60 * 60);
        return total + duration;
      }, 0);
  }

  private static hasConsecutiveOffDays(offDays: RosterAssignment[], requiredConsecutive: number): boolean {
    if (offDays.length < requiredConsecutive) return false;
    
    const sortedDays = offDays.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    for (let i = 0; i <= sortedDays.length - requiredConsecutive; i++) {
      let consecutiveCount = 1;
      let currentDate = new Date(sortedDays[i].startTime);
      currentDate.setHours(0, 0, 0, 0);
      
      for (let j = i + 1; j < sortedDays.length; j++) {
        const nextDate = new Date(sortedDays[j].startTime);
        nextDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          consecutiveCount++;
          currentDate = nextDate;
          if (consecutiveCount >= requiredConsecutive) return true;
        } else {
          break;
        }
      }
    }
    
    return false;
  }

  static validateAssignment(
    crewMember: CrewMember, 
    currentAssignments: RosterAssignment[], 
    newAssignment: RosterAssignment
  ): { valid: boolean; violations: string[] } {
    const crewAssignments = currentAssignments.filter(a => a.crewMemberId === crewMember.id);
    const allAssignments = [...crewAssignments, newAssignment];
    const violations: string[] = [];

    for (const rule of this.RULES) {
      if (!rule.validate(crewMember, allAssignments)) {
        violations.push(rule.description);
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  static validateCrewMemberAssignments(
    crewMember: CrewMember,
    assignments: RosterAssignment[]
  ): { valid: boolean; violations: string[] } {
    const crewAssignments = assignments.filter(a => a.crewMemberId === crewMember.id);
    const violations: string[] = [];

    for (const rule of this.RULES) {
      if (!rule.validate(crewMember, crewAssignments)) {
        violations.push(`${crewMember.name}: ${rule.description}`);
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  static getAllRules(): RosterRule[] {
    return [...this.RULES];
  }
}
