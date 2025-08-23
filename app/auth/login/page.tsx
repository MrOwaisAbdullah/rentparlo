import { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/auth-layout';
import { SignInForm } from '@/components/auth/sign-in-form';

export const metadata: Metadata = {
  title: 'Sign In | RentParLo.pk',
  description: 'Sign in to your RentParLo.pk account to access listings and connect with sellers.',
};

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      showBackButton
    >
      <SignInForm />
    </AuthLayout>
  );
}