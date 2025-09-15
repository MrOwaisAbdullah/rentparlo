import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WhatsAppButton } from "@/components/seller/whatsapp-button";
import { MessageCircle, HelpCircle, BookOpen, Zap } from "lucide-react";

export default function SupportPage() {
  const faqs = [
    {
      question: "How do I create a new listing?",
      answer:
        "To create a new listing, navigate to the 'Listings' section in your dashboard and click the 'Create Listing' button. You will be guided through a form to enter all the details about your rental item, including title, description, price, and photos.",
    },
    {
      question: "How can I improve my listing's performance?",
      answer:
        "Great photos are key! Use high-quality, well-lit images from multiple angles. Write a detailed and compelling description. Competitive pricing also helps. You can also use our 'Featured Listing' option to boost visibility.",
    },
    {
      question: "How does the seller tier system work?",
      answer:
        "Our seller tier system rewards active and reliable sellers. You earn points for positive reviews, quick response times, and the number of successful rentals. Higher tiers unlock benefits like lower service fees, better visibility, and a 'Top Seller' badge.",
    },
    {
      question: "What happens if a renter damages my item?",
      answer:
        "We recommend taking a security deposit for all rentals. In case of damage, first try to resolve the issue directly with the renter. If that fails, you can open a dispute through our Resolution Center, and our support team will mediate.",
    },
    {
      question: "How do I get paid for my rentals?",
      answer:
        "Currently, payments are handled directly between you and the renter. We are working on an integrated payment system to make this process smoother and more secure. We will notify you as soon as this feature is available.",
    },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Support & Help Center
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your guide to making the most of the RentParlo Seller Dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: FAQs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-6 w-6" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Contact & Resources */}
        <div className="space-y-8">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Can't find the answer you're looking for? Our support team is
                here to help.
              </p>
              <WhatsAppButton
                phoneNumber="923331234567"
                message="Hi, I need help with the RentParlo platform."
                sellerName="RentParlo Support"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Dashboard Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                The seller dashboard is your command center for managing your
                rental business on RentParlo.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                  <span>
                    <strong>Track Performance:</strong> Monitor views, contacts,
                    and conversion rates in real-time.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                  <span>
                    <strong>Manage Listings:</strong> Easily create, edit, and
                    track all your rental items from one place.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                  <span>
                    <strong>Gain Insights:</strong> Use our analytics to
                    understand what's working and how to improve.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
