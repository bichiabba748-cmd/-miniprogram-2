// 开发进度详情页面逻辑
Page({
  data: {
    // 总体进度
    totalProgress: 48.4,
    currentStage: 'V2.0 阶段一 - 战区2施工中（待命中）',
    lastUpdated: '2026-01-31 21:35',
    
    // 进度区块
    sections: [],
    
    // 加载状态
    loading: false
  },

  // 页面加载
  onLoad: function(options) {
    // 加载开发进度数据
    this.loadProgressData();
  },
  
  // 加载开发进度数据
  loadProgressData: function() {
    wx.showLoading({ title: '加载开发进度...' });
    
    // 调用云函数获取开发进度
    wx.cloud.callFunction({
      name: 'adminTools',
      data: {
        action: 'getDevelopmentProgress'
      }
    }).then((result) => {
      wx.hideLoading();
      console.log('开发进度:', result);
      
      if (result.result.success) {
        const progressData = result.result.data;
        const lastUpdated = new Date(progressData.lastUpdated);
        const formattedTime = lastUpdated.getFullYear() + '-' + 
          String(lastUpdated.getMonth() + 1).padStart(2, '0') + '-' + 
          String(lastUpdated.getDate()).padStart(2, '0') + ' ' + 
          String(lastUpdated.getHours()).padStart(2, '0') + ':' + 
          String(lastUpdated.getMinutes()).padStart(2, '0');
        
        // 更新页面数据
        this.setData({
          totalProgress: progressData.percentage,
          currentStage: progressData.stage,
          lastUpdated: formattedTime,
          sections: progressData.sections || []
        });
      } else {
        wx.showToast({ title: '加载开发进度失败', icon: 'error' });
      }
    }).catch((error) => {
      wx.hideLoading();
      console.error('加载开发进度失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    });
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },

  // 刷新进度
  refreshProgress: function() {
    // 直接调用加载数据函数
    this.loadProgressData();
  },

  // 导出报告
  exportProgress: function() {
    wx.showModal({
      title: '导出报告',
      content: '确定要导出开发进度报告吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '导出中...' });
          
          // 模拟导出过程
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ 
              title: '报告导出成功', 
              icon: 'success',
              duration: 2000
            });
          }, 2000);
        }
      }
    });
  },

  // 页面显示
  onShow: function() {
    // 页面显示逻辑
  },

  // 页面隐藏
  onHide: function() {
    // 页面隐藏逻辑
  },

  // 页面卸载
  onUnload: function() {
    // 页面卸载逻辑
  }
});