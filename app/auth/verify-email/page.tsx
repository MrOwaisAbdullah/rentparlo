import { Metadata } from 'next';
import { Suspense } from 'react';
import { EmailVerificationContent } from '@/components/auth/email-verification-content';
import { AuthLayout } from '@/components/auth/auth-layout';

export const metadata: Metadata = {
  title: 'Verify Your Email | RentParLo',
  description: 'Please verify your email address to complete your account setup.'
};

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Check your email"
      subtitle="We've sent a verification link to your email address."
      showBackButton={false}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <EmailVerificationContent />
      </Suspense>
    </AuthLayout>
  );
}