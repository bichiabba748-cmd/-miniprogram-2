Page({
  data: {
    currentTab: 0,
    tenants: []
  },

  onLoad() {
    this.loadTenants();
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentTab: index });
    this.loadTenants();
  },

  loadTenants() {
    // 临时 mock 数据
    const mockPending = [
      {
        _id: 'mock1',
        tenantName: '李四',
        tenantPhone: '13900139000',
        propertyAddress: '南开区鼓楼街 2号楼 301',
        signDate: '2026-01-28'
      }
    ];

    this.setData({
      tenants: this.data.currentTab === 0 ? mockPending : []
    });
  },

  callTenant(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({ phoneNumber: phone });
  },

  markVerified(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认核验',
      content: '确认已与租客联系并核实身份？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '已标记核验', icon: 'success' });
          this.loadTenants();
        }
      }
    });
  }
});