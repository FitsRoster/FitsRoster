
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
    try {
      console.log('Fetching crew members...');
      const crewCollection = collection(db, 'crewMembers');
      const crewSnapshot = await getDocs(query(crewCollection, orderBy('name')));
      console.log('Crew members fetched:', crewSnapshot.size);
      return crewSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as CrewMember[];
    } catch (error) {
      console.error('Error fetching crew members:', error);
      return [];
    }
  }

  async addCrewMember(crewMember: Omit<CrewMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('Adding crew member:', crewMember.name);
      const crewCollection = collection(db, 'crewMembers');
      const docRef = await addDoc(crewCollection, {
        ...crewMember,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log('Crew member added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding crew member:', error);
      throw error;
    }
  }

  async updateCrewMember(id: string, updates: Partial<CrewMember>): Promise<void> {
    try {
      const crewDoc = doc(db, 'crewMembers', id);
      await updateDoc(crewDoc, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating crew member:', error);
      throw error;
    }
  }

  // Flight Assignments
  async getFlightAssignments(crewMemberId?: string): Promise<FlightAssignment[]> {
    try {
      console.log('Fetching flight assignments...');
      const flightsCollection = collection(db, 'flightAssignments');
      let flightQuery = query(flightsCollection, orderBy('startTime'));
      
      if (crewMemberId) {
        flightQuery = query(flightsCollection, where('crewMemberId', '==', crewMemberId), orderBy('startTime'));
      }
      
      const flightSnapshot = await getDocs(flightQuery);
      console.log('Flight assignments fetched:', flightSnapshot.size);
      return flightSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FlightAssignment[];
    } catch (error) {
      console.error('Error fetching flight assignments:', error);
      return [];
    }
  }

  async addFlightAssignment(flight: Omit<FlightAssignment, 'id' | 'createdAt'>): Promise<string> {
    try {
      console.log('Adding flight assignment:', flight.flightNumber);
      const flightsCollection = collection(db, 'flightAssignments');
      const docRef = await addDoc(flightsCollection, {
        ...flight,
        startTime: Timestamp.fromDate(flight.startTime),
        endTime: Timestamp.fromDate(flight.endTime),
        createdAt: Timestamp.now(),
      });
      console.log('Flight assignment added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding flight assignment:', error);
      throw error;
    }
  }

  async deleteFlightAssignment(id: string): Promise<void> {
    try {
      const flightDoc = doc(db, 'flightAssignments', id);
      await deleteDoc(flightDoc);
      console.log('Flight assignment deleted:', id);
    } catch (error) {
      console.error('Error deleting flight assignment:', error);
      throw error;
    }
  }

  // Crew Events
  async getCrewEvents(crewMemberId?: string): Promise<CrewEvent[]> {
    try {
      console.log('Fetching crew events...');
      const eventsCollection = collection(db, 'crewEvents');
      let eventQuery = query(eventsCollection, orderBy('startTime'));
      
      if (crewMemberId) {
        eventQuery = query(eventsCollection, where('crewMemberId', '==', crewMemberId), orderBy('startTime'));
      }
      
      const eventSnapshot = await getDocs(eventQuery);
      console.log('Crew events fetched:', eventSnapshot.size);
      return eventSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as CrewEvent[];
    } catch (error) {
      console.error('Error fetching crew events:', error);
      return [];
    }
  }

  async addCrewEvent(event: Omit<CrewEvent, 'id' | 'createdAt'>): Promise<string> {
    try {
      console.log('Adding crew event:', event.type);
      const eventsCollection = collection(db, 'crewEvents');
      const docRef = await addDoc(eventsCollection, {
        ...event,
        startTime: Timestamp.fromDate(event.startTime),
        endTime: Timestamp.fromDate(event.endTime),
        createdAt: Timestamp.now(),
      });
      console.log('Crew event added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding crew event:', error);
      throw error;
    }
  }

  async deleteCrewEvent(id: string): Promise<void> {
    try {
      const eventDoc = doc(db, 'crewEvents', id);
      await deleteDoc(eventDoc);
      console.log('Crew event deleted:', id);
    } catch (error) {
      console.error('Error deleting crew event:', error);
      throw error;
    }
  }
}

export const crewService = new CrewService();
