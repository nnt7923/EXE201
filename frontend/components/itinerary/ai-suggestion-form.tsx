'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';

export interface AiPrompt {
    location: string;
    budget: 'LOW' | 'MEDIUM' | 'HIGH';
    interests: string[];
}

interface AiSuggestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: AiPrompt) => void;
  isGenerating: boolean;
}

const allInterests = ['Food', 'History', 'Art', 'Nightlife', 'Nature', 'Shopping'];

export function AiSuggestionForm({ isOpen, onClose, onSubmit, isGenerating }: AiSuggestionFormProps) {
  const [prompt, setPrompt] = useState<AiPrompt>({
    location: '',
    budget: 'MEDIUM',
    interests: ['Food']
  });

  const handleInterestToggle = (interest: string) => {
    setPrompt(prev => {
        const newInterests = prev.interests.includes(interest)
            ? prev.interests.filter(i => i !== interest)
            : [...prev.interests, interest];
        return { ...prev, interests: newInterests };
    });
  };

  const handleSubmit = () => {
    if (!prompt.location) {
        alert('Please enter a location.');
        return;
    }
    onSubmit(prompt);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Get AI Suggestions</DialogTitle>
          <DialogDescription>
            Tell us about your trip, and our AI will generate a personalized itinerary for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="location">Where are you going?</Label>
              <Input id="location" value={prompt.location} onChange={e => setPrompt({...prompt, location: e.target.value})} placeholder="e.g., Hanoi Old Quarter" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Select value={prompt.budget} onValueChange={(value: AiPrompt['budget']) => setPrompt({...prompt, budget: value})}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select your budget" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="LOW">Low (Economical)</SelectItem>
                        <SelectItem value="MEDIUM">Medium (Standard)</SelectItem>
                        <SelectItem value="HIGH">High (Luxury)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2">
                    {allInterests.map(interest => (
                        <Button 
                            key={interest} 
                            variant={prompt.interests.includes(interest) ? 'default' : 'outline'}
                            onClick={() => handleInterestToggle(interest)}
                            size="sm"
                        >
                            {interest}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Itinerary'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
