
import { generateTimeSlots } from '../utils/timeSlotUtils';

const RosterHeader = () => {
  const timeline = generateTimeSlots();
  const totalTimeSlots = timeline.length;
  const SLOT_WIDTH = 64; // w-16 = 64px

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 flex">
      {/* Fixed left header section */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Flight Crew</h2>
      </div>
      
      {/* Scrollable timeline section */}
      <div className="flex-1 overflow-x-auto">
        <div 
          className="flex"
          style={{ 
            width: `${totalTimeSlots * SLOT_WIDTH}px`,
            minWidth: `${totalTimeSlots * SLOT_WIDTH}px`
          }}
        >
          {timeline.map((slot) => (
            <div key={slot.id} className="w-16 p-1 border-r border-gray-100 text-center flex-shrink-0">
              <div className="text-xs font-medium text-gray-600">{slot.date}</div>
              <div className="text-xs text-gray-900">{slot.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RosterHeader;
