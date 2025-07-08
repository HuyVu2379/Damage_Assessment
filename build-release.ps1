# Build script với keystore passwords
# Chạy script này để build release với keystore

# Đọc mật khẩu từ file local
if (Test-Path "android\gradle.properties.local") {
    $localProps = Get-Content "android\gradle.properties.local" | Where-Object { $_ -match "^MYAPP_" }
    foreach ($prop in $localProps) {
        $name, $value = $prop -split "=", 2
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
        Write-Host "Set environment variable: $name"
    }
} else {
    Write-Host "CẢNH BÁO: Không tìm thấy file android\gradle.properties.local"
    Write-Host "Vui lòng tạo file này với nội dung mật khẩu keystore"
    exit 1
}

# Build release APK
Write-Host "Building release APK..."
npx expo run:android --variant release

# Hoặc build với EAS
# Write-Host "Building with EAS..."
# npx eas build --platform android --profile production
