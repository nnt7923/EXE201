'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, ThumbsUp, Calendar, Users, DollarSign, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
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
  helpful: {
    count: number;
    users: string[];
  };
  isVerified: boolean;
  response?: {
    content: string;
    respondedBy: {
      name: string;
    };
    respondedAt: string;
  };
  createdAt: string;
}

interface ReviewListProps {
  placeId: string;
  showFilters?: boolean;
  currentUserId?: string;
}

export default function ReviewList({ placeId, showFilters = false, currentUserId }: ReviewListProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, [placeId, sortBy, filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.getPlaceReviews(placeId, {
        sort: sortBy,
        rating: filterRating !== 'all' ? filterRating : undefined
      });
      // Fix: Access the reviews array from the nested data structure
      setReviews(response.data?.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải đánh giá. Vui lòng thử lại.",
        variant: "destructive"
      });
      // Set empty array on error to prevent map error
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (!currentUserId) {
      toast({
        title: "Thông báo",
        description: "Vui lòng đăng nhập để đánh dấu hữu ích",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.toggleReviewHelpful(reviewId);
      // Update local state
      setReviews(prev => prev.map(review => {
        if (review._id === reviewId) {
          const isCurrentlyHelpful = review.helpful.users.includes(currentUserId);
          return {
            ...review,
            helpful: {
              count: isCurrentlyHelpful ? review.helpful.count - 1 : review.helpful.count + 1,
              users: isCurrentlyHelpful 
                ? review.helpful.users.filter(id => id !== currentUserId)
                : [...review.helpful.users, currentUserId]
            }
          };
        }
        return review;
      }));
    } catch (error) {
      console.error('Error toggling helpful:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const StarRating = ({ rating, showNumber = true }: { rating: number; showNumber?: boolean }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      {showNumber && <span className="text-sm text-gray-600 ml-1">{rating}/5</span>}
    </div>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const visitTypeLabels = {
    'dine-in': 'Ăn tại chỗ',
    'takeaway': 'Mang về',
    'delivery': 'Giao hàng',
    'drive-through': 'Drive-through'
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h3 className="text-xl font-semibold">
            Đánh giá ({reviews.length})
          </h3>
          <div className="flex gap-2">
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Lọc theo sao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="5">5 sao</SelectItem>
                <SelectItem value="4">4 sao</SelectItem>
                <SelectItem value="3">3 sao</SelectItem>
                <SelectItem value="2">2 sao</SelectItem>
                <SelectItem value="1">1 sao</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="highest">Điểm cao nhất</SelectItem>
                <SelectItem value="lowest">Điểm thấp nhất</SelectItem>
                <SelectItem value="helpful">Hữu ích nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có đánh giá nào cho địa điểm này.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id} className="overflow-hidden">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{review.user.name}</h4>
                        {review.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Đã xác thực
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>

                {/* Title and Content */}
                <div className="mb-4">
                  <h5 className="font-semibold text-lg mb-2">{review.title}</h5>
                  <p className="text-gray-700 leading-relaxed">{review.content}</p>
                </div>

                {/* Detailed Aspects */}
                {Object.values(review.aspects).some(aspect => aspect.rating > 0) && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h6 className="font-medium mb-3">Đánh giá chi tiết:</h6>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(review.aspects).map(([key, aspect]) => {
                        if (aspect.rating === 0) return null;
                        const labels = {
                          food: 'Đồ ăn',
                          service: 'Dịch vụ',
                          atmosphere: 'Không gian',
                          value: 'Giá trị'
                        };
                        return (
                          <div key={key} className="text-center">
                            <div className="text-sm text-gray-600 mb-1">
                              {labels[key as keyof typeof labels]}
                            </div>
                            <StarRating rating={aspect.rating} showNumber={false} />
                            <div className="text-xs text-gray-500 mt-1">{aspect.rating}/5</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Visit Details */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Ghé thăm: {formatDate(review.visitDate)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {visitTypeLabels[review.visitType as keyof typeof visitTypeLabels]}
                    </Badge>
                  </div>
                  {review.groupSize > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {review.groupSize} người
                    </div>
                  )}
                  {review.pricePaid > 0 && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatPrice(review.pricePaid)}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Owner Response */}
                {review.response && (
                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="text-xs">
                        Phản hồi từ chủ sở hữu
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.response.respondedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{review.response.content}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHelpful(review._id)}
                    className={`flex items-center gap-2 ${
                      currentUserId && review.helpful.users.includes(currentUserId)
                        ? 'text-blue-600'
                        : 'text-gray-600'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Hữu ích ({review.helpful.count})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { ReviewList };