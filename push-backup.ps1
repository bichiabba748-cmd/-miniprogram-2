Write-Host "Starting push and backup..." -ForegroundColor Green

# 1. Git push
Write-Host "1/4 Git push..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "   Current branch: $currentBranch" -ForegroundColor Cyan
git push origin $currentBranch
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Git push success" -ForegroundColor Green
} else {
    Write-Host "   Git push failed" -ForegroundColor Red
}

# 2. Create backup
Write-Host "2/4 Creating backup..." -ForegroundColor Yellow
$timestamp = Get-Date -Format 'yyyy-MM-ddTHH-mm-ss-fffZ'
$backupPath = "backups\backup-$timestamp"
$tempPath = "backups\temp-$timestamp"
New-Item -ItemType Directory -Force -Path $tempPath | Out-Null

# 3. Copy files (exclude node_modules)
Write-Host "3/4 Copying files..." -ForegroundColor Yellow
Copy-Item -Recurse -Force -Path "miniprogram" -Destination "$tempPath\" | Out-Null
Copy-Item -Recurse -Force -Path "docs" -Destination "$tempPath\" | Out-Null

# Copy cloudfunctions without node_modules
$cloudFuncsPath = "$tempPath\cloudfunctions"
New-Item -ItemType Directory -Force -Path $cloudFuncsPath | Out-Null
Get-ChildItem -Path "cloudfunctions" -Directory | ForEach-Object {
    $funcName = $_.Name
    $destPath = "$cloudFuncsPath\$funcName"
    New-Item -ItemType Directory -Force -Path $destPath | Out-Null
    Get-ChildItem -Path "cloudfunctions\$funcName" -Exclude "node_modules" | ForEach-Object {
        Copy-Item -Recurse -Force -Path $_.FullName -Destination "$destPath\" | Out-Null
    }
}

# 4. Compress to ZIP (with retry)
Write-Host "4/4 Compressing..." -ForegroundColor Yellow
$retryCount = 0
$maxRetries = 3
$success = $false

while (-not $success -and $retryCount -lt $maxRetries) {
    try {
        Compress-Archive -Path "$tempPath\*" -DestinationPath "$backupPath.zip" -Force
        $success = $true
        Write-Host "   Compression successful" -ForegroundColor Green
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "   Retry $retryCount/$maxRetries in 2 seconds..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        } else {
            Write-Host "   Compression failed after $maxRetries attempts" -ForegroundColor Red
            Write-Host "   Error: $_" -ForegroundColor Red
        }
    }
}

if ($success) {
    Remove-Item -Recurse -Force -Path $tempPath | Out-Null
}

# Clean old backups (keep latest 7)
Write-Host "Cleaning old backups..." -ForegroundColor Yellow
$backups = Get-ChildItem -Path "backups" -Filter "backup-*.zip" | Sort-Object LastWriteTime -Descending
if ($backups.Count -gt 7) {
    $backups | Select-Object -Skip 7 | Remove-Item -Force
}

# Done
Write-Host "" -ForegroundColor Green
Write-Host "Done!" -ForegroundColor Green
Write-Host "Backup Path: $backupPath.zip" -ForegroundColor Cyan
Write-Host "Git Status: Pushed to remote repository" -ForegroundColor Cyan