'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { Wand2, Home } from 'lucide-react';
import { AiSuggestionForm, AiPrompt } from '@/components/itinerary/ai-suggestion-form';
import Link from 'next/link';

// Define User type to match the one in ai-suggestion-form
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

export default function CreateItineraryPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAiFormOpen, setIsAiFormOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.getCurrentUser();
        if (response.success) {
          setUser(response.data);
        } else {
          // Handle case where user is not logged in or token is invalid
          setError('Please log in to use this feature.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch user data.');
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!title || !date) {
      setError('Tên lịch trình và ngày là bắt buộc.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const newItinerary = await api.createItinerary({ title, date, description, activities: [] });
      const itineraryId = (newItinerary as any)._id;
      router.push(`/itineraries/${itineraryId}`);
    } catch (err) {
      setError('Không thể tạo lịch trình. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiSubmit = async (prompt: AiPrompt) => {
    if (!user) {
      setError('User data not loaded. Please wait and try again.');
      return;
    }
    if (!date) {
        alert("Please select a date for the itinerary first.");
        return;
    }
    setIsGenerating(true);
    setError(null);
    try {
        const response = await api.getAiSuggestion(prompt);

        if (!response.success) {
          throw new Error(response.message || 'Failed to get AI suggestion.');
        }
        
        const suggestion = response.data;
        
        // Create a new itinerary with the AI suggestions
        const newItineraryResponse = await api.createItinerary({
            title: suggestion.title || `Trip to ${prompt.location}`,
            date: date,
            description: `An AI-generated itinerary for a trip to ${prompt.location} with a ${prompt.budget} budget, focusing on ${prompt.interests.join(', ')}.`,
            activities: suggestion.activities
        });

        const itineraryId = (newItineraryResponse as any)._id;
        setIsAiFormOpen(false);
        router.push(`/itineraries/${itineraryId}`); // Redirect to the new itinerary

    } catch (err: any) {
        setError(err.message || 'Không thể tạo gợi ý từ AI. Vui lòng thử lại.');
        console.error(err);
    } finally {
        setIsGenerating(false);
    }
  }

  return (
    <>
      <AiSuggestionForm 
        isOpen={isAiFormOpen}
        onClose={() => setIsAiFormOpen(false)}
        onSubmit={handleAiSubmit}
        isGenerating={isGenerating}
        user={user}
      />
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <div className="mb-4">
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Quay về trang chủ
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tạo lịch trình mới</CardTitle>
            <CardDescription>
              Lên kế hoạch cho chuyến đi sắp tới. Bạn có thể bắt đầu thủ công hoặc nhận gợi ý từ AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tên lịch trình</Label>
                <Input
                  id="title"
                  placeholder='VD: Cuối tuần tại Hà Nội'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Ngày</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả (Không bắt buộc)</Label>
                <Textarea
                  id="description"
                  placeholder='VD: Chuyến đi tập trung khám phá ẩm thực địa phương.'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button onClick={handleSave} disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? 'Đang lưu...' : 'Lưu và Tiếp tục'}
                  </Button>
                  <Button onClick={() => setIsAiFormOpen(true)} variant="outline" className="w-full sm:w-auto">
                      <Wand2 className="mr-2 h-4 w-4" />
                      Nhận gợi ý từ AI
                  </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
