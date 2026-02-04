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
    wx.showLoading({ title: '加载中...' }); 
    
    const res = await wx.cloud.callFunction({ 
      name: 'getContractInfo', 
      data: {} 
    }); 
    
    wx.hideLoading(); 
    
    if (res.result.success) { 
      const contract = res.result.data; 
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
      const maskedPhone = phone.substr(0, 3) + '****' + phone.substr(7); 
      
      this.setData({ 
        contractInfo: contract, 
        daysLived: daysLived, 
        daysLeft: daysLeft, 
        totalRent: totalRent, 
        maskedPhone: maskedPhone 
      }); 
    } else { 
      wx.showToast({ title: '加载失败', icon: 'none' }); 
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
          wx.showLoading({ title: '提交中...' }); 
          
          const result = await wx.cloud.callFunction({ 
            name: 'submitRenewal', 
            data: { 
              contractId: this.data.contractInfo.contractId 
            } 
          }); 
          
          wx.hideLoading(); 
          
          if (result.result.success) { 
            wx.showToast({ 
              title: '申请已提交', 
              icon: 'success', 
              duration: 2000 
            }); 
          } else { 
            wx.showToast({ 
              title: '提交失败', 
              icon: 'none' 
            }); 
          } 
        } 
      } 
    }); 
  } 
});