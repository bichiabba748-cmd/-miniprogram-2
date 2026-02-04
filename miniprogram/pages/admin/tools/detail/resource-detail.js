// 资源使用情况详情页面逻辑
Page({
  data: {
    // 资源统计
    resourceStats: {
      files: 245,
      lines: 15800,
      size: '4.2MB',
      functions: 12
    },
    
    // 文件类型分布
    fileTypes: [
      {
        icon: '📦',
        name: 'JavaScript',
        count: 85,
        size: '1.8MB'
      },
      {
        icon: '🎨',
        name: 'WXML/WXSS',
        count: 65,
        size: '0.9MB'
      },
      {
        icon: '📄',
        name: 'JSON',
        count: 45,
        size: '0.3MB'
      },
      {
        icon: '🖼️',
        name: '图片资源',
        count: 30,
        size: '1.0MB'
      },
      {
        icon: '📋',
        name: '其他文件',
        count: 20,
        size: '0.2MB'
      }
    ],
    
    // 目录结构
    directoryStructure: [
      {
        name: 'miniprogram',
        type: 'dir',
        level: 0,
        count: 180
      },
      {
        name: 'pages',
        type: 'dir',
        level: 1,
        count: 120
      },
      {
        name: 'components',
        type: 'dir',
        level: 1,
        count: 35
      },
      {
        name: 'utils',
        type: 'dir',
        level: 1,
        count: 15
      },
      {
        name: 'cloudfunctions',
        type: 'dir',
        level: 0,
        count: 12
      },
      {
        name: 'docs',
        type: 'dir',
        level: 0,
        count: 25
      },
      {
        name: 'tools',
        type: 'dir',
        level: 0,
        count: 10
      }
    ],
    
    // 资源趋势
    resourceTrend: [
      {
        date: '01-15',
        files: 180,
        lines: 12000,
        size: '3.2MB'
      },
      {
        date: '01-20',
        files: 200,
        lines: 13500,
        size: '3.5MB'
      },
      {
        date: '01-25',
        files: 225,
        lines: 14800,
        size: '3.9MB'
      },
      {
        date: '01-30',
        files: 245,
        lines: 15800,
        size: '4.2MB'
      }
    ],
    
    // 云函数
    cloudFunctions: [
      {
        name: 'adminTools',
        status: 'active',
        statusText: '活跃',
        executionTime: 150,
        memoryUsage: '60MB',
        dependencies: 8
      },
      {
        name: 'userLogin',
        status: 'active',
        statusText: '活跃',
        executionTime: 120,
        memoryUsage: '50MB',
        dependencies: 5
      },
      {
        name: 'dataSync',
        status: 'active',
        statusText: '活跃',
        executionTime: 200,
        memoryUsage: '70MB',
        dependencies: 10
      },
      {
        name: 'fileUpload',
        status: 'active',
        statusText: '活跃',
        executionTime: 180,
        memoryUsage: '65MB',
        dependencies: 7
      },
      {
        name: 'notification',
        status: 'inactive',
        statusText: '非活跃',
        executionTime: 100,
        memoryUsage: '45MB',
        dependencies: 4
      }
    ],
    
    // 优化建议
    optimizationSuggestions: [
      {
        icon: '🖼️',
        title: '压缩图片资源',
        description: '压缩项目中的图片资源，预计可减少 0.5MB 体积',
        impact: '减少 12% 体积'
      },
      {
        icon: '📦',
        title: '合并JS文件',
        description: '合并多个小JS文件，减少网络请求',
        impact: '提升 15% 加载速度'
      },
      {
        icon: '⚡',
        title: '优化云函数',
        description: '优化云函数执行逻辑，减少执行时间',
        impact: '减少 30% 执行时间'
      },
      {
        icon: '🧹',
        title: '清理无用文件',
        description: '清理项目中未使用的文件和资源',
        impact: '减少 8% 体积'
      }
    ]
  },

  // 页面加载
  onLoad: function(options) {
    // 加载资源使用情况数据
    this.loadResourceUsageData();
  },
  
  // 加载资源使用情况数据
  loadResourceUsageData: function() {
    wx.showLoading({ title: '加载资源使用情况...' });
    
    // 调用云函数获取资源使用情况
    wx.cloud.callFunction({
      name: 'adminTools',
      data: {
        action: 'getResourceUsage'
      }
    }).then((result) => {
      wx.hideLoading();
      console.log('资源使用情况:', result);
      
      if (result.result.success) {
        const resourceData = result.result.data;
        
        // 更新页面数据
        this.setData({
          resourceStats: {
            files: resourceData.files,
            lines: resourceData.lines,
            size: resourceData.size,
            functions: resourceData.functions
          }
        });
      } else {
        wx.showToast({ title: '加载资源使用情况失败', icon: 'error' });
      }
    }).catch((error) => {
      wx.hideLoading();
      console.error('加载资源使用情况失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    });
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },

  // 刷新资源数据
  refreshResource: function() {
    // 直接调用加载数据函数
    this.loadResourceUsageData();
  },

  // 应用优化建议
  applyOptimization: function(e) {
    const index = e.currentTarget.dataset.index;
    const suggestion = this.data.optimizationSuggestions[index];
    
    wx.showModal({
      title: '应用优化',
      content: `确定要应用「${suggestion.title}」吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '应用优化中...' });
          
          // 模拟优化过程
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '优化已应用', icon: 'success' });
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