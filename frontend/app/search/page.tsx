'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, MapPin, Filter, Star, Clock, DollarSign, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import dynamic from 'next/dynamic'
import { Place } from '@/types'
import { DataPagination } from '@/components/ui/data-pagination'

interface Pagination {
  current: number
  pages: number
  total: number
  limit?: number
}

// Dynamically import the map component
const SimpleMap = dynamic(() => import('@/components/simple-map'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted flex items-center justify-center"><Loader2 className="animate-spin"/></div>
})

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

// --- MOCK DATA & HELPERS (from user's HTML) ---
const categories = {
  restaurant: 'Nhà hàng',
  cafe: 'Cà phê',
  accommodation: 'Nhà trọ',
  entertainment: 'Giải trí',
  study: 'Học tập'
}

const subcategories = {
  restaurant: ['Cơm tấm', 'Phở', 'Bún bò Huế', 'Bún chả', 'Bánh mì', 'Chả cá', 'Lẩu', 'Nướng', 'Hải sản', 'Đồ chay'],
  cafe: ['Cà phê truyền thống', 'Cà phê hiện đại', 'Trà sữa', 'Sinh tố', 'Nước ép', 'Smoothie'],
  accommodation: ['Phòng trọ', 'Ký túc xá', 'Homestay', 'Khách sạn mini', 'Căn hộ cho thuê'],
  entertainment: ['Karaoke', 'Game center', 'Cinema', 'Bowling', 'Billiards', 'Escape room'],
  study: ['Thư viện', 'Cà phê học bài', 'Co-working space', 'Lớp học', 'Trung tâm ngoại ngữ']
}

const featureOptions = [
  { key: 'wifi', label: 'WiFi' },
  { key: 'parking', label: 'Chỗ đỗ xe' },
  { key: 'airConditioning', label: 'Điều hòa' },
  { key: 'outdoor', label: 'Ngoài trời' },
  { key: 'petFriendly', label: 'Thú cưng' },
  { key: 'delivery', label: 'Giao hàng' },
  { key: 'takeaway', label: 'Mang về' },
  { key: 'cardPayment', label: 'Thanh toán thẻ' }
]

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
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

// --- SEARCH PAGE COMPONENT ---
export default function SearchPage() {
  // --- STATE MANAGEMENT ---
  const [searchQuery, setSearchQuery] = useState('')
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Tìm kiếm địa điểm hoặc áp dụng bộ lọc để bắt đầu')
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(12)
  
  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.0285, 105.8542]) // Default to Hanoi
  const [mapZoom, setMapZoom] = useState(13)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [nominatimMarker, setNominatimMarker] = useState<Place | null>(null)

  // Filter state
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    minPrice: 0,
    maxPrice: 1000000,
    rating: 0,
    features: [] as string[],
    sort: '-createdAt'
  })

  // --- API & SEARCH LOGIC ---
  const searchInDB = useCallback(async (query: string, page: number = currentPage, pageLimit: number = limit) => {
    try {
      const res = await api.getPlaces({
        search: query || undefined,
        category: filters.category || undefined,
        subcategory: filters.subcategory || undefined,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < 1000000 ? filters.maxPrice : undefined,
        rating: filters.rating > 0 ? filters.rating : undefined,
        features: filters.features.length > 0 ? filters.features : undefined,
        sort: filters.sort,
        page,
        limit: pageLimit,
      })
      if (res?.success && (res as any).data?.places) {
        const dbPlacesRaw = ((res as any).data.places) as any[];
        const dbPlaces = dbPlacesRaw.map(p => {
          if (p.location && p.location.coordinates) {
            return {
              ...p,
              address: {
                ...p.address,
                coordinates: {
                  lat: p.location.coordinates[1],
                  lng: p.location.coordinates[0]
                }
              }
            }
          }
          return p;
        }) as Place[];

        setPlaces(dbPlaces)
        
        // Handle pagination data
        if ((res as any).data?.pagination) {
          setPagination({
            current: (res as any).data.pagination.current,
            pages: (res as any).data.pagination.pages,
            total: (res as any).data.pagination.total,
            limit: pageLimit
          })
        }
        
        if (dbPlaces.length > 0) {
          const totalResults = (res as any).data?.pagination?.total || dbPlaces.length
          setMessage(`Tìm thấy ${totalResults} địa điểm trong database.`)
          const firstPlace = dbPlaces[0]
          if (firstPlace.address.coordinates) {
            setMapCenter([firstPlace.address.coordinates.lat, firstPlace.address.coordinates.lng])
            setMapZoom(14)
          }
        } else {
          setMessage('Không tìm thấy địa điểm nào trong database khớp với từ khóa.')
        }
      }
    } catch (error) {
      console.error('DB Search error:', error)
      setMessage('Lỗi khi tìm kiếm trong database.')
    }
  }, [filters, currentPage, limit])

  const handleSearch = async () => {
    if (!searchQuery) return

    setLoading(true)
    setPlaces([])
    setNominatimMarker(null)
    setMessage('Đang tìm kiếm...')

    // Step 1: Search with Nominatim (external geocoding)
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      const response = await fetch(nominatimUrl)
      const data: NominatimResult[] = await response.json()

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const newLat = parseFloat(lat)
        const newLng = parseFloat(lon)
        
        setMessage(`Tìm thấy trên bản đồ: ${display_name}`)
        setMapCenter([newLat, newLng])
        setMapZoom(16)
        
        // Create a temporary marker for the geocoded result
        setNominatimMarker({
          _id: `nominatim-${data[0].place_id}`,
          name: display_name,
          address: { coordinates: { lat: newLat, lng: newLng } },
        } as Place)

      } else {
        // Step 2: If Nominatim fails, search in our own DB
        setMessage('Không tìm thấy trên bản đồ, đang tìm trong database...')
        await searchInDB(searchQuery)
      }
    } catch (error) {
      console.error('Nominatim Search error:', error)
      setMessage('Lỗi khi tìm kiếm địa chỉ. Đang thử tìm trong database...')
      await searchInDB(searchQuery)
    } finally {
      setLoading(false)
    }
  }
  
  // Effect to run search when filters change
  useEffect(() => {
    // This search only triggers for filters, not the main search bar
    // The main search is triggered by the button click
    const searchOnFilterChange = async () => {
        setLoading(true);
        setNominatimMarker(null); // Clear nominatim marker on filter change
        await searchInDB(searchQuery);
        setLoading(false);
    }
    searchOnFilterChange();
  }, [filters, searchInDB, searchQuery]);

  // --- EVENT HANDLERS ---
  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleMyLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
        setMapZoom(16);
        setMessage('Đã định vị vị trí của bạn.');
      }, (error) => {
        console.error("Geolocation error:", error);
        setMessage('Không thể lấy được vị trí của bạn.');
      });
    } else {
      setMessage('Trình duyệt không hỗ trợ định vị.');
    }
  };

  const handleMarkerClick = (place: Place) => {
    setSelectedPlace(place);
    if (place.address.coordinates) {
      setMapCenter([place.address.coordinates.lat, place.address.coordinates.lng]);
      setMapZoom(15);
    }
  };

  // --- PAGINATION HANDLERS ---
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    if (searchQuery || Object.values(filters).some(v => v !== '' && v !== 0 && (!Array.isArray(v) || v.length > 0))) {
      searchInDB(searchQuery, page, limit)
    }
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setCurrentPage(1)
    if (searchQuery || Object.values(filters).some(v => v !== '' && v !== 0 && (!Array.isArray(v) || v.length > 0))) {
      searchInDB(searchQuery, 1, newLimit)
    }
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ĂG</span>
              </div>
              <h1 className="text-xl font-bold hidden md:block">Ăn Gì Ở Đâu</h1>
            </Link>
            
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm địa chỉ (VD: 1 Đại Cồ Việt) hoặc tên địa điểm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
              <span className="ml-2 hidden md:inline">Tìm kiếm</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline">Bộ lọc</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Column: Filters & Results */}
        <div className="w-full lg:w-[40%] xl:w-[35%] overflow-y-auto p-4 space-y-4">
          {/* Filters Panel */}
          <div className={`border-b ${showFilters ? 'block' : 'hidden'}`}>
            <Card>
              <CardHeader><CardTitle className="text-lg">Bộ lọc</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Danh mục</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? '' : value, subcategory: '' }))}>
                    <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {Object.entries(categories).map(([key, label]) => (<SelectItem key={key} value={key}>{label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Subcategory Filter */}
                {filters.category && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Loại hình</label>
                    <Select value={filters.subcategory} onValueChange={(value) => setFilters(prev => ({ ...prev, subcategory: value === 'all' ? '' : value }))}>
                      <SelectTrigger><SelectValue placeholder="Chọn loại hình" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {subcategories[filters.category as keyof typeof subcategories]?.map((sub) => (<SelectItem key={sub} value={sub}>{sub}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* Price Filter */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Giá: {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}</label>
                    <Slider value={[filters.minPrice, filters.maxPrice]} onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))} max={1000000} step={10000} />
                </div>
                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Đánh giá tối thiểu</label>
                  <Select value={filters.rating.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: parseInt(value) }))}>
                    <SelectTrigger><SelectValue placeholder="Chọn đánh giá" /></SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5].map(r => <SelectItem key={r} value={r.toString()}>{r > 0 ? `${r}+ sao` : 'Tất cả'}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {/* Features Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tính năng</label>
                  <div className="grid grid-cols-2 gap-2">
                    {featureOptions.map((feature) => (
                      <div key={feature.key} className="flex items-center space-x-2">
                        <Checkbox id={feature.key} checked={filters.features.includes(feature.key)} onCheckedChange={() => handleFeatureToggle(feature.key)} />
                        <label htmlFor={feature.key} className="text-sm">{feature.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {loading ? 'Đang tìm kiếm...' : message}
            </h2>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}><CardContent className="p-4"><div className="flex gap-4"><Skeleton className="w-24 h-24" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-2/3" /></div></div></CardContent></Card>
              ))
            ) : places.length === 0 && !nominatimMarker ? (
              <Card><CardContent className="p-8 text-center"><MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium mb-2">Không có kết quả</h3><p className="text-muted-foreground">Hãy thử một từ khóa tìm kiếm khác.</p></CardContent></Card>
            ) : (
              places.map((place) => (
                <Card key={place._id} className={`hover:shadow-md transition-shadow cursor-pointer ${selectedPlace?._id === place._id ? 'border-primary' : ''}`} onClick={() => handleMarkerClick(place)}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-muted">
                        {place.images?.[0] ? <Image src={place.images[0].url} alt={place.images[0].alt || place.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">{getCategoryIcon(place.category)}</div>}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{place.name}</h3>
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-1">{place.address.street}, {place.address.ward}, {place.address.district}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span>{place.rating?.average ? `${place.rating.average.toFixed(1)} (${place.rating.count})` : 'Chưa có đánh giá'}</span></div>
                          {place.distance && <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{place.distance.toFixed(1)}km</span></div>}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex gap-2"><Badge variant="secondary">{categories[place.category as keyof typeof categories]}</Badge><Badge variant="outline">{place.subcategory}</Badge></div>
                          <Link href={`/places/${place._id}`}><Button size="sm" variant="outline">Chi tiết</Button></Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && places.length > 0 && (
            <div className="mt-6">
              <DataPagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </div>
          )}
        </div>

        {/* Right Column: Map */}
        <div className="hidden lg:block flex-1 relative">
          <div className="absolute inset-0">
            <SimpleMap 
              mapCenter={mapCenter}
              zoomLevel={mapZoom}
              places={nominatimMarker ? [nominatimMarker, ...places] : places}
              selectedPlace={selectedPlace}
              onMarkerClick={handleMarkerClick}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              onMyLocationClick={handleMyLocationClick}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
