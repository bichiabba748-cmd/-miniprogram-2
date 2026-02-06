App({
  globalData: {
    userRole: 'visitor',
    storeName: "链家直播大区",
    clickCount: 0,
    clickTimer: null,
    isNewAnchor: false,
    openid: ''
  },
  onLaunch() {
    const role = wx.getStorageSync('userRole');
    if (role) { this.globalData.userRole = role; }
    
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloudbase-0gjqvewz98229914', // 使用真实环境ID
        traceUser: true,
      });
    }
  },
  // 🚩 核心：全域变身函数
  triggerAdminCheck() {
    this.globalData.clickCount++;
    clearTimeout(this.globalData.clickTimer);
    this.globalData.clickTimer = setTimeout(() => { this.globalData.clickCount = 0; }, 2000);

    if (this.globalData.clickCount >= 5) {
      this.globalData.userRole = 'admin';
      wx.setStorageSync('userRole', 'admin');
      wx.vibrateLong(); // 震动提醒
      wx.showModal({ title: '上帝视角', content: '指挥官，全战区权限已解锁', showCancel: false });
      this.globalData.clickCount = 0;
      return true;
    }
    return false;
  },
  
  // 通用角色切换函数
  switchRole(role) {
    this.globalData.userRole = role;
    wx.setStorageSync('userRole', role);
    wx.setStorageSync('currentRole', role);
    
    if (role === 'admin') {
      wx.vibrateLong(); // 震动提醒
      wx.showModal({ title: '身份切换', content: '指挥官，全战区权限已解锁', showCancel: false });
    } else {
      wx.showModal({ 
        title: '身份切换', 
        content: `已切换为${this.getRoleDisplayName(role)}身份`, 
        showCancel: false 
      });
    }
    return true;
  },
  
  // 获取角色显示名称
  getRoleDisplayName(role) {
    const roleMap = {
      visitor: '访客',
      student: '学员',
      anchor: '主播',
      broker: '经纪人',
      customer: '客户',
      tenant: '租客',
      admin: '管理员'
    };
    return roleMap[role] || role;
  }
})