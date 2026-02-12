const app = getApp();
const { RoleManager } = require('../../utils/roleManager.js');
const db = wx.cloud.database();
const _ = db.command;

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

const BROKER_RENTAL_TOOLS = [
  { name: '合同管理', icon: '📄', action: 'rental_contracts' },
  { name: '提交录入', icon: '📝', action: 'rental_submit' },
  { name: '客户核验', icon: '✅', action: 'rental_verify' },
  { name: '资料库', icon: '📚', action: 'rental_materials' },
  { name: '排行榜', icon: '🏆', action: 'rental_leaderboard' },
  { name: '租后服务', icon: '🛠️', action: 'rental_service' },
  { name: '邀请入队', icon: '🤝', action: 'inviteMember' }
];

const STUDENT_TOOLS = [
  { name: '爆款文案', icon: '📜', action: 'goToArt' },
  { name: '实战课程', icon: '🎥', action: 'goToCourse' },
  { name: '龙虎榜单', icon: '🏆', action: 'goToRank' },
  { name: '个人中心', icon: '🦁', action: 'goToAgent' }
];

Page({
  data: {
    userRole: 'visitor',
    isVisitor: true,
    isStudent: false,
    isBroker: false,
    isAnchor: false,
    isCustomer: false,
    isTenant: false,
    
    isPreviewMode: false,

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
    rentalContracts: 0,
    houseCollection: 0,
    houseRental: 0,
    rentalShowings: 0,

    reports: [],

    bSideTools: [], 

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
      wx.setStorageSync('user_role', 'customer');
      
      this.setData({
        userRole: 'customer',
        isCustomer: true,
        referrerId: options.referrerId,
        referrerRole: options.referrerRole,
        referrerName: options.referrerName || '专属顾问'
      });
      wx.hideTabBar();
    } else {
      this.updateIdentity();
    }
  },

  onShow() {
    const currentRole = RoleManager.getCurrentRole();
    if (currentRole === 'tenant') {
      wx.redirectTo({
        url: '/pages/tenant/tenant',
        fail: (err) => {
          console.error('重定向到租户首页失败:', err);
        }
      });
      return;
    }
    
    this.updateIdentity();
    this.getReports();
  },

  onPullDownRefresh() {
    this.updateIdentity();
    this.getReports();
    setTimeout(() => { wx.stopPullDownRefresh(); }, 500);
  },

  getReports() {
    const defaultReports = [
      "恭喜王金牌刚刚成交一套河西学区房",
      "大区军火库新增《2026购房避坑指南》",
      "昨日全员获客突破 2000 组"
    ];
    
    this.setData({ reports: defaultReports });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), 5000);
    });
    
    const dbPromise = db.collection('reports')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    Promise.race([dbPromise, timeoutPromise])
      .then(res => {
        if (res.data && res.data.length > 0) {
          const reportContents = res.data.map(item => item.content);
          this.setData({
            reports: reportContents
          });
        }
      })
      .catch(err => {
        console.error('获取战报失败:', err);
      });
  },

  updateIdentity() {
    let roleCode = RoleManager.getCurrentRole() || 'visitor';
    
    console.log('[updateIdentity] 原始角色代码:', roleCode);
    
    const validRoles = ['visitor', 'student', 'anchor', 'broker', 'customer', 'tenant', 'admin'];
    if (!validRoles.includes(roleCode)) {
      console.log('[updateIdentity] 角色代码无效，重置为visitor:', roleCode);
      roleCode = 'visitor';
      wx.setStorageSync('userRole', 'visitor');
      wx.setStorageSync('currentRole', 'visitor');
    }
    
    console.log('[updateIdentity] 处理后角色代码:', roleCode);
    
    const isBroker = roleCode === 'broker';
    const isAnchor = roleCode === 'anchor' || roleCode === 'admin';
    const isStudent = roleCode === 'student';
    const isVisitor = roleCode === 'visitor';
    const isCustomer = roleCode === 'customer';
    const isTenant = roleCode === 'tenant';
    
    const profile = app.globalData.userProfile;
    const businessType = profile?.business_type || wx.getStorageSync('businessType');

    let tools = [];
    if (isBroker && businessType === 'rental') {
      tools = BROKER_RENTAL_TOOLS;
    } else if (isBroker && businessType === 'trading') {
      tools = BROKER_TRADING_TOOLS;
    } else if (isBroker && businessType === 'new_house') {
      tools = BROKER_NEW_HOUSE_TOOLS;
    } else if (isAnchor) {
      tools = ANCHOR_TOOLS;
    } else if (isStudent || isVisitor) {
      tools = STUDENT_TOOLS;
    }

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

    if (isCustomer || isTenant) {
      wx.hideTabBar({ animation: false });
    } else {
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
    
    if (action === 'rental_contracts') return wx.navigateTo({ url: '/pages/broker-rental/contracts' });
    if (action === 'rental_submit') return wx.navigateTo({ url: '/pages/broker-rental/submit' });
    if (action === 'rental_verify') return wx.navigateTo({ url: '/pages/broker-rental/verify' });
    if (action === 'rental_materials') return wx.navigateTo({ url: '/pages/broker-rental/materials' });
    if (action === 'rental_leaderboard') return wx.navigateTo({ url: '/pages/broker-rental/leaderboard' });
    if (action === 'rental_service') return wx.navigateTo({ url: '/pages/broker-rental/service' });
    
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  exitPreview() {
    this.setData({ isPreviewMode: false });
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

  onArticleTap(e) {
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
        this.setData({ showAuthModal: true });
      }
      return;
    }

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
  
  onGetPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      wx.showLoading({ title: '授权中...' });
      
      wx.cloud.callFunction({
        name: 'login',
        data: {
          cloudID: e.detail.cloudID,
          referrerId: this.data.referrerId,
          referrerRole: this.data.referrerRole,
          referrerName: this.data.referrerName
        }
      }).then(res => {
        wx.hideLoading();
        
        if (res.result.success) {
          this.setData({ showAuthModal: false, isUnlocked: true });
          wx.showToast({ title: '解锁成功', icon: 'success' });
        } else {
          wx.showToast({ title: '授权失败，请重试', icon: 'none' });
        }
      }).catch(err => {
        wx.hideLoading();
        console.error('手机号授权失败:', err);
        wx.showToast({ title: '授权失败，请重试', icon: 'none' });
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