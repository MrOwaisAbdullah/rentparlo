import { Metadata } from 'next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export const metadata: Metadata = {
  title: 'Forgot Password | RentParLo',
  description: 'Reset your password to regain access to your RentParLo account.'
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      showBackButton
    >
      <div className="space-y-6">
        <ForgotPasswordForm />
        
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