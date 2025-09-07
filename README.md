# RentParlo.pk - Pakistan's Premier Rental Platform

Welcome to RentParlo.pk, Pakistan's most advanced rental marketplace platform. This repository contains the complete source code for our cutting-edge rental platform built with Next.js, TypeScript, Tailwind CSS, Sanity CMS, and Supabase.

## 🚀 Key Features

### 🏠 Comprehensive Rental Marketplace
- **Wide Category Coverage**: From electronics and vehicles to wedding halls and industrial equipment
- **Advanced Search & Filtering**: Location-based search with Pakistani city coverage, category filtering, price ranges, and condition filters
- **Verified Seller Program**: Multi-tier verification system with platinum, gold, and silver seller badges
- **Real-time Analytics**: Comprehensive dashboard for sellers to track listing performance

### 🎨 Modern UI/UX Design
- **Fully Responsive**: Mobile-first design optimized for all Pakistani devices and networks
- **Performance Optimized**: Sub-3-second load times even on 3G connections
- **Accessibility Focused**: WCAG 2.1 compliant with Urdu language support
- **Component-Based Architecture**: Reusable, maintainable UI components

### 🔐 Robust Authentication & Security
- **Multi-Factor Authentication**: Email, phone, and social login options
- **Role-Based Access Control**: User, seller, and admin permissions
- **Data Protection**: End-to-end encryption for sensitive information
- **Compliance**: GDPR and Pakistan Data Protection laws compliant

### 📱 Advanced Technology Stack
- **Next.js 14**: App Router with Server Components and Streaming
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom design system
- **Sanity CMS**: Structured content management for listings and marketing content
- **Supabase**: Real-time database, authentication, and file storage
- **Redis**: High-performance caching for Pakistani users

## 📁 Project Structure

```
rentparlo/
├── app/                    # Next.js App Router pages and API routes
├── components/             # Reusable UI components organized by category
├── hooks/                  # Custom React hooks
├── lib/                    # Business logic, utilities, and helper functions
├── public/                 # Static assets
├── sanity/                 # Sanity CMS configuration and schemas
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions and service integrations
├── docs/                  # Documentation and guides
└── scripts/                # Automation scripts and tools
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Sanity.io account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/rentparlo.git
cd rentparlo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure Supabase:
   - Create a new project in Supabase
   - Update the database schema using `utils/supabase/schema.sql`
   - Add your Supabase credentials to `.env.local`

5. Configure Sanity:
   - Create a new Sanity project
   - Deploy the schemas from `sanity/SchemaTypes/`
   - Add your Sanity credentials to `.env.local`

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📚 Documentation

### Core Documentation
- [System Architecture](docs/working_architecture.md) - Complete technical architecture and data flow
- [Development Guidelines](docs/development_guidelines.md) - Coding standards and best practices
- [Deployment Guide](docs/deployment_guide.md) - Production deployment instructions

### Feature Documentation
- [Banner System](docs/banner-system-usage.md) - Complete guide to the banner advertising system
- [Analytics System](docs/analytics_system.md) - Detailed analytics tracking and reporting
- [Authentication System](docs/authentication_system.md) - User authentication and authorization
- [Search System](docs/search_system.md) - Advanced search and filtering functionality
- [Seller Verification](docs/seller_verification.md) - Seller verification and tier system

### API Documentation
- [REST API](docs/api/rest_api.md) - RESTful API endpoints and usage
- [GraphQL API](docs/api/graphql_api.md) - GraphQL schema and queries
- [Webhooks](docs/api/webhooks.md) - Incoming and outgoing webhook integrations

## 🎯 Key Systems

### 1. Banner Advertising System
Our comprehensive banner advertising system supports:
- **22 Different Placements**: Homepage, category pages, search results, mobile, and more
- **10 Banner Sizes**: Leaderboard, medium rectangle, skyscraper, and custom sizes
- **Advanced Targeting**: Geographic, demographic, behavioral, and contextual targeting
- **Real-time Analytics**: Impressions, clicks, CTR, and conversion tracking
- **A/B Testing**: Split testing for campaign optimization
- **Fraud Detection**: Automated detection of suspicious activity

### 2. Analytics & Reporting
- **Real-time Dashboard**: Live performance metrics for sellers and admins
- **Behavioral Analytics**: User journey tracking and conversion funnel analysis
- **Performance Monitoring**: Uptime, response times, and error tracking
- **Business Intelligence**: Revenue tracking and forecasting

### 3. Content Management
- **Structured Content**: Listings, blog posts, categories, and marketing content
- **SEO Optimization**: Meta tags, structured data, and sitemap generation
- **Content Personalization**: Dynamic content based on user preferences
- **Multilingual Support**: English and Urdu language content

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](docs/contributing.md) before submitting pull requests.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Update documentation
6. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Write comprehensive tests
- Document new features
- Maintain accessibility standards
- Optimize for Pakistani network conditions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Sanity.io](https://www.sanity.io/) - Headless CMS
- [Supabase](https://supabase.io/) - Firebase alternative
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Reusable component library
- All our amazing contributors and the open-source community

## 📞 Support

For support, please open an issue on GitHub or contact our development team at tech@rentparlo.pk.

---

*RentParlo.pk - Rent Out Anything, Anywhere, Any Time*