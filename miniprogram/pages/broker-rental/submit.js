const cloud = require('../../utils/cloud.js');

Page({
  data: {
    tenantName: '',
    tenantPhone: '',
    propertyAddress: '',
    rent: '',
    startDate: '',
    endDate: '',
    ownerName: '',
    ownerPhone: ''
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value });
  },

  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value });
  },

  handleSubmit() {
    const { tenantName, tenantPhone, propertyAddress, rent, startDate, endDate, ownerName, ownerPhone } = this.data;

    if (!tenantName || !tenantPhone || !propertyAddress || !rent || !startDate || !endDate) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    cloud.call('submitContract', {
      tenantName,
      tenantPhone,
      propertyAddress,
      rent: parseFloat(rent),
      startDate,
      endDate,
      ownerName,
      ownerPhone,
      brokerOpenId: getApp().globalData.openid
    }, {
      loadingTitle: '提交中...'
    }).then(data => {
      wx.showToast({ title: '报单成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/broker-rental/contracts' });
      }, 1500);
    }).catch(err => {
      console.error('submitContract error:', err);
    });
  }
});