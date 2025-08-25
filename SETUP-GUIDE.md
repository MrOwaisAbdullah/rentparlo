# 🚀 RentParlo.pk Sanity-Supabase Integration Setup

## Quick Start

### 1. Database Setup
```bash
# 1. Copy schema to Supabase SQL Editor
# Execute: utils/supabase/schema.sql

# 2. Seed with sample data
# Execute: scripts/supabase-seed.sql
```

### 2. Sanity CMS Setup
```bash
# Deploy schemas and seed data
npx sanity deploy
npx sanity exec scripts/sanity-seed.js --with-user-token
```

### 3. Start Development
```bash
npm run dev
```

## Verification Checklist

### ✅ Supabase Database
- [ ] All tables created (users, seller_profiles, analytics_events, etc.)
- [ ] Sample users created (check `users` table)
- [ ] Seller profiles created (check `seller_profiles` table)
- [ ] Subscription packages created

### ✅ Sanity CMS
- [ ] Categories created (8 categories)
- [ ] Sample listings created (25+ listings)
- [ ] Blog posts created (3 posts)
- [ ] Homepage banners created (3 banners)

### ✅ Application Features
- [ ] Homepage displays real data
- [ ] Search functionality works
- [ ] Authentication flows work
- [ ] Listing details load correctly

## Key Integration Points

### Data Flow
```
Frontend → Supabase (Auth/Analytics) → Sanity (Content) → Frontend
```

### API Endpoints Created
- `/api/analytics` - Track user interactions
- `/api/listings` - CRUD operations for listings
- `/api/profile` - User profile management

### Authentication
- Middleware handles route protection
- User roles: user, seller, admin
- Session management via Supabase Auth

## Next Steps
1. Test all functionality
2. Deploy to production
3. Monitor analytics data
4. Implement additional features as needed