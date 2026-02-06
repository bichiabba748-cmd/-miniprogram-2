const { RoleManager } = require('../../utils/roleManager.js');

Page({
  data: {
    clientList: [],
    fullList: [],
    isBroker: false,
    isAnchor: false,
    searchText: '',
    currentTab: 'all',
    page: 1,
    pageSize: 20,
    hasMore: false,
    loading: false
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
    this.setData({ loading: true });
    
    const { page, pageSize, currentTab, searchText } = this.data;
    
    wx.cloud.callFunction({
      name: 'getClients',
      data: {
        page: page,
        pageSize: pageSize,
        status: currentTab === 'all' ? undefined : currentTab,
        searchText: searchText || undefined
      },
      success: res => {
        console.log('[getClients] 调用成功：', res);
        const { code, data } = res.result;
        
        if (code === 0 && data) {
          this.setData({
            clientList: data.list,
            hasMore: data.hasMore,
            loading: false
          });
        } else {
          this.setData({ loading: false });
          wx.showToast({ title: '获取数据失败', icon: 'none' });
        }
      },
      fail: err => {
        console.error('[getClients] 调用失败：', err);
        this.setData({ loading: false });
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
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
    this.setData({ searchText: e.detail.value, page: 1 }, () => { this.loadData(); });
  },

  onClearSearch() {
    this.setData({ searchText: '', page: 1 }, () => { this.loadData(); });
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab, page: 1 }, () => { this.loadData(); });
  },

  onLoadMore() {
    const { page, hasMore, loading } = this.data;
    if (!hasMore || loading) return;
    
    this.setData({ page: page + 1 }, () => { this.loadData(); });
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
    this.setData({ page: 1 }, () => { this.loadData(); });
  }
})