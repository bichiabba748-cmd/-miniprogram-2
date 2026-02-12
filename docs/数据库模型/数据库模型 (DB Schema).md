# 🏛️ 数据库模型 (DB Schema)

# 数据库模型定义

> **红线警告**：Cursor 必须严格遵守此 Schema，禁止擅自新增字段或修改字段名
> 

---

## A. 用户表 (users)

```json
{
  "_id": "auto-generated",
  "_openid": "string (主键，微信 OpenID)",
  "role": "visitor | student | anchor | broker | admin",
  "profile": {
    "nickname": "string",
    "avatar": "string (URL)",
    "phone": "string",
    "region": "string (大区/门店)"
  },
  "stats": {
    "totalLeads": "number (累计获客数)",
    "monthLeads": "number (本月获客数)",
    "totalViews": "number (内容浏览数)",
    "contributions": "number (贡献文案数)"
  },
  "application": {
    "phone": "string",
    "experience": "string (从业经验)",
    "status": "pending | approved | rejected",
    "appliedAt": "timestamp",
    "reviewedAt": "timestamp",
    "reviewedBy": "string (_openid)"
  },
  "permissions": {
    "canSubmitLead": "boolean",
    "canViewSecret": "boolean",
    "canManageUsers": "boolean"
  },
  "storeId": "string (归属门店ID, 可选)",
  "inviterId": "string (邀请人ID, 可选)",
  "isNewbie": "boolean (是否新秀, 注册<30天)",
  "medals": ["string (已解锁勋章ID数组)"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**关键字段说明**：

- `role`：决定用户权限矩阵
- `stats.totalLeads` / `monthLeads`：龙虎榜排序依据
- `stats.articleContributions`：文案贡献数（仅主播/经纪人可见）
- `stats.studyProgress`：学习进度 0-100（仅学员可见）
- `application.status`：入伍审核流状态
- `storeId`：归属门店（用于组织架构管理）
- `inviterId`：邀请人（用于渠道追踪）
- `isNewbie`：新秀标识（注册 < 30天，优先显示新秀榜）
- `medals`：勋章系统（获客达人/带看之王/卷王等）

### 勋章系统详细说明（v2.2.5+）

**勋章分类规则**：
- 通用勋章（所有角色）：初出茅庐(first_login)
- 学习勋章（学员+主播+经纪人）：军火专家(content_master)、学霸达人(course_complete)
- 获客勋章（主播专属）：获客达人(lead_hunter)、百人斩(lead_master)、获客王者(lead_king)
- 转化勋章（经纪人专属）：首单达人(first_deal)、成交达人(deal_master)、销售冠军(top_seller)

**勋章数据结构**：
```json
{
  "id": "string (勋章ID)",
  "name": "string (勋章名称)",
  "icon": "string (勋章图标 emoji)",
  "locked": "boolean (是否锁定)",
  "progress": "number (进度百分比 0-100)",
  "condition": "string (解锁条件说明)"
}
```

**⚠️ 重要提示**：
- 角色判断逻辑必须完整，包含所有角色：visitor、student、anchor、broker、admin、customer、tenant
- 学员角色必须包含在学习勋章的条件中
- 测试时必须覆盖所有角色，确保每个角色都能获得对应的勋章
- 勋章图标使用emoji，不使用云存储路径

---

## B. 文案表 (articles)

```json
{
  "_id": "auto-generated",
  "id": "number (业务ID，用于跳转)",
  "title": "string",
  "category": "口播 | 探盘 | 避坑 | IP | discount | bad_news | policy_school | policy_loan | policy_tax | policy_settle | policy_limit | sell_skill",
  "securityLevel": "绝密 | 内部 | 公开",
  "baitType": "image | pdf | text (诱饵类型，可选)",
  "originalContent": "string (高清原图URL，授权后可见，可选)",
  "content": {
    "script": "string (完整文案)",
    "duration": "string (如：60s)",
    "scenes": ["string (适用场景数组)"]
  },
  "stats": {
    "leads": "number (获客数)",
    "views": "number (浏览数)",
    "copies": "number (复制次数)"
  },
  "analysis": {
    "hook": "string (开场钩子分析)",
    "trust": "string (信任构建分析)",
    "action": "string (行动号召分析)"
  },
  "media": {
    "cover": "string (封面 URL)",
    "video": "string (示范视频 URL, 可选)"
  },
  "author": {
    "_openid": "string",
    "nickname": "string"
  },
  "tags": ["string (标签数组)"],
  "status": "draft | published | archived",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**关键字段说明**：

- `securityLevel`：控制可见权限（visitor 只能看"公开"）
- `stats.leads`：排行榜"最强武器"依据
- `analysis`：详情页拆解内容

---

## C. 全局配置表 (global)

```json
{
  "_id": "config (固定ID)",
  "app": {
    "version": "string (如：2.0.1)",
    "maintenance": "boolean (维护模式开关)"
  },
  "leaderboard": {
    "updateFrequency": "number (更新频率，分钟)",
    "topN": "number (榜单显示数量)",
    "lastUpdated": "timestamp"
  },
  "审核": {
    "autoApprove": "boolean (自动通过开关)",
    "requiredFields": ["string (必填字段数组)"]
  },
  "security": {
    "msgCheckEnabled": "boolean",
    "bannedWords": ["string"]
  },
  "ui": {
    "banners": [
      {
        "image": "string (URL)",
        "link": "string (跳转链接)",
        "priority": "number"
      }
    ]
  },
  "updatedAt": "timestamp"
}
```

**关键字段说明**：

- `app.maintenance`：紧急维护开关
- `leaderboard.topN`：龙虎榜显示数量（默认 10）
- `security.msgCheckEnabled`：内容安全总开关

---

---

## D. 入伍申请表 (applications)

```json
{
  "_id": "auto-generated",
  "_openid": "string (主键，微信 OpenID)",
  "name": "string (真实姓名)",
  "phone": "string (手机号，已解密)",
  "identity": "agent_with_exp | agent_no_exp | store_owner",
  "painPoints": ["string (痛点枚举数组)"],
  "status": "pending | approved | rejected",
  "storeId": "string (归属门店ID, 可选)",
  "storeName": "string (门店名称, 可选)",
  "createTime": "timestamp",
  "reviewedAt": "timestamp (可选)",
  "reviewedBy": "string (_openid, 可选)",
  "rejectReason": "string (可选)"
}
```

**关键字段说明**：

- `identity`：身份段位
    - `agent_with_exp`: 经纪人 (有拍摄经验)
    - `agent_no_exp`: 经纪人 (无拍摄经验)
    - `store_owner`: 店东/商圈经理
- `painPoints`：痛点枚举
    - `traffic`: 缺客流
    - `content`: 没素材
    - `skill`: 不会播
    - `convert`: 难成交
- `status`：审核状态
    - `pending`: 待审核
    - `approved`: 已通过（需同步创建 users 记录）
    - `rejected`: 已拒绝
- `storeId`：归属门店ID（审核通过时由管理员分配）
- `storeName`：门店名称（审核通过时由管理员分配）

---

## E. 门店表 (stores)

```json
{
  "_id": "auto-generated",
  "storeId": "string (业务ID, 如: store_001)",
  "name": "string (门店名称)",
  "managerId": "string (店长 _openid)",
  "memberCount": "number (成员数量)",
  "region": "string (所属大区)",
  "createTime": "timestamp",
  "updatedAt": "timestamp"
}
```

**关键字段说明**：

- `storeId`：业务门店ID（用于关联 users.storeId）
- `managerId`：店长 openid（用于权限控制）
- `memberCount`：成员数量（自动统计或手动维护）

---

## F. 系统配置表 (system_config)

```json
{
  "_id": "global_config (固定ID, 单例)",
  "auditFreeMode": "boolean (免审模式开关)",
  "maintenanceMode": "boolean (维护模式开关)",
  "silentMode": "boolean (禁言模式，禁止UGC提交)",
  "announcements": [
    {
      "id": "string",
      "content": "string (播报内容)",
      "priority": "number (优先级)",
      "startTime": "timestamp",
      "endTime": "timestamp"
    }
  ],
  "inviteCodes": [
    {
      "code": "string (邀请码)",
      "createBy": "string (_openid)",
      "usedCount": "number (已使用次数)",
      "maxUse": "number (最大使用次数, -1为无限)"
    }
  ],
  "updatedAt": "timestamp"
}
```

**关键字段说明**：

- `auditFreeMode`：免审模式（老员工提报/发文直通）
- `silentMode`：全员禁言模式（严打期使用）
- `inviteCodes`：渠道邀请码系统（用于追踪招募来源）

---

## G. 课程表 (courses)

```json
{
  "_id": "auto-generated",
  "id": "number (业务ID，用于跳转)",
  "title": "string (课程标题)",
  "category": "文案创作 | 视频剪辑 | AI应用 | 直播运营 | 账号起号 | IP打造 | 社区型账号打造 | 文案改写",
  "author": "string (作者)",
  "view": "number (浏览量)",
  "badge": "string (徽章，如：战区免费、必修、高阶、热门、实战、实用、创新、进阶、基础)",
  "duration": "string (时长，如：12:30)",
  "coverUrl": "string (封面图 URL，网络图片)",
  "mediaType": "link (统一用外链)",
  "mediaUrl": "string (公众号文章链接或视频号链接)",
  "description": "string (课程简介)",
  "status": "published | draft",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**关键字段说明**：

- `category`：课程分类
    - `文案创作`: 文案创作相关课程
    - `视频剪辑`: 视频剪辑相关课程
    - `AI应用`: AI应用相关课程
    - `直播运营`: 直播运营相关课程
    - `账号起号`: 账号起号相关课程
    - `IP打造`: IP打造相关课程
    - `社区型账号打造`: 社区型账号打造相关课程
    - `文案改写`: 文案改写相关课程
- `mediaType`：统一用 `link`，节省云存储成本
- `mediaUrl`：外链地址（公众号/视频号），点击跳转导流私域
- `coverUrl`：封面图URL，使用网络图片（如Unsplash）
- `badge`：徽章标识，用于突出显示重要课程

---

---

## H. 日签素材表 (daily_materials)

```json
{
  "_id": "auto-generated",
  "type": "text | image",
  "category": "morning | noon | night",
  "content": "string (文案内容 或 云存储图片URL)",
  "active": "boolean (是否启用)"
}
```

**关键字段说明**：

- `type`：类型
    - `text`: 文案
    - `image`: 图片
- `category`：时段
    - `morning`: 早安
    - `noon`: 午间
    - `night`: 晚安
- `content`：
    - 当 type=text 时，存储文案内容
    - 当 type=image 时，存储云存储URL
- `active`：是否启用（用于临时禁用某些素材）

---

## 现有集合清单（已创建）

✅ **users** - 用户表

✅ **articles** - 文案表

✅ **courses** - 课程表

✅ **applications** - 入伍申请表

✅ **clients** - 客户表

✅ **reports** - 战报表

✅ **system_config** - 系统配置表

✅ **stores** - 门店表

✅ **contracts** - 租赁合同表

✅ **renewals** - 续租申请表

✅ **materials** - 素材库表

✅ **daily_materials** - 日签素材表

✅ **user_collections** - 用户收藏表

✅ **script_templates** - 直播脚本模板表

---

## I. 租赁合同表 (contracts)

```json
{
  "_id": "auto-generated",
  "contractId": "string (合同编号,如 HY20260124001)",
  "tenantPhone": "string (租客手机号)",
  "tenantName": "string (租客姓名)",
  "brokerName": "string (经纪人姓名)",
  "brokerPhone": "string (经纪人手机号)",
  "propertyAddress": "string (房屋地址)",
  "rent": "number (月租金)",
  "startDate": "string (起租日期 YYYY-MM-DD)",
  "endDate": "string (到期日期 YYYY-MM-DD)",
  "broadbandAccount": "string (宽带账号,可选)",
  "broadbandPassword": "string (宽带密码,可选)",
  "waterAccount": "string (水费户号,可选)",
  "electricAccount": "string (电费户号,可选)",
  "gasAccount": "string (燃气户号,可选)",
  "heatingInfo": "string (暖气缴费信息,可选)",
  "propertyContact": "string (物业联系方式,可选)",
  "createTime": "timestamp",
  "updateTime": "timestamp"
}
```

## J. 续租申请表 (renewals)

```json
{
  "_id": "auto-generated",
  "contractId": "string (关联合同ID)",
  "tenantPhone": "string (租客手机号)",
  "applyTime": "timestamp (申请时间)",
  "status": "pending | approved | rejected",
  "brokerNotified": "boolean (经纪人是否已收到提醒)",
  "processTime": "timestamp (处理时间,可选)"
}
```

## K. 素材库表 (materials)

```json
{
  "_id": "auto-generated",
  "type": "image | video | document",
  "category": "house_tour | community | nearby",
  "fileUrl": "string (云存储URL)",
  "title": "string (素材标题)",
  "uploadBy": "string (上传人 _openid)",
  "createTime": "timestamp"
}
```

## L. 用户收藏表 (user_collections)

```json
{
  "_id": "auto-generated",
  "_openid": "string (用户 OpenID)",
  "articleId": "string (文章ID)",
  "articleTitle": "string (文章标题)",
  "articleCategory": "string (文章分类)",
  "status": "collected | shooting",
  "createdAt": "timestamp (收藏时间)",
  "updatedAt": "timestamp (更新时间)",
  "shootingAt": "timestamp (加入待拍摄时间, 可选)"
}
```

**关键字段说明**：

- `status`：收藏状态
    - `collected`: 已收藏
    - `shooting`: 待拍摄
- `articleId`：关联的文章ID
- `articleTitle`：文章标题（冗余存储，提高查询效率）
- `articleCategory`：文章分类（冗余存储，提高查询效率）
- `shootingAt`：加入待拍摄的时间（用于统计待拍摄时长）

---

## M. 直播脚本模板表 (script_templates)

```json
{
  "_id": "auto-generated",
  "id": "number (业务ID，用于排序)",
  "title": "string (脚本标题)",
  "category": "daily_hot | school_zone | listing_intro | deal_story | avoid_pit",
  "scene": "string (适用场景描述)",
  "tags": ["string (标签数组)"],
  "durationMin": "number (时长分钟)",
  "content": {
    "opening": "string (开场白)",
    "painPoints": ["string (痛点数组)"],
    "valuePoints": ["string (价值点数组)"],
    "interaction": ["string (互动引导数组)"],
    "cta": "string (收尾行动号召)",
    "notes": "string (主播提示, 可选)"
  },
  "status": "draft | published | archived",
  "sort": "number (排序权重，越大越靠前)",
  "version": "string (版本号)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**关键字段说明**：

- `category`：脚本分类
    - `daily_hot`: 每日热点
    - `school_zone`: 学区房专题
    - `listing_intro`: 房源讲解
    - `deal_story`: 成交故事
    - `avoid_pit`: 避坑科普
- `status`：发布状态
    - `draft`: 草稿（仅admin可见）
    - `published`: 已发布（前端可见）
    - `archived`: 已归档（不显示）
- `sort`：排序权重，用于置顶和排序
- `content`：脚本内容结构，按PRD定义

---

## 索引设计

### 推荐索引

#### users 表索引
| 索引名 | 字段 | 类型 | 用途 |
| --- | --- | --- | --- |
| `_openid` | `_openid` | 唯一索引 | 用户身份识别 |
| `role` | `role` | 普通索引 | 权限查询 |
| `storeId` | `storeId` | 普通索引 | 门店管理 |
| `stats_leads` | `stats.totalLeads` | 普通索引 | 龙虎榜排序 |
| `createdAt` | `createdAt` | 普通索引 | 时间范围查询 |

#### articles 表索引
| 索引名 | 字段 | 类型 | 用途 |
| --- | --- | --- | --- |
| `id` | `id` | 唯一索引 | 业务ID查询 |
| `category` | `category` | 普通索引 | 分类筛选 |
| `securityLevel` | `securityLevel` | 普通索引 | 权限控制 |
| `stats_leads` | `stats.leads` | 普通索引 | 热门排序 |
| `createdAt` | `createdAt` | 普通索引 | 时间排序 |

#### courses 表索引
| 索引名 | 字段 | 类型 | 用途 |
| --- | --- | --- | --- |
| `id` | `id` | 唯一索引 | 业务ID查询 |
| `category` | `category` | 普通索引 | 分类筛选 |
| `status` | `status` | 普通索引 | 状态筛选 |
| `view` | `view` | 普通索引 | 热门排序 |
| `createdAt` | `createdAt` | 普通索引 | 时间排序 |

#### contracts 表索引
| 索引名 | 字段 | 类型 | 用途 |
| --- | --- | --- | --- |
| `contractId` | `contractId` | 唯一索引 | 合同编号查询 |
| `tenantPhone` | `tenantPhone` | 普通索引 | 租客查询 |
| `endDate` | `endDate` | 普通索引 | 到期提醒 |

#### applications 表索引
| 索引名 | 字段 | 类型 | 用途 |
| --- | --- | --- | --- |
| `_openid` | `_openid` | 唯一索引 | 用户身份识别 |
| `status` | `status` | 普通索引 | 审核状态查询 |
| `createTime` | `createTime` | 普通索引 | 申请时间排序 |

#### user_collections 表索引
| 索引名 | 字段 | 类型 | 用途 |
| --- | --- | --- | --- |
| `_openid` | `_openid` | 普通索引 | 用户收藏查询 |
| `articleId` | `articleId` | 普通索引 | 文章收藏查询 |
| `status` | `status` | 普通索引 | 收藏状态筛选 |
| `updatedAt` | `updatedAt` | 普通索引 | 时间排序 |
| `composite_openid_status` | `_openid`, `status` | 复合索引 | 用户按状态查询收藏 |

### 索引使用原则
1. **高频查询字段必建索引**
2. **排序字段考虑建索引**
3. **索引不是越多越好**（维护成本）
4. **复合索引注意字段顺序**

---

## 字段命名规则

✅ **允许**：

- 驼峰命名：`totalLeads`, `monthLeads`
- 嵌套对象：`stats.totalLeads`

❌ **禁止**：

- 擅自改名：`leads` → `leadCount`
- 新增未定义字段
- 修改枚举值（如：`visitor` → `游客`）

---

## 数据安全

### 敏感字段保护
- `phone`：手机号加密存储
- `password`：禁止明文存储（如使用密码）
- `personalInfo`：个人敏感信息最小化存储

### 数据验证
- 所有输入数据必须经过验证
- 敏感操作必须记录操作日志
- 定期清理过期数据

---

## 性能优化

### 查询优化
- 使用索引覆盖查询
- 避免全表扫描
- 合理使用分页查询

### 写入优化
- 批量操作减少网络开销
- 合理使用事务
- 避免频繁更新大字段

### 存储优化
- 图片、视频等大文件使用云存储
- 合理使用数据压缩
- 定期归档历史数据
