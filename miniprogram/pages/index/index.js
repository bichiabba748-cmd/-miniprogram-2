const app = getApp();
const { RoleManager } = require('../../utils/roleManager.js');
const cloud = require('../../utils/cloud.js');
// 初始化云数据库
const db = wx.cloud.database();
const _ = db.command;

// 1. B端：主播工具
const ANCHOR_TOOLS = [
  { name: '星火日签', icon: '📅', action: 'openMarketing' },
  { name: '直播脚本', icon: '📜', action: 'openScript' },
  { name: '购房资料', icon: '📂', action: 'openResource' },
  { name: '待拍文案', icon: '📝', action: 'openPendingArt' },
  { name: '学区查询', icon: '🏫', action: 'openSchool' },
  { name: '账号诊断', icon: '🩺', action: 'checkAccount' },
  { name: '线索管理', icon: '🔍', action: 'crm_client' },
  { name: '邀请入队', icon: '🤝', action: 'inviteMember' }
];

// 2. B端：经纪人工具（二手房经纪人）
const BROKER_TRADING_TOOLS = [
  { name: '星火日签', icon: '📅', action: 'openMarketing' },
  { name: '房贷计算', icon: '🧮', action: 'openCalc' },
  { name: '购房资料', icon: '📂', action: 'openResource' },
  { name: '税费计算', icon: '📝', action: 'openTax' },
  { name: '学区查询', icon: '🏫', action: 'openSchool' },
  { name: '客源管理', icon: '👥', action: 'crm_client' },
  { name: '直播排期', icon: '🗓️', action: 'openSchedule' },
  { name: '邀请入队', icon: '🤝', action: 'inviteMember' }
];

// 2.1 B端：经纪人工具（新房经纪人）
const BROKER_NEW_HOUSE_TOOLS = [
  { name: '星火日签', icon: '📅', action: 'openMarketing' },
  { name: '房贷计算', icon: '🧮', action: 'openCalc' },
  { name: '购房资料', icon: '📂', action: 'openResource' },
  { name: '税费计算', icon: '📝', action: 'openTax' },
  { name: '学区查询', icon: '🏫', action: 'openSchool' },
  { name: '客源管理', icon: '👥', action: 'crm_client' },
  { name: '直播排期', icon: '🗓️', action: 'openSchedule' },
  { name: '邀请入队', icon: '🤝', action: 'inviteMember' }
];

// 2.2 B端：经纪人工具（租赁经纪人）
const BROKER_RENTAL_TOOLS = [
  { name: '合同管理', icon: '📄', action: 'rental_contracts' },
  { name: '提交录入', icon: '📝', action: 'rental_submit' },
  { name: '客户核验', icon: '✅', action: 'rental_verify' },
  { name: '资料库', icon: '📚', action: 'rental_materials' },
  { name: '排行榜', icon: '🏆', action: 'rental_leaderboard' },
  { name: '租后服务', icon: '🛠️', action: 'rental_service' },
  { name: '邀请入队', icon: '🤝', action: 'inviteMember' }
];

// 3. B端：学员/访客工具
const STUDENT_TOOLS = [
  { name: '爆款文案', icon: '📜', action: 'goToArt' },
  { name: '实战课程', icon: '🎥', action: 'goToCourse' },
  { name: '龙虎榜单', icon: '🏆', action: 'goToRank' },
  { name: '个人中心', icon: '🦁', action: 'goToAgent' }
];

Page({
  data: {
    // 角色状态
    userRole: 'visitor',
    isVisitor: true,
    isStudent: false,
    isBroker: false,
    isAnchor: false,
    isCustomer: false,
    isTenant: false,
    
    // 预览模式
    isPreviewMode: false,

    // C端逻辑字段
    referrerId: '',
    referrerRole: '',
    referrerName: '',
    isUnlocked: false,
    showAuthModal: false,

    showSubmitModal: false,
    storeName: '星火计划 · 天津战区',
    rankTitle: '今日大区量能榜',
    
    leads: 0, videoCount: 0, liveCount: 0,
    showings: 0, callbacks: 0,
    rentalContracts: 0, // 今日签约普租单量
    houseCollection: 0, // 今日收房
    houseRental: 0, // 今日出房
    rentalShowings: 0, // 今日带看量

    reports: [], // 从云数据库读取

    bSideTools: [], 

    // C端资料宫格
    customerGrid: [
      { name: '区域解读', icon: '🗺️', type: 'free' },
      { name: '新房优惠', icon: '🧧', type: 'lock' },
      { name: '楼盘分析', icon: '🏙️', type: 'free' },
      { name: '降价房源', icon: '📉', type: 'lock' },
      { name: '房价动态', icon: '📊', type: 'free' },
      { name: '落户大全', icon: '📋', type: 'free' },
      { name: '避坑指南', icon: '🛡️', type: 'free' },
      { name: '采光分析', icon: '☀️', type: 'lock' },
      { name: '学区找房', icon: '🎓', type: 'lock' },
      { name: '贷款计算', icon: '🧮', type: 'free' },
      { name: '全景航拍', icon: '🚁', type: 'free' },
      { name: '卖房技巧', icon: '💰', type: 'free' }
    ],

    recommendList: [
      { id: 1, title: '2026年天津和平区最新入学政策解读', views: 3420, tag: '政策' },
      { id: 2, title: '刚需必看！首付50万能买哪里的次新房？', views: 2105, tag: '选房' },
      { id: 3, title: '揭秘：二手房交易中隐藏的税费坑', views: 5602, tag: '避坑' },
      { id: 4, title: '海河沿线优质改善盘大盘点', views: 1890, tag: '楼盘' }
    ]
  },

  onLoad(options) {
    if (options.referrerId) {
      console.log('检测到分享参数:', options);
      // 强制标记为客户
      wx.setStorageSync('user_role', 'customer');
      
      this.setData({
        userRole: 'customer',
        isCustomer: true,
        referrerId: options.referrerId,
        referrerRole: options.referrerRole,
        referrerName: options.referrerName || '专属顾问'
      });
      // 🚩 关键：客户一进来，立刻隐藏底部导航栏！
      wx.hideTabBar();
    } else {
      // 非客户角色，确保更新工具列表
      this.updateIdentity();
    }
  },

  onShow() {
    // 如果当前角色是租户，重定向到租户首页
    const currentRole = RoleManager.getCurrentRole();
    if (currentRole === 'tenant') {
      wx.redirectTo({
        url: '/pages/tenant/tenant',
        fail: (err) => {
          console.error('重定向到租户首页失败:', err);
        }
      });
      return; // 阻止后续代码执行
    }
    
    this.updateIdentity();
    this.getReports(); // 页面显示时获取战报数据
  },

  onPullDownRefresh() {
    this.updateIdentity();
    this.getReports(); // 下拉刷新时重新获取战报
    setTimeout(() => { wx.stopPullDownRefresh(); }, 500);
  },

  // 从云数据库获取战报数据
  getReports() {
    // 设置默认数据，确保页面能正常显示
    const defaultReports = [
      "恭喜王金牌刚刚成交一套河西学区房",
      "大区军火库新增《2026购房避坑指南》",
      "昨日全员获客突破 2000 组"
    ];
    
    // 先设置默认数据，避免黑屏
    this.setData({ reports: defaultReports });
    
    // 实现带缓存的战报获取
    const fetchReportsWithCache = async () => {
      try {
        // 尝试从本地缓存获取
        const cachedReports = wx.getStorageSync('reports_cache');
        const cacheTime = wx.getStorageSync('reports_cache_time');
        const now = Date.now();
        
        // 缓存有效期5分钟
        if (cachedReports && cacheTime && (now - cacheTime < 5 * 60 * 1000)) {
          console.log('从缓存获取战报数据');
          this.setData({ reports: cachedReports });
          return;
        }
        
        // 使用Promise.race实现超时处理
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('请求超时')), 5000);
        });
        
        const dbPromise = db.collection('reports')
          .where({
            status: 'approved' // 只获取已审核的战报
          })
          .orderBy('createdAt', 'desc') // 按创建时间倒序
          .limit(10) // 最多获取10条
          .get();
        
        const res = await Promise.race([dbPromise, timeoutPromise]);
        
        if (res.data && res.data.length > 0) {
          // 提取战报内容
          const reportContents = res.data.map(item => item.content || '').filter(Boolean);
          
          if (reportContents.length > 0) {
            this.setData({
              reports: reportContents
            });
            
            // 缓存结果
            wx.setStorageSync('reports_cache', reportContents);
            wx.setStorageSync('reports_cache_time', now);
          }
        }
        
      } catch (err) {
        console.error('获取战报失败:', err);
        // 失败时保持默认数据
      }
    };
    
    // 执行获取战报
    fetchReportsWithCache();
  },

  updateIdentity() {
    let roleCode = RoleManager.getCurrentRole() || 'visitor';
    
    // 确保角色代码有效
    const validRoles = ['visitor', 'student', 'anchor', 'broker', 'customer', 'tenant', 'admin'];
    if (!validRoles.includes(roleCode)) {
      roleCode = 'visitor';
      wx.setStorageSync('userRole', 'visitor');
      wx.setStorageSync('currentRole', 'visitor');
    }
    
    const isBroker = roleCode === 'broker';
    const isAnchor = roleCode === 'anchor' || roleCode === 'admin';
    const isStudent = roleCode === 'student';
    const isVisitor = roleCode === 'visitor';
    const isCustomer = roleCode === 'customer';
    const isTenant = roleCode === 'tenant';
    
    // 获取用户业务类型
    const profile = app.globalData.userProfile;
    const businessType = profile?.business_type || wx.getStorageSync('businessType');

    let tools = [];
    if (isBroker && businessType === 'rental') {
      tools = BROKER_RENTAL_TOOLS;  // 租赁经纪人：6个工具
    } else if (isBroker && businessType === 'trading') {
      tools = BROKER_TRADING_TOOLS;  // 二手房经纪人：8个工具
    } else if (isBroker && businessType === 'new_house') {
      tools = BROKER_NEW_HOUSE_TOOLS;  // 新房经纪人：8个工具
    } else if (isAnchor) {
      tools = ANCHOR_TOOLS;
    } else if (isStudent || isVisitor) {
      tools = STUDENT_TOOLS;
    }

    // 获取用户业务类型
    const isRentalBroker = isBroker && businessType === 'rental';
    const isTradingBroker = isBroker && businessType === 'trading';
    const isNewHouseBroker = isBroker && businessType === 'new_house';
    
    this.setData({
      userRole: roleCode,
      isVisitor: isVisitor,
      isStudent: isStudent,
      isBroker: isBroker,
      isCustomer: isCustomer,
      isTenant: isTenant,
      isAnchor: isAnchor,
      storeName: app.globalData.storeName || '星火计划 · 天津战区',
      rankTitle: isRentalBroker ? '本月签约榜' : (isBroker ? '今日经纪人带看榜' : (isAnchor ? '本月主播获客榜' : '今日大区获客榜')),
      bSideTools: tools,
      isPreviewMode: false,
      isRentalBroker: isRentalBroker,
      isTradingBroker: isTradingBroker,
      isNewHouseBroker: isNewHouseBroker
    });

    // 🚩🚩 核心逻辑：动态控制 TabBar 显示/隐藏 🚩🚩
    if (isCustomer || isTenant) {
      // 如果是客户或租客，把底部导航栏藏起来！
      wx.hideTabBar({ animation: false });
    } else {
      // 如果是内部人员，把底部导航栏显示出来！
      wx.showTabBar({ animation: false });
    }
  },

  onToolTap(e) {
    const action = e.currentTarget.dataset.action;
    
    if (action === 'openMarketing') {
      wx.navigateTo({ url: '/pages/tools/daily/daily' });
      return;
    }
    
    if (action === 'openResource') {
      this.setData({ isPreviewMode: true });
      // 预览模式下，为了模拟真实效果，也可以选择隐藏 TabBar (可选)
      // wx.hideTabBar(); 
      wx.showToast({ title: '已切换至客户视角', icon: 'none' });
      return;
    }

    if (action === 'crm_clue' || action === 'crm_client') {
      wx.navigateTo({ url: '/pages/crm/client' });
      return; 
    }
    
    if (action === 'inviteMember') {
      wx.navigateTo({ url: '/pages/invite/invite' });
      return;
    }
    
    if (action === 'openPendingArt') {
      wx.navigateTo({ 
        url: '/pages/collections/collections',
        success: (res) => {
          // 跳转到待拍摄标签页
          setTimeout(() => {
            wx.navigateTo({ url: '/pages/collections/collections?tab=shooting' });
          }, 100);
        }
      });
      return;
    }
    
    if (action === 'goToArt') return wx.switchTab({ url: '/pages/art/art' });
    if (action === 'goToCourse') return wx.switchTab({ url: '/pages/course/course' });
    if (action === 'goToRank') return wx.navigateTo({ url: '/pages/rank/rank' });
    if (action === 'goToAgent') return wx.switchTab({ url: '/pages/profile/profile' });
    
    // 租赁经纪人工具路由
    if (action === 'rental_contracts') return wx.navigateTo({ url: '/pages/broker-rental/contracts' });
    if (action === 'rental_submit') return wx.navigateTo({ url: '/pages/broker-rental/submit' });
    if (action === 'rental_verify') return wx.navigateTo({ url: '/pages/broker-rental/verify' });
    if (action === 'rental_materials') return wx.navigateTo({ url: '/pages/broker-rental/materials' });
    if (action === 'rental_leaderboard') return wx.navigateTo({ url: '/pages/broker-rental/leaderboard' });
    if (action === 'rental_service') return wx.navigateTo({ url: '/pages/broker-rental/service' });
    
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  // 退出预览
  exitPreview() {
    this.setData({ isPreviewMode: false });
    // 退出预览时，确保 TabBar 回来
    wx.showTabBar();
  },

  onGridTap(e) {
    const item = e.currentTarget.dataset.item;
    
    if (this.data.isPreviewMode) {
      wx.showToast({ title: '右上角转发给客户', icon: 'none' });
      return;
    }

    if (this.data.isUnlocked || item.type === 'free') {
      wx.showToast({ title: '正在打开 ' + item.name, icon: 'none' });
    } else {
      this.setData({ showAuthModal: true });
    }
  },

  // 🚩 C端文章点击：封堵跳转
  onArticleTap(e) {
    // 如果是客户，不能让他跳走，因为一跳走 TabBar 可能会露出来，或者看到不该看的东西
    if (this.data.isCustomer) {
      if (this.data.isUnlocked) {
        wx.showModal({
           title: '查看全文',
           content: '完整版分析报告已包含在资料包中，请联系顾问领取 PDF。',
           showCancel: false,
           confirmText: '联系顾问',
           success: (res) => {
             if(res.confirm) this.onCallAgent();
           }
        });
      } else {
        // 没解锁就弹授权
        this.setData({ showAuthModal: true });
      }
      return;
    }

    // 内部人员随便看
    wx.switchTab({ url: '/pages/art/art' });
  },

  onShareAppMessage() {
    let title = "送你一份《2026天津购房避坑指南》";
    let path = "/pages/index/index";

    if (this.data.isBroker || this.data.isAnchor) {
      const myName = this.data.isBroker ? '李销冠' : '王金牌'; 
      const myRole = this.data.isBroker ? 'broker' : 'anchor';
      path += `?referrerId=${Date.now()}&referrerRole=${myRole}&referrerName=${myName}`;
      title = `您的专属顾问 ${myName} 为您整理了购房资料`;
    }

    return {
      title: title,
      path: path,
      imageUrl: '/images/share_cover.png'
    };
  },

  closeAuth() { this.setData({ showAuthModal: false }); },
  onCallAgent() { wx.makePhoneCall({ phoneNumber: '13800138000' }); },
  
  // 处理手机号授权事件
  onGetPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 调用云函数处理手机号授权
      cloud.call('login', {
        cloudID: e.detail.cloudID,
        referrerId: this.data.referrerId,
        referrerRole: this.data.referrerRole,
        referrerName: this.data.referrerName
      }, {
        loadingTitle: '授权中...'
      }).then(data => {
        if (data.success) {
          this.setData({ showAuthModal: false, isUnlocked: true });
          wx.showToast({ title: '解锁成功', icon: 'success' });
        } else {
          wx.showToast({ title: '授权失败，请重试', icon: 'none' });
        }
      }).catch(err => {
        console.error('手机号授权失败:', err);
      });
    } else {
      wx.showToast({ title: '授权失败，请重试', icon: 'none' });
    }
  },

  getNowDate() {
    const d = new Date();
    return `${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
  },

  openSubmit() { this.setData({ showSubmitModal: true }); },
  closeSubmit() { this.setData({ showSubmitModal: false }); },
  onFinalSubmit(e) {
    const formData = e.detail.value;
    
    // 更新数据
    this.setData({
      showSubmitModal: false,
      leads: parseInt(formData.leads) || 0,
      showings: parseInt(formData.showings) || 0,
      callbacks: parseInt(formData.callbacks) || 0,
      rentalContracts: parseInt(formData.rentalContracts) || 0,
      houseCollection: parseInt(formData.houseCollection) || 0,
      houseRental: parseInt(formData.houseRental) || 0,
      rentalShowings: parseInt(formData.rentalShowings) || 0,
      videoCount: parseInt(formData.videoCount) || 0,
      liveCount: parseInt(formData.liveCount) || 0
    });
    
    wx.showToast({ title: '上报成功', icon: 'success' });
  },
  goToJoin() { wx.navigateTo({ url: '/pages/join/join' }); },
  goToRank() { wx.navigateTo({ url: '/pages/rank/rank' }); }
})