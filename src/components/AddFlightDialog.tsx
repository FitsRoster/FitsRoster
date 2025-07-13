
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface AddFlightDialogProps {
  onAddFlight: (flight: {
    flightNumber: string;
    route: string;
    startTime: string;
    duration: number;
    type: 'domestic' | 'international' | 'charter';
    timeSlotIndex: number;
  }) => void;
}

const AddFlightDialog = ({ onAddFlight }: AddFlightDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    flightNumber: '',
    route: '',
    startTime: '',
    endTime: '',
    type: 'domestic' as 'domestic' | 'international' | 'charter',
    timeSlotIndex: 0
  });

  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 1;
    
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    let durationMinutes = endTotalMinutes - startTotalMinutes;
    
    // Handle next day scenarios
    if (durationMinutes <= 0) {
      durationMinutes += 24 * 60;
    }
    
    return durationMinutes / 60; // Convert to hours
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateDuration(formData.startTime, formData.endTime);
    
    onAddFlight({
      flightNumber: formData.flightNumber,
      route: formData.route,
      startTime: formData.startTime,
      duration,
      type: formData.type,
      timeSlotIndex: formData.timeSlotIndex
    });
    
    setOpen(false);
    setFormData({
      flightNumber: '',
      route: '',
      startTime: '',
      endTime: '',
      type: 'domestic',
      timeSlotIndex: 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Flight
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Flight</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="flightNumber">Flight Number</Label>
            <Input
              id="flightNumber"
              value={formData.flightNumber}
              onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
              placeholder="e.g., AA1234"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="route">Route</Label>
            <Input
              id="route"
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              placeholder="e.g., LAX-JFK"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Flight Type</Label>
            <Select value={formData.type} onValueChange={(value: 'domestic' | 'international' | 'charter') => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select flight type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="domestic">Domestic</SelectItem>
                <SelectItem value="international">International</SelectItem>
                <SelectItem value="charter">Charter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeSlot">Time Slot</Label>
            <Input
              id="timeSlot"
              type="number"
              min="0"
              max="167"
              value={formData.timeSlotIndex}
              onChange={(e) => setFormData({ ...formData, timeSlotIndex: parseInt(e.target.value) })}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Flight</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFlightDialog;
