
import { useState } from 'react';
import FlightAssignment from './FlightAssignment';
import ContextMenuWrapper from './ContextMenu';
import AddFlightDialog from './AddFlightDialog';
import { useToast } from '@/hooks/use-toast';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  assignments: Array<{
    id: string;
    flightNumber: string;
    route: string;
    startTime: string;
    duration: number;
    type: 'domestic' | 'international' | 'charter';
    timeSlotIndex: number; // which time slot this assignment starts at
  }>;
}

const CrewRoster = () => {
  const { toast } = useToast();

  // Sample crew data with state management
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Captain',
      assignments: [
        {
          id: '1-1',
          flightNumber: 'AA1234',
          route: 'LAX-JFK',
          startTime: '06:00',
          duration: 6,
          type: 'domestic',
          timeSlotIndex: 1
        },
        {
          id: '1-2',
          flightNumber: 'AA5678',
          route: 'JFK-LAX',
          startTime: '18:00',
          duration: 6,
          type: 'domestic',
          timeSlotIndex: 4
        }
      ]
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'First Officer',
      assignments: [
        {
          id: '2-1',
          flightNumber: 'AA9012',
          route: 'LAX-LHR',
          startTime: '22:00',
          duration: 11,
          type: 'international',
          timeSlotIndex: 5
        }
      ]
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Flight Attendant',
      assignments: [
        {
          id: '3-1',
          flightNumber: 'AA3456',
          route: 'LAX-DEN',
          startTime: '10:00',
          duration: 3,
          type: 'domestic',
          timeSlotIndex: 2
        },
        {
          id: '3-2',
          flightNumber: 'CH789',
          route: 'DEN-LAS',
          startTime: '16:00',
          duration: 2,
          type: 'charter',
          timeSlotIndex: 4
        }
      ]
    },
    {
      id: '4',
      name: 'David Wilson',
      role: 'Flight Attendant',
      assignments: [
        {
          id: '4-1',
          flightNumber: 'AA7890',
          route: 'LAX-ORD',
          startTime: '14:00',
          duration: 4,
          type: 'domestic',
          timeSlotIndex: 3
        }
      ]
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      role: 'Captain',
      assignments: []
    }
  ]);

  const [selectedCrewMember, setSelectedCrewMember] = useState<string | null>(null);

  // Generate 42 time slots (7 days * 6 slots per day)
  const totalTimeSlots = 42;

  const handleContextMenuAction = (action: string, memberName: string) => {
    toast({
      title: `${action} Added`,
      description: `${action} has been added for ${memberName}`,
    });
  };

  const handleAddFlight = (crewMemberId: string, flightData: {
    flightNumber: string;
    route: string;
    startTime: string;
    duration: number;
    type: 'domestic' | 'international' | 'charter';
    timeSlotIndex: number;
  }) => {
    setCrewMembers(prev => prev.map(member => 
      member.id === crewMemberId 
        ? {
            ...member,
            assignments: [...member.assignments, {
              id: `${crewMemberId}-${Date.now()}`,
              ...flightData
            }]
          }
        : member
    ));
    
    toast({
      title: 'Flight Added',
      description: `${flightData.flightNumber} has been added to the roster`,
    });
  };

  const handleRemoveFlight = (crewMemberId: string, assignmentId: string) => {
    setCrewMembers(prev => prev.map(member => 
      member.id === crewMemberId 
        ? {
            ...member,
            assignments: member.assignments.filter(assignment => assignment.id !== assignmentId)
          }
        : member
    ));
    
    toast({
      title: 'Flight Removed',
      description: 'Flight has been removed from the roster',
    });
  };

  return (
    <div className="bg-white">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium">Crew Assignments</h3>
        {selectedCrewMember && (
          <AddFlightDialog
            onAddFlight={(flightData) => handleAddFlight(selectedCrewMember, flightData)}
          />
        )}
      </div>
      
      {crewMembers.map((member) => (
        <ContextMenuWrapper
          key={member.id}
          onAddOff={() => handleContextMenuAction('OFF', member.name)}
          onAddRQF={() => handleContextMenuAction('RQF', member.name)}
          onAddEditNote={() => handleContextMenuAction('Note', member.name)}
          onAddOfficeDuty={() => handleContextMenuAction('Office Duty', member.name)}
          onAddStandby={() => handleContextMenuAction('Standby', member.name)}
          onLeaves={() => handleContextMenuAction('Leave', member.name)}
        >
          <div 
            className="flex border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelectedCrewMember(member.id)}
          >
            <div className="w-48 p-4 border-r border-gray-200">
              <div className="font-medium text-gray-900">{member.name}</div>
              <div className="text-sm text-gray-500">{member.role}</div>
              {selectedCrewMember === member.id && (
                <div className="mt-2">
                  <AddFlightDialog
                    onAddFlight={(flightData) => handleAddFlight(member.id, flightData)}
                  />
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <div className="flex min-w-max">
                {/* Create grid of time slots */}
                {Array.from({ length: totalTimeSlots }, (_, index) => (
                  <div key={index} className="w-32 h-16 border-r border-gray-100 relative">
                    {/* Render assignments that start at this time slot */}
                    {member.assignments
                      .filter(assignment => assignment.timeSlotIndex === index)
                      .map((assignment) => (
                        <div
                          key={assignment.id}
                          className="absolute top-2 left-1"
                          style={{ zIndex: 1 }}
                        >
                          <FlightAssignment
                            flightNumber={assignment.flightNumber}
                            route={assignment.route}
                            startTime={assignment.startTime}
                            duration={assignment.duration}
                            type={assignment.type}
                            onRemove={() => handleRemoveFlight(member.id, assignment.id)}
                          />
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ContextMenuWrapper>
      ))}
    </div>
  );
};

export default CrewRoster;
