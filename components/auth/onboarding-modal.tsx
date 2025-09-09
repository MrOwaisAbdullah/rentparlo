'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Store, MapPin, Phone, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/forms/form-field';
import { RoleSelector } from '@/components/auth/role-selector';
import { z } from 'zod';
import { toast } from 'sonner';

const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^(\+92|0)?3[0-9]{9}$/, 'Invalid Pakistani phone number').optional(),
  city: z.enum([
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana'
  ]).optional(),
  role: z.enum(['user', 'seller']),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format XXXXX-XXXXXXX-X').optional(),
  address: z.string().min(10, 'Address must be at least 10 characters').optional(),
  whatsapp: z.string().regex(/^(\+92|0)?3[0-9]{9}$/, 'Invalid Pakistani WhatsApp number').optional(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms')
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface User {
  id: string;
  email: string;
  name?: string;
  profileImage?: string;
  phone?: string;
  city?: string;
  role?: 'user' | 'seller';
}

interface OnboardingModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
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

export function OnboardingModal({ user, isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [roleChanged, setRoleChanged] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      city: user?.city || 'Karachi',
      role: user?.role || 'user',
      businessName: '',
      cnic: '',
      address: '',
      whatsapp: '',
      terms: false
    }
  });

  const formData = watch();

  // Reset form when user data changes
  React.useEffect(() => {
    reset({
      name: user?.name || '',
      phone: user?.phone || '',
      city: user?.city || 'Karachi',
      role: user?.role || 'user',
      businessName: '',
      cnic: '',
      address: '',
      whatsapp: '',
      terms: false
    });
  }, [user, reset]);

  const steps = [
    {
      id: 'role',
      title: 'Welcome to RentParLo.pk!',
      subtitle: 'Let\'s set up your account',
      description: 'Choose how you plan to use RentParLo.pk',
      icon: User,
      content: 'role'
    },
    {
      id: 'profile',
      title: 'Profile Information',
      subtitle: 'Tell us about yourself',
      description: 'This information helps us personalize your experience',
      icon: User,
      content: 'profile'
    },
    {
      id: 'business',
      title: 'Business Details',
      subtitle: 'For sellers only',
      description: 'Provide your business information for verification',
      icon: Store,
      content: 'business'
    },
    {
      id: 'review',
      title: 'Review & Confirm',
      subtitle: 'Almost done!',
      description: 'Review your information before completing setup',
      icon: CheckCircle,
      content: 'review'
    }
  ];

  // Filter steps based on role
  const getFilteredSteps = React.useCallback(() => {
    if (formData.role === 'seller') {
      return steps;
    }
    // For users, skip the business details step
    return steps.filter(step => step.id !== 'business');
  }, [formData.role]);

  // Handle step navigation with proper bounds checking
  const navigateToStep = React.useCallback((stepIndex: number) => {
    const filteredSteps = getFilteredSteps();
    if (stepIndex >= 0 && stepIndex < filteredSteps.length) {
      setCurrentStep(stepIndex);
      setError(null);
    }
  }, [getFilteredSteps]);

  // Handle role change
  const handleRoleSelect = React.useCallback((role: 'user' | 'seller') => {
    setValue('role', role);
    setRoleChanged(true);
  }, [setValue]);

  // Reset to appropriate step when role changes
  React.useEffect(() => {
    if (roleChanged) {
      // Reset to step 1 (profile info) when role changes
      navigateToStep(1);
      setRoleChanged(false);
    }
  }, [formData.role, roleChanged, navigateToStep]);

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      console.log('Form submitted with data:', data);
      setIsLoading(true);
      setError(null);

      // Update user profile with onboarding completion
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
      console.log('Profile update response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete profile');
      }

      // If user chose seller role, create seller profile
      if (data.role === 'seller') {
        const sellerData = {
          username: user.email.split('@')[0],
          business_name: data.businessName,
          owner_name: data.name,
          owner_cnic: data.cnic,
          phone: data.phone,
          whatsapp: data.whatsapp,
          address_line1: data.address,
          city: data.city,
          email: user.email
        };
        
        console.log('Creating seller profile with data:', sellerData);
        
        const sellerResponse = await fetch('/api/profile/seller', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sellerData)
        });

        const sellerResult = await sellerResponse.json();
        console.log('Seller profile creation response:', sellerResult);

        if (!sellerResponse.ok) {
          throw new Error(sellerResult.error || 'Failed to create seller profile');
        }
      }

      toast.success('Welcome to RentParLo.pk! Your profile has been completed.');
      onComplete();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Profile completion error:', err);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    const filteredSteps = getFilteredSteps();
    if (currentStep < filteredSteps.length - 1) {
      navigateToStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      navigateToStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // For users, we can skip optional fields
    if (formData.role === 'user') {
      onComplete();
    }
  };

  const renderStepContent = () => {
    const filteredSteps = getFilteredSteps();
    
    // Check if currentStep is valid
    if (currentStep < 0 || currentStep >= filteredSteps.length) {
      return null;
    }
    
    const step = filteredSteps[currentStep];
    
    // Check if step exists
    if (!step) {
      return null;
    }
    
    switch (step.content) {
      case 'role':
        return (
          <div className="space-y-6">
            <RoleSelector
              selected={formData.role}
              onSelect={handleRoleSelect}
            />
          </div>
        );

      case 'profile':
        return (
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
              label="Phone Number (Optional)"
              type="tel"
              placeholder="03XX XXXXXXX"
              value={formData.phone || ''}
              error={errors.phone?.message}
              icon={Phone}
              description="Pakistani mobile number format"
              onChange={(value) => setValue('phone', value as string)}
            />

            <FormField
              id="city"
              label="City (Optional)"
              type="select"
              options={pakistaniCities}
              value={formData.city || 'Karachi'}
              error={errors.city?.message}
              icon={MapPin}
              onChange={(value) => setValue('city', value as any)}
            />
          </div>
        );

      case 'business':
        return (
          <div className="space-y-4">
            <FormField
              id="businessName"
              label="Business Name"
              placeholder="Enter your business name"
              value={formData.businessName || ''}
              error={errors.businessName?.message}
              required
              icon={Store}
              onChange={(value) => setValue('businessName', value as string)}
            />

            <FormField
              id="cnic"
              label="Owner CNIC"
              placeholder="XXXXX-XXXXXXX-X"
              value={formData.cnic || ''}
              error={errors.cnic?.message}
              required
              icon={Shield}
              description="Required for verification"
              onChange={(value) => setValue('cnic', value as string)}
            />

            <FormField
              id="address"
              label="Business Address"
              placeholder="Enter your business address"
              value={formData.address || ''}
              error={errors.address?.message}
              required
              icon={MapPin}
              description="Full address for verification"
              onChange={(value) => setValue('address', value as string)}
            />

            <FormField
              id="whatsapp"
              label="WhatsApp Number (Optional)"
              type="tel"
              placeholder="03XX XXXXXXX"
              value={formData.whatsapp || ''}
              error={errors.whatsapp?.message}
              icon={Phone}
              description="For customer communication"
              onChange={(value) => setValue('whatsapp', value as string)}
            />
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-medium">Account Type</h3>
              <p className="text-sm text-muted-foreground capitalize">{formData.role}</p>
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-medium">Personal Information</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Name:</span> {formData.name}</p>
                <p><span className="text-muted-foreground">Phone:</span> {formData.phone || 'Not provided'}</p>
                <p><span className="text-muted-foreground">City:</span> {formData.city || 'Not provided'}</p>
              </div>
            </div>

            {formData.role === 'seller' && (
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <h3 className="font-medium">Business Information</h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Business Name:</span> {formData.businessName || 'Not provided'}</p>
                  <p><span className="text-muted-foreground">CNIC:</span> {formData.cnic || 'Not provided'}</p>
                  <p><span className="text-muted-foreground">Address:</span> {formData.address || 'Not provided'}</p>
                  <p><span className="text-muted-foreground">WhatsApp:</span> {formData.whatsapp || 'Not provided'}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                id="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={(e) => setValue('terms', e.target.checked)}
                className="h-4 w-4 rounded border-muted-foreground text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <p className="text-sm text-destructive">{errors.terms.message}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  // Get filtered steps for current render
  const filteredSteps = getFilteredSteps();
  
  // Prevent window resize from changing steps by using a stable key
  const stepKey = `${formData.role}-${currentStep}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl"
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {filteredSteps[currentStep]?.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filteredSteps[currentStep]?.subtitle}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {filteredSteps[currentStep]?.description && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {filteredSteps[currentStep]?.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="px-6 pb-6">
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Step {currentStep + 1} of {filteredSteps.length}</span>
                    <span>{Math.round(((currentStep + 1) / filteredSteps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <motion.div
                      className="bg-primary h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / filteredSteps.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-xs text-destructive">{error}</p>
                  </div>
                )}

                {/* Step Content */}
                <form onSubmit={handleSubmit(onSubmit)}>
                  <motion.div
                    key={stepKey}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="mb-6"
                  >
                    {renderStepContent()}
                  </motion.div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 0 || isLoading}
                      size="sm"
                    >
                      Previous
                    </Button>

                    {currentStep === filteredSteps.length - 1 ? (
                      <Button
                        type="submit"
                        disabled={isLoading || !formData.terms}
                        size="sm"
                        className="min-w-[100px]"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Completing...
                          </>
                        ) : (
                          'Complete Setup'
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={isLoading}
                        size="sm"
                        className="min-w-[100px]"
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </form>

                {/* Skip Option for Users */}
                {formData.role === 'user' && currentStep === 1 && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                      onClick={handleSkip}
                    >
                      Skip and complete later
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}