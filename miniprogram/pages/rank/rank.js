const app = getApp();
const { RoleManager } = require('../../utils/roleManager.js');

Page({
  data: {
    isNewAnchor: false,
    activeTab: 'all',
    top3: [],
    others: [],
    userRole: 'visitor',
    canViewFull: false
  },
  onLoad() {
    this.setData({ isNewAnchor: app.globalData.isNewAnchor });
    this.updateUserRole();
    this.loadRankData();
  },
  onShow() {
    this.updateUserRole();
    this.loadRankData();
  },
  updateUserRole() {
    const role = RoleManager.getCurrentRole();
    const canViewFull = ['anchor', 'broker', 'admin'].includes(role);
    this.setData({
      userRole: role,
      canViewFull: canViewFull
    });
  },
  loadRankData() {
    // 模拟数据
    const mockData = [
      { id: 1, name: '王金牌', leads: 158, scripts: 12, store: '河西店', avatar: '/images/icons/avatars/top1.png', rank: 1 },
      { id: 2, name: '陈店长', leads: 120, scripts: 8, store: '南开店', avatar: '/images/icons/avatars/top2.png', rank: 2 },
      { id: 3, name: '李销冠', leads: 98, scripts: 15, store: '和平店', avatar: '/images/icons/avatars/top3.png', rank: 3 },
      { id: 4, name: '你（我）', leads: 45, scripts: 5, store: '红桥店', avatar: '/images/avatar.png', rank: 12, isMe: true },
      { id: 5, name: '新人A', leads: 12, scripts: 2, store: '滨海店', rank: 85, isBottom: true }
    ];
    this.setData({
      top3: mockData.slice(0, 3),
      others: this.data.canViewFull ? mockData.slice(3) : []
    });
  },
  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
    // 实际应请求不同接口
  },
  // 核心闭环：跳回文案页并搜索
  goToUserScripts(e) {
    const name = e.currentTarget.dataset.name;
    app.globalData.tempSearchUser = name; // 设置全局搜索词
    wx.switchTab({ url: '/pages/art/art' });
  },
  
  goToJoin() {
    wx.navigateTo({ url: '/pages/join/join' });
  }
})