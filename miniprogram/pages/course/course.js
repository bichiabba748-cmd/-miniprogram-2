const app = getApp();
const { RoleManager } = require('../../utils/roleManager.js');

Page({
  data: {
    userRole: 'visitor',
    roleName: '外部访客',
    currentTab: '全部',
    categories: ['全部', 'AI应用', '文案改写', '文案创作', '视频剪辑', '直播运营', '账号起号', 'IP打造', '社区型账号打造'],
    courses: [],
    filteredCourses: []
  },

  onShow() {
    this.updateIdentity();
    this.loadCourses();
  },

  updateIdentity() {
    const roleCode = RoleManager.getCurrentRole();
    const roleInfo = RoleManager.getRoleInfo();
    this.setData({
      userRole: roleCode,
      roleName: roleInfo.name
    });
  },

  loadCourses() {
    wx.showLoading({ title: '加载中...' });

    wx.cloud.callFunction({
      name: 'get_courses'
    }).then(res => {
      wx.hideLoading();
      if (res.result.code === 0) {
        const courses = res.result.data.map(course => ({
          ...course,
          view: this.formatViewCount(course.view)
        }));
        this.setData({ 
          courses,
          filteredCourses: courses
        });
      } else {
        wx.showToast({ title: res.result.message, icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  formatViewCount(view) {
    if (view >= 10000) {
      return (view / 10000).toFixed(1) + 'w';
    }
    return view;
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id || '101';
    wx.navigateTo({ url: `/pages/course-detail/course-detail?id=${id}` });
  },

  onBannerTap() {
    this.goToDetail({ currentTarget: { dataset: { id: 'top' } } });
  },

  onCategoryTap(e) {
    const cat = e.currentTarget.dataset.id;
    wx.showToast({ title: `进入${cat}专区`, icon: 'none' });
  },
  
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    
    let filtered = this.data.courses;
    
    if (tab !== '全部') {
      filtered = this.data.courses.filter(course => course.category === tab);
    }
    
    this.setData({ 
      filteredCourses: filtered,
      currentTab: tab 
    });
  },

  onViewAll() {
    wx.showToast({ title: '已展示全部课程', icon: 'none' });
  },

  switchRole() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },

  onSearchInput(e) {
    const keyword = e.detail.value;
    console.log('搜索关键词:', keyword);
  }
})
