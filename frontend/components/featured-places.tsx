import { ElementType, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, ParkingCircle, Wind, Dog, Ship, ShoppingBag, CreditCard } from "lucide-react"
import { api } from "@/lib/api"
import Image from "next/image"
import { Place } from "@/types"

const featureDisplay: { [key: string]: { name: string; icon: ElementType } } = {
  wifi: { name: "Wifi", icon: Wifi },
  parking: { name: "Bãi đỗ xe", icon: ParkingCircle },
  airConditioning: { name: "Điều hòa", icon: Wind },
  outdoor: { name: "Ngoài trời", icon: Ship }, // Using Ship as a placeholder, maybe find a better one
  petFriendly: { name: "Thú cưng", icon: Dog },
  delivery: { name: "Giao hàng", icon: Ship },
  takeaway: { name: "Mang về", icon: ShoppingBag },
  cardPayment: { name: "Thanh toán thẻ", icon: CreditCard },
};


export function FeaturedPlaces({ onPlaceSelect }: { onPlaceSelect: (place: Place) => void }) {
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    const fetchFeaturedPlaces = async () => {
      try {
        // Fetch top 4 rated places
                const response = await api.getPlaces({ limit: 4, sort: '-rating.average', category: 'restaurant,cafe' });
        if (response.data) {
          const fetchedPlaces = response.data.places || response.data;
          setPlaces(fetchedPlaces);
        }
      } catch (error) {
        console.error("Failed to fetch featured places:", error);
      }
    };
    fetchFeaturedPlaces();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Nổi bật hôm nay</h2>
        <p className="text-muted-foreground">Những địa điểm được yêu thích nhất</p>
      </div>

      <div className="space-y-4">
        {places.map((place) => (
          <Card key={place._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onPlaceSelect(place)}>
            <CardContent className="p-0">
              <div className="flex">
                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 relative">
                  <Image
                    src={place.images?.[0]?.url || "/placeholder.svg"}
                    alt={place.name}
                    fill
                    className="object-cover rounded-l-lg"
                  />
                </div>

                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground text-lg">{place.name}</h3>
                    <Badge
                      variant={
                        place.category === "restaurant"
                          ? "default"
                          : place.category === "accommodation"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {place.category === "restaurant" ? "Quán ăn" : place.category === "accommodation" ? "Nhà trọ" : "Cafe"}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 mb-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{place.rating?.average?.toFixed(1) || 'Mới'}</span>
                      <span className="text-muted-foreground">({place.rating?.count || 0})</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{place.address.district}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                     <span className="font-semibold text-primary">
                      {place.pricing ? `${place.pricing.minPrice/1000}k - ${place.pricing.maxPrice/1000}k` : 'N/A'}
                    </span>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      {place.features && Object.entries(place.features)
                        .filter(([, value]) => value)
                        .slice(0, 2)
                        .map(([key], index) => {
                          const feature = featureDisplay[key];
                          if (!feature) return null;
                          const Icon = feature.icon;
                          return (
                            <span key={index} className="flex items-center space-x-1">
                              <Icon className="w-3 h-3" />
                              {/* <span>{feature.name}</span> */}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
