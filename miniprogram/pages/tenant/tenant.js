const cloud = require('../../utils/cloud.js');

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
      
      const data = await cloud.call('getContractInfo', { 
        tenant_openid: openid 
      }, {
        loadingTitle: '加载合同信息...'
      }); 
      
      console.log('云函数返回结果:', data);
      
      if (data && data.success) { 
        console.log('设置顾问信息和合同信息:', data.data);
        this.setData({ 
          agentName: data.data.brokerName || '王经理', 
          agentPhone: data.data.brokerPhone || '15900001111', 
          agentAvatar: data.data.brokerAvatar || '',
          contractInfo: data.data
        }); 
      } else {
        console.error('获取合同信息失败');
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
    wx.showModal({
      title: '微信联系顾问',
      content: '微信：15900001111',
      showCancel: true,
      confirmText: '复制微信',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) {
          // 复制微信号
          wx.setClipboardData({
            data: '15900001111',
            success: () => {
              wx.showToast({
                title: '微信号已复制',
                icon: 'success',
                duration: 2000
              });
            },
            fail: (err) => {
              console.error('复制失败:', err);
              wx.showToast({
                title: '复制失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },
  
  onAdClick() { 
    console.log('点击广告位');
    
    // 显示广告详情
    wx.showModal({
      title: '优惠活动',
      content: '🎉 本月租房特惠：\n\n1. 签约1年以上免1个月房租\n2. 新客首单立减500元\n3. 老客推荐新客各得300元红包\n\n活动时间：2026.02.01-2026.02.29\n\n详情咨询：15900001111',
      showCancel: true,
      confirmText: '立即咨询',
      cancelText: '稍后了解',
      success: (res) => {
        if (res.confirm) {
          // 拨打电话咨询
          wx.makePhoneCall({
            phoneNumber: '15900001111',
            fail: () => {
              wx.showToast({ title: '拨打电话失败', icon: 'none' });
            }
          });
        }
      }
    });
  }, 
  
  onCallManager() { 
    wx.makePhoneCall({ 
      phoneNumber: '13900000000'  // TODO: 替换成店长真实电话 
    }); 
  },
  
  async onLogin(silent = false) {
    try {
      const loginRes = await cloud.call('login', {}, {
        loadingTitle: silent ? null : '登录中...',
        showError: !silent
      });
      
      console.log('登录返回完整结果:', loginRes);
      const openid = loginRes.openid || loginRes.data?.openid;
      
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
          try {
            const result = await cloud.call('submitRenewal', {
              contractId: this.data.contractInfo.contractId
            }, {
              loadingTitle: '提交中...'
            });

            if (result && (result.code === 0 || result.success)) {
              wx.showToast({
                title: '申请已提交',
                icon: 'success'
              });
            } else {
              throw new Error(result.message || '提交失败');
            }
          } catch (err) {
            console.error('续租申请失败:', err);
          }
        }
      }
    });
  }
});