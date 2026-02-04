// 角色测试页面
const app = getApp();
const { RoleManager } = require('../../utils/roleManager.js');

Page({
  data: {
    currentRole: '',
    testResults: []
  },
  onLoad() {
    this.updateCurrentRole();
  },
  updateCurrentRole() {
    const role = RoleManager.getCurrentRole();
    this.setData({ currentRole: role });
  },
  switchToRole(e) {
    const role = e.currentTarget.dataset.role;
    app.switchRole(role);
    this.updateCurrentRole();
    this.addTestResult(`切换到${role}角色`);
  },
  testRankAccess() {
    const role = RoleManager.getCurrentRole();
    const canViewFull = ['anchor', 'broker', 'admin'].includes(role);
    const result = canViewFull ? '可以查看全量榜单' : '只能查看前三榜单';
    this.addTestResult(`${role}角色: ${result}`);
  },
  goToRank() {
    wx.navigateTo({ url: '/pages/rank/rank' });
  },
  goToProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },
  addTestResult(message) {
    const newResults = [...this.data.testResults, message];
    this.setData({ testResults: newResults });
  },
  clearResults() {
    this.setData({ testResults: [] });
  }
});
