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
    console.log('Starting auto roster generation for period:', startDate, 'to', endDate);
    
    const crewMembers = await crewService.getCrewMembers();
    console.log('Available crew members:', crewMembers.length);
    
    if (crewMembers.length === 0) {
      throw new Error('No crew members available for roster generation');
    }

    const newAssignments: RosterAssignment[] = [];
    const violations: string[] = [];
    const unassignedFlights: string[] = [];

    // Generate assignments for each day in the period
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      console.log('Processing date:', currentDate.toDateString());
      const dayOfWeek = currentDate.getDay();
      
      // Process each flight schedule for this day
      for (const flightSchedule of this.FLIGHT_SCHEDULES) {
        if (this.shouldOperateOnDay(flightSchedule.frequency, currentDate, dayOfWeek)) {
          console.log(`Assigning crew for flight ${flightSchedule.flightNumber} on ${currentDate.toDateString()}`);
          
          const flightResult = await this.assignCrewToFlight(
            flightSchedule,
            new Date(currentDate),
            crewMembers,
            [...existingAssignments, ...newAssignments]
          );
          
          if (flightResult.assignments.length > 0) {
            newAssignments.push(...flightResult.assignments);
            console.log(`Successfully assigned ${flightResult.assignments.length} crew members to ${flightSchedule.flightNumber}`);
          } else {
            unassignedFlights.push(`${flightSchedule.flightNumber} on ${currentDate.toDateString()} - no crew available`);
          }
          
          violations.push(...flightResult.violations);
        }
      }
      
      // Generate mandatory off days for crew without assignments
      const offDayAssignments = this.generateOffDaysForDate(
        crewMembers,
        new Date(currentDate),
        [...existingAssignments, ...newAssignments]
      );
      
      newAssignments.push(...offDayAssignments);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add unassigned flights to violations
    violations.push(...unassignedFlights);

    console.log(`Roster generation complete: ${newAssignments.length} assignments, ${violations.length} violations`);
    
    return {
      assignments: newAssignments,
      violations: Array.from(new Set(violations))
    };
  }

  private static shouldOperateOnDay(frequency: string, date: Date, dayOfWeek: number): boolean {
    if (frequency === 'Daily') return true;
    
    if (frequency.startsWith('Day ')) {
      const days = frequency.replace('Day ', '').split(',').map(d => parseInt(d.trim()));
      // Convert to JavaScript day numbering (0=Sunday, 1=Monday, etc.)
      const mappedDays = days.map(day => day === 7 ? 0 : day);
      return mappedDays.includes(dayOfWeek);
    }
    
    return false;
  }

  private static async assignCrewToFlight(
    flightSchedule: FlightScheduleData,
    date: Date,
    crewMembers: CrewMember[],
    existingAssignments: RosterAssignment[]
  ): Promise<{ assignments: RosterAssignment[]; violations: string[] }> {
    const assignments: RosterAssignment[] = [];
    const violations: string[] = [];

    // Calculate flight times
    const [depHours, depMinutes] = flightSchedule.departure.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(depHours, depMinutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + Math.floor(flightSchedule.duration));
    endTime.setMinutes(endTime.getMinutes() + ((flightSchedule.duration % 1) * 60));

    // Handle next day arrivals (indicated by +1)
    if (flightSchedule.arrival.includes('+1')) {
      endTime.setDate(endTime.getDate() + 1);
    }

    console.log(`Flight ${flightSchedule.flightNumber}: ${startTime.toISOString()} to ${endTime.toISOString()}`);

    // Assignment priority: Captains, First Officers, Senior Cabin Crew, Cabin Crew
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
      
      const assignedCount = Math.min(count, availableCrew.length);
      
      for (let i = 0; i < assignedCount; i++) {
        const crewMember = availableCrew[i];
        const assignment: RosterAssignment = {
          crewMemberId: crewMember.id,
          eventType: 'flight',
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          flightNumber: flightSchedule.flightNumber,
          position: position as any
        };

        // Validate assignment against rules
        const validation = RosterRulesEngine.validateAssignment(
          crewMember,
          [...existingAssignments, ...assignments],
          assignment
        );

        if (validation.valid) {
          assignments.push(assignment);
          console.log(`Assigned ${crewMember.name} (${role}) to ${flightSchedule.flightNumber}`);
        } else {
          violations.push(`${crewMember.name} on ${flightSchedule.flightNumber}: ${validation.violations.join(', ')}`);
        }
      }
      
      if (assignedCount < count) {
        violations.push(`Insufficient ${role}s for flight ${flightSchedule.flightNumber} on ${date.toDateString()} (need ${count}, assigned ${assignedCount})`);
      }
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
        // Check availability with minimum rest requirements
        const restBuffer = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
        const conflicts = existingAssignments.filter(assignment => 
          assignment.crewMemberId === crew.id &&
          !(assignment.endTime.getTime() + restBuffer <= startTime.getTime() || 
            assignment.startTime.getTime() >= endTime.getTime() + restBuffer)
        );
        return conflicts.length === 0;
      })
      .sort((a, b) => a.totalFlightHours - b.totalFlightHours); // Load balancing
  }

  private static generateOffDaysForDate(
    crewMembers: CrewMember[],
    date: Date,
    existingAssignments: RosterAssignment[]
  ): RosterAssignment[] {
    const assignments: RosterAssignment[] = [];
    
    crewMembers.forEach(crewMember => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Check if crew member has any assignments this day
      const dayAssignments = existingAssignments.filter(assignment =>
        assignment.crewMemberId === crewMember.id &&
        assignment.startTime >= dayStart &&
        assignment.startTime <= dayEnd
      );
      
      // If no assignments, give them an off day
      if (dayAssignments.length === 0) {
        assignments.push({
          crewMemberId: crewMember.id,
          eventType: 'off',
          startTime: new Date(dayStart),
          endTime: new Date(dayEnd)
        });
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
