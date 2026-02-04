// 帮助页面逻辑
Page({
  data: {
    // 常见问题
    faqList: [
      {
        question: '如何访问管理工具？',
        answer: '在小程序中点击5次头像，输入密码进入admin界面，然后点击"管理工具"模块即可访问。'
      },
      {
        question: '手动备份需要多长时间？',
        answer: '手动备份通常需要1-2秒时间，具体时间取决于项目大小。'
      },
      {
        question: '健康检查的评分标准是什么？',
        answer: '健康检查评分范围为0-100分，95分以上为优秀，80-94分为良好，60-79分为一般，60分以下为异常。'
      },
      {
        question: '如何查看云函数的详细状态？',
        answer: '在管理工具首页点击"云函数状态"模块中的"详情"按钮，即可查看所有云函数的详细运行状态。'
      },
      {
        question: '未使用的组件是否可以删除？',
        answer: '是的，未使用的组件可以安全删除，这有助于减少项目体积和提高加载速度。'
      },
      {
        question: '如何导出项目报告？',
        answer: '在相应的详情页面（如进度详情、健康详情）底部点击"导出报告"按钮，系统会生成并下载相应的报告。'
      },
      {
        question: '自动备份的频率可以调整吗？',
        answer: '可以，在备份管理页面的设置中，您可以调整自动备份的频率，包括每天、每周、每两周或每月。'
      },
      {
        question: '如何优化云函数的性能？',
        answer: '可以通过以下方式优化云函数性能：1. 减少函数执行时间，2. 优化内存使用，3. 更新依赖包，4. 合并相似功能的云函数。'
      }
    ],
    
    // 展开的FAQ索引
    expandedIndex: -1
  },

  // 页面加载
  onLoad: function(options) {
    // 页面加载逻辑
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },

  // 切换FAQ展开/折叠
  toggleFaq: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      expandedIndex: this.data.expandedIndex === index ? -1 : index
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