const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    userRole: 'admin',
    userInfo: null,
    currentPage: 'dashboard',
    scriptTemplates: [],
    cloudStatus: 'ready',
    selectedCategory: 'all',
    showCreateModal: false,
    newScript: {
      name: '',
      content: '',
      category: 'common',
      tags: ''
    }
  },

  onLoad() {
    this.updateIdentity();
    this.checkCloudStatus();
    this.loadDashboardData();
  },

  onShow() {
    this.updateIdentity();
  },

  updateIdentity() {
    const role = app.globalData.userRole || 'admin';
    this.setData({ userRole: role });
  },

  checkCloudStatus() {
    this.setData({ cloudStatus: 'checking' });
    wx.cloud.callFunction({
      name: 'adminTools',
      data: { action: 'checkStatus' }
    }).then(res => {
      this.setData({ cloudStatus: res.result?.success ? 'ready' : 'error' });
    }).catch(err => {
      console.error('云函数调用失败:', err);
      this.setData({ cloudStatus: 'error' });
    });
  },

  loadDashboardData() {
    wx.showLoading({ title: '加载中...' });
    wx.cloud.callFunction({
      name: 'getAdminDashboard',
      data: {}
    }).then(res => {
      wx.hideLoading();
      if (res.result.success) {
        this.setData({ dashboardData: res.result.data });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('获取仪表盘数据失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  onMenuTap(e) {
    const page = e.currentTarget.dataset.page;
    this.setData({ currentPage: page });

    if (page === 'script-manage') {
      this.loadScriptTemplates();
    }
  },

  loadScriptTemplates() {
    wx.showLoading({ title: '加载脚本模板...' });
    wx.cloud.callFunction({
      name: 'getScriptTemplates',
      data: { page: 1, pageSize: 50 }
    }).then(res => {
      wx.hideLoading();
      if (res.result.success) {
        this.setData({ scriptTemplates: res.result.templates });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('获取脚本模板失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  openCreateModal() {
    this.setData({ showCreateModal: true });
  },

  closeCreateModal() {
    this.setData({ showCreateModal: false });
  },

  onFormSubmit(e) {
    const formData = e.detail.value;
    const newScript = {
      name: formData.name,
      content: formData.content,
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()),
      createdAt: new Date()
    };

    wx.showLoading({ title: '创建中...' });
    wx.cloud.callFunction({
      name: 'adminTools',
      data: { action: 'createScript', script: newScript }
    }).then(res => {
      wx.hideLoading();
      if (res.result.success) {
        this.setData({ showCreateModal: false });
        this.loadScriptTemplates();
        wx.showToast({ title: '创建成功', icon: 'success' });
      } else {
        wx.showToast({ title: '创建失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('创建脚本失败:', err);
      wx.showToast({ title: '创建失败', icon: 'none' });
    });
  },

  onScriptTap(e) {
    const script = e.currentTarget.dataset.script;
    wx.navigateTo({
      url: `/pages/admin/script-manage/script-manage?scriptId=${script._id}`
    });
  },

  onCategoryChange(e) {
    const category = e.detail.value;
    this.setData({ selectedCategory: category });
  },

  onDeleteScript(e) {
    const scriptId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除脚本',
      content: '确定要删除这个脚本模板吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          wx.cloud.callFunction({
            name: 'adminTools',
            data: { action: 'deleteScript', scriptId }
          }).then(res => {
            wx.hideLoading();
            if (res.result.success) {
              this.loadScriptTemplates();
              wx.showToast({ title: '删除成功', icon: 'success' });
            } else {
              wx.showToast({ title: '删除失败', icon: 'none' });
            }
          }).catch(err => {
            wx.hideLoading();
            console.error('删除脚本失败:', err);
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  goToUserDetail(e) {
    const userId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin/user-detail/user-detail?userId=${userId}`
    });
  },

  goToScriptManage() {
    wx.navigateTo({
      url: '/pages/admin/script-manage/script-manage'
    });
  },

  goToArtManage() {
    wx.navigateTo({
      url: '/pages/admin/art-manage/art-manage'
    });
  },

  goToCourseManage() {
    wx.navigateTo({
      url: '/pages/admin/course-manage/course-manage'
    });
  },

  goToStoreManage() {
    wx.navigateTo({
      url: '/pages/admin/store-manage/store-manage'
    });
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/admin/settings/settings'
    });
  },

  goToHelp() {
    wx.navigateTo({
      url: '/pages/admin/tools/help/help'
    });
  }
});