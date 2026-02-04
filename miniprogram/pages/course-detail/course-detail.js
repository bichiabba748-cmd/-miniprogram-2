const app = getApp();
const { RoleManager } = require('../../utils/roleManager.js');
// 初始化云数据库
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    // 课程详情数据
    course: null,
    // 相关文章数据
    relatedArticle: null,
    // 会员状态（模拟）
    isMember: false,
    // 当前激活的Tab
    activeTab: 'intro',
    // 云开发环境配置
    envId: 'cloudbase-0gjqvewz98229914',
    // 加载状态
    loading: true,
    // 错误信息
    error: ''
  },

  onLoad(options) {
    // 获取课程ID
    const courseId = options.id || '';
    if (!courseId) {
      this.setData({
        loading: false,
        error: '课程ID不存在'
      });
      return;
    }
    
    // 获取课程详情
    this.getCourseDetail(courseId);
  },

  onShow() {
    // 更新用户身份
    this.updateUserIdentity();
  },

  // 更新用户身份
  updateUserIdentity() {
    const role = RoleManager.getCurrentRole();
    // 学员、主播、管理员都是会员
    const isMember = ['student', 'anchor', 'admin'].includes(role);
    this.setData({
      isMember: isMember
    });
  },

  // 获取课程详情
  getCourseDetail(courseId) {
    this.setData({ loading: true });
    
    wx.cloud.callFunction({
      name: 'get_course_detail',
      data: { id: courseId }
    }).then(res => {
      this.setData({ loading: false });
      
      if (res.result.code === 0 && res.result.data) {
        let courseData = res.result.data;
        this.setData({ course: courseData });
        
        // 检查是否有关联文章，没有则设置默认值
        if (courseData.relatedArticleId) {
          this.getRelatedArticle(courseData.relatedArticleId);
        } else {
          // 强制显示关联作业卡片，使用默认测试数据
          this.setData({
            relatedArticle: {
              _id: 'test-article-1',
              title: '全网爆火的“看房避坑”话术拆解',
              category: 'avoid',
              baitType: 'image'
            }
          });
        }
      } else {
        this.setData({ error: '课程不存在' });
        // 即使课程不存在，也显示测试关联作业卡片
        this.setData({
          relatedArticle: {
            _id: 'test-article-1',
            title: '全网爆火的“看房避坑”话术拆解',
            category: 'avoid',
            baitType: 'image'
          }
        });
      }
    }).catch(err => {
      this.setData({ 
        loading: false, 
        error: '获取课程失败' 
      });
      console.error('获取课程详情失败:', err);
      // 错误情况下也显示测试关联作业卡片
      this.setData({
        relatedArticle: {
          _id: 'test-article-1',
          title: '全网爆火的“看房避坑”话术拆解',
          category: 'avoid',
          baitType: 'image'
        }
      });
    });
  },

  // 获取关联文章
  getRelatedArticle(articleId) {
    db.collection('articles')
      .doc(articleId)
      .get()
      .then(res => {
        if (res.data) {
          this.setData({ relatedArticle: res.data });
        }
      })
      .catch(err => {
        console.error('获取关联文章失败:', err);
      });
  },

  // Tab切换
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 视频学习（会员）
  onLearnVideo() {
    const course = this.data.course;
    if (course && course.mediaUrl) {
      wx.showToast({ title: '跳转到视频号学习', icon: 'none' });
      // 实际实现时，这里可以跳转到视频号或其他视频平台
    } else {
      wx.showToast({ title: '暂无视频链接', icon: 'none' });
    }
  },

  // 加入计划（访客）
  onJoinPlan() {
    wx.navigateTo({ url: '/pages/join/join' });
  },

  // 跳转到关联文章
  onGoToArticle() {
    if (this.data.relatedArticle) {
      const articleId = this.data.relatedArticle._id;
      console.log('跳转到文章详情页，ID:', articleId);
      wx.navigateTo({ 
        url: `/pages/art-detail/art-detail?id=${articleId}`,
        success: () => {
          console.log('跳转成功');
        },
        fail: (err) => {
          console.error('跳转失败:', err);
          wx.showToast({ title: '跳转失败', icon: 'none' });
        }
      });
    } else {
      console.error('没有关联文章数据');
      wx.showToast({ title: '没有关联文章', icon: 'none' });
    }
  },

  // 收藏课程
  onCollect() {
    wx.showToast({ title: '收藏成功', icon: 'success' });
    // 实际实现时，这里可以调用云函数收藏课程
  },

  // 分享课程
  onShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 咨询客服
  onConsult() {
    wx.makePhoneCall({ phoneNumber: '13800138000' });
  },

  // 分享转发
  onShareAppMessage() {
    const course = this.data.course;
    return {
      title: course ? course.title : '星火计划课程',
      path: `/pages/course-detail/course-detail?id=${course ? course.id : ''}`,
      imageUrl: course ? course.coverUrl : ''
    };
  }
});
