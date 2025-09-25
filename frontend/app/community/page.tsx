import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageCircle, Heart, Share2, Trophy, Camera } from "lucide-react"
import Link from "next/link"

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Users className="w-5 h-5" />
            <span className="font-medium">Cộng Đồng</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Kết Nối Cộng Đồng</h1>
          <p className="text-xl text-muted-foreground">Chia sẻ trải nghiệm và khám phá cùng cộng đồng Hòa Lạc</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Thảo Luận & Chia Sẻ
              </CardTitle>
              <CardDescription>Trao đổi kinh nghiệm với cộng đồng</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Đánh giá và review địa điểm</li>
                <li>• Chia sẻ hình ảnh món ăn</li>
                <li>• Hỏi đáp về địa điểm mới</li>
                <li>• Gợi ý cho người mới</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary" />
                Hệ Thống Điểm & Huy Hiệu
              </CardTitle>
              <CardDescription>Nhận thưởng khi đóng góp cho cộng đồng</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Foodie Expert - Chuyên gia ẩm thực</li>
                <li>• Local Guide - Hướng dẫn viên địa phương</li>
                <li>• Photo Master - Thợ chụp ảnh</li>
                <li>• Community Helper - Người hỗ trợ</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Hoạt Động Cộng Đồng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Chia Sẻ Ảnh</h3>
                <p className="text-sm text-muted-foreground">Đăng hình ảnh món ăn và địa điểm</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Thảo Luận</h3>
                <p className="text-sm text-muted-foreground">Tham gia các chủ đề hot trend</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Chia Sẻ</h3>
                <p className="text-sm text-muted-foreground">Lan tỏa những địa điểm tuyệt vời</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Tham Gia Cộng Đồng
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
