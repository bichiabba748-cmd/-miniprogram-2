Page({
  data: {
    healthStatus: {
      score: 95,
      level: 'good',
      description: '项目状态良好',
      consistency: 'good',
      permissions: 'good',
      components: 'good',
      issues: []
    },
    
    progressStatus: {
      percentage: 68,
      stage: '开发阶段',
      lastUpdated: '2026-01-30 14:30'
    },
    
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
    
    resourceStatus: {
      files: 229,
      lines: 17964,
      size: '1.8MB',
      functions: 14
    },
    
    functionStatus: {
      total: 12,
      highRisk: 0,
      avgResponse: 150
    },
    
    componentStatus: {
      total: 35,
      used: 28,
      usageRate: 80
    },
    
    autoBackup: true,
    debugMode: false,
    
    loading: false,
    loadingText: '加载中...',
    
    toast: {
      show: false,
      message: '',
      type: 'success'
    }
  },

  onLoad: function(options) {
    this.loadInitialData();
    this.loadConfig();
    this.refreshStatus = this.debounce(this.refreshStatus, 500);
    this.runHealthCheck = this.debounce(this.runHealthCheck, 1000);
    this.manualBackup = this.debounce(this.manualBackup, 2000);
  },

  loadInitialData: function() {
    this.setData({ loading: true, loadingText: '加载项目数据...' });
    
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

  loadConfig() {
    try {
      const config = wx.getStorageSync('system_config');
      if (config) {
        this.setData({
          autoBackup: config.autoBackup !== false,
          debugMode: config.debugMode || false
        });
      }
    } catch (err) {
      console.error('加载配置失败:', err);
    }
  },

  saveConfig() {
    try {
      wx.setStorageSync('system_config', {
        autoBackup: this.data.autoBackup,
        debugMode: this.data.debugMode
      });
    } catch (err) {
      console.error('保存配置失败:', err);
    }
  },

  onAutoBackupChange(e) {
    this.setData({
      autoBackup: e.detail.value
    });
    this.saveConfig();
    wx.showToast({
      title: this.data.autoBackup ? '已开启自动备份' : '已关闭自动备份',
      icon: 'none'
    });
  },

  onDebugModeChange(e) {
    this.setData({
      debugMode: e.detail.value
    });
    this.saveConfig();
    wx.showToast({
      title: this.data.debugMode ? '已开启调试模式' : '已关闭调试模式',
      icon: 'none'
    });
  },

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

  debounce: function(func, delay) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  },

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

  refreshStatus: function() {
    if (this.data.loading) return;
    
    this.setData({ loading: true, loadingText: '刷新状态...' });
    
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

  viewProgressDetail: function() {
    wx.navigateTo({
      url: '/pages/admin/tools/detail/progress-detail'
    });
  },

  runHealthCheck: function() {
    if (this.data.loading) return;
    
    this.setData({ loading: true, loadingText: '运行健康检查...' });
    
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

  manualBackup: function() {
    wx.showModal({
      title: '手动备份',
      content: '确定要执行手动备份吗？这将创建当前项目的完整备份。',
      success: (res) => {
        if (res.confirm) {
          if (this.data.loading) return;
          
          this.setData({ loading: true, loadingText: '执行备份...' });
          
          wx.cloud.callFunction({
            name: 'adminTools',
            data: {
              action: 'manualBackup'
            }
          }).then((result) => {
            console.log('备份结果:', result);
            
            if (result.result.success) {
              const backupData = result.result.data;
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

  viewResourceDetail: function() {
    wx.navigateTo({
      url: '/pages/admin/tools/detail/resource-detail'
    });
  },

  viewFunctionDetail: function() {
    wx.navigateTo({
      url: '/pages/admin/tools/detail/function-detail'
    });
  },

  viewComponentDetail: function() {
    wx.navigateTo({
      url: '/pages/admin/tools/detail/component-detail'
    });
  },

  goToTestCenter: function() {
    wx.navigateTo({
      url: '/pages/test/test'
    });
  },
  
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

  viewHelp: function() {
    wx.navigateTo({
      url: '/pages/admin/tools/help/help'
    });
  },

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

  onShow: function() {
  },

  onHide: function() {
  },

  onUnload: function() {
  },

  onPullDownRefresh: function() {
    this.refreshStatus();
    wx.stopPullDownRefresh();
  },

  onReachBottom: function() {
  },

  testUpdateProgress: function() {
    if (this.data.loading) return;
    
    this.setData({ loading: true, loadingText: '同步真实进度...' });
    
    wx.cloud.callFunction({
      name: 'adminTools',
      data: {
        action: 'getDevelopmentProgress'
      }
    }).then((progressResult) => {
      if (progressResult.result.success) {
        const realPercentage = progressResult.result.data.percentage;
        console.log('获取到真实进度:', realPercentage);
        
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
  },

  onInitArticleData() {
    wx.showModal({
      title: '确认操作',
      content: '将初始化22条高质量文案数据，确定执行？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '初始化中...' });
          
          try {
            const result = await wx.cloud.callFunction({
              name: 'init_articles'
            });
            
            wx.hideLoading();
            
            if (result.result.code === 0) {
              wx.showToast({
                title: `成功初始化${result.result.data.count}条文案`,
                icon: 'success',
                duration: 2000
              });
            } else {
              wx.showModal({
                title: '提示',
                content: result.result.message,
                showCancel: false
              });
            }
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '初始化失败', icon: 'none' });
            console.error(err);
          }
        }
      }
    });
  },

  onInitCourseData() {
    wx.showModal({
      title: '确认操作',
      content: '将初始化24门课程数据，确定执行？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '初始化中...' });
          
          try {
            const result = await wx.cloud.callFunction({
              name: 'init_courses'
            });
            
            wx.hideLoading();
            
            if (result.result.code === 0) {
              wx.showToast({
                title: `成功初始化${result.result.data.count}门课程`,
                icon: 'success',
                duration: 2000
              });
            } else {
              wx.showModal({
                title: '提示',
                content: result.result.message,
                showCancel: false
              });
            }
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '初始化失败', icon: 'none' });
            console.error(err);
          }
        }
      }
    });
  },

  onInitDailyData() {
    wx.showModal({
      title: '确认操作',
      content: '将生成30条文案+9张图片占位记录，确定执行？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '初始化中...' });
          
          try {
            const result = await wx.cloud.callFunction({
              name: 'init_daily_materials'
            });
            
            wx.hideLoading();
            
            if (result.result.code === 0) {
              wx.showToast({
                title: `成功生成${result.result.data.count}条`,
                icon: 'success',
                duration: 2000
              });
            } else {
              wx.showModal({
                title: '提示',
                content: result.result.message,
                showCancel: false
              });
            }
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '初始化失败', icon: 'none' });
            console.error(err);
          }
        }
      }
    });
  },

  onInitTestData() {
    wx.showModal({
      title: '确认操作',
      content: '将初始化5条战绩审核和4条入伍申请测试数据，确定执行？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '初始化中...' });
          
          try {
            const result = await wx.cloud.callFunction({
              name: 'init_test_data'
            });
            
            wx.hideLoading();
            
            if (result.result.code === 0) {
              wx.showToast({
                title: `成功初始化${result.result.data.reportsCount}条战绩+${result.result.data.applicationsCount}条申请`,
                icon: 'success',
                duration: 2000
              });
            } else {
              wx.showModal({
                title: '提示',
                content: result.result.message,
                showCancel: false
              });
            }
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '初始化失败', icon: 'none' });
            console.error(err);
          }
        }
      }
    });
  },

  onInitTestData() {
    wx.showModal({
      title: '确认操作',
      content: '将初始化战绩审核和入伍申请的测试数据，确定执行？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '初始化中...' });
          
          try {
            const result = await wx.cloud.callFunction({
              name: 'init_test_data'
            });
            
            wx.hideLoading();
            
            if (result.result.code === 0) {
              wx.showToast({
                title: `成功初始化${result.result.data.reportsCount}条战绩+${result.result.data.applicationsCount}条申请`,
                icon: 'success',
                duration: 2000
              });
            } else {
              wx.showModal({
                title: '提示',
                content: result.result.message,
                showCancel: false
              });
            }
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '初始化失败', icon: 'none' });
            console.error(err);
          }
        }
      }
    });
  }
});
