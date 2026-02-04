const app = getApp();
const { RoleManager } = require('../../utils/roleManager.js');

Page({
  data: {
    inviteCode: '', // 邀请码
    totalInvites: 0, // 总邀请数
    successfulInvites: 0, // 成功加入数
    rewards: 0, // 获得奖励
    userInfo: {}, // 用户信息
    posterStyle: 0, // 海报样式：0-综合样式，1-简洁样式，2-福利样式，3-数据样式
    posterStyles: [
      { id: 0, name: '综合样式', icon: '🎯' },
      { id: 1, name: '简洁样式', icon: '✨' },
      { id: 2, name: '福利样式', icon: '🎁' },
      { id: 3, name: '数据样式', icon: '📊' }
    ]
  },

  onLoad() {
    this.initInviteData();
  },

  onShow() {
    this.updateInviteStats();
  },

  // 初始化邀请数据
  initInviteData() {
    const userRole = RoleManager.getCurrentRole();
    const userInfo = app.globalData.userProfile || {};
    
    // 生成或获取邀请码
    const inviteCode = this.generateInviteCode();
    
    // 获取用户选择的样式
    const posterStyle = wx.getStorageSync('posterStyle') || 0;
    
    this.setData({
      inviteCode: inviteCode,
      userInfo: userInfo,
      posterStyle: posterStyle
    });
  },

  // 生成邀请码
  generateInviteCode() {
    // 从本地存储获取邀请码，如果没有则生成新的
    let inviteCode = wx.getStorageSync('inviteCode');
    
    if (!inviteCode) {
      // 生成6位邀请码
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      inviteCode = '';
      for (let i = 0; i < 6; i++) {
        inviteCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // 存储邀请码
      wx.setStorageSync('inviteCode', inviteCode);
    }
    
    return inviteCode;
  },

  // 更新邀请统计数据
  updateInviteStats() {
    // 模拟数据，实际应从服务器获取
    const stats = wx.getStorageSync('inviteStats') || {
      totalInvites: 5,
      successfulInvites: 3,
      rewards: 800
    };
    
    this.setData({
      totalInvites: stats.totalInvites,
      successfulInvites: stats.successfulInvites,
      rewards: stats.rewards
    });
  },

  // 切换海报样式
  switchPosterStyle(e) {
    const styleId = e.currentTarget.dataset.style;
    
    this.setData({
      posterStyle: styleId
    });
    
    // 保存用户选择的样式
    wx.setStorageSync('posterStyle', styleId);
    
    wx.showToast({
      title: '样式已切换',
      icon: 'success'
    });
  },

  // 复制邀请码
  copyCode() {
    const inviteCode = this.data.inviteCode;
    
    wx.setClipboardData({
      data: inviteCode,
      success: () => {
        wx.showToast({
          title: '邀请码已复制',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 分享给好友
  shareToFriend() {
    const inviteCode = this.data.inviteCode;
    const userName = this.data.userInfo.name || '星火伙伴';
    const posterStyle = this.data.posterStyle;
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    // 根据不同样式生成不同的分享文案
    let shareTitle = '';
    let shareDesc = '';
    
    switch(posterStyle) {
      case 0: // 综合样式
        shareTitle = `【${userName}】邀请您加入星火计划`;
        shareDesc = `使用我的邀请码 ${inviteCode} 加入星火计划，一起开启房产经纪新时代！`;
        break;
      case 1: // 简洁样式
        shareTitle = `星火计划 · ${userName}的邀请`;
        shareDesc = `邀请码：${inviteCode}`;
        break;
      case 2: // 福利样式
        shareTitle = `🎁 ${userName}送您一份福利`;
        shareDesc = `加入星火计划，享受100+实战脚本、系统化培训、高额佣金等福利！邀请码：${inviteCode}`;
        break;
      case 3: // 数据样式
        shareTitle = `📊 ${userName}的数据战绩`;
        shareDesc = `已邀请${this.data.totalInvites}人，成功${this.data.successfulInvites}人，获得${this.data.rewards}积分奖励。邀请码：${inviteCode}`;
        break;
    }
    
    // 调用分享API
    wx.shareAppMessage({
      title: shareTitle,
      desc: shareDesc,
      path: `/pages/join/join?inviteCode=${inviteCode}&referrerName=${encodeURIComponent(userName)}`,
      imageUrl: '/images/share_cover.png',
      success: (res) => {
        console.log('分享给好友成功:', res);
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.log('分享给好友失败:', err);
        wx.showToast({
          title: '分享失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 分享到朋友圈
  shareToMoments() {
    const inviteCode = this.data.inviteCode;
    const userName = this.data.userInfo.name || '星火伙伴';
    const posterStyle = this.data.posterStyle;
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    // 根据不同样式生成不同的分享文案
    let shareTitle = '';
    
    switch(posterStyle) {
      case 0: // 综合样式
        shareTitle = `【${userName}】邀请您加入星火计划，使用邀请码 ${inviteCode}`;
        break;
      case 1: // 简洁样式
        shareTitle = `星火计划 · ${userName}的邀请 · 邀请码${inviteCode}`;
        break;
      case 2: // 福利样式
        shareTitle = `🎁 ${userName}邀请您加入星火计划，享受100+实战脚本、系统化培训、高额佣金等福利！`;
        break;
      case 3: // 数据样式
        shareTitle = `📊 ${userName}的数据战绩：已邀请${this.data.totalInvites}人，成功${this.data.successfulInvites}人，获得${this.data.rewards}积分奖励`;
        break;
    }
    
    // 调用分享到朋友圈API
    wx.shareTimeline({
      title: shareTitle,
      imageUrl: '/images/share_cover.png',
      query: `inviteCode=${inviteCode}&referrerName=${encodeURIComponent(userName)}`,
      success: (res) => {
        console.log('分享到朋友圈成功:', res);
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.log('分享到朋友圈失败:', err);
        wx.showToast({
          title: '分享失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 监听分享事件
  onShareAppMessage() {
    const inviteCode = this.data.inviteCode;
    const userName = this.data.userInfo.name || '星火伙伴';
    const posterStyle = this.data.posterStyle;
    
    // 根据不同样式生成不同的分享文案
    let shareTitle = '';
    let shareDesc = '';
    
    switch(posterStyle) {
      case 0: // 综合样式
        shareTitle = `【${userName}】邀请您加入星火计划`;
        shareDesc = `使用我的邀请码 ${inviteCode} 加入星火计划，一起开启房产经纪新时代！`;
        break;
      case 1: // 简洁样式
        shareTitle = `星火计划 · ${userName}的邀请`;
        shareDesc = `邀请码：${inviteCode}`;
        break;
      case 2: // 福利样式
        shareTitle = `🎁 ${userName}送您一份福利`;
        shareDesc = `加入星火计划，享受100+实战脚本、系统化培训、高额佣金等福利！邀请码：${inviteCode}`;
        break;
      case 3: // 数据样式
        shareTitle = `📊 ${userName}的数据战绩`;
        shareDesc = `已邀请${this.data.totalInvites}人，成功${this.data.successfulInvites}人，获得${this.data.rewards}积分奖励。邀请码：${inviteCode}`;
        break;
    }
    
    return {
      title: shareTitle,
      desc: shareDesc,
      path: `/pages/join/join?inviteCode=${inviteCode}&referrerName=${encodeURIComponent(userName)}`,
      imageUrl: '/images/share_cover.png'
    };
  },

  // 监听分享到朋友圈事件
  onShareTimeline() {
    const inviteCode = this.data.inviteCode;
    const userName = this.data.userInfo.name || '星火伙伴';
    const posterStyle = this.data.posterStyle;
    
    // 根据不同样式生成不同的分享文案
    let shareTitle = '';
    
    switch(posterStyle) {
      case 0: // 综合样式
        shareTitle = `【${userName}】邀请您加入星火计划，使用邀请码 ${inviteCode}`;
        break;
      case 1: // 简洁样式
        shareTitle = `星火计划 · ${userName}的邀请 · 邀请码${inviteCode}`;
        break;
      case 2: // 福利样式
        shareTitle = `🎁 ${userName}邀请您加入星火计划，享受100+实战脚本、系统化培训、高额佣金等福利！`;
        break;
      case 3: // 数据样式
        shareTitle = `📊 ${userName}的数据战绩：已邀请${this.data.totalInvites}人，成功${this.data.successfulInvites}人，获得${this.data.rewards}积分奖励`;
        break;
    }
    
    return {
      title: shareTitle,
      imageUrl: '/images/share_cover.png',
      query: `inviteCode=${inviteCode}&referrerName=${encodeURIComponent(userName)}`
    };
  }
});