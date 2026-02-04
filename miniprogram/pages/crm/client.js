const { RoleManager } = require('../../utils/roleManager.js');

Page({
  data: {
    clientList: [],
    fullList: [],
    isBroker: false,
    isAnchor: false,
    searchText: '',
    currentTab: 'all'
  },

  onShow() {
    this.updateRoleState();
    this.loadData();
  },

  updateRoleState() {
    const role = RoleManager.getCurrentRole();
    this.setData({
      isBroker: role === 'broker',
      isAnchor: role === 'anchor' || role === 'admin' 
    });
  },

  loadData() {
    let storageList = wx.getStorageSync('crm_clients');

    if (!storageList || storageList.length === 0) {
      storageList = [
        { 
          id: 1, name: '李先生 (演示)', phone: '13800138000', level: 5, status: 'follow', source: '直播间', date: '01-17 14:30',
          anchorName: '王金牌', daysLeft: 3, brokerName: '李销冠', rotationCount: 1
        },
        { 
          id: 2, name: '王女士 (演示)', phone: '13900139000', level: 4, status: 'follow', source: '短视频', date: '01-16 09:20',
          anchorName: '王金牌', daysLeft: 1, brokerName: '张新人', rotationCount: 3 
        },
        { 
          id: 3, name: '陈总 (演示)', phone: '13600136000', level: 5, status: 'deal', source: '熟人介绍', date: '01-15 18:00',
          anchorName: '李主播', daysLeft: 0, brokerName: '赵店长', rotationCount: 1
        }
      ];
      wx.setStorageSync('crm_clients', storageList);
    }
    
    this.setData({ fullList: storageList });
    this.filterList();
  },

  filterList() {
    const { fullList, searchText, currentTab } = this.data;
    const filtered = fullList.filter(item => {
      const matchText = !searchText || item.name.includes(searchText) || item.phone.includes(searchText);
      const matchTab = currentTab === 'all' || item.status === currentTab;
      return matchText && matchTab;
    });
    this.setData({ clientList: filtered });
  },

  onSearchInput(e) {
    this.setData({ searchText: e.detail.value }, () => { this.filterList(); });
  },

  onClearSearch() {
    this.setData({ searchText: '' }, () => { this.filterList(); });
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab }, () => { this.filterList(); });
  },

  onCall(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({ phoneNumber: phone, fail: () => {} });
  },

  // 🚩 核心修正：单层路径跳转
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      // ✅ 修正点：没有 client-detail 文件夹，直接在 crm 下找文件
      url: '/pages/crm/client-detail?id=' + id,
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({ title: '页面未找到', icon: 'none' });
      }
    });
  },

  goToClue() {
    wx.navigateTo({ url: '/pages/crm/clue' });
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '已同步最新数据', icon: 'none' });
    }, 500);
  }
})