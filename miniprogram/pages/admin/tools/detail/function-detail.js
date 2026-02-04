// 云函数状态监控详情页面逻辑
Page({
  data: {
    // 云函数统计
    functionStats: {
      total: 12,
      highRisk: 0,
      avgResponse: 150,
      avgMemory: 60
    },
    
    // 云函数列表
    cloudFunctions: [
      {
        name: 'adminTools',
        status: 'active',
        statusText: '活跃',
        executionTime: 150,
        memoryUsage: '60MB',
        dependencies: 8,
        lastExecution: '2026-01-30 14:30'
      },
      {
        name: 'userLogin',
        status: 'active',
        statusText: '活跃',
        executionTime: 120,
        memoryUsage: '50MB',
        dependencies: 5,
        lastExecution: '2026-01-30 14:25'
      },
      {
        name: 'dataSync',
        status: 'active',
        statusText: '活跃',
        executionTime: 200,
        memoryUsage: '70MB',
        dependencies: 10,
        lastExecution: '2026-01-30 14:20'
      },
      {
        name: 'fileUpload',
        status: 'active',
        statusText: '活跃',
        executionTime: 180,
        memoryUsage: '65MB',
        dependencies: 7,
        lastExecution: '2026-01-30 14:15'
      },
      {
        name: 'notification',
        status: 'inactive',
        statusText: '非活跃',
        executionTime: 100,
        memoryUsage: '45MB',
        dependencies: 4,
        lastExecution: '2026-01-30 10:00'
      },
      {
        name: 'add_test_contract',
        status: 'active',
        statusText: '活跃',
        executionTime: 160,
        memoryUsage: '55MB',
        dependencies: 6,
        lastExecution: '2026-01-30 14:10'
      },
      {
        name: 'getContractInfo',
        status: 'active',
        statusText: '活跃',
        executionTime: 130,
        memoryUsage: '52MB',
        dependencies: 5,
        lastExecution: '2026-01-30 14:05'
      },
      {
        name: 'init_daily_materials',
        status: 'inactive',
        statusText: '非活跃',
        executionTime: 250,
        memoryUsage: '75MB',
        dependencies: 9,
        lastExecution: '2026-01-30 08:00'
      },
      {
        name: 'init_db',
        status: 'inactive',
        statusText: '非活跃',
        executionTime: 300,
        memoryUsage: '80MB',
        dependencies: 12,
        lastExecution: '2026-01-29 10:00'
      },
      {
        name: 'init_rental_collections',
        status: 'inactive',
        statusText: '非活跃',
        executionTime: 220,
        memoryUsage: '68MB',
        dependencies: 8,
        lastExecution: '2026-01-29 10:05'
      },
      {
        name: 'login',
        status: 'active',
        statusText: '活跃',
        executionTime: 110,
        memoryUsage: '48MB',
        dependencies: 4,
        lastExecution: '2026-01-30 14:35'
      },
      {
        name: 'quickstartFunctions',
        status: 'inactive',
        statusText: '非活跃',
        executionTime: 90,
        memoryUsage: '40MB',
        dependencies: 3,
        lastExecution: '2026-01-28 10:00'
      }
    ],
    
    // 性能数据
    performanceData: {
      executionTime: [
        { range: '<100ms', count: 3 },
        { range: '100-150ms', count: 4 },
        { range: '150-200ms', count: 3 },
        { range: '200-250ms', count: 1 },
        { range: '>250ms', count: 1 }
      ]
    },
    
    // 依赖分析
    dependencies: [
      {
        name: 'wx-server-sdk',
        version: 'latest',
        status: 'good',
        statusText: '最新'
      },
      {
        name: 'lodash',
        version: '4.17.21',
        status: 'good',
        statusText: '最新'
      },
      {
        name: 'axios',
        version: '0.27.2',
        status: 'warning',
        statusText: '有更新'
      },
      {
        name: 'moment',
        version: '2.29.4',
        status: 'good',
        statusText: '最新'
      }
    ],
    
    // 优化建议
    optimizationSuggestions: [
      {
        icon: '⚡',
        title: '优化执行时间',
        description: '针对执行时间较长的云函数进行优化',
        impact: '减少 30% 执行时间'
      },
      {
        icon: '📦',
        title: '更新依赖包',
        description: '更新项目中的依赖包到最新版本',
        impact: '提升安全性和性能'
      },
      {
        icon: '🧹',
        title: '清理无用代码',
        description: '清理云函数中未使用的代码和依赖',
        impact: '减少 15% 内存使用'
      },
      {
        icon: '📈',
        title: '监控配置',
        description: '配置更详细的云函数监控',
        impact: '提升问题排查效率'
      }
    ]
  },

  // 页面加载
  onLoad: function(options) {
    // 加载云函数状态数据
    this.loadFunctionStatusData();
  },
  
  // 加载云函数状态数据
  loadFunctionStatusData: function() {
    wx.showLoading({ title: '加载云函数状态...' });
    
    // 调用云函数获取云函数状态
    wx.cloud.callFunction({
      name: 'adminTools',
      data: {
        action: 'getCloudFunctionsStatus'
      }
    }).then((result) => {
      wx.hideLoading();
      console.log('云函数状态:', result);
      
      if (result.result.success) {
        const functionData = result.result.data;
        
        // 更新页面数据
        this.setData({
          functionStats: {
            total: functionData.total,
            highRisk: functionData.highRisk,
            avgResponse: functionData.avgResponse,
            avgMemory: functionData.avgMemory
          }
        });
      } else {
        wx.showToast({ title: '加载云函数状态失败', icon: 'error' });
      }
    }).catch((error) => {
      wx.hideLoading();
      console.error('加载云函数状态失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    });
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },

  // 刷新云函数状态
  refreshFunctions: function() {
    // 直接调用加载数据函数
    this.loadFunctionStatusData();
  },

  // 获取执行时间样式类
  getExecutionTimeClass: function(time) {
    if (time < 100) return 'good';
    if (time < 200) return 'warning';
    return 'error';
  },

  // 获取内存使用样式类
  getMemoryUsageClass: function(memory) {
    const memoryValue = parseFloat(memory);
    if (memoryValue < 50) return 'good';
    if (memoryValue < 70) return 'warning';
    return 'error';
  },

  // 获取柱状图颜色
  getBarColor: function(range) {
    if (range === '<100ms') return '#52c41a';
    if (range === '100-150ms') return '#1890ff';
    if (range === '150-200ms') return '#faad14';
    if (range === '200-250ms') return '#fa8c16';
    return '#ff4d4f';
  },

  // 查看云函数详情
  viewFunctionDetail: function(e) {
    const index = e.currentTarget.dataset.index;
    const func = this.data.cloudFunctions[index];
    wx.showModal({
      title: '云函数详情',
      content: `名称: ${func.name}\n状态: ${func.statusText}\n执行时间: ${func.executionTime}ms\n内存使用: ${func.memoryUsage}\n依赖数: ${func.dependencies}\n最近执行: ${func.lastExecution}`,
      showCancel: false
    });
  },

  // 优化云函数
  optimizeFunction: function(e) {
    const index = e.currentTarget.dataset.index;
    const func = this.data.cloudFunctions[index];
    wx.showModal({
      title: '优化云函数',
      content: `确定要优化「${func.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '优化中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '云函数优化完成', icon: 'success' });
          }, 2000);
        }
      }
    });
  },

  // 测试云函数
  testFunction: function(e) {
    const index = e.currentTarget.dataset.index;
    const func = this.data.cloudFunctions[index];
    wx.showModal({
      title: '测试云函数',
      content: `确定要测试「${func.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '测试中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '云函数测试完成', icon: 'success' });
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