const app = getApp();
const { RoleManager } = require('../../utils/roleManager.js');
// 初始化云数据库
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    // 文章数据
    article: null,
    // 会员状态
    isMember: false,
    // 加载状态
    loading: true,
    // 错误信息
    error: '',
    // 是否为诱饵文章
    isBait: false,
    // 模拟测试：默认设为访客，可看到模糊效果
    testMode: false
  },

  onLoad(options) {
    // 获取文章ID
    const articleId = options.id || '';
    if (!articleId) {
      this.setData({
        loading: false,
        error: '文章ID不存在'
      });
      return;
    }
    
    // 获取文章详情
    this.getArticleDetail(articleId);
    // 更新用户身份
    this.updateUserIdentity();
  },

  onShow() {
    // 更新用户身份
    this.updateUserIdentity();
  },

  // 更新用户身份
  updateUserIdentity() {
    const role = RoleManager.getCurrentRole();
    // 学员、主播、管理员、经纪人都是会员
    const isMember = ['student', 'anchor', 'admin', 'broker'].includes(role);
    this.setData({
      isMember: isMember
    });
  },

  // 获取文章详情
  getArticleDetail(articleId) {
    this.setData({ loading: true });
    
    db.collection('articles')
      .doc(articleId)
      .get()
      .then(res => {
        this.setData({ loading: false });
        
        if (res.data) {
          let articleData = res.data;
          // 检查是否为诱饵文章
          const isBait = articleData.category === 'bait';
          
          // 处理content字段：如果是对象，提取script；如果是字符串，直接使用
          let contentText = articleData.content;
          if (typeof articleData.content === 'object' && articleData.content.script) {
            contentText = articleData.content.script;
          }
          
          // 确保analysis字段存在
          const analysis = articleData.analysis || {
            hook: '暂无分析',
            trust: '暂无分析',
            action: '暂无分析'
          };
          
          this.setData({
            article: {
              ...articleData,
              content: contentText,
              analysis: analysis
            },
            isBait: isBait,
            // 添加计算字段
            articleCode: articleData._id.slice(0, 6).toUpperCase(),
            articleStats: articleData.stats || { leads: 0, views: 0, copies: 0 }
          });
        } else {
          this.setData({ 
            error: '文章不存在',
            // 默认创建测试数据
            article: {
              _id: articleId,
              title: '测试文章：2026天津学区地图高清版',
              category: '普通',
              securityLevel: '公开',
              content: '这是测试文章的内容，用于演示诱饵拦截功能。',
              stats: { leads: 0, views: 0, copies: 0 },
              analysis: {
                hook: '测试钩子',
                trust: '测试信任构建',
                action: '测试行动召唤'
              }
            },
            isBait: false,
            articleCode: articleId.slice(0, 6).toUpperCase(),
            articleStats: { leads: 0, views: 0, copies: 0 }
          });
        }
      })
      .catch(err => {
        this.setData({ 
          loading: false, 
          error: '获取文章失败',
          // 错误情况下也显示测试数据
          article: {
            _id: articleId,
            title: '测试文章：2026天津学区地图高清版',
            category: '普通',
            securityLevel: '公开',
            content: '这是测试文章的内容，用于演示诱饵拦截功能。',
            stats: { leads: 0, views: 0, copies: 0 },
            analysis: {
              hook: '测试钩子',
              trust: '测试信任构建',
              action: '测试行动召唤'
            }
          },
          isBait: false,
          articleCode: articleId.slice(0, 6).toUpperCase(),
          articleStats: { leads: 0, views: 0, copies: 0 }
        });
        console.error('获取文章详情失败:', err);
      });
  },

  // 一键复制朋友圈文案
  onCopyShare() {
    if (this.data.article && this.data.article.shareCopy) {
      wx.setClipboardData({
        data: this.data.article.shareCopy,
        success: () => {
          wx.showToast({ title: '复制成功', icon: 'success' });
        },
        fail: () => {
          wx.showToast({ title: '复制失败', icon: 'none' });
        }
      });
    }
  },

  // 在线咨询
  onContact() {
    wx.showToast({ title: '在线咨询功能开发中', icon: 'none' });
  },

  // 免费通话
  onCallPhone() {
    const phoneNumber = this.data.article && this.data.article.ownerPhone || '022-88888888';
    wx.makePhoneCall({
      phoneNumber: phoneNumber,
      fail: () => {
        wx.showToast({ title: '拨打电话失败', icon: 'none' });
      }
    });
  },

  // 测试按钮：切换会员状态（用于演示）
  onTestToggle() {
    this.setData({
      isMember: !this.data.isMember,
      testMode: true
    });
    wx.showToast({
      title: this.data.isMember ? '已切换为会员' : '已切换为访客',
      icon: 'none'
    });
  }
});