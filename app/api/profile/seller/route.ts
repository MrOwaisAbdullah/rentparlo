import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

    const body = await request.json();
    console.log('Seller profile creation request body:', body);
    
    const {
      username,
      business_name,
      owner_name,
      phone,
      email,
      city,
      address_line1,
      owner_cnic,
      whatsapp
    } = body;

    // Validate required fields
    if (!owner_name || !phone || !email || !city) {
      const missingFields = [];
      if (!owner_name) missingFields.push('owner_name');
      if (!phone) missingFields.push('phone');
      if (!email) missingFields.push('email');
      if (!city) missingFields.push('city');
      
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missingFields
        },
        { status: 400 }
      );
    }

    // Check if seller profile already exists
    const { data: existingProfile, error: existingProfileError } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (existingProfileError) {
      console.error('Error checking existing profile:', existingProfileError);
      return NextResponse.json(
        { error: 'Failed to check existing profile' },
        { status: 500 }
      );
    }

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Seller profile already exists' },
        { status: 409 }
      );
    }

    // Generate username if not provided
    let finalUsername = username || user.email.split('@')[0];
    
    // Check if username is available
    const { data: existingUsername, error: usernameError } = await supabase
      .from('seller_profiles')
      .select('username')
      .eq('username', finalUsername)
      .maybeSingle();

    if (usernameError) {
      console.error('Error checking username availability:', usernameError);
      return NextResponse.json(
        { error: 'Failed to check username availability' },
        { status: 500 }
      );
    }

    // Generate a unique username if needed
    if (existingUsername) {
      const timestamp = Date.now();
      finalUsername = `${finalUsername}_${timestamp}`;
    }
    
    // Create seller profile
    const { data: sellerProfile, error: profileError } = await supabase
      .from('seller_profiles')
      .insert([{
        id: user.id,
        username: finalUsername,
        business_name: business_name || '',
        owner_name: owner_name,
        owner_cnic: owner_cnic || null,
        address_line1: address_line1 || '',
        city: city,
        phone: phone,
        email: email,
        tier: 'basic',
        tier_points: 0,
        verification_status: 'pending',
        is_verified: false,
        is_top_seller: false,
        verification_documents: {}
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Seller profile creation error:', profileError);
      return NextResponse.json(
        { 
          error: 'Failed to create seller profile', 
          details: profileError.message 
        },
        { status: 500 }
      );
    }

    console.log('Seller profile created successfully:', sellerProfile);

    return NextResponse.json({
      success: true,
      profile: sellerProfile,
      message: 'Seller profile created successfully'
    });

  } catch (error) {
    console.error('Create seller profile error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}