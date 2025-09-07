#!/bin/bash

# =============================================
# BANNER SYSTEM HEALTH CHECK
# Script to verify banner analytics system is working
# =============================================

echo "============================================="
echo "RENTPARLO.PK BANNER SYSTEM HEALTH CHECK"
echo "============================================="
echo ""

# Check if required tools are available
echo "1. Checking prerequisites..."
if ! command -v curl &> /dev/null; then
    echo "❌ curl is not installed"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "⚠️  jq is not installed (optional, but recommended for pretty JSON output)"
fi

echo "✅ Prerequisites check passed"
echo ""

# Check API endpoints
echo "2. Checking API endpoints..."

# Check banners API
echo "   Checking /api/banners..."
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/banners" | grep -q "200" && \
    echo "   ✅ /api/banners is accessible" || \
    echo "   ❌ /api/banners is not accessible"

# Check banner impression API
echo "   Checking /api/banners/impression..."
curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/banners/impression" \
    -H "Content-Type: application/json" \
    -d '{"bannerId":"test-banner"}' | grep -q "200" && \
    echo "   ✅ /api/banners/impression is accessible" || \
    echo "   ❌ /api/banners/impression is not accessible"

# Check banner click API
echo "   Checking /api/banners/click..."
curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/banners/click" \
    -H "Content-Type: application/json" \
    -d '{"bannerId":"test-banner"}' | grep -q "200" && \
    echo "   ✅ /api/banners/click is accessible" || \
    echo "   ❌ /api/banners/click is not accessible"

echo ""

# Check health endpoint
echo "3. Checking health endpoint..."
HEALTH_STATUS=$(curl -s "http://localhost:3000/api/health/banners" | jq -r '.status' 2>/dev/null || echo "error")

if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo "✅ Banner system health check: HEALTHY"
elif [ "$HEALTH_STATUS" = "unhealthy" ]; then
    echo "❌ Banner system health check: UNHEALTHY"
else
    echo "⚠️  Banner system health check: Unable to determine status"
fi

echo ""

# Summary
echo "4. Summary"
echo "   The banner system consists of:"
echo "   - Banner Impression Tracking: Records when banners are displayed"
echo "   - Banner Click Tracking: Records when users click on banners"
echo "   - Analytics Dashboard: Provides performance metrics and reporting"
echo "   - Health Checks: Monitors system status"
echo ""
echo "   To verify complete functionality:"
echo "   1. Visit the banner test page at /banner-test"
echo "   2. Check the analytics dashboard for data"
echo "   3. Review the database tables for records"
echo ""

echo "============================================="
echo "HEALTH CHECK COMPLETE"
echo "============================================="