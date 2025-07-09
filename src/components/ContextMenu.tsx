
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { 
  Clock, 
  Calendar, 
  Edit3, 
  Building, 
  UserMinus, 
  Plane 
} from 'lucide-react';

interface ContextMenuWrapperProps {
  children: React.ReactNode;
  onAddOff: () => void;
  onAddRQF: () => void;
  onAddEditNote: () => void;
  onAddOfficeDuty: () => void;
  onAddStandby: () => void;
  onLeaves: () => void;
}

const ContextMenuWrapper = ({
  children,
  onAddOff,
  onAddRQF,
  onAddEditNote,
  onAddOfficeDuty,
  onAddStandby,
  onLeaves,
}: ContextMenuWrapperProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onAddOff} className="cursor-pointer">
          <Clock className="mr-2 h-4 w-4 text-blue-500" />
          Add OFF
        </ContextMenuItem>
        <ContextMenuItem onClick={onAddRQF} className="cursor-pointer">
          <Calendar className="mr-2 h-4 w-4" />
          Add RQF
        </ContextMenuItem>
        <ContextMenuItem onClick={onAddEditNote} className="cursor-pointer">
          <Edit3 className="mr-2 h-4 w-4" />
          Add/Edit Note
        </ContextMenuItem>
        <ContextMenuItem onClick={onAddOfficeDuty} className="cursor-pointer">
          <Building className="mr-2 h-4 w-4" />
          Add Office Duty
        </ContextMenuItem>
        <ContextMenuItem onClick={onAddStandby} className="cursor-pointer">
          <UserMinus className="mr-2 h-4 w-4" />
          Add Standby
        </ContextMenuItem>
        <ContextMenuItem onClick={onLeaves} className="cursor-pointer">
          <Plane className="mr-2 h-4 w-4" />
          Leaves
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ContextMenuWrapper;
