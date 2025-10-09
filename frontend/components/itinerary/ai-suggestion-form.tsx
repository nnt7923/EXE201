'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle } from "lucide-react";

// Add interfaces for User and Plan
interface SubscriptionPlan {
  _id: string;
  name: string;
  aiSuggestionLimit: number;
}

interface User {
  subscriptionPlan?: SubscriptionPlan;
  aiSuggestionsUsed?: number;
  subscriptionEndDate?: string;
}

export interface AiPrompt {
    location: string;
    budget: 'LOW' | 'MEDIUM' | 'HIGH';
    interests: string[];
    duration: number;
}

interface AiSuggestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: AiPrompt) => void;
  isGenerating: boolean;
  user: User | null; // Pass user object as a prop
}

const allInterests = ['Food', 'History', 'Art', 'Nightlife', 'Nature', 'Shopping'];

// Helper component for subscription notices
function SubscriptionNotice({ message, showUpgradeLink = true }: { message: string; showUpgradeLink?: boolean }) {
  return (
    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">Subscription Notice</h3>
          <div className="mt-2 text-sm">
            <p>{message}</p>
            {showUpgradeLink && (
              <Link href="/pricing" className="font-medium text-yellow-900 hover:underline mt-2 inline-block">
                View Plans & Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AiSuggestionForm({ isOpen, onClose, onSubmit, isGenerating, user }: AiSuggestionFormProps) {
  const [prompt, setPrompt] = useState<AiPrompt>({
    location: '',
    budget: 'MEDIUM',
    interests: ['Food'],
    duration: 1
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

  // Subscription checks
  const plan = user?.subscriptionPlan;
  const usage = user?.aiSuggestionsUsed ?? 0;
  const limit = plan?.aiSuggestionLimit ?? 0;
  const isExpired = user?.subscriptionEndDate && new Date() > new Date(user.subscriptionEndDate);

  let notice: React.ReactNode = null;
  let isDisabled = false;

  if (!plan) {
    notice = <SubscriptionNotice message="You need an active subscription to generate AI itineraries." />;
    isDisabled = true;
  } else if (isExpired) {
    notice = <SubscriptionNotice message="Your subscription has expired. Please renew to continue using this feature." />;
    isDisabled = true;
  } else if (limit !== -1 && usage >= limit) {
    notice = <SubscriptionNotice message={`You have used ${usage}/${limit} of your monthly AI suggestions.`} />;
    isDisabled = true;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Get AI Suggestions</DialogTitle>
          <DialogDescription>
            Tell us about your trip, and our AI will generate a personalized itinerary for you.
          </DialogDescription>
        </DialogHeader>
        
        {notice}

        <div className={`grid gap-6 py-4 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
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
              <Label htmlFor="duration">Duration (in days)</Label>
              <Input id="duration" type="number" min={1} value={prompt.duration} onChange={e => setPrompt({...prompt, duration: parseInt(e.target.value, 10)})} placeholder="e.g., 3" />
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
          <Button onClick={handleSubmit} disabled={isGenerating || isDisabled}>
            {isGenerating ? 'Generating...' : 'Generate Itinerary'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
