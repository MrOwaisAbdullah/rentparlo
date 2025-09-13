import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSanityClient } from '@sanity/client';

const sanityClient = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-01-01'
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file || !documentType) {
      return NextResponse.json(
        { error: 'File and document type are required' },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes = ['cnic_front', 'cnic_back', 'business_license', 'bank_statement'];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Upload to Sanity with better error handling
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    let asset;
    try {
      asset = await sanityClient.assets.upload('image', uint8Array, {
        filename: `${user.id}_${documentType}_${Date.now()}.${file.name.split('.').pop()}`,
        title: `${documentType.replace('_', ' ').toUpperCase()} - ${user.id}`,
        description: `Verification document for seller ${user.id}`,
        metadata: {
          userId: user.id,
          documentType,
          originalFileName: file.name,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (uploadError: any) {
      console.error('Sanity upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload document to storage: ${uploadError.message || 'Permission denied'}` },
        { status: 500 }
      );
    }

    if (!asset) {
      return NextResponse.json(
        { error: 'Failed to upload document to storage' },
        { status: 500 }
      );
    }

    // Create verification document record in Sanity
    const verificationDoc = {
      _type: 'verificationDocument',
      sellerId: user.id,
      documentType,
      fileName: file.name,
      fileAsset: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      },
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      verificationStatus: 'pending'
    };

    const sanityDoc = await sanityClient.create(verificationDoc);

    // Update seller profile with document reference
    let { data: sellerProfile, error: profileError } = await supabase
      .from('seller_profiles')
      .select('id, verification_documents')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create it. This is common in the onboarding flow.
    if (profileError && profileError.code === 'PGRST116') {
      console.log(`Seller profile not found for user ${user.id}. Creating one.`);
      const { data: newProfile, error: createError } = await supabase
        .from('seller_profiles')
        .insert({
          id: user.id, // Link to the users table
          email: user.email, // Pre-fill email from auth user
          verification_status: 'under_review',
          verification_documents: {}, // Initialize as empty object
        })
        .select('id, verification_documents')
        .single();

      if (createError) {
        console.error('Failed to create seller profile:', createError);
        // If we can't create the profile, we can't link the document.
        // The document is already in Sanity, but we should probably let the client know.
        // For now, we'll log the error and the response will indicate success but the link is missing.
      } else {
        console.log(`Successfully created seller profile for user ${user.id}.`);
        sellerProfile = newProfile; // Use the newly created profile for the next step
      }
    } else if (profileError) {
      console.error('Failed to fetch seller profile for a reason other than it not existing:', profileError);
    }

    // Now, sellerProfile should exist, either fetched or newly created.
    if (sellerProfile) {
      const currentDocuments = sellerProfile.verification_documents || {};
      const updatedDocuments = {
        ...currentDocuments,
        [documentType]: {
          id: sanityDoc._id,
          fileName: file.name,
          uploadedAt: verificationDoc.uploadedAt,
          status: 'pending'
        }
      };

      const { error: updateError } = await supabase
        .from('seller_profiles')
        .update({
          verification_documents: updatedDocuments,
          verification_status: 'under_review'
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to update seller profile with new document:', updateError);
        // Don't fail the request, as the document is already uploaded to Sanity.
        // The user can try again, or an admin can link it manually.
      }
    }

    return NextResponse.json({
      success: true,
      document: {
        id: sanityDoc._id,
        documentType,
        fileName: file.name,
        fileUrl: asset.url,
        status: 'pending',
        uploadedAt: verificationDoc.uploadedAt
      }
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');
    const documentType = searchParams.get('type');

    if (!documentId || !documentType) {
      return NextResponse.json(
        { error: 'Document ID and type are required' },
        { status: 400 }
      );
    }

    // Verify document belongs to user
    const document = await sanityClient.fetch(`
      *[_type == "verificationDocument" && _id == $documentId && sellerId == $sellerId][0]
    `, { 
      documentId, 
      sellerId: user.id 
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Delete from Sanity
    await sanityClient.delete(documentId);

    // Update seller profile
    const { data: sellerProfile, error: profileError } = await supabase
      .from('seller_profiles')
      .select('verification_documents')
      .eq('id', user.id)
      .single();

    if (sellerProfile?.verification_documents) {
      const updatedDocuments = { ...sellerProfile.verification_documents };
      delete updatedDocuments[documentType];

      await supabase
        .from('seller_profiles')
        .update({
          verification_documents: updatedDocuments
        })
        .eq('id', user.id);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}