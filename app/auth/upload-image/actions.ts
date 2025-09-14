"use server";

import { createClient } from "next-sanity";
import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { z } from "zod";

// Sanity client with write token
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN!,
});

// Validation schema for image upload
const imageUploadSchema = z.object({
  fileName: z.string(),
  fileType: z.string().regex(/^image\/(jpeg|png|webp)$/),
  fileSize: z.number().max(5 * 1024 * 1024), // 5MB max
});

interface UploadResult {
  success: boolean;
  imageUrl?: string;
  assetId?: string;
  error?: string;
}

export async function uploadListingImage(
  formData: FormData
): Promise<UploadResult> {
  try {
    // Check authentication
    const supabase = await createSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Extract file from FormData (using 'image' field name for listing images)
    const file = formData.get("image") as File;

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Validate file
    const validationResult = imageUploadSchema.safeParse({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    if (!validationResult.success) {
      return {
        success: false,
        error:
          "Invalid file format or size. Please upload a JPEG, PNG, or WebP image under 5MB.",
      };
    }

    // Convert File to ArrayBuffer for Sanity upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename for listing images
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "");
    const fileName = `listing-${user.id}-${timestamp}-${sanitizedName}`;

    // Upload to Sanity
    const asset = await sanityClient.assets.upload("image", buffer, {
      filename: fileName,
      title: `Listing image for ${user.email}`,
      description: `Listing image uploaded by user ${user.id}`,
      metadata: {
        userId: user.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    if (!asset) {
      return {
        success: false,
        error: "Failed to upload image to Sanity",
      };
    }

    // Return both the URL and asset ID for different use cases
    const imageUrl = asset.url;
    const assetId = asset._id;

    return {
      success: true,
      imageUrl,
      assetId,
    };
  } catch (error) {
    console.error("Listing image upload error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while uploading the image",
    };
  }
}

export async function uploadProfileImage(
  formData: FormData
): Promise<UploadResult> {
  try {
    // Check authentication
    const supabase = await createSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Extract file from FormData
    const file = formData.get("file") as File;

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Validate file
    const validationResult = imageUploadSchema.safeParse({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    if (!validationResult.success) {
      return {
        success: false,
        error:
          "Invalid file format or size. Please upload a JPEG, PNG, or WebP image under 5MB.",
      };
    }

    // Convert File to ArrayBuffer for Sanity upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "");
    const fileName = `profile-${user.id}-${timestamp}-${sanitizedName}`;

    // Upload to Sanity
    const asset = await sanityClient.assets.upload("image", buffer, {
      filename: fileName,
      title: `Profile image for ${user.email}`,
      description: `Profile image uploaded by user ${user.id}`,
      metadata: {
        userId: user.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    if (!asset) {
      return {
        success: false,
        error: "Failed to upload image to Sanity",
      };
    }

    // The asset object contains the raw URL
    const imageUrl = asset.url;

    return {
      success: true,
      imageUrl,
    };
  } catch (error) {
    console.error("Image upload error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while uploading the image",
    };
  }
}

export async function deleteProfileImage(
  imageId: string
): Promise<UploadResult> {
  try {
    // Check authentication
    const supabase = await createSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Delete from Sanity
    await sanityClient.delete(imageId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Image deletion error:", error);
    return {
      success: false,
      error: "Failed to delete image",
    };
  }
}
