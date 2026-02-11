const app = getApp();
// 🚩 引入宪法
const { RoleManager } = require('../../utils/roleManager.js');
const cloud = require('../../utils/cloud.js');
// 初始化云数据库
const db = wx.cloud.database();
const _ = db.command;

// 收藏数据缓存键
const COLLECTION_CACHE_KEY = 'user_collections_cache';

// 本地收藏数据管理
const CollectionManager = {
  // 获取本地收藏数据
  getCollections() {
    try {
      const collections = wx.getStorageSync(COLLECTION_CACHE_KEY);
      return collections || [];
    } catch (error) {
      console.error('获取本地收藏数据失败:', error);
      return [];
    }
  },
  
  // 保存本地收藏数据
  saveCollections(collections) {
    try {
      wx.setStorageSync(COLLECTION_CACHE_KEY, collections);
      return true;
    } catch (error) {
      console.error('保存本地收藏数据失败:', error);
      return false;
    }
  },
  
  // 添加收藏
  addCollection(articleId, articleTitle) {
    const collections = this.getCollections();
    const existingIndex = collections.findIndex(item => item.articleId === articleId);
    
    if (existingIndex === -1) {
      collections.push({
        articleId: articleId,
        articleTitle: articleTitle,
        status: 'collected',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      this.saveCollections(collections);
      return true;
    }
    return false;
  },
  
  // 移除收藏
  removeCollection(articleId) {
    const collections = this.getCollections();
    const filteredCollections = collections.filter(item => item.articleId !== articleId);
    this.saveCollections(filteredCollections);
    return filteredCollections.length !== collections.length;
  },
  
  // 检查是否已收藏
  isCollected(articleId) {
    const collections = this.getCollections();
    return collections.some(item => item.articleId === articleId);
  }
};

Page({
  data: {
    userRole: 'visitor',
    roleName: '外部访客',
    currentTab: '全部',
    searchQuery: '',
    scripts: [],
    filteredScripts: [],
    totalArticles: 0
  },

  onShow() {
    this.updateIdentity();
    this.getArticles();
    
    if (app.globalData.tempSearchUser) {
      this.setData({ searchQuery: app.globalData.tempSearchUser });
      this.onSearchInput({ detail: { value: app.globalData.tempSearchUser } });
      app.globalData.tempSearchUser = '';
    }
  },

  // 从云数据库获取文章数据
  getArticles() {
    cloud.call('getArticles', {
      category: this.data.currentTab === '全部' ? 'all' : this.data.currentTab,
      page: 1,
      pageSize: 50
    }, {
      loading: true,
      title: '加载文案中...',
      showError: true
    }).then(data => {
      // cloud.call 返回的是 res.result.data，直接是数据对象
      if (data && data.list && data.list.length > 0) {
        const total = data.total || 0;
        
        const scripts = data.list.map((item, index) => ({
          id: item._id,
          code: `XH-${String(index + 1).padStart(3, '0')}`,
          title: item.title,
          stats: { 
            leads: item.stats?.leads || 0, 
            likes: item.stats?.copies || 0, 
            heat: item.stats?.views || 0 
          },
          sourceType: item.securityLevel === '绝密' || item.securityLevel === '内部' ? 'internal' : 'public',
          securityLevel: item.securityLevel || '内部',
          category: item.category || '获客',
          isCollected: false,
          fullContent: item.content?.script || '点击查看完整内容',
          analysis: item.analysis || { hook: '', trust: '', action: '' },
          content_url: item.media?.video || ''
        }));
          
        this.setData({
          scripts: scripts,
          totalArticles: total
        });
        
        this.getUserCollectionStatus(scripts);
      } else {
        this.setData({
          scripts: [],
          filteredScripts: [],
          totalArticles: 0
        });
      }
    });
  },

  // 获取用户收藏状态
  getUserCollectionStatus(scripts) {
    console.log('获取用户收藏状态:', scripts.length);
    
    // 使用本地收藏管理
    const updatedScripts = scripts.map(script => ({
      ...script,
      isCollected: CollectionManager.isCollected(script.id)
    }));
    
    console.log('更新后的脚本数量:', updatedScripts.length);
    
    // 直接设置数据，确保 filteredScripts 被正确更新
    this.setData({
      scripts: updatedScripts,
      filteredScripts: updatedScripts
    }, () => {
      console.log('数据更新完成');
      console.log('scripts 长度:', this.data.scripts.length);
      console.log('filteredScripts 长度:', this.data.filteredScripts.length);
      
      // 强制刷新页面，确保数据显示
      this.setData({});
      console.log('强制刷新页面');
    });
    
    wx.hideLoading();
  },

  // 🚩 统一身份更新
  updateIdentity() {
    const roleCode = RoleManager.getCurrentRole();
    const roleName = RoleManager.getRoleDisplayText();
    this.setData({
      userRole: roleCode,
      roleName: roleName
    });
  },

  // =========================
  // 交互逻辑
  // =========================

  // 1. 拦截贡献 (只有内部能提)
  goToContribute() {
    // 🔒 权限锁
    if (!RoleManager.hasPermission('canContributeArt')) {
      wx.showToast({ title: '仅限实战主播提报脚本', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/contribute/contribute' });
  },

  // 2. 拦截复制 (只有学员及以上能复制)
  onCopy(e) {
    // 🔒 权限锁：访客不能复制
    if (!RoleManager.hasPermission('canCopyArt')) {
      wx.showModal({
        title: '权益受限',
        content: '加入星火计划后，即可解锁文案一键复制权限。',
        confirmText: '去解锁',
        confirmColor: '#D4B083',
        success: (res) => {
          if (res.confirm) wx.navigateTo({ url: '/pages/join/join' });
        }
      });
      return;
    }

    const text = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '战术脚本已复制' })
    });
  },

  onSearchInput(e) {
    const val = e.detail.value.toLowerCase();
    const filtered = this.data.scripts.filter(s => 
      s.title.toLowerCase().includes(val) || 
      (s.author && s.author.name && s.author.name.toLowerCase().includes(val))
    );
    this.setData({ filteredScripts: filtered, searchQuery: val });
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    
    this.setData({ currentTab: tab });
    
    // 重新获取数据
    this.getArticles();
  },

  onDetailTap(e) {
    // 🔒 权限锁：访客不能查看详情
    if (!RoleManager.hasPermission('canViewArtDetail')) {
      wx.showModal({
        title: '权益受限',
        content: '加入星火计划后，即可解锁完整档案权限。',
        confirmText: '去解锁',
        confirmColor: '#D4B083',
        success: (res) => {
          if (res.confirm) wx.navigateTo({ url: '/pages/join/join' });
        }
      });
      return;
    }
    // 内部人员可以查看详情
    this.goToDetail(e);
  },

  onCollect(e) {
    // 🔒 权限锁：访客不能收藏
    if (!RoleManager.hasPermission('canCollectArt')) {
      wx.showToast({ title: '权益受限', icon: 'none' });
      wx.showModal({
        title: '权益受限',
        content: '加入星火计划后，即可解锁收藏权限。',
        confirmText: '去解锁',
        confirmColor: '#D4B083',
        success: (res) => {
          if (res.confirm) wx.navigateTo({ url: '/pages/join/join' });
        }
      });
      return;
    }
    
    const id = e.currentTarget.dataset.id;
    const script = this.data.scripts.find(s => s.id === id);
    
    if (!script) {
      wx.showToast({ title: '找不到对应文案', icon: 'none' });
      return;
    }
    
    const currentCollected = script.isCollected;
    
    // 显示加载状态
    wx.showLoading({ title: '操作中...' });
    
    try {
      if (!currentCollected) {
        // 添加收藏
        const success = CollectionManager.addCollection(id, script.title);
        if (success) {
          // 更新本地数据
          const scripts = this.data.scripts.map(s => {
            if (s.id === id) s.isCollected = true;
            return s;
          });
          this.setData({ scripts, filteredScripts: scripts });
        } else {
          // 已经收藏过了
        }
      } else {
        // 取消收藏
        const success = CollectionManager.removeCollection(id);
        if (success) {
          // 更新本地数据
          const scripts = this.data.scripts.map(s => {
            if (s.id === id) s.isCollected = false;
            return s;
          });
          this.setData({ scripts, filteredScripts: scripts });
        } else {
          // 取消收藏失败
        }
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
      return;
    }
    
    // 隐藏加载状态
    wx.hideLoading();
    
    // 显示操作结果
    if (!currentCollected) {
      wx.showToast({ title: '收藏成功', icon: 'success' });
    } else {
      wx.showToast({ title: '取消收藏成功', icon: 'success' });
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/art-detail/art-detail?id=${id}` });
  },
  
  goToJoin() { wx.navigateTo({ url: '/pages/join/join' }); },

  // 跳转到已收藏页面
  goToCollections() {
    wx.navigateTo({ url: '/pages/collections/collections' });
  }
})