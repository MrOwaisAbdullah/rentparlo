import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export const metadata: Metadata = {
  title: 'Reset Password | RentParLo',
  description: 'Create a new password for your RentParLo account.'
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Create new password"
      subtitle="Your new password must be different from previous used passwords."
      showBackButton
    >
      <div className="space-y-6">
        <ResetPasswordForm />
        
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}