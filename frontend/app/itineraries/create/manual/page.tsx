'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { Plus, Trash2, Home, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Activity {
  id: string;
  customPlace: string;
  startTime: string;
  endTime: string;
  activityType: string;
  notes?: string;
}

export default function ManualCreateItineraryPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      customPlace: '',
      startTime: '09:00',
      endTime: '10:00',
      activityType: 'VISIT',
      notes: ''
    }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addActivity = () => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      customPlace: '',
      startTime: '09:00',
      endTime: '10:00',
      activityType: 'VISIT',
      notes: ''
    };
    setActivities([...activities, newActivity]);
  };

  const removeActivity = (id: string) => {
    if (activities.length > 1) {
      setActivities(activities.filter(activity => activity.id !== id));
    }
  };

  const updateActivity = (id: string, field: keyof Activity, value: string) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, [field]: value } : activity
    ));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề cho lịch trình.');
      return;
    }

    if (!date) {
      setError('Vui lòng chọn ngày cho lịch trình.');
      return;
    }

    const validActivities = activities.filter(activity => activity.customPlace.trim());
    if (validActivities.length === 0) {
      setError('Vui lòng thêm ít nhất một hoạt động.');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const itineraryData = {
        title: title.trim(),
        date,
        description: description.trim() || `Lịch trình được tạo thủ công cho ngày ${date}`,
        activities: validActivities.map(activity => ({
          customPlace: activity.customPlace.trim(),
          startTime: activity.startTime,
          endTime: activity.endTime,
          activityType: activity.activityType,
          notes: activity.notes?.trim() || ''
        }))
      };

      const response = await api.createItinerary(itineraryData);

      if (response.success && response.data) {
        // Show success message and redirect to itineraries list
        setError(''); // Clear any previous errors
        // You could add a success toast here if needed
        router.push('/itineraries');
      } else {
        throw new Error(response.message || 'Không thể tạo lịch trình.');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tạo lịch trình. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-4">
        <Link href="/itineraries/create">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Quay lại trang tạo lịch trình
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Tạo lịch trình thủ công
          </CardTitle>
          <CardDescription>
            Tự tạo lịch trình chi tiết theo ý muốn của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề lịch trình *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Chuyến đi khám phá Hòa Lạc"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Ngày đi *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả (tùy chọn)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về chuyến đi của bạn..."
                rows={3}
              />
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Hoạt động</h3>
              <Button onClick={addActivity} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Thêm hoạt động
              </Button>
            </div>

            <div className="space-y-4">
              {activities.map((activity, index) => (
                <Card key={activity.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Hoạt động {index + 1}
                    </h4>
                    {activities.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeActivity(activity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Địa điểm *</Label>
                      <Input
                        value={activity.customPlace}
                        onChange={(e) => updateActivity(activity.id, 'customPlace', e.target.value)}
                        placeholder="VD: Trường Đại học FPT"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Loại hoạt động</Label>
                      <select
                        value={activity.activityType}
                        onChange={(e) => updateActivity(activity.id, 'activityType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="VISIT">Tham quan</option>
                        <option value="EAT">Ăn uống</option>
                        <option value="ENTERTAINMENT">Giải trí</option>
                        <option value="TRAVEL">Di chuyển</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Thời gian bắt đầu</Label>
                      <Input
                        type="time"
                        value={activity.startTime}
                        onChange={(e) => updateActivity(activity.id, 'startTime', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Thời gian kết thúc</Label>
                      <Input
                        type="time"
                        value={activity.endTime}
                        onChange={(e) => updateActivity(activity.id, 'endTime', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Ghi chú</Label>
                      <Input
                        value={activity.notes}
                        onChange={(e) => updateActivity(activity.id, 'notes', e.target.value)}
                        placeholder="Ghi chú thêm..."
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-6">
            <Button onClick={handleSubmit} disabled={isCreating} size="lg">
              {isCreating ? 'Đang tạo...' : 'Tạo lịch trình'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}