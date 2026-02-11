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
    businessType: 'anchor', // 业务类型：anchor/rental/trading/new_house
    canViewFull: false,
    // 排行榜标题
    rankTitle: '本月主播获客榜',
    // 数据字段名（用于显示）
    countField: 'leads',
    countLabel: '获客',
    // 分页加载相关
    page: 1,
    pageSize: 10,
    hasMore: true,
    // 标准三态加载状态
    loading: true,      // 加载中状态
    errorMsg: '',       // 错误信息
    // 空数据提示
    showEmpty: false
  },

  onLoad() {
    console.log('[调试] onLoad触发', Date.now());
    this.setData({ isNewAnchor: app.globalData.isNewAnchor });
    this.updateUserInfo();
    console.log('[调试] onLoad调用loadRankData');
    // 延迟100ms执行，避免与onShow竞态
    setTimeout(() => {
      this.loadRankData();
    }, 100);
  },

  onShow() {
    console.log('[调试] onShow触发', Date.now());
    this.updateUserInfo();
    // onShow不触发加载，避免与onLoad竞态
  },

  updateUserInfo() {
    const role = RoleManager.getCurrentRole();
    const businessType = RoleManager.getBusinessType() || 'anchor';
    const canViewFull = ['anchor', 'broker', 'admin'].includes(role);
    
    // 根据角色和业务类型设置标题和字段
    const { rankTitle, countField, countLabel } = this.getRankConfig(role, businessType);
    
    this.setData({
      userRole: role,
      businessType: businessType,
      canViewFull: canViewFull,
      rankTitle: rankTitle,
      countField: countField,
      countLabel: countLabel
    });
  },

  // 获取排行榜配置
  getRankConfig(role, businessType) {
    // 租赁经纪人
    if (role === 'broker' && businessType === 'rental') {
      return {
        rankTitle: '本月签约榜',
        countField: 'contracts',
        countLabel: '签约'
      };
    }
    
    // 买卖经纪人
    if (role === 'broker' && businessType === 'trading') {
      return {
        rankTitle: '本月带看榜',
        countField: 'showings',
        countLabel: '带看'
      };
    }
    
    // 新房经纪人
    if (role === 'broker' && businessType === 'new_house') {
      return {
        rankTitle: '本月带看榜',
        countField: 'showings',
        countLabel: '带看'
      };
    }
    
    // 默认（主播）
    return {
      rankTitle: '本月主播获客榜',
      countField: 'leads',
      countLabel: '获客'
    };
  },

  // 加载排行榜数据 - 标准三态：loading / success / empty / fail
  async loadRankData(refresh = false) {
    console.log('[调试] loadRankData函数开始执行', Date.now(), 'refresh:', refresh);
    
    // 防止重复加载 - 使用实例变量作为锁
    if (this._isLoadingData && !refresh) {
      console.log('[调试] 正在加载中（锁），跳过重复调用');
      return;
    }
    
    // 设置加载锁
    this._isLoadingData = true;

    const page = refresh ? 1 : this.data.page;
    const type = this.data.activeTab;
    const businessType = this.data.businessType;

    console.log('[调试] 开始加载排行榜数据，类型：', type, '业务类型：', businessType, '页码：', page);

    // 设置加载状态 - 关闭所有可能的loading变量
    this.setData({
      loading: true,
      isLoading: true,
      isRefreshing: refresh,
      errorMsg: '',
      showEmpty: false
    });

    let errorMsg = '';
    let top3 = [];
    let others = [];
    let showEmpty = false;
    let hasMore = false;
    let newPage = page;
    let returnedBusinessType = businessType;

    try {
      // 调用云函数获取真实数据 - 添加10秒超时
      const cloudCallPromise = cloud.call('getleaderboardv3', {
        type: type,
        topN: page * this.data.pageSize,
        businessType: businessType
      }, {
        showLoading: false
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时，请检查网络')), 10000);
      });
      
      console.log('[调试] 发起云函数调用，等待响应...');
      const res = await Promise.race([cloudCallPromise, timeoutPromise]);
      console.log('[调试] 云函数响应成功');

      console.log('[调试] 排行榜原始返回：', JSON.stringify(res, null, 2));

      // 解析数据结构 - 支持多种可能格式
      let resultData = null;
      if (res && res.list && Array.isArray(res.list)) {
        // 格式A: {list: [], myRank: {}, businessType: ''}
        resultData = res;
        console.log('[调试] 识别为格式A：直接包含list');
      } else if (res && res.data && res.data.list && Array.isArray(res.data.list)) {
        // 格式B: {code: 0, data: {list: [], myRank: {}, businessType: ''}}
        resultData = res.data;
        console.log('[调试] 识别为格式B：嵌套在data中');
      } else if (res && res.result && res.result.list && Array.isArray(res.result.list)) {
        // 格式C: {result: {list: [], myRank: {}, businessType: ''}}
        resultData = res.result;
        console.log('[调试] 识别为格式C：嵌套在result中');
      } else {
        console.error('[调试] 无法识别的数据结构：', res);
        throw new Error('数据格式错误：无法找到list字段');
      }

      console.log('[调试] 解析后的数据：', resultData);

      // 安全获取数据
      const list = Array.isArray(resultData.list) ? resultData.list : [];
      returnedBusinessType = resultData.businessType || businessType;
      const myRank = resultData.myRank || null;

      console.log('[调试] list长度：', list.length, 'myRank：', myRank);

      // 处理数据格式
      const formattedList = list.map((item, index) => ({
        id: item._openid || item.id || index,
        name: item.nickname || item.name || '未知用户',
        leads: item.leads || 0,
        contracts: item.contracts || 0,
        showings: item.showings || 0,
        scripts: item.scripts || 0,
        store: item.store || '',
        avatar: item.avatar || item.avatarUrl || '/images/avatar.png',
        rank: item.rank || (index + 1),
        isMe: item._openid === app.globalData.openid
      }));

      // 分离top3和其他
      top3 = formattedList.slice(0, 3);
      const remaining = formattedList.slice(3);

      // 添加当前用户数据（如果不在列表中且myRank存在）
      let finalOthers = remaining;
      if (myRank && !formattedList.some(item => item.isMe)) {
        const myData = {
          id: 'me',
          name: '我',
          leads: myRank.leads || 0,
          contracts: myRank.contracts || 0,
          showings: myRank.showings || 0,
          scripts: 0,
          store: '',
          avatar: '/images/avatar.png',
          rank: myRank.rank || 0,
          isMe: true
        };
        finalOthers = [...remaining, myData];
      }

      others = this.data.canViewFull ? finalOthers : [];
      showEmpty = formattedList.length === 0;
      hasMore = list.length >= page * this.data.pageSize && !showEmpty;
      newPage = page + 1;

      console.log('[调试] 处理完成 - top3:', top3.length, 'others:', others.length, 'showEmpty:', showEmpty);

    } catch (err) {
      console.error('[调试] 加载失败：', err);
      errorMsg = err.message || '加载失败，请稍后重试';
      top3 = [];
      others = [];
      showEmpty = false;
      hasMore = false;

      wx.showToast({
        title: '加载失败：' + errorMsg,
        icon: 'none',
        duration: 3000
      });
    } finally {
      // 无论成功失败，都关闭loading并更新数据
      console.log('[调试] finally已执行，关闭所有loading状态');
      
      // 释放加载锁
      this._isLoadingData = false;
      
      this.setData({
        top3: top3,
        others: others,
        page: newPage,
        hasMore: hasMore,
        showEmpty: showEmpty,
        loading: false,
        isLoading: false,
        isRefreshing: false,
        errorMsg: errorMsg,
        businessType: returnedBusinessType
      }, () => {
        console.log('[调试] setData回调完成，当前loading状态：', this.data.loading);
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('触发下拉刷新');
    this.setData({ page: 1, hasMore: true, errorMsg: '' });
    this.loadRankData(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom() {
    console.log('触发上拉加载');
    if (this.data.hasMore && !this.data.loading && !this.data.errorMsg) {
      this.loadRankData();
    }
  },

  // 重试加载
  retryLoad() {
    console.log('用户点击重试');
    this.setData({ page: 1, hasMore: true, errorMsg: '' });
    this.loadRankData(true);
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
