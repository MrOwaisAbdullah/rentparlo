"use client"

const LOCATION_LINKS = [
  {
    id: "camera-karachi",
    label: "Rent Camera in Karachi",
    description: "Professional camera rentals in Karachi for photography and videography",
    query: "camera",
    city: "Karachi",
  },
  {
    id: "car-lahore",
    label: "Rent Car in Lahore",
    description: "Affordable car rentals in Lahore with flexible pickup options",
    query: "car",
    city: "Lahore",
  },
  {
    id: "lawn-manzoor",
    label: "Rent Lawn Equipment in Manzoor Colony, Karachi",
    description: "Garden tools and equipment rentals in Manzoor Colony",
    query: "lawn equipment",
    city: "Karachi",
    area: "Manzoor Colony",
  },
  {
    id: "ac-islamabad",
    label: "Rent AC in Islamabad",
    description: "Cool your home with AC rentals in Islamabad",
    query: "ac",
    city: "Islamabad",
  },
  {
    id: "washing-machine-faisalabad",
    label: "Rent Washing Machine in Faisalabad",
    description: "Convenient washing machine rentals in Faisalabad",
    query: "washing machine",
    city: "Faisalabad",
  },
  {
    id: "power-generator-rawalpindi",
    label: "Rent Power Generator in Rawalpindi",
    description: "Backup power solutions for homes and businesses in Rawalpindi",
    query: "power generator",
    city: "Rawalpindi",
  },
]

export default function LocationLinks() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Popular Rental Locations</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you need in your city or neighborhood
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {LOCATION_LINKS.map((link) => {
            const params = new URLSearchParams()
            params.append("query", link.query)
            params.append("city", link.city)
            if (link.area) params.append("area", link.area)

            return (
              <div
                key={link.id}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => (window.location.href = `/search?${params.toString()}`)}
              >
                <h3 className="text-xl font-semibold text-primary mb-2">{link.label}</h3>
                <p className="text-muted-foreground">{link.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
