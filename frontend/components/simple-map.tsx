'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, LocateFixed } from 'lucide-react'
import { Place } from '@/types'

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom icon for user's location
const userLocationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDc3ZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjYiLz48L2N2Zz4=',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
    className: 'user-location-marker'
});

interface SimpleMapProps {
  places: Place[];
  selectedPlace: Place | null;
  onMarkerClick: (place: Place) => void;
  mapCenter: [number, number];
  zoomLevel?: number;
  userPosition?: [number, number] | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onMyLocationClick: () => void;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function PlaceMarkers({ places, onMarkerClick, selectedPlace }: Pick<SimpleMapProps, 'places' | 'onMarkerClick' | 'selectedPlace'>) {
    const markerRefs = useRef<{ [key: string]: L.Marker }>({});

    useEffect(() => {
        if (selectedPlace) {
            const marker = markerRefs.current[selectedPlace._id];
            if (marker) {
                marker.openPopup();
            }
        }
    }, [selectedPlace]);

    const validPlaces = places.filter(place => {
        // Handle both location.coordinates and address.coordinates structures
        const coords = place.location?.coordinates || 
                      (place.address?.coordinates ? [place.address.coordinates.lng, place.address.coordinates.lat] : null);
        if (!coords || coords.length !== 2) {
            console.error("Invalid or missing coordinates for place:", place);
            return false;
        }
        const [lng, lat] = coords;
        if (typeof lat !== 'number' || typeof lng !== 'number' || !isFinite(lat) || !isFinite(lng)) {
            console.error("Non-numeric or infinite coordinates for place:", place);
            return false;
        }
        return true;
    });

  return (
    <>
      {validPlaces.map((place) => {
        // Handle both coordinate structures
        const coords = place.location?.coordinates || 
                      (place.address?.coordinates ? [place.address.coordinates.lng, place.address.coordinates.lat] : null);
        if (!coords) return null;
        const [lng, lat] = coords;
        const addr = [place.address.street, place.address.ward, place.address.district].filter(Boolean).join(', ');
        const rating = place.rating?.average ? `${place.rating.average.toFixed(1)}★ (${place.rating.count})` : 'Chưa có đánh giá';

        return (
          <Marker
            key={place._id}
            position={[lat, lng]}
            eventHandlers={{
                click: () => onMarkerClick(place),
            }}
            ref={(ref) => {
                if (ref) {
                    markerRefs.current[place._id] = ref;
                }
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-semibold mb-1">{place.name}</div>
                <div className="text-xs text-gray-600 mb-1.5">{addr}</div>
                <div className="text-xs mb-1.5">{rating}</div>
                <a href={`/places/${place._id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                  Xem chi tiết →
                </a>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

function UserLocationMarker({ position }: { position: [number, number] }) {
    return <Marker position={position} icon={userLocationIcon}><Popup>Vị trí của bạn</Popup></Marker>;
}

function MapControls({ searchQuery, setSearchQuery, onSearch, onMyLocationClick }: Pick<SimpleMapProps, 'searchQuery' | 'setSearchQuery' | 'onSearch' | 'onMyLocationClick'>) {
    const handleSearchOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    }

    return (
        <div className="absolute top-2.5 right-2.5 z-[1000]">
            <div className="bg-white rounded-md shadow-md flex items-center p-1">
                <Input 
                    type="text" 
                    placeholder="Tìm kiếm vị trí..."
                    className="border-none focus:ring-0 w-48 md:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchOnEnter}
                />
                <Button size="icon" variant="ghost" onClick={onSearch} className="text-gray-600 hover:text-gray-900">
                    <Search className="h-5 w-5" />
                </Button>
                <div className="border-l h-6 mx-1"></div>
                <Button size="icon" variant="ghost" onClick={onMyLocationClick} className="text-gray-600 hover:text-gray-900">
                    <LocateFixed className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}

export default function SimpleMap({ places, selectedPlace, onMarkerClick, mapCenter, zoomLevel = 13, userPosition, searchQuery, setSearchQuery, onSearch, onMyLocationClick }: SimpleMapProps) {
  const mapIsReady = mapCenter && typeof mapCenter[0] === 'number' && typeof mapCenter[1] === 'number';
  
  // Default center if not ready, to prevent MapContainer from crashing.
  const initialCenter: [number, number] = mapIsReady ? mapCenter : [21.0278, 105.8342];

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden shadow-lg">
        {!mapIsReady && (
          <div className="absolute inset-0 h-full w-full flex items-center justify-center bg-gray-100 text-gray-500 z-[1001]">
            Đang tải bản đồ...
          </div>
        )}
        <MapContainer center={initialCenter} zoom={zoomLevel} style={{ height: '100%', width: '100%', visibility: mapIsReady ? 'visible' : 'hidden' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {mapIsReady && <ChangeView center={mapCenter} zoom={zoomLevel} />}
            {places && <PlaceMarkers places={places} onMarkerClick={onMarkerClick} selectedPlace={selectedPlace} />}
            {userPosition && <UserLocationMarker position={userPosition} />}
        </MapContainer>
        <MapControls 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onSearch={onSearch} 
            onMyLocationClick={onMyLocationClick} 
        />
    </div>
  )
}