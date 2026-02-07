# Deploy Database Rules via Cloud Function (adminTools)
# This script invokes the adminTools cloud function to apply database.rules.json
# Usage: powershell -ExecutionPolicy Bypass -File .\deploy-db-rules.ps1

try {
    Write-Host "Reading database.rules.json..."
    $rulesContent = Get-Content -Path ".\database.rules.json" -Raw
    
    # Validate JSON
    $null = $rulesContent | ConvertFrom-Json

    # Convert to Base64 to avoid JSON escaping hell in CLI arguments
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($rulesContent)
    $base64 = [Convert]::ToBase64String($bytes)

    # Construct the payload for adminTools
    $params = @{
        action = "updateDatabaseRules"
        data = @{
            rulesBase64 = $base64
        }
    }
    
    $paramsJson = $params | ConvertTo-Json -Depth 5 -Compress
    
    # Escape quotes for the command line argument (Windows cmd/PowerShell passing to tcb)
    $paramsJsonEscaped = $paramsJson.Replace('"', '\"')
    
    Write-Host "Invoking adminTools to update database permissions (using Base64)..."
    
    # Check if tcb is available
    if (Get-Command tcb -ErrorAction SilentlyContinue) {
        # Call tcb with -e to avoid interactive prompt
        # Using Start-Process to capture output reliably? No, simple execution first.
        $result = tcb fn invoke adminTools --params "$paramsJsonEscaped" -e cloudbase-0gjqvewz98229914
        Write-Host $result
    }
    else {
        Write-Error "CloudBase CLI (tcb) not found in PATH."
        exit 1
    }
    
    Write-Host "Deployment triggered. Please check console logs if available."
}
catch {
    Write-Error "An error occurred: $_"
    exit 1
}
