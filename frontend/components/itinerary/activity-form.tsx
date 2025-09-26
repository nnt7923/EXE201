'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from 'react';

// Define types matching the backend schema
export interface Activity {
  _id?: string; // Optional for new activities
  startTime: string;
  endTime?: string;
  activityType: 'EAT' | 'VISIT' | 'ENTERTAINMENT' | 'TRAVEL' | 'OTHER';
  customPlace: string;
  notes?: string;
}

interface ActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void;
  initialData?: Activity | null;
}

export function ActivityForm({ isOpen, onClose, onSave, initialData }: ActivityFormProps) {
  const [activity, setActivity] = useState<Activity>({
    startTime: '',
    activityType: 'VISIT',
    customPlace: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setActivity(initialData);
    } else {
      // Reset form for new activity
      setActivity({
        startTime: '',
        activityType: 'VISIT',
        customPlace: '',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (field: keyof Activity, value: string) => {
    setActivity(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Basic validation
    if (!activity.startTime || !activity.customPlace || !activity.activityType) {
        alert('Please fill in all required fields.');
        return;
    }
    onSave(activity);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
          <DialogDescription>
            Fill in the details for your activity. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">Start Time</Label>
            <Input id="startTime" type="time" value={activity.startTime} onChange={e => handleChange('startTime', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">End Time</Label>
            <Input id="endTime" type="time" value={activity.endTime || ''} onChange={e => handleChange('endTime', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activityType" className="text-right">Type</Label>
            <Select value={activity.activityType} onValueChange={(value: Activity['activityType']) => handleChange('activityType', value)}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an activity type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="VISIT">Visit</SelectItem>
                    <SelectItem value="EAT">Eat</SelectItem>
                    <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                    <SelectItem value="TRAVEL">Travel</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customPlace" className="text-right">Place</Label>
            <Input id="customPlace" value={activity.customPlace} onChange={e => handleChange('customPlace', e.target.value)} className="col-span-3" placeholder="Name of the place" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">Notes</Label>
            <Textarea id="notes" value={activity.notes || ''} onChange={e => handleChange('notes', e.target.value)} className="col-span-3" placeholder="Any extra details..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Activity</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
