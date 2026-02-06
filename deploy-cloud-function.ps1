<#
.SYNOPSIS
    Automates the deployment of WeChat Cloud Functions.

.DESCRIPTION
    This script installs dependencies and deploys a specified cloud function using the CloudBase CLI (tcb).
    It automatically checks for the CLI and attempts to install it if missing.
    It reads configuration from config.json if available.

.PARAMETER FunctionName
    The name of the cloud function to deploy. Defaults to "getleaderboardv3".

.PARAMETER EnvId
    The CloudBase Environment ID. Defaults to "cloudbase-0gjqvewz98229914".

.EXAMPLE
    .\deploy-cloud-function.ps1
    Deploys the default function (getleaderboardv3).

.EXAMPLE
    .\deploy-cloud-function.ps1 -FunctionName "login"
    Deploys the "login" function.
#>

param (
    [string]$FunctionName = "getleaderboardv3",
    [string]$EnvId = "cloudbase-0gjqvewz98229914"
)

$ErrorActionPreference = "Stop"

function Test-CommandExists {
    param ($Command)
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   WeChat Cloud Function Deploy Script    " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Target Function: $FunctionName"
Write-Host "Target Env ID:   $EnvId"
Write-Host "------------------------------------------"

# 1. Check for Node.js/npm
if (-not (Test-CommandExists npm)) {
    Write-Error "Error: npm is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
}

# 2. Check for CloudBase CLI
if (-not (Test-CommandExists tcb)) {
    Write-Warning "CloudBase CLI (tcb) is not found."
    Write-Host "Attempting to install @cloudbase/cli globally..." -ForegroundColor Yellow
    
    try {
        npm install -g @cloudbase/cli
    }
    catch {
        Write-Error "Failed to install @cloudbase/cli. Please run 'npm install -g @cloudbase/cli' manually."
        exit 1
    }
    
    Write-Host "CloudBase CLI installed successfully." -ForegroundColor Green
    Write-Host "IMPORTANT: You need to log in first." -ForegroundColor Yellow
    Write-Host "Please run 'tcb login' in your terminal, authorize in the browser, and then run this script again."
    exit 0
}

# 3. Verify Function Directory
$FunctionPath = Join-Path "cloudfunctions" $FunctionName
if (-not (Test-Path $FunctionPath)) {
    Write-Error "Error: Cloud function directory not found at: $FunctionPath"
    exit 1
}

# 4. Read Configuration
$ConfigPath = Join-Path $FunctionPath "config.json"
$Runtime = "Nodejs16.13" # Default fallback
$Handler = "index.main"
$Memory = 128
$Timeout = 5

if (Test-Path $ConfigPath) {
    try {
        Write-Host "Reading configuration from config.json..." -ForegroundColor Gray
        $Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        if ($Config.runtime) { $Runtime = $Config.runtime }
        if ($Config.handler) { $Handler = $Config.handler }
        if ($Config.memory) { $Memory = $Config.memory }
        if ($Config.timeout) { $Timeout = $Config.timeout }
        Write-Host "Config loaded: Runtime=$Runtime, Handler=$Handler, Memory=$Memory, Timeout=$Timeout" -ForegroundColor Gray
    } catch {
        Write-Warning "Failed to parse config.json, using defaults."
    }
} else {
    Write-Warning "config.json not found, using defaults."
}

# 5. Install Dependencies
Write-Host "Step 1/2: Installing dependencies..." -ForegroundColor Cyan
Push-Location $FunctionPath
try {
    npm install --production --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
}
catch {
    Write-Error "Failed to install dependencies for $FunctionName."
    Pop-Location
    exit 1
}
Pop-Location

# 6. Deploy Function
Write-Host "Step 2/2: Uploading and deploying to CloudBase..." -ForegroundColor Cyan
Push-Location $FunctionPath
try {
    # Using cmd /c to ensure tcb.cmd is picked up correctly on Windows if needed
    # Deploying from within the directory ensures correct file structure in zip
    $DeployCmd = "tcb functions:deploy -e $EnvId --force"
    Write-Host "Executing: $DeployCmd (in $FunctionPath)" -ForegroundColor Gray
    
    # Pipe newline to accept default configuration if prompted
    cmd /c "echo. | $DeployCmd"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "------------------------------------------"
        Write-Host "SUCCESS: $FunctionName deployed successfully!" -ForegroundColor Green
        Write-Host "------------------------------------------"
    } else {
        throw "tcb deployment failed"
    }
}
catch {
    Write-Error "Deployment failed. Please check the error messages above."
    Write-Host "Tip: If you haven't logged in, run 'tcb login' first." -ForegroundColor Yellow
    Pop-Location
    exit 1
}
Pop-Location
