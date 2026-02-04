Component({
  properties: {
    level: {
      type: String,
      value: '',
      observer: function(newVal) {
        this.setData({
          levelText: this.getLevelText(newVal)
        });
      }
    }
  },
  
  data: {
    levelText: ''
  },
  
  lifetimes: {
    attached: function() {
      this.setData({
        levelText: this.getLevelText(this.data.level)
      });
    }
  },
  
  methods: {
    getLevelText: function(level) {
      const levelMap = {
        secret: '绝密',
        internal: '内部',
        public: '公开'
      };
      return levelMap[level] || '';
    }
  }
});