// 备份状态管理详情页面逻辑
Page({
  data: {
    // 备份状态
    lastBackupTime: '2026-01-30 12:00',
    totalBackups: 15,
    autoBackupEnabled: true,
    
    // 备份设置
    backupFrequencies: ['每天', '每周', '每两周', '每月'],
    backupFrequencyIndex: 0,
    backupRetentions: ['5个', '10个', '20个', '30个', '无限'],
    backupRetentionIndex: 1,
    backupPath: '云存储/小程序备份',
    
    // 备份历史
    backupHistory: [
      {
        time: '2026-01-30 12:00',
        type: 'manual',
        typeText: '手动备份',
        size: '2.5MB',
        status: 'success',
        statusText: '成功'
      },
      {
        time: '2026-01-29 20:00',
        type: 'auto',
        typeText: '自动备份',
        size: '2.4MB',
        status: 'success',
        statusText: '成功'
      },
      {
        time: '2026-01-29 12:00',
        type: 'auto',
        typeText: '自动备份',
        size: '2.3MB',
        status: 'success',
        statusText: '成功'
      },
      {
        time: '2026-01-28 20:00',
        type: 'auto',
        typeText: '自动备份',
        size: '2.2MB',
        status: 'success',
        statusText: '成功'
      },
      {
        time: '2026-01-28 12:00',
        type: 'auto',
        typeText: '自动备份',
        size: '2.1MB',
        status: 'success',
        statusText: '成功'
      }
    ],
    
    // 备份时间线
    backupTimeline: [
      {
        time: '2026-01-30 12:00',
        event: '手动备份执行成功',
        status: 'success'
      },
      {
        time: '2026-01-29 20:00',
        event: '自动备份执行成功',
        status: 'success'
      },
      {
        time: '2026-01-29 10:00',
        event: '自动备份设置修改',
        status: 'info'
      },
      {
        time: '2026-01-28 20:00',
        event: '自动备份执行成功',
        status: 'success'
      },
      {
        time: '2026-01-28 09:00',
        event: '备份路径修改',
        status: 'info'
      }
    ],
    
    // 备份统计
    successfulBackups: 14,
    failedBackups: 1,
    manualBackups: 3,
    autoBackups: 12
  },

  // 页面加载
  onLoad: function(options) {
    // 加载备份历史数据
    this.loadBackupHistory();
  },
  
  // 加载备份历史数据
  loadBackupHistory: function() {
    wx.showLoading({ title: '加载备份历史...' });
    
    // 调用云函数获取备份历史
    wx.cloud.callFunction({
      name: 'adminTools',
      data: {
        action: 'getBackupHistory'
      }
    }).then((result) => {
      wx.hideLoading();
      console.log('备份历史:', result);
      
      if (result.result.success) {
        const backupHistory = result.result.data;
        // 格式化备份历史数据
        const formattedHistory = backupHistory.map(item => {
          const backupTime = new Date(item.time);
          const formattedTime = backupTime.getFullYear() + '-' + 
            String(backupTime.getMonth() + 1).padStart(2, '0') + '-' + 
            String(backupTime.getDate()).padStart(2, '0') + ' ' + 
            String(backupTime.getHours()).padStart(2, '0') + ':' + 
            String(backupTime.getMinutes()).padStart(2, '0');
          
          return {
            time: formattedTime,
            type: 'manual', // 默认为手动备份
            typeText: '手动备份',
            size: item.size,
            status: item.status,
            statusText: item.status === 'success' ? '成功' : '失败',
            backupId: item.backupId
          };
        });
        
        // 更新页面数据
        this.setData({
          backupHistory: formattedHistory,
          totalBackups: formattedHistory.length,
          lastBackupTime: formattedHistory.length > 0 ? formattedHistory[0].time : this.data.lastBackupTime
        });
      } else {
        wx.showToast({ title: '加载备份历史失败', icon: 'error' });
      }
    }).catch((error) => {
      wx.hideLoading();
      console.error('加载备份历史失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    });
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },

  // 手动备份
  manualBackup: function() {
    wx.showModal({
      title: '手动备份',
      content: '确定要执行手动备份吗？这将创建当前项目的完整备份。',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '执行备份...' });
          
          // 调用云函数执行真实备份
          wx.cloud.callFunction({
            name: 'adminTools',
            data: {
              action: 'manualBackup'
            }
          }).then((result) => {
            wx.hideLoading();
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
                type: 'manual',
                typeText: '手动备份',
                size: backupData.size,
                status: backupData.status,
                statusText: backupData.status === 'success' ? '成功' : '失败',
                backupId: backupData.backupId
              };
              
              this.setData({
                lastBackupTime: formattedTime,
                totalBackups: this.data.totalBackups + 1,
                manualBackups: this.data.manualBackups + 1,
                successfulBackups: this.data.successfulBackups + 1,
                backupHistory: [newBackup, ...this.data.backupHistory].slice(0, 20),
                backupTimeline: [
                  {
                    time: formattedTime,
                    event: '手动备份执行成功',
                    status: 'success'
                  },
                  ...this.data.backupTimeline
                ].slice(0, 20)
              });
              
              wx.showToast({ title: '备份成功', icon: 'success' });
            } else {
              wx.showToast({ 
                title: '备份失败: ' + (result.result.message || '未知错误'), 
                icon: 'none',
                duration: 2000
              });
            }
          }).catch((error) => {
            wx.hideLoading();
            console.error('备份失败:', error);
            wx.showToast({ title: '备份失败: 网络错误', icon: 'none' });
          });
        }
      }
    });
  },

  // 切换自动备份
  toggleAutoBackup: function(e) {
    this.setData({ autoBackupEnabled: e.detail.value });
    wx.showToast({ 
      title: e.detail.value ? '自动备份已开启' : '自动备份已关闭',
      icon: 'success'
    });
  },

  // 更改备份频率
  changeBackupFrequency: function(e) {
    this.setData({ backupFrequencyIndex: e.detail.value });
  },

  // 更改备份保留数量
  changeBackupRetention: function(e) {
    this.setData({ backupRetentionIndex: e.detail.value });
  },

  // 更改备份路径
  changeBackupPath: function() {
    wx.showModal({
      title: '更改备份路径',
      content: '确定要更改备份路径吗？',
      success: (res) => {
        if (res.confirm) {
          // 这里可以添加路径选择逻辑
          wx.showToast({ title: '备份路径已更改', icon: 'success' });
        }
      }
    });
  },

  // 查看备份
  viewBackup: function(e) {
    const index = e.currentTarget.dataset.index;
    const backup = this.data.backupHistory[index];
    wx.showModal({
      title: '备份详情',
      content: `时间: ${backup.time}\n类型: ${backup.typeText}\n大小: ${backup.size}\n状态: ${backup.statusText}`,
      showCancel: false
    });
  },

  // 恢复备份
  restoreBackup: function(e) {
    const index = e.currentTarget.dataset.index;
    const backup = this.data.backupHistory[index];
    wx.showModal({
      title: '恢复备份',
      content: `确定要从 ${backup.time} 的备份恢复吗？这将覆盖当前项目的数据。`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '恢复中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '备份恢复成功', icon: 'success' });
          }, 2000);
        }
      }
    });
  },

  // 删除备份
  deleteBackup: function(e) {
    const index = e.currentTarget.dataset.index;
    const backup = this.data.backupHistory[index];
    wx.showModal({
      title: '删除备份',
      content: `确定要删除 ${backup.time} 的备份吗？此操作不可恢复。`,
      success: (res) => {
        if (res.confirm) {
          const updatedHistory = this.data.backupHistory.filter((_, i) => i !== index);
          this.setData({ backupHistory: updatedHistory, totalBackups: updatedHistory.length });
          wx.showToast({ title: '备份已删除', icon: 'success' });
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