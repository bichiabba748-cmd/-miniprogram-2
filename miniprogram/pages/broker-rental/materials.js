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
    wx.showToast({ title: '上传功能开发中', icon: 'none' });
  }
});