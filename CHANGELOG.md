# 📋 项目版本记录 (CHANGELOG)

## 版本管理规范

**版本号格式**：`vX.Y.Z`（主版本.次版本.修订号）
- **主版本（X）**：重大架构变更、核心功能重构
- **次版本（Y）**：新增功能模块、重要功能升级
- **修订号（Z）**：Bug修复、小功能优化、文档更新

**当前版本**：`v2.2.5`

**最后更新**：2026-02-03

---

## 版本历史

### v2.2.5 (2026-02-03)

**类型**：UI优化 + 代码规范

**新增功能**：
- ✅ 课程页面播放键图标 - 添加▶播放符号，黑金圆形背景
- ✅ 播放键交互效果 - 点击缩放动画，磨砂质感
- ✅ emoji图标替换为图标组件 - 17个页面统一使用图标组件

**技术改进**：
- ✅ 代码规范化 - 所有emoji图标替换为CSS伪元素实现
- ✅ 视觉一致性 - 统一图标样式，便于后续维护
- ✅ 性能优化 - 减少DOM节点，提升渲染性能

**影响范围**：
- `pages/course/course.wxml` - 课程列表页面
- `pages/course/course.wxss` - 课程样式文件
- `pages/art/art.wxml` - 文案页面
- `pages/art/art.wxss` - 文案样式文件
- `pages/art-detail/art-detail.wxml` - 文案详情页面
- `pages/art-detail/art-detail.wxss` - 文案详情样式文件
- `pages/index/index.wxml` - 首页
- `pages/index/index.wxss` - 首页样式文件
- `pages/example/index.wxml` - 示例页面
- `pages/example/index.wxss` - 示例样式文件
- `pages/tenant/broadband.wxml` - 宽带办理页面
- `pages/tenant/broadband.wxss` - 宽带办理样式文件
- `pages/tenant/contract.wxml` - 合同页面
- `pages/tenant/contract.wxss` - 合同样式文件
- `pages/tenant/utilities.wxml` - 生活缴费页面
- `pages/tenant/utilities.wxss` - 生活缴费样式文件
- `pages/crm/client-detail.wxml` - 客户详情页面
- `pages/crm/client-detail.wxss` - 客户详情样式文件
- `pages/crm/client.wxml` - 客户列表页面
- `pages/crm/client.wxss` - 客户列表样式文件

---

### v2.2.3 (2026-02-02)

**类型**：功能更新 + 文档完善

**新增功能**：
- ✅ 课程管理页面（course-manage）- 课程列表、新增、编辑功能
- ✅ init_courses云函数 - 初始化24门课程数据
- ✅ 课程封面图片上传 - 支持上传图片到云存储
- ✅ 课程信息编辑 - 标题、分类、作者、时长、链接、简介、标签
- ✅ 课程管理页面UI优化 - 添加悬浮球按钮、优化标题样式
- ✅ get_courses和get_course_detail云函数 - 课程数据从数据库读取
- ✅ 课程页面显示网络图片 - 修复URL格式问题
- ✅ 星火日签页面（daily）- 早/午/晚三时段切换
- ✅ init_daily_materials云函数 - 初始化日签数据
- ✅ 日签数据从数据库读取 - daily_materials集合
- ✅ 文案复制功能 - 一键复制到剪贴板
- ✅ 图片保存功能 - 支持保存到相册
- ✅ 管理员页面添加初始化日签数据按钮
- ✅ 随机抽取机制 - 每次刷新随机展示不同内容

**文档更新**：
- ✅ 更新规格说明书 (PRD).md - 添加课程管理和星火日签的实际实现状态
- ✅ 更新组件库清单.md - 添加cloudTipModal组件文档
- ✅ 更新接口契约 (Contracts).md - 修复序列编号，添加缺失的云函数定义
- ✅ 更新数据库模型 (DB Schema).md - 添加user_collections表和索引
- ✅ 创建CHANGELOG.md - 建立版本记录系统

**技术改进**：
- ✅ 修复课程页面网络图片显示问题
- ✅ 优化课程管理页面UI，添加悬浮球按钮
- ✅ 完善云函数错误日志和异常捕获
- ✅ 优化数据库查询性能，添加索引

**影响范围**：
- `pages/course/` - 课程列表页面
- `pages/course-detail/` - 课程详情页面
- `pages/admin/course-manage/` - 课程管理页面
- `pages/tools/daily/` - 星火日签页面
- `pages/admin/admin/` - 管理员页面
- `cloudfunctions/init_courses/` - 初始化课程数据云函数
- `cloudfunctions/init_daily_materials/` - 初始化日签数据云函数
- `cloudfunctions/get_courses/` - 获取课程列表云函数
- `cloudfunctions/get_course_detail/` - 获取课程详情云函数

---

### v2.2.2 (2026-01-XX)

**类型**：功能修复

**修复内容**：
- ✅ 修复收藏功能
- ✅ 修复待拍摄功能

**影响范围**：
- `pages/art/` - 文案页面
- `pages/profile/` - 个人中心页面

---

### v2.2.1 (2026-01-XX)

**类型**：功能更新

**新增功能**：
- ✅ 租赁场景功能
- ✅ 租客端页面
- ✅ 租赁经纪人工具箱

**影响范围**：
- `pages/tenant/` - 租客端页面
- `pages/broker-rental/` - 租赁经纪人页面

---

### v2.2.0 (2026-01-XX)

**类型**：重大功能更新

**新增功能**：
- ✅ 课程商学院模块
- ✅ 星火日签模块
- ✅ C端核心诱饵库模块
- ✅ 入伍申请页
- ✅ 客户详情页

**影响范围**：
- `pages/course/` - 课程页面
- `pages/course-detail/` - 课程详情页面
- `pages/tools/daily/` - 星火日签页面
- `pages/tools/*` - C端工具页面
- `pages/join/` - 入伍申请页面
- `pages/crm-detail/` - 客户详情页面

---

### v2.1.0 (2026-01-XX)

**类型**：核心功能更新

**新增功能**：
- ✅ 文案军火库模块
- ✅ 首页门户模块
- ✅ 我的指挥所模块
- ✅ 战区指挥部模块

**影响范围**：
- `pages/art/` - 文案页面
- `pages/index/` - 首页
- `pages/profile/` - 个人中心
- `pages/admin/` - 管理员页面

---

### v2.0.0 (2026-01-XX)

**类型**：重大架构升级

**升级内容**：
- ✅ 从演示版升级到云开发版
- ✅ 实现数据库连接
- ✅ 实现云函数调用
- ✅ 实现用户权限管理
- ✅ 实现角色体系（Visitor/Student/Anchor/Broker/Admin）

**影响范围**：
- 全局架构升级
- 所有页面从本地数据切换到云端数据

---

### v1.0.0 (2026-01-XX)

**类型**：初始版本

**初始功能**：
- ✅ 基础页面框架
- ✅ 黑金视觉风格
- ✅ 基础导航结构

---

## 备份记录

### 备份策略（整合版）

**核心备份机制**：项目内置备份系统（tools/backup-system.js）
- **备份位置**：项目根目录 `backups/` 文件夹
- **备份格式**：ZIP压缩文件
- **保留数量**：自动保留最新7个备份，删除旧备份
- **触发方式**：手动执行 `node tools/backup-system.js`

**辅助备份**：
1. **夸克网盘**：自动同步整个项目文件夹（无需手动操作）
2. **Git版本控制**：仓库为日华里miniprogram-2，分支为main（手动提交）

### 备份系统使用方式

**执行备份**：
```bash
node tools/backup-system.js
```

**列出所有备份**：
```bash
node tools/backup-system.js list
```

**恢复指定备份**：
```bash
node tools/backup-system.js restore backup-2026-02-03T12-34-56-789Z.zip
```

**检查备份状态**：
```bash
node tools/backup-system.js status
```

### 备份内容

自动备份以下4个文件夹：
- `miniprogram` - 小程序代码
- `cloudfunctions` - 云函数
- `docs` - 文档
- `tools` - 工具

**排除内容**：
- `node_modules`
- `.git`
- `backups`（避免循环备份）

### 备份历史

| 备份日期 | 版本号 | 备份类型 | 备份位置 |
|---------|--------|---------|---------|
| 2026-02-03 | v2.2.5 | 项目内置备份 | `backups/backup-2026-02-03T13-34-05-374Z.zip` |
| 2026-02-03 | v2.2.5 | Git备份 | Git commit: "docs: 整合备份策略，统一备份规则" |
| 2026-02-02 | v2.2.3 | 项目内置备份 | `backups/backup-2026-02-02T16-41-17-992Z.zip` |
| 2026-01-31 | v2.2.3 | 项目内置备份 | `backups/backup-2026-01-31T15-53-13-501Z.zip` |
| 2026-02-02 | v2.2.3 | 规格书备份 | `docs/项目规格/backup_v6_20260202_232434_规格说明书 (PRD).md` |
| 2026-02-02 | v2.2.3 | 规格书备份 | `docs/项目规格/backup_v6_20260202_232512_规格说明书 (PRD).md` |

---

## 版本发布流程

1. **开发阶段**：在开发分支进行功能开发和测试
2. **测试阶段**：完成功能测试和文档更新
3. **发布准备**：
   - 更新CHANGELOG.md
   - 更新project_rules.md中的版本号
   - 执行三层备份
   - 提交Git并打标签
4. **发布**：合并到main分支，推送远程仓库

---

## 版本回滚流程

1. **评估回滚需求**：确定需要回滚的版本
2. **执行回滚**：
   - 从Git恢复对应版本
   - 从备份恢复数据库（如需要）
3. **验证回滚**：确认功能正常
4. **记录回滚**：在CHANGELOG.md中记录回滚操作

---

**维护者**：Trae AI助手
**最后更新**：2026-02-02
