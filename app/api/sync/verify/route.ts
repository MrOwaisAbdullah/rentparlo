import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DataSyncVerifier, runScheduledSyncVerification } from '@/lib/data-sync-verifier';

/**
 * GET /api/sync/verify - Verify data synchronization between Sanity and Supabase
 * Query params:
 * - autoFix: boolean - Whether to attempt automatic fixes
 * - detailed: boolean - Whether to include detailed statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const autoFix = searchParams.get('autoFix') === 'true';
    const detailed = searchParams.get('detailed') === 'true';

    // Verify authentication (admin only)
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

    // Run sync verification
    const verifier = new DataSyncVerifier(true);
    const verificationResult = await verifier.verifyDataSync();

    let fixResult = null;
    if (autoFix && verificationResult.errors.length > 0) {
      fixResult = await verifier.autoFixSyncIssues(verificationResult.errors);
      
      // Re-run verification after fixes
      const updatedResult = await verifier.verifyDataSync();
      verificationResult.errors = updatedResult.errors;
      verificationResult.consistent = updatedResult.consistent;
    }

    // Prepare response
    const response: any = {
      timestamp: new Date().toISOString(),
      consistent: verificationResult.consistent,
      summary: {
        totalErrors: verificationResult.errors.length,
        criticalErrors: verificationResult.errors.filter(e => e.severity === 'HIGH').length,
        warnings: verificationResult.warnings.length,
        responseTime: verificationResult.statistics.avgResponseTime
      }
    };

    if (detailed) {
      response.errors = verificationResult.errors;
      response.warnings = verificationResult.warnings;
      response.statistics = verificationResult.statistics;
    } else {
      // Only include critical errors in non-detailed mode
      response.criticalErrors = verificationResult.errors.filter(e => e.severity === 'HIGH');
    }

    if (fixResult) {
      response.autoFix = fixResult;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in sync verification API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sync/verify - Trigger manual sync verification and fixes
 * Body:
 * - action: 'verify' | 'fix' | 'reset'
 * - targets?: string[] - Specific entities to check
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, targets } = body;

    // Verify authentication (admin only)
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

    const verifier = new DataSyncVerifier(true);

    switch (action) {
      case 'verify':
        const result = await verifier.verifyDataSync();
        
        // Log the verification
        await supabase
          .from('sync_verification_logs')
          .insert({
            user_id: user.id,
            action: 'manual_verify',
            result: {
              consistent: result.consistent,
              errorCount: result.errors.length,
              warningCount: result.warnings.length
            },
            created_at: new Date().toISOString()
          });

        return NextResponse.json({
          success: true,
          message: 'Sync verification completed',
          result
        });

      case 'fix':
        const verifyResult = await verifier.verifyDataSync();
        const fixResult = await verifier.autoFixSyncIssues(verifyResult.errors);

        // Log the fix attempt
        await supabase
          .from('sync_verification_logs')
          .insert({
            user_id: user.id,
            action: 'manual_fix',
            result: {
              fixed: fixResult.fixed,
              failed: fixResult.failed,
              details: fixResult.details
            },
            created_at: new Date().toISOString()
          });

        return NextResponse.json({
          success: true,
          message: `Fixed ${fixResult.fixed} issues, ${fixResult.failed} failed`,
          fixResult
        });

      case 'reset':
        // This would reset sync status and clear logs (implement as needed)
        await supabase
          .from('sync_verification_logs')
          .delete()
          .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Keep last 30 days

        return NextResponse.json({
          success: true,
          message: 'Sync logs reset successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be: verify, fix, or reset' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in sync verification POST:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sync/verify - Clean up sync verification logs
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication (admin only)
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

    const { searchParams } = new URL(request.url);
    const daysToKeep = parseInt(searchParams.get('days') || '30');

    // Clean up old logs
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const { error: deleteError } = await supabase
      .from('sync_verification_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up sync logs older than ${daysToKeep} days`
    });

  } catch (error) {
    console.error('Error cleaning sync logs:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}