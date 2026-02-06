const { RoleManager } = require('../../utils/roleManager.js');

Page({
  data: {
    client: {}, 
    followList: [], // 动态跟进记录列表
    isBroker: false,
    isAnchor: false,
    levelDesc: {
      1: '观望中', 2: '随便问问', 3: '一般意向', 4: '强烈意向', 5: 'S级客户'
    },
    
    // 弹窗控制
    showInputModal: false, 
    showActionSheet: false,
    showAssignModal: false,
    
    tempRemark: '',
    tempBrokerName: '' 
  },

  onLoad(options) {
    // 1. 身份判断
    const role = RoleManager.getCurrentRole();
    this.setData({
      isBroker: role === 'broker',
      isAnchor: role === 'anchor' || role === 'admin'
    });

    // 2. 加载数据
    if (options.id) {
      this.loadClientDetail(options.id);
    }
  },

  loadClientDetail(targetId) {
    wx.cloud.callFunction({
      name: 'getClientDetail',
      data: { id: targetId },
      success: res => {
        console.log('[getClientDetail] 调用成功：', res);
        const { code, data } = res.result;
        
        if (code === 0 && data) {
          this.setData({ 
            client: data,
            followList: data.followList || []
          });
        } else {
          wx.showToast({ title: '获取客户详情失败', icon: 'none' });
        }
      },
      fail: err => {
        console.error('[getClientDetail] 调用失败：', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  onCall() {
    if (this.data.client.phone) {
      wx.makePhoneCall({ phoneNumber: this.data.client.phone });
      this.addFollowRecord('电话沟通', '发起了一次电话拨打。');
    }
  },

  // --- 弹窗逻辑 ---
  openModal() { this.setData({ showInputModal: true, tempRemark: '' }); },
  closeModal() { this.setData({ showInputModal: false }); },
  preventBubble() {},

  onInputRemark(e) { this.setData({ tempRemark: e.detail.value }); },

  submitFollow() {
    const content = this.data.tempRemark.trim();
    if (!content) return wx.showToast({ title: '写点什么吧', icon: 'none' });
    
    this.addFollowRecord('跟进记录', content);
    this.closeModal();
    wx.showToast({ title: '记录已添加', icon: 'success' });
  },

  // --- 🆕 核心升级：添加记录并保存到 Storage ---
  addFollowRecord(title, content) {
    const newRecord = {
      id: Date.now(),
      title: title,
      time: this.getNowTime(),
      content: content
    };

    // 1. 更新页面视图
    const newList = [newRecord, ...this.data.followList];
    this.setData({ followList: newList });

    // 2. 🚩 关键修复：同步保存到本地数据库
    this.saveToStorage();
  },

  // --- 流转与分配逻辑 ---

  openActionSheet() { this.setData({ showActionSheet: true }); },
  closeActionSheet() { this.setData({ showActionSheet: false }); },

  // 经纪人：放弃回公海
  onReleaseClient() {
    this.closeActionSheet();
    wx.showModal({
      title: '确认放弃',
      content: '放弃后客户将回到公海池，是否确认？',
      success: (res) => {
        if (res.confirm) {
          // 1. 记录一条流转日志
          this.addFollowRecord('释放回公海', '经纪人主动放弃，客户进入待分配池。');
          // 2. 更新状态
          this.updateClientStatus('待分配', 0); 
        }
      }
    });
  },

  // 主播：打开分配弹窗
  openAssignModal() { 
    this.closeActionSheet();
    this.setData({ showAssignModal: true, tempBrokerName: '' }); 
  },
  closeAssignModal() { this.setData({ showAssignModal: false }); },
  onInputBrokerName(e) { this.setData({ tempBrokerName: e.detail.value }); },

  // 主播：提交分配
  submitAssign() {
    const name = this.data.tempBrokerName.trim();
    if (!name) return wx.showToast({ title: '请输入经纪人姓名', icon: 'none' });
    
    // 1. 记录日志
    this.addFollowRecord('分配客户', `客户被指派给经纪人：${name}`);
    // 2. 更新状态
    this.updateClientStatus(name, 7); 
    
    this.closeAssignModal();
  },

  // 更新客户状态 (归属人、倒计时)
  updateClientStatus(newBrokerName, newDaysLeft) {
    // 1. 更新页面数据
    const updatedClient = { 
      ...this.data.client, 
      brokerName: newBrokerName, 
      daysLeft: newDaysLeft 
    };
    this.setData({ client: updatedClient });

    // 2. 保存到数据库
    this.saveToStorage();
    
    // 3. 提示
    wx.showToast({ title: '操作成功', icon: 'success' });
  },

  // --- 🆕 统一保存函数 ---
  saveToStorage() {
    // 取出所有数据
    let list = wx.getStorageSync('crm_clients') || [];
    const index = list.findIndex(item => item.id == this.data.client.id);
    
    if (index !== -1) {
      // 构造要保存的完整对象
      const finalData = {
        ...this.data.client,       // 最新的客户信息(包含新的brokerName)
        followList: this.data.followList // 🚩 最新的时间轴(包含刚才加的记录)
      };
      
      list[index] = finalData; // 替换
      wx.setStorageSync('crm_clients', list); // 存入手机
    }
  },

  getNowTime() {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }
})