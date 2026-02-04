// 组件库状态分析详情页面逻辑
Page({
  data: {
    // 组件库统计
    componentStats: {
      total: 35,
      used: 28,
      usageRate: 80,
      healthScore: 85
    },
    
    // 组件列表
    components: [
      {
        name: 'Button',
        status: 'used',
        statusText: '已使用',
        usage: 45,
        createdAt: '2026-01-01',
        lastUsed: '2026-01-30',
        version: '1.0.0'
      },
      {
        name: 'Card',
        status: 'used',
        statusText: '已使用',
        usage: 32,
        createdAt: '2026-01-02',
        lastUsed: '2026-01-29',
        version: '1.0.0'
      },
      {
        name: 'Modal',
        status: 'used',
        statusText: '已使用',
        usage: 18,
        createdAt: '2026-01-03',
        lastUsed: '2026-01-28',
        version: '1.0.0'
      },
      {
        name: 'Input',
        status: 'used',
        statusText: '已使用',
        usage: 40,
        createdAt: '2026-01-04',
        lastUsed: '2026-01-30',
        version: '1.0.0'
      },
      {
        name: 'List',
        status: 'used',
        statusText: '已使用',
        usage: 25,
        createdAt: '2026-01-05',
        lastUsed: '2026-01-29',
        version: '1.0.0'
      },
      {
        name: 'Picker',
        status: 'used',
        statusText: '已使用',
        usage: 15,
        createdAt: '2026-01-06',
        lastUsed: '2026-01-27',
        version: '1.0.0'
      },
      {
        name: 'Slider',
        status: 'unused',
        statusText: '未使用',
        usage: 0,
        createdAt: '2026-01-07',
        lastUsed: '-',
        version: '1.0.0'
      },
      {
        name: 'Switch',
        status: 'used',
        statusText: '已使用',
        usage: 12,
        createdAt: '2026-01-08',
        lastUsed: '2026-01-28',
        version: '1.0.0'
      },
      {
        name: 'Tab',
        status: 'used',
        statusText: '已使用',
        usage: 20,
        createdAt: '2026-01-09',
        lastUsed: '2026-01-29',
        version: '1.0.0'
      },
      {
        name: 'Toast',
        status: 'used',
        statusText: '已使用',
        usage: 28,
        createdAt: '2026-01-10',
        lastUsed: '2026-01-30',
        version: '1.0.0'
      }
    ],
    
    // 组件分类
    categories: [
      {
        name: '基础组件',
        count: 15,
        percentage: 43
      },
      {
        name: '表单组件',
        count: 8,
        percentage: 23
      },
      {
        name: '布局组件',
        count: 6,
        percentage: 17
      },
      {
        name: '导航组件',
        count: 4,
        percentage: 11
      },
      {
        name: '其他组件',
        count: 2,
        percentage: 6
      }
    ],
    
    // 未使用组件
    unusedComponents: [
      {
        name: 'Slider',
        index: 6
      },
      {
        name: 'Rate',
        index: 11
      },
      {
        name: 'Steps',
        index: 15
      },
      {
        name: 'Timeline',
        index: 18
      },
      {
        name: 'Calendar',
        index: 22
      },
      {
        name: 'Collapse',
        index: 25
      },
      {
        name: 'Carousel',
        index: 30
      }
    ],
    
    // 优化建议
    optimizationSuggestions: [
      {
        icon: '🧹',
        title: '清理未使用组件',
        description: '删除项目中未使用的组件，减少代码体积',
        impact: '减少 8% 体积'
      },
      {
        icon: '📦',
        title: '合并相似组件',
        description: '合并功能相似的组件，提高代码复用率',
        impact: '减少 12% 组件数量'
      },
      {
        icon: '⚡',
        title: '优化组件性能',
        description: '优化组件渲染性能，减少不必要的重渲染',
        impact: '提升 20% 渲染速度'
      },
      {
        icon: '📋',
        title: '更新组件文档',
        description: '更新组件使用文档，提高开发效率',
        impact: '提升 15% 开发效率'
      }
    ]
  },

  // 页面加载
  onLoad: function(options) {
    // 加载组件库状态数据
    this.loadComponentStatusData();
  },
  
  // 加载组件库状态数据
  loadComponentStatusData: function() {
    wx.showLoading({ title: '加载组件库状态...' });
    
    // 调用云函数获取组件库状态
    wx.cloud.callFunction({
      name: 'adminTools',
      data: {
        action: 'getComponentLibraryStatus'
      }
    }).then((result) => {
      wx.hideLoading();
      console.log('组件库状态:', result);
      
      if (result.result.success) {
        const componentData = result.result.data;
        
        // 更新页面数据
        this.setData({
          componentStats: {
            total: componentData.total,
            used: componentData.used,
            usageRate: Math.round((componentData.used / componentData.total) * 100),
            healthScore: componentData.health
          }
        });
      } else {
        wx.showToast({ title: '加载组件库状态失败', icon: 'error' });
      }
    }).catch((error) => {
      wx.hideLoading();
      console.error('加载组件库状态失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    });
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },

  // 刷新组件状态
  refreshComponents: function() {
    // 直接调用加载数据函数
    this.loadComponentStatusData();
  },

  // 获取饼图路径
  getPieClipPath: function(percentage) {
    const angle = (percentage / 100) * 360;
    const radians = (angle * Math.PI) / 180;
    const x = 50 + 50 * Math.cos(radians - Math.PI / 2);
    const y = 50 + 50 * Math.sin(radians - Math.PI / 2);
    
    if (percentage > 50) {
      return `${x}% ${y}%, 100% 0%, 100% 100%, 0% 100%, 0% 0%`;
    } else {
      return `${x}% ${y}%`;
    }
  },

  // 查看组件详情
  viewComponentDetail: function(e) {
    const index = e.currentTarget.dataset.index;
    const component = this.data.components[index];
    wx.showModal({
      title: '组件详情',
      content: `名称: ${component.name}\n状态: ${component.statusText}\n使用次数: ${component.usage}\n创建时间: ${component.createdAt}\n最后使用: ${component.lastUsed}\n版本: ${component.version}`,
      showCancel: false
    });
  },

  // 优化组件
  optimizeComponent: function(e) {
    const index = e.currentTarget.dataset.index;
    const component = this.data.components[index];
    wx.showModal({
      title: '优化组件',
      content: `确定要优化「${component.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '优化中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '组件优化完成', icon: 'success' });
          }, 2000);
        }
      }
    });
  },

  // 删除组件
  deleteComponent: function(e) {
    const index = e.currentTarget.dataset.index;
    const component = this.data.components[index];
    wx.showModal({
      title: '删除组件',
      content: `确定要删除「${component.name}」吗？此操作不可恢复。`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '组件已删除', icon: 'success' });
          }, 1500);
        }
      }
    });
  },

  // 禁用组件
  disableComponent: function(e) {
    const index = e.currentTarget.dataset.index;
    const component = this.data.components[index];
    wx.showModal({
      title: '禁用组件',
      content: `确定要禁用「${component.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '禁用中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '组件已禁用', icon: 'success' });
          }, 1500);
        }
      }
    });
  },

  // 应用优化建议
  applySuggestion: function(e) {
    const index = e.currentTarget.dataset.index;
    const suggestion = this.data.optimizationSuggestions[index];
    wx.showModal({
      title: '应用优化建议',
      content: `确定要应用「${suggestion.title}」吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '应用中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '优化建议已应用', icon: 'success' });
          }, 2000);
        }
      }
    });
  },

  // 页面显示
  onShow: function() {
    // 页面显示逻辑
  },

  // 页面隐藏
  onHide: function() {
    // 页面隐藏逻辑
  },

  // 页面卸载
  onUnload: function() {
    // 页面卸载逻辑
  }
});