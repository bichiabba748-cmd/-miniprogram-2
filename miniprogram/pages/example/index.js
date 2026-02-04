const app = getApp();
Page({
  data: {
    userRole: 'anchor',
    showSubmitModal: false,
    storeName: '星火计划 · 天津战区',
    reports: ["大区军火库新增实战脚本", "河西金牌主播完成提报", "昨日累计获客突破2000组"]
  },
  onShow() {
    this.setData({
      userRole: app.globalData.userRole,
      storeName: app.globalData.storeName || '星火计划 · 天津战区'
    });
  },
  openSubmit() { this.setData({ showSubmitModal: true }); },
  closeSubmit() { this.setData({ showSubmitModal: false }); },
  onFinalSubmit(e) {
    const d = e.detail.value;
    if (!d.leads && !d.videoCount && !d.liveCount) {
      wx.showToast({ title: '请填写今日战绩', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '提交后台审核' });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ showSubmitModal: false });
      wx.showToast({ title: '战绩上报成功', icon: 'success' });
    }, 1200);
  },
  goToArt() { wx.switchTab({ url: '/pages/art/art' }); },
  goToRank() { wx.navigateTo({ url: '/pages/rank/rank' }); },
  goToCourse() { wx.switchTab({ url: '/pages/course/course' }); },
  goToAgent() { wx.navigateTo({ url: '/pages/agent/agent' }); }
})