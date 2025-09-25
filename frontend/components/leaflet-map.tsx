'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'; // <--- SỬA LỖI: Import CSS tĩnh ở đầu file
import { api } from '@/lib/api'

// Define a more specific Place interface for type safety
interface Place {
  _id: string;
  name: string;
  address: {
    coordinates: { lat: number; lng: number; };
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  category?: string;
  rating?: { average: number; count: number };
}

export default function LeafletMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any | null>(null) // L.Map is a better type
  const markersRef = useRef<any[]>([]) // L.Marker[] is a better type
  const mapInitializedRef = useRef(false) // Use ref to prevent re-initialization in Strict Mode

  const [searchQuery, setSearchQuery] = useState('')
  const [filterQuery, setFilterQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [radiusKm, setRadiusKm] = useState(3)
  const [category, setCategory] = useState('')

  const fetchAndRenderPlaces = useCallback(async (params: { lat: number; lng: number; search?: string; radius?: number; category?: string }) => {
    const map = mapRef.current;
    if (!map) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.getPlaces({
        lat: params.lat,
        lng: params.lng,
        radius: params.radius,
        search: params.search || undefined,
        category: params.category || undefined,
        limit: 100,
        sort: '-createdAt',
      });
      
      const places = (res as any)?.data?.places as Place[];
      
      // Clear existing markers before rendering new ones
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      if (Array.isArray(places)) {
        const L = await import('leaflet');
        places.forEach((p) => {
          const mk = L.marker([p.address.coordinates.lat, p.address.coordinates.lng]).addTo(map);
          const addr = [p.address.street, p.address.ward, p.address.district].filter(Boolean).join(', ');
          const rating = p.rating?.average ? `${p.rating.average.toFixed(1)}★ (${p.rating.count})` : 'Chưa có đánh giá';
          const html = `<div style="min-width:200px">
            <div style="font-weight:600;margin-bottom:4px">${p.name}</div>
            <div style="font-size:12px;color:#4b5563;margin-bottom:6px">${addr}</div>
            <div style="font-size:12px;margin-bottom:6px">${rating}</div>
            <a href="/places/${p._id}" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:#2563eb">Xem chi tiết →</a>
          </div>`;
          mk.bindPopup(html);
          markersRef.current.push(mk);
        });
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Không thể tải địa điểm');
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for one-time map initialization
  useEffect(() => {
    const initMap = async () => {
      if (mapContainerRef.current && !mapInitializedRef.current) {
        mapInitializedRef.current = true;

        const L = await import('leaflet');
        // await import('leaflet/dist/leaflet.css'); // <--- SỬA LỖI: Xóa dòng này

        const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
        const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
        const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
        
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

        const map = L.map(mapContainerRef.current).setView([21.0285, 105.8542], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        mapRef.current = map;
        
        // Initial data fetch
        fetchAndRenderPlaces({ lat: 21.0285, lng: 105.8542, radius: 3, category: '' });

        // Add event listener for map movement
        let refreshTimeout: NodeJS.Timeout;
        map.on('moveend zoomend', () => {
          clearTimeout(refreshTimeout);
          refreshTimeout = setTimeout(() => {
              const center = map.getCenter();
              fetchAndRenderPlaces({ 
                lat: center.lat, 
                lng: center.lng, 
                search: filterQuery, 
                radius: radiusKm, 
                category: category 
              });
          }, 250);
        });
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [category, fetchAndRenderPlaces, filterQuery, radiusKm]); // Dependencies added to reflect usage inside effect

  const handleMyPosition = () => {
    const map = mapRef.current;
    if (!map || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      import('leaflet').then(L => {
        L.marker([lat, lng]).addTo(map).bindPopup('<strong>Vị trí của bạn</strong>').openPopup();
      });
      map.setView([lat, lng], 15);
      fetchAndRenderPlaces({lat, lng, radius: radiusKm, category, search: filterQuery});
    }, (error) => {
      console.error("Error getting location:", error);
      alert('Không thể lấy được vị trí của bạn.');
    });
  };

  const handleGeocode = async () => {
    const q = searchQuery.trim();
    if (!q) return;

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
      const data: Array<{ lat: string; lon: string; display_name: string }> = await res.json();
      const map = mapRef.current;
      if (!map) return;
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        const L = await import('leaflet');
        L.marker([latNum, lonNum]).addTo(map).bindPopup(display_name).openPopup();
        map.setView([latNum, lonNum], 15);
        fetchAndRenderPlaces({ lat: latNum, lng: lonNum, radius: radiusKm, category, search: filterQuery });
      } else {
        alert('Không tìm thấy địa chỉ!');
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert('Đã xảy ra lỗi khi tìm kiếm địa chỉ.');
    }
  };

  const handleFilter = () => {
    const map = mapRef.current;
    if (!map) return;
    const center = map.getCenter();
    fetchAndRenderPlaces({ lat: center.lat, lng: center.lng, search: filterQuery, radius: radiusKm, category: category });
  };

  return (
    <div>
      <style>{`
        #leaflet-map { height: 520px; border-radius: 12px; z-index: 0; }
        .bar { margin: 10px 0; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .bar input, .bar button, .bar select { padding: 8px; border: 1px solid #ccc; border-radius: 6px; }
        .bar button { cursor: pointer; background-color: #007bff; color: white; border-color: #007bff; }
        .bar button:hover { background-color: #0056b3; }
      `}</style>
      <h2>Bản đồ tìm kiếm địa chỉ</h2>
      <div className="bar">
        <input
          id="search"
          placeholder="Tìm địa chỉ (VD: 1 Đại Cồ Việt, Hà Nội)"
          style={{width: '300px'}}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGeocode()}
        />
        <button id="btnSearch" onClick={handleGeocode}>Geocode</button>
        <input
          id="filter"
          placeholder="Lọc tên/địa chỉ trong DB"
          style={{width: '250px'}}
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
        />
        <button id="btnFilter" onClick={handleFilter}>Lọc</button>
      </div>
      <div className="bar">
        <button id="btnMyPos" onClick={handleMyPosition}>📍 Vị trí của tôi</button>
        {/* SỬA LỖI: Thêm logic fetch trực tiếp vào onChange */}
        <select value={radiusKm} onChange={(e) => {
          const newRadius = parseInt(e.target.value);
          setRadiusKm(newRadius);
          if (mapRef.current) {
            const center = mapRef.current.getCenter();
            fetchAndRenderPlaces({ lat: center.lat, lng: center.lng, search: filterQuery, radius: newRadius, category });
          }
        }}>
          <option value={1}>Bán kính 1 km</option>
          <option value={3}>Bán kính 3 km</option>
          <option value={5}>Bán kính 5 km</option>
          <option value={10}>Bán kính 10 km</option>
        </select>
        {/* SỬA LỖI: Thêm logic fetch trực tiếp vào onChange */}
        <select value={category} onChange={(e) => {
          const newCategory = e.target.value;
          setCategory(newCategory);
          if (mapRef.current) {
            const center = mapRef.current.getCenter();
            fetchAndRenderPlaces({ lat: center.lat, lng: center.lng, search: filterQuery, radius: radiusKm, category: newCategory });
          }
        }}>
          <option value="">Tất cả danh mục</option>
          <option value="restaurant">Nhà hàng</option>
          <option value="cafe">Cà phê</option>
          <option value="accommodation">Nhà trọ</option>
          <option value="entertainment">Giải trí</option>
          <option value="study">Học tập</option>
        </select>
      </div>
      {loading && <div style={{ margin: '8px 0' }}>Đang tải địa điểm...</div>}
      {error && <div style={{ margin: '8px 0', color: '#dc2626' }}>Lỗi: {error}</div>}
      <div id="leaflet-map" ref={mapContainerRef}></div>
    </div>
  )
}