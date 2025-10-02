import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Heart, Share2, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const communityPosts = [
  {
    id: 1,
    user: {
      name: "Minh Anh",
      avatar: "/young-vietnamese-student-avatar.png",
      badge: "Local Guide",
    },
    content: "Vừa thử quán bún chả mới mở gần FPTU, ngon lắm mọi người ơi! Giá chỉ 30k thôi 😍",
    image: "/delicious-bun-cha-vietnamese-food.png",
    likes: 24,
    comments: 8,
    time: "2 giờ trước",
    tags: ["Bún chả", "FPTU", "Giá rẻ"],
  },
  {
    id: 2,
    user: {
      name: "Hoàng Nam",
      avatar: "/young-vietnamese-male-student-avatar.png",
      badge: "Foodie",
    },
    content: "Tìm bạn cùng phòng trọ gần khu công nghệ cao, phòng 2 người, có điều hòa. DM mình nhé!",
    likes: 15,
    comments: 12,
    time: "4 giờ trước",
    tags: ["Tìm bạn cùng phòng", "Hòa Lạc", "Sinh viên"],
  },
]

const trendingTopics = [
  { name: "Review quán ăn mới", posts: 45 },
  { name: "Tìm nhà trọ giá rẻ", posts: 32 },
  { name: "Cafe học bài", posts: 28 },
  { name: "Chia sẻ kinh nghiệm", posts: 19 },
]

export function CommunitySection() {
  return (
    <section className="py-12 px-4 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Cộng đồng Hòa Lạc</h2>
          <p className="text-muted-foreground">Chia sẻ kinh nghiệm và kết nối với mọi người</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Community Posts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">Bài viết mới nhất</h3>
              <Link href="/community">
                <Button variant="outline">Xem tất cả</Button>
              </Link>
            </div>

            {communityPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                      <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-foreground">{post.user.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {post.user.badge}
                        </Badge>
                        <span className="text-sm text-muted-foreground">• {post.time}</span>
                      </div>

                      <p className="text-foreground mb-3">{post.content}</p>

                      {post.image && (
                        <div className="mb-3">
                          <Image
                            src={post.image || "/placeholder.svg"}
                            alt="Post image"
                            width={512}
                            height={192}
                            className="w-full max-w-md h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                          <Share2 className="w-4 h-4" />
                          <span>Chia sẻ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trending Topics */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  <span>Chủ đề hot</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <Link key={index} href="/community">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <div>
                        <p className="font-medium text-foreground">#{topic.name}</p>
                        <p className="text-sm text-muted-foreground">{topic.posts} bài viết</p>
                      </div>
                      <Badge variant="outline">{index + 1}</Badge>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tham gia cộng đồng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Chia sẻ kinh nghiệm, đánh giá địa điểm và kết nối với cộng đồng Hòa Lạc
                </p>
                <Link href="/community">
                  <Button className="w-full">Đăng bài viết</Button>
                </Link>
                <Link href="/community">
                  <Button variant="outline" className="w-full bg-transparent">
                    Tham gia nhóm
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
