Page({
  data: {
    propertyInfo: {
      company: '正在加载...',
      phone: '',
      address: '',
      hours: '周一至周日 9:00-18:00'
    }
  },
  
  onLoad() {
    console.log('物业服务页加载');
    this.loadPropertyInfo();
  },
  
  async loadPropertyInfo() {
    wx.showLoading({ title: '加载中...' });
    try {
      const openid = wx.getStorageSync('openid');
      const res = await wx.cloud.callFunction({
        name: 'getContractInfo',
        data: { tenant_openid: openid }
      });

      console.log('物业信息获取结果:', res);

      if (res.result.success && res.result.data.propertyManagement) {
        const pm = res.result.data.propertyManagement;
        this.setData({
          propertyInfo: {
            company: pm.company || '暂无物业信息',
            phone: pm.phone || '',
            address: pm.address || '',
            hours: pm.hours || '周一至周日 9:00-18:00'
          }
        });
      } else {
        // 如果没有合同或物业信息，显示默认或空状态
        this.setData({
          'propertyInfo.company': '暂无关联物业',
          'propertyInfo.phone': ''
        });
      }
    } catch (err) {
      console.error('加载物业信息失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  onNavigateBack() {
    wx.navigateBack();
  },
  
  onCallProperty() {
    const phoneNumber = this.data.propertyInfo.phone;
    if (!phoneNumber) {
      wx.showToast({
        title: '暂无电话信息',
        icon: 'none'
      });
      return;
    }

    wx.makePhoneCall({
      phoneNumber: phoneNumber,
      success: () => {
        console.log('拨打物业电话成功');
      },
      fail: (err) => {
        console.error('拨打物业电话失败', err);
      }
    });
  }
});