'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X, 
  Plus, 
  MapPin, 
  DollarSign, 
  Clock,
  FileText,
  Save,
  Eye,
  Loader2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import FileUpload from "@/components/kokonutui/file-upload";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
}

interface CreateListingFormProps {
  user: User;
  categories: Category[];
}

// Form validation schema
const createListingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title too long'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000, 'Description too long'),
  category: z.string().min(1, 'Please select a category'),
  price: z.number().min(1, 'Price must be greater than 0'),
  priceType: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
  availability: z.enum(['available', 'rented', 'maintenance']),
  location: z.object({
    city: z.string().min(1, 'City is required'),
    area: z.string().min(1, 'Area is required'),
    address: z.string().optional()
  }),
  specifications: z.array(z.object({
    key: z.string().min(1, 'Specification name is required'),
    value: z.string().min(1, 'Specification value is required')
  })).optional(),
  images: z.array(z.string()).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
  tags: z.array(z.string()).optional(),
  minimumRentalPeriod: z.string().optional(),
  securityDeposit: z.number().optional(),
  deliveryOptions: z.object({
    pickup: z.boolean(),
    delivery: z.boolean(),
    deliveryFee: z.number().optional()
  }),
  policies: z.object({
    cancellationPolicy: z.string().optional(),
    damagePolicy: z.string().optional(),
    lateReturnPolicy: z.string().optional()
  })
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

const PAKISTANI_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Sargodha'
];

const CONDITIONS = [
  { value: 'new', label: 'New', description: 'Brand new, never used' },
  { value: 'like-new', label: 'Like New', description: 'Used once or twice, excellent condition' },
  { value: 'good', label: 'Good', description: 'Well maintained, minor signs of use' },
  { value: 'fair', label: 'Fair', description: 'Shows wear, but fully functional' },
  { value: 'poor', label: 'Poor', description: 'Heavily used, may have cosmetic issues' }
];

const PRICE_TYPES = [
  { value: 'hourly', label: 'Per Hour', icon: Clock },
  { value: 'daily', label: 'Per Day', icon: Clock },
  { value: 'weekly', label: 'Per Week', icon: Calendar },
  { value: 'monthly', label: 'Per Month', icon: Calendar }
];

export function CreateListingForm({ user, categories }: CreateListingFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [previewMode, setPreviewMode] = React.useState(false);

  // Add image validation function
  const validateImageFile = (file: File): { message: string; code: string } | null => {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      return {
        message: "Please upload a valid image file (JPEG, JPG, PNG, GIF, WEBP)",
        code: "INVALID_IMAGE_TYPE"
      };
    }
    return null;
  };

  // Handle successful file upload
  const handleFileUploadSuccess = async (file: File) => {
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Show upload progress
      setUploadProgress(30);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      setUploadProgress(70);

      if (response.ok) {
        const { url } = await response.json();
        const currentImages = form.getValues('images') || [];
        form.setValue('images', [...currentImages, url]);
        setUploadProgress(100);
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // Reset progress on error
      setUploadProgress(0);
    }
  };

  const form = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      price: 0,
      priceType: 'daily',
      condition: 'good',
      availability: 'available',
      location: {
        city: '',
        area: '',
        address: ''
      },
      specifications: [{ key: '', value: '' }],
      images: [],
      tags: [],
      minimumRentalPeriod: '',
      securityDeposit: 0,
      deliveryOptions: {
        pickup: true,
        delivery: false,
        deliveryFee: 0
      },
      policies: {
        cancellationPolicy: '',
        damagePolicy: '',
        lateReturnPolicy: ''
      }
    }
  });

  const { fields: specFields, append: addSpec, remove: removeSpec } = useFieldArray({
    control: form.control,
    name: 'specifications'
  });

  const watchedValues = form.watch();

  const steps = [
    {
      title: 'Basic Information',
      description: 'Item title, description, and category',
      fields: ['title', 'description', 'category']
    },
    {
      title: 'Pricing & Condition',
      description: 'Set your rental price and item condition',
      fields: ['price', 'priceType', 'condition', 'securityDeposit']
    },
    {
      title: 'Location & Delivery',
      description: 'Where customers can pick up or receive the item',
      fields: ['location', 'deliveryOptions']
    },
    {
      title: 'Images & Details',
      description: 'Upload photos and add specifications',
      fields: ['images', 'specifications', 'tags']
    },
    {
      title: 'Policies & Terms',
      description: 'Set rental policies and terms',
      fields: ['policies', 'minimumRentalPeriod']
    }
  ];

  const onSubmit = async (data: CreateListingFormData) => {
    setIsSubmitting(true);

    try {
      // Create listing in Sanity
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          supabaseId: user.id,
          status: 'pending', // Pending admin approval
          createdAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const { listingId } = await response.json();
        
        // Track analytics
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'listing_click',
            listing_id: listingId,
            metadata: {
              category: data.category,
              price: data.price,
              priceType: data.priceType
            }
          })
        });

        // Redirect to dashboard with success message
        router.push('/dashboard?success=listing-created');
      } else {
        throw new Error('Failed to create listing');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    const currentStepFields = steps[currentStep].fields;
    form.trigger(currentStepFields as any).then((isValid) => {
      if (isValid && currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    });
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepValidation = (stepIndex: number) => {
    const stepFields = steps[stepIndex].fields;
    const formState = form.formState;
    
    // Check if any field in this step has errors
    const hasErrors = stepFields.some(field => {
      return formState.errors[field as keyof typeof formState.errors];
    });

    // Check if all required fields in this step are filled
    const values = form.getValues();
    const isComplete = stepFields.every(field => {
      const value = values[field as keyof typeof values];
      return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
    });

    return { hasErrors, isComplete };
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        {/* Preview Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Preview Your Listing</h2>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <FileText className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        {/* Preview Content */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Images */}
              <div>
                {watchedValues.images && watchedValues.images.length > 0 && (
                  <div className="space-y-2">
                    <img 
                      src={watchedValues.images[0]} 
                      alt={watchedValues.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {watchedValues.images.length > 1 && (
                      <div className="flex gap-2">
                        {watchedValues.images.slice(1, 4).map((img, idx) => (
                          <img 
                            key={idx}
                            src={img} 
                            alt=""
                            className="w-20 h-20 object-cover rounded"
                          />
                        ))}
                        {watchedValues.images.length > 4 && (
                          <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-600">
                            +{watchedValues.images.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold">{watchedValues.title}</h3>
                  <p className="text-gray-600 mt-2">{watchedValues.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-primary">
                    PKR {watchedValues.price?.toLocaleString()}/{watchedValues.priceType}
                  </div>
                  <Badge>{CONDITIONS.find(c => c.value === watchedValues.condition)?.label}</Badge>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {watchedValues.location.area}, {watchedValues.location.city}
                </div>

                {watchedValues.specifications && watchedValues.specifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Specifications</h4>
                    <div className="space-y-1">
                      {watchedValues.specifications.map((spec, idx) => (
                        spec.key && spec.value && (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{spec.key}:</span>
                            <span>{spec.value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            Back to Edit
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Listing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Publish Listing
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const { hasErrors, isComplete } = getStepValidation(index);
            const isActive = index === currentStep;
            const isPast = index < currentStep;
            
            return (
              <div key={index} className="flex-1">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    isPast ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                    hasErrors ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {isPast ? '✓' : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      isPast ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                <div className="mt-2">
                  <div className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 0: Basic Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Listing Title *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="e.g., Professional DSLR Camera Canon EOS 5D Mark IV"
                  className="mt-1"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => form.setValue('category', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Provide a detailed description of your item. Include its condition, specifications, what's included, and any special features..."
                  rows={6}
                  className="mt-1"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{form.formState.errors.description?.message}</span>
                  <span>{watchedValues.description?.length || 0}/2000</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Pricing & Condition */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Rental Price *</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="price"
                      type="number"
                      {...form.register('price', { valueAsNumber: true })}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                  {form.formState.errors.price && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.price.message}</p>
                  )}
                </div>

                <div>
                  <Label>Price Type *</Label>
                  <Select onValueChange={(value) => form.setValue('priceType', value as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select pricing period" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Item Condition *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {CONDITIONS.map((condition) => (
                    <div 
                      key={condition.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        watchedValues.condition === condition.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => form.setValue('condition', condition.value as any)}
                    >
                      <div className="font-medium">{condition.label}</div>
                      <div className="text-sm text-gray-600">{condition.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="securityDeposit">Security Deposit (Optional)</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="securityDeposit"
                    type="number"
                    {...form.register('securityDeposit', { valueAsNumber: true })}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Amount to be held as security (refundable)
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Location & Delivery */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Select onValueChange={(value) => form.setValue('location.city', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAKISTANI_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.location?.city && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.location.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="area">Area *</Label>
                  <Input
                    id="area"
                    {...form.register('location.area')}
                    placeholder="e.g., Gulshan, Model Town"
                    className="mt-1"
                  />
                  {form.formState.errors.location?.area && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.location.area.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address">Full Address (Optional)</Label>
                <Textarea
                  id="address"
                  {...form.register('location.address')}
                  placeholder="Full address for delivery or pickup"
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="space-y-4">
                <Label>Delivery Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Pickup Available</div>
                      <div className="text-sm text-gray-600">Customers can pick up the item</div>
                    </div>
                    <Button
                      type="button"
                      variant={watchedValues.deliveryOptions?.pickup ? "default" : "outline"}
                      onClick={() => form.setValue('deliveryOptions.pickup', !watchedValues.deliveryOptions?.pickup)}
                    >
                      {watchedValues.deliveryOptions?.pickup ? 'Enabled' : 'Enable'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Delivery Available</div>
                      <div className="text-sm text-gray-600">Deliver the item to customers</div>
                    </div>
                    <Button
                      type="button"
                      variant={watchedValues.deliveryOptions?.delivery ? "default" : "outline"}
                      onClick={() => form.setValue('deliveryOptions.delivery', !watchedValues.deliveryOptions?.delivery)}
                    >
                      {watchedValues.deliveryOptions?.delivery ? 'Enabled' : 'Enable'}
                    </Button>
                  </div>

                  {watchedValues.deliveryOptions?.delivery && (
                    <div>
                      <Label htmlFor="deliveryFee">Delivery Fee (PKR)</Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="deliveryFee"
                          type="number"
                          {...form.register('deliveryOptions.deliveryFee', { valueAsNumber: true })}
                          placeholder="0"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Images & Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label>Item Images *</Label>
                <div className="mt-2">
                  <FileUpload
                    onUploadSuccess={(file) => {
                      // Handle the uploaded file
                      handleFileUploadSuccess(file);
                    }}
                    onUploadError={(error) => {
                      console.error('Image upload error:', error.message);
                    }}
                    acceptedFileTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']}
                    maxFileSize={5 * 1024 * 1024} // 5MB limit as per project requirements
                    validateFile={validateImageFile}
                    uploadDelay={0} // No simulation, upload immediately
                    className="w-full"
                  />
                  {uploadProgress > 0 && (
                    <div className="mt-2">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-gray-500 mt-1">Uploading... {Math.round(uploadProgress)}%</p>
                    </div>
                  )}
                </div>
                {form.formState.errors.images && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.images.message}</p>
                )}

                {watchedValues.images && watchedValues.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {watchedValues.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={img} 
                          alt={`Uploaded ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const newImages = [...watchedValues.images || []];
                            newImages.splice(idx, 1);
                            form.setValue('images', newImages);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Specifications</Label>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => addSpec({ key: '', value: '' })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3 mt-2">
                  {specFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        {...form.register(`specifications.${index}.key`)}
                        placeholder="e.g., Brand"
                        className="flex-1"
                      />
                      <Input
                        {...form.register(`specifications.${index}.value`)}
                        placeholder="e.g., Canon"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSpec(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., camera, photography, professional"
                  className="mt-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const tags = watchedValues.tags || [];
                      const newTag = (e.target as HTMLInputElement).value.trim();
                      if (newTag && !tags.includes(newTag)) {
                        form.setValue('tags', [...tags, newTag]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {watchedValues.tags?.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = [...watchedValues.tags || []];
                          newTags.splice(idx, 1);
                          form.setValue('tags', newTags);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Policies & Terms */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="minimumRentalPeriod">Minimum Rental Period (Optional)</Label>
                <Input
                  id="minimumRentalPeriod"
                  {...form.register('minimumRentalPeriod')}
                  placeholder="e.g., 1 day, 1 week"
                  className="mt-1"
                />
              </div>

              <div className="space-y-4">
                <Label>Rental Policies</Label>
                
                <div>
                  <Label htmlFor="cancellationPolicy" className="text-sm font-normal">Cancellation Policy</Label>
                  <Textarea
                    id="cancellationPolicy"
                    {...form.register('policies.cancellationPolicy')}
                    placeholder="When can customers cancel and get a refund?"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="damagePolicy" className="text-sm font-normal">Damage Policy</Label>
                  <Textarea
                    id="damagePolicy"
                    {...form.register('policies.damagePolicy')}
                    placeholder="What happens if the item is damaged?"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="lateReturnPolicy" className="text-sm font-normal">Late Return Policy</Label>
                  <Textarea
                    id="lateReturnPolicy"
                    {...form.register('policies.lateReturnPolicy')}
                    placeholder="What happens if the item is returned late?"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button 
          type="button"
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep === steps.length - 1 && (
            <Button 
              type="button"
              variant="outline"
              onClick={() => setPreviewMode(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Listing
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

export default CreateListingForm;

