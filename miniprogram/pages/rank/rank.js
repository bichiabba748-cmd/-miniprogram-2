const app = getApp();
const { RoleManager } = require('../../utils/roleManager.js');
const cloud = require('../../utils/cloud.js');

Page({
  data: {
    isNewAnchor: false,
    activeTab: 'all',
    top3: [],
    others: [],
    userRole: 'visitor',
    canViewFull: false,
    // 分页加载相关
    page: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false,
    isRefreshing: false,
    // 空数据提示
    showEmpty: false,
    // 是否使用模拟数据
    useMockData: false
  },

  // 模拟数据 - 云函数未部署时使用
  mockData: [
    { id: 1, name: '王金牌', leads: 158, scripts: 12, store: '河西店', avatar: '/images/avatar.png', rank: 1 },
    { id: 2, name: '陈店长', leads: 120, scripts: 8, store: '南开店', avatar: '/images/avatar.png', rank: 2 },
    { id: 3, name: '李销冠', leads: 98, scripts: 15, store: '和平店', avatar: '/images/avatar.png', rank: 3 },
    { id: 4, name: '张主播', leads: 85, scripts: 10, store: '河东店', avatar: '/images/avatar.png', rank: 4 },
    { id: 5, name: '刘经纪', leads: 72, scripts: 6, store: '红桥店', avatar: '/images/avatar.png', rank: 5 },
    { id: 6, name: '赵达人', leads: 65, scripts: 9, store: '滨海店', avatar: '/images/avatar.png', rank: 6 },
    { id: 7, name: '孙经理', leads: 58, scripts: 7, store: '西青店', avatar: '/images/avatar.png', rank: 7 },
    { id: 8, name: '周顾问', leads: 45, scripts: 5, store: '北辰店', avatar: '/images/avatar.png', rank: 8 },
    { id: 9, name: '吴专员', leads: 38, scripts: 4, store: '津南店', avatar: '/images/avatar.png', rank: 9 },
    { id: 10, name: '郑助理', leads: 32, scripts: 3, store: '武清店', avatar: '/images/avatar.png', rank: 10 }
  ],

  onLoad() {
    this.setData({ isNewAnchor: app.globalData.isNewAnchor });
    this.updateUserRole();
    this.loadRankData();
  },

  onShow() {
    this.updateUserRole();
  },

  updateUserRole() {
    const role = RoleManager.getCurrentRole();
    const canViewFull = ['anchor', 'broker', 'admin'].includes(role);
    this.setData({
      userRole: role,
      canViewFull: canViewFull
    });
  },

  // 加载排行榜数据
  loadRankData(refresh = false) {
    if (this.data.isLoading) return;

    const page = refresh ? 1 : this.data.page;
    const type = this.data.activeTab;

    this.setData({
      isLoading: true,
      isRefreshing: refresh
    });

    console.log('开始加载排行榜数据，类型：', type, '页码：', page);

    // 如果已经确定使用模拟数据，直接加载
    if (this.data.useMockData) {
      this.loadMockData(page);
      return;
    }

    // 调用云函数获取真实数据
    cloud.call('getleaderboardv3', {
      type: type,
      topN: page * this.data.pageSize
    }, {
      loadingTitle: refresh ? null : '加载中...'
    })
    .then(res => {
      console.log('排行榜数据获取成功：', res);

      if (res && res.code === 0) {
        const data = res.data;
        const list = data.list || [];

        // 处理数据格式
        const formattedList = list.map((item, index) => ({
          id: item._openid || index,
          name: item.nickname || '未知用户',
          leads: item.leads || 0,
          scripts: item.scripts || 0,
          store: item.store || '',
          avatar: item.avatar || '/images/avatar.png',
          rank: item.rank || (index + 1),
          isMe: item._openid === app.globalData.openid
        }));

        // 分离top3和其他
        const top3 = formattedList.slice(0, 3);
        const others = formattedList.slice(3);

        // 添加当前用户数据（如果不在列表中）
        let finalOthers = others;
        if (data.myRank && !formattedList.some(item => item.isMe)) {
          const myData = {
            id: 'me',
            name: '我',
            leads: data.myRank.leads || 0,
            scripts: 0,
            store: '',
            avatar: '/images/avatar.png',
            rank: data.myRank.rank || 0,
            isMe: true
          };
          finalOthers = [...others, myData];
        }

        this.setData({
          top3: top3,
          others: this.data.canViewFull ? finalOthers : [],
          page: page + 1,
          hasMore: list.length >= page * this.data.pageSize,
          showEmpty: list.length === 0,
          isLoading: false,
          isRefreshing: false,
          useMockData: false
        });
      } else {
        console.error('云函数返回错误：', res.message);
        // 云函数返回错误，使用模拟数据
        this.setData({ useMockData: true });
        this.loadMockData(page);
      }
    })
    .catch(err => {
      console.error('加载排行榜数据失败，切换到模拟数据：', err);
      // 云函数调用失败，使用模拟数据
      this.setData({ useMockData: true });
      this.loadMockData(page);
    });
  },

  // 加载模拟数据
  loadMockData(page) {
    console.log('使用模拟数据，页码：', page);

    const allData = this.mockData;
    const start = 0;
    const end = page * this.data.pageSize;
    const list = allData.slice(start, end);

    // 分离top3和其他
    const top3 = list.slice(0, 3);
    const others = list.slice(3);

    this.setData({
      top3: top3,
      others: this.data.canViewFull ? others : [],
      page: page + 1,
      hasMore: end < allData.length,
      showEmpty: list.length === 0,
      isLoading: false,
      isRefreshing: false
    });

    // 显示提示
    if (page === 1) {
      wx.showToast({
        title: '使用测试数据',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('触发下拉刷新');
    this.setData({ page: 1, hasMore: true });
    this.loadRankData(true);
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom() {
    console.log('触发上拉加载');
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadRankData();
    }
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab,
      page: 1,
      hasMore: true,
      top3: [],
      others: []
    });
    this.loadRankData(true);
  },

  // 核心闭环：跳回文案页并搜索
  goToUserScripts(e) {
    const name = e.currentTarget.dataset.name;
    app.globalData.tempSearchUser = name;
    wx.switchTab({ url: '/pages/art/art' });
  },

  goToJoin() {
    wx.navigateTo({ url: '/pages/join/join' });
  }
});
