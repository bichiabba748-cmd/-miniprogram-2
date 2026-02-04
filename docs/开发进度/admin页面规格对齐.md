# Admin页面规格对齐文档

> **创建日期**: 2026-02-03
> **目标**: 对齐Admin页面的逻辑、视觉、结构、内容、实现方式

---

## 📋 一、规格书要求

### 1.1 核心功能

#### 全店日报仪表盘
- **今日总获客**: 主播提报累加
- **今日总带看**: 经纪提报累加
- **全店总人数**: 所有用户总数
- **待办红点**: 待审人+待审文

#### 待办入口（横向三卡片）
- 战绩审核
- 文案审核
- 入伍申请

#### 审核详情展开区
- 战绩审核详情（提报人、类型、数量、状态、提报时间、门店、视频、直播、获客）
- 文案审核详情（标题、分类、文案内容、编辑、上架、丢弃）
- 入伍申请详情（姓名、手机号、身份、痛点、状态、申请时间、学历、经验、技能）

#### 管理工具区（2行布局）
- 文案管理
- 课程管理
- 线索指派
- 门店管理
- 设置
- 敬请期待

#### 战绩公示板
- 主播表（姓名、视频、获客、直播、状态）
- 经纪人表（姓名、获客、带看、回访、状态）

#### 人员管理
- 显示全部成员
- 显示姓名、角色、加入时间
- 拨打电话
- 修改角色
- 显示成员详情

---

### 1.2 视觉规格

**已定稿标准**（不可触碰）：
- **配色**: 背景 `#0a0a0a`，金色 `#D4B083`，白色 `#ffffff`
- **圆角**: 卡片 `16rpx`，按钮 `8rpx`
- **间距**: 通栏边距 `32rpx`，卡片间距 `24rpx`
- **字体**: 标题 DIN Condensed Bold，正文 PingFang SC

---

### 1.3 数据库模型

#### users表
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
- `role`: 决定用户权限矩阵
- `profile.nickname`: 用户真实姓名（显示用）
- `profile.phone`: 用户手机号（需要脱敏）
- `stats.totalLeads` / `monthLeads`: 龙虎榜排序依据
- `application.status`: 入伍审核流状态
- `storeId`: 归属门店（用于组织架构管理）
- `inviterId`: 邀请人（用于渠道追踪）

---

### 1.4 角色定义

**7种角色**：
1. **visitor** - 外部访客
2. **student** - 学员
3. **anchor** - 实战主播
4. **broker** - 经纪人
5. **customer** - C端客户
6. **tenant** - 租客
7. **admin** - 管理员

**角色文本映射**：
- admin → 管理员
- anchor → 实战主播
- broker → 经纪人
- student → 学员
- visitor → 外部访客
- customer → C端客户
- tenant → 租客

---

## 🔴 二、当前实现问题

### 2.1 人员管理模块问题

#### 问题1：显示ID而非姓名
- **现状**: 使用 `user._id` 或 `user._openid` 显示
- **规格要求**: 使用 `user.profile.nickname` 显示真实姓名
- **影响**: 人员列表显示不友好，无法识别用户

#### 问题2：角色显示"未知"
- **现状**: `getRoleText` 函数映射不完整
- **规格要求**: 覆盖所有7种角色
- **影响**: 角色显示不正确

#### 问题3：电话显示异常
- **现状**: 显示完整手机号或"未知"
- **规格要求**: 脱敏显示（138****1234）
- **影响**: 隐私保护不足

#### 问题4：更改角色按钮无响应
- **现状**: `changeRole` 函数事件绑定问题
- **规格要求**: 点击后弹出角色选择列表
- **影响**: 无法修改用户角色

#### 问题5：控制台报错
- **现状**: 数据库查询失败，未处理异常
- **规格要求**: 添加错误处理，避免报错
- **影响**: 控制台错误日志

#### 问题6：详情功能显示"开发中"
- **现状**: `showMemberDetail` 函数仅显示提示
- **规格要求**: 显示用户详细信息
- **影响**: 无法查看用户详情

---

### 2.2 数据加载问题

#### 问题1：使用模拟数据
- **现状**: 使用静态 mockData
- **规格要求**: 调用 `getAdminDashboard` 云函数
- **影响**: 数据不实时更新

#### 问题2：未调用云函数
- **现状**: 直接查询数据库集合
- **规格要求**: 使用云函数聚合数据
- **影响**: 数据统计不准确

---

## 🟢 三、修复方案

### 3.1 修复人员管理模块

#### 修复1：显示真实姓名
```javascript
// 修改前
let memberList = usersRes.data.map(user => ({
  id: user._id,
  name: user.name || user._openid,  // 问题：使用_id或_openid
  role: user.role || 'visitor',
  roleText: this.getRoleText(user.role),
  phone: user.phone || '未知',
  joinTime: user.createdAt ? this.formatTime(user.createdAt) : '未知'
}));

// 修改后
let memberList = usersRes.data.map(user => ({
  id: user._id,
  name: user.profile?.nickname || user.name || '未设置姓名',  // 修复：使用profile.nickname
  role: user.role || 'visitor',
  roleText: this.getRoleText(user.role),
  phone: user.profile?.phone || '未设置',  // 修复：使用profile.phone
  joinTime: user.createdAt ? this.formatTime(user.createdAt) : '未知'
}));
```

#### 修复2：完善角色映射
```javascript
// 修改前
getRoleText(role) {
  const roleMap = {
    admin: '管理员',
    anchor: '实战主播',
    broker: '经纪人',
    student: '学员',
    visitor: '外部访客',
    customer: 'C端客户'
  };
  return roleMap[role] || '未知角色';
}

// 修改后
getRoleText(role) {
  const roleMap = {
    admin: '管理员',
    anchor: '实战主播',
    broker: '经纪人',
    student: '学员',
    visitor: '外部访客',
    customer: 'C端客户',
    tenant: '租客'
  };
  return roleMap[role] || '未知角色';
}
```

#### 修复3：电话号码脱敏
```javascript
// 修改前
phone: user.phone || '未知',

// 修改后
phone: this.maskPhone(user.profile?.phone),

// 新增函数
maskPhone(phone) {
  if (!phone) return '未设置';
  if (phone.length < 7) return phone;
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
}
```

#### 修复4：修复事件绑定
```javascript
// 修改前
<view class="mi-change-btn" bindtap="changeMemberRole" data-id="{{item.id}}" data-name="{{item.name}}" catchtap="changeMemberRole">更改</view>

// 修改后
<view class="mi-change-btn" bindtap="changeRole" data-id="{{item.id}}">更改</view>

// 修改函数
changeRole(e) {
  const id = e.currentTarget.dataset.id;
  
  wx.showActionSheet({
    itemList: ['设为实战主播', '设为外部学员', '设为经纪人', '设为租客', '设为C端客户'],
    success: (res) => {
      const roleMap = ['anchor', 'student', 'broker', 'tenant', 'customer'];
      const newRole = roleMap[res.tapIndex];
      
      if (!newRole) return;
      
      wx.showLoading({ title: '处理中...' });
      
      db.collection('users')
        .doc(id)
        .update({
          data: {
            role: newRole,
            updatedAt: db.serverDate()
          }
        })
        .then(res => {
          wx.hideLoading();
          wx.showToast({ title: '身份已变更', icon: 'success' });
          this.fetchUserList();
        })
        .catch(err => {
          wx.hideLoading();
          console.error('修改角色失败：', err);
          wx.showToast({ title: '操作失败', icon: 'none' });
        });
    }
  });
}
```

#### 修复5：添加错误处理
```javascript
// 修改前
fetchUserList() {
  db.collection('users')
    .get()
    .then(res => {
      const userList = res.data.map(user => ({
        ...user,
        roleText: this.getRoleText(user.role)
      }));
      this.setData({ userList });
    })
    .catch(err => {
      console.error('加载人员管理列表失败：', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
}

// 修改后
fetchUserList() {
  wx.showLoading({ title: '加载中...' });
  
  db.collection('users')
    .get()
    .then(res => {
      wx.hideLoading();
      
      if (!res.data || res.data.length === 0) {
        this.setData({ userList: [] });
        return;
      }
      
      const userList = res.data.map(user => ({
        ...user,
        roleText: this.getRoleText(user.role),
        displayName: user.profile?.nickname || user.name || '未设置姓名',
        maskedPhone: this.maskPhone(user.profile?.phone)
      }));
      
      this.setData({ userList });
    })
    .catch(err => {
      wx.hideLoading();
      console.error('加载人员管理列表失败：', err);
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
    });
}
```

#### 修复6：实现详情功能
```javascript
// 修改前
showMemberDetail(e) {
  const id = e.currentTarget.dataset.id;
  wx.showToast({ title: '详情功能开发中', icon: 'none' });
}

// 修改后
showMemberDetail(e) {
  const id = e.currentTarget.dataset.id;
  const user = this.data.userList.find(u => u._id === id);
  
  if (!user) {
    wx.showToast({ title: '用户不存在', icon: 'none' });
    return;
  }
  
  const detailText = `
姓名：${user.displayName}
角色：${user.roleText}
手机号：${user.maskedPhone}
加入时间：${user.joinTime}
门店：${user.storeId || '未设置'}
邀请人：${user.inviterId || '未设置'}
新秀标识：${user.isNewbie ? '是' : '否'}
勋章：${user.medals?.length || 0}个
  `.trim();
  
  wx.showModal({
    title: '成员详情',
    content: detailText,
    showCancel: false,
    confirmText: '关闭'
  });
}
```

---

### 3.2 修复数据加载

#### 修复1：调用getAdminDashboard云函数
```javascript
// 修改前
fetchDashboard() {
  wx.showLoading({ title: '加载中...' });
  
  Promise.all([
    db.collection('reports').get(),
    db.collection('articles').get(),
    db.collection('applications').get(),
    db.collection('users').get()
  ])
  .then(([reportsRes, articlesRes, applicationsRes, usersRes]) => {
    // 处理数据...
  })
  .catch(err => {
    console.error('加载数据失败：', err);
    wx.hideLoading();
    wx.showToast({ title: '加载失败', icon: 'none' });
  });
}

// 修改后
fetchDashboard() {
  wx.showLoading({ title: '加载中...' });
  
  wx.cloud.callFunction({
    name: 'getAdminDashboard',
    data: {}
  })
  .then(res => {
    wx.hideLoading();
    
    if (res.result.code !== 0) {
      wx.showToast({ title: res.result.message || '加载失败', icon: 'none' });
      return;
    }
    
    const data = res.result.data;
    
    this.setData({
      stats: data.stats || { leads: 0, showings: 0, totalUsers: 0 },
      pendingReports: data.pending?.audit || 0,
      pendingArticles: data.pending?.articles || 0,
      pendingUsers: data.pending?.users || 0,
      auditList: data.auditList || [],
      scriptList: data.scriptList || [],
      pendingUserList: data.pendingUserList || [],
      memberList: data.memberList || []
    });
  })
  .catch(err => {
    wx.hideLoading();
    console.error('加载数据失败：', err);
    wx.showToast({ title: '加载失败，请重试', icon: 'none' });
  });
}
```

---

## ✅ 四、验收标准

### 4.1 人员管理模块
- [ ] 人员列表显示真实姓名（profile.nickname）
- [ ] 角色显示正确（覆盖所有7种角色）
- [ ] 电话号码已脱敏（138****1234）
- [ ] 角色更改按钮点击有效
- [ ] 控制台无错误日志
- [ ] 详情功能正常显示用户信息

### 4.2 数据加载
- [ ] 调用getAdminDashboard云函数
- [ ] 数据实时更新
- [ ] 统计数据准确
- [ ] 加载失败有友好提示

### 4.3 视觉效果
- [ ] 符合黑金配色（#0a0a0a + #D4B083）
- [ ] 圆角符合规格（卡片16rpx，按钮8rpx）
- [ ] 间距符合规格（通栏32rpx，卡片24rpx）
- [ ] 字体符合规格（DIN Condensed Bold + PingFang SC）

---

## 📝 五、执行步骤

1. 读取admin.js文件
2. 分析问题代码
3. 修改用户数据映射逻辑
4. 完善getRoleText函数
5. 实现电话号码脱敏
6. 修复事件绑定
7. 添加错误处理
8. 实现详情功能
9. 修改数据加载逻辑
10. 自测修改效果
11. 提供操作指导

---

**文档结束**
