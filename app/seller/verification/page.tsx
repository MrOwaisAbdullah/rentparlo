import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { VerificationUpload } from '@/components/verification/verification-upload';
import { VerificationActions } from '@/components/verification/verification-actions';

export const metadata: Metadata = {
  title: 'Seller Verification | RentParLo.pk',
  description: 'Verify your seller account by uploading required documents.',
};

async function getSellerVerificationData(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/verification/documents`,
      {
        headers: {
          'Authorization': `Bearer ${userId}` // This would need proper auth headers
        },
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch verification data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching verification data:', error);
    return {
      documents: [],
      verificationStatus: 'pending',
      requiresDocuments: [],
      isComplete: false
    };
  }
}

export default async function SellerVerificationPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/auth/login?redirectTo=/seller/verification');
  }

  // Check if user is a seller
  const { data: sellerProfile } = await supabase
    .from('seller_profiles')
    .select('id, verification_status, tier, is_verified')
    .eq('id', user.id)
    .single();

  if (!sellerProfile) {
    redirect('/auth/register?role=seller');
  }

  // Get verification data (we'll implement client-side data fetching for now)
  const verificationData = await getSellerVerificationData(user.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Seller Verification</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete your seller verification by uploading the required documents. 
            This helps us maintain trust and safety on our platform.
          </p>
        </div>

        {/* Verification Component */}
        <VerificationActions
          initialDocuments={verificationData.documents}
          initialStatus={verificationData.verificationStatus}
        />
      </div>
    </div>
  );
}