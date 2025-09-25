import { Card, CardContent } from "@/components/ui/card"
import { Clock, TrendingUp, Star, MapPin } from "lucide-react"

const suggestions = [
  {
    icon: Clock,
    title: "Hôm nay ăn gì?",
    description: "Gợi ý món ăn phù hợp với thời tiết",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: TrendingUp,
    title: "Trending hôm nay",
    description: "Những địa điểm hot nhất tuần này",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: Star,
    title: "Được đánh giá cao",
    description: "Top quán ăn 5 sao gần bạn",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    icon: MapPin,
    title: "Gần FPTU",
    description: "Tiện ích xung quanh trường học",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
]

export function QuickSuggestions() {
  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Gợi ý thông minh cho bạn</h2>
          <p className="text-muted-foreground">AI phân tích sở thích và đưa ra những gợi ý phù hợp nhất</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 rounded-lg ${suggestion.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <suggestion.icon className={`w-6 h-6 ${suggestion.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{suggestion.title}</h3>
                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
