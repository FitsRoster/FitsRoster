
import { X } from 'lucide-react';

interface FlightAssignmentProps {
  flightNumber: string;
  route: string;
  startTime: string;
  duration: number; // in hours
  type: 'domestic' | 'international' | 'charter';
  onRemove?: () => void;
}

const FlightAssignment = ({ flightNumber, route, startTime, duration, type, onRemove }: FlightAssignmentProps) => {
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
      className={`${getTypeColor()} text-white rounded-md p-2 text-xs font-medium shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group`}
      style={{ width, minWidth: '80px' }}
      title={`${flightNumber} - ${route} (${duration}h)`}
    >
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <div className="font-semibold">{flightNumber}</div>
      <div className="text-xs opacity-90">{route}</div>
      <div className="text-xs opacity-75">{startTime}</div>
    </div>
  );
};

export default FlightAssignment;
