const app = getApp();
const { RoleManager } = require('../../../utils/roleManager.js');
const cloud = require('../../../utils/cloud.js');

// 初始化云数据库
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    articleList: [],
    filteredList: [],
    currentTab: 'all',
    searchQuery: '',
    currentPage: 1,
    pageSize: 10,
    total: 0,
    editingArticle: null,
    showEditModal: false,
    categories: ['全部', '口播', '探盘', '避坑', 'IP人设', '政策解读', '成交技巧', '房源介绍', '学区分析', '税费计算'],
    securityLevels: ['全部', '公开', '内部', '绝密'],
    statuses: ['全部', '已发布', '待审核', '草稿']
  },

  onLoad() {
    this.fetchArticles();
  },

  onShow() {
    if (this.data.articleList.length === 0) {
      this.fetchArticles();
    }
  },

  fetchArticles() {
    // 使用云函数获取数据，与art.js保持一致
    cloud.call('getArticles', {
      category: this.data.currentTab === 'all' ? 'all' : this.data.currentTab,
      page: this.data.currentPage,
      pageSize: this.data.pageSize
    }, {
      loadingTitle: '加载中...'
    }).then(data => {
      console.log('获取到的文案数据:', data);
      
      if (data && data.list) {
        this.setData({
          articleList: data.list,
          filteredList: data.list,
          total: data.total
        });
      }
    }).catch(err => {
      console.error('获取文案列表失败:', err);
    });
  },

  getTotalCount() {
    let query = db.collection('articles');
    
    if (this.data.currentTab !== 'all') {
      query = query.where({ category: this.data.currentTab });
    }
    
    if (this.data.searchQuery) {
      query = query.where({
        title: db.RegExp({
          regexp: this.data.searchQuery,
          options: 'i'
        })
      });
    }
    
    query.count()
      .then(res => {
        this.setData({ total: res.total });
      })
      .catch(err => {
        console.error('获取总数失败:', err);
      });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ 
      currentTab: tab,
      currentPage: 1
    });
    this.fetchArticles();
    this.getTotalCount();
  },

  onSearchInput(e) {
    const query = e.detail.value;
    this.setData({ 
      searchQuery: query,
      currentPage: 1
    });
    
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    
    this.searchTimer = setTimeout(() => {
      this.fetchArticles();
      this.getTotalCount();
    }, 500);
  },

  onEdit(e) {
    const article = e.currentTarget.dataset.article;
    // 清理空白字符
    if (article.content && article.content.script) {
      article.content.script = article.content.script.trim();
    }
    if (article.analysis) {
      if (article.analysis.hook) article.analysis.hook = article.analysis.hook.trim();
      if (article.analysis.trust) article.analysis.trust = article.analysis.trust.trim();
      if (article.analysis.action) article.analysis.action = article.analysis.action.trim();
    }
    this.setData({
      editingArticle: article,
      showEditModal: true
    });
  },

  onCloseModal() {
    this.setData({
      editingArticle: null,
      showEditModal: false
    });
  },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`editingArticle.${field}`]: value
    });
  },

  onSaveArticle() {
    const article = this.data.editingArticle;
    
    if (!article.title || !article.content || !article.content.script) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '保存中...' });
    
    const updateData = {
      title: article.title,
      category: article.category,
      securityLevel: article.securityLevel,
      content: article.content,
      analysis: article.analysis,
      media: article.media,
      tags: article.tags || [],
      status: article.status || 'published',
      updatedAt: db.serverDate()
    };
    
    if (article._id) {
      db.collection('articles')
        .doc(article._id)
        .update({
          data: updateData
        })
        .then(() => {
          wx.hideLoading();
          wx.showToast({ title: '保存成功', icon: 'success' });
          this.onCloseModal();
          this.fetchArticles();
        })
        .catch(err => {
          console.error('更新文案失败:', err);
          wx.hideLoading();
          wx.showToast({ title: '保存失败', icon: 'none' });
        });
    } else {
      db.collection('articles')
        .add({
          data: {
            ...updateData,
            id: Date.now(),
            createdAt: db.serverDate(),
            author: {
              _openid: app.globalData.userOpenid || 'admin',
              nickname: '管理员'
            },
            stats: {
              leads: 0,
              views: 0,
              copies: 0
            }
          }
        })
        .then(() => {
          wx.hideLoading();
          wx.showToast({ title: '创建成功', icon: 'success' });
          this.onCloseModal();
          this.fetchArticles();
          this.getTotalCount();
        })
        .catch(err => {
          console.error('创建文案失败:', err);
          wx.hideLoading();
          wx.showToast({ title: '创建失败', icon: 'none' });
        });
    }
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条文案吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          
          db.collection('articles')
            .doc(id)
            .remove()
            .then(() => {
              wx.hideLoading();
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.fetchArticles();
              this.getTotalCount();
            })
            .catch(err => {
              console.error('删除文案失败:', err);
              wx.hideLoading();
              wx.showToast({ title: '删除失败', icon: 'none' });
            });
        }
      }
    });
  },

  onAnalyze(e) {
    const article = e.currentTarget.dataset.article;
    
    if (!article.content || !article.content.script) {
      wx.showToast({ title: '文案内容为空，无法拆解', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: 'AI拆解中...' });
    
    wx.cloud.callFunction({
      name: 'analyzeArticle',
      data: {
        content: article.content.script
      }
    })
    .then(res => {
      wx.hideLoading();
      
      if (res.result.success) {
        const analysis = res.result.data.analysis;
        
        this.setData({
          [`editingArticle.analysis`]: analysis
        });
        
        wx.showToast({ title: '拆解成功', icon: 'success' });
      } else {
        wx.showToast({ title: res.result.message || '拆解失败', icon: 'none' });
      }
    })
    .catch(err => {
      console.error('AI拆解失败:', err);
      wx.hideLoading();
      wx.showToast({ title: '拆解失败，请重试', icon: 'none' });
    });
  },

  onPageChange(e) {
    const page = e.currentTarget.dataset.current;
    this.setData({ currentPage: page });
    this.fetchArticles();
  },

  onAddNew() {
    this.setData({
      editingArticle: {
        title: '',
        category: '口播',
        securityLevel: '公开',
        content: {
          script: '',
          duration: '',
          scenes: []
        },
        analysis: {
          hook: '',
          trust: '',
          action: ''
        },
        media: {
          cover: '',
          video: ''
        },
        tags: [],
        status: 'published'
      },
      showEditModal: true
    });
  },

  onViewFull(e) {
    const article = e.currentTarget.dataset.article;
    
    wx.showModal({
      title: article.title,
      content: article.content?.script || '暂无内容',
      showCancel: false,
      confirmText: '关闭'
    });
  }
})
