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
    const {
      username,
      business_name,
      owner_name,
      phone,
      email,
      city,
      address_line1,
      owner_cnic
    } = body;

    // Validate required fields
    if (!username || !owner_name || !phone || !email || !city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if seller profile already exists
    const { data: existingProfile, error: existingProfileError } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle(); // Changed from .single() to .maybeSingle()

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

    // Check if username is available
    const { data: existingUsername, error: usernameError } = await supabase
      .from('seller_profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle(); // Changed from .single() to .maybeSingle()

    if (usernameError) {
      console.error('Error checking username availability:', usernameError);
      return NextResponse.json(
        { error: 'Failed to check username availability' },
        { status: 500 }
      );
    }

    // Generate a unique username if needed
    let finalUsername = username;
    if (existingUsername) {
      const timestamp = Date.now();
      finalUsername = `${username}_${timestamp}`;
    }
    
    // Create seller profile
    const { data: sellerProfile, error: profileError } = await supabase
      .from('seller_profiles')
      .insert({
        id: user.id,
        username: finalUsername,
        business_name: business_name || '',
        owner_name,
        owner_cnic,
        address_line1,
        city,
        phone,
        email,
        tier: 'basic',
        tier_points: 0,
        verification_status: 'pending',
        is_verified: false,
        is_top_seller: false,
        verification_documents: {},
        business_hours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: false },
          sunday: { open: '09:00', close: '18:00', closed: true }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Seller profile creation error:', profileError);
      return NextResponse.json(
        { error: 'Failed to create seller profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: sellerProfile,
      message: 'Seller profile created successfully'
    });

  } catch (error) {
    console.error('Create seller profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}