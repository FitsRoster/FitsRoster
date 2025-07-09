
interface FlightAssignmentProps {
  flightNumber: string;
  route: string;
  startTime: string;
  duration: number; // in hours
  type: 'domestic' | 'international' | 'charter';
}

const FlightAssignment = ({ flightNumber, route, startTime, duration, type }: FlightAssignmentProps) => {
  const getTypeColor = () => {
    switch (type) {
      case 'domestic':
        return 'bg-blue-500';
      case 'international':
        return 'bg-green-500';
      case 'charter':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Calculate width based on duration (each time slot is 4 hours, so we need to scale accordingly)
  const width = `${(duration / 4) * 128}px`; // 128px is the width of each time slot

  return (
    <div 
      className={`${getTypeColor()} text-white rounded-md p-2 text-xs font-medium shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
      style={{ width, minWidth: '80px' }}
      title={`${flightNumber} - ${route} (${duration}h)`}
    >
      <div className="font-semibold">{flightNumber}</div>
      <div className="text-xs opacity-90">{route}</div>
      <div className="text-xs opacity-75">{startTime}</div>
    </div>
  );
};

export default FlightAssignment;
