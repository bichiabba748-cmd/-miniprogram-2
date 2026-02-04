const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    userId: '',
    user: {
      avatar: '',
      name: '',
      uid: '',
      joinDays: 0,
      badge: '',
      role: '',
      realName: '',
      phone: '',
      storeName: '',
      storeId: '',
      totalLeads: 0,
      monthLeads: 0,
      contributions: 0,
      studyProgress: 0,
      coursesCompleted: 0,
      studyHours: 0,
      status: 'normal',
      application: null
    }
  },

  onLoad(options) {
    const userId = options.id;
    const isMock = options.isMock === 'true';
    
    this.setData({ userId });
    
    if (isMock) {
      this.loadMockData();
    } else {
      this.loadUserDetail(userId);
    }
  },

  loadMockData() {
    try {
      const mockUser = app.globalData.mockUserData;
      
      if (!mockUser) {
        wx.showToast({ title: '模拟数据不存在', icon: 'none' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        return;
      }
      
      const joinDays = mockUser.joinTime ? Math.floor((Date.now() - new Date(mockUser.joinTime).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      let badge = '';
      if (mockUser.role === 'broker') {
        if (mockUser.totalLeads >= 100) {
          badge = '金牌经纪人';
        } else if (mockUser.totalLeads >= 50) {
          badge = '银牌经纪人';
        } else if (mockUser.totalLeads >= 20) {
          badge = '铜牌经纪人';
        }
      } else if (mockUser.role === 'anchor') {
        if (mockUser.contributions >= 50) {
          badge = '金牌主播';
        } else if (mockUser.contributions >= 20) {
          badge = '银牌主播';
        }
      } else if (mockUser.role === 'student') {
        if (mockUser.studyProgress >= 100) {
          badge = '优秀学员';
        } else if (mockUser.studyProgress >= 80) {
          badge = '进步学员';
        }
      }

      this.setData({
        user: {
          avatar: mockUser.avatar || '',
          name: mockUser.name || '未设置',
          uid: mockUser.id.substring(0, 8),
          joinDays,
          badge,
          role: mockUser.role || 'visitor',
          realName: mockUser.name || '未设置',
          phone: mockUser.phone || '未设置',
          storeName: mockUser.storeName || '未设置',
          storeId: mockUser.storeId || '',
          totalLeads: mockUser.totalLeads || 0,
          monthLeads: mockUser.monthLeads || 0,
          contributions: mockUser.contributions || 0,
          studyProgress: mockUser.studyProgress || 0,
          coursesCompleted: mockUser.coursesCompleted || 0,
          studyHours: mockUser.studyHours || 0,
          status: mockUser.status || 'normal',
          application: mockUser.application || null
        }
      });
    } catch (err) {
      console.error('加载模拟数据失败:', err);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  loadUserDetail(userId) {
    wx.showLoading({ title: '加载中...' });

    db.collection('users').doc(userId).get()
    .then(userRes => {
      const user = userRes.data;

      if (!user) {
        wx.hideLoading();
        wx.showToast({ title: '用户不存在', icon: 'none' });
        return;
      }

      const joinDays = user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      let badge = '';
      if (user.role === 'broker') {
        if (user.stats?.totalLeads >= 100) {
          badge = '金牌经纪人';
        } else if (user.stats?.totalLeads >= 50) {
          badge = '银牌经纪人';
        } else if (user.stats?.totalLeads >= 20) {
          badge = '铜牌经纪人';
        }
      } else if (user.role === 'anchor') {
        if (user.stats?.contributions >= 50) {
          badge = '金牌主播';
        } else if (user.stats?.contributions >= 20) {
          badge = '银牌主播';
        }
      } else if (user.role === 'student') {
        if (user.stats?.studyProgress >= 100) {
          badge = '优秀学员';
        } else if (user.stats?.studyProgress >= 80) {
          badge = '进步学员';
        }
      }

      // 构建入伍档案信息（从用户数据中获取）
      const application = user.identity ? {
        identity: user.identity,
        painPoints: user.painPoints || [],
        channel: user.channel || '扫码',
        inviter: user.inviter || '',
        createdAt: user.createdAt
      } : null;

      this.setData({
        user: {
          avatar: user.profile?.avatar || '',
          name: user.profile?.nickname || user.name || '未设置',
          uid: user._id.substring(0, 8),
          joinDays,
          badge,
          role: user.role || 'visitor',
          realName: user.name || '未设置',
          phone: user.profile?.phone ? this.maskPhone(user.profile.phone) : '未设置',
          storeName: user.storeName || '未设置',
          storeId: user.storeId || '',
          totalLeads: user.stats?.totalLeads || 0,
          monthLeads: user.stats?.monthLeads || 0,
          contributions: user.stats?.contributions || 0,
          studyProgress: user.stats?.studyProgress || 0,
          coursesCompleted: user.stats?.coursesCompleted || 0,
          studyHours: user.stats?.studyHours || 0,
          status: user.status || 'normal',
          application
        }
      });

      wx.hideLoading();
    })
    .catch(err => {
      wx.hideLoading();
      console.error('加载用户详情失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  maskPhone(phone) {
    if (!phone) return '';
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  },

  copyPhone() {
    const phone = this.data.user.phone.replace(/\*/g, '');
    wx.setClipboardData({
      data: phone,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  },

  changeStore() {
    wx.navigateTo({
      url: '/pages/admin/store-manage/store-manage'
    });
  },

  setStatus(e) {
    const status = e.currentTarget.dataset.status;
    const statusText = status === 'normal' ? '正常' : '禁言';
    
    wx.showModal({
      title: '确认操作',
      content: `确定将账号状态设置为"${statusText}"？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          db.collection('users').doc(this.data.userId).update({
            data: {
              status: status,
              updatedAt: db.serverDate()
            }
          })
          .then(() => {
            this.setData({ 'user.status': status });
            wx.hideLoading();
            wx.showToast({ title: '设置成功', icon: 'success' });
          })
          .catch(err => {
            wx.hideLoading();
            console.error('设置状态失败:', err);
            wx.showToast({ title: '设置失败', icon: 'none' });
          });
        }
      }
    });
  },

  callUser() {
    const phone = this.data.user.phone.replace(/\*/g, '');
    wx.showModal({
      title: '拨打电话',
      content: phone,
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: phone });
        }
      }
    });
  },

  changePermission() {
    wx.showActionSheet({
      itemList: ['修改角色', '修改业务类型', '查看权限详情'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.changeRole();
        } else if (res.tapIndex === 1) {
          this.changeBusinessType();
        } else if (res.tapIndex === 2) {
          this.viewPermissions();
        }
      }
    });
  },

  changeRole() {
    const roles = ['visitor', 'student', 'anchor', 'broker', 'tenant', 'admin'];
    const roleNames = ['访客', '学员', '主播', '经纪人', '租客', '管理员'];
    
    wx.showActionSheet({
      itemList: roleNames,
      success: (res) => {
        const newRole = roles[res.tapIndex];
        wx.showModal({
          title: '确认修改',
          content: `确定将角色修改为"${roleNames[res.tapIndex]}"？`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.showLoading({ title: '处理中...' });
              
              db.collection('users').doc(this.data.userId).update({
                data: {
                  role: newRole,
                  updatedAt: db.serverDate()
                }
              })
              .then(() => {
                this.setData({ 'user.role': newRole });
                wx.hideLoading();
                wx.showToast({ title: '修改成功', icon: 'success' });
              })
              .catch(err => {
                wx.hideLoading();
                console.error('修改角色失败:', err);
                wx.showToast({ title: '修改失败', icon: 'none' });
              });
            }
          }
        });
      }
    });
  },

  changeBusinessType() {
    if (this.data.user.role !== 'broker') {
      wx.showToast({ title: '仅经纪人可设置业务类型', icon: 'none' });
      return;
    }
    
    const businessTypes = ['rental', 'trading', 'new_house'];
    const typeNames = ['租赁', '买卖', '新房'];
    
    wx.showActionSheet({
      itemList: typeNames,
      success: (res) => {
        const newType = businessTypes[res.tapIndex];
        wx.showModal({
          title: '确认修改',
          content: `确定将业务类型修改为"${typeNames[res.tapIndex]}"？`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.showLoading({ title: '处理中...' });
              
              db.collection('users').doc(this.data.userId).update({
                data: {
                  business_type: newType,
                  updatedAt: db.serverDate()
                }
              })
              .then(() => {
                this.setData({ 'user.businessType': newType });
                wx.hideLoading();
                wx.showToast({ title: '修改成功', icon: 'success' });
              })
              .catch(err => {
                wx.hideLoading();
                console.error('修改业务类型失败:', err);
                wx.showToast({ title: '修改失败', icon: 'none' });
              });
            }
          }
        });
      }
    });
  },

  viewPermissions() {
    const user = this.data.user;
    const permissions = [];
    
    if (user.role === 'visitor') {
      permissions.push('查看公开内容');
    } else if (user.role === 'student') {
      permissions.push('查看公开内容', '学习课程', '查看内部文案');
    } else if (user.role === 'anchor') {
      permissions.push('查看所有内容', '提报战绩', '提报文案');
    } else if (user.role === 'broker') {
      permissions.push('查看所有内容', '提报战绩', '管理客户', '管理合同');
    } else if (user.role === 'admin') {
      permissions.push('所有权限');
    }
    
    wx.showModal({
      title: '权限详情',
      content: permissions.join('\n'),
      showCancel: false
    });
  }
});
