
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
        const dutyHours7Days = this.calculateDutyHours(assignments, last7Days);
        
        // Check 14 days
        const last14Days = new Date(now);
        last14Days.setDate(now.getDate() - 14);
        const dutyHours14Days = this.calculateDutyHours(assignments, last14Days);
        
        // Check 28 days
        const last28Days = new Date(now);
        last28Days.setDate(now.getDate() - 28);
        const dutyHours28Days = this.calculateDutyHours(assignments, last28Days);
        
        return dutyHours7Days <= 55 && dutyHours14Days <= 95 && dutyHours28Days <= 190;
      }
    },
    {
      id: 'minimum_rest_between_duties',
      type: 'rest',
      description: 'Minimum rest period between duties',
      validate: (crewMember: CrewMember, assignments: RosterAssignment[]) => {
        const sortedAssignments = assignments
          .filter(a => a.eventType === 'flight' || a.eventType === 'office_duty')
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        
        for (let i = 1; i < sortedAssignments.length; i++) {
          const previousEnd = sortedAssignments[i - 1].endTime;
          const currentStart = sortedAssignments[i].startTime;
          const restHours = (currentStart.getTime() - previousEnd.getTime()) / (1000 * 60 * 60);
          
          if (restHours < 12) { // Minimum 12 hours rest
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
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const offDays7 = assignments.filter(a => 
          a.eventType === 'off' && a.startTime >= last7Days
        ).length;
        
        const last14Days = new Date();
        last14Days.setDate(last14Days.getDate() - 14);
        const offDays14 = assignments.filter(a => 
          a.eventType === 'off' && a.startTime >= last14Days
        );
        
        // Check for consecutive off days in last 14 days
        const hasConsecutiveOffDays = this.hasConsecutiveOffDays(offDays14, 2);
        
        return offDays7 >= 1 && hasConsecutiveOffDays;
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
      for (let j = i + 1; j < sortedDays.length; j++) {
        const daysDiff = Math.floor(
          (sortedDays[j].startTime.getTime() - sortedDays[j-1].startTime.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff === 1) {
          consecutiveCount++;
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
    const allAssignments = [...currentAssignments, newAssignment];
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

  static getAllRules(): RosterRule[] {
    return [...this.RULES];
  }
}
