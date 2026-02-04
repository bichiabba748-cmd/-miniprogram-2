Page({
  data: {
    formData: {
      title: '',
      category: '获客', // 默认选中
      leads: '',
      views: '',
      content: ''
    },
    contentLen: 0
  },

  // 输入监听
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    let value = e.detail.value;
    
    // 更新数据
    this.setData({
      [`formData.${field}`]: value
    });

    // 如果是正文，更新字数
    if (field === 'content') {
      this.setData({ contentLen: value.length });
    }
  },

  // 类型选择
  onSelectType(e) {
    this.setData({
      'formData.category': e.currentTarget.dataset.type
    });
  },

  // 提交审核
  onSubmit() {
    const { title, leads, views, content } = this.data.formData;

    // 1. 简单校验
    if (!title || !content) {
      wx.showToast({ title: '请填写完整脚本信息', icon: 'none' });
      return;
    }
    if (!leads && !views) {
      wx.showToast({ title: '请至少填写一项战绩数据', icon: 'none' });
      return;
    }

    // 2. 模拟提交
    wx.showLoading({ title: '提交中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 3. 成功反馈 (强调审核逻辑)
      wx.showModal({
        title: '提交成功',
        content: '脚本已进入【管理员审核池】。\n审核通过后将点亮您的贡献勋章。',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#ff9a00',
        success: () => {
          // 返回上一页
          wx.navigateBack();
        }
      });
    }, 1500);
  }
})