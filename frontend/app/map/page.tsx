'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, MapPin, Star, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { api } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { Place } from '@/types'

// Dynamically import the map component to prevent SSR issues
const SimpleMap = dynamic(() => import('@/components/simple-map'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-muted"><p>Đang tải bản đồ...</p></div>
});

export default function MapPage() {
  const [allPlaces, setAllPlaces] = useState<Place[]>([])
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFilters, setShowFilters] = useState(true) // Show by default on desktop
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.0285, 105.8542]) // Default to Hanoi
  const [mapZoom, setMapZoom] = useState(13);
  const { toast } = useToast();

  const categories = {
    restaurant: 'Nhà hàng',
    cafe: 'Cà phê',
    accommodation: 'Nhà trọ',
    entertainment: 'Giải trí',
    study: 'Học tập'
  }

  // Fetch initial places on mount
  useEffect(() => {
    const fetchInitialPlaces = async () => {
      setLoading(true)
      try {
        const res = await api.getPlaces({ limit: 50, sort: '-createdAt' })
        if (res?.success && (res as any).data?.places) {
          const places = ((res as any).data.places) as Place[];
          setAllPlaces(places)
          setFilteredPlaces(places)
        }
      } catch (error) {
        console.error('Fetch places error:', error)
        toast({ title: "Lỗi", description: "Không thể tải danh sách địa điểm.", variant: "destructive" });
      } finally {
        setLoading(false)
      }
    }
    fetchInitialPlaces()
  }, [toast])

  // Handle filtering when category changes
  useEffect(() => {
    let filtered = allPlaces;
    if (selectedCategory) {
      filtered = filtered.filter(place => place.category === selectedCategory);
    }
    setFilteredPlaces(filtered);
  }, [selectedCategory, allPlaces]);


  // The core search logic as requested by the user
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      // If search is cleared, show all places based on the current category filter
      let filtered = allPlaces;
      if (selectedCategory) {
        filtered = allPlaces.filter(place => place.category === selectedCategory);
      }
      setFilteredPlaces(filtered);
      return;
    }

    // 1. Check if the location is already present on the map (in `allPlaces`)
    const clientSideResults = allPlaces.filter(place =>
      place.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (clientSideResults.length > 0) {
      setFilteredPlaces(clientSideResults);
      // Center map on the first result
      const firstResult = clientSideResults[0];
      if (firstResult.address.coordinates) {
        setMapCenter([firstResult.address.coordinates.lat, firstResult.address.coordinates.lng]);
        setMapZoom(15);
      }
      toast({ title: "Đã tìm thấy", description: `Tìm thấy ${clientSideResults.length} địa điểm có sẵn trên bản đồ.` });
      return;
    }

    // 2. If not found locally, check the database
    toast({ title: "Đang tìm kiếm...", description: "Kiểm tra trong cơ sở dữ liệu." });
    setLoading(true);
    try {
      const res = await api.getPlaces({ search: searchQuery, limit: 20 });
      const dbPlaces = (res as any)?.data?.places as Place[] || [];

      if (dbPlaces.length > 0) {
        // 3. If found in DB, add to map and show to user
        toast({ title: "Thành công", description: `Tìm thấy ${dbPlaces.length} địa điểm mới.` });
        
        // Add new places to the main list, avoiding duplicates
        const newPlaces = dbPlaces.filter(dp => !allPlaces.some(ap => ap._id === dp._id));
        setAllPlaces(prev => [...prev, ...newPlaces]);
        setFilteredPlaces(dbPlaces); // Show only the new search results

        // Center map on the first new result
        const firstResult = dbPlaces[0];
        if (firstResult.address.coordinates) {
          setMapCenter([firstResult.address.coordinates.lat, firstResult.address.coordinates.lng]);
          setMapZoom(15);
        }
      } else {
        // 4. If not found in DB either
        toast({ title: "Không tìm thấy", description: "Không có địa điểm nào khớp với tìm kiếm của bạn.", variant: "destructive" });
        setFilteredPlaces([]); // Clear results
      }
    } catch (error) {
      console.error('Database search error:', error);
      toast({ title: "Lỗi", description: "Đã xảy ra lỗi khi tìm kiếm trong cơ sở dữ liệu.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, allPlaces, selectedCategory, toast]);

  const handleMarkerClick = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleListItemClick = (place: Place) => {
    setSelectedPlace(place);
    if (place.address.coordinates) {
      setMapCenter([place.address.coordinates.lat, place.address.coordinates.lng]);
      setMapZoom(15);
    }
  };

  const handleMyLocationClick = () => {
    if (!navigator.geolocation) {
      toast({ 
        title: "Lỗi", 
        description: "Trình duyệt của bạn không hỗ trợ định vị.", 
        variant: "destructive" 
      });
      return;
    }

    toast({ 
      title: "Đang lấy vị trí", 
      description: "Đang xác định vị trí của bạn...", 
    });
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
        setMapZoom(15);
        toast({ 
          title: "Thành công", 
          description: "Đã định vị vị trí của bạn.", 
        });
      },
      (error) => {
        console.error("Error getting user location:", error);
        let errorMessage = "Không thể lấy vị trí của bạn.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Thông tin vị trí không khả dụng. Vui lòng kiểm tra kết nối mạng.";
            break;
          case error.TIMEOUT:
            errorMessage = "Hết thời gian chờ lấy vị trí. Vui lòng thử lại.";
            break;
          default:
            errorMessage = "Có lỗi xảy ra khi lấy vị trí. Vui lòng thử lại.";
            break;
        }
        
        toast({ 
          title: "Lỗi", 
          description: errorMessage, 
          variant: "destructive" 
        });
      },
      options
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant': return '🍜';
      case 'cafe': return '☕';
      case 'accommodation': return '🏠';
      case 'entertainment': return '🎉';
      case 'study': return '📚';
      default: return '📍';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ĂG</span>
              </div>
              <h1 className="text-xl font-bold">Ăn Gì Ở Đâu</h1>
            </Link>
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm địa điểm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 lg:hidden"
            >
              <Filter className="w-4 h-4" />
              Bộ lọc
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        <div className={`w-full md:w-80 lg:w-96 bg-background border-r transition-transform duration-300 absolute lg:static z-20 ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 space-y-4 h-full flex flex-col">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bộ lọc</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="text-sm font-medium mb-2 block">Danh mục</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    {Object.entries(categories).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">
                  Địa điểm ({filteredPlaces.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto">
                {loading && filteredPlaces.length === 0 ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                      </div>
                    ))}
                  </div>
                ) : filteredPlaces.length === 0 ? (
                  <div className="p-4 text-center h-full flex flex-col justify-center items-center">
                    <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Không tìm thấy địa điểm nào.</p>
                    <p className="text-xs text-muted-foreground">Thử tìm kiếm hoặc thay đổi bộ lọc.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredPlaces.map((place) => (
                      <div
                        key={place._id}
                        className={`p-3 cursor-pointer hover:bg-muted transition-colors border-b last:border-b-0 ${
                          selectedPlace?._id === place._id ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleListItemClick(place)}
                      >
                        <div className="flex gap-3">
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {place.images?.[0] ? (
                              <Image src={place.images[0].url} alt={place.images[0].alt || place.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">{getCategoryIcon(place.category)}</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{place.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{place.address.ward}, {place.address.district}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">{place.rating?.average ? place.rating.average.toFixed(1) : 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{place.pricing?.minPrice && place.pricing.minPrice > 0 ? formatPrice(place.pricing.minPrice) : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex-1 relative z-10">
          <SimpleMap 
            places={filteredPlaces}
            selectedPlace={selectedPlace}
            onMarkerClick={handleMarkerClick}
            mapCenter={mapCenter}
            zoomLevel={mapZoom}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
            onMyLocationClick={handleMyLocationClick}
          />
        </div>
      </div>

      {showFilters && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}
