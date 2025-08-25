import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSanityClient } from '@sanity/client';
import { revalidatePath } from 'next/cache';

const sanityClient = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2024-08-14'
});

interface VerificationDocument {
  id: string;
  sellerId: string;
  documentType: 'cnic_front' | 'cnic_back' | 'business_license' | 'bank_statement';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

/**
 * Upload verification documents
 * POST /api/verification/documents
 */
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

    // Check if user is a seller
    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('id, verification_status')
      .eq('id', user.id)
      .single();

    if (!sellerProfile) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!['cnic_front', 'cnic_back', 'business_license', 'bank_statement'].includes(documentType)) {
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

    // Upload to Sanity
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    const asset = await sanityClient.assets.upload('image', uint8Array, {
      filename: `${user.id}_${documentType}_${Date.now()}.${file.name.split('.').pop()}`,
      title: `${documentType.replace('_', ' ').toUpperCase()} - ${user.id}`,
      description: `Verification document for seller ${user.id}`,
      creditLine: 'RentParLo.pk Seller Verification',
      source: {
        name: 'seller-verification',
        id: user.id,
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://rentparlo.pk'
      }
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'Failed to upload document to storage' },
        { status: 500 }
      );
    }

    // Create verification document record in Sanity
    const verificationDoc: VerificationDocument = {
      id: `verification_${user.id}_${documentType}_${Date.now()}`,
      sellerId: user.id,
      documentType: documentType as any,
      fileName: file.name,
      fileUrl: asset.url,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      verificationStatus: 'pending'
    };

    // Store in Sanity as a verification document
    const sanityDoc = await sanityClient.create({
      _type: 'verificationDocument',
      _id: verificationDoc.id,
      sellerId: verificationDoc.sellerId,
      documentType: verificationDoc.documentType,
      fileName: verificationDoc.fileName,
      fileAsset: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      },
      fileSize: verificationDoc.fileSize,
      mimeType: verificationDoc.mimeType,
      uploadedAt: verificationDoc.uploadedAt,
      verificationStatus: verificationDoc.verificationStatus,
      metadata: {
        originalFileName: file.name,
        uploadedByUser: user.id,
        documentCategory: 'seller_verification'
      }
    });

    // Update seller profile with document reference
    const currentDocuments = sellerProfile.verification_documents || {};
    const updatedDocuments = {
      ...currentDocuments,
      [documentType]: {
        _id: sanityDoc._id,
        fileName: file.name,
        uploadedAt: verificationDoc.uploadedAt,
        status: 'pending'
      }
    };

    const { error: updateError } = await supabase
      .from('seller_profiles')
      .update({
        verification_documents: updatedDocuments,
        verification_status: hasAllRequiredDocuments(updatedDocuments) ? 'under_review' : 'pending'
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update seller profile:', updateError);
      // Don't fail the request, document is already uploaded
    }

    // Revalidate relevant paths
    revalidatePath('/seller/verification');
    revalidatePath('/seller/profile');

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

/**
 * Get verification documents for current seller
 * GET /api/verification/documents
 */
export async function GET(request: NextRequest) {
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

    // Get seller profile with documents
    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('verification_documents, verification_status')
      .eq('id', user.id)
      .single();

    if (!sellerProfile) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      );
    }

    // Fetch document details from Sanity
    const documents = await sanityClient.fetch(`
      *[_type == "verificationDocument" && sellerId == $sellerId] {
        _id,
        documentType,
        fileName,
        "fileUrl": fileAsset.asset->url,
        fileSize,
        mimeType,
        uploadedAt,
        verificationStatus,
        rejectionReason,
        verifiedAt,
        verifiedBy
      }
    `, { sellerId: user.id });

    return NextResponse.json({
      documents,
      verificationStatus: sellerProfile.verification_status,
      requiresDocuments: getRequiredDocuments(),
      isComplete: hasAllRequiredDocuments(sellerProfile.verification_documents || {})
    });

  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

/**
 * Delete verification document
 * DELETE /api/verification/documents
 */
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
    const { data: sellerProfile } = await supabase
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
          verification_documents: updatedDocuments,
          verification_status: hasAllRequiredDocuments(updatedDocuments) ? 'under_review' : 'pending'
        })
        .eq('id', user.id);
    }

    // Revalidate relevant paths
    revalidatePath('/seller/verification');
    revalidatePath('/seller/profile');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

// Helper functions
function getRequiredDocuments() {
  return [
    {
      type: 'cnic_front',
      label: 'CNIC Front',
      description: 'Clear photo of the front side of your CNIC',
      required: true
    },
    {
      type: 'cnic_back',
      label: 'CNIC Back',
      description: 'Clear photo of the back side of your CNIC',
      required: true
    },
    {
      type: 'business_license',
      label: 'Business License',
      description: 'Business registration or trade license (if applicable)',
      required: false
    }
  ];
}

function hasAllRequiredDocuments(documents: any) {
  const required = ['cnic_front', 'cnic_back'];
  return required.every(type => 
    documents[type] && 
    documents[type].status !== 'rejected'
  );
}