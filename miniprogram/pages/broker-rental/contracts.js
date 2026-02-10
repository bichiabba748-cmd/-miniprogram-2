const app = getApp();
const cloud = require('../../utils/cloud.js');

Page({
  data: {
    currentTab: 0,
    contracts: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    isLoading: false,
    isRefreshing: false
  },

  onLoad() {
    this.loadContracts(true);
  },

  onPullDownRefresh() {
    this.loadContracts(true);
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadContracts(false);
    }
  },

  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    if (this.data.currentTab === index) return;
    
    this.setData({ 
      currentTab: index,
      contracts: [],
      hasMore: true,
      page: 1
    }, () => {
      this.loadContracts(true);
    });
  },

  async loadContracts(reset = false) {
    if (this.data.isLoading && !reset) return;

    this.setData({ isLoading: true });

    if (reset) {
      this.setData({ 
        page: 1, 
        hasMore: true,
        isRefreshing: true
      });
    }

    try {
      // 映射 Tab 到 status
      // Tab 0 (待续约): status = 'active' 
      // Tab 1 (在租中): status = 'active'
      // Tab 2 (已到期): status = 'expired'
      let status = 'active';
      if (this.data.currentTab === 2) {
        status = 'expired';
      }

      const data = await cloud.call('getBrokerContracts', {
        page: this.data.page,
        pageSize: this.data.pageSize,
        status: status
      }, {
        loadingTitle: reset ? null : '加载中...'
      });

      if (data && data.code === 0) {
        const { list, total, hasMore } = data.data;
        
        // TODO: 如果后端支持 'expiring' 状态，Tab 0 应该传 'expiring'
        // 目前 Tab 0 和 Tab 1 都显示 active 状态的合同
        
        this.setData({
          contracts: reset ? list : this.data.contracts.concat(list),
          hasMore: hasMore,
          page: this.data.page + 1
        });
      }
    } catch (err) {
      console.error('加载合同列表失败:', err);
    } finally {
      this.setData({ 
        isLoading: false,
        isRefreshing: false
      });
      
      if (reset) {
        wx.stopPullDownRefresh();
      }
    }
  },

  callTenant(e) {
    const phone = e.currentTarget.dataset.phone;
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone });
    }
  }
});