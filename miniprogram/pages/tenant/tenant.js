Page({ 
  data: {
    isLoggedIn: false,
    contractInfo: null,
    tenantGrid: [ 
      { name: '我的合同', iconClass: 'icon-document', page: '/pages/tenant/contract', preview: '查看详情' }, 
      { name: '物业服务', iconClass: 'icon-building', page: '/pages/tenant/property', preview: '华苑物业 8:00-18:00' }, 
      { name: '宽带办理', iconClass: 'icon-wifi', page: '/pages/tenant/broadband', preview: '联通/移动/电信' }, 
      { name: '水电缴费', iconClass: 'icon-water', page: '/pages/tenant/utilities', preview: '户号: 123***' }, 
      { name: '便民服务', iconClass: 'icon-wrench', page: '/pages/tenant/service', preview: '开锁/保洁/维修' }, 
      { name: '周边生活', iconClass: 'icon-shopping', page: '/pages/tenant/life', preview: '加入生活圈' } 
    ], 
    agentName: '王经理', 
    agentPhone: '15900001111', 
    agentAvatar: '' 
  }, 
  
  onLoad() { 
    console.log('=== 租客首页加载 ===');
    this.checkLoginStatus();
  }, 
  
  async checkLoginStatus() {
    // 检查本地是否有 openid
    const openid = wx.getStorageSync('openid');
    if (openid) {
      this.setData({ isLoggedIn: true });
      this.loadContractInfo();
    } else {
      // 尝试静默登录
      await this.onLogin(true);
    }
  },

  async loadContractInfo() { 
    if (!this.data.isLoggedIn) return;

    try {
      const openid = wx.getStorageSync('openid'); 
      console.log('OpenID:', openid);
      
      const res = await wx.cloud.callFunction({ 
        name: 'getContractInfo', 
        data: { tenant_openid: openid } 
      }); 
      
      console.log('云函数返回结果:', res);
      
      if (res.result.success) { 
        console.log('设置顾问信息和合同信息:', res.result.data);
        this.setData({ 
          agentName: res.result.data.brokerName || '王经理', 
          agentPhone: res.result.data.brokerPhone || '15900001111', 
          agentAvatar: res.result.data.brokerAvatar || '',
          contractInfo: res.result.data
        }); 
      } else {
        console.error('获取合同信息失败:', res.result.error);
        // 如果获取失败，也保留默认的顾问信息，避免页面空白
      }
    } catch (error) {
      console.error('加载合同信息出错:', error);
    }
  }, 
  
  onGridTap(e) { 
    const page = e.currentTarget.dataset.page; 
    wx.navigateTo({ url: page }); 
  }, 
  
  onCallAgent() { 
    const phoneNumber = this.data.agentPhone;
    console.log('拨打电话:', phoneNumber);
    if (phoneNumber) {
      wx.makePhoneCall({ 
        phoneNumber: phoneNumber,
        fail: err => console.error('拨打电话失败:', err)
      }); 
    } else {
      wx.showToast({
        title: '暂无顾问电话',
        icon: 'none'
      });
    }
  }, 
  
  onContactWechat() {
    console.log('点击微信联系');
    wx.showToast({
      title: '微信联系功能开发中',
      icon: 'none'
    });
  },
  
  onAdClick() { 
    wx.showModal({ 
      title: '广告位', 
      content: '该功能即将上线，敬请期待', 
      showCancel: false 
    }); 
  }, 
  
  onCallManager() { 
    wx.makePhoneCall({ 
      phoneNumber: '13900000000'  // TODO: 替换成店长真实电话 
    }); 
  },
  
  async onLogin(silent = false) {
    try {
      if (!silent) {
        wx.showLoading({ title: '登录中...' });
      }
      
      const loginRes = await wx.cloud.callFunction({
        name: 'login',
        data: {}
      });
      
      console.log('登录返回完整结果:', loginRes);
      const openid = loginRes.result.openid || loginRes.result.data?.openid;
      
      if (!openid) {
        throw new Error('获取OpenID失败');
      }
      
      wx.setStorageSync('openid', openid);
      this.setData({ isLoggedIn: true });
      
      if (!silent) {
        wx.showToast({ title: '登录成功', icon: 'success' });
      }
      
      this.loadContractInfo();
      
    } catch (err) {
      console.error('登录失败:', err);
      if (!silent) {
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    } finally {
      if (!silent) {
        wx.hideLoading();
      }
    }
  },

  onRenew() {
    if (!this.data.contractInfo || !this.data.contractInfo.contractId) {
      wx.showToast({
        title: '合同信息不完整',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认续租',
      content: '是否申请续租当前房源？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '提交中...' });
          try {
            const result = await wx.cloud.callFunction({
              name: 'submitRenewal',
              data: {
                contractId: this.data.contractInfo.contractId
              }
            });

            if (result.result.code === 0) {
              wx.showToast({
                title: '申请已提交',
                icon: 'success'
              });
            } else {
              throw new Error(result.result.message);
            }
          } catch (err) {
            wx.showToast({
              title: err.message || '提交失败',
              icon: 'none'
            });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  }
});