# 🤝 接口契约 (Contracts)

# 云函数接口契约

> **契约优先原则**：任何云函数开发前，必须先在此定义 Request/Response 规范

---

## 契约模板

```jsx
/**
 * 云函数名称：functionName
 * 功能描述：xxx
 * 调用方：xxx 页面
 */

// Request (入参)
{
  "param1": "type (说明)",
  "param2": "type (说明)"
}

// Response (出参)
{
  "code": 0,           // 0=成功, 非0=错误码
  "message": "string", // 错误信息
  "data": {
    // 业务数据
  }
}

// Error Codes
// 1001: 参数错误
// 1002: 权限不足
// 1003: 数据不存在
```

---

## 已定义契约

### 1. getArticles (获取文案列表)

**调用方**：pages/art

```jsx
// Request
{
  "category": "口播 | 探盘 | 避坑 | IP | all (可选)",
  "securityLevel": "绝密 | 内部 | 公开 (根据用户 role 自动过滤)",
  "page": 1,
  "pageSize": 20
}

// Response
{
  "code": 0,
  "data": {
    "list": [ /* articles 数组 */ ],
    "total": 100,
    "hasMore": true
  }
}

// Logic
// 1. 根据用户角色过滤安全级别
// 2. 分类筛选
// 3. 分页查询
// 4. 计算总数和是否有更多数据
```

---

### 2. getLeaderboard (获取龙虎榜)

**调用方**：pages/index

```jsx
// Request
{
  "type": "month | total",
  "topN": 10
}

// Response
{
  "code": 0,
  "data": {
    "list": [
      {
        "_openid": "string",
        "nickname": "string",
        "avatar": "string",
        "leads": "number",
        "rank": "number (排名)"
      }
    ],
    "myRank": {
      "rank": 15,
      "leads": 8
    }
  }
}

// Logic
// 1. 按时间范围筛选（月度或总榜）
// 2. 聚合查询统计用户获客数
// 3. 排序获取前N名
// 4. 获取用户信息（昵称、头像）
// 5. 计算当前用户排名
```

---

### 3. adminReviewApplication (审核入伍申请)

**调用方**：pages/admin (仅 admin 角色)

```jsx
// Request
{
  "applicationId": "string (_openid)",
  "action": "approve | reject",
  "reason": "string (拒绝原因, 可选)"
}

// Response
{
  "code": 0,
  "message": "审核完成"
}

// Permission Check
// 必须检查 role === 'admin'

// Logic
// 1. 检查操作类型
// 2. 管理员权限验证
// 3. 查询申请记录
// 4. 更新申请状态
// 5. 如果审核通过，更新用户角色为student
```

---

### 4. submit_application (提交入伍申请)

**调用方**：pages/join

```jsx
// Request
{
  "name": "string (真实姓名)",
  "cloudID": "string (微信手机号加密数据)",
  "identity": "string (枚举值: agent_with_exp | agent_no_exp | store_owner)",
  "painPoints": ["string (痛点枚举数组: traffic | content | skill | convert)"]
}

// Response
{
  "code": 0,
  "message": "string",
  "data": {
    "applicationId": "string (_openid)"
  }
}

// Error Codes
// 0: 成功
// -1: 已存在（重复申请）
// 1001: 参数错误（name为空/identity非法/painPoints为空）
// 1002: 手机号解密失败
// 500: 服务器错误

// Core Logic
// 1. 解密手机号：cloud.openapi.phonenumber.getPhoneNumber({ cloudID })
// 2. 查重：根据 _openid 查询 applications 表
// 3. 参数验证：name/identity/painPoints 完整性校验
// 4. 入库：status 默认 'pending'，createTime 使用 db.serverDate()
```

---

### 5. getProfileData (获取个人中心数据)

**调用方**：pages/profile

```jsx
// Request
{
  "role": "string (可选，用于测试角色切换时传入当前角色)"
}
// 注：如传入role参数，优先使用传入的角色；否则使用数据库中存储的角色

// Response
{
  "code": 0,
  "data": {
    "role": "string (visitor | student | anchor | broker | admin)",
    "dashboard": [
      {
        "label": "string (指标名称)",
        "value": "string | number (指标值)"
      }
    ],
    "rankInfo": {
      "rank": "number (全量排名, 可选)",
      "totalLeads": "number (累计获客)"
    },
    "medals": [
      {
        "id": "string",
        "name": "string (勋章名称)",
        "icon": "string (勋章图标 emoji)",
        "locked": "boolean (是否锁定)",
        "progress": "number (进度百分比 0-100)",
        "condition": "string (解锁条件说明)"
      }
    ]
  }
}

// Logic by Role
// - Visitor: dashboard 返回空，前端点击触发跳转 join
// - Student: dashboard 返回 [{label:'学习进度', value:'45%'}, {label:'收藏文案', value:12}]
// - Anchor/Broker: dashboard 返回 [{label:'全量排名', value:15}, {label:'贡献', value:8}, {label:'累计获客', value:158}]
// - Admin: dashboard 返回 [{label:'今日总线索', value:158}, {label:'今日总带看', value:45}, {label:'待审人员', value:3}]

// 勋章分类规则 (v2.2.5+)
// - 通用勋章(所有角色): 初出茅庐(first_login)
// - 学习勋章(学员+主播+经纪人): 军火专家(content_master)、学霸达人(course_complete)
// - 获客勋章(主播专属): 获客达人(lead_hunter)、百人斩(lead_master)、获客王者(lead_king)
// - 转化勋章(经纪人专属): 首单达人(first_deal)、成交达人(deal_master)、销售冠军(top_seller)

// ⚠️ 重要提示：角色判断逻辑必须完整
// - 必须包含所有角色：visitor、student、anchor、broker、admin、customer、tenant
// - 学员角色必须包含在学习勋章的条件中
// - 测试时必须覆盖所有角色，确保每个角色都能获得对应的勋章
```

---

### 6. getAdminDashboard (获取管理员大盘数据)

**调用方**：pages/admin (仅 admin 角色)

```jsx
// Request
{} // 无需入参，自动取 OpenID 并校验 admin 权限

// Response
{
  "code": 0,
  "data": {
    "stats": {
      "todayLeads": "number (今日总获客)",
      "todayShowings": "number (今日总带看)",
      "totalMembers": "number (全店总人数)"
    },
    "pending": {
      "applications": "number (待审核入伍申请)",
      "articles": "number (待审核文案)"
    },
    "systemStatus": {
      "auditFree": "boolean (免审模式)",
      "maintenance": "boolean (维护模式)",
      "silent": "boolean (禁言模式)"
    },
    "recentActivities": [
      {
        "type": "string (application | lead | warning)",
        "content": "string (动态内容)",
        "time": "timestamp"
      }
    ]
  }
}

// Permission Check
// 必须检查 role === 'admin'

// Logic
// 1. 管理员权限验证
// 2. 获取今日统计数据
// 3. 获取待审核数据
// 4. 获取系统状态
// 5. 获取最近活动记录
```

---

### 7. getContractInfo (获取合同信息)

**调用方**：pages/tenant/tenant (租客首页)

```jsx
// Request
{
  "tenant_openid": "string (租客OpenID, 可选)"
}

// Response (成功)
{
  "code": 0,
  "data": {
    "contractId": "string",
    "tenantName": "string",
    "propertyAddress": "string",
    "rent": "number",
    "startDate": "string",
    "endDate": "string",
    "brokerName": "string",
    "brokerPhone": "string",
    "broadbandAccount": "string",
    "waterAccount": "string",
    "electricAccount": "string",
    "gasAccount": "string",
    "heatingInfo": "string",
    "propertyContact": "string",
    "daysLeft": "number",
    "daysLived": "number",
    "totalRent": "number",
    "landlordPhoneMasked": "string"
  }
}

// Response (默认顾问信息)
{
  "code": 0,
  "data": {
    "brokerName": "string",
    "brokerPhone": "string",
    "brokerAvatar": "string"
  }
}

// Core Logic
// 1. 通过tenant_openid或云函数上下文的OPENID查询合同
// 2. 如果没有找到，返回默认数据或测试数据
// 3. 计算相关数据：剩余天数、已住天数、总租金
// 4. 脱敏业主电话
```

---

### 8. submitRenewal (提交续租申请)

**调用方**：pages/tenant/contract (合同详情页)

```jsx
// Request
{
  "contractId": "string (合同ID)"
}

// Response
{
  "code": 0,
  "message": "续租申请已提交,经纪人将尽快联系您"
}

// Logic
// 1. 检查合同是否存在
// 2. 创建续租申请记录
// 3. 发送通知给经纪人
```

---

### 9. submitConsult (提交在线咨询)

**调用方**：pages/tenant/consult (在线咨询页)

```jsx
// Request
{
  "tenantPhone": "string (租客手机号)",
  "question": "string (咨询问题)"
}

// Response
{
  "code": 0,
  "message": "咨询已提交,经纪人将在24小时内回复"
}

// Security Check
// 1. question 必须经过 msgSecCheck
```

---

### 10. getBrokerContracts (获取经纪人合同列表)

**调用方**：pages/broker/contracts (合同管理页)

```jsx
// Request
{
  "page": 1,
  "pageSize": 20,
  "status": "active | expired | terminated (可选)"
}

// Response
{
  "code": 0,
  "data": {
    "list": [
      {
        "_id": "string",
        "contractId": "string",
        "tenantName": "string",
        "tenantPhone": "string",
        "propertyAddress": "string",
        "rent": "number",
        "startDate": "string",
        "endDate": "string",
        "brokerName": "string",
        "brokerPhone": "string",
        "createTime": "timestamp",
        "status": "string"
      }
    ],
    "total": "number",
    "page": "number",
    "pageSize": "number",
    "hasMore": "boolean"
  }
}
```

---

### 11. submitContract (报单录入)

**调用方**：pages/broker/submit (报单录入页)

```jsx
// Request
{
  "tenantName": "string (租客姓名)",
  "tenantPhone": "string (租客手机号)",
  "propertyAddress": "string (房屋地址)",
  "rent": "number (月租金)",
  "startDate": "string (起租日期)",
  "endDate": "string (到期日期)",
  "brokerName": "string (经纪人姓名)",
  "brokerPhone": "string (经纪人手机号)",
  "broadbandAccount": "string (宽带账号, 可选)",
  "broadbandPassword": "string (宽带密码, 可选)",
  "waterAccount": "string (水费户号, 可选)",
  "electricAccount": "string (电费户号, 可选)",
  "gasAccount": "string (燃气户号, 可选)",
  "heatingInfo": "string (暖气缴费信息, 可选)",
  "propertyContact": "string (物业联系方式, 可选)"
}

// Response
{
  "code": 0,
  "message": "报单录入成功",
  "data": {
    "contractId": "string",
    "_id": "string"
  }
}
```

---

### 12. uploadMaterial (素材上传)

**调用方**：pages/broker/materials (素材库页)

```jsx
// Request
{
  "fileID": "string (文件ID)",
  "type": "image | video | document",
  "category": "house_tour | community | nearby",
  "title": "string (素材标题)"
}

// Response
{
  "code": 0,
  "message": "素材上传成功",
  "data": {
    "materialId": "string",
    "fileUrl": "string",
    "title": "string"
  }
}
```

---

### 13. getClients (获取客户列表)

**调用方**：pages/crm/client (客户管理页)

```jsx
// Request
{
  "page": 1,
  "pageSize": 20,
  "status": "follow | deal | all (可选)",
  "searchText": "string (可选)"
}

// Response
{
  "code": 0,
  "data": {
    "list": [
      {
        "_id": "string",
        "name": "string (客户姓名)",
        "phone": "string (手机号)",
        "level": "number (客户等级)",
        "status": "string (状态: follow/deal)",
        "source": "string (来源: 直播间/短视频/熟人介绍)",
        "date": "string (日期)",
        "anchorName": "string (主播姓名)",
        "daysLeft": "number (剩余天数)",
        "brokerName": "string (经纪人姓名)",
        "rotationCount": "number (轮转次数)"
      }
    ],
    "total": "number",
    "page": "number",
    "pageSize": "number",
    "hasMore": "boolean"
  }
}

// Logic
// 1. 从clients集合查询客户列表
// 2. 支持按状态筛选（follow/deal/all）
// 3. 支持按姓名或手机号搜索
// 4. 分页查询
// 5. 按创建时间倒序排列
```

---

### 14. getMaterials (素材查询)

**调用方**：pages/broker/materials (素材库页)

```jsx
// Request
{
  "type": "image | video | document (可选)",
  "category": "house_tour | community | nearby (可选)",
  "page": 1,
  "pageSize": 20
}

// Response
{
  "code": 0,
  "data": {
    "list": [
      {
        "_id": "string",
        "type": "string",
        "category": "string",
        "fileUrl": "string",
        "title": "string",
        "uploadBy": "string",
        "createTime": "timestamp"
      }
    ],
    "total": "number",
    "page": "number",
    "pageSize": "number",
    "hasMore": "boolean"
  }
}
```

---

### 14. login (登录与手机号验证)

**调用方**：app.js (登录时)

```jsx
// Request
{
  "cloudID": "string (微信手机号加密数据, 可选)",
  "phone": "string (测试模式下直接传入手机号, 可选)",
  "referrerId": "string (推荐人ID, 可选)",
  "referrerRole": "string (推荐人角色, 可选)",
  "referrerName": "string (推荐人姓名, 可选)"
}

// Response (成功 - 租客)
{
  "code": 0,
  "openid": "string",
  "role": "tenant",
  "contractId": "string",
  "phoneNumber": "string"
}

// Response (成功 - 客户)
{
  "code": 0,
  "openid": "string",
  "clientId": "string",
  "phoneNumber": "string"
}

// Response (成功 - 简化模式)
{
  "code": 0,
  "openid": "string",
  "role": "tenant"
}

// Response (失败)
{
  "code": 5000,
  "message": "处理手机号授权失败",
  "error": "string"
}

// Core Logic
// 1. 测试模式：直接使用传入的手机号
// 2. 正常模式：通过cloudID获取手机号信息
// 3. 简化模式：只返回openid，不获取手机号
// 4. 查询contracts集合，判断是否为租客
// 5. 如果匹配到合同，返回tenant角色
// 6. 否则按原有逻辑处理客户信息
```

---

### 15. add_test_contract (添加测试合同数据)

**调用方**：pages/test (测试页面)

```jsx
// Request
{}

// Response
{
  "code": 0,
  "added": true,
  "skipped": false,
  "message": "测试合同数据添加成功",
  "contractId": "string"
}

// Response (已存在)
{
  "code": 0,
  "added": false,
  "skipped": true,
  "message": "已有相同手机号的合同记录"
}

// Error Codes
// 5000: 服务器错误

// Core Logic
// 1. 检查 contracts 集合是否存在，不存在则创建
// 2. 检查是否已有相同 tenantPhone 的记录
// 3. 插入测试合同数据
```

---

### 16. init_daily_materials (初始化日签素材)

**调用方**：pages/admin (仅 admin 角色)

```jsx
// Request
{}

// Response
{
  "code": 0,
  "message": "初始化成功",
  "data": {
    "count": 60,
    "success": 60,
    "failed": 0,
    "successRate": "100.00%"
  }
}

// Permission Check
// 必须检查 role === 'admin'

// Core Logic
// 1. 确保 daily_materials 集合存在
// 2. 清空现有数据
// 3. 批量写入日签素材（文案和图片）
// 4. 返回初始化统计信息
```

---

### 17. init_courses (初始化课程数据)

**调用方**：pages/admin (仅 admin 角色)

```jsx
// Request
{}

// Response (成功)
{
  "code": 0,
  "message": "课程初始化成功",
  "data": {
    "count": 24,
    "success": 24,
    "failed": 0,
    "successRate": "100.00%"
  }
}

// Response (已存在)
{
  "code": 0,
  "message": "课程数据已存在，无需重复初始化",
  "data": {
    "count": 24,
    "skipped": true
  }
}

// Error Codes
// 500: 服务器错误

// Permission Check
// 必须检查 role === 'admin'

// Core Logic
// 1. 确保 courses 集合存在
// 2. 清空现有数据
// 3. 批量写入24门课程数据（包含网络封面图片）
// 4. 返回初始化统计信息
```

---

### 18. init_rental_collections (初始化租赁集合)

**调用方**：pages/test (测试页面)

```jsx
// Request
{}

// Response
{
  "code": 0,
  "message": "租赁集合初始化成功",
  "data": {
    "contracts": "created",
    "renewals": "created",
    "materials": "created"
  }
}

// Core Logic
// 1. 创建 contracts 集合
// 2. 创建 renewals 集合
// 3. 创建 materials 集合
// 4. 返回创建结果
```

---

### 19. update_users_schema (更新用户表结构)

**调用方**：pages/test (测试页面)

```jsx
// Request
{}

// Response
{
  "code": 0,
  "message": "用户表结构更新成功",
  "data": {
    "updated": 0
  }
}

// Core Logic
// 1. 查询 users 表
// 2. 更新用户表结构（如有需要）
// 3. 返回更新结果
```

---

### 20. adminTools (管理员工具集)

**调用方**：pages/admin (仅 admin 角色)

```jsx
// Request
{
  "action": "string (操作类型)",
  "params": {} // 参数对象
}

// Response
{
  "code": 0,
  "message": "操作成功",
  "data": {}
}

// 支持的操作类型
// - getHealth: 健康检查
// - getProgress: 获取进度
// - 其他管理操作

// Permission Check
// 必须检查 role === 'admin'
```

---

### 21. get_courses (获取课程列表)

**调用方**：pages/course

```jsx
// Request
{
  "category": "string (可选，课程分类)"
}

// Response (成功)
{
  "code": 0,
  "message": "获取成功",
  "data": [
    {
      "_id": "auto-generated",
      "id": "number (业务ID)",
      "title": "string (课程标题)",
      "category": "string (课程分类)",
      "author": "string (作者)",
      "view": "number (浏览量)",
      "badge": "string (徽章)",
      "duration": "string (时长)",
      "coverUrl": "string (封面图 URL)",
      "mediaType": "string (媒体类型)",
      "mediaUrl": "string (媒体链接)",
      "description": "string (课程简介)",
      "status": "string (状态)",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}

// Error Codes
// 500: 服务器错误

// Core Logic
// 1. 查询 courses 集合
// 2. 过滤 status 为 published 的课程
// 3. 如果指定 category，则按分类筛选
// 4. 按 id 升序排序
// 5. 返回课程列表
```

---

### 22. get_course_detail (获取课程详情)

**调用方**：pages/course-detail

```jsx
// Request
{
  "id": "string (课程ID)"
}

// Response (成功)
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "_id": "auto-generated",
    "id": "number (业务ID)",
    "title": "string (课程标题)",
    "category": "string (课程分类)",
    "author": "string (作者)",
    "view": "number (浏览量)",
    "badge": "string (徽章)",
    "duration": "string (时长)",
    "coverUrl": "string (封面图 URL)",
    "mediaType": "string (媒体类型)",
    "mediaUrl": "string (媒体链接)",
    "description": "string (课程简介)",
    "status": "string (状态)",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}

// Response (课程不存在)
{
  "code": 404,
  "message": "课程不存在"
}

// Error Codes
// 400: 缺少课程ID
// 404: 课程不存在
// 500: 服务器错误

// Core Logic
// 1. 验证课程ID参数
// 2. 查询 courses 集合
// 3. 按 id 和 status 为 published 查询
// 4. 返回课程详情
```

---

### 23. getUserCollections (获取用户收藏列表)

**调用方**：pages/collections

```jsx
// Request
{
  "status": "string (可选，collected | shooting)"
}

// Response (成功)
{
  "code": 2000,
  "message": "获取收藏列表成功",
  "data": {
    "collections": [
      {
        "_id": "string",
        "articleId": "string",
        "articleTitle": "string",
        "articleCategory": "string",
        "status": "string (collected | shooting)",
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "article": {
          "_id": "string",
          "title": "string",
          "category": "string",
          "content": "string"
        }
      }
    ]
  }
}

// Response (空列表)
{
  "code": 2000,
  "message": "获取收藏列表成功",
  "data": {
    "collections": []
  }
}

// Error Codes
// 5000: 服务器错误

// Core Logic
// 1. 获取用户OpenID
// 2. 查询 user_collections 集合
// 3. 如果指定 status，按状态筛选
// 4. 按更新时间倒序排序
// 5. 为每个收藏记录获取对应的文章详情
// 6. 返回收藏列表
```

---

### 24. toggleCollection (切换收藏状态)

**调用方**：pages/art/detail

```jsx
// Request
{
  "articleId": "string (文章ID)",
  "collect": "boolean (true=收藏, false=取消收藏)"
}

// Response (收藏成功)
{
  "code": 2000,
  "message": "收藏成功",
  "data": {
    "collected": true
  }
}

// Response (取消收藏成功)
{
  "code": 2000,
  "message": "取消收藏成功",
  "data": {
    "collected": false
  }
}

// Error Codes
// 4000: 缺少文章ID
// 4040: 文章不存在
// 5000: 服务器错误

// Core Logic
// 1. 检查文章是否存在
// 2. 如果 collect 为 true：
//    - 检查是否已经收藏
//    - 如果已收藏，更新状态为 collected
//    - 如果未收藏，新增收藏记录
// 3. 如果 collect 为 false：
//    - 删除收藏记录
// 4. 返回操作结果
```

---

### 25. addToShooting (添加到待拍摄)

**调用方**：pages/collections

```jsx
// Request
{
  "collectionId": "string (收藏ID)"
}

// Response (成功)
{
  "code": 2000,
  "message": "已加入待拍摄",
  "data": {
    "success": true
  }
}

// Error Codes
// 4000: 缺少收藏ID
// 4040: 收藏记录不存在
// 4030: 无权限操作此收藏
// 5000: 服务器错误

// Core Logic
// 1. 检查收藏记录是否存在且属于当前用户
// 2. 更新状态为 shooting
// 3. 记录加入待拍摄的时间
// 4. 返回操作结果
```

---

### 26. initUserCollections (初始化用户收藏)

**调用方**：pages/test (测试页面)

```jsx
// Request
{}

// Response (成功)
{
  "code": 0,
  "message": "用户收藏初始化成功",
  "data": {
    "initialized": true
  }
}

// Core Logic
// 1. 确保 user_collections 集合存在
// 2. 初始化用户收藏数据结构
// 3. 返回初始化结果
```

---

### 27. msgSecCheck (内容安全检查)

**调用方**：多个页面

```jsx
// Request
{
  "content": "string (需要检查的内容)"
}

// Response (通过)
{
  "code": 0,
  "message": "内容安全检查通过",
  "data": {
    "pass": true
  }
}

// Response (不通过)
{
  "code": 87014,
  "message": "内容包含违规信息",
  "data": {
    "pass": false
  }
}

// Error Codes
// 5000: 服务器错误

// Core Logic
// 1. 调用微信内容安全API
// 2. 检查内容是否违规
// 3. 返回检查结果
```

---

### 28. init_db (初始化数据库)

**调用方**：pages/test (测试页面)

```jsx
// Request
{}

// Response (成功)
{
  "code": 0,
  "message": "数据库初始化成功",
  "data": {
    "initialized": true
  }
}

// Core Logic
// 1. 初始化所有必要的数据库集合
// 2. 创建必要的索引
// 3. 返回初始化结果
```

---

### 29. quickstartFunctions (快速启动函数)

**调用方**：pages/test (测试页面)

```jsx
// Request
{
  "action": "string (操作类型)"
}

// Response
{
  "code": 0,
  "message": "操作成功",
  "data": {}
}

// Core Logic
// 1. 执行快速启动相关的操作
// 2. 返回操作结果
```

---

### 30. performanceTest (性能测试)

**调用方**：pages/test (测试页面)

```jsx
// Request
{}

// Response
{
  "code": 0,
  "message": "性能测试完成",
  "data": {
    "performance": "object (性能数据)"
  }
}

// Core Logic
// 1. 执行性能测试
// 2. 收集性能数据
// 3. 返回测试结果
```

---

### 31. getScriptTemplates (获取脚本模板列表)

**调用方**：pages/tools/script (直播脚本库)

```jsx
// Request
{
  "category": "daily_hot | school_zone | listing_intro | deal_story | avoid_pit (可选)",
  "status": "published | draft | archived (可选，默认published)",
  "keyword": "string (可选，搜索标题)",
  "page": 1,
  "pageSize": 20
}

// Response
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "_id": "string",
        "id": "number (业务ID)",
        "title": "string (脚本标题)",
        "category": "string (分类)",
        "scene": "string (适用场景)",
        "tags": ["string"],
        "durationMin": "number (时长分钟)",
        "content": {
          "opening": "string (开场白)",
          "painPoints": ["string"],
          "valuePoints": ["string"],
          "interaction": ["string"],
          "cta": "string (收尾行动号召)",
          "notes": "string (主播提示)"
        },
        "status": "string (状态)",
        "sort": "number (排序权重)",
        "version": "string (版本号)",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}

// Core Logic
// 1. 构建查询条件（分类、状态、关键词）
// 2. 默认只返回published状态的脚本
// 3. 按sort降序、createdAt降序排序
// 4. 分页查询并返回结果
```

---

### 32. init_script_templates (初始化脚本模板数据)

**调用方**：pages/admin/script-manage (脚本管理页)

```jsx
// Request
{}

// Response
{
  "code": 0,
  "message": "脚本模板初始化成功",
  "data": {
    "count": 10,
    "success": 10,
    "failed": 0,
    "successRate": "100.00%",
    "skipped": false
  }
}

// Error Codes
// 403: 权限不足，仅管理员可执行
// 500: 服务器错误

// Core Logic
// 1. 验证调用者是否为admin角色
// 2. 检查script_templates集合是否已有数据
// 3. 如果已有数据，返回skipped=true，不重复初始化
// 4. 如果无数据，批量插入10条示例脚本（覆盖5个分类）
// 5. 返回插入结果统计
```

---

## 接口规范说明

### 错误码规范

| 错误码 | 说明 |
| --- | --- |
| 0 | 成功 |
| 2000 | 业务成功 |
| 4000 | 参数错误 |
| 4030 | 权限不足 |
| 4040 | 数据不存在 |
| 5000 | 服务器错误 |
| 87014 | 内容安全检查不通过 |

### 数据格式规范

- 所有时间戳使用 ISO 8601 格式
- 金额使用数字类型，单位：分
- 手机号使用字符串类型，11位数字
- URL 使用完整路径（包含协议）

### 安全规范

- 所有用户输入必须进行参数验证
- 敏感信息必须加密存储
- 管理员操作必须记录操作日志
- 内容必须经过内容安全检查

### 性能优化

- 使用分页查询避免大数据量返回
- 合理使用索引提高查询效率
- 批量操作减少网络开销
- 缓存常用数据减少数据库查询

### 文档维护

- 新增云函数必须先定义接口契约
- 修改接口必须更新文档
- 定期检查文档与代码一致性
- 保持文档的完整性和准确性

---

## 格式一致性

- **命名规范**：云函数名称使用小写字母和下划线
- **参数命名**：使用驼峰命名法
- **响应格式**：统一使用 code, message, data 结构
- **错误处理**：统一使用错误码和错误信息
- **格式一致性**：保持 Request/Response 格式的一致性
