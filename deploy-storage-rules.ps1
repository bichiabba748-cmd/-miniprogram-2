# Deploy Storage Rules via Cloud Function (adminTools)
# This script invokes the adminTools cloud function to apply storage.rules.json
# Usage: powershell -ExecutionPolicy Bypass -File .\deploy-storage-rules.ps1

try {
    Write-Host "Reading storage.rules.json..."
    $rulesContent = Get-Content -Path ".\storage.rules.json" -Raw
    
    # Validate JSON
    $null = $rulesContent | ConvertFrom-Json

    # Convert to Base64 to avoid JSON escaping hell in CLI arguments
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($rulesContent)
    $base64 = [Convert]::ToBase64String($bytes)

    # Construct the payload for adminTools
    $params = @{
        action = "updateStorageRules"
        data = @{
            rulesBase64 = $base64
            debug = $true
        }
    }
    
    $paramsJson = $params | ConvertTo-Json -Depth 5 -Compress
    
    # Escape quotes for the command line argument (Windows cmd/PowerShell passing to tcb)
    $paramsJsonEscaped = $paramsJson.Replace('"', '\"')
    
    Write-Host "Invoking adminTools to update storage permissions (using Base64)..."
    
    # Check if tcb is available
    if (Get-Command tcb -ErrorAction SilentlyContinue) {
        # Call tcb with -e to avoid interactive prompt
        Write-Host "Executing tcb command..."
        $result = tcb fn invoke adminTools --params "$paramsJsonEscaped" -e cloudbase-0gjqvewz98229914 2>&1 | Out-String
        Write-Host "TCB Result (Raw):"
        Write-Host $result
        
        # Try to parse result if it looks like JSON
        try {
            # tcb output might contain non-JSON text headers
            # Extract JSON part (simplified assumption: last line or finding {)
            # But mostly we just want to see the output now.
        } catch {}
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
