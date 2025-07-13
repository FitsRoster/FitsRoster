
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
      arrival: '05:20+1',
      frequency: 'Daily',
      duration: 4.5,
      crewRequirement: { captains: 1, firstOfficers: 1, cabinCrew: 3, seniorCabinCrew: 1 }
    },
    // Malé Routes
    {
      flightNumber: 'BD 921',
      sector: 'Colombo - Malé',
      departure: '07:05',
      arrival: '08:05',
      frequency: 'Day 1,3,5,7',
      duration: 1.5,
      crewRequirement: { captains: 1, firstOfficers: 1, cabinCrew: 2, seniorCabinCrew: 1 }
    },
    {
      flightNumber: 'BD 922',
      sector: 'Malé - Colombo',
      departure: '09:05',
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
      arrival: '01:15+1',
      frequency: 'Day 2,3,4,6,7',
      duration: 2.75,
      crewRequirement: { captains: 1, firstOfficers: 1, cabinCrew: 3, seniorCabinCrew: 1 }
    },
    {
      flightNumber: 'BD 932',
      sector: 'Dhaka - Colombo',
      departure: '02:15',
      arrival: '05:15',
      frequency: 'Day 2,3,4,6,7',
      duration: 2.75,
      crewRequirement: { captains: 1, firstOfficers: 1, cabinCrew: 3, seniorCabinCrew: 1 }
    },
    // Kuala Lumpur Routes
    {
      flightNumber: 'BD 721',
      sector: 'Colombo - Kuala Lumpur',
      departure: '09:05',
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
    const unassignedFlights: string[] = [];

    // Generate flight assignments for each day in the period
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dayOfMonth = currentDate.getDate();
      
      // Process each flight schedule for this day
      for (const flightSchedule of this.FLIGHT_SCHEDULES) {
        if (this.shouldOperateOnDay(flightSchedule.frequency, currentDate, dayOfWeek, dayOfMonth)) {
          console.log(`Processing flight ${flightSchedule.flightNumber} for ${currentDate.toDateString()}`);
          
          const flightAssignments = this.assignCrewToFlight(
            flightSchedule,
            new Date(currentDate),
            crewMembers,
            [...existingAssignments, ...newAssignments]
          );
          
          // Check if we have minimum required crew
          const totalRequiredCrew = 
            flightSchedule.crewRequirement.captains + 
            flightSchedule.crewRequirement.firstOfficers + 
            flightSchedule.crewRequirement.cabinCrew + 
            flightSchedule.crewRequirement.seniorCabinCrew;
          
          if (flightAssignments.assignments.length < totalRequiredCrew) {
            unassignedFlights.push(`${flightSchedule.flightNumber} on ${currentDate.toDateString()} - insufficient crew (need ${totalRequiredCrew}, got ${flightAssignments.assignments.length})`);
          }
          
          // Validate each assignment against rules
          const validAssignments: RosterAssignment[] = [];
          for (const assignment of flightAssignments.assignments) {
            const crewMember = crewMembers.find(c => c.id === assignment.crewMemberId);
            if (crewMember) {
              const validation = RosterRulesEngine.validateAssignment(
                crewMember,
                [...existingAssignments, ...newAssignments, ...validAssignments],
                assignment
              );
              
              if (validation.valid) {
                validAssignments.push(assignment);
              } else {
                violations.push(`${crewMember.name} on ${flightSchedule.flightNumber}: ${validation.violations.join(', ')}`);
                // Try to find alternative crew if rules are violated
                const alternativeCrew = this.findAlternativeCrew(
                  crewMembers,
                  assignment.position!,
                  assignment.startTime,
                  assignment.endTime,
                  [...existingAssignments, ...newAssignments, ...validAssignments]
                );
                
                if (alternativeCrew) {
                  const altAssignment: RosterAssignment = {
                    ...assignment,
                    crewMemberId: alternativeCrew.id
                  };
                  
                  const altValidation = RosterRulesEngine.validateAssignment(
                    alternativeCrew,
                    [...existingAssignments, ...newAssignments, ...validAssignments],
                    altAssignment
                  );
                  
                  if (altValidation.valid) {
                    validAssignments.push(altAssignment);
                    console.log(`Assigned alternative crew: ${alternativeCrew.name} for ${flightSchedule.flightNumber}`);
                  }
                }
              }
            }
          }
          
          newAssignments.push(...validAssignments);
          violations.push(...flightAssignments.violations);
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate off days and office duties to comply with regulations
    const additionalAssignments = this.generateMandatoryOffDaysAndDuties(
      crewMembers,
      startDate,
      endDate,
      [...existingAssignments, ...newAssignments]
    );
    
    newAssignments.push(...additionalAssignments);

    // Add unassigned flights to violations
    violations.push(...unassignedFlights);

    console.log(`Generated ${newAssignments.length} assignments with ${violations.length} issues`);
    
    return {
      assignments: newAssignments,
      violations: Array.from(new Set(violations)) // Remove duplicates
    };
  }

  private static shouldOperateOnDay(frequency: string, date: Date, dayOfWeek: number, dayOfMonth: number): boolean {
    if (frequency === 'Daily') return true;
    
    // Parse frequency like "Day 1,3,5,7" - these represent days of the week
    if (frequency.startsWith('Day ')) {
      const days = frequency.replace('Day ', '').split(',').map(d => parseInt(d.trim()));
      // Map to JavaScript day numbering (0=Sunday, 1=Monday, etc.)
      const mappedDays = days.map(day => day === 7 ? 0 : day); // Convert 7 to 0 (Sunday)
      return mappedDays.includes(dayOfWeek);
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

    // Parse departure time and handle next day arrivals
    const [depHours, depMinutes] = flightSchedule.departure.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(depHours, depMinutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + Math.floor(flightSchedule.duration));
    endTime.setMinutes(endTime.getMinutes() + ((flightSchedule.duration % 1) * 60));

    // Priority assignment: Captains first, then First Officers, then Cabin Crew
    const assignmentPriority = [
      { role: 'Captain', count: flightSchedule.crewRequirement.captains, position: 'Captain' },
      { role: 'First Officer', count: flightSchedule.crewRequirement.firstOfficers, position: 'First Officer' },
      { role: 'Flight Attendant', count: flightSchedule.crewRequirement.seniorCabinCrew, position: 'Senior Cabin Crew' },
      { role: 'Flight Attendant', count: flightSchedule.crewRequirement.cabinCrew, position: 'Cabin Crew' }
    ];

    for (const { role, count, position } of assignmentPriority) {
      const availableCrew = this.getAvailableCrewByRole(
        crewMembers,
        role,
        startTime,
        endTime,
        [...existingAssignments, ...assignments]
      );
      
      const assigned = Math.min(count, availableCrew.length);
      
      for (let i = 0; i < assigned; i++) {
        assignments.push({
          crewMemberId: availableCrew[i].id,
          eventType: 'flight',
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          flightNumber: flightSchedule.flightNumber,
          position: position as any
        });
      }
      
      if (assigned < count) {
        violations.push(`Insufficient ${role}s for flight ${flightSchedule.flightNumber} on ${date.toDateString()} (need ${count}, got ${assigned})`);
      }
    }

    return { assignments, violations };
  }

  private static findAlternativeCrew(
    crewMembers: CrewMember[],
    position: string,
    startTime: Date,
    endTime: Date,
    existingAssignments: RosterAssignment[]
  ): CrewMember | null {
    const roleMap: { [key: string]: string } = {
      'Captain': 'Captain',
      'First Officer': 'First Officer',
      'Senior Cabin Crew': 'Flight Attendant',
      'Cabin Crew': 'Flight Attendant'
    };
    
    const targetRole = roleMap[position];
    if (!targetRole) return null;
    
    const availableCrew = this.getAvailableCrewByRole(
      crewMembers,
      targetRole,
      startTime,
      endTime,
      existingAssignments
    );
    
    // Return the crew member with the least flight hours (load balancing)
    return availableCrew.length > 0 ? availableCrew[0] : null;
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
        // Check if crew member is available during this time (including buffer time for rest)
        const bufferTime = 2 * 60 * 60 * 1000; // 2 hours buffer in milliseconds
        const conflicts = existingAssignments.filter(assignment => 
          assignment.crewMemberId === crew.id &&
          !(assignment.endTime.getTime() + bufferTime <= startTime.getTime() || 
            assignment.startTime.getTime() >= endTime.getTime() + bufferTime)
        );
        return conflicts.length === 0;
      })
      .sort((a, b) => a.totalFlightHours - b.totalFlightHours); // Prefer crew with fewer hours for load balancing
  }

  private static generateMandatoryOffDaysAndDuties(
    crewMembers: CrewMember[],
    startDate: Date,
    endDate: Date,
    existingAssignments: RosterAssignment[]
  ): RosterAssignment[] {
    const assignments: RosterAssignment[] = [];
    
    crewMembers.forEach(crewMember => {
      const currentDate = new Date(startDate);
      let consecutiveWorkDays = 0;
      
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
          // No assignments, need to assign off day or office duty
          consecutiveWorkDays = 0;
          
          // Mandatory off day every 7th day or on Sundays
          if (consecutiveWorkDays >= 6 || currentDate.getDay() === 0) {
            assignments.push({
              crewMemberId: crewMember.id,
              eventType: 'off',
              startTime: new Date(dayStart),
              endTime: new Date(dayEnd)
            });
          } else if (Math.random() < 0.2) { // 20% chance of office duty
            assignments.push({
              crewMemberId: crewMember.id,
              eventType: 'office_duty',
              startTime: new Date(dayStart.setHours(9, 0, 0, 0)),
              endTime: new Date(dayStart.setHours(17, 0, 0, 0))
            });
          } else {
            // Assign off day to ensure compliance
            assignments.push({
              crewMemberId: crewMember.id,
              eventType: 'off',
              startTime: new Date(dayStart),
              endTime: new Date(dayEnd)
            });
          }
        } else {
          consecutiveWorkDays++;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return assignments;
  }

  static getFlightSchedules(): FlightScheduleData[] {
    return [...this.FLIGHT_SCHEDULES];
  }

  static getCrewRequirementSummary(): { [role: string]: number } {
    const summary = { Captain: 0, 'First Officer': 0, 'Cabin Crew': 0, 'Senior Cabin Crew': 0 };
    
    this.FLIGHT_SCHEDULES.forEach(flight => {
      summary.Captain += flight.crewRequirement.captains;
      summary['First Officer'] += flight.crewRequirement.firstOfficers;
      summary['Cabin Crew'] += flight.crewRequirement.cabinCrew;
      summary['Senior Cabin Crew'] += flight.crewRequirement.seniorCabinCrew;
    });
    
    return summary;
  }
}
