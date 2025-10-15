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
    <section className="py-16 px-4 bg-gradient-to-br from-background via-card/20 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Cộng đồng Hòa Lạc ngay trên nền tảng
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Chia sẻ kinh nghiệm và kết nối với mọi người
          </p>
          <div className="mt-6 inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            Coming soon
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Community Posts */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-foreground">Bài viết mới nhất</h3>
              <Link href="/community">
                <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                  Xem tất cả
                </Button>
              </Link>
            </div>

            <div className="space-y-8">
              {communityPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    {/* User Info */}
                    <div className="flex items-center space-x-4 mb-6">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                        <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {post.user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-bold text-foreground text-lg">{post.user.name}</span>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {post.user.badge}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{post.time}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                      <p className="text-foreground text-lg leading-relaxed">{post.content}</p>
                    </div>

                    {/* Image */}
                    {post.image && (
                      <div className="relative mb-6 w-full aspect-[16/10] rounded-xl overflow-hidden bg-muted group-hover:scale-[1.02] transition-transform duration-300">
                        <Image
                          src={post.image || "/placeholder.svg"}
                          alt="Post image"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      {post.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="px-3 py-1 text-sm bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center space-x-8">
                        <button className="flex items-center space-x-2 text-muted-foreground hover:text-red-500 transition-colors group/like">
                          <Heart className="w-5 h-5 group-hover/like:scale-110 transition-transform" />
                          <span className="font-medium">{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 transition-colors group/comment">
                          <MessageCircle className="w-5 h-5 group-hover/comment:scale-110 transition-transform" />
                          <span className="font-medium">{post.comments}</span>
                        </button>
                      </div>
                      <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors group/share">
                        <Share2 className="w-5 h-5 group-hover/share:scale-110 transition-transform" />
                        <span className="font-medium">Chia sẻ</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-8">
            {/* Trending Topics */}
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <span>Chủ đề hot</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <Link key={index} href="/community">
                    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-primary/5 cursor-pointer transition-all duration-200 group">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          #{topic.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {topic.posts} bài viết
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="bg-primary/10 text-primary border-primary/20 font-bold"
                      >
                        {index + 1}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Join Community */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Tham gia cộng đồng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Chia sẻ kinh nghiệm, đánh giá địa điểm và kết nối với cộng đồng Hòa Lạc
                </p>
                <div className="space-y-3">
                  <Link href="/community">
                    <Button className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                      Đăng bài viết
                    </Button>
                  </Link>
                  <Link href="/community">
                    <Button 
                      variant="outline" 
                      className="w-full h-12 text-base font-semibold bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    >
                      Tham gia nhóm
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
