'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from '@/lib/api';
import { Wand2, Home, AlertCircle, MapPin, Calendar, DollarSign, Sparkles, Check, ArrowLeft } from 'lucide-react';
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
  console.log('🎯 CreateItineraryPage component rendering');
  const router = useRouter();
  
  console.log('🔧 About to declare state variables');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showAiForm, setShowAiForm] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [showAiResult, setShowAiResult] = useState(false);

  const [prompt, setPrompt] = useState<AiPrompt>({
    location: 'Hòa Lạc', // Default location
    budget: 'MEDIUM',
    interests: ['Ẩm thực'],
    duration: 1
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoadingUser(true);
        console.log('🔍 Fetching user data...');
        const response = await api.getCurrentUser();
        console.log('📊 API Response:', response);
        if (response.success && response.data && response.data.user) {
          console.log('✅ User data received:', response.data.user);
          setUser(response.data.user);
        } else {
          console.log('❌ No user data or failed response:', response);
          setError(response.message || 'Vui lòng đăng nhập để sử dụng tính năng này.');
        }
      } catch (err: any) {
        console.error('❌ Error fetching user:', err);
        setError(err.message || 'Không thể tải dữ liệu người dùng.');
      } finally {
        setIsLoadingUser(false);
        console.log('🏁 Finished fetching user data');
      }
    };
    fetchUser();
  }, []);

  // Memoized subscription calculations để tránh re-calculate mỗi render
  const subscriptionData = useMemo(() => {
    const actualUser = user;
    const plan = actualUser?.subscriptionPlan;
    const usage = actualUser?.aiSuggestionsUsed ?? 0;
    const limit = plan?.aiSuggestionLimit ?? 0;
    const isExpired = actualUser?.subscriptionEndDate && new Date() > new Date(actualUser.subscriptionEndDate);
    
    let notice: React.ReactNode = null;
    let isDisabled = false;

    if (isLoadingUser || !user) {
      isDisabled = true;
    } else if (!plan) {
      notice = showAiForm ? <SubscriptionNotice message="Bạn cần một gói dịch vụ hoạt động để tạo lịch trình bằng AI." /> : null;
      isDisabled = true;
    } else if (isExpired) {
      notice = showAiForm ? <SubscriptionNotice message="Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng tính năng này." /> : null;
      isDisabled = true;
    } else if (limit !== -1 && usage >= limit) {
      notice = showAiForm ? <SubscriptionNotice message={`Bạn đã sử dụng ${usage}/${limit} lượt gợi ý AI trong tháng.`} /> : null;
      isDisabled = true;
    }

    return {
      actualUser,
      plan,
      usage,
      limit,
      isExpired,
      notice,
      isDisabled
    };
  }, [user, isLoadingUser, showAiForm]);

  // Debug log chỉ trong development
  if (process.env.NODE_ENV === 'development') {
    console.log('=== SUBSCRIPTION DEBUG ===');
    console.log('isLoadingUser:', isLoadingUser);
    console.log('user:', user);
    console.log('actualUser:', subscriptionData.actualUser);
    console.log('plan:', subscriptionData.plan);
    console.log('usage:', subscriptionData.usage);
    console.log('limit:', subscriptionData.limit);
    console.log('subscriptionEndDate:', subscriptionData.actualUser?.subscriptionEndDate);
    console.log('isExpired:', subscriptionData.isExpired);
    console.log('showAiForm:', showAiForm);
    console.log('notice:', subscriptionData.notice);
    console.log('isDisabled:', subscriptionData.isDisabled);
    console.log('=== END DEBUG ===');
  }

  // Memoized event handlers
  const handleShowAiForm = useCallback(() => {
    setShowAiForm(true);
  }, []);

  const handleHideAiForm = useCallback(() => {
    setShowAiForm(false);
  }, []);

  const handleInterestToggle = useCallback((interest: string) => {
    setPrompt(prev => {
        const newInterests = prev.interests.includes(interest)
            ? prev.interests.filter(i => i !== interest)
            : [...prev.interests, interest];
        return { ...prev, interests: newInterests };
    });
  }, []);

  const handleAiSubmit = useCallback(async () => {
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
        
        // Store AI result for preview
        setAiResult({
          suggestion,
          prompt,
          date
        });
        setShowAiResult(true);
        setShowAiForm(false);
        setError(''); // Clear any previous errors

    } catch (err: any) {
        setError(err.message || 'Không thể tạo gợi ý từ AI. Vui lòng thử lại.');
        console.error(err);
    } finally {
        setIsGenerating(false);
    }
  }, [user, date, prompt, router]);

  const handleSaveAiItinerary = async () => {
    if (!aiResult) return;
    
    setIsGenerating(true);
    try {
      const { suggestion, prompt, date } = aiResult;
      
      // Parse AI content thành activities
      const activities = parseAiContentToActivities(suggestion.content || '');
      
      // Create description
      const description = suggestion.description || `Lịch trình được tạo bởi AI cho chuyến đi tới ${prompt.location} với ngân sách ${prompt.budget} và sở thích: ${prompt.interests.join(', ')}.`;
      
      const itineraryData = {
          title: suggestion.title || `Chuyến đi tới ${prompt.location}`,
          date: date,
          description: description,
          aiContent: suggestion.content, // Save AI content gốc
          activities: activities, // Use parsed activities instead of empty array
          isAiGenerated: true
      };

      console.log('🚀 Frontend: Sending itinerary data:', {
        title: itineraryData.title,
        isAiGenerated: itineraryData.isAiGenerated,
        hasAiContent: !!itineraryData.aiContent,
        aiContentLength: itineraryData.aiContent?.length || 0,
        activitiesCount: itineraryData.activities.length
      });
      
      const newItineraryResponse = await api.createItinerary(itineraryData);

      console.log('📥 Frontend: Received response:', {
        success: newItineraryResponse.success,
        hasData: !!newItineraryResponse.data,
        message: newItineraryResponse.message
      });

      if (newItineraryResponse.success && newItineraryResponse.data) {
        // Show success message and redirect to itineraries list
        router.push('/itineraries');
      } else {
        throw new Error(newItineraryResponse.message || 'Không thể tạo lịch trình.');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể lưu lịch trình. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToForm = () => {
    setShowAiResult(false);
    setShowAiForm(true);
    setAiResult(null);
  };

  // Parse AI content thành timeline structure
  const parseAiContentToTimeline = (content: string) => {
    // Try to parse as JSON first (new format)
    try {
      const jsonData = JSON.parse(content);
      if (jsonData.content) {
        // Use the content field from JSON
        content = jsonData.content;
      }
    } catch (error) {
      // If not JSON, use content as-is (old format)
      console.log('AI content is not JSON, parsing as plain text');
    }
    
    const timeline = [];
    const lines = content.split('\n');
    let currentDay = null;
    let currentDayActivities = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect day headers (Ngày 1, Ngày 2, etc.)
      if (line.match(/\*\*Ngày \d+:?\*\*/i) || line.match(/^Ngày \d+/i)) {
        // Save previous day if exists
        if (currentDay && currentDayActivities.length > 0) {
          timeline.push({
            day: currentDay,
            activities: [...currentDayActivities]
          });
        }
        
        currentDay = line.replace(/\*\*/g, '').replace(':', '').trim();
        currentDayActivities = [];
        continue;
      }
      
      // Detect time periods (Sáng, Chiều, Tối, etc.)
      if (line.match(/^-?\s*(Sáng|Chiều|Tối|Trưa|Buổi sáng|Buổi chiều|Buổi tối):/i)) {
        const timeMatch = line.match(/^-?\s*(Sáng|Chiều|Tối|Trưa|Buổi sáng|Buổi chiều|Buổi tối):\s*(.+)/i);
        if (timeMatch) {
          const timePeriod = timeMatch[1];
          const activityDescription = timeMatch[2];
          
          currentDayActivities.push({
            time: timePeriod,
            startTime: getTimeFromPeriod(timePeriod),
            endTime: getEndTimeFromPeriod(timePeriod),
            description: activityDescription,
            type: getActivityTypeFromDescription(activityDescription)
          });
        }
        continue;
      }
      
      // Detect bullet points that might be activities
      if (line.match(/^-\s+(.+)/) && !line.match(/(Chi phí|Ăn uống|Di chuyển|Tham quan|Lưu ý|Ghi chú)/i)) {
        const activityMatch = line.match(/^-\s+(.+)/);
        if (activityMatch && currentDay) {
          // Try to extract time from the activity description
          const timeInDescription = activityMatch[1].match(/(\d{1,2}:\d{2}|\d{1,2}h\d{0,2})/);
          const cleanDescription = activityMatch[1].replace(/(\d{1,2}:\d{2}|\d{1,2}h\d{0,2})/, '').trim();
          
          currentDayActivities.push({
            time: timeInDescription ? timeInDescription[1] : 'Cả ngày',
            startTime: timeInDescription ? timeInDescription[1] : '09:00',
            endTime: timeInDescription ? addHours(timeInDescription[1], 2) : '11:00',
            description: cleanDescription || activityMatch[1],
            type: getActivityTypeFromDescription(activityMatch[1])
          });
        }
      }
    }
    
    // Add last day
    if (currentDay && currentDayActivities.length > 0) {
      timeline.push({
        day: currentDay,
        activities: [...currentDayActivities]
      });
    }
    
    return timeline;
  };

  // Parse AI content thành activities với format backend
  const parseAiContentToActivities = (content: string) => {
    const timeline = parseAiContentToTimeline(content);
    const activities: any[] = [];
    
    timeline.forEach((dayData, dayIndex) => {
      dayData.activities.forEach((activity, actIndex) => {
        activities.push({
          customPlace: activity.description,
          startTime: activity.startTime,
          endTime: activity.endTime,
          activityType: activity.type,
          notes: `${dayData.day} - ${activity.time}`
        });
      });
    });
    
    return activities;
  };

  // Helper function to add hours to time string
  const addHours = (timeStr: string, hours: number) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const newHour = (hour + hours) % 24;
    return `${newHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Helper function to convert time period to specific time
  const getTimeFromPeriod = (period: string) => {
    const periodLower = period.toLowerCase();
    if (periodLower.includes('sáng')) return '08:00';
    if (periodLower.includes('trưa')) return '12:00';
    if (periodLower.includes('chiều')) return '14:00';
    if (periodLower.includes('tối')) return '18:00';
    return '09:00';
  };

  // Helper function to get end time based on start time
  const getEndTimeFromPeriod = (period: string) => {
    const periodLower = period.toLowerCase();
    if (periodLower.includes('sáng')) return '11:00';
    if (periodLower.includes('trưa')) return '14:00';
    if (periodLower.includes('chiều')) return '17:00';
    if (periodLower.includes('tối')) return '21:00';
    return '11:00';
  };

  // Helper function to determine activity type from description
  const getActivityTypeFromDescription = (description: string) => {
    const descLower = description.toLowerCase();
    if (descLower.includes('ăn') || descLower.includes('quán') || descLower.includes('nhà hàng') || descLower.includes('món')) {
      return 'EAT';
    }
    if (descLower.includes('tham quan') || descLower.includes('viếng') || descLower.includes('thăm') || descLower.includes('xem')) {
      return 'VISIT';
    }
    if (descLower.includes('giải trí') || descLower.includes('vui chơi') || descLower.includes('show') || descLower.includes('biểu diễn')) {
      return 'ENTERTAINMENT';
    }
    if (descLower.includes('di chuyển') || descLower.includes('đi') || descLower.includes('về') || descLower.includes('taxi') || descLower.includes('xe')) {
      return 'TRAVEL';
    }
    return 'OTHER';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-4">
        <Link href="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Quay về trang chủ
          </Button>
        </Link>
      </div>

      {/* Creation Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wand2 className="mr-2 h-5 w-5" />
              Tạo bằng AI
            </CardTitle>
            <CardDescription>
              AI sẽ tự động tạo lịch trình dựa trên sở thích của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Chỉ cần cung cấp địa điểm, ngân sách và sở thích, AI sẽ tạo một lịch trình hoàn chỉnh cho bạn.
            </p>
            <Button className="w-full" onClick={handleShowAiForm}>
              Chọn AI
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Tạo thủ công
            </CardTitle>
            <CardDescription>
              Tự tạo lịch trình chi tiết theo ý muốn của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Hoàn toàn kiểm soát lịch trình của bạn với khả năng tùy chỉnh từng hoạt động.
            </p>
            <Link href="/itineraries/create/manual">
              <Button variant="outline" className="w-full">
                Chọn thủ công
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* AI Form */}
      {showAiForm && (
        <Card>
          <CardHeader>
             <div className="flex justify-between items-start">
               <div>
                 <CardTitle className="flex items-center">
                   <Wand2 className="mr-2 h-5 w-5" />
                   Tạo lịch trình bằng AI
                 </CardTitle>
                 <CardDescription>
                   Cung cấp thông tin chuyến đi, AI sẽ tạo một lịch trình chi tiết cho bạn.
                 </CardDescription>
               </div>
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={handleHideAiForm}
                 className="text-gray-500 hover:text-gray-700"
               >
                 ✕
               </Button>
             </div>
           </CardHeader>
        <CardContent>
            {subscriptionData.notice}
            <div className={`space-y-6 pt-4 ${subscriptionData.isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
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
                <Button onClick={handleAiSubmit} disabled={isGenerating || subscriptionData.isDisabled} size="lg">
                    {isGenerating ? 'Đang tạo...' : 'Tạo lịch trình'}
                </Button>
            </div>
        </CardContent>
        </Card>
      )}

      {/* AI Result Preview */}
      {showAiResult && aiResult && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Lịch trình được tạo bởi AI
            </CardTitle>
            <p className="text-sm text-gray-600">
              Xem trước lịch trình được tạo cho chuyến đi tới {aiResult.prompt.location}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trip Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-lg mb-2">{aiResult.suggestion.title || `Chuyến đi tới ${aiResult.prompt.location}`}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span><strong>Địa điểm:</strong> {aiResult.prompt.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span><strong>Ngân sách:</strong> {aiResult.prompt.budget}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span><strong>Ngày:</strong> {new Date(aiResult.date).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              {aiResult.prompt.interests.length > 0 && (
                <div className="mt-3">
                  <span className="text-sm font-medium">Sở thích: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiResult.prompt.interests.map((interest: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-white rounded-full text-xs border">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Generated Content */}
             <div className="space-y-4">
               {aiResult.suggestion.description && (
                 <div>
                   <h4 className="font-medium mb-2">Mô tả chuyến đi</h4>
                   <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                     {aiResult.suggestion.description}
                   </p>
                 </div>
               )}
               
               {/* Timeline Preview */}
               {(() => {
                 const timeline = parseAiContentToTimeline(aiResult.suggestion.content || '');
                 return timeline.length > 0 && (
                   <div>
                     <h4 className="font-medium mb-4 flex items-center gap-2">
                       <Calendar className="h-4 w-4" />
                       Lịch trình chi tiết ({timeline.length} ngày)
                     </h4>
                     <div className="space-y-6">
                       {timeline.map((dayData, dayIndex) => (
                         <div key={dayIndex} className="bg-white border rounded-lg overflow-hidden">
                           {/* Day Header */}
                           <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
                             <h5 className="font-semibold text-lg flex items-center gap-2">
                               <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold">
                                 {dayIndex + 1}
                               </div>
                               {dayData.day}
                             </h5>
                             <p className="text-blue-100 text-sm mt-1">
                               {dayData.activities.length} hoạt động được lên kế hoạch
                             </p>
                           </div>
                           
                           {/* Activities Timeline */}
                           <div className="p-4">
                             <div className="space-y-4">
                               {dayData.activities.map((activity, actIndex) => (
                                 <div key={actIndex} className="flex items-start gap-4 relative">
                                   {/* Timeline Line */}
                                   {actIndex < dayData.activities.length - 1 && (
                                     <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                                   )}
                                   
                                   {/* Time Badge */}
                                   <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                     <div className="text-center">
                                       <div className="text-xs font-semibold text-gray-700">
                                         {activity.startTime}
                                       </div>
                                     </div>
                                   </div>
                                   
                                   {/* Activity Content */}
                                   <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-4">
                                     <div className="flex items-start justify-between gap-2 mb-2">
                                       <div className="flex items-center gap-2">
                                         <span className="font-medium text-gray-900">
                                           {activity.time}
                                         </span>
                                         <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                           {activity.startTime} - {activity.endTime}
                                         </span>
                                       </div>
                                       <span className={`text-xs px-2 py-1 rounded-full ${
                                         activity.type === 'EAT' ? 'bg-orange-100 text-orange-700' :
                                         activity.type === 'VISIT' ? 'bg-green-100 text-green-700' :
                                         activity.type === 'ENTERTAINMENT' ? 'bg-purple-100 text-purple-700' :
                                         activity.type === 'TRAVEL' ? 'bg-blue-100 text-blue-700' :
                                         'bg-gray-100 text-gray-700'
                                       }`}>
                                         {activity.type === 'EAT' ? 'Ăn uống' :
                                          activity.type === 'VISIT' ? 'Tham quan' :
                                          activity.type === 'ENTERTAINMENT' ? 'Giải trí' :
                                          activity.type === 'TRAVEL' ? 'Di chuyển' : 'Khác'}
                                       </span>
                                     </div>
                                     <p className="text-gray-700 text-sm leading-relaxed">
                                       {activity.description}
                                     </p>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 );
               })()}
               
               {/* Raw Content (fallback) */}
               {(() => {
                 const activities = parseAiContentToActivities(aiResult.suggestion.content || '');
                 return activities.length === 0 && aiResult.suggestion.content && (
                   <div>
                     <h4 className="font-medium mb-2">Chi tiết lịch trình</h4>
                     <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                       <div className="prose prose-sm max-w-none">
                         {aiResult.suggestion.content.split('\n').map((line: string, index: number) => {
                           if (line.trim() === '') return <br key={index} />;
                           if (line.startsWith('##')) {
                             return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-800">{line.replace('##', '').trim()}</h3>;
                           }
                           if (line.startsWith('#')) {
                             return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-gray-900">{line.replace('#', '').trim()}</h2>;
                           }
                           if (line.startsWith('**') && line.endsWith('**')) {
                             return <p key={index} className="font-semibold mt-2 mb-1">{line.replace(/\*\*/g, '')}</p>;
                           }
                           if (line.startsWith('- ')) {
                             return <li key={index} className="ml-4 mb-1">{line.replace('- ', '')}</li>;
                           }
                           return <p key={index} className="mb-2">{line}</p>;
                         })}
                       </div>
                     </div>
                   </div>
                 );
               })()}
             </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                onClick={handleSaveAiItinerary} 
                disabled={isGenerating}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Lưu lịch trình này
                  </>
                )}
              </Button>
              <Button 
                onClick={handleBackToForm} 
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tạo lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
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
