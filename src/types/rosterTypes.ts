
export interface CrewRequirement {
  captains: number;
  firstOfficers: number;
  cabinCrew: number;
  seniorCabinCrew: number;
}

export interface FlightScheduleData {
  flightNumber: string;
  sector: string;
  departure: string;
  arrival: string;
  frequency: string;
  crewRequirement: CrewRequirement;
  duration: number; // in hours
}

export interface RosterRule {
  id: string;
  type: 'flight_time' | 'duty_time' | 'rest' | 'off_days' | 'fatigue';
  description: string;
  validate: (crewMember: any, assignments: any[]) => boolean;
}

export interface AutoRosterConfig {
  startDate: Date;
  endDate: Date;
  flightSchedules: FlightScheduleData[];
  rules: RosterRule[];
}

export interface RosterAssignment {
  crewMemberId: string;
  flightId?: string;
  eventType: 'flight' | 'off' | 'office_duty' | 'standby' | 'rest';
  startTime: Date;
  endTime: Date;
  flightNumber?: string;
  position?: 'Captain' | 'First Officer' | 'Cabin Crew' | 'Senior Cabin Crew';
}
