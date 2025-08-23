'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, CheckCircle2, XCircle, RefreshCw, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isResending, setIsResending] = React.useState(false);
  const [resendSuccess, setResendSuccess] = React.useState(false);
  const [resendError, setResendError] = React.useState<string | null>(null);
  
  const message = searchParams.get('message');
  const email = searchParams.get('email');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.2 }
    }
  };

  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      setResendError(null);
      
      // TODO: Implement resend verification email
      // const result = await resendVerificationEmail();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
      
    } catch (error) {
      setResendError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const getContent = () => {
    switch (message) {
      case 'check-email':
        return {
          icon: Mail,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50',
          title: 'Check your email',
          description: 'We\'ve sent a verification link to your email address. Click the link to activate your account.',
          showResend: true
        };
      
      case 'verified':
        return {
          icon: CheckCircle2,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200',
          bgColor: 'bg-green-50',
          title: 'Email verified successfully!',
          description: 'Your email has been verified. You can now access all features of your account.',
          showResend: false,
          showContinue: true
        };
      
      case 'error':
        return {
          icon: XCircle,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200',
          bgColor: 'bg-red-50',
          title: 'Verification failed',
          description: 'The verification link is invalid or has expired. Please request a new verification email.',
          showResend: true
        };
      
      case 'expired':
        return {
          icon: Clock,
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          borderColor: 'border-orange-200',
          bgColor: 'bg-orange-50',
          title: 'Link expired',
          description: 'The verification link has expired. Please request a new verification email.',
          showResend: true
        };
      
      default:
        return {
          icon: Mail,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50',
          title: 'Verify your email',
          description: 'Please check your email and click the verification link to activate your account.',
          showResend: true
        };
    }
  };

  const content = getContent();
  const IconComponent = content.icon;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md mx-auto space-y-6"
    >
      {/* Main Card */}
      <Card className={cn("border-2", content.borderColor, content.bgColor)}>
        <CardContent className="p-6 text-center">
          {/* Icon */}
          <motion.div
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
              content.iconBg
            )}
          >
            <IconComponent className={cn("w-8 h-8", content.iconColor)} />
          </motion.div>
          
          {/* Title */}
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={cn(
              "text-lg font-semibold mb-2",
              content.iconColor.replace('text-', 'text-').replace('-600', '-900')
            )}
          >
            {content.title}
          </motion.h3>
          
          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={cn(
              "text-sm mb-4",
              content.iconColor.replace('text-', 'text-').replace('-600', '-700')
            )}
          >
            {content.description}
          </motion.p>
          
          {/* Email Display */}
          {email && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs font-medium mb-4 p-2 bg-white/50 rounded border"
            >
              {email}
            </motion.p>
          )}
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-3"
          >
            {content.showContinue && (
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            {content.showResend && (
              <Button
                variant="outline"
                onClick={handleResendEmail}
                disabled={isResending}
                className={cn(
                  "w-full transition-all duration-200",
                  content.borderColor,
                  content.iconColor.replace('text-', 'text-').replace('-600', '-700'),
                  "hover:bg-white/80"
                )}
              >
                <AnimatePresence mode="wait">
                  {isResending ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="normal"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Resend verification email
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            )}
          </motion.div>
        </CardContent>
      </Card>
      
      {/* Resend Success Message */}
      <AnimatePresence>
        {resendSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Verification email sent successfully! Please check your inbox.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Resend Error Message */}
      <AnimatePresence>
        {resendError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{resendError}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Additional Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center space-y-2"
      >
        <p className="text-xs text-muted-foreground">
          Didn't receive the email? Check your spam folder.
        </p>
        
        <div className="flex justify-center space-x-4 text-xs">
          <button
            onClick={() => router.push('/auth/login')}
            className="text-primary hover:underline transition-colors duration-200"
          >
            Back to Sign In
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            onClick={() => router.push('/contact')}
            className="text-primary hover:underline transition-colors duration-200"
          >
            Contact Support
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}