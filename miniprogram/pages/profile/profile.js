const app = getApp();
const db = wx.cloud.database();
const { RoleManager } = require('../../utils/roleManager.js');

/**
 * 数据库索引建议
 * 索引建议：组合索引: _openid: 升序, createdAt: 降序
 * 集合名称: reports
 * 建议在云开发控制台中为该集合创建此组合索引，以提高查询性能
 * 
 * 创建步骤：
 * 1. 打开云开发控制台
 * 2. 进入数据库 -> 集合 -> reports
 * 3. 点击索引管理
 * 4. 点击添加索引
 * 5. 字段1: _openid, 排序: 升序
 * 6. 字段2: createdAt, 排序: 降序
 * 7. 点击确定创建
 */

Page({
  data: {
    userRole: 'visitor',
    roleName: '李销冠',
    roleDesc: '滨海店',
    userInfo: {
      avatarUrl: ''
    },
    myOpenId: '',
    cloudUserData: null,
    isNewcomer: true, // 模拟新主播数据
    myStats: { courseProgress: 45, collectionCount: 12, studyDuration: 0, rank: 0, contributionCount: 0, leadsCount: 0, showings: 0 },
    lastCourse: { title: '从0到1：主播起号全攻略', progress: 65 },
    medals: [
      { name: '初出茅庐', icon: '🌱', locked: false, progress: 100, condition: '完成首次登录并加入星火计划' },
      { name: '获客达人', icon: '🎯', locked: false, progress: 60, condition: '累计获客10组，当前进度：6/10' },
      { name: '军火专家', icon: '⚔️', locked: true, progress: 30, condition: '累计收藏30篇文案，当前进度：9/30' },
      { name: '百人斩', icon: '🔥', locked: true, progress: 10, condition: '累计获客100组，当前进度：10/100' }
    ],
    showMedalModal: false,
    currentMedal: null,
    displayRank: [
      { id: 1, name: '王金牌', store: '河西大悦城店', stats: { leads: 158, showings: 45 } },
      { id: 2, name: '陈店长', store: '南开鼓楼店', stats: { leads: 120, showings: 38 } },
      { id: 3, name: '李销冠', store: '和平万象城店', stats: { leads: 98, showings: 32 } },
      { id: 4, name: '张主播', store: '河东万达店', stats: { leads: 87, showings: 28 } },
      { id: 5, name: '刘经理', store: '河北意风区店', stats: { leads: 76, showings: 25 } }
    ],
    avatarClickCount: 0
  },

  onShow() {
    console.log('[onShow] 页面显示，开始更新身份');
    this.updateIdentity();
    this.loadCloudData();
  },

  updateIdentity() {
    const roleCode = RoleManager.getCurrentRole();
    const roleDisplayName = RoleManager.getRoleDisplayText();
    
    console.log('[updateIdentity] 更新角色:', roleCode, roleDisplayName);
    
    this.setData({
      userRole: roleCode,
      roleName: roleDisplayName,
      roleDesc: '星火计划参与者',
      isNewcomer: true // 模拟新主播数据
    }, () => {
      console.log('[updateIdentity] setData回调完成，当前userRole:', this.data.userRole);
    });
  },

  // Task 1: 恢复云函数调用，替换模拟数据
  loadCloudData() {
    // 显示加载状态
    wx.showLoading({ title: '数据同步中...', icon: 'none' });
    
    // 传入当前角色，用于测试角色切换时显示对应勋章
    const currentRole = this.data.userRole;
    console.log('[loadCloudData] 当前角色:', currentRole, '完整数据:', this.data);
    
    wx.cloud.callFunction({
      name: 'getProfileData',
      data: {
        role: currentRole
      },
      success: res => {
        console.log('[getProfileData] 调用成功：', res);
        const { code, data } = res.result;
        
        if (code === 0 && data) {
          // 调试信息：显示返回的数据结构
          console.log('[getProfileData] 返回数据：', {
            role: data.role,
            medalsCount: data.medals ? data.medals.length : 0,
            medals: data.medals
          });
          
          // 1. 更新角色（以云端为准，或者仅做校验）
          // const cloudRole = data.role;
          // if (cloudRole && cloudRole !== this.data.userRole) {
          //   // 可选：强制同步角色，或者仅提示
          // }

          // 1.5 更新用户信息（昵称和头像）
          if (data.userInfo) {
            this.setData({
              'userInfo.nickName': data.userInfo.nickName,
              'userInfo.avatarUrl': data.userInfo.avatarUrl
            });
          }

          // 2. 处理仪表盘数据映射
          this.processDashboardData(data.dashboard);

          // 3. 处理勋章数据
          if (data.medals && data.medals.length > 0) {
            console.log('[勋章数据] 角色:', data.role, '勋章数量:', data.medals.length);
            data.medals.forEach((medal, index) => {
              console.log(`[勋章${index}]`, medal.name, medal.icon, 'locked:', medal.locked);
            });
            this.setData({ medals: data.medals });
          }
          
          // 4. 处理排名信息 (如果有)
          if (data.rankInfo) {
             // 如果云函数返回了具体的排名列表，可以在这里更新 displayRank
             // 目前云函数似乎只返回了 dashboard 里的排名数值
          }
        }
        wx.hideLoading();
      },
      fail: err => {
        console.error('[getProfileData] 调用失败：', err);
        wx.hideLoading();
        wx.showToast({ title: '数据同步失败', icon: 'none' });
        // 失败时保持默认数据，不覆盖
      }
    });
  },

  // 将云端 dashboard 数组映射为本地 myStats 对象
  processDashboardData(dashboard) {
    if (!dashboard || !Array.isArray(dashboard)) return;

    let newStats = { ...this.data.myStats };

    dashboard.forEach(item => {
      const val = item.value;
      switch (item.label) {
        case '学习进度':
          // 去掉百分号转数字
          newStats.courseProgress = parseInt(val) || 0;
          break;
        case '收藏文案':
          newStats.collectionCount = parseInt(val) || 0;
          break;
        case '学习时长':
          newStats.studyDuration = parseInt(val) || 0;
          break;
        case '全量排名':
          newStats.rank = (val === '未上榜') ? 0 : (parseInt(val) || 0);
          break;
        case '贡献':
          newStats.contributionCount = parseInt(val) || 0;
          break;
        case '累计获客':
          newStats.leadsCount = parseInt(val) || 0;
          break;
        case '带看':
          newStats.showings = parseInt(val) || 0;
          break;
      }
    });

    this.setData({ myStats: newStats });
  },

  updateStats(cloudUserData) {
    // 此方法已废弃，逻辑合并入 processDashboardData
  },

  handleRoleSwitch() {
    // 第一页：显示常用角色 + "更多角色"选项
    const mainRoles = [
      '外部访客 (Visitor)',
      '星火学员 (Student)',
      '实战主播 (Anchor)',
      '内部经纪人 (Broker)',
      'C端客户 (Customer)',
      '更多角色 >'
    ];

    wx.showActionSheet({
      itemList: mainRoles,
      success: (res) => {
        const tapIndex = res.tapIndex;
        
        // 如果点击"更多角色"，显示第二页
        if (tapIndex === 5) {
          this.showMoreRoles();
          return;
        }

        // 映射到实际角色代码
        const roles = [
          { code: 'visitor', name: '外部访客 (Visitor)' },
          { code: 'student', name: '星火学员 (Student)' },
          { code: 'anchor', name: '实战主播 (Anchor)' },
          { code: 'broker', name: '内部经纪人 (Broker)' },
          { code: 'customer', name: 'C端客户 (Customer)' }
        ];
        const selectedRole = roles[tapIndex];
        
        if (selectedRole.code === 'broker') {
          // 经纪人需要选择业务类型
          wx.showActionSheet({
            itemList: ['租赁经纪人 (Rental)', '二手房经纪人 (Trading)', '新房经纪人 (New House)'],
            success: (res2) => {
              const businessTypes = ['rental', 'trading', 'new_house'];
              const businessType = businessTypes[res2.tapIndex];
              
              RoleManager.setRole('broker');
              const app = getApp();
              app.globalData.userProfile = { business_type: businessType };
              wx.setStorageSync('currentRole', 'broker');
              wx.setStorageSync('businessType', businessType);
              
              this.updateIdentity();
              this.loadCloudData();
              wx.vibrateShort();
              
              const typeNames = { rental: '租赁', trading: '二手房', new_house: '新房' };
              wx.showToast({ title: `已切换: ${typeNames[businessType]}经纪人`, icon: 'none' });
            }
          });
        } else {
          // 其他角色直接切换
          this.switchToRole(selectedRole.code, selectedRole.name);
        }
      },
      fail: (res) => {
        console.log('取消切换');
      }
    });
  },

  // 新增方法：显示更多角色
  showMoreRoles() {
    const moreRoles = [
      '租户 (Tenant)',
      '管理员 (Admin)',
      '< 返回上一页'
    ];

    wx.showActionSheet({
      itemList: moreRoles,
      success: (res) => {
        const tapIndex = res.tapIndex;
        
        // 如果点击"返回"，重新显示第一页
        if (tapIndex === 2) {
          this.handleRoleSwitch();
          return;
        }

        // 映射到实际角色代码
        const roleCodes = ['tenant', 'admin'];
        const selectedCode = roleCodes[tapIndex];
        
        this.switchToRole(selectedCode, moreRoles[tapIndex]);
      },
      fail: (res) => {
        console.log('取消切换');
      }
    });
  },

  // 新增方法：统一切换角色逻辑
  switchToRole(roleCode, roleName) {
    RoleManager.setRole(roleCode);
    wx.setStorageSync('currentRole', roleCode);
    this.updateIdentity();
    
    // 确保角色更新后再加载数据
    setTimeout(() => {
      this.loadCloudData();
    }, 100);
    
    wx.vibrateShort();
    wx.showToast({ title: `已切换: ${roleName}`, icon: 'none' });
    
    // 如果切换到租户角色，跳转到租户首页
    if (roleCode === 'tenant') {
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/tenant/tenant',
          fail: (err) => {
            console.error('跳转租户首页失败:', err);
            wx.showToast({ title: '租户首页加载失败', icon: 'none' });
          }
        });
      }, 800); // 延迟 800ms，让 Toast 提示显示完整
    }
  },

  handleAvatarClick() {
    let avatarClickCount = this.data.avatarClickCount + 1;
    this.setData({ avatarClickCount });
    
    if (avatarClickCount === 5) {
      this.setData({ avatarClickCount: 0 });
      
      wx.showModal({
        title: '上帝模式',
        content: '',
        editable: true,
        placeholderText: '请输入密码',
        success: res => {
          if (res.confirm) {
            const password = res.content;
            
            if (password === '123456') {
              RoleManager.setRole('admin');
              this.updateIdentity();
              wx.showToast({ title: '身份已提升', icon: 'success' });
              setTimeout(() => {
                wx.navigateTo({ url: '/pages/admin/admin' });
              }, 800);
            } else {
              wx.showToast({ title: '密码错误', icon: 'none' });
            }
          }
        }
      });
    }
  },

  handleViewTap() {
    const userRole = this.data.userRole;
    if (userRole === 'visitor') {
      wx.navigateTo({ url: '/pages/join/join' });
      return false;
    }
    return true;
  },

  goToCourse() {
    if (this.handleViewTap()) {
      wx.switchTab({ url: '/pages/course/course' });
    }
  },
  goToJoin() {
    wx.navigateTo({ url: '/pages/join/join' });
  },
  goToArtCollection() {
    if (this.handleViewTap()) {
      wx.navigateTo({
        url: '/pages/collections/collections',
        fail: (err) => {
          console.error('跳转收藏页面失败:', err);
          wx.showToast({ title: '收藏功能部署中', icon: 'none' });
        }
      });
    }
  },
  // Task 4: 修复跳转 - 确保调用正确的跳转方法
  goToContribute() {
    // 目标路径来源：参照 art.js 中的发布逻辑
    const url = '/pages/contribute/contribute';
    
    wx.navigateTo({
      url: url,
      fail: (err) => {
        console.error('跳转失败:', err);
        // 容错处理：如果新页面未配置，提示用户
        wx.showToast({ title: '提报功能部署中', icon: 'none' });
      }
    });
  },
  
  goToRank(e) {
    const tab = e.currentTarget.dataset.tab;
    wx.navigateTo({
      url: `/pages/rank/rank?tab=${tab}`,
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({ 
          title: `进入${tab === 'new' ? '新秀' : '全区'}榜单`, 
          icon: 'none' 
        });
      }
    });
  },
  
  // 显示勋章详情弹窗
  showMedalDetail(e) {
    const index = e.currentTarget.dataset.index;
    const medal = this.data.medals[index];
    
    this.setData({
      currentMedal: medal,
      showMedalModal: true
    });
  },
  
  // 关闭勋章详情弹窗
  closeMedalModal() {
    this.setData({ showMedalModal: false });
  }
})