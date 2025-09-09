'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RoleSelector } from '@/components/auth/role-selector';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^(\+92|0)?3[0-9]{9}$/, 'Invalid Pakistani phone number').optional().or(z.string().length(0)),
  city: z.enum([
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana'
  ]).optional(),
  role: z.enum(['user', 'seller']),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional().or(z.string().length(0)),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format XXXXX-XXXXXXX-X').optional().or(z.string().length(0)),
  address: z.string().min(10, 'Address must be at least 10 characters').optional().or(z.string().length(0)),
  whatsapp: z.string().regex(/^(\+92|0)?3[0-9]{9}$/, 'Invalid Pakistani WhatsApp number').optional().or(z.string().length(0)),
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

interface OnboardingDirectProps {
  user: User;
  onComplete: () => void;
}

const pakistaniCities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana'
];

// Simple localStorage helper
const saveOnboardingState = (state: any) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rentparlo_onboarding_state', JSON.stringify(state));
    }
  } catch (e) {
    console.error('Failed to save onboarding state:', e);
  }
};

const loadOnboardingState = (): any => {
  try {
    if (typeof window !== 'undefined') {
      const state = localStorage.getItem('rentparlo_onboarding_state');
      return state ? JSON.parse(state) : null;
    }
  } catch (e) {
    console.error('Failed to load onboarding state:', e);
  }
  return null;
};

const clearOnboardingState = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rentparlo_onboarding_state');
    }
  } catch (e) {
    console.error('Failed to clear onboarding state:', e);
  }
};

export function OnboardingDirect({ user, onComplete }: OnboardingDirectProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
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

  // Watch the role and terms values
  const role = watch('role');
  const terms = watch('terms');
  
  // Show error if user tries to submit without accepting terms
  const termsErrorShown = React.useRef(false);
  
  React.useEffect(() => {
    if (!terms && termsErrorShown.current) {
      // Reset the error shown flag when terms become unchecked
      termsErrorShown.current = false;
    }
  }, [terms]);
  
  // Use a ref to track the previous terms value to prevent flickering
  const termsRef = React.useRef(terms);
  
  // Update the ref when terms change
  React.useEffect(() => {
    termsRef.current = terms;
  }, [terms]);
  
  // Getter for stable terms value
  const getStableTerms = () => termsRef.current;
  
  // Ensure terms state is stable
  const [stableTerms, setStableTerms] = React.useState(false);
  
  React.useEffect(() => {
    setStableTerms(terms);
  }, [terms]);

  // Load persisted state on mount
  React.useEffect(() => {
    const savedState = loadOnboardingState();
    if (savedState) {
      console.log('Loading saved state:', savedState);
      // Restore form values with proper type conversion
      Object.keys(savedState.formData).forEach(key => {
        const value = savedState.formData[key];
        console.log(`Setting form field ${key} with value:`, value, 'type:', typeof value);
        // Ensure boolean values are properly converted
        if (key === 'terms') {
          // Convert string "true"/"false" or boolean values to proper boolean
          const boolValue = value === true || value === 'true' || String(value).toLowerCase() === 'true';
          console.log(`Converting terms value ${value} to boolean:`, boolValue);
          setValue(key as keyof OnboardingFormData, boolValue);
        } else {
          setValue(key as keyof OnboardingFormData, value);
        }
      });
      setCurrentStep(savedState.currentStep || 0);
    } else if (user) {
      // Initialize with user data
      const initialData = {
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || 'Karachi',
        role: user.role || 'user',
        businessName: '',
        cnic: '',
        address: '',
        whatsapp: '',
        terms: false
      };
      
      console.log('Initializing with user data:', initialData);
      reset(initialData);
    }
  }, [user, reset, setValue]);

  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    const formData = getValues();
    console.log('Saving form data to localStorage:', formData);
    const stateToSave = {
      currentStep,
      formData
    };
    saveOnboardingState(stateToSave);
  }, [currentStep, getValues]);

  const steps = [
    {
      id: 'role',
      title: 'Welcome to RentParLo.pk!',
      subtitle: 'Let\'s set up your account',
      description: 'Choose how you plan to use RentParLo.pk',
      content: 'role'
    },
    {
      id: 'profile',
      title: 'Profile Information',
      subtitle: 'Tell us about yourself',
      description: 'This information helps us personalize your experience',
      content: 'profile'
    },
    {
      id: 'business',
      title: 'Business Details',
      subtitle: 'For sellers only',
      description: 'Provide your business information for verification',
      content: 'business'
    },
    {
      id: 'review',
      title: 'Review & Confirm',
      subtitle: 'Almost done!',
      description: 'Review your information before completing setup',
      content: 'review'
    }
  ];

  // Filter steps based on role
  const filteredSteps = React.useMemo(() => {
    if (role === 'seller') {
      return steps;
    }
    // For users, skip the business details step
    return steps.filter(step => step.id !== 'business');
  }, [role]);

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      console.log('Form onSubmit called with data:', data);
      console.log('Terms value in onSubmit:', data.terms);
      
      // Explicitly check terms acceptance
      if (!data.terms) {
        setError('You must accept the terms and conditions to complete setup.');
        toast.error('You must accept the terms and conditions to complete setup.');
        return;
      }
      
      // Check if form is valid before proceeding
      const isValid = await trigger();
      console.log('Form validity:', isValid);
      
      if (!isValid) {
        console.log('Form is not valid, checking errors:', errors);
        return;
      }
      
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
          phone: data.phone || null,
          city: data.city || null,
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
          business_name: data.businessName || '',
          owner_name: data.name,
          owner_cnic: data.cnic || null,
          phone: data.phone || '',
          whatsapp: data.whatsapp || null,
          address_line1: data.address || '',
          city: data.city || '',
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

      // Clear persisted state on success
      clearOnboardingState();
      
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
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setError(null);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError(null);
    }
  };

  const handleSkip = () => {
    // For users, we can skip optional fields
    if (role === 'user') {
      onComplete();
    }
  };

  const handleRoleSelect = (selectedRole: 'user' | 'seller') => {
    setValue('role', selectedRole);
    
    // If switching from seller to user and we're past the business step, go back to profile step
    if (selectedRole === 'user' && currentStep > 1) {
      setCurrentStep(1);
    }
  };

  const renderStepContent = () => {
    // Check if currentStep is valid
    if (currentStep < 0 || currentStep >= filteredSteps.length) {
      return null;
    }
    
    const step = filteredSteps[currentStep];
    const formData = getValues();
    
    // Check if step exists
    if (!step) {
      return null;
    }
    
    switch (step.content) {
      case 'role':
        return (
          <div className="space-y-6">
            <RoleSelector
              selected={role}
              onSelect={handleRoleSelect}
            />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="03XX XXXXXXX"
                type="tel"
              />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">Pakistani mobile number format</p>
            </div>

            <div>
              <Label htmlFor="city">City (Optional)</Label>
              <Select 
                value={formData.city || 'Karachi'} 
                onValueChange={(value) => setValue('city', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {pakistaniCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                {...register('businessName')}
                placeholder="Enter your business name"
              />
              {errors.businessName && <p className="text-sm text-destructive mt-1">{errors.businessName.message}</p>}
            </div>

            <div>
              <Label htmlFor="cnic">Owner CNIC *</Label>
              <Input
                id="cnic"
                {...register('cnic')}
                placeholder="XXXXX-XXXXXXX-X"
              />
              {errors.cnic && <p className="text-sm text-destructive mt-1">{errors.cnic.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">Required for verification</p>
            </div>

            <div>
              <Label htmlFor="address">Business Address *</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Enter your business address"
              />
              {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">Full address for verification</p>
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
              <Input
                id="whatsapp"
                {...register('whatsapp')}
                placeholder="03XX XXXXXXX"
                type="tel"
              />
              {errors.whatsapp && <p className="text-sm text-destructive mt-1">{errors.whatsapp.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">For customer communication</p>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-medium">Account Type</h3>
              <p className="text-sm text-muted-foreground capitalize">{role}</p>
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-medium">Personal Information</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Name:</span> {formData.name}</p>
                <p><span className="text-muted-foreground">Phone:</span> {formData.phone || 'Not provided'}</p>
                <p><span className="text-muted-foreground">City:</span> {formData.city || 'Not provided'}</p>
              </div>
            </div>

            {role === 'seller' && (
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

            <div className="flex items-start space-x-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  {...register('terms')}
                  className="h-4 w-4 rounded border-muted-foreground text-primary focus:ring-primary"
                />
              </div>
              <Label htmlFor="terms" className="text-sm font-medium leading-none">
                I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </Label>
            </div>
            {errors.terms && <p className="text-sm text-destructive">{errors.terms.message}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  // Get current form data for review step
  const formData = getValues();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="text-xl">
              {filteredSteps[currentStep]?.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredSteps[currentStep]?.subtitle}
            </p>
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
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / filteredSteps.length) * 100}%` }}
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
            <div className="mb-6">
              {renderStepContent()}
            </div>

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
                  disabled={isLoading || !terms}
                  size="sm"
                  className="min-w-[100px]"
                >
                  {console.log('Rendering Complete Setup button - isLoading:', isLoading, 'terms:', terms)}
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
          {role === 'user' && currentStep === 1 && (
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
    </div>
  );
}