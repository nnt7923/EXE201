'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityForm, Activity } from '@/components/itinerary/activity-form';
import { Clock, MapPin, Utensils, Film, Bus, PlusCircle, Pencil, Trash2, ArrowLeft, Calendar } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// We can re-use the Activity type from the form

interface Itinerary {
  _id: string;
  title: string;
  date: string;
  description?: string;
  aiContent?: string;
  activities?: Activity[];
  isAiGenerated?: boolean;
}

// Timeline interfaces for AI-generated content
interface TimelineActivity {
  time: string;
  startTime: string;
  endTime: string;
  description: string;
  details?: string;
  type: string;
}

interface TimelineDay {
  day: string;
  activities: TimelineActivity[];
}

// Helper function to create sample timeline when AI content is not valid
const createSampleTimeline = (): TimelineDay[] => {
  return [
    {
      day: '1',
      activities: [
        {
          time: '08:00 - 09:00',
          startTime: '08:00',
          endTime: '09:00',
          description: 'Khởi hành và di chuyển đến điểm đầu tiên',
          type: 'transport'
        },
        {
          time: '09:00 - 11:30',
          startTime: '09:00',
          endTime: '11:30',
          description: 'Tham quan và khám phá địa điểm chính',
          type: 'sightseeing'
        },
        {
          time: '11:30 - 13:00',
          startTime: '11:30',
          endTime: '13:00',
          description: 'Nghỉ trưa và thưởng thức ẩm thực địa phương',
          type: 'dining'
        },
        {
          time: '13:00 - 16:00',
          startTime: '13:00',
          endTime: '16:00',
          description: 'Tiếp tục tham quan các điểm thú vị',
          type: 'sightseeing'
        },
        {
          time: '16:00 - 18:00',
          startTime: '16:00',
          endTime: '18:00',
          description: 'Mua sắm và khám phá khu vực xung quanh',
          type: 'shopping'
        },
        {
          time: '18:00 - 20:00',
          startTime: '18:00',
          endTime: '20:00',
          description: 'Ăn tối và nghỉ ngơi',
          type: 'dining'
        }
      ]
    }
  ];
};

// Helper functions for parsing AI content
const parseAiContentToTimeline = (content: string): TimelineDay[] => {
  if (!content) return [];
  
  console.log('🔍 parseAiContentToTimeline called with content length:', content.length);
  console.log('🔍 Raw content preview (first 500 chars):', content.substring(0, 500));
  console.log('🔍 Raw content type:', typeof content);
  
  // Try to parse as JSON first (new format)
  try {
    const jsonData = JSON.parse(content);
    console.log('✅ Successfully parsed as JSON:', jsonData);
    
    if (jsonData.content) {
      content = jsonData.content;
      console.log('✅ Using content field from JSON');
    } else if (jsonData.title && jsonData.description) {
      // This might be a complete AI response
      console.log('✅ Found AI response structure');
      if (jsonData.content) {
        content = jsonData.content;
      } else {
        console.log('❌ No content field in AI response');
        return createSampleTimeline();
      }
    } else if (Array.isArray(jsonData) || (jsonData.annotations && jsonData.text_content)) {
      // This looks like OCR/image analysis data, not timeline content
      console.log('❌ Detected OCR/image analysis data, creating sample timeline');
      return createSampleTimeline();
    } else {
      console.log('❌ Unknown JSON structure, treating as raw content');
      content = JSON.stringify(jsonData);
    }
  } catch (error) {
    console.log('AI content is not JSON, parsing as plain text');
  }
  
  const timeline: TimelineDay[] = [];
  
  // Enhanced line splitting to handle bullet points in single line
  let lines: string[] = [];
  
  // First split by bullet points, then by newlines
  const bulletSections = content.split(/•\s+/);
  console.log('🔸 Bullet sections found:', bulletSections.length);
  
  for (const section of bulletSections) {
    if (section.trim()) {
      // Further split each section by newlines
      const subLines = section.split(/\n+/).map(line => line.trim()).filter(line => line.length > 0);
      lines.push(...subLines);
    }
  }
  
  console.log('📄 Total lines to process after bullet splitting:', lines.length);
  
  // Simple parsing approach - look for time patterns
  let currentDay = { day: 'Ngày 1', activities: [] as TimelineActivity[] };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    console.log(`Line ${i}: "${line}"`);
    
    // Skip lines that are clearly not activities
    if (line.includes('Chi phí ước tính') || 
        line.includes('Tổng chi phí') ||
        line.includes('Phương tiện:') ||
        line.includes('Gợi ý món ăn:') ||
        line.includes('Hoạt động:') ||
        line.startsWith('###') ||
        line.includes('VNĐ/lượt') ||
        line.includes('Giá:') ||
        line.length < 10) {
      console.log('⏭️ Skipping non-activity line');
      continue;
    }
    
    // Check for day headers
    if (line.match(/ngày\s+\d+/i) || line.match(/day\s+\d+/i)) {
      if (currentDay.activities.length > 0) {
        timeline.push(currentDay);
      }
      currentDay = { day: line, activities: [] };
      console.log('Found day:', line);
      continue;
    }
    
    // Look for any time pattern in the line
    const timePatterns = [
      // Pattern 1: "8:30 - 9:30: Description" (start of line)
      /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2}):\s*(.+)/,
      // Pattern 2: "**8:30 - 9:30**: Description" (markdown format)
      /^\*\*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\*\*:\s*(.+)/,
      // Pattern 3: "8:30 - 9:30 Description" (without colon)
      /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s+(.+)/,
      // Pattern 4: "8:30: Description" (just start time)
      /^(\d{1,2}:\d{2}):\s*(.+)/,
      // Pattern 5: Time anywhere in line "... 8:30 - 9:30: Description"
      /.*?(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2}):\s*(.+)/,
      // Pattern 6: Time anywhere "... 8:30: Description"
      /.*?(\d{1,2}:\d{2}):\s*(.+)/
    ];
    
    let timeMatch = null;
    let patternIndex = -1;
    
    for (let i = 0; i < timePatterns.length; i++) {
      timeMatch = line.match(timePatterns[i]);
      if (timeMatch) {
        patternIndex = i;
        break;
      }
    }
    
    if (timeMatch) {
      let startTime, endTime, description;
      
      switch (patternIndex) {
        case 0: // "8:30 - 9:30: Description"
        case 1: // "**8:30 - 9:30**: Description"
        case 2: // "8:30 - 9:30 Description"
        case 4: // "... 8:30 - 9:30: Description"
          startTime = timeMatch[1];
          endTime = timeMatch[2];
          description = timeMatch[3].trim();
          break;
        case 3: // "8:30: Description"
        case 5: // "... 8:30: Description"
          startTime = timeMatch[1];
          description = timeMatch[2].trim();
          // Calculate end time (assume 1-2 hours duration)
          const [hour, minute] = startTime.split(':').map(Number);
          const endHour = (hour + 1) % 24;
          endTime = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          break;
      }
      
      // Clean up description
      description = (description || '')
        .replace(/\\n/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\*\s*/g, '• ')
        .trim();
      
      // Split long descriptions into main title and details
      const sentences = description.split(/[.!?]\s+/);
      const mainDescription = sentences[0];
      const details = sentences.slice(1).join('. ');
      
      currentDay.activities.push({
        time: `${startTime || ''} - ${endTime || ''}`,
        startTime: startTime || '',
        endTime: endTime || '',
        description: mainDescription,
        details: details || undefined,
        type: getActivityTypeFromDescription(description)
      });
      console.log('Found time activity:', { startTime, endTime, description: mainDescription, details, pattern: patternIndex });
      continue;
    }
    
    // Look for simple time patterns like "8:00:" or "**8:00:**"
    const simpleTimeMatch = line.match(/(\*\*)?(\d{1,2}:\d{2})(\*\*)?\s*:?\s*(.+)/);
    if (simpleTimeMatch) {
      const time = simpleTimeMatch[2];
      const description = simpleTimeMatch[4].replace(/\*\*/g, '').trim();
      
      // Calculate end time (assume 1-2 hours duration)
      const [hour, minute] = time.split(':').map(Number);
      const endHour = (hour + 1) % 24;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      currentDay.activities.push({
        time: time,
        startTime: time,
        endTime: endTime,
        description: description,
        type: getActivityTypeFromDescription(description)
      });
      console.log('Found simple time activity:', { time, description });
      continue;
    }
    
    // Look for bullet points with activities
    const bulletMatch = line.match(/^[-*]\s*(.+)/);
    if (bulletMatch) {
      const description = bulletMatch[1].replace(/\*\*/g, '').trim();
      
      // Try to extract time from description
      const timeInDesc = description.match(/(\d{1,2}:\d{2})/);
      const time = timeInDesc ? timeInDesc[1] : '09:00';
      const [hour, minute] = time.split(':').map(Number);
      const endHour = (hour + 1) % 24;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      currentDay.activities.push({
        time: time,
        startTime: time,
        endTime: endTime,
        description: description,
        type: getActivityTypeFromDescription(description)
      });
      console.log('Found bullet activity:', { time, description });
    }
  }
  
  // Add the last day
  if (currentDay.activities.length > 0) {
    timeline.push(currentDay);
  }
  
  console.log('📊 Final timeline:', timeline);
  
  // If no valid timeline was parsed, return sample timeline
  if (timeline.length === 0) {
    console.log('❌ No valid timeline parsed, returning sample timeline');
    return createSampleTimeline();
  }
  
  return timeline;
};



// Helper function to determine activity type from description
const getActivityTypeFromDescription = (description: string) => {
  const descLower = description.toLowerCase();
  
  // Food related keywords
  if (descLower.match(/(ăn|phở|bún|cơm|bánh|chè|cà phê|trà|nước|food|restaurant|meal|món|bữa|thưởng thức|quán|lẩu|nướng|đồ uống|kem|tráng miệng|nhà hàng)/)) {
    return 'EAT';
  }
  
  // Sightseeing related keywords  
  if (descLower.match(/(tham quan|visit|museum|temple|đại học|khuôn viên|chiêm ngưỡng|khám phá|cảm nhận|kiến trúc|học thuật|viếng|thăm|xem)/)) {
    return 'VISIT';
  }
  
  // Entertainment related keywords
  if (descLower.match(/(giải trí|vui chơi|show|biểu diễn|entertainment|concert|performance|ca nhạc|múa|hát)/)) {
    return 'ENTERTAINMENT';
  }
  
  // Transport related keywords
  if (descLower.match(/(di chuyển|transport|travel|move|đi|về|quay về|kết thúc chuyến|taxi|xe|bus|tàu)/)) {
    return 'TRAVEL';
  }
  
  return 'OTHER';
};

export default function ItineraryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const fetchItinerary = useCallback(async () => {
    if (!id || id === 'undefined') {
      setError('ID lịch trình không hợp lệ.');
      setIsLoading(false);
      // Redirect to itineraries list after a short delay
      setTimeout(() => {
        router.push('/itineraries');
      }, 2000);
      return;
    }
    
    try {
      const response = await api.getItinerary(id);
      
      if (response.success && response.data && response.data.itinerary) {
        setItinerary(response.data.itinerary);
      } else {
        setError('Dữ liệu lịch trình không hợp lệ.');
      }
    } catch (err) {
      setError('Không thể tải chi tiết lịch trình.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchItinerary();
    } else {
      setIsLoading(false);
      setError('ID lịch trình không hợp lệ.');
    }
  }, [id, fetchItinerary]);

  // Debug log for itinerary data
  useEffect(() => {
    if (itinerary) {
      console.log('🔍 Detail Page - Itinerary data:', {
        id: itinerary._id,
        title: itinerary.title,
        isAiGenerated: itinerary.isAiGenerated,
        hasAiContent: !!itinerary.aiContent,
        aiContentLength: itinerary.aiContent?.length || 0,
        aiContentPreview: itinerary.aiContent ? itinerary.aiContent.substring(0, 200) + '...' : 'No content',
        activitiesCount: itinerary.activities?.length || 0
      });
      
      if (itinerary.isAiGenerated && itinerary.aiContent) {
        const timeline = parseAiContentToTimeline(itinerary.aiContent);
        console.log('📅 Parsed timeline:', timeline);
      }
    }
  }, [itinerary]);

  const handleSaveActivity = async (activityToSave: Activity) => {
    if (!itinerary) return;

    const currentActivities = itinerary.activities || [];
    let updatedActivities;
    if (editingActivity) {
      // Editing existing activity
      updatedActivities = currentActivities.map(act => 
        act._id === editingActivity._id ? { ...act, ...activityToSave } : act
      );
    } else {
      // Adding new activity
      const newActivity = { ...activityToSave, _id: new Date().toISOString() }; // temp ID
      updatedActivities = [...currentActivities, newActivity];
    }

    try {
      const activitiesForApi = updatedActivities.map(act => {
        // If the activity is new (i.e., its _id is not in the original itinerary),
        // then we strip the temporary _id before sending to the API.
        if (!currentActivities.find(originalAct => originalAct._id === act._id)) {
          const { _id, ...rest } = act;
          return rest;
        }
        return act;
      });

      const response = await api.updateItinerary(id, { activities: activitiesForApi });
      if (response.success && response.data && response.data.itinerary) {
        setItinerary(response.data.itinerary);
      }
      setIsFormOpen(false);
      setEditingActivity(null);
    } catch (error) {
      console.error("Failed to save activity", error);
      alert("Error: Could not save the activity.");
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!itinerary) return;

    const updatedActivities = (itinerary.activities || []).filter(act => act._id !== activityId);
    try {
      const response = await api.updateItinerary(id, { activities: updatedActivities });
      if (response.success && response.data && response.data.itinerary) {
        setItinerary(response.data.itinerary);
      }
    } catch (error) {
      console.error("Failed to delete activity", error);
      alert("Error: Could not delete the activity.");
    }
  };

  const handleAddNewClick = () => {
    setEditingActivity(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (activity: Activity) => {
    setEditingActivity(activity);
    setIsFormOpen(true);
  };

  const getActivityIcon = (type: Activity['activityType']) => {
    switch (type) {
      case 'EAT': return <Utensils className="h-5 w-5" />;
      case 'VISIT': return <MapPin className="h-5 w-5" />;
      case 'ENTERTAINMENT': return <Film className="h-5 w-5" />;
      case 'TRAVEL': return <Bus className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Đang tải lịch trình...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <Button onClick={() => router.push('/itineraries')} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Không tìm thấy lịch trình.</p>
          <Button onClick={() => router.push('/itineraries')} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ActivityForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveActivity} 
        initialData={editingActivity}
      />
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Button variant="ghost" onClick={() => router.push('/itineraries')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
        </Button>
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">{itinerary.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            {new Date(itinerary.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {itinerary.description && <p className="mt-4 text-gray-600">{itinerary.description}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Dòng thời gian</h2>
            <Button onClick={handleAddNewClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm hoạt động
            </Button>
          </div>

          {/* Show AI-generated timeline if it's an AI-generated itinerary */}
          {itinerary.isAiGenerated && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <Calendar className="h-4 w-4" />
                <span>Lịch trình được tạo bởi AI</span>
              </div>
              {itinerary.aiContent ? (
                parseAiContentToTimeline(itinerary.aiContent).map((day, dayIndex) => (
                <div key={dayIndex} className="mb-10">
                  {/* Day Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full font-bold text-lg shadow-lg">
                      {dayIndex + 1}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{day.day}</h3>
                      <p className="text-sm text-gray-500">{day.activities.length} hoạt động</p>
                    </div>
                  </div>
                  
                  {/* Timeline */}
                  <div className="relative ml-6">
                    {/* Vertical line */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-blue-200"></div>
                    
                    <div className="space-y-8">
                      {day.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="relative">
                          {/* Time marker */}
                          <div className="absolute -left-6 top-0 flex items-center">
                            <div className="w-12 h-12 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                                {getActivityIcon(activity.type as Activity['activityType'])}
                              </div>
                            </div>
                          </div>
                          
                          {/* Activity card */}
                          <div className="ml-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                            {/* Time badge */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {activity.time}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {activity.startTime} - {activity.endTime}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                {activity.type === 'FOOD' ? 'Ẩm thực' :
                                 activity.type === 'VISIT' ? 'Tham quan' :
                                 activity.type === 'ENTERTAINMENT' ? 'Giải trí' :
                                 activity.type === 'TRAVEL' ? 'Di chuyển' : 'Khác'}
                              </span>
                            </div>
                            
                            {/* Activity content */}
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                                {activity.description}
                              </h4>
                              {activity.details && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {activity.details}
                                </p>
                              )}
                            </div>
                            
                            {/* Duration indicator */}
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-center text-xs text-gray-500">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                Thời lượng: {(() => {
                                  const start = new Date(`2000-01-01 ${activity.startTime}`);
                                  const end = new Date(`2000-01-01 ${activity.endTime}`);
                                  const diff = (end.getTime() - start.getTime()) / (1000 * 60);
                                  return diff >= 60 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff}m`;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Lịch trình AI này được tạo trước khi có tính năng hiển thị chi tiết.</p>
                  <p className="mt-2">Mô tả: {itinerary.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Show manual activities timeline */}
          {!itinerary.isAiGenerated && itinerary.activities && itinerary.activities.length > 0 && (
            <div className="relative ml-6">
              {/* Vertical line */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-blue-200"></div>
              
              <div className="space-y-8">
                {itinerary.activities.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((activity, index) => (
                  <div key={activity._id} className="relative group">
                    {/* Time marker */}
                    <div className="absolute -left-6 top-0 flex items-center">
                      <div className="w-12 h-12 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                          {getActivityIcon(activity.activityType)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Activity card */}
                    <div className="ml-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                      {/* Action buttons */}
                      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(activity)} className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này không thể hoàn tác. Hoạt động này sẽ bị xóa vĩnh viễn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteActivity(activity._id!)} className="bg-destructive hover:bg-destructive/90">
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      
                      {/* Time badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {activity.startTime} - {activity.endTime}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                          {activity.activityType === 'EAT' ? 'Ẩm thực' :
                           activity.activityType === 'VISIT' ? 'Tham quan' :
                           activity.activityType === 'ENTERTAINMENT' ? 'Giải trí' :
                           activity.activityType === 'TRAVEL' ? 'Di chuyển' : 'Khác'}
                        </span>
                      </div>
                      
                      {/* Activity content */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                          {(typeof activity.place === 'object' && activity.place?.name) || activity.customPlace}
                        </h4>
                        {activity.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {activity.notes}
                          </p>
                        )}
                        {(typeof activity.place === 'object' && activity.place?.address) && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                            {typeof activity.place === 'object' && activity.place.address && 
                              `${activity.place.address.street}, ${activity.place.address.ward}, ${activity.place.address.district}, ${activity.place.address.city}`}
                          </p>
                        )}
                      </div>
                      
                      {/* Duration indicator */}
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center text-xs text-gray-500">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          Thời lượng: {(() => {
                            const start = new Date(`2000-01-01 ${activity.startTime}`);
                            const end = new Date(`2000-01-01 ${activity.endTime}`);
                            const diff = (end.getTime() - start.getTime()) / (1000 * 60);
                            return diff >= 60 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff}m`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show empty state only for manual itineraries with no activities */}
          {!itinerary.isAiGenerated && (!itinerary.activities || itinerary.activities.length === 0) && (
            <div className="space-y-8 border-l-2 border-border ml-3">
              <div className="pl-8">
                <p className="text-muted-foreground">Chưa có hoạt động nào được thêm vào.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}