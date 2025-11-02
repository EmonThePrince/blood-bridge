# BloodBridge Frontend Quick Start Script
# Run this to start the Expo development server

Write-Host "🩸 BloodBridge Mobile App" -ForegroundColor Red
Write-Host "================================" -ForegroundColor Red
Write-Host ""

# Navigate to frontend directory
$frontendPath = "E:\Programming\app\blood-bridge"
Set-Location $frontendPath

# Get local IP address
Write-Host "Finding your IP address..." -ForegroundColor Green
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*","Ethernet*" | Where-Object {$_.IPAddress -notlike "169.*"} | Select-Object -First 1).IPAddress

if ($ipAddress) {
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Update your API configuration!" -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Your computer's IP address: $ipAddress" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Update config/api.js with:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For Android Emulator:" -ForegroundColor Green
    Write-Host "  export const API_BASE_URL = 'http://10.0.2.2:8000';" -ForegroundColor White
    Write-Host ""
    Write-Host "For Physical Device (same WiFi):" -ForegroundColor Green
    Write-Host "  export const API_BASE_URL = 'http://$ipAddress:8000';" -ForegroundColor White
    Write-Host ""
    Write-Host "For iOS Simulator:" -ForegroundColor Green
    Write-Host "  export const API_BASE_URL = 'http://localhost:8000';" -ForegroundColor White
    Write-Host ""
    Write-Host "================================" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Starting Expo development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Options:" -ForegroundColor Yellow
Write-Host "  - Press 'a' for Android" -ForegroundColor Cyan
Write-Host "  - Press 'i' for iOS" -ForegroundColor Cyan
Write-Host "  - Press 'w' for Web" -ForegroundColor Cyan
Write-Host "  - Scan QR code with Expo Go app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Red
Write-Host ""

# Start Expo
npx expo start --clear
