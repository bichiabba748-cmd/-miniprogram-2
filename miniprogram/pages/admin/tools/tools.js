// 管理工具页面逻辑
Page({
  data: {
    // 健康状态
    healthStatus: {
      score: 95,
      level: 'good',
      description: '项目状态良好',
      consistency: 'good',
      permissions: 'good',
      components: 'good',
      issues: []
    },
    
    // 进度状态
    progressStatus: {
      percentage: 68,
      stage: '开发阶段',
      lastUpdated: '2026-01-30 14:30'
    },
    
    // 备份状态
    backupStatus: {
      lastBackup: '2026-01-30 12:00',
      count: 15,
      autoEnabled: true,
      history: [
        { time: '2026-01-30 12:00', size: '2.5MB' },
        { time: '2026-01-29 20:00', size: '2.4MB' },
        { time: '2026-01-29 12:00', size: '2.3MB' }
      ]
    },
    
    // 资源状态
    resourceStatus: {
      files: 229,
      lines: 17964,
      size: '1.8MB',
      functions: 14
    },
    
    // 云函数状态
    functionStatus: {
      total: 12,
      highRisk: 0,
      avgResponse: 150
    },
    
    // 组件库状态
    componentStatus: {
      total: 35,
      used: 28,
      usageRate: 80
    },
    
    // 加载状态
    loading: false,
    loadingText: '加载中...',
    
    // 提示信息
    toast: {
      show: false,
      message: '',
      type: 'success'
    }
  },

  // 页面加载
  onLoad: function(options) {
    this.loadInitialData();
    // 初始化防抖函数
    this.refreshStatus = this.debounce(this.refreshStatus, 500);
    this.runHealthCheck = this.debounce(this.runHealthCheck, 1000);
    this.manualBackup = this.debounce(this.manualBackup, 2000);
  },

  // 加载初始数据
  loadInitialData: function() {
    this.setData({ loading: true, loadingText: '加载项目数据...' });
    
    // 优化数据加载：使用Promise.all并行加载
    Promise.all([
      this.loadStatusData(),
      this.loadProgressData(),
      this.loadBackupData(),
      this.loadResourceData(),
      this.loadFunctionStatusData(),
      this.loadComponentStatusData()
    ]).then(() => {
      this.setData({ loading: false });
    }).catch((error) => {
      console.error('数据加载失败:', error);
      this.setData({ loading: false });
      this.showToast('数据加载失败', 'error');
    });
  },

  // 加载状态数据
  loadStatusData: function() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'adminTools',
        data: {
          action: 'runHealthCheck'
        }
      }).then((result) => {
        if (result.result.success) {
          const healthData = result.result.data;
          this.setData({
            healthStatus: {
              score: healthData.score,
              level: healthData.level,
              description: healthData.description,
              consistency: healthData.indicators.find(item => item.name === '代码一致性')?.status || 'good',
              permissions: healthData.indicators.find(item => item.name === '权限矩阵')?.status || 'good',
              components: healthData.indicators.find(item => item.name === '组件规范')?.status || 'good',
              issues: healthData.issues || []
            }
          });
          resolve();
        } else {
          reject(result.result.message);
        }
      }).catch((error) => {
        reject(error);
      });
    });
  },

  // 加载进度数据
  loadProgressData: function() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'adminTools',
        data: {
          action: 'getDevelopmentProgress'
        }
      }).then((result) => {
        if (result.result.success) {
          const progressData = result.result.data;
          const lastUpdated = new Date(progressData.lastUpdated);
          const formattedTime = lastUpdated.getFullYear() + '-' + 
            String(lastUpdated.getMonth() + 1).padStart(2, '0') + '-' + 
            String(lastUpdated.getDate()).padStart(2, '0') + ' ' + 
            String(lastUpdated.getHours()).padStart(2, '0') + ':' + 
            String(lastUpdated.getMinutes()).padStart(2, '0');
          
          this.setData({
            progressStatus: {
              percentage: progressData.percentage,
              stage: progressData.stage,
              lastUpdated: formattedTime
            }
          });
          resolve();
        } else {
          reject(result.result.message);
        }
      }).catch((error) => {
        reject(error);
      });
    });
  },

  // 加载备份数据
  loadBackupData: function() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'adminTools',
        data: {
          action: 'getBackupHistory'
        }
      }).then((result) => {
        if (result.result.success) {
          const backupHistory = result.result.data;
          const formattedHistory = backupHistory.map(item => {
            const backupTime = new Date(item.time);
            const formattedTime = backupTime.getFullYear() + '-' + 
              String(backupTime.getMonth() + 1).padStart(2, '0') + '-' + 
              String(backupTime.getDate()).padStart(2, '0') + ' ' + 
              String(backupTime.getHours()).padStart(2, '0') + ':' + 
              String(backupTime.getMinutes()).padStart(2, '0');
            return {
              time: formattedTime,
              size: item.size
            };
          });
          
          this.setData({
            backupStatus: {
              lastBackup: formattedHistory.length > 0 ? formattedHistory[0].time : '从未备份',
              count: formattedHistory.length,
              autoEnabled: true,
              history: formattedHistory.slice(0, 10)
            }
          });
          resolve();
        } else {
          reject(result.result.message);
        }
      }).catch((error) => {
        reject(error);
      });
    });
  },

  // 加载资源数据
  loadResourceData: function() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'adminTools',
        data: {
          action: 'getResourceUsage'
        }
      }).then((result) => {
        if (result.result.success) {
          const resourceData = result.result.data;
          this.setData({
            resourceStatus: {
              files: resourceData.files,
              lines: resourceData.lines,
              size: resourceData.size,
              functions: resourceData.functions
            }
          });
          resolve();
        } else {
          reject(result.result.message);
        }
      }).catch((error) => {
        reject(error);
      });
    });
  },

  // 加载云函数状态数据
  loadFunctionStatusData: function() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'adminTools',
        data: {
          action: 'getCloudFunctionsStatus'
        }
      }).then((result) => {
        if (result.result.success) {
          const functionData = result.result.data;
          this.setData({
            functionStatus: {
              total: functionData.total,
              highRisk: functionData.highRisk,
              avgResponse: functionData.avgResponse
            }
          });
          resolve();
        } else {
          reject(result.result.message);
        }
      }).catch((error) => {
        reject(error);
      });
    });
  },

  // 加载组件库状态数据
  loadComponentStatusData: function() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'adminTools',
        data: {
          action: 'getComponentLibraryStatus'
        }
      }).then((result) => {
        if (result.result.success) {
          const componentData = result.result.data;
          this.setData({
            componentStatus: {
              total: componentData.total,
              used: componentData.used,
              usageRate: componentData.usageRate
            }
          });
          resolve();
        } else {
          reject(result.result.message);
        }
      }).catch((error) => {
        reject(error);
      });
    });
  },

  // 防抖函数
  debounce: function(func, delay) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  },

  // 节流函数
  throttle: function(func, limit) {
    let inThrottle = false;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  },

  // 刷新状态
  refreshStatus: function() {
    if (this.data.loading) return;
    
    this.setData({ loading: true, loadingText: '刷新状态...' });
    
    // 从云函数获取最新数据
    Promise.all([
      this.loadStatusData(),
      this.loadProgressData(),
      this.loadBackupData(),
      this.loadResourceData(),
      this.loadFunctionStatusData(),
      this.loadComponentStatusData()
    ]).then(() => {
      this.setData({ loading: false });
      this.showToast('状态刷新成功', 'success');
    }).catch((error) => {
      console.error('刷新状态失败:', error);
      this.setData({ loading: false });
      this.showToast('刷新状态失败', 'error');
    });
  },

  // 查看进度详情
  viewProgressDetail: function() {
    wx.navigateTo({
      url: '/pages/admin/tools/detail/progress-detail'
    });
  },

  // 运行健康检查
  runHealthCheck: function() {
    if (this.data.loading) return;
    
    this.setData({ loading: true, loadingText: '运行健康检查...' });
    
    // 调用云函数执行健康检查
    wx.cloud.callFunction({
      name: 'adminTools',
      data: {
        action: 'runHealthCheck'
      }
    }).then((result) => {
      if (result.result.success) {
        const healthData = result.result.data;
        this.setData({
          healthStatus: {
            score: healthData.score,
            level: healthData.level,
            description: healthData.description,
            consistency: healthData.indicators.find(item => item.name === '代码一致性')?.status || 'good',
            permissions: healthData.indicators.find(item => item.name === '权限矩阵')?.status || 'good',
            components: healthData.indicators.find(item => item.name === '组件规范')?.status || 'good',
            issues: healthData.issues || []
          },
          loading: false
        });
        
        this.showToast('健康检查完成', 'success');
      } else {
        this.setData({ loading: false });
        this.showToast('健康检查失败: ' + (result.result.message || '未知错误'), 'error');
      }
    }).catch((error) => {
      console.error('健康检查失败:', error);
      this.setData({ loading: false });
      this.showToast('健康检查失败: 网络错误', 'error');
    });
  },

  // 手动备份
  manualBackup: function() {
    wx.showModal({
      title: '手动备份',
      content: '确定要执行手动备份吗？这将创建当前项目的完整备份。',
      success: (res) => {
        if (res.confirm) {
          if (this.data.loading) return;
          
          this.setData({ loading: true, loadingText: '执行备份...' });
          
          // 调用云函数执行真实备份
          wx.cloud.callFunction({
            name: 'adminTools',
            data: {
              action: 'manualBackup'
            }
          }).then((result) => {
            console.log('备份结果:', result);
            
            if (result.result.success) {
              const backupData = result.result.data;
              // 格式化时间显示
              const backupTime = new Date(backupData.time);
              const formattedTime = backupTime.getFullYear() + '-' + 
                String(backupTime.getMonth() + 1).padStart(2, '0') + '-' + 
                String(backupTime.getDate()).padStart(2, '0') + ' ' + 
                String(backupTime.getHours()).padStart(2, '0') + ':' + 
                String(backupTime.getMinutes()).padStart(2, '0');
              
              const newBackup = {
                time: formattedTime,
                size: backupData.size
              };
              
              const updatedHistory = [newBackup, ...this.data.backupStatus.history].slice(0, 10);
              
              this.setData({
                backupStatus: {
                  ...this.data.backupStatus,
                  lastBackup: formattedTime,
                  count: this.data.backupStatus.count + 1,
                  history: updatedHistory
                },
                loading: false
              });
              
              this.showToast('备份成功', 'success');
            } else {
              this.setData({ loading: false });
              this.showToast('备份失败: ' + (result.result.message || '未知错误'), 'error');
            }
          }).catch((error) => {
            console.error('备份失败:', error);
            this.setData({ loading: false });
            this.showToast('备份失败: 网络错误', 'error');
          });
        }
      }
    });
  },

  // 查看资源详情
  viewResourceDetail: function() {
    wx.navigateTo({
      url: '/pages/admin/tools/detail/resource-detail'
    });
  },

  // 查看云函数详情
  viewFunctionDetail: function() {
    wx.navigateTo({
      url: '/pages/admin/tools/detail/function-detail'
    });
  },

  // 查看组件详情
  viewComponentDetail: function() {
    wx.navigateTo({
      url: '/pages/admin/tools/detail/component-detail'
    });
  },

  // 进入测试中心
  goToTestCenter: function() {
    wx.navigateTo({
      url: '/pages/test/test'
    });
  },
  
  // 查看问题详情
  viewIssueDetail: function(e) {
    const index = e.currentTarget.dataset.index;
    const issue = this.data.healthStatus.issues[index];
    
    if (issue) {
      wx.showModal({
        title: issue.name,
        content: `描述：${issue.description || '无'}\n\n位置：${issue.location || '无'}\n\n建议：${issue.suggestion || '无'}`,
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#D4B083'
      });
    }
  },
  
  // 复制问题详情
  copyIssueDetail: function(e) {
    const index = e.currentTarget.dataset.index;
    const issue = this.data.healthStatus.issues[index];
    
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

  // 查看帮助页面
  viewHelp: function() {
    wx.navigateTo({
      url: '/pages/admin/tools/help/help'
    });
  },

  // 显示提示信息
  showToast: function(message, type = 'success') {
    this.setData({
      toast: {
        show: true,
        message: message,
        type: type
      }
    });
    
    setTimeout(() => {
      this.setData({ 'toast.show': false });
    }, 3000);
  },

  // 页面显示
  onShow: function() {
    // 页面显示时的逻辑
  },

  // 页面隐藏
  onHide: function() {
    // 页面隐藏时的逻辑
  },

  // 页面卸载
  onUnload: function() {
    // 页面卸载时的逻辑
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.refreshStatus();
    wx.stopPullDownRefresh();
  },

  // 触底加载
  onReachBottom: function() {
    // 触底加载逻辑
  },

  // 测试更新开发进度
  testUpdateProgress: function() {
    if (this.data.loading) return;
    
    this.setData({ loading: true, loadingText: '同步真实进度...' });
    
    // 调用云函数获取最新的开发进度（会自动从云存储读取）
    wx.cloud.callFunction({
      name: 'adminTools',
      data: {
        action: 'getDevelopmentProgress'
      }
    }).then((progressResult) => {
      if (progressResult.result.success) {
        const realPercentage = progressResult.result.data.percentage;
        console.log('获取到真实进度:', realPercentage);
        
        // 调用云函数更新开发进度
        return wx.cloud.callFunction({
          name: 'adminTools',
          data: {
            action: 'updateProgress',
            data: {
              percentage: realPercentage,
              completedTasks: 31,
              cloudFunctions: 14
            }
          }
        });
      } else {
        throw new Error('获取进度失败');
      }
    }).then((updateResult) => {
      console.log('更新进度结果:', updateResult);
      
      if (updateResult.result.success) {
        const realPercentage = updateResult.result.data.percentage;
        this.setData({ loading: false });
        this.showToast('进度同步成功，真实进度：' + realPercentage + '%', 'success');
        // 刷新状态以显示最新进度
        setTimeout(() => {
          this.refreshStatus();
        }, 500);
      } else {
        this.setData({ loading: false });
        this.showToast('进度同步失败: ' + (updateResult.result.message || '未知错误'), 'error');
      }
    }).catch((error) => {
      console.error('同步进度失败:', error);
      this.setData({ loading: false });
      this.showToast('进度同步失败: ' + error.message, 'error');
    });
  }
});