'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from '@/lib/api';
import { Wand2, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// --- Merged Types and Interfaces from ai-suggestion-form.tsx ---
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

const allInterests = ['Ẩm thực', 'Lịch sử', 'Nghệ thuật', 'Về đêm', 'Thiên nhiên', 'Mua sắm'];

// --- Main Page Component ---
export default function CreateItineraryPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [prompt, setPrompt] = useState<AiPrompt>({
    location: 'Hòa Lạc', // Default location
    budget: 'MEDIUM',
    interests: ['Ẩm thực'],
    duration: 1
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          setError(response.message || 'Vui lòng đăng nhập để sử dụng tính năng này.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Không thể tải dữ liệu người dùng.');
      }
    };
    fetchUser();
  }, []);

  const handleInterestToggle = (interest: string) => {
    setPrompt(prev => {
        const newInterests = prev.interests.includes(interest)
            ? prev.interests.filter(i => i !== interest)
            : [...prev.interests, interest];
        return { ...prev, interests: newInterests };
    });
  };

  const handleAiSubmit = async () => {
    if (!user) {
      setError('Chưa tải được dữ liệu người dùng. Vui lòng chờ và thử lại.');
      return;
    }
    if (!date) {
        alert("Vui lòng chọn ngày cho lịch trình.");
        return;
    }
    if (!prompt.location) {
        alert('Vui lòng nhập địa điểm.');
        return;
    }

    setIsGenerating(true);
    setError(null);

    try {
        const response = await api.getAiSuggestion(prompt);

        if (!response.success) {
          throw new Error(response.message || 'Không thể lấy gợi ý từ AI.');
        }
        
        const suggestion = response.data;
        
        const newItineraryResponse = await api.createItinerary({
            title: suggestion.title || `Chuyến đi tới ${prompt.location}`,
            date: date,
            description: `Lịch trình được tạo bởi AI cho chuyến đi tới ${prompt.location} với ngân sách ${prompt.budget} và sở thích: ${prompt.interests.join(', ')}.`,
            activities: suggestion.activities
        });

        if (newItineraryResponse.success && newItineraryResponse.data) {
          const itineraryId = newItineraryResponse.data._id;
          router.push(`/itineraries/${itineraryId}`);
        } else {
          throw new Error(newItineraryResponse.message || 'Không thể tạo lịch trình.');
        }

    } catch (err: any) {
        setError(err.message || 'Không thể tạo gợi ý từ AI. Vui lòng thử lại.');
        console.error(err);
    } finally {
        setIsGenerating(false);
    }
  }

  // --- Subscription Logic from ai-suggestion-form.tsx ---
  const plan = user?.subscriptionPlan;
  const usage = user?.aiSuggestionsUsed ?? 0;
  const limit = plan?.aiSuggestionLimit ?? 0;
  const isExpired = user?.subscriptionEndDate && new Date() > new Date(user.subscriptionEndDate);
  let notice: React.ReactNode = null;
  let isDisabled = false;

  if (!user) {
    isDisabled = true; // Disable if user data is not yet loaded
  } else if (!plan) {
    notice = <SubscriptionNotice message="Bạn cần một gói dịch vụ hoạt động để tạo lịch trình bằng AI." />;
    isDisabled = true;
  } else if (isExpired) {
    notice = <SubscriptionNotice message="Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng tính năng này." />;
    isDisabled = true;
  } else if (limit !== -1 && usage >= limit) {
    notice = <SubscriptionNotice message={`Bạn đã sử dụng ${usage}/${limit} lượt gợi ý AI trong tháng.`} />;
    isDisabled = true;
  }

  return (
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
          <CardTitle className="flex items-center">
            <Wand2 className="mr-2 h-5 w-5" />
            Tạo lịch trình bằng AI
            </CardTitle>
          <CardDescription>
            Cung cấp thông tin chuyến đi, AI sẽ tạo một lịch trình chi tiết cho bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {notice}
            <div className={`space-y-6 pt-4 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="space-y-2">
                    <Label htmlFor="date">Ngày đi</Label>
                    <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Bạn sẽ đi đâu?</Label>
                    <Input id="location" value={prompt.location} onChange={e => setPrompt({...prompt, location: e.target.value})} placeholder="VD: Phố cổ Hà Nội" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="budget">Ngân sách</Label>
                    <Select value={prompt.budget} onValueChange={(value: AiPrompt['budget']) => setPrompt({...prompt, budget: value})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn ngân sách của bạn" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LOW">Thấp (Tiết kiệm)</SelectItem>
                            <SelectItem value="MEDIUM">Trung bình (Thông thường)</SelectItem>
                            <SelectItem value="HIGH">Cao (Sang trọng)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duration">Thời gian (số ngày)</Label>
                    <Input id="duration" type="number" min={1} value={prompt.duration} onChange={e => setPrompt({...prompt, duration: parseInt(e.target.value, 10) || 1})} placeholder="VD: 3" />
                </div>
                <div className="space-y-2">
                    <Label>Sở thích</Label>
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
            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
            <div className="flex justify-end pt-6">
                <Button onClick={handleAiSubmit} disabled={isGenerating || isDisabled} size="lg">
                    {isGenerating ? 'Đang tạo...' : 'Tạo lịch trình'}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SubscriptionNotice({ message, showUpgradeLink = true }: { message: string; showUpgradeLink?: boolean }) {
  return (
    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">Thông báo gói dịch vụ</h3>
          <div className="mt-2 text-sm">
            <p>{message}</p>
            {showUpgradeLink && (
              <Link href="/pricing" className="font-medium text-yellow-900 hover:underline mt-2 inline-block">
                Xem các gói & Nâng cấp
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
