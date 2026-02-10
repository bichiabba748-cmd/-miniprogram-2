const app = getApp();
const { RoleManager } = require('../../utils/roleManager.js');
const cloud = require('../../utils/cloud.js');

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
    cloud.call('get_courses', {}, {
      loading: true,
      title: '加载课程中...',
      showError: true
    }).then(res => {
      if (res.code === 0) {
        const courses = res.data.map(course => ({
          ...course,
          view: this.formatViewCount(course.view)
        }));
        this.setData({ 
          courses,
          filteredCourses: courses
        });
      }
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
