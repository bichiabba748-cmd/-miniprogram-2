const cloud = require('../../utils/cloud.js');

Page({
  data: {
    // 表单数据模型
    name: '',
    phone: '',
    sourceOptions: ['直播间', '短视频', '私信咨询', '朋友圈', '熟人介绍', '其他'],
    currentSource: '直播间', // 默认选中第一个
    intentLevel: 3, // 默认3星
    intentDesc: {
      1: '无意向 / 观望中',
      2: '意向较弱 / 随便问问',
      3: '意向一般 / 需持续跟进',
      4: '意向强烈 / 近期可约',
      5: 'S级客户 / 随时成交'
    },
    remark: ''
  },

  // 输入监听
  onInputName(e) { this.setData({ name: e.detail.value }) },
  onInputPhone(e) { this.setData({ phone: e.detail.value }) },
  onInputRemark(e) { this.setData({ remark: e.detail.value }) },

  // 选择来源
  onSelectSource(e) {
    this.setData({ currentSource: e.currentTarget.dataset.val })
  },

  // 星级评分
  onRateIntent(e) {
    this.setData({ intentLevel: e.currentTarget.dataset.score })
  },

  // 提交逻辑
  onSubmit() {
    // 1. 校验
    if (!this.data.name.trim()) {
      return wx.showToast({ title: '请填写客户称呼', icon: 'none' })
    }
    if (!this.data.phone.trim()) {
      return wx.showToast({ title: '请填写联系电话', icon: 'none' })
    }

    // 2. 模拟提交 Loading
    wx.showLoading({ title: '加密归档中...', mask: true })

    // 3. 构造新数据对象 (核心修改点)
    const newClient = {
      id: Date.now(), // 用时间戳做唯一ID
      name: this.data.name,
      phone: this.data.phone,
      level: this.data.intentLevel,
      status: 'follow', // 默认为跟进中
      source: this.data.currentSource,
      remark: this.data.remark,
      date: this.getNowFormatDate(), // 获取当前时间
      // 模拟 B端 字段 (为了让列表页显示全，这里先写死默认值)
      anchorName: '当前用户', 
      daysLeft: 7,
      brokerName: '待分配', 
      rotationCount: 1
    };

    // 4. 存入本地缓存 (真数据联通)
    // 先取出旧数据，如果没有就是一个空数组
    let clientList = wx.getStorageSync('crm_clients') || [];
    // 把新数据加到最前面
    clientList.unshift(newClient);
    // 存回去
    wx.setStorageSync('crm_clients', clientList);

    // 5. 反馈并返回
    setTimeout(() => {
      wx.hideLoading()
      
      // 成功反馈
      wx.showToast({
        title: '✅ 录入成功',
        icon: 'none',
        duration: 2000
      })

      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
      
    }, 800)
  },

  // 辅助函数：获取当前时间字符串 (MM-DD hh:mm)
  getNowFormatDate() {
    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}-${day} ${hour}:${minute}`;
  }
})