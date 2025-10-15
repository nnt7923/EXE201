'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, MapPin, Settings, LogOut, Edit, Star, MessageCircle, Heart, Eye, Lock, Crown, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { api } from '@/lib/api'
import NotificationCenter from '@/components/notification-center'
import { SubscriptionPlan } from '@/types'

interface UserProfile {
  _id: string
  name: string
  email: string
  phone?: string
  address?: string
  avatar?: string
  role: string
  preferences: {
    favoriteCategories: string[]
    budget: {
      min: number
      max: number
    }
  }
  createdAt: string
  subscriptionPlan?: SubscriptionPlan;
  aiSuggestionsUsed?: number;
  subscriptionEndDate?: string;
}

interface UserPlace {
  _id: string
  name: string
  category: string
  subcategory: string
  rating: {
    average: number
    count: number
  }
  images: Array<{
    url: string
    alt: string
  }>
  createdAt: string
}

interface UserReview {
  _id: string
  place: {
    _id: string
    name: string
    category: string
  }
  rating: number
  title: string
  content: string
  createdAt: string
}

const getAISuggestionDisplay = (user: UserProfile | null) => {
  if (!user || !user.subscriptionPlan) {
    return {
      display: '0 / 0',
      progress: 0,
      showProgress: false
    };
  }

  const used = user.aiSuggestionsUsed || 0;
  const limit = user.subscriptionPlan.aiSuggestionLimit;

  if (limit === -1) {
    return {
      display: 'Không giới hạn',
      progress: 100,
      showProgress: false
    };
  }

  return {
    display: `${used} / ${limit}`,
    progress: (used / limit) * 100,
    showProgress: true
  };
};

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userPlaces, setUserPlaces] = useState<UserPlace[]>([])
  const [userReviews, setUserReviews] = useState<UserReview[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    fetchUserProfile()
    fetchUserPlaces()
    fetchUserReviews()
  }, [router])

  const fetchUserProfile = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.data && response.data.user) {
        setUser(response.data.user)
        setFormData({
          name: response.data.user.name,
          phone: response.data.user.phone || '',
          address: response.data.user.address || ''
        })
      }
    } catch (error) {
      console.error('Fetch profile error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPlaces = async () => {
    try {
      const response = await api.getUserPlaces('me');
      if (response.data) {
        setUserPlaces(response.data.places)
      }
    } catch (error) {
      console.error('Fetch user places error:', error)
    }
  }

  const fetchUserReviews = async () => {
    try {
      const response = await api.getUserReviews('me');
      if (response.data) {
        setUserReviews(response.data.reviews)
      }
    } catch (error) {
      console.error('Fetch user reviews error:', error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.updateProfile(formData);
      if (response.data) {
        setUser(response.data.user)
        setEditing(false)
        setSuccess('Cập nhật thông tin thành công')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.message || 'Cập nhật thất bại')
      }
    } catch (error) {
      setError('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error: any) {
      setPasswordError(error.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant': return '🍜'
      case 'cafe': return '☕'
      case 'accommodation': return '🏠'
      case 'entertainment': return '🎉'
      case 'study': return '📚'
      default: return '📍'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy thông tin người dùng</h1>
          <Link href="/auth/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ĂG</span>
              </div>
              <h1 className="text-xl font-bold">Ăn Gì Ở Đâu</h1>
            </Link>
            <div className="flex-1"></div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden">
              <div className="relative h-32 bg-cover bg-center" style={{ backgroundImage: "url('/vietnamese-bun-bo-hue-restaurant.png')" }}>
                <div className="absolute inset-0 bg-black/30" />
              </div>
              <CardContent className="p-6 text-center -mt-16">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-card">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-3xl">
                    {user.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                <Badge variant="secondary">
                  {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin liên hệ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{user.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>Tham gia từ {formatDate(user.createdAt)}</span>
                  </div>
              </CardContent>
            </Card>

            {user.subscriptionPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                    Gói Dịch Vụ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gói hiện tại</p>
                    <p className="text-lg font-semibold">{user.subscriptionPlan.name}</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-muted-foreground">Lượt gợi ý AI</p>
                      <p className="text-sm font-semibold">
                        {user.subscriptionPlan.aiSuggestionLimit === -1 
                          ? 'Không giới hạn' 
                          : `${user.aiSuggestionsUsed} / ${user.subscriptionPlan.aiSuggestionLimit}`}
                      </p>
                    </div>
                    {user.subscriptionPlan.aiSuggestionLimit !== -1 && (
                      <Progress value={((user.aiSuggestionsUsed || 0) / user.subscriptionPlan.aiSuggestionLimit) * 100} />
                    )}
                  </div>
                  {user.subscriptionEndDate && (
                     <div>
                      <p className="text-sm font-medium text-muted-foreground">Ngày hết hạn</p>
                      <p className="text-sm">{formatDate(user.subscriptionEndDate)}</p>
                    </div>
                  )}
                  <Link href="/pricing" className="!mt-6 block">
                    <Button className="w-full">Quản lý gói</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">Thông tin</TabsTrigger>
                <TabsTrigger value="places">Địa điểm của tôi</TabsTrigger>
                <TabsTrigger value="reviews">Đánh giá của tôi</TabsTrigger>
                <TabsTrigger value="notifications">Thông báo</TabsTrigger>
                <TabsTrigger value="security">Bảo mật</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Thông tin cá nhân</CardTitle>
                        <CardDescription>
                          Quản lý thông tin tài khoản của bạn
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setEditing(!editing)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {editing ? 'Hủy' : 'Chỉnh sửa'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {success && (
                      <Alert className="mb-4">
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {editing ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Họ và tên</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Số điện thoại</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Địa chỉ</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={loading}>
                            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                            Hủy
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Họ và tên</Label>
                          <p className="text-lg">{user.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                          <p className="text-lg">{user.email}</p>
                        </div>
                        {user.phone && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Số điện thoại</Label>
                            <p className="text-lg">{user.phone}</p>
                          </div>
                        )}
                        {user.address && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Địa chỉ</Label>
                            <p className="text-lg">{user.address}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="places" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Địa điểm của tôi</CardTitle>
                    <CardDescription>
                      Quản lý các địa điểm bạn đã tạo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userPlaces.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Chưa có địa điểm nào</h3>
                        <p className="text-muted-foreground mb-4">Bắt đầu tạo địa điểm đầu tiên của bạn</p>
                        <Link href="/places/new">
                          <Button>Tạo địa điểm mới</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userPlaces.map((place) => (
                          <div key={place._id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl">
                              {getCategoryIcon(place.category)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{place.name}</h3>
                              <p className="text-sm text-muted-foreground">{place.subcategory}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">{place.rating.average.toFixed(1)}</span>
                                  <span className="text-xs text-muted-foreground">({place.rating.count})</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(place.createdAt)}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/places/${place._id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Xem
                                </Button>
                              </Link>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Sửa
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Đánh giá của tôi</CardTitle>
                    <CardDescription>
                      Xem và quản lý các đánh giá bạn đã viết
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userReviews.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Chưa có đánh giá nào</h3>
                        <p className="text-muted-foreground mb-4">Bắt đầu viết đánh giá đầu tiên của bạn</p>
                        <Link href="/places">
                          <Button>Khám phá địa điểm</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userReviews.map((review) => (
                          <div key={review._id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold">{review.title}</h3>
                                <Link 
                                  href={`/places/${review.place._id}`}
                                  className="text-sm text-primary hover:underline"
                                >
                                  {review.place.name}
                                </Link>
                              </div>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{review.content}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(review.createdAt)}
                              </span>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Sửa
                                </Button>
                                <Button variant="outline" size="sm">
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Xem
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Thông báo của tôi
                    </CardTitle>
                    <CardDescription>
                      Xem tất cả thông báo về thanh toán và gói dịch vụ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <NotificationCenter />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Đổi mật khẩu</CardTitle>
                    <CardDescription>
                      Thay đổi mật khẩu của bạn. Nên sử dụng mật khẩu mạnh để tăng cường bảo mật.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {passwordSuccess && (
                      <Alert className="mb-4">
                        <AlertDescription>{passwordSuccess}</AlertDescription>
                      </Alert>
                    )}
                    {passwordError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={passwordLoading}>
                        {passwordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}