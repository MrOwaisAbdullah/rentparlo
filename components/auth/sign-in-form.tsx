'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, AlertCircle, Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth-actions';
import { signInSchema, type SignInFormData } from '@/lib/validations/auth';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SignInFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
  variant?: 'default' | 'modal' | 'inline';
  showSocialLogin?: boolean;
  autoFocus?: boolean;
}

export function SignInForm({ 
  onSuccess, 
  redirectTo, 
  className,
  variant = 'default',
  showSocialLogin = true,
  autoFocus = true
}: SignInFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = form;

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn({
        email: data.email,
        password: data.password
      });

      if (!result.success) {
        setError(result.error || 'Sign in failed');
      } else {
        setSuccess(true);
        
        // Trigger success callback or redirect
        setTimeout(() => {
          onSuccess?.();
          if (result.redirectTo && !onSuccess) {
            window.location.href = result.redirectTo;
          }
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(true);
      
      if (provider === 'google') {
        // Import the Google sign-in action dynamically
        try {
          const { signInWithGoogle } = await import('@/lib/auth-actions');
          const result = await signInWithGoogle();
          
          if (!result.success) {
            setError(result.error || 'Google sign-in failed');
          }
          // If successful, the action will redirect automatically
        } catch (importError) {
          setError('Google sign-in is not available yet');
        }
      } else {
        setError(`${provider} sign-in is not yet implemented`);
      }
    } catch (error) {
      setError(`Failed to sign in with ${provider}`);
      console.error(`${provider} sign-in error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={cn(
        "w-full max-w-md mx-auto",
        variant === 'modal' && "max-w-sm"
      )}>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-green-900">
              Welcome back!
            </h3>
            <p className="text-sm text-green-700 mb-4">
              You have been successfully signed in.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
              <p className="text-xs text-green-600">Redirecting you now...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full",
      variant === 'default' && "max-w-sm sm:max-w-md mx-auto",
      variant === 'modal' && "max-w-xs sm:max-w-sm",
      className
    )}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10 h-11 sm:h-12 text-base sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              disabled={isLoading}
              autoFocus={autoFocus}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm sm:text-base font-medium">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="pl-10 h-11 sm:h-12 text-base sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              disabled={isLoading}
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
              disabled={isLoading}
              {...register('rememberMe')}
            />
            <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
              Remember me
            </Label>
          </div>
          
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:underline transition-all duration-200 hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
            tabIndex={isLoading ? -1 : 0}
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 sm:h-12 text-base sm:text-sm font-medium group transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-primary/20"
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </div>
          ) : (
            <div className="flex items-center">
              Sign in
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </Button>

        {/* Social Sign In */}
        {showSocialLogin && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 sm:px-4 text-muted-foreground font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 sm:h-12 text-base sm:text-sm font-medium group transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
                onClick={() => handleSocialSignIn('google')}
              >
                <Image src="/google.png" alt="Google logo" width={16} height={16} className="mr-2" />
                Continue with Google
              </Button>
            </div>
          </>
        )}

        {/* Sign Up Link */}
        <div className="text-center pt-2">
          <p className="text-sm sm:text-base text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-primary font-medium hover:underline transition-all duration-200 hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
              tabIndex={isLoading ? -1 : 0}
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}