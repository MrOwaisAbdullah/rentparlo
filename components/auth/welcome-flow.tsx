'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, ArrowRight, MapPin, Phone, User, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormField } from '@/components/forms/form-field';
import { RoleSelector } from '@/components/auth/role-selector';
import { z } from 'zod';
import { toast } from 'sonner';

const welcomeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^(\+92|0)?3[0-9]{9}$/, 'Invalid Pakistani phone number'),
  city: z.enum([
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana'
  ]),
  role: z.enum(['user', 'seller']),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms')
});

type WelcomeFormData = z.infer<typeof welcomeSchema>;

interface User {
  id: string;
  email: string;
  name?: string;
  profileImage?: string;
  phone?: string;
  city?: string;
  role?: 'user' | 'seller';
}

interface WelcomeFlowProps {
  user: User;
}

const pakistaniCities = [
  { value: 'Karachi', label: 'Karachi' },
  { value: 'Lahore', label: 'Lahore' },
  { value: 'Islamabad', label: 'Islamabad' },
  { value: 'Rawalpindi', label: 'Rawalpindi' },
  { value: 'Faisalabad', label: 'Faisalabad' },
  { value: 'Multan', label: 'Multan' },
  { value: 'Peshawar', label: 'Peshawar' },
  { value: 'Quetta', label: 'Quetta' },
  { value: 'Sialkot', label: 'Sialkot' },
  { value: 'Gujranwala', label: 'Gujranwala' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Bahawalpur', label: 'Bahawalpur' },
  { value: 'Sargodha', label: 'Sargodha' },
  { value: 'Sukkur', label: 'Sukkur' },
  { value: 'Larkana', label: 'Larkana' }
];

export function WelcomeFlow({ user }: WelcomeFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<WelcomeFormData>({
    resolver: zodResolver(welcomeSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      city: user?.city || 'Karachi',
      role: user?.role || 'user',
      terms: false
    }
  });

  const formData = watch();

  const steps = [
    {
      title: 'Welcome to RentParLo.pk!',
      subtitle: 'Let\'s complete your profile to get started',
      content: 'profile'
    },
    {
      title: 'Choose Your Role',
      subtitle: 'How do you plan to use RentParLo.pk?',
      content: 'role'
    },
    {
      title: 'Almost Done!',
      subtitle: 'Review your information and accept our terms',
      content: 'review'
    }
  ];

  const onSubmit = async (data: WelcomeFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update user profile
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          city: data.city,
          role: data.role,
          onboarding_completed: true
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete profile');
      }

      // If user chose seller role, create seller profile
      if (data.role === 'seller') {
        const sellerResponse = await fetch('/api/profile/seller', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: user.email.split('@')[0],
            business_name: '', // Will be filled later
            owner_name: data.name,
            phone: data.phone,
            email: user.email,
            city: data.city
          })
        });

        if (!sellerResponse.ok) {
          console.error('Failed to create seller profile, but continuing...');
        }
      }

      toast.success('Welcome to RentParLo.pk! Your profile has been completed.');
      
      // Redirect based on role
      if (data.role === 'seller') {
        router.push('/seller/verification');
      } else {
        router.push('/dashboard');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Profile completion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].content) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Image */}
            {user.profileImage && (
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <FormField
                id="name"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                error={errors.name?.message}
                required
                icon={User}
                onChange={(value) => setValue('name', value as string)}
              />

              <FormField
                id="phone"
                label="Phone Number"
                type="tel"
                placeholder="03XX XXXXXXX"
                value={formData.phone}
                error={errors.phone?.message}
                required
                icon={Phone}
                description="Pakistani mobile number format"
                onChange={(value) => setValue('phone', value as string)}
              />

              <FormField
                id="city"
                label="City"
                type="select"
                options={pakistaniCities}
                value={formData.city}
                error={errors.city?.message}
                required
                icon={MapPin}
                onChange={(value) => setValue('city', value as any)}
              />
            </div>
          </div>
        );

      case 'role':
        return (
          <div className="space-y-6">
            <RoleSelector
              selected={formData.role}
              onSelect={(role) => setValue('role', role)}
            />
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h4 className="font-semibold">Profile Summary</h4>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">City:</span>
                  <span className="font-medium">{formData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Type:</span>
                  <span className="font-medium capitalize">{formData.role}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <FormField
              id="terms"
              label="I agree to the Terms of Service and Privacy Policy"
              type="checkbox"
              value={formData.terms}
              error={errors.terms?.message}
              required
              onChange={(value) => setValue('terms', value as boolean)}
            />

            {formData.role === 'seller' && (
              <Alert>
                <Store className="h-4 w-4" />
                <AlertDescription>
                  As a seller, you'll need to complete verification after this step to start listing items.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-6">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardTitle className="text-2xl mb-2">
                {steps[currentStep].title}
              </CardTitle>
              <p className="text-muted-foreground">
                {steps[currentStep].subtitle}
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0 || isLoading}
              >
                Previous
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    'Completing...'
                  ) : (
                    <div className="flex items-center">
                      Complete Setup
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  <div className="flex items-center">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skip Option (for non-essential steps) */}
        {currentStep === 1 && (
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground underline"
              onClick={() => {
                setValue('role', 'user');
                handleNext();
              }}
            >
              Skip and continue as a regular user
            </button>
          </div>
        )}
      </form>
    </div>
  );
}