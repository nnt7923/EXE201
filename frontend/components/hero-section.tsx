import { Search, MapPin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-card to-background py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-secondary mr-2" />
          <span className="text-secondary font-medium">Trợ lý thông minh cho Hòa Lạc</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
          Khám phá <span className="text-primary">Hòa Lạc</span> cùng AI
        </h1>

        <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
          Tìm kiếm quán ăn ngon, nhà trọ tốt và địa điểm vui chơi với sự hỗ trợ của trí tuệ nhân tạo. Đơn giản, nhanh
          chóng và chính xác.
        </p>

        {/* Smart Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <MapPin className="w-4 h-4 text-secondary" />
            </div>
            <Link href="/search">
              <Input
                placeholder="Ví dụ: 'quán ăn ngon dưới 50k gần FPTU' hoặc 'nhà trọ yên tĩnh cho 2 người'"
                className="pl-16 pr-4 py-4 text-lg bg-background border-2 border-border focus:border-primary rounded-xl cursor-pointer"
                readOnly
              />
            </Link>
            <Link href="/search">
              <Button size="lg" className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-lg">
                Tìm kiếm
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/search?category=restaurant">
            <Button variant="outline" className="rounded-full bg-transparent">
              🍜 Quán ăn gần đây
            </Button>
          </Link>
          <Link href="/search?category=accommodation&maxPrice=2000000">
            <Button variant="outline" className="rounded-full bg-transparent">
              🏠 Nhà trọ giá rẻ
            </Button>
          </Link>
          <Link href="/search?category=cafe&subcategory=C%C3%A0%20ph%C3%AA%20hi%E1%BB%87n%20%C4%91%E1%BA%A1i&features=wifi">
            <Button variant="outline" className="rounded-full bg-transparent">
              ☕ Cafe học bài
            </Button>
          </Link>
          <Link href="/search?category=entertainment">
            <Button variant="outline" className="rounded-full bg-transparent">
              🎉 Địa điểm vui chơi
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
