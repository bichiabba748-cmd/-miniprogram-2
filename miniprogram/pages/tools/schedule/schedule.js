Page({
  data: {
    scheduleList: [],
    showAddModal: false,
    showEditModal: false,
    editingSchedule: null,
    formData: {
      date: '',
      timeRange: '',
      theme: '',
      contentType: '',
      targetRole: '',
      notes: ''
    },
    contentTypeOptions: ['每日热点', '学区房专题', '房源讲解', '成交故事', '避坑科普'],
    targetRoleOptions: ['首购刚需', '改善换房', '投资客', '学区家长'],
    minDate: ''
  },

  onLoad() {
    this.initMinDate();
    this.loadSchedules();
    console.log('[直播排期] 页面加载完成');
  },

  initMinDate() {
    const today = new Date();
    const minDate = this.formatDate(today);
    this.setData({ minDate });
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = weekDays[date.getDay()];
    return `${month}月${day}日 ${weekDay}`;
  },

  loadSchedules() {
    const schedules = wx.getStorageSync('schedule_v1') || [];
    const sortedSchedules = schedules.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.setData({ scheduleList: sortedSchedules });
    console.log('[直播排期] 加载排期数据:', sortedSchedules.length, '条');
  },

  saveSchedules(schedules) {
    wx.setStorageSync('schedule_v1', schedules);
    this.loadSchedules();
  },

  onAddSchedule() {
    this.setData({
      showAddModal: true,
      formData: {
        date: this.formatDate(new Date()),
        timeRange: '20:00-21:00',
        theme: '',
        contentType: '每日热点',
        targetRole: '首购刚需',
        notes: ''
      }
    });
    console.log('[直播排期] 打开新增弹窗');
  },

  onEditSchedule(e) {
    const id = e.currentTarget.dataset.id;
    const schedule = this.data.scheduleList.find(s => s.id === id);
    if (schedule) {
      this.setData({
        showEditModal: true,
        editingSchedule: schedule,
        formData: {
          date: schedule.date,
          timeRange: schedule.timeRange,
          theme: schedule.theme,
          contentType: schedule.contentType,
          targetRole: schedule.targetRole,
          notes: schedule.notes || ''
        }
      });
      console.log('[直播排期] 打开编辑弹窗:', schedule.theme);
    }
  },

  onDeleteSchedule(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条排期吗？',
      success: (res) => {
        if (res.confirm) {
          const schedules = this.data.scheduleList.filter(s => s.id !== id);
          this.saveSchedules(schedules);
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
          });
          console.log('[直播排期] 删除排期:', id);
        }
      }
    });
  },

  onToggleComplete(e) {
    const id = e.currentTarget.dataset.id;
    const schedules = this.data.scheduleList.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'completed' ? 'pending' : 'completed' };
      }
      return s;
    });
    this.saveSchedules(schedules);
    const schedule = schedules.find(s => s.id === id);
    wx.showToast({
      title: schedule.status === 'completed' ? '已标记完成' : '已取消完成',
      icon: 'success',
      duration: 2000
    });
    console.log('[直播排期] 切换完成状态:', id, schedule.status);
  },

  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    });
  },

  onTimeRangeChange(e) {
    this.setData({
      'formData.timeRange': e.detail.value
    });
  },

  onThemeInput(e) {
    this.setData({
      'formData.theme': e.detail.value
    });
  },

  onContentTypeChange(e) {
    const index = e.detail.value;
    this.setData({
      'formData.contentType': this.data.contentTypeOptions[index]
    });
  },

  onTargetRoleChange(e) {
    const index = e.detail.value;
    this.setData({
      'formData.targetRole': this.data.targetRoleOptions[index]
    });
  },

  onNotesInput(e) {
    this.setData({
      'formData.notes': e.detail.value
    });
  },

  onSubmitAdd() {
    const { formData } = this.data;
    
    if (!formData.theme.trim()) {
      wx.showToast({
        title: '请输入直播主题',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const newSchedule = {
      id: 'schedule_' + Date.now(),
      date: formData.date,
      timeRange: formData.timeRange,
      theme: formData.theme.trim(),
      contentType: formData.contentType,
      targetRole: formData.targetRole,
      status: 'pending',
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString()
    };

    const schedules = [...this.data.scheduleList, newSchedule];
    this.saveSchedules(schedules);
    
    this.setData({ showAddModal: false });
    
    wx.showToast({
      title: '添加成功',
      icon: 'success',
      duration: 2000
    });
    
    console.log('[直播排期] 新增排期:', newSchedule.theme);
  },

  onSubmitEdit() {
    const { formData, editingSchedule } = this.data;
    
    if (!formData.theme.trim()) {
      wx.showToast({
        title: '请输入直播主题',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const schedules = this.data.scheduleList.map(s => {
      if (s.id === editingSchedule.id) {
        return {
          ...s,
          date: formData.date,
          timeRange: formData.timeRange,
          theme: formData.theme.trim(),
          contentType: formData.contentType,
          targetRole: formData.targetRole,
          notes: formData.notes.trim()
        };
      }
      return s;
    });

    this.saveSchedules(schedules);
    this.setData({ showEditModal: false, editingSchedule: null });
    
    wx.showToast({
      title: '修改成功',
      icon: 'success',
      duration: 2000
    });
    
    console.log('[直播排期] 编辑排期:', editingSchedule.id);
  },

  onCloseAddModal() {
    this.setData({ showAddModal: false });
  },

  onCloseEditModal() {
    this.setData({ showEditModal: false, editingSchedule: null });
  }
});