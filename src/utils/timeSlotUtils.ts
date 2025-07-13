
export interface TimeSlot {
  id: string;
  time: string;
  date: string;
  dayIndex: number;
  hourIndex: number;
  slotIndex: number;
  dateTime: Date;
}

export const generateTimeSlots = (): TimeSlot[] => {
  const timeline: TimeSlot[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Create time slots for each day (every 4 hours: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00)
    for (let hour = 0; hour < 24; hour += 4) {
      const timeSlot = new Date(date);
      timeSlot.setHours(hour, 0, 0, 0);
      
      const slotIndex = i * 6 + (hour / 4);
      
      timeline.push({
        id: `${i}-${hour}`,
        time: timeSlot.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        dayIndex: i,
        hourIndex: hour,
        slotIndex,
        dateTime: new Date(timeSlot)
      });
    }
  }
  
  return timeline;
};

export const getTimeSlotIndex = (date: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(date);
  const daysDiff = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Find the closest 4-hour slot
  const hours = targetDate.getHours();
  const slotInDay = Math.floor(hours / 4); // 0-5 (6 slots per day)
  
  return daysDiff * 6 + slotInDay;
};

export const getDurationInSlots = (startTime: Date, endTime: Date): number => {
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  return Math.ceil(durationHours / 4); // Each slot is 4 hours
};
