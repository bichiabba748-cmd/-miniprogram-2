Page({
  data: {
    // 页面数据
  },

  onLoad: function(options) {
    // 页面加载
  },

  onShow: function() {
    // 页面显示
  },

  manageCourse() {
    wx.navigateTo({
      url: '/pages/admin/course-manage/course-manage'
    });
  },

  manageScript() {
    wx.navigateTo({
      url: '/pages/admin/script-manage/script-manage'
    });
  },

  manageAssign() {
    wx.showToast({ title: '线索指派开发中', icon: 'none' });
  }
});