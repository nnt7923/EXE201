'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Zap,
  Star,
  Gift
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Subscription {
  _id: string
  user: {
    _id: string
    name: string
    email: string
  }
  plan: {
    _id: string
    name: string
    price: number
    features: string[]
    description: string
    aiSuggestionLimit: number
  }
  status: 'pending' | 'active' | 'expired' | 'cancelled'
  paymentStatus: 'pending' | 'completed' | 'failed'
  startDate: string
  endDate: string
  pricing: {
    planPrice: number
    serviceFee: number
    taxes: number
    totalAmount: number
  }
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  paymentMethod: string
  customerNotes?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'expired':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="w-4 h-4" />
    case 'pending':
      return <Clock className="w-4 h-4" />
    case 'expired':
      return <XCircle className="w-4 h-4" />
    case 'cancelled':
      return <AlertTriangle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Đang hoạt động'
    case 'pending':
      return 'Chờ xử lý'
    case 'expired':
      return 'Đã hết hạn'
    case 'cancelled':
      return 'Đã hủy'
    default:
      return 'Không xác định'
  }
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getPaymentStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Đã thanh toán'
    case 'pending':
      return 'Chờ thanh toán'
    case 'failed':
      return 'Thanh toán thất bại'
    default:
      return 'Không xác định'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatCurrency = (amount: number | undefined | null) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 đ'
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const getDaysRemaining = (endDate: string) => {
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function UserSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getAllSubscriptions()
      
      if (response.success) {
        setSubscriptions(response.data || [])
      } else {
        setError(response.message || 'Không thể tải danh sách đăng ký')
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err)
      setError('Có lỗi xảy ra khi tải danh sách đăng ký')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có đăng ký nào
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn chưa đăng ký gói dịch vụ nào. Hãy khám phá các gói dịch vụ của chúng tôi!
            </p>
            <Link href="/pricing">
              <Button>
                <Crown className="w-4 h-4 mr-2" />
                Xem gói dịch vụ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Đăng ký của tôi</h2>
        <Link href="/pricing">
          <Button variant="outline">
            <Crown className="w-4 h-4 mr-2" />
            Nâng cấp gói
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {subscriptions.map((subscription) => {
          const daysRemaining = getDaysRemaining(subscription.endDate)
          const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0
          const isExpired = daysRemaining <= 0

          return (
            <Card key={subscription._id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      {subscription.plan?.name || 'Gói không xác định'}
                    </CardTitle>
                    <CardDescription>
                      {subscription.plan?.description || 'Không có mô tả'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(subscription.status)}>
                      {getStatusIcon(subscription.status)}
                      <span className="ml-1">{getStatusText(subscription.status)}</span>
                    </Badge>
                    <Badge className={getPaymentStatusColor(subscription.paymentStatus)}>
                      <CreditCard className="w-3 h-3 mr-1" />
                      {getPaymentStatusText(subscription.paymentStatus)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Thông tin thời gian */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Ngày bắt đầu</span>
                    </div>
                    <p className="font-medium">{formatDate(subscription.startDate)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Ngày hết hạn</span>
                    </div>
                    <p className="font-medium">{formatDate(subscription.endDate)}</p>
                    {subscription.status === 'active' && (
                      <div className="text-sm">
                        {isExpired ? (
                          <span className="text-red-600 font-medium">Đã hết hạn</span>
                        ) : isExpiringSoon ? (
                          <span className="text-orange-600 font-medium">
                            Còn {daysRemaining} ngày
                          </span>
                        ) : (
                          <span className="text-green-600">
                            Còn {daysRemaining} ngày
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Cảnh báo hết hạn */}
                {subscription.status === 'active' && isExpiringSoon && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      Gói dịch vụ của bạn sẽ hết hạn trong {daysRemaining} ngày. 
                      Hãy gia hạn để tiếp tục sử dụng dịch vụ.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Thông tin gói */}
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Tính năng gói
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(subscription.plan?.features || []).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Thông tin AI Suggestions */}
                  {subscription.plan?.aiSuggestionLimit && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        Lượt gợi ý AI
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Giới hạn</span>
                          <span className="font-medium">
                            {subscription.plan?.aiSuggestionLimit === -1 
                              ? 'Không giới hạn' 
                              : `${subscription.plan?.aiSuggestionLimit || 0} lượt`}
                          </span>
                        </div>
                        {subscription.plan?.aiSuggestionLimit !== -1 && (
                          <Progress value={0} className="h-2" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Thông tin thanh toán */}
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-500" />
                      Thông tin thanh toán
                    </h4>
                    <div className="space-y-4">
                      {/* Chi tiết giá nếu có pricing */}
                      {subscription.pricing && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Giá gói:</span>
                            <span>{formatCurrency(subscription.pricing.planPrice)}</span>
                          </div>
                          {subscription.pricing.serviceFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phí dịch vụ:</span>
                              <span>{formatCurrency(subscription.pricing.serviceFee)}</span>
                            </div>
                          )}
                          {subscription.pricing.taxes > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Thuế:</span>
                              <span>{formatCurrency(subscription.pricing.taxes)}</span>
                            </div>
                          )}
                          <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Tổng cộng:</span>
                            <span>{formatCurrency(subscription.pricing.totalAmount)}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Hiển thị đơn giản nếu không có pricing chi tiết */}
                      {!subscription.pricing && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Tổng tiền:</span>
                            <p className="font-semibold text-lg">
                              {formatCurrency(subscription.plan?.price)}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Phương thức:</span>
                          <p className="font-medium">{subscription.paymentMethod}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Trạng thái thanh toán:</span>
                          <Badge variant="outline" className={getPaymentStatusColor(subscription.paymentStatus)}>
                            {getPaymentStatusText(subscription.paymentStatus)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ghi chú */}
                {(subscription.customerNotes || subscription.adminNotes) && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="space-y-3">
                      {subscription.customerNotes && (
                        <div>
                          <h5 className="font-medium text-sm text-gray-600 mb-1">
                            Ghi chú của bạn:
                          </h5>
                          <p className="text-sm bg-gray-50 p-3 rounded-md">
                            {subscription.customerNotes}
                          </p>
                        </div>
                      )}
                      {subscription.adminNotes && (
                        <div>
                          <h5 className="font-medium text-sm text-gray-600 mb-1">
                            Ghi chú từ hệ thống:
                          </h5>
                          <p className="text-sm bg-blue-50 p-3 rounded-md">
                            {subscription.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {subscription.status === 'active' && (
                    <Link href="/pricing">
                      <Button variant="outline" size="sm">
                        Gia hạn gói
                      </Button>
                    </Link>
                  )}
                  {(subscription.status === 'expired' || subscription.status === 'cancelled') && (
                    <Link href="/pricing">
                      <Button size="sm">
                        <Crown className="w-4 h-4 mr-2" />
                        Đăng ký lại
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}