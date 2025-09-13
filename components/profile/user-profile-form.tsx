'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { updateUserProfile, updateSellerProfile } from '@/lib/supabase-queries-client';
import Link from 'next/link';
import { CityAreaCombobox } from '@/components/search/city-area-combobox';
import { ProfileImageUpload } from '@/components/forms/profile-image-upload';

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters.',
    })
    .max(30, {
      message: 'Name must not be longer than 30 characters.',
    }),
  email: z
    .string({
      required_error: 'Please select an email to display.',
    })
    .email(),
  phone: z
    .string()
    .regex(/^(\+92|0)?[0-9]{10}$/, 'Invalid Pakistani phone number format')
    .optional()
    .or(z.literal('')),
  city: z.string().optional(),
  area: z.string().optional(),
  bio: z
    .string()
    .max(160, {
      message: 'Bio must not be longer than 160 characters.',
    })
    .optional(),
  address: z
    .string()
    .max(200, {
        message: 'Address must not be longer than 200 characters.',
    })
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfileFormProps {
  initialData: any;
  sellerProfile?: any;
}

export function UserProfileForm({ initialData, sellerProfile }: UserProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localCity, setLocalCity] = useState<string>(initialData?.city || 'Karachi');
  const [localArea, setLocalArea] = useState<string>(initialData?.area || '');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(initialData?.profile_image_url || null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      city: initialData?.city || 'Karachi',
      area: initialData?.area || '',
      bio: initialData?.bio || '',
      address: sellerProfile?.address_line1 || '',
    },
  });

  useEffect(() => {
    form.setValue('city', localCity);
  }, [localCity, form.setValue]);

  useEffect(() => {
    form.setValue('area', localArea);
  }, [localArea, form.setValue]);

  const handleImageUpload = async (file: File): Promise<string> => {
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

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsLoading(true);
      
      const userUpdatePromise = updateUserProfile({
        name: data.name,
        phone: data.phone || null,
        city: data.city || null,
        area: data.area || null,
        bio: data.bio || null,
        profile_image_url: profileImageUrl,
      });

      const sellerUpdatePromise = sellerProfile ? updateSellerProfile({
        address_line1: data.address || null,
        city: data.city || null,
        area: data.area || null,
      }) : Promise.resolve({ success: true });

      const [userResult, sellerResult] = await Promise.all([userUpdatePromise, sellerUpdatePromise]);
      
      if (userResult.success && sellerResult.success) {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
      } else {
        throw new Error(userResult.error || sellerResult.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-2">
            <FormLabel>Profile Picture</FormLabel>
            <ProfileImageUpload
                value={profileImageUrl || undefined}
                onChange={setProfileImageUrl}
                onUpload={handleImageUpload}
            />
            <FormDescription>
                Upload a profile picture. Max 5MB.
            </FormDescription>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed on your profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your email" {...field} disabled />
                </FormControl>
                <FormDescription>
                  This is your account email. Contact support to change it.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="03001234567" {...field} />
                </FormControl>
                <FormDescription>
                  Pakistani phone number format (e.g., 03001234567).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="md:col-span-1">
            <FormLabel>Location</FormLabel>
            <CityAreaCombobox
              selectedCity={localCity}
              selectedArea={localArea}
              onCityChange={setLocalCity}
              onAreaChange={setLocalArea}
            />
            <FormDescription className="mt-2">
              The city and area where you are located.
            </FormDescription>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Brief description for your profile. Maximum 160 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {sellerProfile && (
            <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                    <Textarea
                        placeholder="Your business address"
                        className="resize-none"
                        {...field}
                    />
                    </FormControl>
                    <FormDescription>
                        Your full business address for verification and location purposes.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
        )}
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Profile
          </Button>
        </div>
        
        {sellerProfile && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Business Name</p>
                <p>{sellerProfile.business_name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p>{sellerProfile.username || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verification Status</p>
                <p className="capitalize">{sellerProfile.verification_status || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tier</p>
                <p className="capitalize">{sellerProfile.tier || 'Not set'}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.open(`/seller/${sellerProfile.username}`, '_blank')}
            >
              View Public Profile
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}