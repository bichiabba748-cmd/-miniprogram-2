# MCP GitHub 配置指南

## 📌 核心仓库信息（必配）

**正确的仓库信息**：
- **owner**: `bichiabba748-cmd`
- **repo**: `-miniprogram-2`
- **远程URL**: `https://github.com/bichiabba748-cmd/-miniprogram-2.git`

## 🚀 常用MCP Git工具调用示例

### 1. 查看提交记录
```javascript
mcp_GitHub_list_commits({
  owner: "bichiabba748-cmd",
  repo: "-miniprogram-2",
  sha: "v1" // 分支名
})
```

### 2. 搜索代码
```javascript
mcp_GitHub_search_code({
  q: "repo:bichiabba748-cmd/-miniprogram-2 checkPermission"
})
```

### 3. 创建PR
```javascript
mcp_GitHub_create_pull_request({
  owner: "bichiabba748-cmd",
  repo: "-miniprogram-2",
  title: "功能标题",
  head: "v1", // 源分支
  base: "main" // 目标分支
})
```

### 4. 查看PR列表
```javascript
mcp_GitHub_list_pull_requests({
  owner: "bichiabba748-cmd",
  repo: "-miniprogram-2",
  state: "open" // open/closed/all
})
```

### 5. 查看PR详情
```javascript
mcp_GitHub_get_pull_request({
  owner: "bichiabba748-cmd",
  repo: "-miniprogram-2",
  pull_number: 1 // PR编号
})
```

### 6. 合并PR
```javascript
mcp_GitHub_merge_pull_request({
  owner: "bichiabba748-cmd",
  repo: "-miniprogram-2",
  pull_number: 1
})
```

## 🔧 快速验证方法

**获取当前仓库信息**：
```bash
git remote get-url origin
```

**验证MCP连接**：
```javascript
mcp_GitHub_list_commits({
  owner: "bichiabba748-cmd",
  repo: "-miniprogram-2",
  sha: "v1"
})
```

## 📋 推送流程（推荐）

1. **检查状态**：`git status`
2. **添加更改**：`git add .`
3. **提交**：`git commit -m "提交信息"`
4. **使用MCP验证**：运行上面的`list_commits`查看提交
5. **推送**：`git push origin v1`

## 🚨 故障排查

**如果MCP失败**：
1. ✅ 检查仓库信息是否正确
2. ✅ 验证Personal Access Token是否有效
3. ✅ 降级使用PowerShell命令

## 💡 使用技巧

- **复制即用**：直接复制示例代码，替换必要参数
- **批量操作**：可以一次复制多个工具调用
- **快速查询**：遇到Git操作时，直接查阅本文件
- **定期更新**：如果仓库信息变更，及时更新本文件

## 🔧 MCP工具适用场景

| 工具名称 | 功能 | 支持状态 | 备注 |
|---------|------|---------|------|
| `list_commits` | 查看提交记录 | ✅ 支持 | 推荐使用 |
| `search_code` | 搜索代码 | ✅ 支持 | 推荐使用 |
| `create_pull_request` | 创建PR | ✅ 支持 | 推荐使用 |
| `list_pull_requests` | 查看PR列表 | ✅ 支持 | 推荐使用 |
| `get_pull_request` | 查看PR详情 | ✅ 支持 | 推荐使用 |
| `merge_pull_request` | 合并PR | ✅ 支持 | 推荐使用 |
| `git add` | 本地文件添加 | ❌ 不支持 | 必须使用PowerShell |
| `git commit` | 本地文件提交 | ❌ 不支持 | 必须使用PowerShell |
| `git push` | 推送到远程 | ❌ 不支持 | 必须使用PowerShell |
| `ZIP备份` | 本地ZIP备份 | ❌ 不支持 | 必须使用PowerShell |

## 📋 工具选择策略

**优先级1：MCP工具**（90%操作）
- 查看仓库状态和提交记录
- 创建/管理/删除分支
- 创建/合并/关闭Pull Request
- 查看和管理Issues
- 搜索代码

**优先级2：PowerShell**（10%操作）
- 本地文件操作（git add、git commit）
- 推送到远程（当MCP不支持时）
- MCP调用失败时的降级方案
- ZIP备份操作

**执行策略**：
1. 遇到Git操作时，首先检查MCP工具是否可用
2. 如果MCP支持，优先使用MCP工具
3. 如果MCP不支持或失败，降级到PowerShell
4. 记录工具选择结果，便于后续优化

## 📌 版本信息

- **创建时间**：2026-02-07
- **适用版本**：v2.2.5+
- **维护者**：AI协作系统
- **最后更新**：2026-02-07

## 📚 文档更新日志

| 日期 | 更新内容 | 更新人 | 备注 |
|------|---------|--------|------|
| 2026-02-07 | 新增MCP GitHub配置指南 | AI协作系统 | 解决仓库信息查询问题 |
| 2026-02-07 | 增加MCP工具适用场景 | AI协作系统 | 明确工具支持状态 |
| 2026-02-07 | 增加工具选择策略 | AI协作系统 | 提供工具选择指导 |