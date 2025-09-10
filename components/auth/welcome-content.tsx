'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Store, MapPin, Phone, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormField } from '@/components/forms/form-field';
import { FormSection } from '@/components/forms/form-section';
import { MultiStepForm, Step } from '@/components/forms/multi-step-form';
import { RoleSelector } from '@/components/auth/role-selector';
import { createClient } from '@/utils/supabase/client';
import { sanitizeFormData } from '@/lib/security/sanitization';
import { cn } from '@/lib/utils';

// Onboarding form schema
const onboardingSchema = z.object({
  role: z.enum(['user', 'seller']),
  phone: z.string()
    .regex(/^(\+92|0)?3[0-9]{9}$/, 'Invalid Pakistani phone number format (03XXXXXXXXX)')
    .transform(val => val.replace(/\s+/g, '')),
  city: z.enum([
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana'
  ]),
  // Seller-specific fields
  businessName: z.string().optional(),
  cnic: z.string()
    .regex(/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format XXXXX-XXXXXXX-X')
    .optional(),
  address: z.string().min(10, 'Address must be at least 10 characters').optional()
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

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

export function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get('new_user') === 'true';
  const fromSignup = searchParams.get('from') === 'signup';
  
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [user, setUser] = React.useState<any>(null);
  const [isComplete, setIsComplete] = React.useState(false);

  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onBlur',
    defaultValues: {
      role: 'user',
      phone: '',
      city: 'Karachi',
      businessName: '',
      cnic: '',
      address: ''
    }
  });

  const formData = watch();
  const selectedRole = formData.role;

  // Get current user data
  React.useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Pre-fill name if available from Google OAuth
        if (user.user_metadata?.full_name) {
          // Name is already set from OAuth, no need to collect again
        }
      } else {
        router.push('/auth/login');
      }
    };
    getCurrentUser();
  }, [router]);

  // Define onboarding steps
  const steps: Step[] = React.useMemo(() => {
    const baseSteps: Step[] = [
      {
        id: 'role',
        title: 'Account Type',
        description: 'Choose how you want to use RentParLo',
        icon: User
      },
      {
        id: 'details',
        title: 'Contact Details',
        description: 'Add your contact information',
        icon: Phone
      }
    ];
    
    if (selectedRole === 'seller') {
      baseSteps.push({
        id: 'business',
        title: 'Business Info',
        description: 'Tell us about your business',
        icon: Store
      });
    }
    
    baseSteps.push({
      id: 'complete',
      title: 'All Done!',
      description: 'Your profile is ready',
      icon: CheckCircle2
    });
    
    return baseSteps;
  }, [selectedRole]);

  // Step validation
  const validateCurrentStep = async () => {
    const stepFieldMap: Record<number, (keyof OnboardingFormData)[]> = {
      0: ['role'],
      1: ['phone', 'city'],
      2: selectedRole === 'seller' ? ['businessName', 'cnic', 'address'] : []
    };

    const fieldsToValidate = stepFieldMap[currentStep];
    if (!fieldsToValidate || fieldsToValidate.length === 0) return true;
    
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
    
    return isStepValid;
  };

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Submit form on last step
      await handleSubmit(onSubmit)();
      return;
    }
    
    const isStepValid = await validateCurrentStep();
    if (isStepValid) {
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

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex < currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
      setError(null);
    } else if (stepIndex === currentStep + 1) {
      await handleNext();
    }
  };

  // Submit onboarding data
  const onSubmit = async (data: OnboardingFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please sign in again to continue.');
        return;
      }

      const sanitizedData = sanitizeFormData(data);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          phone: sanitizedData.phone,
          city: sanitizedData.city,
          role: sanitizedData.role,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // If seller, create seller profile
      if (sanitizedData.role === 'seller') {
        // Check if seller profile already exists
        const existingProfile = await supabase
          .from('seller_profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!existingProfile.data) {
          const { error: sellerError } = await supabase
            .from('seller_profiles')
            .insert({
              id: user.id,
              username: user.email?.split('@')[0] || `seller_${Date.now()}`,
              business_name: sanitizedData.businessName || '',
              owner_cnic: sanitizedData.cnic || '',
              address_line1: sanitizedData.address || '',
              city: sanitizedData.city || '',
              phone: sanitizedData.phone || '',
              email: user.email || '',
              is_verified: false,
              is_top_seller: false,
              tier: 'basic',
              tier_points: 0,
              tier_last_updated: new Date().toISOString(),
              verification_status: 'pending',
              verification_documents: {}, // Initialize as empty object instead of JSON string
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (sellerError) {
            console.error('Seller profile creation error:', sellerError);
            // Don't throw error, continue with user creation
          } else {
            console.log('Seller profile created successfully for user:', user.id);
          }
        } else {
          console.log('Seller profile already exists for user:', user.id);
        }
      }

      setIsComplete(true);
      setCurrentStep(steps.length - 1);
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'An error occurred while setting up your profile.');
      console.error('Onboarding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Role Selection
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <RoleSelector
              selected={formData.role}
              onSelect={(role) => setValue('role', role)}
            />
          </motion.div>
        );

      case 1: // Contact Details
        return (
          <FormSection
            title="Contact Information"
            description="Add your contact details to complete your profile"
            icon={Phone}
          >
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <FormField
                id="phone"
                name="phone"
                label="Phone Number"
                type="tel"
                placeholder="03XX XXXXXXX"
                value={formData.phone}
                error={errors.phone?.message}
                required
                description="Pakistani mobile number format"
                onChange={(value) => setValue('phone', value as string)}
              />

              <FormField
                id="city"
                name="city"
                label="City"
                type="select"
                options={pakistaniCities}
                value={formData.city}
                error={errors.city?.message}
                required
                icon={MapPin}
                onChange={(value) => setValue('city', value as string)}
              />
            </div>
          </FormSection>
        );

      case 2: // Business Details (Seller only)
        if (selectedRole === 'seller') {
          return (
            <FormSection
              title="Business Information"
              description="Tell us about your business for verification"
              icon={Store}
            >
              <div className="space-y-4 sm:space-y-6">
                <FormField
                  id="businessName"
                  name="businessName"
                  label="Business Name"
                  placeholder="Enter your business name (optional)"
                  value={formData.businessName}
                  error={errors.businessName?.message}
                  icon={Building2}
                  onChange={(value) => setValue('businessName', value as string)}
                />

                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <FormField
                    id="cnic"
                    name="cnic"
                    label="CNIC Number"
                    placeholder="XXXXX-XXXXXXX-X"
                    value={formData.cnic}
                    error={errors.cnic?.message}
                    description="Required for seller verification"
                    onChange={(value) => setValue('cnic', value as string)}
                  />

                  <FormField
                    id="address"
                    name="address"
                    label="Business Address"
                    type="textarea"
                    placeholder="Enter your complete business address"
                    value={formData.address}
                    error={errors.address?.message}
                    onChange={(value) => setValue('address', value as string)}
                  />
                </div>
              </div>
            </FormSection>
          );
        }
        // Fall through to completion step if not seller
        return renderCompletionStep();

      case steps.length - 1: // Completion
        return renderCompletionStep();

      default:
        return null;
    }
  };

  const renderCompletionStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">
          Welcome to RentParLo, {user?.user_metadata?.full_name || user?.email}!
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {selectedRole === 'seller' 
            ? 'Your seller account is ready! You can now start listing items for rent.'
            : 'Your account is ready! You can now browse and rent items across Pakistan.'
          }
        </p>
      </div>
      
      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center space-x-2 text-sm text-muted-foreground"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Redirecting to dashboard...</span>
        </motion.div>
      )}
    </motion.div>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Welcome Message */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {fromSignup ? 'Registration successful!' : 'Welcome!'} 🎉
              </p>
              <p className="text-xs text-muted-foreground">
                Let's complete your profile to get you started.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <MultiStepForm
          steps={steps}
          currentStep={currentStep}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onStepClick={handleStepClick}
          canGoNext={currentStep === steps.length - 1 ? true : isValid}
          isLoading={isLoading}
          submitLabel={selectedRole === 'seller' ? 'Complete Setup' : 'Get Started'}
          allowStepNavigation={true}
          completedSteps={completedSteps}
          variant="default"
          animation="slide"
        >
          {renderStepContent()}
        </MultiStepForm>
      </form>
    </motion.div>
  );
}