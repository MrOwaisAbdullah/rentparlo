'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Store, Mail, MapPin, Shield, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormField } from '@/components/forms/form-field';
import { FormSection } from '@/components/forms/form-section';
import { MultiStepForm, Step } from '@/components/forms/multi-step-form';
import { ProfileImageUpload } from '@/components/forms/profile-image-upload';
import { RoleSelector } from './role-selector';
import { signUp, signInWithGoogle } from '@/lib/auth-actions';
import { uploadProfileImage } from '@/app/auth/upload-image/actions';
import { type RegistrationFormData, getRegistrationSchema } from '@/lib/validations/auth';
import { sanitizeFormData } from '@/lib/security/sanitization';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface RegisterFormProps {
  onSuccess?: () => void;
  className?: string;
  variant?: 'default' | 'modal' | 'inline';
  autoFocus?: boolean;
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

export function RegisterForm({ 
  onSuccess, 
  className,
  variant = 'default',
  autoFocus = true
}: RegisterFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = React.useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [validationState, setValidationState] = React.useState<Record<string, 'idle' | 'validating' | 'valid' | 'invalid'>>({});

  const {
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    setValue,
    watch,
    trigger,
    setError: setFormError,
    clearErrors,
    control
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(getRegistrationSchema()),
    mode: 'onBlur',
    defaultValues: {
      role: 'user',
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      city: 'Karachi',
      terms: false
    }
  });

  const formData = watch();
  const selectedRole = formData.role;
  
  // Define the registration steps
  const steps: Step[] = React.useMemo(() => {
    const baseSteps: Step[] = [
      {
        id: 'role',
        title: 'Account type',
        description: 'Select the option that best describes how you plan to use RentParLo.pk',
        icon: User
      },
      {
        id: 'profile',
        title: 'Profile Info',
        description: 'Personal information',
        icon: User
      },
      {
        id: 'credentials',
        title: 'Security',
        description: 'Password setup',
        icon: Shield
      }
    ];
    
    if (selectedRole === 'seller') {
      baseSteps.push({
        id: 'business',
        title: 'Business Info',
        description: 'Business details',
        icon: Store
      });
      baseSteps.push({
        id: 'review',
        title: 'Review',
        description: 'Confirm details',
        icon: Shield
      });
    } else {
      baseSteps.push({
        id: 'terms',
        title: 'Terms',
        description: 'Accept terms',
        icon: Shield
      });
      baseSteps.push({
        id: 'review',
        title: 'Review',
        description: 'Confirm details',
        icon: Shield
      });
    }
    
    return baseSteps;
  }, [selectedRole, completedSteps]);
  
  // Real-time validation
  const validateField = React.useCallback(async (field: keyof RegistrationFormData, value: any) => {
    // Always validate, even if field hasn't been touched yet
    setValidationState(prev => ({ ...prev, [field]: 'validating' }));
    
    try {
      const isValid = await trigger(field);
      if (isValid) {
        setValidationState(prev => ({ ...prev, [field]: 'valid' }));
        clearErrors(field);
      } else {
        setValidationState(prev => ({ ...prev, [field]: 'invalid' }));
      }
    } catch (error: any) {
      setValidationState(prev => ({ ...prev, [field]: 'invalid' }));
      const message = error?.message || 'Invalid value';
      setFormError(field, { message });
    }
  }, [setFormError, clearErrors, trigger]);
  
  // Profile image upload handler
  const handleProfileImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.set('file', file);
    
    const result = await uploadProfileImage(formData);
    if (result.success && result.imageUrl) {
      return result.imageUrl;
    } else {
      throw new Error(result.error || 'Failed to upload image');
    }
  };

  // Enhanced step navigation with validation - ONLY validate current step fields
  const validateCurrentStep = async () => {
    const stepFieldMap: Record<number, (keyof RegistrationFormData)[]> = {
      0: ['role'],
      1: ['name', 'email', 'phone', 'city'],
      2: ['password', 'confirmPassword'],
      3: selectedRole === 'seller' ? ['businessName', 'cnic', 'address'] as (keyof RegistrationFormData)[] : ['terms'],
      4: ['terms']
    };

    const fieldsToValidate = stepFieldMap[currentStep];
    if (!fieldsToValidate) return true;
    
    // Clear previous errors first
    setError(null);
    
    // Special handling for step 0 (role selection)
    if (currentStep === 0) {
      // For role selection, we just need to make sure a role is selected
      if (formData.role === 'user' || formData.role === 'seller') {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        return true;
      } else {
        setError('Please select an account type');
        return false;
      }
    }
    
    // Validate only fields in the current step
    let isStepValid = true;
    const invalidFields: string[] = [];
    
    for (const field of fieldsToValidate) {
      // Skip validation for optional fields that are not applicable
      if (selectedRole === 'user' && ['businessName', 'cnic', 'address'].includes(field as string)) {
        continue;
      }
      
      const isValid = await trigger(field);
      if (!isValid) {
        isStepValid = false;
        // Get the field name for the error message
        const fieldName = field.toString();
        invalidFields.push(fieldName);
      }
    }
    
    if (!isStepValid) {
      if (invalidFields.length > 0) {
        setError(`Please correct the following fields: ${invalidFields.join(', ')}`);
      } else {
        setError('Please correct the highlighted fields and try again.');
      }
    } else {
      // If step is valid, mark it as completed
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
    
    return isStepValid;
  };

  const handleNext = async () => {
    setError(null); // Clear previous errors
    const isStepValid = await validateCurrentStep();
    if (isStepValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
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

  // Enhanced submit handler with profile image
  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Sanitize input data
      const sanitizedData = sanitizeFormData(data);

      // Prepare signup data for the new auth action
      const signUpData = {
        email: sanitizedData.email,
        password: sanitizedData.password,
        name: sanitizedData.name,
        phone: sanitizedData.phone,
        city: sanitizedData.city,
        role: sanitizedData.role as 'user' | 'seller',
        sellerData: sanitizedData.role === 'seller' ? {
          username: sanitizedData.email.split('@')[0], // Generate username from email
          businessName: sanitizedData.businessName,
          cnic: sanitizedData.cnic,
          address: sanitizedData.address
        } : undefined
      };
      
      const result = await signUp(signUpData);

      if (!result.success) {
        if (result.error) {
          setError(result.error);
        }
      } else {
        // If successful, handle redirect or success callback
        if (result.redirectTo) {
          // Redirect to the appropriate page
          window.location.href = result.redirectTo;
        } else {
          // Fallback to onSuccess callback or dashboard
          onSuccess?.();
          if (!onSuccess) {
            window.location.href = '/dashboard';
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth registration handler
  const handleGoogleSignUp = async () => {
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
              onSelect={(role) => {
                setValue('role', role);
                // For role selection, we can immediately mark as valid since it's required
                setValidationState(prev => ({ ...prev, role: 'valid' }));
                clearErrors('role');
              }}
            />
          </motion.div>
        );

      case 1: // Profile Setup with Image
        return (
          <FormSection
            title="Profile Information"
            description="Tell us about yourself and upload a profile picture"
            icon={User}
          >
            {/* Profile Image Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-6 sm:mb-8"
            >
              <ProfileImageUpload
                value={profileImageUrl || undefined}
                onChange={setProfileImageUrl}
                onUpload={handleProfileImageUpload}
                size="lg"
                placeholder="Upload your profile picture"
                disabled={isLoading}
              />
            </motion.div>
            
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FormField
                  id="name"
                  name="name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  error={errors.name?.message}
                  required
                  disabled={isLoading}
                  icon={User}
                  autoFocus={autoFocus && currentStep === 1}
                  validationState={validationState.name}
                  isValid={validationState.name === 'valid'}
                  isLoading={validationState.name === 'validating'}
                  onChange={(value) => {
                    setValue('name', value as string);
                    validateField('name', value);
                  }}
                  onBlur={() => validateField('name', formData.name)}
                  animation="slide"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <FormField
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  error={errors.email?.message}
                  required
                  disabled={isLoading}
                  icon={Mail}
                  validationState={validationState.email}
                  isValid={validationState.email === 'valid'}
                  isLoading={validationState.email === 'validating'}
                  onChange={(value) => {
                    setValue('email', value as string);
                    validateField('email', value);
                  }}
                  onBlur={() => validateField('email', formData.email)}
                  animation="slide"
                />
              </motion.div>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <FormField
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  placeholder="03XX XXXXXXX"
                  value={formData.phone}
                  error={errors.phone?.message}
                  required
                  disabled={isLoading}
                  description="Pakistani mobile number format"
                  validationState={validationState.phone}
                  isValid={validationState.phone === 'valid'}
                  isLoading={validationState.phone === 'validating'}
                  onChange={(value) => {
                    setValue('phone', value as string);
                    validateField('phone', value);
                  }}
                  onBlur={() => validateField('phone', formData.phone)}
                  animation="slide"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <FormField
                  id="city"
                  name="city"
                  label="City"
                  type="select"
                  options={pakistaniCities}
                  value={formData.city}
                  error={errors.city?.message}
                  required
                  disabled={isLoading}
                  icon={MapPin}
                  onChange={(value) => {
                    setValue('city', value as any);
                    validateField('city', value);
                  }}
                  animation="slide"
                />
              </motion.div>
            </div>
          </FormSection>
        );

      case 2: // Credentials
        return (
          <FormSection
            title="Account Security"
            description="Create a secure password for your account"
            icon={Mail}
          >
            <div className="space-y-4 sm:space-y-6">
              <FormField
                id="password"
                name="password"
                label="Password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                error={errors.password?.message}
                required
                description="Must contain at least 8 characters with uppercase, lowercase, and number"
                onChange={(value) => {
                  setValue('password', value as string);
                  validateField('password', value);
                }}
              />

              <FormField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                error={errors.confirmPassword?.message}
                required
                onChange={(value) => {
                  setValue('confirmPassword', value as string);
                  validateField('confirmPassword', value);
                }}
              />
            </div>
          </FormSection>
        );

      case 3: // Business Details (Seller only) or Terms (User)
        if (selectedRole === 'seller') {
          return (
            <FormSection
              title="Business Information"
              description="Help us verify your seller account"
              icon={Store}
            >
              <div className="space-y-4 sm:space-y-6">
                <FormField
                  id="businessName"
                  name="businessName"
                  label="Business Name"
                  placeholder="Enter your business name (optional)"
                  value={formData.businessName || ''}
                  error={(errors as any).businessName?.message}
                  onChange={(value) => {
                    setValue('businessName', value as any);
                    validateField('businessName', value);
                  }}
                />

                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <FormField
                    id="cnic"
                    name="cnic"
                    label="CNIC Number"
                    placeholder="XXXXX-XXXXXXX-X"
                    value={formData.cnic || ''}
                    error={(errors as any).cnic?.message}
                    description="Required for seller verification"
                    onChange={(value) => {
                      setValue('cnic', value as any);
                      validateField('cnic', value);
                    }}
                  />

                  <div className="md:col-span-1">
                    <FormField
                      id="address"
                      name="address"
                      label="Business Address"
                      type="textarea"
                      placeholder="Enter your complete business address"
                      value={formData.address || ''}
                      error={(errors as any).address?.message}
                      onChange={(value) => {
                        setValue('address', value as any);
                        validateField('address', value);
                      }}
                    />
                  </div>
                </div>
              </div>
            </FormSection>
          );
        } else {
          return (
            <FormSection
              title="Terms & Conditions"
              description="Please review and accept our terms"
            >
              <FormField
                id="terms"
                name="terms"
                label="I agree to the Terms of Service and Privacy Policy"
                type="checkbox"
                value={formData.terms}
                error={errors.terms?.message}
                required
                onChange={(value) => {
                  setValue('terms', value as boolean);
                  validateField('terms', value);
                }}
              />
            </FormSection>
          );
        }

      case 4: // Review
        return (
          <FormSection
            title="Review Your Information"
            description="Please review your details before creating your account"
          >
            <div className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                  <p className="text-base capitalize font-medium">{formData.role}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-base font-medium">{formData.name}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-base break-all">{formData.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-base">{formData.phone}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">City</label>
                <p className="text-base">{formData.city}</p>
              </div>

              {selectedRole === 'seller' && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold text-foreground text-lg">Business Information</h4>
                  <div className="grid gap-4 sm:gap-6">
                    {formData.businessName && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                        <p className="text-base">{formData.businessName}</p>
                      </div>
                    )}
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                      {formData.cnic && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">CNIC</label>
                          <p className="text-base font-mono">{formData.cnic}</p>
                        </div>
                      )}
                      {formData.address && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Address</label>
                          <p className="text-base leading-relaxed">{formData.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!formData.terms && (
              <div className="mt-6 pt-6 border-t">
                <FormField
                  id="terms"
                  name="terms"
                  label="I agree to the Terms of Service and Privacy Policy"
                  type="checkbox"
                  value={formData.terms}
                  error={errors.terms?.message}
                  required
                  onChange={(value) => {
                    setValue('terms', value as boolean);
                    validateField('terms', value);
                  }}
                />
              </div>
            )}
          </FormSection>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full",
        variant === 'default' && "max-w-2xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto",
        variant === 'modal' && "max-w-lg sm:max-w-xl lg:max-w-2xl",
        className
      )}
    >
      <form onSubmit={handleSubmit(onSubmit as any)}>
        <AnimatePresence>
          {(error || Object.keys(errors).length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertDescription>
                  {error || 'Please correct the highlighted fields and try again.'}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Sign-Up Option */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm uppercase">
                <span className="bg-background px-3 sm:px-4 text-muted-foreground font-medium">
                  Quick Sign-Up
                </span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full h-11 sm:h-12 text-base sm:text-sm font-medium group transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-primary/20"
            >
              <Image src="/google.png" alt="Google logo" width={16} height={16} className="mr-2" />
              {isLoading ? 'Connecting...' : 'Continue with Google'}
            </Button>
            
            <p className="text-xs sm:text-sm text-muted-foreground px-4">
              You'll complete your profile details after signing up
            </p>
          </div>
        </motion.div>

        {/* Manual Registration Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm uppercase">
            <span className="bg-background px-3 sm:px-4 text-muted-foreground font-medium">
              OR
            </span>
          </div>
        </div>

        <MultiStepForm
          steps={steps}
          currentStep={currentStep}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onStepClick={handleStepClick}
          canGoNext={currentStep === steps.length - 1 ? formData.terms : true}
          isLoading={isLoading}
          submitLabel="Create Account"
          allowStepNavigation={true}
          completedSteps={completedSteps}
          variant="default"
          animation="slide"
          onSubmit={handleSubmit(onSubmit as any)}
        >
          {renderStepContent()}
        </MultiStepForm>
      </form>
    </motion.div>
  );
}