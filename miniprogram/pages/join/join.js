const app = getApp();
const { RoleManager } = require('../../utils/roleManager.js');

Page({
  data: {
    name: '',
    phone: '',
    pains: [],
    identity: '',
    pain1: '', pain2: '', pain3: '', pain4: '',
    id1: '', id2: '', id3: ''
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  mockGetPhone() {
    this.setData({ phone: '13812345678' });
    wx.showToast({ title: '已填入', icon: 'success' });
  },

  tap1() { this.toggle('缺客流', 'pain1'); },
  tap2() { this.toggle('没素材', 'pain2'); },
  tap3() { this.toggle('不会播', 'pain3'); },
  tap4() { this.toggle('难成交', 'pain4'); },

  toggle(pain, key) {
    let pains = this.data.pains;
    let idx = pains.indexOf(pain);
    if (idx > -1) {
      pains.splice(idx, 1);
      this.setData({ pains, [key]: '' });
    } else {
      pains.push(pain);
      this.setData({ pains, [key]: 'on' });
    }
  },

  sel1() {
    this.setData({ identity: '经纪人(有经验)', id1: 'on', id2: '', id3: '' });
  },
  sel2() {
    this.setData({ identity: '经纪人(无经验)', id1: '', id2: 'on', id3: '' });
  },
  sel3() {
    this.setData({ identity: '店东', id1: '', id2: '', id3: 'on' });
  },

  submit() {
    const { name, phone, pains, identity } = this.data;
    
    if (!name || name.length < 2) {
      return wx.showToast({ title: '请输入姓名', icon: 'none' });
    }
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return wx.showToast({ title: '请输入正确手机号', icon: 'none' });
    }
    if (pains.length === 0) {
      return wx.showToast({ title: '请选择痛点', icon: 'none' });
    }
    if (!identity) {
      return wx.showToast({ title: '请选择身份', icon: 'none' });
    }
    
    wx.showLoading({ title: '提交中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '提交成功',
        content: '请等待管理员审核（预计1个工作日）',
        showCancel: false,
        success: () => wx.navigateBack()
      });
    }, 1000);
  }
});