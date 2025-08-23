import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">RP</span>
              </div>
              <span className="font-bold text-xl text-primary">RentParlo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Pakistan&apos;s leading rental marketplace. Rent anything, anywhere, anytime.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="#" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link
                href="/how-it-works"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                How It Works
              </Link>
              <Link href="/safety" className="block text-muted-foreground hover:text-foreground transition-colors">
                Safety Tips
              </Link>
              <Link href="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold">Popular Categories</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/category/automobiles"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Automobiles
              </Link>
              <Link
                href="/category/camera"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Camera
              </Link>
              <Link
                href="/category/medical-equipment"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Medical Equipment
              </Link>
              <Link
                href="/category/construction-equipment"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Construction Equipment
              </Link>
              <Link
                href="/category/events"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Events
              </Link>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Stay Connected</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@rentparlo.pk</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Karachi, Pakistan</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Newsletter</p>
              <div className="flex space-x-2">
                <Input placeholder="Your email" className="flex-1" />
                <Button size="sm">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">© 2025 RentParlo.pk. All rights reserved.</p>
          <div className="flex items-center space-x-4 text-sm">
            <Link href="/sitemap" className="text-muted-foreground hover:text-foreground transition-colors">
              Sitemap
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
