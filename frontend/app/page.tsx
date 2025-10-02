'use client'

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { QuickSuggestions } from "@/components/quick-suggestions"
import { FeaturedPlaces } from "@/components/featured-places"
import dynamic from 'next/dynamic'
const LeafletMap = dynamic(() => import('@/components/simple-map'), { ssr: false })
import { CommunitySection } from "@/components/community-section"
import { Footer } from "@/components/footer"
import { api } from "@/lib/api"

// Define a simple type for Place for state management
interface Place {
  _id: string;
  name: string;
  address: {
    street?: string;
    ward?: string;
    district?: string;
  };
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
  rating?: { average: number; count: number };
}

export default function HomePage() {
  // Default center, e.g., Hoa Lac, Hanoi
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.0278, 105.8342]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await api.getPlaces({ limit: 100 }); // Fetch up to 100 places
        if (response.data) {
          setPlaces(response.data.places || response.data);
        }
      } catch (error) {
        console.error("Failed to fetch places:", error);
      }
    };
    fetchPlaces();
  }, []);

  const handleMarkerClick = (place: Place) => {
    setSelectedPlace(place);
    // Optional: center the map on the selected place
    // setMapCenter([place.address.coordinates.lat, place.address.coordinates.lng]);
  };

  const handleMyLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
          alert("Không thể lấy vị trí của bạn. Vui lòng kiểm tra cài đặt trình duyệt.");
        }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=vn`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      } else {
        alert("Không tìm thấy vị trí.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      alert("Tìm kiếm thất bại.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <QuickSuggestions />
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 py-12">
          <FeaturedPlaces onPlaceSelect={setSelectedPlace} />
          <LeafletMap 
            mapCenter={mapCenter}
            places={places}
            selectedPlace={selectedPlace}
            onMarkerClick={handleMarkerClick}
            userPosition={userPosition}
            onMyLocationClick={handleMyLocationClick}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>
        <CommunitySection />
      </main>
      <Footer />
    </div>
  )
}
