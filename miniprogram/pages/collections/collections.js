const app = getApp();
const { RoleManager } = require('../../utils/roleManager.js');

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
    activeTab: 'collected', // collected | shooting
    collections: [],
    loading: true,
    error: ''
  },

  onLoad(options) {
    this.checkPermission();
    
    // 检查是否有tab参数
    if (options && options.tab) {
      this.setData({ activeTab: options.tab });
    }
    
    this.loadCollections();
  },

  onShow() {
    this.loadCollections();
  },

  // 检查权限
  checkPermission() {
    if (!RoleManager.hasPermission('canCollectArt')) {
      wx.showModal({
        title: '权限不足',
        content: '您没有收藏权限，请先加入星火计划',
        confirmText: '去加入',
        confirmColor: '#D4B083',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/join/join' });
          } else {
            wx.navigateBack();
          }
        }
      });
    }
  },

  // 加载收藏列表
  loadCollections() {
    this.setData({ loading: true });
    
    try {
      // 从本地缓存获取收藏数据
      const collections = CollectionManager.getCollections();
      
      // 根据标签筛选
      const filteredCollections = this.data.activeTab 
        ? collections.filter(item => item.status === this.data.activeTab)
        : collections;
      
      this.setData({
        collections: filteredCollections,
        loading: false,
        error: ''
      });
    } catch (error) {
      console.error('加载收藏列表失败:', error);
      this.setData({ 
        loading: false, 
        error: '加载失败',
        collections: [] 
      });
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
    }
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.loadCollections();
  },

  // 加入待拍摄
  addToShooting(e) {
    const collectionId = e.currentTarget.dataset.id;
    
    wx.showLoading({ title: '操作中...' });
    
    try {
      // 获取当前收藏数据
      const collections = CollectionManager.getCollections();
      const collectionItem = collections.find(item => item.articleId === collectionId);
      
      if (collectionItem) {
        // 更新状态为待拍摄
        collectionItem.status = 'shooting';
        collectionItem.updatedAt = new Date().toISOString();
        
        // 保存更新后的数据
        CollectionManager.saveCollections(collections);
        
        wx.hideLoading();
        wx.showToast({ title: '已加入待拍摄', icon: 'success' });
        // 重新加载收藏列表
        this.loadCollections();
      } else {
        wx.hideLoading();
        wx.showToast({ title: '操作失败', icon: 'none' });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('加入待拍摄失败:', error);
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  // 取消收藏
  removeCollection(e) {
    const collectionId = e.currentTarget.dataset.id;
    const articleId = e.currentTarget.dataset.articleId;
    
    wx.showModal({
      title: '确认取消收藏',
      content: '确定要取消收藏这篇文案吗？',
      confirmText: '确定',
      cancelText: '取消',
      confirmColor: '#D4B083',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '操作中...' });
          
          try {
            // 使用本地存储取消收藏
            const success = CollectionManager.removeCollection(articleId);
            wx.hideLoading();
            
            if (success) {
              wx.showToast({ title: '取消收藏成功', icon: 'success' });
              // 重新加载收藏列表
              this.loadCollections();
            } else {
              wx.showToast({ title: '取消收藏失败', icon: 'none' });
            }
          } catch (error) {
            wx.hideLoading();
            console.error('取消收藏失败:', error);
            wx.showToast({ title: '操作失败，请重试', icon: 'none' });
          }
        }
      }
    });
  },



  // 从待拍摄移除
  removeFromShooting(e) {
    const collectionId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认移除',
      content: '确定要从待拍摄列表中移除这篇文案吗？',
      confirmText: '确定',
      cancelText: '取消',
      confirmColor: '#D4B083',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '操作中...' });
          
          try {
            // 获取当前收藏数据
            const collections = CollectionManager.getCollections();
            const collectionItem = collections.find(item => item.articleId === collectionId);
            
            if (collectionItem) {
              // 更新状态为已收藏
              collectionItem.status = 'collected';
              collectionItem.updatedAt = new Date().toISOString();
              
              // 保存更新后的数据
              CollectionManager.saveCollections(collections);
              
              wx.hideLoading();
              wx.showToast({ title: '移除成功', icon: 'success' });
              // 重新加载收藏列表
              this.loadCollections();
            } else {
              wx.hideLoading();
              wx.showToast({ title: '操作失败', icon: 'none' });
            }
          } catch (error) {
            wx.hideLoading();
            console.error('移除失败:', error);
            wx.showToast({ title: '操作失败，请重试', icon: 'none' });
          }
        }
      }
    });
  },

  // 跳转到文案详情
  goToDetail(e) {
    const articleId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/art-detail/art-detail?id=${articleId}` });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 切换到已收藏标签
  switchToCollected() {
    console.log('点击了去已收藏按钮');
    this.setData({ activeTab: 'collected' });
    this.loadCollections();
  },

  // 去文案库
  goToArt() {
    console.log('点击了去收藏文案按钮');
    
    // 检查权限
    if (!RoleManager.hasPermission('canViewArtContent')) {
      console.log('权限不足，跳转到加入页面');
      wx.showModal({
        title: '权限不足',
        content: '您没有访问文案库的权限，请先加入星火计划',
        confirmText: '去加入',
        confirmColor: '#D4B083',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/join/join' });
          }
        }
      });
      return;
    }
    
    console.log('权限检查通过，开始跳转');
    // 使用switchTab跳转到tabbar页面
    wx.switchTab({ 
      url: '/pages/art/art',
      success: function() {
        console.log('跳转成功');
      },
      fail: function(err) {
        console.error('跳转失败:', err);
        // 提供更详细的错误信息
        let errorMsg = '跳转失败';
        if (err.errMsg.includes('tabbar page')) {
          errorMsg = '无法跳转到tabbar页面';
        } else if (err.errMsg.includes('page not found')) {
          errorMsg = '页面不存在，请检查页面配置';
        }
        wx.showToast({ title: errorMsg, icon: 'none' });
      }
    });
  },

  // 格式化时间
  formatTime(time) {
    if (!time) return '';
    
    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  // 获取预览内容
  getPreviewContent(content) {
    if (!content) return '';
    
    let text = content;
    if (typeof content === 'object' && content.script) {
      text = content.script;
    }
    
    // 截取前100个字符
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }
});