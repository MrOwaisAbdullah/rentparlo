'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, ArrowRight, MapPin, Phone, User, Store, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormField } from '@/components/forms/form-field';
import { RoleSelector } from '@/components/auth/role-selector';
import { z } from 'zod';
import { toast } from 'sonner';
import { VerificationUpload } from '@/components/verification/verification-upload';
import { CityAreaCombobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { CITY_AREAS } from '@/lib/area-utils';

const welcomeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^(\+92|0)?3[0-9]{9}$/, 'Invalid Pakistani phone number'),
  city: z.enum([
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana'
  ]),
  role: z.enum(['user', 'seller']),
  businessName: z.string().optional(),
  cnic: z.string().optional(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms')
}).refine(data => {
  if (data.role === 'seller') return data.businessName && data.businessName.length >= 2;
  return true;
}, {
  message: 'Business name is required for sellers',
  path: ['businessName'],
}).refine(data => {
  if (data.role === 'seller') {
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    return !!data.cnic && cnicRegex.test(data.cnic);
  }
  return true;
}, {
  message: 'A valid CNIC is required for sellers (e.g., 12345-1234567-1)',
  path: ['cnic'],
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

function ProfileImageUpload({ initialImageUrl, onUploadSuccess }: { initialImageUrl?: string, onUploadSuccess: (url: string) => void }) {
  const [preview, setPreview] = React.useState(initialImageUrl);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/profile/image', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload failed');
      setPreview(result.imageUrl);
      onUploadSuccess(result.imageUrl);
      toast.success('Profile picture updated!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 mb-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed">
          {preview ? <img src={preview} alt="Profile Preview" className="w-full h-full rounded-full object-cover" /> : <User className="w-10 h-10 text-muted-foreground" />}
        </div>
        {isUploading && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}
      </div>
      <Button asChild variant="outline" size="sm">
        <label htmlFor="profile-image-upload" className="cursor-pointer">
          {isUploading ? 'Uploading...' : 'Upload Picture'}
          <input id="profile-image-upload" type="file" className="sr-only" onChange={handleFileChange} disabled={isUploading} accept="image/png, image/jpeg, image/webp" />
        </label>
      </Button>
    </div>
  );
}

const pakistaniCities = [
  { value: 'Karachi', label: 'Karachi' }, { value: 'Lahore', label: 'Lahore' }, { value: 'Islamabad', label: 'Islamabad' },
  { value: 'Rawalpindi', label: 'Rawalpindi' }, { value: 'Faisalabad', label: 'Faisalabad' }, { value: 'Multan', label: 'Multan' },
  { value: 'Peshawar', label: 'Peshawar' }, { value: 'Quetta', label: 'Quetta' }, { value: 'Sialkot', label: 'Sialkot' },
  { value: 'Gujranwala', label: 'Gujranwala' }, { value: 'Hyderabad', label: 'Hyderabad' }, { value: 'Bahawalpur', label: 'Bahawalpur' },
  { value: 'Sargodha', label: 'Sargodha' }, { value: 'Sukkur', label: 'Sukkur' }, { value: 'Larkana', label: 'Larkana' }
];

export function WelcomeFlow({ user }: WelcomeFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = React.useState(user?.profileImage);
  const router = useRouter();

  const { handleSubmit, formState: { errors, isValid }, setValue, setError: setFieldError, watch, reset } = useForm<WelcomeFormData>({
    resolver: zodResolver(welcomeSchema), mode: 'onChange',
    defaultValues: { name: user?.name || '', phone: user?.phone || '', city: user?.city || 'Karachi', role: user?.role || 'user', terms: false, businessName: '', cnic: '' }
  });

  const formData = watch();

  const baseSteps = [
    { id: 'profile', title: 'Welcome to RentParLo.pk!', subtitle: 'Let\'s complete your profile to get started' },
    { id: 'role', title: 'Choose Your Role', subtitle: 'How do you plan to use RentParLo.pk?' },
  ];
  const sellerSteps = [
    { id: 'business', title: 'Business Details', subtitle: 'Tell us about your business' },
    { id: 'verification', title: 'Verification Documents', subtitle: 'Upload documents to verify your seller account' },
  ];
  const finalStep = { id: 'review', title: 'Almost Done!', subtitle: 'Review your information and accept our terms' };

  const steps = React.useMemo(() => formData.role === 'seller' ? [...baseSteps, ...sellerSteps, finalStep] : [...baseSteps, finalStep], [formData.role]);

  React.useEffect(() => {
    reset({ name: user?.name || '', phone: user?.phone || '', city: user?.city || 'Karachi', role: user?.role || 'user', terms: false });
    setProfileImageUrl(user?.profileImage);
  }, [user, reset]);

  const onSubmit = async (data: WelcomeFormData) => {
    setIsLoading(true); setError(null);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, phone: data.phone, city: data.city, role: data.role, onboarding_completed: true, profile_image_url: profileImageUrl })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update profile');

      if (data.role === 'seller') {
        const sellerResponse = await fetch('/api/profile', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileType: 'seller', username: user.email.split('@')[0], business_name: data.businessName, owner_cnic: data.cnic })
        });
        if (!sellerResponse.ok) {
          const sellerResult = await sellerResponse.json();
          toast.error(`Could not create seller profile: ${sellerResult.error}`);
        }
      }
      toast.success('Welcome! Your profile has been completed.');
      router.push('/dashboard?onboarding=complete');
    } catch (err: any) {
      const errorMessage = err?.message || 'An unknown error occurred';
      toast.error(errorMessage);
      setError(errorMessage);
      if (errorMessage.toLowerCase().includes('phone')) {
        setFieldError('phone', { type: 'manual', message: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'profile': return (
        <div className="space-y-4">
          <ProfileImageUpload initialImageUrl={profileImageUrl} onUploadSuccess={setProfileImageUrl} />
          <FormField id="name" label="Full Name" value={formData.name} error={errors.name?.message} required icon={User} onChange={v => setValue('name', v as string)} />
          <FormField id="phone" label="Phone Number" type="tel" placeholder="03XX XXXXXXX" value={formData.phone} error={errors.phone?.message} required icon={Phone} onChange={v => setValue('phone', v as string)} />
          <div>
            <Label htmlFor="city">City</Label>
            <CityAreaCombobox
              cities={Object.keys(CITY_AREAS)}
              selectedCity={formData.city || ''}
              selectedArea={""}
              onCityChange={(value) => setValue('city', value as any)}
              onAreaChange={() => {}} // No area selection needed in this form
              cityPlaceholder="Select a city"
              className="flex-nowrap"
              size="md"
            />
            {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
          </div>
        </div>
      );
      case 'role': return <RoleSelector selected={formData.role} onSelect={role => setValue('role', role)} />;
      case 'business': return (
        <div className="space-y-4">
          <FormField id="businessName" label="Business Name" placeholder="Your business or shop name" value={formData.businessName || ''} error={errors.businessName?.message} required icon={Store} onChange={v => setValue('businessName', v as string)} />
          <FormField id="cnic" label="Owner CNIC" placeholder="XXXXX-XXXXXXX-X" value={formData.cnic || ''} error={errors.cnic?.message} required icon={User} description="Required for verification." onChange={v => setValue('cnic', v as string)} />
        </div>
      );
      case 'verification': return (
        <div>
          <p className="text-sm text-muted-foreground mb-6">Please upload clear images of the front and back of your CNIC.</p>
          <div className="space-y-6">
            <VerificationUpload documentType="cnic_front" label="CNIC Front Side" userId={user.id} />
            <VerificationUpload documentType="cnic_back" label="CNIC Back Side" userId={user.id} />
          </div>
        </div>
      );
      case 'review': return (
        <div className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h4 className="font-semibold">Profile Summary</h4>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span className="font-medium">{formData.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span><span className="font-medium">{formData.phone}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Account Type:</span><span className="font-medium capitalize">{formData.role}</span></div>
              {formData.role === 'seller' && (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Business:</span><span className="font-medium">{formData.businessName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">CNIC:</span><span className="font-medium">{formData.cnic}</span></div>
                </>
              )}
            </div>
          </div>
          <FormField id="terms" label="I agree to the Terms of Service and Privacy Policy" type="checkbox" value={formData.terms} error={errors.terms?.message} required onChange={v => setValue('terms', v as boolean)} />
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2"><span>Step {currentStep + 1} of {steps.length}</span><span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span></div>
          <div className="w-full bg-muted rounded-full h-2"><motion.div className="bg-primary h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} transition={{ duration: 0.3 }} /></div>
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-6">
            <motion.div key={currentStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <CardTitle className="text-2xl mb-2">{steps[currentStep].title}</CardTitle>
              <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
            </motion.div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>{renderStepContent()}</motion.div>
            <AnimatePresence>
              {error && !errors.phone && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6"><Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert></motion.div>}
            </AnimatePresence>
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 0 || isLoading}>Previous</Button>
              {currentStep === steps.length - 1 ? <Button type="submit" disabled={!isValid || isLoading} className="min-w-[120px]">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Complete Setup'}</Button> : <Button type="button" onClick={handleNext} disabled={isLoading} className="min-w-[120px]">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}