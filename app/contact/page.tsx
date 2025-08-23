import { Metadata } from 'next';
import { ContactForm } from '@/components/forms/contact-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, MessageCircle, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | RentParLo.pk',
  description: 'Get in touch with RentParLo.pk team. We\'re here to help with your rental needs across Pakistan.',
  keywords: 'contact, support, help, RentParLo.pk, customer service, Pakistan',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're here to help! Reach out to us for any questions, support, or feedback about your rental experience.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-6 w-6 text-primary" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>

            {/* Contact Information - Takes 1 column */}
            <div className="space-y-6">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-6 w-6 text-primary" />
                    Get in Touch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Office Address</p>
                      <p className="text-sm text-muted-foreground">
                        123 Business District,<br />
                        Gulshan-e-Iqbal, Karachi<br />
                        Sindh, Pakistan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Phone Numbers</p>
                      <p className="text-sm text-muted-foreground">
                        +92 21 1234 5678<br />
                        +92 300 1234567
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Email Addresses</p>
                      <p className="text-sm text-muted-foreground">
                        support@rentparlo.pk<br />
                        info@rentparlo.pk
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    Support Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Customer Support</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      For general inquiries, account issues, or technical support.
                    </p>
                    <p className="text-sm font-medium">Response time: 24-48 hours</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Seller Support</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      For sellers who need help with listings, payments, or account management.
                    </p>
                    <p className="text-sm font-medium">Response time: 12-24 hours</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Emergency Support</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      For urgent issues related to safety, disputes, or payment problems.
                    </p>
                    <p className="text-sm font-medium">Response time: 2-6 hours</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <a 
                      href="/help" 
                      className="block text-sm text-primary hover:underline"
                    >
                      Help Center & FAQs
                    </a>
                    <a 
                      href="/about" 
                      className="block text-sm text-primary hover:underline"
                    >
                      About RentParLo.pk
                    </a>
                    <a 
                      href="/terms" 
                      className="block text-sm text-primary hover:underline"
                    >
                      Terms of Service
                    </a>
                    <a 
                      href="/privacy" 
                      className="block text-sm text-primary hover:underline"
                    >
                      Privacy Policy
                    </a>
                    <a 
                      href="/blog" 
                      className="block text-sm text-primary hover:underline"
                    >
                      Blog & Resources
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Find Our Office</h2>
            <p className="text-muted-foreground">
              Visit us at our office in Karachi for in-person support and consultations.
            </p>
          </div>
          
          {/* Placeholder for map - replace with actual map integration */}
          <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Interactive map coming soon<br />
                123 Business District, Gulshan-e-Iqbal, Karachi
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}