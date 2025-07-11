
const RosterHeader = () => {
  // Generate timeline for next 7 days starting from today
  const generateTimeline = () => {
    const timeline = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Create time slots for each day (every 4 hours)
      for (let hour = 0; hour < 24; hour += 4) {
        const timeSlot = new Date(date);
        timeSlot.setHours(hour, 0, 0, 0);
        
        timeline.push({
          id: `${date.toDateString()}-${hour}`,
          time: timeSlot.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    
    return timeline;
  };

  const timeline = generateTimeline();

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex">
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Flight Crew</h2>
        </div>
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-max">
            {timeline.map((slot) => (
              <div key={slot.id} className="w-32 p-2 border-r border-gray-100 text-center">
                <div className="text-xs font-medium text-gray-600">{slot.date}</div>
                <div className="text-sm text-gray-900">{slot.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RosterHeader;
