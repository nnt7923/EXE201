'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, Upload, X, Plus } from 'lucide-react';
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
  aspects: {
    food: { rating: number; comment: string };
    service: { rating: number; comment: string };
    atmosphere: { rating: number; comment: string };
    value: { rating: number; comment: string };
  };
  visitDate: string;
  visitType: string;
  pricePaid: number;
  groupSize: number;
  tags: string[];
}

export default function ReviewForm({ placeId, bookingId, placeName, onSuccess, onCancel }: ReviewFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 0,
    title: '',
    content: '',
    aspects: {
      food: { rating: 0, comment: '' },
      service: { rating: 0, comment: '' },
      atmosphere: { rating: 0, comment: '' },
      value: { rating: 0, comment: '' }
    },
    visitDate: new Date().toISOString().split('T')[0],
    visitType: 'dine-in',
    pricePaid: 0,
    groupSize: 1,
    tags: []
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
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`${sizeClasses[size]} transition-colors`}
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
      // Check authentication status
      const token = localStorage.getItem('token');
      console.log('Authentication token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');

      // Filter out aspects with 0 ratings
      const filteredAspects = Object.entries(reviewData.aspects).reduce((acc, [key, aspect]) => {
        if (aspect.rating > 0) {
          acc[key] = aspect;
        }
        return acc;
      }, {} as any);

      const submitData = {
        ...reviewData,
        aspects: filteredAspects,
        place: placeId,
        ...(bookingId && { booking: bookingId })
      };

      console.log('Submitting review data:', JSON.stringify(submitData, null, 2));
      console.log('Filtered aspects:', filteredAspects);
      console.log('About to call api.createReview...');

      await api.createReview(submitData);
      
      console.log('Review submission successful!');
      
      toast({
        title: "Thành công",
        description: "Đánh giá của bạn đã được gửi thành công!"
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error detected - API server might be unreachable');
      }
      
      toast({
        title: "Lỗi",
        description: `Có lỗi xảy ra khi gửi đánh giá: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !reviewData.tags.includes(newTag.trim())) {
      setReviewData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setReviewData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
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

          {/* Title and Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề đánh giá *</Label>
              <Input
                id="title"
                value={reviewData.title}
                onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Tóm tắt trải nghiệm của bạn"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitDate">Ngày ghé thăm *</Label>
              <Input
                id="visitDate"
                type="date"
                value={reviewData.visitDate}
                onChange={(e) => setReviewData(prev => ({ ...prev, visitDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Nội dung đánh giá *</Label>
            <Textarea
              id="content"
              value={reviewData.content}
              onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Chia sẻ chi tiết về trải nghiệm của bạn..."
              rows={4}
              maxLength={1000}
            />
            <div className="text-sm text-gray-500 text-right">
              {reviewData.content.length}/1000 ký tự
            </div>
          </div>

          {/* Detailed Aspects */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Đánh giá chi tiết</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(reviewData.aspects).map(([aspect, data]) => {
                const aspectLabels = {
                  food: 'Đồ ăn',
                  service: 'Dịch vụ',
                  atmosphere: 'Không gian',
                  value: 'Giá trị'
                };
                
                return (
                  <div key={aspect} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{aspectLabels[aspect as keyof typeof aspectLabels]}</Label>
                      <StarRating
                        rating={data.rating}
                        onRatingChange={(rating) => 
                          setReviewData(prev => ({
                            ...prev,
                            aspects: {
                              ...prev.aspects,
                              [aspect]: { ...prev.aspects[aspect as keyof typeof prev.aspects], rating }
                            }
                          }))
                        }
                        size="small"
                      />
                    </div>
                    <Textarea
                      value={data.comment}
                      onChange={(e) => 
                        setReviewData(prev => ({
                          ...prev,
                          aspects: {
                            ...prev.aspects,
                            [aspect]: { ...prev.aspects[aspect as keyof typeof prev.aspects], comment: e.target.value }
                          }
                        }))
                      }
                      placeholder={`Nhận xét về ${aspectLabels[aspect as keyof typeof aspectLabels].toLowerCase()}...`}
                      rows={2}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visit Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visitType">Loại hình ghé thăm</Label>
              <Select value={reviewData.visitType} onValueChange={(value) => setReviewData(prev => ({ ...prev, visitType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dine-in">Ăn tại chỗ</SelectItem>
                  <SelectItem value="takeaway">Mang về</SelectItem>
                  <SelectItem value="delivery">Giao hàng</SelectItem>
                  <SelectItem value="drive-through">Drive-through</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePaid">Số tiền thanh toán (VNĐ)</Label>
              <Input
                id="pricePaid"
                type="number"
                value={reviewData.pricePaid}
                onChange={(e) => setReviewData(prev => ({ ...prev, pricePaid: Number(e.target.value) }))}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupSize">Số người</Label>
              <Input
                id="groupSize"
                type="number"
                value={reviewData.groupSize}
                onChange={(e) => setReviewData(prev => ({ ...prev, groupSize: Number(e.target.value) }))}
                min="1"
                max="20"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Thẻ tag (tùy chọn)</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Thêm tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {reviewData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {reviewData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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