Page({
  data: {
    currentTab: 'text',
    textList: [
      { id: 1, content: '【华苑小区】南开学区房，精装两室，拎包入住！月租3500元', category: '房源文案', createTime: '01-20' },
      { id: 2, content: '租房小贴士：签约前一定要核对房东身份证和房产证', category: '攻略', createTime: '01-19' }
    ],
    imageList: [
      { id: 3, url: 'https://via.placeholder.com/300', category: '房源实拍' },
      { id: 4, url: 'https://via.placeholder.com/300', category: '户型图' }
    ]
  },

  onTabChange(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  onCopyText(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.content,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    });
  },

  onDeleteMaterial(e) {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复',
      success: (res) => {
        if (res.confirm) wx.showToast({ title: '删除成功', icon: 'success' });
      }
    });
  },

  onUpload() {
    console.log('开始上传素材');
    
    // 选择图片或视频
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('选择媒体成功:', res);
        this.uploadToCloud(res.tempFiles[0]);
      },
      fail: (err) => {
        console.error('选择媒体失败:', err);
        wx.showToast({ title: '选择文件失败', icon: 'none' });
      }
    });
  },

  // 上传到云存储
  uploadToCloud(tempFile) {
    wx.showLoading({ title: '上传中...' });
    
    const fileName = `materials/${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
    
    wx.cloud.uploadFile({
      cloudPath: fileName,
      filePath: tempFile.tempFilePath,
      success: (res) => {
        console.log('上传成功:', res);
        this.saveMaterial(res.fileID);
      },
      fail: (err) => {
        console.error('上传失败:', err);
        wx.hideLoading();
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
    });
  },

  // 保存素材信息到数据库
  saveMaterial(fileID) {
    // 模拟保存到数据库
    setTimeout(() => {
      wx.hideLoading();
      
      // 更新本地数据
      const newMaterial = {
        id: Date.now(),
        url: fileID,
        category: '房源实拍',
        createTime: new Date().getMonth() + 1 + '-' + new Date().getDate()
      };
      
      this.setData({
        imageList: [newMaterial, ...this.data.imageList]
      });
      
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      });
    }, 1000);
  }
});