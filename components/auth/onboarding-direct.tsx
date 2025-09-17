'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoleSelector } from '@/components/auth/role-selector';
import { ProfileImageUpload } from '@/components/forms/profile-image-upload';
import { VerificationUpload } from '@/components/verification/verification-upload';
import { CityAreaCombobox } from '@/components/search/city-area-combobox';
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
  area: z.string().optional(),
  role: z.enum(['user', 'seller']),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional().or(z.string().length(0)),
  cnic: z.string().regex(/^(\d{5}-\d{7}-\d{1}|\d{13})$/, 'CNIC must be in format XXXXX-XXXXXXX-X or XXXXXXXXXXXXX').optional().or(z.string().length(0)),
  address: z.string().min(10, 'Address must be at least 10 characters').optional().or(z.string().length(0)),
  whatsapp: z.string().regex(/^(\+92|0)?3[0-9]{9}$/, 'Invalid Pakistani WhatsApp number').optional().or(z.string().length(0)),
  referralCode: z.string().optional(),
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

interface VerificationDocument {
  id: string;
  documentType: 'cnic_front' | 'cnic_back' | 'business_license' | 'bank_statement';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'resubmit_required';
  uploadedAt: string;
  rejectionReason?: string;
  fileSize?: number;
}

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
  const [profileImageUrl, setProfileImageUrl] = React.useState<string | null>(user?.profileImage || null);
  const [verificationDocuments, setVerificationDocuments] = React.useState<VerificationDocument[]>([]);
  const [verificationStatus, setVerificationStatus] = React.useState<'pending' | 'under_review' | 'approved' | 'rejected'>('pending');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
    reset,
    trigger
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      city: (user.city || 'Karachi') as OnboardingFormData['city'],  
      area: '',
      role: user?.role || 'user',
      businessName: '',
      cnic: '',
      address: '',
      whatsapp: '',
      referralCode: '',
      terms: false
    }
  });

  const [localCity, setLocalCity] = React.useState<string>(getValues('city') || 'Karachi');
  const [localArea, setLocalArea] = React.useState<string>(getValues('area') || '');

  React.useEffect(() => {
    setValue('city', localCity as any, { shouldValidate: true, shouldDirty: true });
  }, [localCity, setValue]);

  React.useEffect(() => {
    setValue('area', localArea, { shouldValidate: true, shouldDirty: true });
  }, [localArea, setValue]);

  // Watch the role and terms values
  const role = watch('role');
  const terms = watch('terms');
  
  // Clear error when terms are accepted
  React.useEffect(() => {
    if (terms && error) {
      setError(null);
    }
  }, [terms, error]);
  
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
        // Ensure boolean values are properly converted
        if (key === 'terms') {
          const boolValue = value === true || String(value).toLowerCase() === 'true';
          setValue(key as keyof OnboardingFormData, boolValue);
        } else if (key === 'city') {
          const cityValue = value as OnboardingFormData['city'];
          setValue(key as keyof OnboardingFormData, cityValue);
          setLocalCity(cityValue || 'Karachi');
        } else if (key === 'area') {
          setValue('area', value);
          setLocalArea(value || '');
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
        city: (user.city || 'Karachi') as OnboardingFormData['city'],
        area: '',
        role: user.role || 'user',
        businessName: '',
        cnic: '',
        address: '',
        whatsapp: '',
        referralCode: '',
        terms: false
      };
      
      reset(initialData);
      setLocalCity(initialData.city || 'Karachi');
      setLocalArea(initialData.area || '');
    }
  }, [user, reset, setValue]);

  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    const formData = getValues();
    const stateToSave = {
      currentStep,
      formData
    };
    saveOnboardingState(stateToSave);
  }, [currentStep, getValues]);

  // Scroll to top when step changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const steps = [
    {
      id: 'role',
      title: 'Welcome to RentParLo.pk!',
      subtitle: "Let's set up your account",
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
      description: 'Provide your business information',
      content: 'business'
    },
    {
      id: 'verification',
      title: 'Verification Documents',
      subtitle: 'Upload documents to verify your seller account',
      content: 'verification'
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
    // For users, skip the business and verification steps
    return steps.filter(step => step.id !== 'business' && step.id !== 'verification');
  }, [role]);

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      // Explicitly check terms acceptance
      if (!data.terms) {
        setError('You must accept the terms and conditions to complete setup.');
        toast.error('❌ Terms Required', {
          description: 'Please accept the Terms of Service and Privacy Policy to continue.'
        });
        return;
      }
      
      const isValid = await trigger();
      if (!isValid) {
        const errorMessages = Object.values(errors).map(error => error.message).filter(Boolean);
        if (errorMessages.length > 0) {
          toast.error('Please fix the errors before submitting.', {
            description: errorMessages.join('\n'),
          });
        }
        return;
      }
      
      setIsLoading(true);
      setError(null);

      const profileUpdateData: any = {
        name: data.name,
        phone: data.phone || null,
        city: data.city || null,
        area: data.area || null,
        role: data.role,
        onboarding_completed: true
      };

      if (profileImageUrl) {
        profileUpdateData.profile_image_url = profileImageUrl;
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileUpdateData)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete profile');
      }

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
          area: data.area || null,
          email: user.email,
          referral_code: data.referralCode || null,
          verification_status: verificationDocuments.length > 0 ? 'under_review' : 'pending'
        };
        
        const sellerResponse = await fetch('/api/profile/seller', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sellerData)
        });

        const sellerResult = await sellerResponse.json();
        if (!sellerResponse.ok) {
          throw new Error(sellerResult.error || 'Failed to create seller profile');
        }
      }

      clearOnboardingState();
      
      // Dispatch event to notify other components of profile update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profileImageUpdated'));
      }
      
      // Scroll to top after completion
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      toast.success('🎉 Welcome to RentParLo.pk!', {
        description: 'Your profile has been successfully completed. Let\'s get started!',
        duration: 5000
      });
      onComplete();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error('❌ Setup Failed', {
        description: errorMessage,
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add scroll utility function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add function to show validation errors in a user-friendly way
  const showValidationErrors = () => {
    const fieldLabels = {
      name: 'Full Name',
      phone: 'Phone Number',
      city: 'City',
      area: 'Area',
      role: 'Account Type',
      businessName: 'Business Name',
      cnic: 'CNIC Number',
      address: 'Business Address',
      whatsapp: 'WhatsApp Number',
      referralCode: 'Referral Code',
      terms: 'Terms & Conditions'
    };

    const validationErrors = Object.entries(errors).map(([field, error]) => ({
      field,
      label: fieldLabels[field as keyof typeof fieldLabels] || field,
      message: error?.message
    }));

    if (validationErrors.length === 0) return;

    // Show first error as toast
    const firstError = validationErrors[0];
    toast.error(`❌ ${firstError.label} Required`, {
      description: firstError.message,
      duration: 4000
    });

    // Scroll to first error field
    const firstErrorField = document.querySelector(`[id="${firstError.field}"]`) || 
                            document.querySelector(`[name="${firstError.field}"]`);
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (firstErrorField as HTMLElement).focus();
    }
  };
  
  // Update handleNext function
  const handleNext = async () => {
    // Define which fields to validate for each step
    const stepFields = {
      'role': ['role'],
      'profile': ['name', 'phone', 'city', 'area'],
      'business': ['businessName', 'cnic', 'address', 'whatsapp'],
      'verification': [], // No form fields, just document uploads
      'review': ['terms']
    };

    const currentStepId = filteredSteps[currentStep]?.id;
    const fieldsToValidate = stepFields[currentStepId as keyof typeof stepFields] || [];

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate as any);

      if (!isValid) {
        const validationErrors = Object.keys(errors)
          .filter(field => fieldsToValidate.includes(field))
          .map(field => errors[field as keyof OnboardingFormData]?.message)
          .filter(Boolean);

        if (validationErrors.length > 0) {
          toast.error('Please fix the errors before proceeding.', {
            description: validationErrors.join('\n'),
          });
        }
        return;
      }
    }

    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollToTop();
    }
  };
  
  // Update handlePrevious function
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    }
  };

  const handleSkip = () => {
    if (role === 'user') {
      onComplete();
    }
  };

  const handleRoleSelect = (selectedRole: 'user' | 'seller') => {
    setValue('role', selectedRole);
    
    if (selectedRole === 'user' && currentStep > 1) {
      setCurrentStep(1);
    }
  };

  const handleProfileImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/profile/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const result = await response.json();
    return result.imageUrl;
  };

  const handleVerificationUpload = async (file: File, documentType: string): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await fetch('/api/verification/documents', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload document');
    }

    const result = await response.json();
    
    setVerificationDocuments(prev => {
      const updated = prev.filter(doc => doc.documentType !== documentType);
      updated.push({
        id: result.document.id,
        documentType: result.document.documentType,
        fileName: result.document.fileName,
        fileUrl: result.document.fileUrl,
        status: result.document.status,
        uploadedAt: result.document.uploadedAt,
        fileSize: file.size
      });
      return updated;
    });
  };

  const handleVerificationDelete = async (documentId: string, documentType: string): Promise<void> => {
    const response = await fetch(`/api/verification/documents?id=${documentId}&type=${documentType}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete document');
    }

    setVerificationDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const renderStepContent = () => {
    if (currentStep < 0 || currentStep >= filteredSteps.length) {
      return null;
    }
    
    const step = filteredSteps[currentStep];
    
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
              <Label>Profile Picture</Label>
              <ProfileImageUpload
                value={profileImageUrl}
                onChange={setProfileImageUrl}
                onUpload={handleProfileImageUpload}
                maxSizeInMB={5}
                acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
                placeholder="Upload profile picture"
              />
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WebP up to 5MB</p>
            </div>

            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter your full name"
                className={errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="03XX XXXXXXX"
                type="tel"
                className={errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.phone.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Pakistani mobile number format</p>
            </div>

            <div>
              <Label htmlFor="city">City & Area</Label>
              <CityAreaCombobox
                selectedCity={localCity}
                selectedArea={localArea}
                onCityChange={(city) => {
                  setLocalCity(city);
                  setLocalArea(''); // Reset area when city changes
                }}
                onAreaChange={setLocalArea}
                cityPlaceholder="Select a city"
                areaPlaceholder="Select an area"
                className={(errors.city || errors.area) ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.city.message}
                </p>
              )}
              {errors.area && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.area.message}
                </p>
              )}
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
                className={errors.businessName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              />
              {errors.businessName && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.businessName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="cnic">Owner CNIC *</Label>
              <Input
                id="cnic"
                {...register('cnic')}
                placeholder="XXXXX-XXXXXXX-X"
                className={errors.cnic ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              />
              {errors.cnic && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.cnic.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Required for verification</p>
            </div>

            <div>
              <Label htmlFor="address">Business Address *</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Enter your business address"
                className={errors.address ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.address.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Full address for verification</p>
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                {...register('whatsapp')}
                placeholder="03XX XXXXXXX"
                type="tel"
                className={errors.whatsapp ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              />
              {errors.whatsapp && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.whatsapp.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">For customer communication</p>
            </div>
          </div>
        );

      case 'verification':
        return (
          <VerificationUpload
            documents={verificationDocuments}
            verificationStatus={verificationStatus}
            onUpload={handleVerificationUpload}
            onDelete={handleVerificationDelete}
            isLoading={isLoading}
          />
        );

      case 'review':
        const formData = getValues();
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
                <p><span className="text-muted-foreground">Area:</span> {formData.area || 'Not provided'}</p>
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

            <div className="space-y-2">
              <Label htmlFor="referralCode">Coupon Code (Optional)</Label>
              <Input
                id="referralCode"
                {...register('referralCode')}
                placeholder="Enter coupon or referral code"
              />
            </div>

            <div className={`flex items-start space-x-2 ${(!terms && error) || errors.terms ? 'animate-pulse' : ''}`}>
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  {...register('terms')}
                  className={`h-4 w-4 rounded border-muted-foreground text-primary focus:ring-primary ${
                    errors.terms ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
              </div>
              <Label htmlFor="terms" className="text-sm font-medium leading-none">
                I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </Label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.terms.message}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

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
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 mb-1">Setup Incomplete</h3>
                  <div className="text-sm text-red-700 whitespace-pre-line">{error}</div>
                  <p className="text-xs text-red-600 mt-2">
                    Please review the highlighted fields above and make the necessary corrections.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-2 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handlePrevious}
                disabled={currentStep === 0 || isLoading}
              >
                Previous
              </Button>

              {currentStep === filteredSteps.length - 1 ? (
                <Button
                  type="submit"
                  size="md"
                  disabled={isLoading || !terms}
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
                  size="md"
                  onClick={handleNext}
                  disabled={isLoading}
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