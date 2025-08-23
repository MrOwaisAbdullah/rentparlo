import HeroSection from "@/components/sections/hero-section"
import CategoryCards from "@/components/sections/category-cards"
import ProductSwiper from "@/components/sections/product-swiper"
import { Testimonials } from "@/components/testimonials"
import LocationLinks from "@/components/sections/location-links"
import AdBanner from "@/components/ads/ad-banner"
import { BlogSection } from "@/components/sections/blog-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
        <HeroSection />

        <CategoryCards />

        <ProductSwiper title="RentParlo Projects" category="automobiles" limit={8} trending={true} />

        <section className="py-8">
          <div className="container mx-auto px-4 flex justify-center">
            <AdBanner placement="homepage-top" />
          </div>
        </section>

        <ProductSwiper title="Popular Vehicles" category="automobiles" limit={6} />

        <ProductSwiper title="Camera & Photography Equipment" category="camera" limit={8} />

        <Testimonials />

        <BlogSection />

        <LocationLinks />

    </div>
  )
}
