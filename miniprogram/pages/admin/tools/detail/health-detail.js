// 项目健康状态详情页面逻辑
Page({
  data: {
    // 健康评分
    healthScore: 95,
    healthLevel: 'good',
    healthDescription: '项目状态良好',
    lastCheckTime: '2026-01-30 14:30',
    
    // 健康指标
    indicators: [
      {
        name: '代码一致性',
        status: 'good',
        statusText: '良好',
        score: 98,
        description: '代码与数据库结构保持一致',
        details: [
          { label: '数据表结构', value: '一致' },
          { label: '字段类型', value: '匹配' },
          { label: '索引配置', value: '优化' }
        ]
      },
      {
        name: '权限矩阵',
        status: 'good',
        statusText: '良好',
        score: 95,
        description: '权限配置完整且合理',
        details: [
          { label: '角色定义', value: '完整' },
          { label: '权限分配', value: '合理' },
          { label: '边界检查', value: '通过' }
        ]
      },
      {
        name: '组件规范',
        status: 'good',
        statusText: '良好',
        score: 92,
        description: '组件使用符合规范',
        details: [
          { label: '组件使用率', value: '80%' },
          { label: '规范遵循', value: '良好' },
          { label: '版本一致性', value: '匹配' }
        ]
      },
      {
        name: '云函数状态',
        status: 'warning',
        statusText: '警告',
        score: 85,
        description: '云函数运行状态基本正常',
        details: [
          { label: '执行时间', value: '150ms' },
          { label: '内存使用', value: '60MB' },
          { label: '依赖检查', value: '有更新' }
        ]
      },
      {
        name: '代码质量',
        status: 'good',
        statusText: '良好',
        score: 90,
        description: '代码质量较高',
        details: [
          { label: '代码规范', value: '符合' },
          { label: '注释率', value: '85%' },
          { label: '复杂度', value: '适中' }
        ]
      }
    ],
    
    // 问题列表
    issues: [
      {
        name: '云函数依赖更新',
        severity: 'warning',
        severityText: '警告',
        description: '部分云函数依赖包需要更新',
        location: 'cloudfunctions/adminTools',
        suggestion: '运行 npm update 更新依赖包'
      }
    ],
    
    // 检查历史
    checkHistory: [
      {
        time: '2026-01-30 14:30',
        score: 95,
        level: 'good',
        description: '项目状态良好，发现1个警告',
        issues: 1
      },
      {
        time: '2026-01-29 18:00',
        score: 96,
        level: 'good',
        description: '项目状态良好，无问题',
        issues: 0
      },
      {
        time: '2026-01-28 12:00',
        score: 94,
        level: 'good',
        description: '项目状态良好，发现2个警告',
        issues: 2
      },
      {
        time: '2026-01-27 09:00',
        score: 93,
        level: 'good',
        description: '项目状态良好，发现1个警告',
        issues: 1
      }
    ],
    
    // 操作建议
    suggestions: [
      {
        icon: '🔄',
        title: '更新云函数依赖',
        description: '更新所有云函数的依赖包到最新版本',
        action: 'updateDependencies'
      },
      {
        icon: '🧹',
        title: '清理无用组件',
        description: '移除项目中未使用的组件，减少代码体积',
        action: 'cleanComponents'
      },
      {
        icon: '⚡',
        title: '优化云函数性能',
        description: '分析并优化云函数的执行时间和内存使用',
        action: 'optimizeFunctions'
      },
      {
        icon: '📝',
        title: '生成健康报告',
        description: '生成详细的项目健康状态报告',
        action: 'generateReport'
      }
    ]
  },

  // 页面加载
  onLoad: function(options) {
    // 加载健康状态数据
    this.loadHealthStatusData();
  },
  
  // 加载健康状态数据
  loadHealthStatusData: function() {
    wx.showLoading({ title: '加载健康状态...' });
    
    // 调用云函数获取健康状态
    wx.cloud.callFunction({
      name: 'adminTools',
      data: {
        action: 'getProjectStatus'
      }
    }).then((result) => {
      wx.hideLoading();
      console.log('健康状态:', result);
      
      if (result.result.success) {
        const healthData = result.result.data;
        const lastCheckTime = new Date(healthData.lastUpdated);
        const formattedTime = lastCheckTime.getFullYear() + '-' + 
          String(lastCheckTime.getMonth() + 1).padStart(2, '0') + '-' + 
          String(lastCheckTime.getDate()).padStart(2, '0') + ' ' + 
          String(lastCheckTime.getHours()).padStart(2, '0') + ':' + 
          String(lastCheckTime.getMinutes()).padStart(2, '0');
        
        // 更新页面数据
        this.setData({
          healthScore: healthData.healthScore,
          healthLevel: healthData.status,
          healthDescription: healthData.statusText,
          lastCheckTime: formattedTime,
          indicators: healthData.indicators,
          issues: healthData.issues || []
        });
      } else {
        wx.showToast({ title: '加载健康状态失败', icon: 'error' });
      }
    }).catch((error) => {
      wx.hideLoading();
      console.error('加载健康状态失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    });
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },

  // 运行健康检查
  runHealthCheck: function() {
    // 直接调用加载数据函数
    this.loadHealthStatusData();
  },

  // 执行操作建议
  executeSuggestion: function(e) {
    const index = e.currentTarget.dataset.index;
    const suggestion = this.data.suggestions[index];
    
    wx.showModal({
      title: '执行操作',
      content: `确定要执行「${suggestion.title}」吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '执行中...' });
          
          // 模拟执行过程
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '操作执行成功', icon: 'success' });
          }, 2000);
        }
      }
    });
  },
  
  // 查看组件规范详情
  viewComponentDetails: function() {
    const componentDetails = `已实现组件：1个（cloudTipModal）\n\n缺失组件：5个\n1. role-badge - 角色徽章组件\n2. gold-button - 金色按钮组件\n3. frost-card - 磨砂卡片组件\n4. security-tag - 安全标签组件\n5. empty-state - 空状态组件\n\n实现率：20%`;
    
    wx.showModal({
      title: '组件库实现情况',
      content: componentDetails,
      showCancel: true,
      cancelText: '复制',
      confirmText: '确定',
      confirmColor: '#D4B083',
      success: (res) => {
        if (res.cancel) {
          // 复制组件详情
          wx.setClipboardData({
            data: componentDetails,
            success: function() {
              wx.showToast({
                title: '复制成功',
                icon: 'success',
                duration: 2000
              });
            },
            fail: function() {
              wx.showToast({
                title: '复制失败',
                icon: 'error',
                duration: 2000
              });
            }
          });
        }
      }
    });
  },
  
  // 复制问题详情
  copyIssueDetail: function(e) {
    const index = e.currentTarget.dataset.index;
    const issue = this.data.issues[index];
    
    if (issue) {
      const issueDetail = `问题：${issue.name}\n描述：${issue.description || '无'}\n位置：${issue.location || '无'}\n建议：${issue.suggestion || '无'}`;
      
      wx.setClipboardData({
        data: issueDetail,
        success: function() {
          wx.showToast({
            title: '复制成功',
            icon: 'success',
            duration: 2000
          });
        },
        fail: function() {
          wx.showToast({
            title: '复制失败',
            icon: 'error',
            duration: 2000
          });
        }
      });
    }
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