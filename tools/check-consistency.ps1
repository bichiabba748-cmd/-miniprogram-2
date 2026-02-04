# 代码-数据库一致性检查脚本
# PowerShell版本

$projectRoot = Split-Path -Parent $PSScriptRoot
$databaseModelPath = Join-Path $projectRoot "docs" "数据库模型" "🏛️ 数据库模型 (DB Schema).md"
$codePaths = @{
    cloudFunctions = Join-Path $projectRoot "cloudfunctions"
    pages = Join-Path $projectRoot "miniprogram" "pages"
    utils = Join-Path $projectRoot "miniprogram" "utils"
}

Write-Host "开始代码-数据库一致性检查..."

# 读取数据库模型
function Read-DatabaseModel {
    try {
        $content = Get-Content -Path $databaseModelPath -Raw
        return Parse-DatabaseModel $content
    } catch {
        Write-Error "读取数据库模型失败: $($_.Exception.Message)"
        return $null
    }
}

# 解析数据库模型
function Parse-DatabaseModel {
    param(
        [string]$content
    )
    
    $collections = @()
    $lines = $content -split '\n'
    $inCollection = $false
    
    foreach ($line in $lines) {
        if ($line -match '^## (\w+) 集合') {
            $collectionName = $matches[1]
            $collections += $collectionName
            $inCollection = $true
        }
    }
    
    return $collections
}

# 扫描代码中的数据库操作
function Scan-CodeForDBOperations {
    $dbOperations = @()
    
    foreach ($path in $codePaths.Values) {
        if (Test-Path $path) {
            Get-ChildItem -Path $path -Recurse -Filter "*.js" | ForEach-Object {
                Scan-File $_.FullName $dbOperations
            }
        }
    }
    
    return $dbOperations
}

# 扫描文件
function Scan-File {
    param(
        [string]$filePath,
        [ref]$dbOperations
    )
    
    try {
        $content = Get-Content -Path $filePath -Raw
        $relativePath = $filePath -replace [regex]::Escape($projectRoot), ''
        
        # 匹配数据库操作
        $matches = [regex]::Matches($content, 'db\.(collection|command)\(["\'](\w+)["\']')
        foreach ($match in $matches) {
            $operation = $match.Groups[1].Value
            $target = $match.Groups[2].Value
            $line = ($content.Substring(0, $match.Index) -split '\n').Count
            
            $dbOperations.Value += @{
                file = $relativePath
                operation = $operation
                target = $target
                line = $line
            }
        }
    } catch {
        Write-Error "扫描文件失败: $($_.Exception.Message)"
    }
}

# 检查一致性
function Check-Consistency {
    $collections = Read-DatabaseModel
    if (!$collections) {
        return
    }
    
    $dbOperations = Scan-CodeForDBOperations
    $issues = @()
    
    # 检查未定义的集合操作
    foreach ($op in $dbOperations) {
        if ($op.operation -eq 'collection' -and $collections -notcontains $op.target) {
            $issues += @{
                type = 'ERROR'
                message = "操作未定义的集合: $($op.target)"
                file = $op.file
                line = $op.line
            }
        }
    }
    
    # 检查未使用的集合
    foreach ($collection in $collections) {
        $used = $dbOperations | Where-Object { 
            $_.operation -eq 'collection' -and $_.target -eq $collection
        }
        
        if (!$used) {
            $issues += @{
                type = 'WARNING'
                message = "集合未被使用: $collection"
                file = '数据库模型'
                line = 0
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
    
    Write-Host "`n=== 代码-数据库一致性检查报告 ==="
    
    if ($issues.Count -eq 0) {
        Write-Host "✅ 未发现一致性问题"
        return
    }
    
    Write-Host "❌ 发现 $($issues.Count) 个问题:"
    
    for ($i = 0; $i -lt $issues.Count; $i++) {
        $issue = $issues[$i]
        Write-Host "`n$($i + 1). [$($issue.type)] $($issue.message)"
        Write-Host "   文件: $($issue.file)"
        if ($issue.line -gt 0) {
            Write-Host "   行号: $($issue.line)"
        }
    }
    
    # 更新一致性文档
    Update-ConsistencyDoc $issues
}

# 更新一致性文档
function Update-ConsistencyDoc {
    param(
        [array]$issues
    )
    
    $docPath = Join-Path $projectRoot "docs" "开发进度" "code-db-consistency.md"
    
    try {
        if (Test-Path $docPath) {
            $content = Get-Content -Path $docPath -Raw
        } else {
            $content = "# 代码-数据库一致性检查报告"
        }
        
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        
        $reportSection = "`n## 一致性检查报告

### 检查时间
$timestamp

### 检查结果
- 问题数量: $($issues.Count)

### 详细问题"
        
        foreach ($issue in $issues) {
            $reportSection += "`n
- [$($issue.type)] $($issue.message)
  - 文件: $($issue.file)"
            if ($issue.line -gt 0) {
                $reportSection += "`n  - 行号: $($issue.line)"
            }
        }
        
        # 替换或添加报告部分
        if ($content -match '## 一致性检查报告') {
            $newContent = $content -replace '## 一致性检查报告[\s\S]*?(?=##|$)', $reportSection
        } else {
            $newContent = $content + $reportSection
        }
        
        Set-Content -Path $docPath -Value $newContent -Encoding UTF8
        Write-Host "`n✅ 一致性文档已更新"
    } catch {
        Write-Error "更新一致性文档失败: $($_.Exception.Message)"
    }
}

# 执行检查
Check-Consistency