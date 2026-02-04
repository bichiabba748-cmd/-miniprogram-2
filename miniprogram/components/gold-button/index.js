Component({
  properties: {
    text: {
      type: String,
      value: '按钮'
    },
    type: {
      type: String,
      value: 'primary'
    },
    size: {
      type: String,
      value: 'medium'
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },
  
  methods: {
    handleTap: function() {
      if (this.data.disabled) return;
      
      this.triggerEvent('tap', {
        timestamp: Date.now()
      });
    }
  }
});