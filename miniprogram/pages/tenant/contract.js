const cloud = require('../../utils/cloud.js');

Page({ 
  data: { 
    contractInfo: {}, 
    daysLived: 0, 
    daysLeft: 0, 
    totalRent: 0, 
    maskedPhone: '' 
  }, 

  onLoad() { 
    this.loadContractInfo(); 
  }, 

  async loadContractInfo() { 
    try {
      const data = await cloud.call('getContractInfo', {}, {
        loadingTitle: '加载中...'
      }); 
      
      if (data && data.success) { 
        const contract = data.data; 
        const now = new Date(); 
        const startDate = new Date(contract.startDate); 
        const endDate = new Date(contract.endDate); 
        
        // 计算已住天数 
        const daysLived = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)); 
        
        // 计算剩余天数 
        const daysLeft = Math.floor((endDate - now) / (1000 * 60 * 60 * 24)); 
        
        // 计算累计租金 
        const totalRent = Math.floor(daysLived / 30) * contract.rent; 
        
        // 脱敏业主电话 
        const phone = contract.landlordPhone; 
        const maskedPhone = phone ? phone.substr(0, 3) + '****' + phone.substr(7) : ''; 
        
        this.setData({ 
          contractInfo: contract, 
          daysLived: daysLived, 
          daysLeft: daysLeft, 
          totalRent: totalRent, 
          maskedPhone: maskedPhone 
        }); 
      } 
    } catch (error) {
      console.error('加载合同信息失败:', error);
    }
  }, 

  onCallLandlord() { 
    wx.makePhoneCall({ 
      phoneNumber: this.data.contractInfo.landlordPhone 
    }); 
  }, 

  onCallProperty() { 
    wx.makePhoneCall({ 
      phoneNumber: this.data.contractInfo.propertyManagement.phone 
    }); 
  }, 

  onRenew() { 
    wx.showModal({ 
      title: '申请续租', 
      content: '确认向经纪人发起续租申请？', 
      success: async (res) => { 
        if (res.confirm) { 
          try {
            const result = await cloud.call('submitRenewal', { 
              contractId: this.data.contractInfo.contractId 
            }, {
              loadingTitle: '提交中...'
            }); 
            
            if (result && (result.success || result.code === 0)) { 
              wx.showToast({ 
                title: '申请已提交', 
                icon: 'success', 
                duration: 2000 
              }); 
            } 
          } catch (error) {
            console.error('续租申请失败:', error);
          }
        } 
      } 
    }); 
  } 
});