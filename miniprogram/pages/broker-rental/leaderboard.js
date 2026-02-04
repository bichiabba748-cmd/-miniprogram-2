// pages/broker-rental/leaderboard.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 模拟数据开关
    useMockData: true,
    // 榜单类型：total(累计), month(月度)
    leaderboardType: 'total',
    // 模拟榜单数据
    mockLeaderboardData: {
      total: [
        {
          id: 1,
          name: '王金牌',
          avatar: '../../images/icons/avatars/top1.png',
          store: '河西大悦城店',
          leads: 158,
          showings: 45,
          deals: 12,
          rankingChange: 0
        },
        {
          id: 2,
          name: '李销冠',
          avatar: '../../images/icons/avatars/top2.png',
          store: '和平区店',
          leads: 126,
          showings: 38,
          deals: 10,
          rankingChange: 1
        },
        {
          id: 3,
          name: '张三',
          avatar: '../../images/icons/avatars/top3.png',
          store: '南开店',
          leads: 98,
          showings: 32,
          deals: 8,
          rankingChange: -1
        },
        {
          id: 4,
          name: '赵四',
          avatar: '../../images/icons/avatars/top4.png',
          store: '河西店',
          leads: 85,
          showings: 28,
          deals: 7,
          rankingChange: 0
        },
        {
          id: 5,
          name: '钱五',
          avatar: '../../images/icons/avatars/top5.png',
          store: '河东店',
          leads: 72,
          showings: 25,
          deals: 6,
          rankingChange: 2
        }
      ],
      month: [
        {
          id: 1,
          name: '李销冠',
          avatar: '../../images/icons/avatars/top1.png',
          store: '和平区店',
          leads: 56,
          showings: 18,
          deals: 5,
          rankingChange: 2
        },
        {
          id: 2,
          name: '王金牌',
          avatar: '../../images/icons/avatars/top2.png',
          store: '河西大悦城店',
          leads: 48,
          showings: 15,
          deals: 4,
          rankingChange: -1
        },
        {
          id: 3,
          name: '赵四',
          avatar: '../../images/icons/avatars/top3.png',
          store: '河西店',
          leads: 36,
          showings: 12,
          deals: 3,
          rankingChange: 1
        },
        {
          id: 4,
          name: '张三',
          avatar: '../../images/icons/avatars/top4.png',
          store: '南开店',
          leads: 32,
          showings: 10,
          deals: 2,
          rankingChange: -1
        },
        {
          id: 5,
          name: '孙六',
          avatar: '../../images/icons/avatars/top5.png',
          store: '北辰店',
          leads: 28,
          showings: 9,
          deals: 2,
          rankingChange: 0
        }
      ]
    },
    // 当前榜单数据
    leaderboardData: [],
    // 加载状态
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadLeaderboardData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (this.data.leaderboardData.length === 0) {
      this.loadLeaderboardData();
    }
  },

  /**
   * 加载榜单数据
   */
  loadLeaderboardData() {
    this.setData({ loading: true });

    // 使用模拟数据
    if (this.data.useMockData) {
      setTimeout(() => {
        const data = this.data.mockLeaderboardData[this.data.leaderboardType];
        this.setData({
          leaderboardData: data,
          loading: false
        });
      }, 500);
    } else {
      // 真实数据加载（后续对接云函数）
      this.loadRealLeaderboardData();
    }
  },

  /**
   * 加载真实榜单数据（后续实现）
   */
  loadRealLeaderboardData() {
    // 这里将对接云函数获取真实数据
    // 暂时使用模拟数据作为兜底
    setTimeout(() => {
      const data = this.data.mockLeaderboardData[this.data.leaderboardType];
      this.setData({
        leaderboardData: data,
        loading: false
      });
    }, 1000);
  },

  /**
   * 切换榜单类型
   */
  switchLeaderboardType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      leaderboardType: type
    });
    this.loadLeaderboardData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadLeaderboardData();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 后续可实现分页加载
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '租赁经纪人龙虎榜',
      path: '/pages/broker-rental/leaderboard'
    };
  }
})