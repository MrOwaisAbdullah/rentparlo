# =============================================
# BANNER SYSTEM HEALTH CHECK
# PowerShell script to verify banner analytics system is working
# =============================================

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "RENTPARLO.PK BANNER SYSTEM HEALTH CHECK" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if required tools are available
Write-Host "1. Checking prerequisites..." -ForegroundColor Yellow
try {
    $curlVersion = curl --version
    Write-Host "✅ curl is available" -ForegroundColor Green
} catch {
    Write-Host "❌ curl is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green
Write-Host ""

# Check API endpoints
Write-Host "2. Checking API endpoints..." -ForegroundColor Yellow

# Check banners API
Write-Host "   Checking /api/banners..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/banners" -Method GET -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ /api/banners is accessible" -ForegroundColor Green
    } else {
        Write-Host "   ❌ /api/banners returned status $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ /api/banners is not accessible" -ForegroundColor Red
}

# Check banner impression API
Write-Host "   Checking /api/banners/impression..." -ForegroundColor Gray
try {
    $body = @{bannerId="test-banner"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/banners/impression" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ /api/banners/impression is accessible" -ForegroundColor Green
    } else {
        Write-Host "   ❌ /api/banners/impression returned status $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ /api/banners/impression is not accessible" -ForegroundColor Red
}

# Check banner click API
Write-Host "   Checking /api/banners/click..." -ForegroundColor Gray
try {
    $body = @{bannerId="test-banner"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/banners/click" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ /api/banners/click is accessible" -ForegroundColor Green
    } else {
        Write-Host "   ❌ /api/banners/click returned status $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ /api/banners/click is not accessible" -ForegroundColor Red
}

Write-Host ""

# Check health endpoint
Write-Host "3. Checking health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health/banners" -Method GET -ErrorAction Stop
    $healthData = $response.Content | ConvertFrom-Json
    
    if ($healthData.status -eq "healthy") {
        Write-Host "✅ Banner system health check: HEALTHY" -ForegroundColor Green
    } elseif ($healthData.status -eq "unhealthy") {
        Write-Host "❌ Banner system health check: UNHEALTHY" -ForegroundColor Red
    } else {
        Write-Host "⚠️  Banner system health check: Unable to determine status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Banner system health check: Unable to determine status" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "4. Summary" -ForegroundColor Yellow
Write-Host "   The banner system consists of:" -ForegroundColor Gray
Write-Host "   - Banner Impression Tracking: Records when banners are displayed" -ForegroundColor Gray
Write-Host "   - Banner Click Tracking: Records when users click on banners" -ForegroundColor Gray
Write-Host "   - Analytics Dashboard: Provides performance metrics and reporting" -ForegroundColor Gray
Write-Host "   - Health Checks: Monitors system status" -ForegroundColor Gray
Write-Host ""
Write-Host "   To verify complete functionality:" -ForegroundColor Gray
Write-Host "   1. Visit the banner test page at /banner-test" -ForegroundColor Gray
Write-Host "   2. Check the analytics dashboard for data" -ForegroundColor Gray
Write-Host "   3. Review the database tables for records" -ForegroundColor Gray
Write-Host ""

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "HEALTH CHECK COMPLETE" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan