'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Place {
  _id: string
  name: string
  category: string
  subcategory: string
  address: {
    street: string
    ward: string
    district: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  rating: {
    average: number
    count: number
  }
  pricing: {
    minPrice: number
    maxPrice: number
  }
  images: Array<{
    url: string
    alt: string
  }>
}

interface InteractiveMapProps {
  places?: Place[]
  selectedPlace?: Place | null
  onPlaceSelect?: (place: Place) => void
  center?: {
    lat: number
    lng: number
  }
  zoom?: number
  height?: string
}

export function InteractiveMap({ 
  places = [], 
  selectedPlace, 
  onPlaceSelect,
  center = { lat: 21.0285, lng: 105.8542 }, // Hòa Lạc coordinates
  zoom = 13,
  height = '400px'
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState(center)
  const [mapZoom, setMapZoom] = useState(zoom)

  const categories = {
    restaurant: { color: '#ef4444', icon: '🍜' },
    cafe: { color: '#f59e0b', icon: '☕' },
    accommodation: { color: '#3b82f6', icon: '🏠' },
    entertainment: { color: '#8b5cf6', icon: '🎉' },
    study: { color: '#10b981', icon: '📚' }
  }

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    // Simple map implementation using CSS and positioning
    // In a real app, you would use Google Maps, Mapbox, or Leaflet
    const mapElement = mapRef.current
    mapElement.innerHTML = ''

    // Create map container
    const mapContainer = document.createElement('div')
    mapContainer.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      position: relative;
      overflow: hidden;
      border-radius: 8px;
    `

    // Add grid pattern
    const gridPattern = document.createElement('div')
    gridPattern.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
      background-size: 20px 20px;
      opacity: 0.3;
    `
    mapContainer.appendChild(gridPattern)

    // Add center marker
    const centerMarker = document.createElement('div')
    centerMarker.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      background: #dc2626;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      z-index: 10;
    `
    mapContainer.appendChild(centerMarker)

    // Add place markers
    places.forEach((place, index) => {
      const marker = document.createElement('div')
      const categoryInfo = categories[place.category as keyof typeof categories] || { color: '#6b7280', icon: '📍' }
      
      // Calculate position (simplified - in real app use proper projection)
      const x = 50 + (place.address.coordinates.lng - center.lng) * 1000
      const y = 50 + (center.lat - place.address.coordinates.lat) * 1000
      
      marker.style.cssText = `
        position: absolute;
        left: ${Math.max(10, Math.min(90, x))}%;
        top: ${Math.max(10, Math.min(90, y))}%;
        width: 32px;
        height: 32px;
        background: ${categoryInfo.color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 5;
      `
      
      marker.innerHTML = categoryInfo.icon
      
      // Add hover effect
      marker.addEventListener('mouseenter', () => {
        marker.style.transform = 'scale(1.2)'
        marker.style.zIndex = '15'
      })
      
      marker.addEventListener('mouseleave', () => {
        marker.style.transform = 'scale(1)'
        marker.style.zIndex = '5'
      })
      
      // Add click handler
      marker.addEventListener('click', () => {
        onPlaceSelect?.(place)
      })
      
      mapContainer.appendChild(marker)
    })

    mapElement.appendChild(mapContainer)
    setMap(mapElement)
  }, [places, center, onPlaceSelect])

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(location)
        setMapCenter(location)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to retrieve your location.')
      }
    )
  }

  // Reset map view
  const resetMapView = () => {
    setMapCenter(center)
    setMapZoom(zoom)
  }

  // Zoom controls
  const zoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 18))
  }

  const zoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 1))
  }

  return (
    <div className="relative">
      {/* Map Container */}
      <div 
        ref={mapRef}
        style={{ height }}
        className="relative rounded-lg overflow-hidden border"
      />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={getUserLocation}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Navigation className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={zoomIn}
          className="bg-white/90 backdrop-blur-sm"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={zoomOut}
          className="bg-white/90 backdrop-blur-sm"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={resetMapView}
          className="bg-white/90 backdrop-blur-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-3">
            <h4 className="text-sm font-medium mb-2">Danh mục</h4>
            <div className="space-y-1">
              {Object.entries(categories).map(([key, info]) => {
                const count = places?.filter(p => p.category === key).length || 0
                if (count === 0) return null
                
                return (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                    <span>{info.icon}</span>
                    <span className="capitalize">{key}</span>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Place Info */}
      {selectedPlace && (
        <div className="absolute top-4 left-4 max-w-xs">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-3">
              <h4 className="font-medium text-sm mb-1">{selectedPlace.name}</h4>
              <p className="text-xs text-muted-foreground mb-2">
                {selectedPlace.address.street}, {selectedPlace.address.ward}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span>{selectedPlace.rating.average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-green-600">₫</span>
                  <span>
                    {selectedPlace.pricing.minPrice > 0 
                      ? `${selectedPlace.pricing.minPrice.toLocaleString()}đ`
                      : 'Liên hệ'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Info */}
      <div className="absolute bottom-4 right-4">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-2">
            <div className="text-xs text-muted-foreground">
              <div>Zoom: {mapZoom}x</div>
              <div>Địa điểm: {places?.length || 0}</div>
              {userLocation && (
                <div className="text-green-600">📍 Vị trí của bạn</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
