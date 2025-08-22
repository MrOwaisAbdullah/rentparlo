import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import HeroSection from "@/components/sections/hero-section"
import CategoryCards from "@/components/sections/category-cards"
import ProductSwiper from "@/components/sections/product-swiper"
import Testimonials from "@/components/sections/testimonials"
import LocationLinks from "@/components/sections/location-links"
import AdBanner from "@/components/ads/ad-banner"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <HeroSection />

        <CategoryCards />

        <ProductSwiper title="RentParlo Projects" category="electronics" limit={8} trending={true} />

        <section className="py-8">
          <div className="container mx-auto px-4 flex justify-center">
            <AdBanner placement="homepage-top" />
          </div>
        </section>

        <ProductSwiper title="Popular Vehicles" category="vehicles" limit={6} />

        <ProductSwiper title="Camera & Photography Equipment" category="cameras" limit={8} />

        <Testimonials />

        <LocationLinks />
      </main>

      <Footer />
    </div>
  )
}
