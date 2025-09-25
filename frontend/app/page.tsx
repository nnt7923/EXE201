import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { QuickSuggestions } from "@/components/quick-suggestions"
import { FeaturedPlaces } from "@/components/featured-places"
import dynamic from 'next/dynamic'
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), { ssr: false })
import { CommunitySection } from "@/components/community-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <QuickSuggestions />
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 py-12">
          <FeaturedPlaces />
          <LeafletMap />
        </div>
        <CommunitySection />
      </main>
      <Footer />
    </div>
  )
}
