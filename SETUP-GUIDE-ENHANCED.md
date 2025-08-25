# RentParLo.pk - Enhanced Setup Guide

This guide provides detailed instructions for setting up the external services required for the RentParLo.pk platform, including Redis, Supabase, Google OAuth, and other environment configurations.

## Table of Contents
1. [Environment Variables](#environment-variables)
2. [Redis Setup](#redis-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Google OAuth Setup](#google-oauth-setup)
5. [Sanity CMS Configuration](#sanity-cms-configuration)
6. [Email Service Configuration](#email-service-configuration)
7. [Performance Monitoring](#performance-monitoring)

## Environment Variables

Create a `.env.local` file in the root directory of your project with the following variables:

```env
# Next.js Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RentParLo.pk

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Service (SMTP)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=noreply@rentparlo.pk

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token
SANITY_PREVIEW_SECRET=your_preview_secret

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=your_google_analytics_id

# Security
NEXTAUTH_SECRET=your_nextauth_secret
```

## Redis Setup

### Option 1: Local Redis Installation

1. **Install Redis**:
   - **Windows**: Download from [Redis for Windows](https://github.com/microsoftarchive/redis/releases)
   - **macOS**: `brew install redis`
   - **Linux**: `sudo apt-get install redis-server`

2. **Start Redis Server**:
   ```bash
   redis-server
   ```

3. **Verify Installation**:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

### Option 2: Cloud Redis (Recommended for Production)

1. **Choose a Cloud Provider**:
   - Redis Labs (Redis Cloud)
   - AWS ElastiCache
   - Google Cloud Memorystore
   - Azure Cache for Redis

2. **Create Redis Instance**:
   - Follow your provider's instructions to create a Redis instance
   - Note the connection endpoint and port

3. **Configure Security**:
   - Set up authentication with a strong password
   - Configure firewall rules to allow connections from your application

4. **Update Environment Variables**:
   ```env
   REDIS_URL=redis://username:password@your-redis-host:port
   ```

## Supabase Configuration

### 1. Project Setup

1. **Create a Supabase Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Create a new project
   - Note your Project URL and API keys

2. **Database Schema**:
   - The application expects specific tables to be created:
     - `users`
     - `seller_profiles`
     - `analytics_events`
     - `subscriptions`

3. **Authentication Providers**:
   - Enable Email/Password authentication
   - Enable Google OAuth (see Google OAuth section below)

### 2. Authentication Setup

1. **Email Templates**:
   - Customize email templates in Supabase Auth settings
   - Set site URL to your application URL

2. **Rate Limiting**:
   - Configure rate limiting for authentication endpoints in Supabase dashboard

### 3. Row Level Security (RLS)

1. **Enable RLS** on all tables:
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
   ```

2. **Create Policies**:
   ```sql
   -- Users can only view their own profile
   CREATE POLICY "Users can view own profile" ON users
   FOR SELECT USING (auth.uid() = id);

   -- Users can update their own profile
   CREATE POLICY "Users can update own profile" ON users
   FOR UPDATE USING (auth.uid() = id);
   ```

## Google OAuth Setup

### 1. Google Cloud Console Configuration

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google+ API**:
   - Navigate to APIs & Services > Library
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     ```
     http://localhost:3000/auth/callback
     https://yourdomain.com/auth/callback
     ```

4. **Note Client ID and Secret**:
   - Save the Client ID and Client Secret for environment variables

### 2. Supabase Auth Provider Configuration

1. **Enable Google Auth in Supabase**:
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Settings
   - Enable "Google" provider
   - Enter Google Client ID and Secret

2. **Configure Redirect URLs**:
   - Add your application URLs to the authorized redirect URLs

### 3. Environment Variables

Update your `.env.local` file:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Sanity CMS Configuration

### 1. Project Setup

1. **Create a Sanity Project**:
   - Install Sanity CLI: `npm install -g @sanity/cli`
   - Create project: `sanity init`
   - Follow prompts to create a new project

2. **Deploy Schema**:
   - Run the schema deployment script:
   ```bash
   npm run sanity:deploy
   ```

### 2. Dataset Configuration

1. **Create Datasets**:
   - Create a `production` dataset
   - Create a `staging` dataset for testing

2. **Import Sample Data** (Optional):
   ```bash
   sanity dataset import production
   ```

### 3. Environment Variables

Update your `.env.local` file:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token
SANITY_PREVIEW_SECRET=your_preview_secret
```

## Email Service Configuration

### Option 1: SMTP Provider

1. **Choose an SMTP Provider**:
   - SendGrid
   - Mailgun
   - Amazon SES
   - Gmail SMTP (for development)

2. **Configure SMTP Settings**:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your_sendgrid_api_key
   EMAIL_FROM=noreply@rentparlo.pk
   ```

### Option 2: Supabase Email Service

1. **Configure Supabase Email Templates**:
   - Customize templates in Supabase Auth settings
   - Set sender email address

2. **Enable Email Confirmations**:
   - In Supabase Auth settings, enable email confirmations
   - Configure email template for verification

## Performance Monitoring

### 1. Cache Monitoring

1. **Redis Monitoring**:
   - Use Redis CLI to monitor performance:
   ```bash
   redis-cli --stat
   redis-cli monitor
   ```

2. **Cache Hit Rate Tracking**:
   - The application includes built-in cache metrics tracking
   - Monitor cache hit rates through application logs

### 2. Application Performance

1. **Enable Logging**:
   - Set appropriate log levels in production
   - Monitor error rates and response times

2. **Performance Metrics**:
   - The application collects performance metrics automatically
   - Access metrics through the performance tracking API

### 3. Error Tracking

1. **Configure Error Reporting**:
   - Integrate with error tracking services like Sentry
   - Set up alerts for critical errors

## Testing the Setup

1. **Run the Application**:
   ```bash
   npm run dev
   ```

2. **Verify Services**:
   - Check that Redis connection is established
   - Test Google OAuth login
   - Verify Supabase authentication
   - Test Sanity CMS content loading

3. **Run Tests**:
   ```bash
   npm run test
   ```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**:
   - Ensure Redis server is running
   - Check REDIS_URL in environment variables
   - Verify firewall settings

2. **Google OAuth Not Working**:
   - Check Google Client ID and Secret
   - Verify redirect URIs in Google Cloud Console
   - Ensure Google+ API is enabled

3. **Supabase Authentication Errors**:
   - Check API keys in environment variables
   - Verify RLS policies
   - Check Supabase project settings

4. **Sanity CMS Content Not Loading**:
   - Check Sanity project ID and dataset
   - Verify API token permissions
   - Check network connectivity to Sanity CDN

### Support

For additional help, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Redis Documentation](https://redis.io/documentation)