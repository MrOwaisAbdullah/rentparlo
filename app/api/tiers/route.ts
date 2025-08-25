import { NextRequest, NextResponse } from 'next/server';
import { SellerTierCalculator, tierUtils } from '@/lib/seller-tier-calculator';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/tiers - Get tier information
 * Query params:
 * - sellerId: Get specific seller tier info
 * - stats: Get tier statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const getStats = searchParams.get('stats') === 'true';

    const calculator = new SellerTierCalculator(true);

    if (getStats) {
      const stats = await calculator.getTierStatistics();
      return NextResponse.json({ stats });
    }

    if (sellerId) {
      const [pointsBreakdown, tierResult] = await Promise.all([
        calculator.calculateSellerPoints(sellerId),
        calculator.calculateTier(await calculator.calculateSellerPoints(sellerId).then(p => p.total))
      ]);

      return NextResponse.json({
        seller_id: sellerId,
        points_breakdown: pointsBreakdown,
        tier_info: tierResult
      });
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });

  } catch (error) {
    console.error('Error in GET /api/tiers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tiers - Award points or update tier
 * Body:
 * - action: 'award_points' | 'update_tier' | 'batch_update'
 * - sellerId: string
 * - points?: number (for award_points)
 * - pointsAction?: string (for award_points)
 * - metadata?: object (for award_points)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sellerId, points, pointsAction, metadata } = body;

    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const calculator = new SellerTierCalculator(true);

    switch (action) {
      case 'award_points':
        if (!sellerId || points === undefined || !pointsAction) {
          return NextResponse.json(
            { error: 'Missing required fields: sellerId, points, pointsAction' },
            { status: 400 }
          );
        }

        await calculator.awardPoints(sellerId, pointsAction, points, metadata);
        const updatedTier = await calculator.updateSellerTier(sellerId);

        return NextResponse.json({
          success: true,
          message: `Awarded ${points} points for ${pointsAction}`,
          tier_info: updatedTier
        });

      case 'update_tier':
        if (!sellerId) {
          return NextResponse.json(
            { error: 'Missing required field: sellerId' },
            { status: 400 }
          );
        }

        const tierResult = await calculator.updateSellerTier(sellerId);

        return NextResponse.json({
          success: true,
          message: 'Tier updated successfully',
          tier_info: tierResult
        });

      case 'batch_update':
        // Admin only - update all seller tiers
        const { data: adminUser } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!adminUser || adminUser.role !== 'admin') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get all active sellers
        const { data: sellers } = await supabase
          .from('seller_profiles')
          .select('id')
          .eq('is_active', true);

        if (!sellers) {
          return NextResponse.json({ error: 'No sellers found' }, { status: 404 });
        }

        // Update all tiers (process in batches)
        const batchSize = 10;
        const results = [];

        for (let i = 0; i < sellers.length; i += batchSize) {
          const batch = sellers.slice(i, i + batchSize);
          const batchPromises = batch.map(seller => 
            calculator.updateSellerTier(seller.id).catch(error => ({
              sellerId: seller.id,
              error: error.message
            }))
          );

          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);
        }

        return NextResponse.json({
          success: true,
          message: `Updated ${sellers.length} seller tiers`,
          results
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be: award_points, update_tier, or batch_update' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in POST /api/tiers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tiers - Update tier manually (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sellerId, tier, points, reason } = body;

    // Verify admin authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!sellerId || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: sellerId, tier' },
        { status: 400 }
      );
    }

    // Update seller tier manually
    const { error: updateError } = await supabase
      .from('seller_profiles')
      .update({
        tier,
        tier_points: points || 0,
        tier_updated_at: new Date().toISOString()
      })
      .eq('id', sellerId);

    if (updateError) {
      throw updateError;
    }

    // Log manual tier change
    await supabase
      .from('seller_tier_history')
      .insert({
        seller_id: sellerId,
        new_tier: tier,
        points_at_change: points || 0,
        manual_change: true,
        admin_user_id: user.id,
        reason,
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: `Manually updated seller tier to ${tier}`
    });

  } catch (error) {
    console.error('Error in PUT /api/tiers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}