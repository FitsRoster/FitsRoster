import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import FlightAssignment from './FlightAssignment';
import ContextMenuWrapper from './ContextMenu';
import AddFlightDialog from './AddFlightDialog';
import AddCrewEventDialog from './AddCrewEventDialog';
import { useToast } from '@/hooks/use-toast';
import { crewService, CrewMember, FlightAssignment as FlightAssignmentType, CrewEvent } from '../services/crewService';
import { generateTimeSlots, getTimeSlotPosition, getDurationInSlots } from '../utils/timeSlotUtils';

const CrewRoster = () => {
  const { toast } = useToast();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [flightAssignments, setFlightAssignments] = useState<FlightAssignmentType[]>([]);
  const [crewEvents, setCrewEvents] = useState<CrewEvent[]>([]);
  const [selectedCrewMember, setSelectedCrewMember] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeline = generateTimeSlots();
  const totalTimeSlots = timeline.length;
  const SLOT_WIDTH = 64; // Updated to match RosterHeader (w-16 = 64px)

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
    endTime: string;
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
      const [startHours, startMinutes] = flightData.startTime.split(':').map(Number);
      startTime.setHours(startTime.getHours() + startHours, startMinutes, 0, 0);
      
      const [endHours, endMinutes] = flightData.endTime.split(':').map(Number);
      const endTime = new Date(timeSlot.dateTime);
      endTime.setHours(endTime.getHours() + endHours, endMinutes, 0, 0);
      
      // Calculate duration in hours
      const durationMs = endTime.getTime() - startTime.getTime();
      const duration = durationMs / (1000 * 60 * 60);

      const newFlight: Omit<FlightAssignmentType, 'id' | 'createdAt'> = {
        crewMemberId,
        flightNumber: flightData.flightNumber,
        route: flightData.route,
        startTime,
        endTime,
        duration,
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
        notes: eventData.notes || '', // Ensure notes is never undefined
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

  const handleContextMenuAction = (crewMemberId: string, eventType: 'OFF' | 'RQF' | 'Office Duty' | 'Standby' | 'Leave') => {
    // Create a default event for the current day
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(9, 0, 0, 0); // Default start at 9 AM
    
    const endTime = new Date(now);
    endTime.setHours(17, 0, 0, 0); // Default end at 5 PM

    handleAddCrewEvent(crewMemberId, {
      type: eventType,
      startTime,
      endTime,
      notes: `${eventType} scheduled`
    });
  };

  const getCrewAssignments = (crewMemberId: string) => {
    const flights = flightAssignments.filter(f => f.crewMemberId === crewMemberId);
    const events = crewEvents.filter(e => e.crewMemberId === crewMemberId);
    
    return [...flights, ...events].map(item => {
      if ('flightNumber' in item) {
        // It's a flight
        const position = getTimeSlotPosition(item.startTime);
        const durationInHours = getDurationInSlots(item.startTime, item.endTime);
        
        return {
          id: item.id,
          type: 'flight' as const,
          flightNumber: item.flightNumber,
          route: item.route,
          startTime: item.startTime,
          endTime: item.endTime,
          duration: item.duration,
          flightType: item.type,
          position,
          durationInHours,
        };
      } else {
        // It's a crew event
        const position = getTimeSlotPosition(item.startTime);
        const durationInHours = getDurationInSlots(item.startTime, item.endTime);
        
        return {
          id: item.id,
          type: 'event' as const,
          eventType: item.type,
          startTime: item.startTime,
          endTime: item.endTime,
          notes: item.notes,
          position,
          durationInHours,
        };
      }
    });
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'OFF':
        return 'bg-red-500';
      case 'RQF':
        return 'bg-yellow-500';
      case 'Office Duty':
        return 'bg-gray-600';
      case 'Standby':
        return 'bg-orange-500';
      case 'Leave':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
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

  const exportRosterAsJSON = () => {
    const rosterData = {
      exportDate: new Date().toISOString(),
      crewMembers: crewMembers.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        totalFlightHours: member.totalFlightHours,
        totalDutyHours: member.totalDutyHours,
        certifications: member.certifications
      })),
      flightAssignments: flightAssignments.map(flight => ({
        id: flight.id,
        crewMemberId: flight.crewMemberId,
        flightNumber: flight.flightNumber,
        route: flight.route,
        startTime: flight.startTime.toISOString(),
        endTime: flight.endTime.toISOString(),
        duration: flight.duration,
        type: flight.type,
        status: flight.status
      })),
      crewEvents: crewEvents.map(event => ({
        id: event.id,
        crewMemberId: event.crewMemberId,
        type: event.type,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        notes: event.notes
      }))
    };

    const dataStr = JSON.stringify(rosterData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roster_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Roster Exported',
      description: 'Roster data saved as JSON file',
    });
  };

  const handleJSONImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        await importRosterFromJSON(jsonData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        toast({
          title: 'Import Error',
          description: 'Invalid JSON file format',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const importRosterFromJSON = async (rosterData: any) => {
    try {
      let importedFlights = 0;
      let importedEvents = 0;

      // Import flight assignments
      if (rosterData.flightAssignments) {
        for (const flight of rosterData.flightAssignments) {
          await crewService.addFlightAssignment({
            crewMemberId: flight.crewMemberId,
            flightNumber: flight.flightNumber,
            route: flight.route,
            startTime: new Date(flight.startTime),
            endTime: new Date(flight.endTime),
            duration: flight.duration,
            type: flight.type,
            status: flight.status || 'scheduled'
          });
          importedFlights++;
        }
      }

      // Import crew events
      if (rosterData.crewEvents) {
        for (const event of rosterData.crewEvents) {
          await crewService.addCrewEvent({
            crewMemberId: event.crewMemberId,
            type: event.type,
            startTime: new Date(event.startTime),
            endTime: new Date(event.endTime),
            notes: event.notes || ''
          });
          importedEvents++;
        }
      }

      await loadData(); // Reload to show imported data

      toast({
        title: 'Import Successful',
        description: `Imported ${importedFlights} flights and ${importedEvents} events`,
      });
    } catch (error) {
      console.error('Error importing roster:', error);
      toast({
        title: 'Import Error',
        description: 'Failed to import roster data',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-white flex flex-col">
      {/* Fixed header with controls */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
        <h3 className="text-lg font-medium">Crew Assignments ({crewMembers.length} members)</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportRosterAsJSON}
          >
            Export JSON
          </Button>
          <label>
            <Button variant="outline" size="sm" asChild>
              <span>Import JSON</span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleJSONImport}
              className="hidden"
            />
          </label>
          {selectedCrewMember && (
            <AddFlightDialog
              onAddFlight={(flightData) => handleAddFlight(selectedCrewMember, flightData)}
            />
          )}
        </div>
      </div>
      
      {/* Main roster content with fixed left sidebar and scrollable timeline */}
      <div className="flex flex-1">
        {/* Fixed left sidebar with crew names */}
        <div className="w-64 border-r border-gray-200 flex-shrink-0 bg-white">
          {crewMembers.map((member) => (
            <div 
              key={member.id}
              className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer h-28 flex flex-col justify-center"
              onClick={() => setSelectedCrewMember(member.id)}
            >
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
          ))}
        </div>
        
        {/* Scrollable timeline area */}
        <div className="flex-1 overflow-x-auto">
          <div 
            style={{ 
              width: `${totalTimeSlots * SLOT_WIDTH}px`,
              minWidth: `${totalTimeSlots * SLOT_WIDTH}px`
            }}
          >
            {crewMembers.map((member) => (
              <ContextMenuWrapper
                key={member.id}
                onAddOff={() => handleContextMenuAction(member.id, 'OFF')}
                onAddRQF={() => handleContextMenuAction(member.id, 'RQF')}
                onAddEditNote={() => {}} // Keep empty for now
                onAddOfficeDuty={() => handleContextMenuAction(member.id, 'Office Duty')}
                onAddStandby={() => handleContextMenuAction(member.id, 'Standby')}
                onLeaves={() => handleContextMenuAction(member.id, 'Leave')}
              >
                <div className="relative h-28 border-b border-gray-100 hover:bg-gray-50">
                  {/* Timeline grid */}
                  <div className="flex absolute inset-0">
                    {timeline.map((slot, index) => (
                      <div key={slot.id} className="w-16 h-28 border-r border-gray-100 relative flex-shrink-0">
                      </div>
                    ))}
                  </div>
                  
                  {/* Render assignments with precise positioning */}
                  {getCrewAssignments(member.id).map((assignment) => {
                    const leftOffset = assignment.position.slotIndex * SLOT_WIDTH + (assignment.position.offsetPercent / 100) * SLOT_WIDTH;
                    const width = assignment.durationInHours * SLOT_WIDTH;
                    
                    return (
                      <div
                        key={assignment.id}
                        className="absolute top-1/2 transform -translate-y-1/2"
                        style={{ 
                          left: `${leftOffset}px`,
                          width: `${Math.max(width, 64)}px`, // Minimum width matches slot width
                          zIndex: 1
                        }}
                      >
                        {assignment.type === 'flight' ? (
                          <FlightAssignment
                            flightNumber={assignment.flightNumber!}
                            route={assignment.route!}
                            startTime={assignment.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            duration={assignment.durationInHours}
                            type={assignment.flightType!}
                            onRemove={() => handleRemoveFlight(assignment.id)}
                          />
                        ) : (
                          <div 
                            className={`${getEventColor(assignment.eventType!)} text-white rounded-md p-2 text-xs font-medium shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group h-16 w-full flex flex-col justify-between`}
                            title={`${assignment.eventType} - ${assignment.notes || ''}`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Add delete functionality for events
                                crewService.deleteCrewEvent(assignment.id).then(() => {
                                  loadData();
                                  toast({
                                    title: 'Event Removed',
                                    description: `${assignment.eventType} has been removed`,
                                  });
                                }).catch((error) => {
                                  console.error('Error removing event:', error);
                                });
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                            >
                              ×
                            </button>
                            <div className="font-semibold text-xs leading-tight">{assignment.eventType}</div>
                            <div className="text-xs opacity-90 truncate leading-tight">
                              {assignment.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {assignment.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ContextMenuWrapper>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewRoster;
