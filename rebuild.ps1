# BloodBridge Frontend Rebuild Script

Write-Host "🩸 BloodBridge - Complete Frontend Rebuild" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Red
Write-Host ""

$frontendPath = "E:\Programming\app\blood-bridge"
Set-Location $frontendPath

Write-Host "Step 1: Backup old files..." -ForegroundColor Yellow
if (Test-Path "backup") {
    Remove-Item -Recurse -Force "backup"
}
New-Item -ItemType Directory -Path "backup" | Out-Null
Copy-Item "package.json" "backup/package.json.old" -ErrorAction SilentlyContinue
Copy-Item "App.js" "backup/App.js.old" -ErrorAction SilentlyContinue

Write-Host "Step 2: Replace package.json..." -ForegroundColor Yellow
if (Test-Path "package.json.new") {
    Copy-Item "package.json.new" "package.json" -Force
    Remove-Item "package.json.new"
}

Write-Host "Step 3: Replace App.js..." -ForegroundColor Yellow
if (Test-Path "App.new.js") {
    Copy-Item "App.new.js" "App.js" -Force
    Remove-Item "App.new.js"
}

Write-Host "Step 4: Clean install..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json"
}

Write-Host "Step 5: Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

Write-Host ""
Write-Host "✅ Rebuild complete!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Update API URL in src/config.js" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update src/config.js with your IP address" -ForegroundColor White
Write-Host "2. Run: npx expo start --clear" -ForegroundColor White
Write-Host ""
