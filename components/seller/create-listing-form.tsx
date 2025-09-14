"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CityAreaCombobox } from "@/components/ui/combobox";
import { CITY_AREAS } from "@/lib/area-utils";
import FileUpload from "@/components/kokonutui/file-upload";
import { Listing } from "@/types";

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  [key: string]: any; // Allow additional properties
}

interface Category {
  _id: string;
  title: string;
  slug: string | { current: string };
  description?: string;
  [key: string]: any; // Allow additional properties
}

interface CreateListingFormProps {
  user: User;
  categories: Category[];
  editMode?: boolean;
  listing?: Listing;
}

// Form validation schema - updated to match Sanity schema
const createListingSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title too long"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description too long"),
  category: z.string().min(1, "Please select a category"),
  price: z.number().min(1, "Price must be greater than 0"),
  pricePerHour: z.number().optional(),
  priceWeekly: z.number().optional(),
  priceMonthly: z.number().optional(),
  condition: z.enum(["new", "like-new", "good", "fair"]),
  location: z.object({
    city: z.string().min(1, "City is required"),
    area: z.string().min(1, "Area is required"),
  }),
  images: z
    .array(
      z.union([
        z.string(), // For backward compatibility with URLs
        z.object({
          url: z.string(),
          assetId: z.string(),
        }),
      ])
    )
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),
  specifications: z
    .array(
      z.object({
        key: z.string().min(1, "Specification name is required"),
        value: z.string().min(1, "Specification value is required"),
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
  rentalRules: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    })
    .optional(),
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

const PAKISTANI_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Sargodha",
];

const CONDITIONS = [
  { value: "new", label: "New", description: "Brand new, never used" },
  {
    value: "like-new",
    label: "Like New",
    description: "Used once or twice, excellent condition",
  },
  {
    value: "good",
    label: "Good",
    description: "Well maintained, minor signs of use",
  },
  {
    value: "fair",
    label: "Fair",
    description: "Shows wear, but fully functional",
  },
  {
    value: "poor",
    label: "Poor",
    description: "Heavily used, may have cosmetic issues",
  },
];

const PRICE_TYPES = [
  { value: "hourly", label: "Per Hour", icon: Clock },
  { value: "daily", label: "Per Day", icon: Clock },
  { value: "weekly", label: "Per Week", icon: Calendar },
  { value: "monthly", label: "Per Month", icon: Calendar },
];

export function CreateListingForm({
  user,
  categories,
  editMode,
  listing,
}: CreateListingFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [previewMode, setPreviewMode] = React.useState(false);

  console.log("Current step:", currentStep);

  // Helper function to get image URL from either format
  const getImageUrl = (
    image: string | { url?: string; assetId?: string }
  ): string => {
    if (typeof image === "string") {
      return image;
    }
    return image.url || "";
  };

  // Add image validation function
  const validateImageFile = (
    file: File
  ): { message: string; code: string } | null => {
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validImageTypes.includes(file.type)) {
      return {
        message: "Please upload a valid image file (JPEG, JPG, PNG, GIF, WEBP)",
        code: "INVALID_IMAGE_TYPE",
      };
    }
    return null;
  };

  // Handle successful file upload
  const handleFileUploadSuccess = async (file: File) => {
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("image", file);

      // Show upload progress
      setUploadProgress(30);

      const response = await fetch("/api/upload/listing-image", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(70);

      if (response.ok) {
        const { url, assetId } = await response.json();
        const currentImages = form.getValues("images") || [];
        // Store an object with both URL (for preview) and assetId (for Sanity)
        form.setValue("images", [...currentImages, { url, assetId }]);
        setUploadProgress(100);

        // Reset progress after a short delay
        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      // Reset progress on error
      setUploadProgress(0);
    }
  };

  // Convert listing data to form default values for edit mode
  const getDefaultValues = (): CreateListingFormData => {
    if (editMode && listing) {
      return {
        title: listing.title || "",
        description: listing.description || "",
        category: listing.category?._id || "",
        price: listing.price || 1, // Minimum valid price
        pricePerHour: listing.pricePerHour || undefined,
        priceWeekly: listing.priceWeekly || undefined,
        priceMonthly: listing.priceMonthly || undefined,
        condition: listing.condition || "good",
        location: {
          city: listing.location?.city || "",
          area: listing.location?.area || "",
        },
        images:
          listing.images
            ?.map((img) => {
              // For edit mode, we need to extract asset ID from the existing image
              if (img.asset?._ref) {
                // If we have the asset reference, use it
                return {
                  url: img.asset.url || "",
                  assetId: img.asset._ref,
                };
              } else if (img.asset?.url) {
                // If we only have URL, extract asset ID from it
                const urlParts = img.asset.url.split("/");
                const filename = urlParts[urlParts.length - 1];
                const assetId = filename.split("-")[0];
                return {
                  url: img.asset.url,
                  assetId: assetId,
                };
              }
              return null;
            })
            .filter(Boolean) || [],
        specifications: listing.specifications || [{ key: "", value: "" }],
        tags: listing.tags || [],
        rentalRules: listing.rentalRules || [],
        badges: listing.badges || [],
        seo: listing.seo || {
          metaTitle: "",
          metaDescription: "",
        },
      } as CreateListingFormData;
    }

    return {
      title: "",
      description: "",
      category: "", // Will be selected by user
      price: 1, // Minimum valid price to pass validation
      condition: "good",
      location: {
        city: "",
        area: "",
      },
      specifications: [{ key: "", value: "" }],
      images: [], // Will be uploaded by user
      tags: [],
      rentalRules: [],
      badges: [],
      seo: {
        metaTitle: "",
        metaDescription: "",
      },
    } as CreateListingFormData;
  };

  const form = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: getDefaultValues(),
  });

  const {
    fields: specFields,
    append: addSpec,
    remove: removeSpec,
  } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  const watchedValues = form.watch();

  const steps = [
    {
      title: "Basic Information",
      description: "Item title, description, and category",
      fields: ["title", "description", "category"],
    },
    {
      title: "Pricing & Condition",
      description: "Set your rental price and item condition",
      fields: [
        "price",
        "pricePerHour",
        "priceWeekly",
        "priceMonthly",
        "condition",
      ],
    },
    {
      title: "Location",
      description: "Where customers can pick up the item",
      fields: ["location"],
    },
    {
      title: "Images & Details",
      description: "Upload photos and add specifications",
      fields: ["images", "specifications", "tags"],
    },
    {
      title: "Rental Rules",
      description: "Set rental policies and terms",
      fields: ["rentalRules", "badges"],
    },
  ];

  const onSubmit = async (data: CreateListingFormData) => {
    console.log("Form submission started with data:", data);

    // Validate that we're on the last step
    if (currentStep !== steps.length - 1) {
      console.log(
        "Form submission attempted but not on last step:",
        currentStep
      );
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Creating listing with data:", data);

      // Handle image assets - extract asset IDs from the image data
      console.log("Raw image data:", data.images);
      const imageAssets = data.images
        .map((image) => {
          console.log("Processing image:", image, "Type:", typeof image);
          if (typeof image === "string") {
            // Legacy format - could be URL or asset ID
            if (image.startsWith("http") || image.includes("cdn.sanity.io")) {
              // Extract asset ID from Sanity URL
              // URL format: https://cdn.sanity.io/images/{projectId}/{dataset}/{assetId}-{dimensions}.{ext}
              const urlParts = image.split("/");
              const filename = urlParts[urlParts.length - 1];
              // Remove dimensions and extension to get clean asset ID
              const assetId = filename.split("-")[0];
              console.log(
                "Extracted asset ID from URL:",
                assetId,
                "from:",
                image
              );
              return assetId;
            }
            // Assume it's already an asset ID
            console.log("Using string as asset ID:", image);
            return image;
          } else if (image && typeof image === "object") {
            // New format with both URL and assetId
            if (image.assetId) {
              console.log("Using assetId from object:", image.assetId);
              return image.assetId;
            } else if (image.url) {
              // Fallback: extract from URL if assetId is missing
              const urlParts = image.url.split("/");
              const filename = urlParts[urlParts.length - 1];
              const assetId = filename.split("-")[0];
              console.log("Extracted asset ID from object URL:", assetId);
              return assetId;
            }
          }
          console.error("Invalid image format:", image);
          return null;
        })
        .filter(Boolean);

      console.log("Final imageAssets:", imageAssets);

      // Map form data to Sanity schema
      const listingData = {
        title: data.title,
        description: data.description,
        category: {
          _ref: data.category,
          _type: 'reference'
        },
        price: data.price,
        priceType: 'daily', // Fixed to daily
        pricePerHour: data.pricePerHour,
        priceWeekly: data.priceWeekly,
        priceMonthly: data.priceMonthly,
        condition: data.condition,
        location: {
          city: data.location.city,
          area: data.location.area,
        },
        images: imageAssets.map((assetId, index) => ({
          _type: 'image',
          _key: `image-${index}-${Date.now()}`, // Add unique key
          asset: {
            _ref: assetId,
            _type: 'reference'
          }
        })),
        specifications: (data.specifications?.filter(spec => spec.key && spec.value) || []).map((spec, index) => ({
          _key: `spec-${index}-${Date.now()}`, // Add unique key
          ...spec
        })),
        tags: data.tags || [],
        rentalRules: data.rentalRules || [],
        badges: data.badges || [],
        seo: data.seo,
        // Add required fields for Sanity schema
        status: 'pending',
        published: false,
        isFeatured: false,
        isVerified: false,
        availability: {
          isAvailable: true
        }
      };

      console.log("Mapped listing data:", listingData);

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...listingData,
          supabaseId: user.id,
          createdAt: new Date().toISOString(),
        }),
      });

      console.log("API response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Listing created successfully:", result);
        router.push("/dashboard/listings");
      } else {
        const errorData = await response.json();
        console.error("Failed to create listing:", errorData);
        // Handle error (show notification, etc.)
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    console.log("Next button clicked");
    const currentStepFields = steps[currentStep].fields;
    console.log("Validating fields for step:", currentStep, currentStepFields);

    form.trigger(currentStepFields as any).then((isValid) => {
      console.log("Validation result for step", currentStep, ":", isValid);
      console.log("Current step:", currentStep, "Total steps:", steps.length);

      if (isValid && currentStep < steps.length - 1) {
        console.log("Moving to next step");
        setCurrentStep(currentStep + 1);
      } else if (isValid && currentStep === steps.length - 1) {
        console.log("Reached last step, not submitting automatically");
        // Don't submit automatically, just stay on the last step
      } else {
        console.log("Validation failed, not moving to next step");
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
    const hasErrors = stepFields.some((field) => {
      return formState.errors[field as keyof typeof formState.errors];
    });

    // Check if all required fields in this step are filled
    const values = form.getValues();
    const isComplete = stepFields.every((field) => {
      const value = values[field as keyof typeof values];
      console.log(`Checking field ${field}:`, value);

      // For arrays, check if they have items
      if (Array.isArray(value)) {
        // Special case for images - must have at least one
        if (field === "images") {
          const result = value.length > 0;
          console.log(`Images validation: ${result} (length: ${value.length})`);
          return result;
        }
        return true; // Other arrays are optional
      }
      // For objects, check nested fields
      if (typeof value === "object" && value !== null) {
        // Special case for location
        if (field === "location") {
          const result = value.city && value.area;
          console.log(
            `Location validation: ${result} (city: ${value.city}, area: ${value.area})`
          );
          return result;
        }
        return true; // Other objects are valid if they exist
      }
      // For strings/numbers, check if they're not empty/zero
      if (field === "category") {
        const result = value && value !== "";
        console.log(`Category validation: ${result} (value: ${value})`);
        return result;
      }
      if (field === "price") {
        const result = value && value > 0;
        console.log(`Price validation: ${result} (value: ${value})`);
        return result;
      }
      const result = value !== undefined && value !== "";
      console.log(`Generic field validation: ${result} (value: ${value})`);
      return result;
    });

    console.log(`Step ${stepIndex} validation:`, {
      hasErrors,
      isComplete,
      stepFields,
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
                      src={getImageUrl(watchedValues.images[0])}
                      alt={watchedValues.title}
                      className="w-full h-64 object-contain rounded-lg"
                    />
                    {watchedValues.images.length > 1 && (
                      <div className="flex gap-2">
                        {watchedValues.images.slice(1, 4).map((img, idx) => (
                          <img
                            key={idx}
                            src={getImageUrl(img)}
                            alt=""
                            className="w-20 h-20 object-contain rounded"
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
                  <p className="text-gray-600 mt-2">
                    {watchedValues.description}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-primary">
                    PKR {watchedValues.price?.toLocaleString()}/day
                  </div>
                  <Badge>
                    {
                      CONDITIONS.find(
                        (c) => c.value === watchedValues.condition
                      )?.label
                    }
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {watchedValues.location.area}, {watchedValues.location.city}
                </div>

                {watchedValues.rentalRules &&
                  watchedValues.rentalRules.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Rental Rules</h4>
                      <ul className="space-y-1">
                        {watchedValues.rentalRules.map((rule, idx) => (
                          <li key={idx} className="text-sm">
                            • {rule}
                          </li>
                        ))}
                      </ul>
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
    <div className="space-y-8">
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
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      isPast
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-blue-500 text-white"
                          : hasErrors
                            ? "bg-red-100 text-red-600"
                            : isComplete
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isPast ? "✓" : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        isPast ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                <div className="mt-2">
                  <div
                    className={`text-sm font-medium ${
                      isActive ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 lg:w-[80%]">
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
                <Label htmlFor="title">
                  Listing Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="e.g., Professional DSLR Camera Canon EOS 5D Mark IV"
                  className="mt-1"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => form.setValue("category", value)}
                >
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
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
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
                  <Label htmlFor="price">
                    Daily Price (PKR) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="price"
                      type="number"
                      {...form.register("price", { valueAsNumber: true })}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                  {form.formState.errors.price && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional pricing options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pricePerHour">Hourly Price (PKR)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="pricePerHour"
                      type="number"
                      {...form.register("pricePerHour", {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="priceWeekly">Weekly Price (PKR)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="priceWeekly"
                      type="number"
                      {...form.register("priceWeekly", { valueAsNumber: true })}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="priceMonthly">Monthly Price (PKR)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="priceMonthly"
                      type="number"
                      {...form.register("priceMonthly", {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>
                  Item Condition <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                  {CONDITIONS.map((condition) => (
                    <div
                      key={condition.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        watchedValues.condition === condition.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        form.setValue("condition", condition.value as any)
                      }
                    >
                      <div className="font-medium">{condition.label}</div>
                      <div className="text-sm text-gray-600">
                        {condition.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label>
                  Location <span className="text-red-500">*</span>
                </Label>
                <CityAreaCombobox
                  cities={Object.keys(CITY_AREAS)}
                  selectedCity={watchedValues.location?.city || ""}
                  selectedArea={watchedValues.location?.area || ""}
                  onCityChange={(value) =>
                    form.setValue("location.city", value)
                  }
                  onAreaChange={(value) =>
                    form.setValue("location.area", value)
                  }
                  cityPlaceholder="Select a city"
                  areaPlaceholder="Select an area"
                  className="flex-nowrap"
                  size="md"
                />
                {form.formState.errors.location?.city && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.location.city.message}
                  </p>
                )}
                {form.formState.errors.location?.area && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.location.area.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Images & Details */}
          {currentStep === 3 && (
            <div>
              <div className="space-y-6">
                <div>
                  <Label>
                    Item Images <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    <FileUpload
                      onUploadSuccess={(file) => {
                        // Handle the uploaded file
                        handleFileUploadSuccess(file);
                      }}
                      onUploadError={(error) => {
                        console.error("Image upload error:", error.message);
                      }}
                      acceptedFileTypes={[
                        "image/jpeg",
                        "image/jpg",
                        "image/png",
                        "image/gif",
                        "image/webp",
                      ]}
                      maxFileSize={5 * 1024 * 1024} // 5MB limit as per project requirements
                      validateFile={validateImageFile}
                      uploadDelay={0} // No simulation, upload immediately
                      className="w-full"
                    />
                    {uploadProgress > 0 && (
                      <div className="mt-2">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-gray-500 mt-1">
                          Uploading... {Math.round(uploadProgress)}%
                        </p>
                      </div>
                    )}
                  </div>
                  {form.formState.errors.images && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.images.message}
                    </p>
                  )}
                </div>

                {watchedValues.images && watchedValues.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {watchedValues.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={getImageUrl(img)}
                          alt={`Uploaded ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const newImages = [...(watchedValues.images || [])];
                            newImages.splice(idx, 1);
                            form.setValue("images", newImages);
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
                    onClick={() => addSpec({ key: "", value: "" })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Specification
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Add key details about your item (e.g., Brand, Model, Color)
                </p>
                <div className="space-y-3 mt-2">
                  {specFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Input
                          {...form.register(`specifications.${index}.key`)}
                          placeholder="Specification name (e.g., Brand)"
                          className="w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          {...form.register(`specifications.${index}.value`)}
                          placeholder="Value (e.g., Canon)"
                          className="w-full"
                        />
                      </div>
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
                <p className="text-sm text-gray-500 mt-1">
                  Enter keywords to help customers find your item (press Enter
                  or comma to add)
                </p>
                <Input
                  id="tags"
                  placeholder="e.g., camera, photography, professional"
                  className="mt-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const tags = watchedValues.tags || [];
                      const newTag = (
                        e.target as HTMLInputElement
                      ).value.trim();
                      if (newTag && !tags.includes(newTag)) {
                        form.setValue("tags", [...tags, newTag]);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {watchedValues.tags?.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = [...(watchedValues.tags || [])];
                          newTags.splice(idx, 1);
                          form.setValue("tags", newTags);
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

          {/* Step 4: Rental Rules */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="rentalRules">Rental Rules (Optional)</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Enter rental rules, one per line (e.g., Minimum rental period:
                  1 day)
                </p>
                <Textarea
                  id="rentalRules"
                  placeholder="Enter rental rules, one per line (e.g., Minimum rental period: 1 day)"
                  rows={4}
                  className="mt-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const rules = watchedValues.rentalRules || [];
                      const newRule = (
                        e.target as HTMLTextAreaElement
                      ).value.trim();
                      if (newRule && !rules.includes(newRule)) {
                        form.setValue("rentalRules", [...rules, newRule]);
                        (e.target as HTMLTextAreaElement).value = "";
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {watchedValues.rentalRules?.map((rule, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {rule}
                      <button
                        type="button"
                        onClick={() => {
                          const newRules = [
                            ...(watchedValues.rentalRules || []),
                          ];
                          newRules.splice(idx, 1);
                          form.setValue("rentalRules", newRules);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Badges (Optional)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {["local", "eco_friendly", "instant_delivery"].map(
                    (badge) => (
                      <div
                        key={badge}
                        className={`p-2 border rounded cursor-pointer text-center text-sm ${
                          watchedValues.badges?.includes(badge)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          const currentBadges = watchedValues.badges || [];
                          if (currentBadges.includes(badge)) {
                            form.setValue(
                              "badges",
                              currentBadges.filter((b) => b !== badge)
                            );
                          } else {
                            form.setValue("badges", [...currentBadges, badge]);
                          }
                        }}
                      >
                        {badge.replace("_", " ")}
                      </div>
                    )
                  )}
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
            <Button
              type="button"
              onClick={nextStep}
              disabled={!getStepValidation(currentStep).isComplete}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editMode ? "Update Listing" : "Create Listing"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateListingForm;
