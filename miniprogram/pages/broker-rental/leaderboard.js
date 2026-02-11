// pages/broker-rental/leaderboard.js
// 租赁经纪人签约排行榜

const app = getApp();
const cloud = require('../../utils/cloud.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 模拟数据开关
    useMockData: false,
    // 榜单类型：total(累计), month(月度)
    leaderboardType: 'month',
    // 模拟榜单数据（签约单数 + 签约总额）
    mockLeaderboardData: {
      total: [
        {
          id: 1,
          name: '王金牌',
          avatar: '../../images/icons/avatars/top1.png',
          store: '河西大悦城店',
          contracts: 158,
          totalAmount: 285600,
          rankingChange: 0
        },
        {
          id: 2,
          name: '李销冠',
          avatar: '../../images/icons/avatars/top2.png',
          store: '和平区店',
          contracts: 126,
          totalAmount: 226800,
          rankingChange: 1
        },
        {
          id: 3,
          name: '张三',
          avatar: '../../images/icons/avatars/top3.png',
          store: '南开店',
          contracts: 98,
          totalAmount: 176400,
          rankingChange: -1
        },
        {
          id: 4,
          name: '赵四',
          avatar: '../../images/icons/avatars/top4.png',
          store: '河西店',
          contracts: 85,
          totalAmount: 153000,
          rankingChange: 0
        },
        {
          id: 5,
          name: '钱五',
          avatar: '../../images/icons/avatars/top5.png',
          store: '河东店',
          contracts: 72,
          totalAmount: 129600,
          rankingChange: 2
        }
      ],
      month: [
        {
          id: 1,
          name: '李销冠',
          avatar: '../../images/icons/avatars/top1.png',
          store: '和平区店',
          contracts: 56,
          totalAmount: 100800,
          rankingChange: 2
        },
        {
          id: 2,
          name: '王金牌',
          avatar: '../../images/icons/avatars/top2.png',
          store: '河西大悦城店',
          contracts: 48,
          totalAmount: 86400,
          rankingChange: -1
        },
        {
          id: 3,
          name: '赵四',
          avatar: '../../images/icons/avatars/top3.png',
          store: '河西店',
          contracts: 36,
          totalAmount: 64800,
          rankingChange: 1
        },
        {
          id: 4,
          name: '张三',
          avatar: '../../images/icons/avatars/top4.png',
          store: '南开店',
          contracts: 32,
          totalAmount: 57600,
          rankingChange: -1
        },
        {
          id: 5,
          name: '孙六',
          avatar: '../../images/icons/avatars/top5.png',
          store: '北辰店',
          contracts: 28,
          totalAmount: 50400,
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
      // 真实数据加载（调用云函数）
      this.loadRealLeaderboardData();
    }
  },

  /**
   * 加载真实榜单数据
   */
  async loadRealLeaderboardData() {
    try {
      const type = this.data.leaderboardType;
      
      // 调用云函数获取签约排行榜数据
      const result = await cloud.call('getleaderboardv3', {
        type: type === 'month' ? 'month' : 'all',
        topN: 50,
        businessType: 'rental'
      }, {
        loadingTitle: null
      });

      console.log('租赁排行榜数据：', result);

      if (result && result.list) {
        // 格式化数据
        const formattedData = result.list.map((item, index) => ({
          id: item._openid || index,
          name: item.nickname || '未知用户',
          avatar: item.avatar || '/images/avatar.png',
          store: item.store || '',
          contracts: item.contracts || 0,
          totalAmount: item.totalAmount || (item.contracts || 0) * 1800, // 估算金额
          rankingChange: 0 // 排名变化需要历史数据对比
        }));

        this.setData({
          leaderboardData: formattedData,
          loading: false
        });
      } else {
        // 云函数返回数据格式不正确，使用模拟数据
        console.warn('云函数返回数据格式不正确，使用模拟数据');
        const data = this.data.mockLeaderboardData[this.data.leaderboardType];
        this.setData({
          leaderboardData: data,
          loading: false,
          useMockData: true
        });
      }
    } catch (err) {
      console.error('加载排行榜数据失败：', err);
      // 使用模拟数据
      const data = this.data.mockLeaderboardData[this.data.leaderboardType];
      this.setData({
        leaderboardData: data,
        loading: false,
        useMockData: true
      });
      
      wx.showToast({
        title: '使用测试数据',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 切换榜单类型
   */
  switchLeaderboardType(e) {
    const type = e.currentTarget.dataset.type;
    if (type === this.data.leaderboardType) return;

    this.setData({
      leaderboardType: type,
      leaderboardData: []
    }, () => {
      this.loadLeaderboardData();
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadLeaderboardData();
    wx.stopPullDownRefresh();
  }
});
