import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import FlightAssignment from './FlightAssignment';
import ContextMenuWrapper from './ContextMenu';
import AddFlightDialog from './AddFlightDialog';
import AddCrewEventDialog from './AddCrewEventDialog';
import { useToast } from '@/hooks/use-toast';
import { crewService, CrewMember, FlightAssignment as FlightAssignmentType, CrewEvent } from '../services/crewService';
import { generateTimeSlots, getTimeSlotIndex, getDurationInSlots } from '../utils/timeSlotUtils';

const CrewRoster = () => {
  const { toast } = useToast();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [flightAssignments, setFlightAssignments] = useState<FlightAssignmentType[]>([]);
  const [crewEvents, setCrewEvents] = useState<CrewEvent[]>([]);
  const [selectedCrewMember, setSelectedCrewMember] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate the same timeline as the header
  const timeline = generateTimeSlots();
  const totalTimeSlots = timeline.length;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Starting to load data...');
      setLoading(true);
      setError(null);

      const [crews, flights, events] = await Promise.all([
        crewService.getCrewMembers(),
        crewService.getFlightAssignments(),
        crewService.getCrewEvents(),
      ]);
      
      console.log('Data loaded successfully:', { crews: crews.length, flights: flights.length, events: events.length });
      
      // If no crew members exist, add sample data
      if (crews.length === 0) {
        console.log('No crew members found, initializing sample data...');
        await initializeSampleData();
        return loadData(); // Reload after initialization
      }
      
      setCrewMembers(crews);
      setFlightAssignments(flights);
      setCrewEvents(events);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load crew data. Please check your connection and try again.');
      toast({
        title: 'Error',
        description: 'Failed to load crew data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeSampleData = async () => {
    try {
      console.log('Initializing sample data...');
      const sampleCrews = [
        { name: 'Sarah Johnson', role: 'Captain' as const, totalFlightHours: 5000, totalDutyHours: 8000, restHours: 12, certifications: ['A320', 'A330'] },
        { name: 'Michael Chen', role: 'First Officer' as const, totalFlightHours: 3000, totalDutyHours: 5000, restHours: 10, certifications: ['A320'] },
        { name: 'Emily Rodriguez', role: 'Flight Attendant' as const, totalFlightHours: 2000, totalDutyHours: 4000, restHours: 8, certifications: ['Safety', 'Service'] },
        { name: 'David Wilson', role: 'Flight Attendant' as const, totalFlightHours: 1500, totalDutyHours: 3000, restHours: 8, certifications: ['Safety'] },
        { name: 'Lisa Thompson', role: 'Captain' as const, totalFlightHours: 6000, totalDutyHours: 10000, restHours: 12, certifications: ['A320', 'A330', 'B777'] }
      ];

      for (const crew of sampleCrews) {
        await crewService.addCrewMember(crew);
      }
      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  };

  const handleAddFlight = async (crewMemberId: string, flightData: {
    flightNumber: string;
    route: string;
    startTime: string;
    duration: number;
    type: 'domestic' | 'international' | 'charter';
    timeSlotIndex: number;
  }) => {
    try {
      // Use the timeline to calculate the actual date/time
      const timeSlot = timeline[flightData.timeSlotIndex];
      if (!timeSlot) {
        throw new Error('Invalid time slot index');
      }

      const startTime = new Date(timeSlot.dateTime);
      const [hours, minutes] = flightData.startTime.split(':').map(Number);
      startTime.setHours(startTime.getHours() + hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + flightData.duration);

      const newFlight: Omit<FlightAssignmentType, 'id' | 'createdAt'> = {
        crewMemberId,
        flightNumber: flightData.flightNumber,
        route: flightData.route,
        startTime,
        endTime,
        duration: flightData.duration,
        type: flightData.type,
        status: 'scheduled',
      };

      await crewService.addFlightAssignment(newFlight);
      await loadData(); // Reload to get updated data
      
      toast({
        title: 'Flight Added',
        description: `${flightData.flightNumber} has been added to the roster`,
      });
    } catch (error) {
      console.error('Error adding flight:', error);
      toast({
        title: 'Error',
        description: 'Failed to add flight',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveFlight = async (flightId: string) => {
    try {
      await crewService.deleteFlightAssignment(flightId);
      await loadData(); // Reload to get updated data
      
      toast({
        title: 'Flight Removed',
        description: 'Flight has been removed from the roster',
      });
    } catch (error) {
      console.error('Error removing flight:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove flight',
        variant: 'destructive',
      });
    }
  };

  const handleAddCrewEvent = async (crewMemberId: string, eventData: {
    type: 'OFF' | 'RQF' | 'Office Duty' | 'Standby' | 'Leave';
    startTime: Date;
    endTime: Date;
    notes?: string;
  }) => {
    try {
      const newEvent: Omit<CrewEvent, 'id' | 'createdAt'> = {
        crewMemberId,
        type: eventData.type,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        notes: eventData.notes,
      };

      await crewService.addCrewEvent(newEvent);
      await loadData(); // Reload to get updated data
      
      toast({
        title: `${eventData.type} Added`,
        description: `${eventData.type} has been added to the roster`,
      });
    } catch (error) {
      console.error('Error adding crew event:', error);
      toast({
        title: 'Error',
        description: 'Failed to add crew event',
        variant: 'destructive',
      });
    }
  };

  const getCrewAssignments = (crewMemberId: string) => {
    const flights = flightAssignments.filter(f => f.crewMemberId === crewMemberId);
    const events = crewEvents.filter(e => e.crewMemberId === crewMemberId);
    
    return [...flights, ...events].map(item => {
      if ('flightNumber' in item) {
        // It's a flight
        const timeSlotIndex = getTimeSlotIndex(item.startTime);
        const durationInSlots = getDurationInSlots(item.startTime, item.endTime);
        
        return {
          id: item.id,
          type: 'flight' as const,
          flightNumber: item.flightNumber,
          route: item.route,
          startTime: item.startTime,
          duration: item.duration,
          flightType: item.type,
          timeSlotIndex,
          durationInSlots,
        };
      } else {
        // It's a crew event
        const timeSlotIndex = getTimeSlotIndex(item.startTime);
        const durationInSlots = getDurationInSlots(item.startTime, item.endTime);
        
        return {
          id: item.id,
          type: 'event' as const,
          eventType: item.type,
          startTime: item.startTime,
          endTime: item.endTime,
          notes: item.notes,
          timeSlotIndex,
          durationInSlots,
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-8 text-center">
        <div className="text-lg mb-4">Loading crew data...</div>
        <div className="text-sm text-gray-500">
          Connecting to database and fetching crew information...
        </div>
        <button 
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 text-center">
        <div className="text-lg text-red-600 mb-4">Error Loading Data</div>
        <div className="text-sm text-gray-500 mb-4">{error}</div>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium">Crew Assignments ({crewMembers.length} members)</h3>
        {selectedCrewMember && (
          <AddFlightDialog
            onAddFlight={(flightData) => handleAddFlight(selectedCrewMember, flightData)}
          />
        )}
      </div>
      
      {crewMembers.map((member) => (
        <ContextMenuWrapper
          key={member.id}
          onAddOff={() => {}}
          onAddRQF={() => {}}
          onAddEditNote={() => {}}
          onAddOfficeDuty={() => {}}
          onAddStandby={() => {}}
          onLeaves={() => {}}
        >
          <div 
            className="flex border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelectedCrewMember(member.id)}
          >
            <div className="w-64 p-4 border-r border-gray-200 flex-shrink-0">
              <div className="font-medium text-gray-900">{member.name}</div>
              <div className="text-sm text-gray-500">{member.role}</div>
              <div className="text-xs text-gray-400 mt-1">
                Flight Hours: {member.totalFlightHours} | Duty Hours: {member.totalDutyHours}
              </div>
              {selectedCrewMember === member.id && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <AddFlightDialog
                    onAddFlight={(flightData) => handleAddFlight(member.id, flightData)}
                  />
                  <AddCrewEventDialog
                    crewMemberId={member.id}
                    crewMemberName={member.name}
                    eventType="OFF"
                    onAddEvent={(eventData) => handleAddCrewEvent(member.id, eventData)}
                  >
                    <Button variant="outline" size="sm">OFF</Button>
                  </AddCrewEventDialog>
                  <AddCrewEventDialog
                    crewMemberId={member.id}
                    crewMemberName={member.name}
                    eventType="RQF"
                    onAddEvent={(eventData) => handleAddCrewEvent(member.id, eventData)}
                  >
                    <Button variant="outline" size="sm">RQF</Button>
                  </AddCrewEventDialog>
                  <AddCrewEventDialog
                    crewMemberId={member.id}
                    crewMemberName={member.name}
                    eventType="Office Duty"
                    onAddEvent={(eventData) => handleAddCrewEvent(member.id, eventData)}
                  >
                    <Button variant="outline" size="sm">Office</Button>
                  </AddCrewEventDialog>
                </div>
              )}
            </div>
            <div className="flex">
              {timeline.map((slot, index) => {
                const assignments = getCrewAssignments(member.id)
                  .filter(assignment => assignment.timeSlotIndex === index);
                
                return (
                  <div key={slot.id} className="w-32 h-16 border-r border-gray-100 relative flex-shrink-0">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="absolute top-2 left-1"
                        style={{ 
                          zIndex: 1,
                          width: `${Math.min(assignment.durationInSlots * 128 - 8, (totalTimeSlots - index) * 128 - 8)}px`
                        }}
                      >
                        {assignment.type === 'flight' ? (
                          <FlightAssignment
                            flightNumber={assignment.flightNumber!}
                            route={assignment.route!}
                            startTime={assignment.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            duration={assignment.duration!}
                            type={assignment.flightType!}
                            onRemove={() => handleRemoveFlight(assignment.id)}
                          />
                        ) : (
                          <div 
                            className="bg-gray-500 text-white rounded-md p-2 text-xs font-medium shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
                            title={`${assignment.eventType} - ${assignment.notes || ''}`}
                          >
                            <div className="font-semibold">{assignment.eventType}</div>
                            <div className="text-xs opacity-75">
                              {assignment.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </ContextMenuWrapper>
      ))}
    </div>
  );
};

export default CrewRoster;
