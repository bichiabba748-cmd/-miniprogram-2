Component({
  properties: {
    title: {
      type: String,
      value: '暂无数据'
    },
    desc: {
      type: String,
      value: ''
    },
    icon: {
      type: String,
      value: ''
    },
    actionText: {
      type: String,
      value: ''
    }
  },
  
  methods: {
    handleAction: function() {
      this.triggerEvent('action', {
        timestamp: Date.now()
      });
    }
  }
});