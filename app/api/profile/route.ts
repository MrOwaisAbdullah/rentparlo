/**
 * =====================================================
 * User Profile Management API Route
 * =====================================================
 * Handles user profile CRUD operations, seller profile creation,
 * and user account management
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { 
  getUserById,
  updateUserProfile,
  getSellerProfile,
  createSellerProfile,
  updateSellerProfile,
  isUsernameAvailable,
  logAuthEvent
} from '@/lib/supabase-queries'

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user data with seller profile if applicable
    const userData = await getUserById(user.id)
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get seller profile if user is a seller
    let sellerProfile = null
    if (userData.role === 'seller') {
      sellerProfile = await getSellerProfile(user.id)
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        sellerProfile
      }
    })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { profileType, ...profileData } = body

    // Validate profile type
    if (!profileType || !['user', 'seller'].includes(profileType)) {
      return NextResponse.json(
        { error: 'Invalid profile type. Must be "user" or "seller"' },
        { status: 400 }
      )
    }

    if (profileType === 'user') {
      // Update user profile
      const allowedUserFields = [
        'name',
        'phone',
        'city',
        'state',
        'bio',
        'date_of_birth',
        'gender',
        'preferred_language',
        'notification_preferences',
        'privacy_settings'
      ]

      const userUpdates = Object.keys(profileData)
        .filter(key => allowedUserFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = profileData[key]
          return obj
        }, {} as any)

      if (Object.keys(userUpdates).length === 0) {
        return NextResponse.json(
          { error: 'No valid fields to update' },
          { status: 400 }
        )
      }

      const success = await updateUserProfile(user.id, userUpdates)
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to update user profile' },
          { status: 500 }
        )
      }

      // Get updated user data
      const updatedUser = await getUserById(user.id)

      return NextResponse.json({
        success: true,
        data: updatedUser
      })

    } else if (profileType === 'seller') {
      // Check if user has seller role
      const userData = await getUserById(user.id)
      if (userData?.role !== 'seller' && userData?.role !== 'admin') {
        return NextResponse.json(
          { error: 'User must have seller role to update seller profile' },
          { status: 403 }
        )
      }

      // Validate username if provided
      if (profileData.username) {
        const isAvailable = await isUsernameAvailable(profileData.username, user.id)
        if (!isAvailable) {
          return NextResponse.json(
            { error: 'Username is already taken' },
            { status: 400 }
          )
        }

        // Username validation
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
        if (!usernameRegex.test(profileData.username)) {
          return NextResponse.json(
            { 
              error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores' 
            },
            { status: 400 }
          )
        }
      }

      // CNIC validation if provided
      if (profileData.owner_cnic) {
        const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/
        if (!cnicRegex.test(profileData.owner_cnic)) {
          return NextResponse.json(
            { error: 'CNIC must be in format: 12345-1234567-1' },
            { status: 400 }
          )
        }
      }

      const allowedSellerFields = [
        'username',
        'business_name',
        'owner_name',
        'owner_cnic',
        'address_line1',
        // 'address_line2', // Removed because it doesn't exist in the database schema
        'city',
        'state',
        'phone',
        'email',
        'website',
        'business_type',
        'business_hours',
        'social_media_links'
      ]

      const sellerUpdates = Object.keys(profileData)
        .filter(key => allowedSellerFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = profileData[key]
          return obj
        }, {} as any)

      if (Object.keys(sellerUpdates).length === 0) {
        return NextResponse.json(
          { error: 'No valid fields to update' },
          { status: 400 }
        )
      }

      // Check if seller profile exists
      const existingProfile = await getSellerProfile(user.id)
      
      let result
      if (existingProfile) {
        // Update existing profile
        result = await updateSellerProfile(user.id, sellerUpdates)
      } else {
        // Create new seller profile
        const newProfile = {
          id: user.id,
          ...sellerUpdates,
          tier: 'basic',
          tier_points: 0,
          verification_status: 'pending',
          is_verified: false,
          is_top_seller: false
        }
        result = await createSellerProfile(newProfile)
      }

      if (!result) {
        return NextResponse.json(
          { error: 'Failed to update seller profile' },
          { status: 500 }
        )
      }

      // Get updated seller profile
      const updatedProfile = await getSellerProfile(user.id)

      return NextResponse.json({
        success: true,
        data: updatedProfile
      })
    }

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// POST - Create seller profile (for role upgrade)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, ...profileData } = body

    if (action === 'upgrade-to-seller') {
      // Check if user is already a seller
      const userData = await getUserById(user.id)
      if (userData?.role === 'seller') {
        return NextResponse.json(
          { error: 'User is already a seller' },
          { status: 400 }
        )
      }

      // Validate required seller fields
      const requiredFields = ['username', 'business_name', 'owner_cnic', 'phone']
      const missingFields = requiredFields.filter(field => !profileData[field])
      
      if (missingFields.length > 0) {
        return NextResponse.json(
          { 
            error: 'Missing required fields',
            missingFields 
          },
          { status: 400 }
        )
      }

      // Validate username availability
      const isAvailable = await isUsernameAvailable(profileData.username)
      if (!isAvailable) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        )
      }

      // Validate CNIC format
      const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/
      if (!cnicRegex.test(profileData.owner_cnic)) {
        return NextResponse.json(
          { error: 'CNIC must be in format: 12345-1234567-1' },
          { status: 400 }
        )
      }

      // Update user role to seller
      const userUpdateSuccess = await updateUserProfile(user.id, { role: 'seller' })
      if (!userUpdateSuccess) {
        return NextResponse.json(
          { error: 'Failed to update user role' },
          { status: 500 }
        )
      }

      // Create seller profile
      const sellerProfileData = {
        id: user.id,
        username: profileData.username,
        business_name: profileData.business_name,
        owner_name: profileData.owner_name || userData?.name,
        owner_cnic: profileData.owner_cnic,
        address_line1: profileData.address_line1,
        // address_line2: profileData.address_line2, // Removed because it doesn't exist in the database schema
        city: profileData.city || userData?.city,
        state: profileData.state || userData?.state,
        phone: profileData.phone,
        email: profileData.email || userData?.email,
        website: profileData.website,
        business_type: profileData.business_type,
        tier: 'basic',
        tier_points: 0,
        verification_status: 'pending',
        is_verified: false,
        is_top_seller: false
      }

      const newProfile = await createSellerProfile(sellerProfileData)
      
      if (!newProfile) {
        // Rollback user role update
        await updateUserProfile(user.id, { role: 'user' })
        return NextResponse.json(
          { error: 'Failed to create seller profile' },
          { status: 500 }
        )
      }

      // Log the seller upgrade event
      await logAuthEvent(
        user.id,
        'upgrade_to_seller',
        true,
        request.headers.get('x-forwarded-for')?.split(',')[0],
        request.headers.get('user-agent') || undefined
      )

      return NextResponse.json({
        success: true,
        message: 'Successfully upgraded to seller account',
        data: newProfile
      }, { status: 201 })

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Supported actions: upgrade-to-seller' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error in POST profile:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user account (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Soft delete by deactivating account
    const success = await updateUserProfile(user.id, { 
      active: false,
      account_status: 'deactivated'
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to deactivate account' },
        { status: 500 }
      )
    }

    // Log the account deletion
    await logAuthEvent(
      user.id,
      'account_deactivated',
      true,
      request.headers.get('x-forwarded-for')?.split(',')[0],
      request.headers.get('user-agent') || undefined
    )

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'Account deactivated successfully'
    })

  } catch (error) {
    console.error('Error deactivating account:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate account' },
      { status: 500 }
    )
  }
}