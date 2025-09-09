import { Metadata } from 'next';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';
import { SimplifiedRegisterForm } from '@/components/auth/simplified-register-form';

export const metadata: Metadata = {
  title: 'Create Account | RentParLo.pk',
  description: 'Create your RentParLo.pk account to start renting or listing items across Pakistan.',
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join thousands of users and sellers on RentParLo.pk"
      showBackButton
    >
      <SimplifiedRegisterForm />
      
      {/* Sign In Link */}
      <div className="text-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
        <p className="text-sm sm:text-base text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-primary font-medium hover:underline transition-all duration-200 hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}