'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUpSimplified, signInWithGoogle } from '@/lib/auth-actions';
import { simplifiedRegistrationSchema, type SimplifiedRegistrationFormData } from '@/lib/validations/auth';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SimplifiedRegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
  variant?: 'default' | 'modal' | 'inline';
  showSocialLogin?: boolean;
  autoFocus?: boolean;
}

export function SimplifiedRegisterForm({ 
  onSuccess, 
  redirectTo, 
  className,
  variant = 'default',
  showSocialLogin = true,
  autoFocus = true
}: SimplifiedRegisterFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const form = useForm<SimplifiedRegistrationFormData>({
    resolver: zodResolver(simplifiedRegistrationSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = form;

  const onSubmit = async (data: SimplifiedRegistrationFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signUpSimplified({
        email: data.email,
        password: data.password,
        name: data.email.split('@')[0], // Generate name from email
        phone: '', // Will be collected during onboarding
        city: 'Karachi', // Default city, will be updated during onboarding
        role: 'user' // Default role, will be selected during onboarding
      });

      if (!result.success) {
        setError(result.error || 'Registration failed');
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
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialSignUp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await signInWithGoogle();
      
      if (!result.success) {
        setError(result.error || 'Google sign-up failed');
      }
      // If successful, the action will redirect automatically
    } catch (error) {
      setError('Failed to sign up with Google. Please try again.');
      console.error('Google sign-up error:', error);
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
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-green-900">
              Account Created!
            </h3>
            <p className="text-sm text-green-700 mb-4">
              We've sent a verification email to your inbox. Please check your email to verify your account.
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
              placeholder="Create a strong password"
              className="pl-10 h-11 sm:h-12 text-base sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              disabled={isLoading}
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm sm:text-base font-medium">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="pl-10 h-11 sm:h-12 text-base sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              disabled={isLoading}
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200">{errors.confirmPassword.message}</p>
          )}
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
              Creating Account...
            </div>
          ) : (
            <div className="flex items-center">
              Create Account
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </Button>

        {/* Social Sign Up */}
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
                onClick={handleSocialSignUp}
              >
                <Image src="/google.png" alt="Google logo" width={16} height={16} className="mr-2" />
                Continue with Google
              </Button>
            </div>
          </>
        )}

      </form>
    </div>
  );
}