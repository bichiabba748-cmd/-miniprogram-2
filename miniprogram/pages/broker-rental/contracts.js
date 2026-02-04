Page({
  data: {
    currentTab: 0,
    contracts: []
  },

  onLoad() {
    this.loadContracts();
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentTab: index });
    this.loadContracts();
  },

  loadContracts() {
    // 临时 mock 数据，等云函数创建后替换
    const mockData = [
      {
        propertyAddress: '华苑小区 3号楼 501',
        tenantName: '张三',
        tenantPhone: '13800138000',
        rent: 3500,
        endDate: '2026-03-15',
        daysLeft: 45
      }
    ];

    this.setData({ contracts: this.data.currentTab === 0 ? mockData : [] });
  },

  callTenant(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({ phoneNumber: phone });
  }
});