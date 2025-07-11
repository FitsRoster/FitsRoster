
import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';

export interface CrewMember {
  id: string;
  name: string;
  role: 'Captain' | 'First Officer' | 'Flight Attendant';
  totalFlightHours: number;
  totalDutyHours: number;
  restHours: number;
  certifications: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FlightAssignment {
  id: string;
  crewMemberId: string;
  flightNumber: string;
  route: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  type: 'domestic' | 'international' | 'charter';
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface CrewEvent {
  id: string;
  crewMemberId: string;
  type: 'OFF' | 'RQF' | 'Office Duty' | 'Standby' | 'Leave' | 'Flight';
  startTime: Date;
  endTime: Date;
  notes?: string;
  flightAssignmentId?: string;
  createdAt: Date;
}

class CrewService {
  // Crew Members
  async getCrewMembers(): Promise<CrewMember[]> {
    const crewCollection = collection(db, 'crewMembers');
    const crewSnapshot = await getDocs(query(crewCollection, orderBy('name')));
    return crewSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as CrewMember[];
  }

  async addCrewMember(crewMember: Omit<CrewMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const crewCollection = collection(db, 'crewMembers');
    const docRef = await addDoc(crewCollection, {
      ...crewMember,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async updateCrewMember(id: string, updates: Partial<CrewMember>): Promise<void> {
    const crewDoc = doc(db, 'crewMembers', id);
    await updateDoc(crewDoc, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  // Flight Assignments
  async getFlightAssignments(crewMemberId?: string): Promise<FlightAssignment[]> {
    const flightsCollection = collection(db, 'flightAssignments');
    let flightQuery = query(flightsCollection, orderBy('startTime'));
    
    if (crewMemberId) {
      flightQuery = query(flightsCollection, where('crewMemberId', '==', crewMemberId), orderBy('startTime'));
    }
    
    const flightSnapshot = await getDocs(flightQuery);
    return flightSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime?.toDate(),
      endTime: doc.data().endTime?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as FlightAssignment[];
  }

  async addFlightAssignment(flight: Omit<FlightAssignment, 'id' | 'createdAt'>): Promise<string> {
    const flightsCollection = collection(db, 'flightAssignments');
    const docRef = await addDoc(flightsCollection, {
      ...flight,
      startTime: Timestamp.fromDate(flight.startTime),
      endTime: Timestamp.fromDate(flight.endTime),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async deleteFlightAssignment(id: string): Promise<void> {
    const flightDoc = doc(db, 'flightAssignments', id);
    await deleteDoc(flightDoc);
  }

  // Crew Events
  async getCrewEvents(crewMemberId?: string): Promise<CrewEvent[]> {
    const eventsCollection = collection(db, 'crewEvents');
    let eventQuery = query(eventsCollection, orderBy('startTime'));
    
    if (crewMemberId) {
      eventQuery = query(eventsCollection, where('crewMemberId', '==', crewMemberId), orderBy('startTime'));
    }
    
    const eventSnapshot = await getDocs(eventQuery);
    return eventSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime?.toDate(),
      endTime: doc.data().endTime?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as CrewEvent[];
  }

  async addCrewEvent(event: Omit<CrewEvent, 'id' | 'createdAt'>): Promise<string> {
    const eventsCollection = collection(db, 'crewEvents');
    const docRef = await addDoc(eventsCollection, {
      ...event,
      startTime: Timestamp.fromDate(event.startTime),
      endTime: Timestamp.fromDate(event.endTime),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async deleteCrewEvent(id: string): Promise<void> {
    const eventDoc = doc(db, 'crewEvents', id);
    await deleteDoc(eventDoc);
  }
}

export const crewService = new CrewService();
