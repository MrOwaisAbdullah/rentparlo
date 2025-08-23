"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

const TESTIMONIALS = [
  {
    id: 1,
    name: "Ahmed Khan",
    location: "Karachi",
    content: "Very kind and helpful. Knowledgeable and flexible. Perfect service!",
    product: "Professional Carpet Cleaning Machine + cleaning tablets",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    location: "Lahore",
    content: "Great platform for renting items. The owner was amazing, could not fault anything.",
    product: "Portable Power Station 500W/220V Solar Generator",
  },
  {
    id: 3,
    name: "Ali Hassan",
    location: "Islamabad",
    content: "Camera was awesome. A beast of a camera with the perfect lens combo.",
    product: "Canon EOS R5 + Canon 70-200 f2.8 II",
  },
  {
    id: 4,
    name: "Fatima Sheikh",
    location: "Faisalabad",
    content: "Everything was a smooth transaction. Highly recommend this platform.",
    product: "Sony a7iii mirrorless 4k camera full frame + 28-70 mm zoom lens",
  },
  {
    id: 5,
    name: "Muhammad Usman",
    location: "Rawalpindi",
    content: "Great item and communicating with the owner was a breeze!",
    product: "Sony A7III Camera with Tamron 28mm - 75mm Lens",
  },
  {
    id: 6,
    name: "Ayesha Khan",
    location: "Multan",
    content: "Owner is always helpful and communicates well, cannot recommend enough.",
    product: "Canon RF 24-70mm F2.8 Professional Lens",
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Here&apos;s what some of our users think</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Real experiences from real users across Pakistan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < 4 ? "text-yellow-500 fill-current" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <CardTitle className="text-lg line-clamp-2">{testimonial.content}</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="font-medium">{testimonial.name}</p>
                {testimonial.location && <p className="text-sm text-muted-foreground">{testimonial.location}</p>}
              </CardContent>

              <CardFooter className="mt-auto pt-4 border-t">
                <p className="text-sm text-muted-foreground italic line-clamp-1">Rented: {testimonial.product}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
