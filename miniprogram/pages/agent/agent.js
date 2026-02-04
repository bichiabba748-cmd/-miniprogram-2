const app = getApp();
Page({
  data: {
    agentCases: [
      {
        id: 1,
        title: '某短视频：精准切入和平区学区房，3天获客50组',
        tag: '内部标杆',
        conversion: '12%',
        learnCount: '1.5k',
        author: '陈店长',
        cover: '' 
      },
      {
        id: 2,
        title: '全网首发：2026房产主播起号禁忌逻辑',
        tag: '深度拆解',
        conversion: 'N/A',
        learnCount: '8.2k',
        author: '内容实验室',
        cover: ''
      }
    ]
  },
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    // 逻辑：即使是访客也能看详情，但点复制会拦截
    wx.navigateTo({ url: `/pages/agent-detail/agent-detail?id=${id}` });
  },
  goToJoin() {
    wx.navigateTo({ url: '/pages/join/join' });
  }
})