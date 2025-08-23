import { Metadata } from 'next';
import { Suspense } from 'react';
import { WelcomeContent } from '@/components/auth/welcome-content';
import { AuthLayout } from '@/components/auth/auth-layout';

export const metadata: Metadata = {
  title: 'Welcome to RentParLo | Complete Your Profile',
  description: 'Welcome to RentParLo! Complete your profile to get started.'
};

export default function WelcomePage() {
  return (
    <AuthLayout
      title="Welcome to RentParLo!"
      subtitle="Let's complete your profile to get you started."
      showBackButton={false}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <WelcomeContent />
      </Suspense>
    </AuthLayout>
  );
}