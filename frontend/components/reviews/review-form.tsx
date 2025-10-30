'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  placeId: string;
  bookingId?: string;
  placeName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ReviewData {
  rating: number;
  title: string;
  content: string;
}

export default function ReviewForm({ placeId, bookingId, placeName, onSuccess, onCancel }: ReviewFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 0,
    title: '',
    content: ''
  });

  const StarRating = ({ rating, onRatingChange, size = 'default' }: { 
    rating: number; 
    onRatingChange: (rating: number) => void;
    size?: 'small' | 'default' | 'large';
  }) => {
    const sizeClasses = {
      small: 'h-4 w-4',
      default: 'h-5 w-5',
      large: 'h-6 w-6'
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`${sizeClasses[size]} transition-colors`}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reviewData.rating === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn số sao đánh giá",
        variant: "destructive"
      });
      return;
    }

    if (!reviewData.title.trim() || !reviewData.content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ tiêu đề và nội dung đánh giá",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...reviewData,
        place: placeId,
        visitDate: new Date().toISOString(),
        ...(bookingId && { booking: bookingId })
      };

      await api.createReview(submitData);
      
      toast({
        title: "Thành công",
        description: "Đánh giá của bạn đã được gửi thành công!"
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      
      toast({
        title: "Lỗi",
        description: `Có lỗi xảy ra khi gửi đánh giá: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Viết đánh giá cho {placeName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Đánh giá tổng thể *</Label>
            <div className="flex items-center gap-4">
              <StarRating 
                rating={reviewData.rating} 
                onRatingChange={(rating) => setReviewData(prev => ({ ...prev, rating }))}
                size="large"
              />
              <span className="text-lg font-medium">
                {reviewData.rating > 0 ? `${reviewData.rating}/5 sao` : 'Chưa đánh giá'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề đánh giá *(Tiêu đề phải có từ 5-100 ký tự)</Label>
            <Input
              id="title"
              value={reviewData.title}
              onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Tóm tắt trải nghiệm của bạn"
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Nội dung đánh giá *(Nội dung phải có từ 10-1000 ký tự)</Label>
            <Textarea
              id="content"
              value={reviewData.content}
              onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Chia sẻ chi tiết về trải nghiệm của bạn..."
              rows={6}
              maxLength={1000}
            />
            <div className="text-sm text-gray-500 text-right">
              {reviewData.content.length}/1000 ký tự
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
              >
                Hủy
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}