Page({
  data: {
    currentTab: 'renewal',
    renewalList: [
      { id: 1, tenantName: '张三', phone: '13800138001', address: '华苑小区3-2-501', currentRent: 3500, expireDate: '2026-03-15', applyTime: '01-20 14:30', status: 'pending', statusText: '待处理' },
      { id: 2, tenantName: '李四', phone: '13800138002', address: '南开花园5-1-302', currentRent: 4200, expireDate: '2026-04-01', applyTime: '01-19 10:15', status: 'pending', statusText: '待处理' }
    ],
    consultList: [
      { id: 3, tenantName: '王五', phone: '13800138003', type: '维修报修', content: '卫生间水龙头漏水', submitTime: '01-21 09:00' },
      { id: 4, tenantName: '赵六', phone: '13800138004', type: '缴费咨询', content: '暖气费什么时候缴纳？', submitTime: '01-20 16:45' }
    ]
  },
  onTabChange(e) { this.setData({ currentTab: e.currentTarget.dataset.tab }); },
  onContact(e) { wx.makePhoneCall({ phoneNumber: e.currentTarget.dataset.phone }); }
});