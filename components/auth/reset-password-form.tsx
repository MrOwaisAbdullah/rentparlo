'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormField } from '@/components/forms/form-field';
import { cn } from '@/lib/utils';

// Validation schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  className?: string;
  variant?: 'default' | 'modal' | 'inline';
}

export function ResetPasswordForm({ 
  className,
  variant = 'default'
}: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [validationState, setValidationState] = React.useState<Record<string, 'idle' | 'validating' | 'valid' | 'invalid'>>({});

  const {
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    setValue,
    watch,
    setError: setFormError,
    clearErrors
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const formData = watch();

  // Real-time validation
  const validateField = React.useCallback(async (field: keyof ResetPasswordFormData, value: any) => {
    if (!touchedFields[field]) return;
    
    setValidationState(prev => ({ ...prev, [field]: 'validating' }));
    
    try {
      const fieldSchema = resetPasswordSchema.pick({ [field]: true });
      await fieldSchema.parseAsync({ [field]: value });
      setValidationState(prev => ({ ...prev, [field]: 'valid' }));
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
      clearErrors(field);
    } catch (error: any) {
      setValidationState(prev => ({ ...prev, [field]: 'invalid' }));
      const message = error.errors?.[0]?.message || 'Invalid value';
      setFieldErrors(prev => ({ ...prev, [field]: message }));
      setFormError(field, { message });
    }
  }, [touchedFields, setFormError, clearErrors]);

  React.useEffect(() => {
    validateField('password', formData.password);
  }, [formData.password, validateField]);

  React.useEffect(() => {
    validateField('confirmPassword', formData.confirmPassword);
  }, [formData.confirmPassword, validateField]);

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

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setFieldErrors({});

      // Create FormData for server action
      const formData = new FormData();
      formData.set('password', data.password);
      formData.set('confirmPassword', data.confirmPassword);

      // TODO: Implement updatePassword server action
      // const result = await updatePassword(formData);

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success
      setSuccess(true);

      // Redirect to login after success
      setTimeout(() => {
        window.location.href = '/auth/login?message=password-updated';
      }, 2000);

    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
              Password updated successfully!
            </motion.h3>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-green-700 mb-4"
            >
              Your password has been updated. You can now sign in with your new password.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center space-x-2"
            >
              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
              <p className="text-xs text-green-600">Redirecting to sign in...</p>
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

        {/* Password Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FormField
            id="password"
            name="password"
            label="New Password"
            type="password"
            placeholder="Enter your new password"
            value={formData.password}
            error={fieldErrors.password || errors.password?.message}
            required
            disabled={isLoading}
            icon={Lock}
            autoFocus
            validationState={validationState.password}
            isValid={validationState.password === 'valid'}
            isLoading={validationState.password === 'validating'}
            description="Must contain at least 8 characters with uppercase, lowercase, and number"
            onChange={(value) => setValue('password', value as string)}
            onBlur={() => validateField('password', formData.password)}
            animation="slide"
          />
        </motion.div>

        {/* Confirm Password Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FormField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            error={fieldErrors.confirmPassword || errors.confirmPassword?.message}
            required
            disabled={isLoading}
            icon={Lock}
            validationState={validationState.confirmPassword}
            isValid={validationState.confirmPassword === 'valid'}
            isLoading={validationState.confirmPassword === 'validating'}
            onChange={(value) => setValue('confirmPassword', value as string)}
            onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
            animation="slide"
          />
        </motion.div>

        {/* Password Strength Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <p className="text-xs font-medium text-muted-foreground">Password requirements:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={cn(
              "flex items-center space-x-1",
              formData.password.length >= 8 ? "text-green-600" : "text-muted-foreground"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                formData.password.length >= 8 ? "bg-green-600" : "bg-muted-foreground/30"
              )} />
              <span>8+ characters</span>
            </div>
            <div className={cn(
              "flex items-center space-x-1",
              /[A-Z]/.test(formData.password) ? "text-green-600" : "text-muted-foreground"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                /[A-Z]/.test(formData.password) ? "bg-green-600" : "bg-muted-foreground/30"
              )} />
              <span>Uppercase</span>
            </div>
            <div className={cn(
              "flex items-center space-x-1",
              /[a-z]/.test(formData.password) ? "text-green-600" : "text-muted-foreground"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                /[a-z]/.test(formData.password) ? "bg-green-600" : "bg-muted-foreground/30"
              )} />
              <span>Lowercase</span>
            </div>
            <div className={cn(
              "flex items-center space-x-1",
              /[0-9]/.test(formData.password) ? "text-green-600" : "text-muted-foreground"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                /[0-9]/.test(formData.password) ? "bg-green-600" : "bg-muted-foreground/30"
              )} />
              <span>Number</span>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
                  Updating password...
                </motion.div>
              ) : (
                <motion.div
                  key="normal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  Update password
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}