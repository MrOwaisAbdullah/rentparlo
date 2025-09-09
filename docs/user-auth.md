# User Authentication and Management Flow

This document outlines the comprehensive user authentication and management system for RentParlo.pk, covering registration, login, user types, data storage, and various user journey scenarios.

## 1. Core Authentication System

RentParlo.pk leverages **Supabase** for its authentication and database needs, providing secure user management, Row Level Security (RLS), and real-time data capabilities. **Sanity.io** is used for storing structured content, including sensitive verification documents.

## 2. User Registration Flow

The registration process is designed to accommodate both general users and sellers, with distinct paths and data collection requirements.

### 2.1. Registration Methods

Users can register through two primary methods:

1.  **Email and Password (Manual Registration)**:
    *   Accessed via `/auth/register`.
    *   Utilizes the `signUp` server action (`app/auth/login/actions.ts`).
    *   A multi-step form (`components/auth/register-form.tsx`) guides the user through the process.

2.  **Google OAuth**:
    *   Accessed via "Continue with Google" buttons on login/registration pages.
    *   Initiated by `signUpWithGoogle` or `signInWithGoogle` server actions (`app/auth/login/actions.ts`).
    *   Redirects to Google for authentication, then back to `/auth/callback`.

### 2.2. Registration Steps & Data Collection

The manual registration form is a multi-step process:

*   **Step 1: Account Type (`role`)**:
    *   Users select their primary role: `user` (renter) or `seller`.
    *   This choice dictates subsequent form fields and initial permissions.
    *   Component: `components/auth/role-selector.tsx`.

*   **Step 2: Profile Information**:
    *   **Full Name**: `name`
    *   **Email Address**: `email`
    *   **Phone Number**: `phone` (validated for Pakistani format: `03XX XXXXXXX`)
    *   **City**: `city` (dropdown of Pakistani cities)
    *   **Profile Image**: Users can optionally upload a profile image (`app/auth/upload-image/actions.ts`). This image is uploaded to Sanity.

*   **Step 3: Security (Credentials)**:
    *   **Password**: `password` (strong password requirements: min 8 chars, uppercase, lowercase, number).
    *   **Confirm Password**: `confirmPassword` (must match `password`).

*   **Step 4 (Conditional): Business Information (for Sellers)**:
    *   **Business Name**: `businessName` (optional).
    *   **CNIC Number**: `cnic` (required, validated for Pakistani format: `XXXXX-XXXXXXX-X`). This is crucial for seller verification.
    *   **Business Address**: `address` (optional).

*   **Step 5: Terms & Conditions**:
    *   Users must agree to the Terms of Service and Privacy Policy.

### 2.3. Post-Registration Flow

1.  **Email Verification**:
    *   After successful manual registration, users are redirected to `/auth/verify-email`.
    *   A verification link is sent to their registered email address.
    *   The `app/auth/confirm/route.ts` handles the OTP verification when the user clicks the link.
    *   Until verified, `email_verified` in `public.users` remains `false`.

2.  **Onboarding (`/auth/welcome`)**:
    *   New users (especially those registering via Google OAuth, or manual users who haven't completed it) are directed to `/auth/welcome`.
    *   This page (`app/auth/welcome/page.tsx`, `components/auth/welcome-flow.tsx`) ensures essential profile details (name, phone, city, role) are captured or confirmed.
    *   Upon completion, `onboarding_completed` in `public.users` is set to `true`.

## 3. User Login Flow

Users can log in using their registered credentials or social accounts.

### 3.1. Login Methods

1.  **Email and Password**:
    *   Accessed via `/auth/login`.
    *   Utilizes the `signIn` server action (`app/auth/login/actions.ts`).
    *   "Remember me" option is available to persist sessions.

2.  **Google OAuth**:
    *   Accessed via "Continue with Google" button on the login page.
    *   Initiated by `signInWithGoogle` server action (`app/auth/login/actions.ts`).
    *   Redirects to Google, then back to `/auth/callback`.

### 3.2. OAuth Callback (`/auth/callback`)

This route (`app/auth/callback/route.ts`) is central to OAuth flows:

*   **New OAuth User**: If a user logs in via OAuth for the first time, a new entry is created in `public.users` with default values (e.g., `role: 'user'`, `onboarding_completed: false`). They are then redirected to `/auth/welcome` for onboarding. Their profile image from Google is also stored.
*   **Existing OAuth User**: The system checks if the user already exists in `public.users`. If so, their `last_login` and `login_count` are updated. Their profile image from Google is also updated if it has changed. They are then redirected to `/dashboard` (or a `next` parameter if specified).

### 3.3. Password Management

*   **Forgot Password**: Users can initiate a password reset from `/auth/forgot-password`. An email with a reset link is sent.
*   **Reset Password**: The reset link directs users to `/auth/reset-password`, where they can set a new password.

## 4. User Data Storage

User and seller data are distributed across Supabase (Auth and Database) and Sanity.

### 4.1. Supabase `auth.users`

*   **Purpose**: Stores core authentication data managed by Supabase's internal auth system.
*   **Key Fields**: `id` (UUID), `email`, `email_confirmed_at`, `phone`, `user_metadata` (e.g., `full_name`, `avatar_url` from OAuth).

### 4.2. Supabase `public.users`

*   **Purpose**: Stores public user profile information and system-specific user attributes. This table has a foreign key relationship with `auth.users(id)`.
*   **Key Fields**:
    *   `id` (UUID, references `auth.users.id`)
    *   `email`, `name`, `phone`, `city`, `country` (default 'Pakistan')
    *   `role` (`user`, `seller`, `admin`)
    *   `profile_image_url` (URL to image stored in Sanity)
    *   `is_verified`, `email_verified`, `phone_verified`
    *   `active`, `account_status` (`active`, `suspended`, `pending`, `deactivated`)
    *   `onboarding_completed` (boolean flag for onboarding flow)
    *   `last_login`, `login_count`
    *   `notification_preferences` (JSONB)
    *   `privacy_settings` (JSONB)
    *   `preferred_language`, `timezone`

### 4.3. Supabase `public.seller_profiles`

*   **Purpose**: Stores detailed information specific to seller accounts. This table has a foreign key relationship with `public.users(id)`.
*   **Key Fields**:
    *   `id` (UUID, references `public.users.id`)
    *   `username`, `business_name`, `owner_name`, `owner_cnic` (unique, validated format)
    *   `address_line1`, `city`, `state`, `country`
    *   `phone`, `email`, `avatar_url`
    *   `is_verified`, `is_top_seller`
    *   `tier`, `tier_points`, `tier_last_updated` (for seller reputation system)
    *   `verification_status` (`pending`, `approved`, `rejected`)
    *   `verification_documents` (JSONB, references Sanity document IDs for uploaded docs)
    *   `response_time_avg`, `customer_rating`, `total_reviews`

### 4.4. Sanity `verificationDocument`

*   **Purpose**: Securely stores sensitive documents like CNIC images and business licenses for seller verification.
*   **Key Fields**: `sellerId` (Supabase user ID), `documentType`, `fileAsset` (the image/PDF file), `verificationStatus`, `rejectionReason`, `verifiedBy`, `verifiedAt`.

## 5. Redirections and Access Control

### 5.1. Redirection Logic

*   **Successful Manual Registration**: `/auth/verify-email`
*   **Successful Email Verification**: `next` parameter (if present) or `/` (homepage).
*   **Successful OAuth Login/Signup**:
    *   If new user or `onboarding_completed` is `false`: `/auth/welcome`.
    *   If existing user and `onboarding_completed` is `true`: `/dashboard` (default) or the `next` parameter.
*   **Successful Login (Email/Password)**: `redirectTo` parameter (if present) or `/` (homepage).
*   **Successful Password Reset**: `/auth/login?message=password-updated`.
*   **Logout**: `/` (homepage).
*   **Unauthenticated Access to Protected Routes**: Redirected to `/auth/login`.

### 5.2. Role-Based Access and Banning

*   **User Roles**: The `role` field in `public.users` (`user`, `seller`, `admin`) dictates access to certain features and pages.
*   **Seller Access**: Sellers gain access to the `/dashboard` and `/seller/*` routes for managing listings, viewing analytics, etc.
*   **Admin Access**: Admins have full control over user management, content, and platform settings, typically via a dedicated admin dashboard.
*   **Banned/Suspended Users**: The `account_status` field in `public.users` (`active`, `suspended`, `deactivated`) is crucial. Middleware or server-side checks would restrict access for `suspended` or `deactivated` accounts, potentially redirecting them to an error page (`/auth/error`) or a specific "account suspended" page.
*   **Email Not Verified**: Users with `email_verified: false` are typically restricted from core functionalities (e.g., creating listings, contacting sellers) until verification is complete, often being redirected to `/auth/verify-email`.

## 6. Security Considerations

*   **Rate Limiting**: `signIn` and `signUp` actions implement rate limiting (`createRateLimiter`) to prevent brute-force attacks.
*   **Input Validation**: Zod schemas (`lib/validations/auth.ts`) are used for robust server-side and client-side validation of all form data.
*   **Input Sanitization**: `sanitizeFormData` (`lib/security/sanitization.ts`) is applied to clean user inputs.
*   **Row Level Security (RLS)**: Supabase RLS policies (`utils/supabase/schema.sql`) are strictly enforced to ensure users can only access and modify their own data, and admins have appropriate privileges.
*   **Security Logging**: Critical authentication events (login attempts, sign-up, OAuth flows, logout) are logged (`logSecurityEvent`) for auditing and security monitoring.
*   **Password Hashing**: Supabase handles password hashing automatically, ensuring passwords are never stored in plain text.

## 7. Error Handling

*   **Authentication Errors**: The `app/auth/error/page.tsx` provides a user-friendly interface for various authentication failures (e.g., `access_denied`, `invalid_request`, `server_error`), offering suggestions and links to support.
*   **Form Validation Errors**: Real-time and submission-time validation errors are displayed directly on the forms (`components/auth/register-form.tsx`, `components/auth/sign-in-form.tsx`).
*   **API Errors**: Server actions return `success: false` and an `error` message for display to the user.

This comprehensive system ensures a secure, robust, and user-friendly authentication experience for all RentParlo.pk users.
