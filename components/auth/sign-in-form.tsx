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
import { signIn } from '@/app/auth/login/actions';
import { signInSchema, type SignInFormData } from '@/lib/validations/auth';
import { cn } from '@/lib/utils';

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

      // Create FormData for server action
      const formData = new FormData();
      formData.set('email', data.email);
      formData.set('password', data.password);
      formData.set('rememberMe', data.rememberMe.toString());
      
      if (redirectTo) {
        formData.set('redirectTo', redirectTo);
      }

      const result = await signIn(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        
        // Trigger success callback
        setTimeout(() => {
          onSuccess?.();
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
          const { signInWithGoogle } = await import('@/app/auth/login/actions');
          const result = await signInWithGoogle();
          
          if (result?.error) {
            setError(result.error);
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
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
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