# 权限矩阵管理和测试工具
# PowerShell版本

$projectRoot = Split-Path -Parent $PSScriptRoot
$roleManagerPath = Join-Path $projectRoot "miniprogram" "utils" "roleManager.js"
$permissionMatrixPath = Join-Path $projectRoot "docs" "架构决策记录" "003-权限控制矩阵.md"

Write-Host "开始权限矩阵测试..."

# 读取角色管理器
function Read-RoleManager {
    try {
        $content = Get-Content -Path $roleManagerPath -Raw
        return Parse-RoleManager $content
    } catch {
        Write-Error "读取角色管理器失败: $($_.Exception.Message)"
        return $null
    }
}

# 解析角色管理器
function Parse-RoleManager {
    param(
        [string]$content
    )
    
    $roles = @()
    $permissions = @{}
    
    # 提取角色定义
    $roleMatch = [regex]::Match($content, 'const ROLES =\s*\{[^}]*\}')
    if ($roleMatch.Success) {
        $roleContent = $roleMatch.Value
        $roleMatches = [regex]::Matches($roleContent, '(\w+):\s*["\'](\w+)["\']')
        foreach ($match in $roleMatches) {
            $roles += $match.Groups[2].Value
        }
    }
    
    # 提取权限矩阵
    $permMatch = [regex]::Match($content, 'const PERMISSIONS =\s*\{[^}]*\}')
    if ($permMatch.Success) {
        $permContent = $permMatch.Value
        $permMatches = [regex]::Matches($permContent, '(\w+):\s*\[(.*?)\]')
        foreach ($match in $permMatches) {
            $permName = $match.Groups[1].Value
            $permRoles = $match.Groups[2].Value -split ',' | ForEach-Object { $_.Trim() -replace '["\']', '' }
            $permissions[$permName] = $permRoles
        }
    }
    
    return @{ roles = $roles; permissions = $permissions }
}

# 读取权限矩阵文档
function Read-PermissionMatrix {
    try {
        $content = Get-Content -Path $permissionMatrixPath -Raw
        return Parse-PermissionMatrix $content
    } catch {
        Write-Error "读取权限矩阵文档失败: $($_.Exception.Message)"
        return $null
    }
}

# 解析权限矩阵文档
function Parse-PermissionMatrix {
    param(
        [string]$content
    )
    
    $matrix = @{}
    $lines = $content -split '\n'
    $inMatrix = $false
    $headers = @()
    
    foreach ($line in $lines) {
        if ($line -match '\| 权限 \| visitor \| student \|') {
            $inMatrix = $true
            $headers = $line -split '\|' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
            continue
        }
        
        if ($inMatrix -and $line -match '\| --- \|') {
            continue
        }
        
        if ($inMatrix -and $line.StartsWith('|')) {
            $cells = $line -split '\|' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
            if ($cells.Count -gt 1) {
                $permission = $cells[0]
                $matrix[$permission] = @{}
                
                for ($i = 1; $i -lt $cells.Count; $i++) {
                    if ($i -lt $headers.Count) {
                        $matrix[$permission][$headers[$i]] = $cells[$i] -eq '✅'
                    }
                }
            }
        }
        
        if ($inMatrix -and $line -eq '' -and $headers.Count -gt 0) {
            break
        }
    }
    
    return $matrix
}

# 测试权限配置
function Test-Permissions {
    $roleManager = Read-RoleManager
    $matrixDoc = Read-PermissionMatrix
    
    if (!$roleManager -or !$matrixDoc) {
        return
    }
    
    $issues = @()
    
    # 检查角色定义一致性
    $firstPerm = $matrixDoc.Keys | Select-Object -First 1
    $docRoles = if ($firstPerm) { $matrixDoc[$firstPerm].Keys } else { @() }
    $codeRoles = $roleManager.roles
    
    # 检查代码中缺少的角色
    foreach ($role in $docRoles) {
        if ($codeRoles -notcontains $role) {
            $issues += @{
                type = 'ERROR'
                message = "代码中缺少角色定义: $role"
                source = 'roleManager.js'
            }
        }
    }
    
    # 检查文档中缺少的角色
    foreach ($role in $codeRoles) {
        if ($docRoles -notcontains $role) {
            $issues += @{
                type = 'WARNING'
                message = "文档中缺少角色: $role"
                source = '003-权限控制矩阵.md'
            }
        }
    }
    
    # 检查权限定义一致性
    $docPermissions = $matrixDoc.Keys
    $codePermissions = $roleManager.permissions.Keys
    
    # 检查代码中缺少的权限
    foreach ($permission in $docPermissions) {
        if ($codePermissions -notcontains $permission) {
            $issues += @{
                type = 'ERROR'
                message = "代码中缺少权限定义: $permission"
                source = 'roleManager.js'
            }
        }
    }
    
    # 检查文档中缺少的权限
    foreach ($permission in $codePermissions) {
        if ($docPermissions -notcontains $permission) {
            $issues += @{
                type = 'WARNING'
                message = "文档中缺少权限: $permission"
                source = '003-权限控制矩阵.md'
            }
        }
    }
    
    # 检查权限配置一致性
    foreach ($permission in $docPermissions) {
        if ($codePermissions -contains $permission) {
            $codeRoles = $roleManager.permissions[$permission]
            
            foreach ($role in $docRoles) {
                $docHasPermission = $matrixDoc[$permission][$role]
                $codeHasPermission = $codeRoles -contains $role
                
                if ($docHasPermission -ne $codeHasPermission) {
                    $issues += @{
                        type = 'ERROR'
                        message = "权限配置不一致: $permission 对于角色 $role"
                        source = '权限矩阵不匹配'
                    }
                }
            }
        }
    }
    
    # 生成报告
    Generate-Report $issues
}

# 生成报告
function Generate-Report {
    param(
        [array]$issues
    )
    
    Write-Host "`n=== 权限矩阵测试报告 ==="
    
    if ($issues.Count -eq 0) {
        Write-Host "✅ 权限矩阵配置一致"
        return
    }
    
    Write-Host "❌ 发现 $($issues.Count) 个问题:"
    
    for ($i = 0; $i -lt $issues.Count; $i++) {
        $issue = $issues[$i]
        Write-Host "`n$($i + 1). [$($issue.type)] $($issue.message)"
        Write-Host "   来源: $($issue.source)"
    }
}

# 生成权限测试用例
function Generate-TestCases {
    Write-Host "`n=== 权限测试用例 ==="
    
    $roleManager = Read-RoleManager
    if (!$roleManager) {
        return
    }
    
    $roles = $roleManager.roles
    $permissions = $roleManager.permissions
    
    foreach ($role in $roles) {
        Write-Host "`n角色: $role"
        Write-Host "权限列表:"
        
        foreach ($permission in $permissions.Keys) {
            $allowedRoles = $permissions[$permission]
            $hasPermission = $allowedRoles -contains $role
            Write-Host "  - $permission: $($hasPermission ? '✅' : '❌')"
        }
    }
}

# 执行测试
Test-Permissions
Generate-TestCases