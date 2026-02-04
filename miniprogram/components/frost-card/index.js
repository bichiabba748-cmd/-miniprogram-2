Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    size: {
      type: String,
      value: 'medium'
    },
    showHeader: {
      type: Boolean,
      value: false
    },
    showHeaderRight: {
      type: Boolean,
      value: false
    },
    showFooter: {
      type: Boolean,
      value: false
    }
  },
  
  lifetimes: {
    attached: function() {
      // 组件初始化
    }
  }
});