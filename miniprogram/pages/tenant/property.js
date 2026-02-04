Page({
  data: {},
  
  onLoad() {
    console.log('物业服务页加载');
  },
  
  onNavigateBack() {
    wx.navigateBack();
  },
  
  onCallProperty() {
    wx.makePhoneCall({
      phoneNumber: '022-83726688',
      success: () => {
        console.log('拨打物业电话成功');
      },
      fail: (err) => {
        console.error('拨打物业电话失败', err);
        wx.showToast({
          title: '拨打失败',
          icon: 'none'
        });
      }
    });
  }
});