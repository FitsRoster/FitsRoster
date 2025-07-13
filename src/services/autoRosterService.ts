
import { CrewMember, crewService } from './crewService';
import { FlightScheduleData, RosterAssignment, CrewRequirement } from '../types/rosterTypes';
import { RosterRulesEngine } from './rosterRulesEngine';

export class AutoRosterService {
  private static readonly FLIGHT_SCHEDULES: FlightScheduleData[] = [
    // Dubai Routes
    {
      flightNumber: 'BD 821',
      sector: 'Colombo - Dubai',
      departure: '18:55',
      arrival: '22:15',
      frequency: 'Daily',
      duration: 4.5,
      crewRequirement: { captains: 1, firstOfficers: 1, cabinCrew: 3, seniorCabinCrew: 1 }
    },
    {
      flightNumber: 'BD 822',
      sector: 'Dubai - Colombo',
      departure: '23:15',
      arrival: '5:20',
      frequency: 'Daily',
      duration: 4.5,
      crewRequirement: { captains: 1, firstOfficers: 1, cabinCrew: 3, seniorCabinCrew: 1 }
    },
    // Malé Routes
    {
      flightNumber: 'BD 921',
      sector: 'Colombo - Malé',
      departure: '7:05',
      arrival: '8:05',
      frequency: 'Day 1,3,5,7',
      duration: 1.5,
      crewRequirement: { captains: 1, firstOfficers: 1, cabinCrew: 2, seniorCabinCrew: 1 }
    },
    {
      flightNumber: 'BD 922',
      sector: 'Malé - Colombo',
      departure: '9:05',
      arrival: '11:10',
      frequency: 'Day 1,3,5,7',
      duration: 1.5,
      crewRequirement: { captains: 1, firstOfficers: 1, cabinCrew: 2, seniorCabinCrew: 1 }
    },
    // Dhaka Routes
    {
      flightNumber: 'BD 931',
      sector: 'Colombo - Dhaka',
      departure: '21:30',
      arrival: '1:15',
      frequency: 'Day 2,3,4,6,7',
      duration: 2.75,
      crewRequirement: { captains: 1, firstOfficers: 1, cabinCrew: 3, seniorCabinCrew: 1 }
    },
    {
      flightNumber: 'BD 932',
      sector: 'Dhaka - Colombo',
      departure: '2:15',
      arrival: '5:15',
      frequency: 'Day 2,3,4,6,7',
      duration: 2.75,
      crewRequirement: { captains: 1, firstOfficers: 1, cabinCrew: 3, seniorCabinCrew: 1 }
    },
    // Kuala Lumpur Routes
    {
      flightNumber: 'BD 721',
      sector: 'Colombo - Kuala Lumpur',
      departure: '9:05',
      arrival: '15:30',
      frequency: 'Day 1,5',
      duration: 3.5,
      crewRequirement: { captains: 1, firstOfficers: 1, cabinCrew: 3, seniorCabinCrew: 1 }
    },
    {
      flightNumber: 'BD 722',
      sector: 'Kuala Lumpur - Colombo',
      departure: '16:30',
      arrival: '17:35',
      frequency: 'Day 1,5',
      duration: 3.5,
      crewRequirement: { captains: 1, firstOfficers: 1, cabinCrew: 3, seniorCabinCrew: 1 }
    }
  ];

  static async generateAutoRoster(
    startDate: Date,
    endDate: Date,
    existingAssignments: RosterAssignment[] = []
  ): Promise<{ assignments: RosterAssignment[]; violations: string[] }> {
    console.log('Starting auto roster generation...');
    
    const crewMembers = await crewService.getCrewMembers();
    const newAssignments: RosterAssignment[] = [];
    const violations: string[] = [];

    // Generate flight assignments for each day in the period
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Process each flight schedule for this day
      for (const flightSchedule of this.FLIGHT_SCHEDULES) {
        if (this.shouldOperateOnDay(flightSchedule.frequency, currentDate, dayOfWeek)) {
          const flightAssignments = this.assignCrewToFlight(
            flightSchedule,
            currentDate,
            crewMembers,
            [...existingAssignments, ...newAssignments]
          );
          
          // Validate each assignment
          for (const assignment of flightAssignments.assignments) {
            const crewMember = crewMembers.find(c => c.id === assignment.crewMemberId);
            if (crewMember) {
              const validation = RosterRulesEngine.validateAssignment(
                crewMember,
                [...existingAssignments, ...newAssignments],
                assignment
              );
              
              if (validation.valid) {
                newAssignments.push(assignment);
              } else {
                violations.push(`${crewMember.name}: ${validation.violations.join(', ')}`);
              }
            }
          }
          
          violations.push(...flightAssignments.violations);
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate off days and office duties
    const additionalAssignments = this.generateOffDaysAndOfficeDuties(
      crewMembers,
      startDate,
      endDate,
      [...existingAssignments, ...newAssignments]
    );
    
    newAssignments.push(...additionalAssignments);

    console.log(`Generated ${newAssignments.length} assignments with ${violations.length} violations`);
    
    return {
      assignments: newAssignments,
      violations: Array.from(new Set(violations)) // Remove duplicates
    };
  }

  private static shouldOperateOnDay(frequency: string, date: Date, dayOfWeek: number): boolean {
    if (frequency === 'Daily') return true;
    
    // Parse frequency like "Day 1,3,5,7" or "Day 2,3,4,6,7"
    if (frequency.startsWith('Day ')) {
      const days = frequency.replace('Day ', '').split(',').map(d => parseInt(d.trim()));
      const dayOfMonth = date.getDate();
      return days.some(day => dayOfMonth % 7 === day % 7);
    }
    
    return false;
  }

  private static assignCrewToFlight(
    flightSchedule: FlightScheduleData,
    date: Date,
    crewMembers: CrewMember[],
    existingAssignments: RosterAssignment[]
  ): { assignments: RosterAssignment[]; violations: string[] } {
    const assignments: RosterAssignment[] = [];
    const violations: string[] = [];

    // Parse departure time
    const [depHours, depMinutes] = flightSchedule.departure.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(depHours, depMinutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + flightSchedule.duration);

    // Assign Captains
    const availableCaptains = this.getAvailableCrewByRole(
      crewMembers,
      'Captain',
      startTime,
      endTime,
      existingAssignments
    );
    
    for (let i = 0; i < Math.min(flightSchedule.crewRequirement.captains, availableCaptains.length); i++) {
      assignments.push({
        crewMemberId: availableCaptains[i].id,
        eventType: 'flight',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        flightNumber: flightSchedule.flightNumber,
        position: 'Captain'
      });
    }

    // Assign First Officers
    const availableFirstOfficers = this.getAvailableCrewByRole(
      crewMembers,
      'First Officer',
      startTime,
      endTime,
      [...existingAssignments, ...assignments]
    );
    
    for (let i = 0; i < Math.min(flightSchedule.crewRequirement.firstOfficers, availableFirstOfficers.length); i++) {
      assignments.push({
        crewMemberId: availableFirstOfficers[i].id,
        eventType: 'flight',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        flightNumber: flightSchedule.flightNumber,
        position: 'First Officer'
      });
    }

    // Assign Cabin Crew (treating all flight attendants as cabin crew for now)
    const availableCabinCrew = this.getAvailableCrewByRole(
      crewMembers,
      'Flight Attendant',
      startTime,
      endTime,
      [...existingAssignments, ...assignments]
    );
    
    const totalCabinCrewNeeded = flightSchedule.crewRequirement.cabinCrew + flightSchedule.crewRequirement.seniorCabinCrew;
    
    for (let i = 0; i < Math.min(totalCabinCrewNeeded, availableCabinCrew.length); i++) {
      assignments.push({
        crewMemberId: availableCabinCrew[i].id,
        eventType: 'flight',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        flightNumber: flightSchedule.flightNumber,
        position: i < flightSchedule.crewRequirement.seniorCabinCrew ? 'Senior Cabin Crew' : 'Cabin Crew'
      });
    }

    // Check if we have enough crew
    if (assignments.length < (
      flightSchedule.crewRequirement.captains + 
      flightSchedule.crewRequirement.firstOfficers + 
      flightSchedule.crewRequirement.cabinCrew + 
      flightSchedule.crewRequirement.seniorCabinCrew
    )) {
      violations.push(`Insufficient crew for flight ${flightSchedule.flightNumber} on ${date.toDateString()}`);
    }

    return { assignments, violations };
  }

  private static getAvailableCrewByRole(
    crewMembers: CrewMember[],
    role: string,
    startTime: Date,
    endTime: Date,
    existingAssignments: RosterAssignment[]
  ): CrewMember[] {
    return crewMembers
      .filter(crew => crew.role === role)
      .filter(crew => {
        // Check if crew member is available during this time
        const conflicts = existingAssignments.filter(assignment => 
          assignment.crewMemberId === crew.id &&
          ((assignment.startTime <= startTime && assignment.endTime > startTime) ||
           (assignment.startTime < endTime && assignment.endTime >= endTime) ||
           (assignment.startTime >= startTime && assignment.endTime <= endTime))
        );
        return conflicts.length === 0;
      })
      .sort((a, b) => a.totalFlightHours - b.totalFlightHours); // Prefer crew with fewer hours
  }

  private static generateOffDaysAndOfficeDuties(
    crewMembers: CrewMember[],
    startDate: Date,
    endDate: Date,
    existingAssignments: RosterAssignment[]
  ): RosterAssignment[] {
    const assignments: RosterAssignment[] = [];
    
    crewMembers.forEach(crewMember => {
      const currentDate = new Date(startDate);
      let daysSinceLastOff = 0;
      
      while (currentDate <= endDate) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        // Check if crew member has any assignments this day
        const dayAssignments = existingAssignments.filter(assignment =>
          assignment.crewMemberId === crewMember.id &&
          assignment.startTime >= dayStart &&
          assignment.startTime <= dayEnd
        );
        
        if (dayAssignments.length === 0) {
          daysSinceLastOff++;
          
          // Assign off day if it's been 6 days since last off (ensuring 1 off day in 7)
          if (daysSinceLastOff >= 6 || currentDate.getDay() === 0) { // Sunday preference for off days
            assignments.push({
              crewMemberId: crewMember.id,
              eventType: 'off',
              startTime: new Date(dayStart),
              endTime: new Date(dayEnd)
            });
            daysSinceLastOff = 0;
          } else if (Math.random() < 0.3) { // 30% chance of office duty on free days
            assignments.push({
              crewMemberId: crewMember.id,
              eventType: 'office_duty',
              startTime: new Date(dayStart.setHours(9, 0, 0, 0)),
              endTime: new Date(dayStart.setHours(17, 0, 0, 0))
            });
          }
        } else {
          daysSinceLastOff = 0;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return assignments;
  }

  static getFlightSchedules(): FlightScheduleData[] {
    return [...this.FLIGHT_SCHEDULES];
  }
}
