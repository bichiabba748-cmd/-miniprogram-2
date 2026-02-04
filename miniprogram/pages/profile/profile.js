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
    this.updateIdentity();
    this.loadCloudData();
  },

  updateIdentity() {
    const roleCode = RoleManager.getCurrentRole();
    const roleDisplayName = RoleManager.getRoleDisplayText();
    
    this.setData({
      userRole: roleCode,
      roleName: roleDisplayName,
      roleDesc: '星火计划参与者',
      isNewcomer: true // 模拟新主播数据
    });
  },

  // Task 1: 暴力止血 - 注释掉所有wx.cloud.callFunction调用
  loadCloudData() {
    // 显示加载状态
    wx.showLoading({ title: '网络连接中...', icon: 'none' });
    
    // 暴力止血：注释掉所有cloud.callFunction调用
    // wx.cloud.callFunction({
    //   name: 'login',
    //   success: res => {
    //     const myOpenId = res.result.openid;
    //     this.setData({ myOpenId });
    //     
    //     const localRole = wx.getStorageSync('currentRole') || 'visitor';
    //     
    //     db.collection('users').doc(myOpenId).get().then(res => {
    //       const cloudUserData = res.data;
    //       this.setData({ cloudUserData });
    //       this.updateStats(cloudUserData);
    //       wx.hideLoading();
    //     }).catch(err => {
    //       console.error('获取用户数据失败：', err);
    //       wx.hideLoading();
    //       this.updateStats(null);
    //     });
    //   },
    //   fail: err => {
    //     console.error('获取openid失败：', err);
    //     wx.hideLoading();
    //     this.updateStats(null);
    //   }
    // });
    
    // Task 1: 使用setTimeout模拟网络请求
    setTimeout(() => {
      // 模拟成功获取数据
      const mockUserData = {
        courseProgress: Math.floor(Math.random() * 100),
        collectionCount: Math.floor(Math.random() * 50),
        studyDuration: Math.floor(Math.random() * 100),
        rank: Math.floor(Math.random() * 100),
        contributionCount: Math.floor(Math.random() * 30),
        leadsCount: Math.floor(Math.random() * 200),
        showings: Math.floor(Math.random() * 150)
      };
      
      this.setData({
        cloudUserData: mockUserData
      });
      
      this.updateStats(mockUserData);
      wx.hideLoading();
    }, 1000);
  },

  updateStats(cloudUserData) {
    const userRole = this.data.userRole;
    let myStats = this.data.myStats;
    
    if (cloudUserData) {
      myStats.courseProgress = cloudUserData.courseProgress || 45;
      myStats.collectionCount = cloudUserData.collectionCount || 12;
      myStats.studyDuration = cloudUserData.studyDuration || 0;
      myStats.rank = cloudUserData.rank || 0;
      myStats.contributionCount = cloudUserData.contributionCount || 0;
      myStats.leadsCount = cloudUserData.leadsCount || 0;
      myStats.showings = cloudUserData.showings || 0;
    }
    
    this.setData({ myStats });
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
    this.loadCloudData();
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