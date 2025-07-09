
import FlightAssignment from './FlightAssignment';
import ContextMenuWrapper from './ContextMenu';
import { useToast } from '@/hooks/use-toast';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  assignments: Array<{
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

  // Sample crew data
  const crewMembers: CrewMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Captain',
      assignments: [
        {
          flightNumber: 'AA1234',
          route: 'LAX-JFK',
          startTime: '06:00',
          duration: 6,
          type: 'domestic',
          timeSlotIndex: 1
        },
        {
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
          flightNumber: 'AA3456',
          route: 'LAX-DEN',
          startTime: '10:00',
          duration: 3,
          type: 'domestic',
          timeSlotIndex: 2
        },
        {
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
  ];

  // Generate 42 time slots (7 days * 6 slots per day)
  const totalTimeSlots = 42;

  const handleContextMenuAction = (action: string, memberName: string) => {
    toast({
      title: `${action} Added`,
      description: `${action} has been added for ${memberName}`,
    });
  };

  return (
    <div className="bg-white">
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
          <div className="flex border-b border-gray-100 hover:bg-gray-50">
            <div className="w-48 p-4 border-r border-gray-200">
              <div className="font-medium text-gray-900">{member.name}</div>
              <div className="text-sm text-gray-500">{member.role}</div>
            </div>
            <div className="flex-1 relative">
              <div className="flex min-w-max">
                {/* Create grid of time slots */}
                {Array.from({ length: totalTimeSlots }, (_, index) => (
                  <div key={index} className="w-32 h-16 border-r border-gray-100 relative">
                    {/* Render assignments that start at this time slot */}
                    {member.assignments
                      .filter(assignment => assignment.timeSlotIndex === index)
                      .map((assignment, assignmentIndex) => (
                        <div
                          key={assignmentIndex}
                          className="absolute top-2 left-1"
                          style={{ zIndex: 1 }}
                        >
                          <FlightAssignment
                            flightNumber={assignment.flightNumber}
                            route={assignment.route}
                            startTime={assignment.startTime}
                            duration={assignment.duration}
                            type={assignment.type}
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
