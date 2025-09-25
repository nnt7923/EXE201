import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi } from "lucide-react"

const featuredPlaces = [
  {
    id: 1,
    name: "Bún Bò Huế Cô Ba",
    type: "restaurant",
    image: "/vietnamese-bun-bo-hue-restaurant.png",
    rating: 4.8,
    reviews: 124,
    price: "25k - 35k",
    distance: "0.5km",
    tags: ["Bún bò", "Đặc sản Huế", "Giá rẻ"],
    features: ["Wifi miễn phí", "Chỗ đỗ xe"],
  },
  {
    id: 2,
    name: "Nhà trọ Hòa Lạc Garden",
    type: "accommodation",
    image: "/modern-student-dormitory-room.png",
    rating: 4.6,
    reviews: 89,
    price: "1.2tr - 1.8tr/tháng",
    distance: "1.2km",
    tags: ["Phòng đơn", "Có gác", "An ninh tốt"],
    features: ["Điều hòa", "Nóng lạnh", "Thang máy"],
  },
  {
    id: 3,
    name: "Cafe Study Hub",
    type: "cafe",
    image: "/modern-study-cafe-with-students.png",
    rating: 4.7,
    reviews: 156,
    price: "15k - 45k",
    distance: "0.8km",
    tags: ["Học bài", "Yên tĩnh", "Wifi tốt"],
    features: ["Ổ cắm nhiều", "Không gian rộng"],
  },
]

export function FeaturedPlaces() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Nổi bật hôm nay</h2>
        <p className="text-muted-foreground">Những địa điểm được yêu thích nhất</p>
      </div>

      <div className="space-y-4">
        {featuredPlaces.map((place) => (
          <Card key={place.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-0">
              <div className="flex">
                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                  <img
                    src={place.image || "/placeholder.svg"}
                    alt={place.name}
                    className="w-full h-full object-cover rounded-l-lg"
                  />
                </div>

                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground text-lg">{place.name}</h3>
                    <Badge
                      variant={
                        place.type === "restaurant"
                          ? "default"
                          : place.type === "accommodation"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {place.type === "restaurant" ? "Quán ăn" : place.type === "accommodation" ? "Nhà trọ" : "Cafe"}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 mb-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-secondary fill-current" />
                      <span className="font-medium">{place.rating}</span>
                      <span className="text-muted-foreground">({place.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{place.distance}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {place.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">{place.price}</span>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      {place.features.slice(0, 2).map((feature, index) => (
                        <span key={index} className="flex items-center space-x-1">
                          {feature.includes("Wifi") && <Wifi className="w-3 h-3" />}
                          <span>{feature}</span>
                        </span>
                      ))}
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
