Component({
  properties: {
    role: {
      type: String,
      value: '',
      observer: function(newVal) {
        this.setData({
          roleText: this.getRoleText(newVal)
        });
      }
    }
  },
  
  data: {
    roleText: ''
  },
  
  lifetimes: {
    attached: function() {
      this.setData({
        roleText: this.getRoleText(this.data.role)
      });
    }
  },
  
  methods: {
    getRoleText: function(role) {
      const roleMap = {
        admin: '管理员',
        broker: '经纪人',
        anchor: '主播',
        student: '学员',
        tenant: '租客',
        visitor: '访客'
      };
      return roleMap[role] || '';
    }
  }
});