
import { generateTimeSlots } from '../utils/timeSlotUtils';

const RosterHeader = () => {
  const timeline = generateTimeSlots();

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex">
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Flight Crew</h2>
        </div>
        <div className="flex">
          {timeline.map((slot) => (
            <div key={slot.id} className="w-32 p-2 border-r border-gray-100 text-center flex-shrink-0">
              <div className="text-xs font-medium text-gray-600">{slot.date}</div>
              <div className="text-sm text-gray-900">{slot.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RosterHeader;
