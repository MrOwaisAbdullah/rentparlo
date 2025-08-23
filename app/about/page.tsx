import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building2, 
  Users, 
  Target, 
  Heart, 
  Shield, 
  Zap, 
  Globe, 
  TrendingUp,
  Award,
  MapPin,
  Calendar,
  Mail,
  Linkedin
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | RentParLo.pk',
  description: 'Learn about RentParLo.pk - Pakistan\'s leading rental marketplace. Discover our mission, team, and commitment to connecting renters and sellers.',
  keywords: 'about RentParLo.pk, team, mission, vision, Pakistan rental marketplace, company',
};

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Ahmed Hassan',
      role: 'CEO & Co-Founder',
      description: 'Visionary leader with 10+ years in e-commerce and marketplace development across Pakistan.',
      avatar: '/team/ahmed.jpg',
      initials: 'AH',
      email: 'ahmed@rentparlo.pk',
      linkedin: '/in/ahmed-hassan'
    },
    {
      name: 'Fatima Khan',
      role: 'CTO & Co-Founder',
      description: 'Tech expert specializing in scalable platforms and user experience design.',
      avatar: '/team/fatima.jpg',
      initials: 'FK',
      email: 'fatima@rentparlo.pk',
      linkedin: '/in/fatima-khan'
    },
    {
      name: 'Usman Ali',
      role: 'Head of Operations',
      description: 'Operations specialist ensuring smooth marketplace transactions and customer satisfaction.',
      avatar: '/team/usman.jpg',
      initials: 'UA',
      email: 'usman@rentparlo.pk',
      linkedin: '/in/usman-ali'
    },
    {
      name: 'Sara Ahmed',
      role: 'Head of Marketing',
      description: 'Marketing strategist building brand presence and community engagement across Pakistan.',
      avatar: '/team/sara.jpg',
      initials: 'SA',
      email: 'sara@rentparlo.pk',
      linkedin: '/in/sara-ahmed'
    }
  ];

  const milestones = [
    {
      year: '2023',
      title: 'RentParLo.pk Founded',
      description: 'Started with a vision to revolutionize the rental market in Pakistan'
    },
    {
      year: '2024',
      title: '1,000+ Active Users',
      description: 'Reached our first major milestone with growing community'
    },
    {
      year: '2024',
      title: 'Multi-City Expansion',
      description: 'Expanded services to Karachi, Lahore, and Islamabad'
    },
    {
      year: '2024',
      title: 'Seller Program Launch',
      description: 'Launched comprehensive seller support and verification program'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              About RentParLo.pk
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're transforming how Pakistan rents and shares resources, creating a trusted marketplace 
              that connects communities and empowers economic opportunities across the nation.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To create Pakistan's most trusted and accessible rental marketplace, where individuals 
                  and businesses can easily rent, share, and monetize their assets while building 
                  stronger, more sustainable communities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To become the leading platform that transforms Pakistan's sharing economy, 
                  making quality items accessible to everyone while promoting sustainability 
                  and economic empowerment across all communities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do and shape our commitment to our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Trust & Safety</h3>
                <p className="text-sm text-muted-foreground">
                  Building secure, verified transactions with comprehensive safety measures.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Community First</h3>
                <p className="text-sm text-muted-foreground">
                  Prioritizing user experience and community needs in every decision.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Innovation</h3>
                <p className="text-sm text-muted-foreground">
                  Continuously improving through technology and user feedback.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Empowering users and sellers to grow their opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              RentParLo.pk was born from a simple observation: many valuable items sit unused in homes 
              and businesses across Pakistan, while others need access to these very items. We saw an 
              opportunity to bridge this gap, creating a platform that benefits both owners and renters 
              while promoting sustainable consumption.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">The Beginning</h3>
              <p className="text-muted-foreground mb-6">
                Founded in 2023 by a team of Pakistani entrepreneurs who experienced firsthand the 
                challenges of finding quality rental items. We started with a vision to create 
                Pakistan's first comprehensive rental marketplace that prioritizes trust, convenience, 
                and community impact.
              </p>
              
              <h3 className="text-2xl font-semibold mb-4">Today</h3>
              <p className="text-muted-foreground">
                We've grown to serve thousands of users across major Pakistani cities, facilitating 
                countless successful rentals and building a community that values sharing, sustainability, 
                and mutual support.
              </p>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <Badge variant="secondary" className="mt-1">
                        {milestone.year}
                      </Badge>
                      <div>
                        <h4 className="font-semibold mb-1">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Passionate professionals dedicated to revolutionizing Pakistan's rental market.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-lg">{member.initials}</AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {member.description}
                  </p>
                  
                  <div className="flex justify-center gap-2">
                    <a 
                      href={`mailto:${member.email}`}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                    <a 
                      href={`https://linkedin.com${member.linkedin}`}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Numbers that reflect our growing community and positive impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">1,500+</div>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">500+</div>
                <p className="text-sm text-muted-foreground">Verified Sellers</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">2,000+</div>
                <p className="text-sm text-muted-foreground">Successful Rentals</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">15+</div>
                <p className="text-sm text-muted-foreground">Cities Served</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Be part of Pakistan's rental revolution. Whether you're looking to rent or 
            share your items, we're here to make it simple, safe, and rewarding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/auth/register" 
              className="bg-background text-foreground px-6 py-3 rounded-md font-medium hover:bg-background/90 transition-colors"
            >
              Get Started Today
            </a>
            <a 
              href="/contact" 
              className="border border-primary-foreground/20 px-6 py-3 rounded-md font-medium hover:bg-primary-foreground/10 transition-colors"
            >
              Contact Our Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}