Page({
  data: {
    currentTab: 'morning',
    tabs: [
      { key: 'morning', label: '早安' },
      { key: 'noon', label: '午间' },
      { key: 'night', label: '晚安' }
    ],
    textContent: '',
    imageUrl: '',
    loading: true,
    currentDate: ''
  },

  onLoad() {
    this.setData({
      currentDate: this.formatDate(new Date())
    });
    this.loadDailyContent('morning');
  },

  onPullDownRefresh() {
    this.loadDailyContent(this.data.currentTab);
  },

  async loadDailyContent(category) {
    this.setData({ loading: true });
    
    try {
      const db = wx.cloud.database();
      
      const textRes = await db.collection('daily_materials')
        .where({ type: 'text', category: category, active: true })
        .get();
      
      if (textRes.data.length === 0) {
        wx.showToast({ title: '暂无素材', icon: 'none' });
        return;
      }
      
      const randomText = textRes.data[Math.floor(Math.random() * textRes.data.length)];
      
      const imageRes = await db.collection('daily_materials')
        .where({ type: 'image', category: category, active: true })
        .get();
      
      const randomImage = imageRes.data.length > 0
        ? imageRes.data[Math.floor(Math.random() * imageRes.data.length)]
        : null;
      
      this.setData({
        textContent: randomText.content,
        imageUrl: randomImage ? randomImage.content : '',
        loading: false,
        currentTab: category
      });
      
      wx.stopPullDownRefresh();
      
    } catch (err) {
      console.error('加载素材失败', err);
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  onTabChange(e) {
    const category = e.currentTarget.dataset.category;
    this.loadDailyContent(category);
  },

  onCopyText() {
    if (!this.data.textContent) {
      wx.showToast({ title: '暂无文案', icon: 'none' });
      return;
    }
    
    wx.setClipboardData({
      data: this.data.textContent,
      success: () => {
        wx.showToast({ title: '文案已复制', icon: 'success' });
      }
    });
  },

  onSaveImage() {
    if (!this.data.imageUrl) {
      wx.showToast({ title: '暂无配图', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '保存中...' });
    
    wx.downloadFile({
      url: this.data.imageUrl,
      success: (res) => {
        wx.hideLoading();
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({ title: '保存成功', icon: 'success' });
          },
          fail: (err) => {
            if (err.errMsg.includes('auth')) {
              wx.showModal({
                title: '需要授权',
                content: '请在设置中允许访问相册',
                showCancel: false
              });
            } else {
              wx.previewImage({
                urls: [this.data.imageUrl],
                current: this.data.imageUrl
              });
              wx.showToast({
                title: '请长按图片保存',
                icon: 'none',
                duration: 2000
              });
            }
          }
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '下载失败', icon: 'none' });
      }
    });
  },

  onRefresh() {
    this.loadDailyContent(this.data.currentTab);
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }
});