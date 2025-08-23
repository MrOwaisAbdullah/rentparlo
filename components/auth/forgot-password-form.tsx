'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormField } from '@/components/forms/form-field';
import { cn } from '@/lib/utils';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  className?: string;
  variant?: 'default' | 'modal' | 'inline';
}

export function ForgotPasswordForm({ 
  className,
  variant = 'default'
}: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);

  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      email: ''
    }
  });

  const formData = watch();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const successVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create FormData for server action
      const formData = new FormData();
      formData.set('email', data.email);

      // TODO: Implement sendPasswordReset server action
      // const result = await sendPasswordReset(formData);

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success
      setEmailSent(true);
      
      setTimeout(() => {
        setSuccess(true);
      }, 1000);

    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success || emailSent) {
    return (
      <motion.div
        variants={successVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "w-full max-w-md mx-auto",
          variant === 'modal' && "max-w-sm"
        )}
      >
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </motion.div>
            
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg font-semibold mb-2 text-green-900"
            >
              Check your email
            </motion.h3>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-green-700 mb-4"
            >
              We've sent a password reset link to{' '}
              <span className="font-medium">{formData.email}</span>
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <p className="text-xs text-green-600">
                Check your spam folder if you don't see it in your inbox.
              </p>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSuccess(false);
                  setEmailSent(false);
                  setError(null);
                }}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Send another email
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "w-full",
        variant === 'default' && "max-w-md mx-auto",
        variant === 'modal' && "max-w-sm",
        className
      )}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FormField
            id="email"
            name="email"
            label="Email address"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            error={errors.email?.message}
            required
            disabled={isLoading}
            icon={Mail}
            autoFocus
            onChange={(value) => setValue('email', value as string)}
            animation="slide"
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            type="submit"
            className="w-full group transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            disabled={!isValid || isLoading}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </motion.div>
              ) : (
                <motion.div
                  key="normal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  Send reset link
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2"
        >
          <p className="text-xs text-muted-foreground">
            Remember your password?{' '}
            <a
              href="/auth/login"
              className="text-primary hover:underline transition-colors duration-200"
            >
              Sign in instead
            </a>
          </p>
          
          <p className="text-xs text-muted-foreground">
            Don't have an account?{' '}
            <a
              href="/auth/register"
              className="text-primary hover:underline transition-colors duration-200"
            >
              Sign up
            </a>
          </p>
        </motion.div>
      </form>
    </motion.div>
  );
}