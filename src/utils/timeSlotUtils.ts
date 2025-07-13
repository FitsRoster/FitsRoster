
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
    
    // Create time slots for each day (every hour: 00:00, 01:00, 02:00, etc.)
    for (let hour = 0; hour < 24; hour++) {
      const timeSlot = new Date(date);
      timeSlot.setHours(hour, 0, 0, 0);
      
      const slotIndex = i * 24 + hour;
      
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
  
  // Get the exact hour
  const hours = targetDate.getHours();
  
  return daysDiff * 24 + hours;
};

export const getDurationInSlots = (startTime: Date, endTime: Date): number => {
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  return durationHours; // Return actual duration in hours for precise positioning
};

export const getTimeSlotPosition = (startTime: Date): { slotIndex: number; offsetPercent: number } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(startTime);
  const daysDiff = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const hours = targetDate.getHours();
  const minutes = targetDate.getMinutes();
  
  const slotIndex = daysDiff * 24 + hours;
  const offsetPercent = (minutes / 60) * 100; // Percentage within the hour
  
  return { slotIndex, offsetPercent };
};
