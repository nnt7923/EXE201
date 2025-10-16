'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';
import ReviewForm from '@/components/reviews/review-form';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Place {
  _id: string;
  name: string;
  address: string;
  images: Array<{ url: string; alt: string }>;
  category?: {
    name: string;
  };
}

export default function WriteReviewPage({ params }: { params: { placeId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  
  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    fetchPlace();
  }, [params.placeId]);

  const fetchPlace = async () => {
    try {
      setLoading(true);
      const response = await api.getPlace(params.placeId);
      setPlace(response.data);
    } catch (error) {
      console.error('Error fetching place:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin địa điểm. Vui lòng thử lại.",
        variant: "destructive"
      });
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    toast({
      title: "Thành công",
      description: "Đánh giá của bạn đã được gửi thành công!"
    });
    router.push(`/places/${params.placeId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy địa điểm
            </h1>
            <Button onClick={() => router.push('/')}>
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            
            {/* Place Info */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {place.images && place.images.length > 0 && (
                    <img
                      src={place.images[0].url}
                      alt={place.images[0].alt || place.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {place.name}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{place.address}</span>
                    </div>
                    <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {place.category?.name || 'Chưa phân loại'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Review Form */}
          <ReviewForm
            placeId={params.placeId}
            bookingId={bookingId || undefined}
            placeName={place.name}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}