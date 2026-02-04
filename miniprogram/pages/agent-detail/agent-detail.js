Page({
  data: {
    detail: {}
  },

  onLoad(options) {
    const id = options.id;
    this.fetchDetail(id);
  },

  fetchDetail(id) {
    wx.showLoading({ title: '加载中...' });
    
    // 模拟数据源
    const mockData = {
      title: '和平区学区房：单条视频获客50+的底层逻辑',
      tag: '爆款拆解',
      author: '王金牌',
      store: '和平大悦城店',
      leads: 52,
      deal: 3,
      views: '1.2w',
      background: '和平区学区房一直是热门，但大家都在发房源，同质化严重。客户的痛点其实不是“房子长啥样”，而是“政策怎么变”和“预算怎么配”。',
      action: '1. 封面设计：直接打出“最新政策”四个大字，红底白字。\n2. 话术结构：前3秒抛出家长焦虑（比如“今年入学政策大变动”），中间展示真实带看场景，结尾引导私信领取“内部学区表”。\n3. 评论区维护：第一时间置顶“需要表格的扣1”，利用从众心理。',
      tips: '千万不要直接报底价！平台会限流，而且客户觉得太便宜有诈。要引导私信报价，建立私域连接。'
    };

    setTimeout(() => {
      this.setData({ detail: mockData });
      wx.hideLoading();
    }, 500);
  },

  goToJoin() {
    wx.navigateTo({ url: '/pages/join/join' });
  }
})