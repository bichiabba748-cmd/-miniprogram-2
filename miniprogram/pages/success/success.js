Page({
  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },
  goRank() {
    wx.navigateTo({ url: '/pages/rank/rank' });
  }
})