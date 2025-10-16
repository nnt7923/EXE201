'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { api } from '@/lib/api'
import { ReviewList } from '@/components/reviews/review-list'

interface Place {
  _id: string
  name: string
  rating: {
    average: number
    count: number
  }
}

export default function PlaceReviewsPage() {
  const params = useParams()
  const placeId = params.id as string
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const response = await api.getPlace(placeId)
        setPlace(response.data)
      } catch (error) {
        console.error('Error fetching place:', error)
      } finally {
        setLoading(false)
      }
    }

    if (placeId) {
      fetchPlace()
    }
  }, [placeId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!place) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy địa điểm</h1>
          <Link href="/places">
            <Button>Quay lại danh sách địa điểm</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/places/${placeId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Đánh giá về {place.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{place.rating.average.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">
                ({place.rating.count} đánh giá)
              </span>
            </div>
          </div>
          
          <Link href={`/reviews/write/${placeId}`}>
            <Button>
              Viết đánh giá
            </Button>
          </Link>
        </div>
      </div>

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Tất cả đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewList placeId={placeId} showFilters={true} />
        </CardContent>
      </Card>
    </div>
  )
}