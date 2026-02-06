const app = getApp();

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

      const res = await wx.cloud.callFunction({
        name: 'getBrokerContracts',
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize,
          status: status
        }
      });

      if (res.result.code === 0) {
        const { list, total, hasMore } = res.result.data;
        
        // TODO: 如果后端支持 'expiring' 状态，Tab 0 应该传 'expiring'
        // 目前 Tab 0 和 Tab 1 都显示 active 状态的合同
        
        this.setData({
          contracts: reset ? list : this.data.contracts.concat(list),
          hasMore: hasMore,
          page: this.data.page + 1
        });
      } else {
        wx.showToast({
          title: res.result.message || '加载失败',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('加载合同列表失败:', err);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ 
        isLoading: false,
        isRefreshing: false
      });
      wx.stopPullDownRefresh();
    }
  },

  callTenant(e) {
    const phone = e.currentTarget.dataset.phone;
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone });
    }
  }
});