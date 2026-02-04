Page({ 
   data: { 
     electricAccount: '', 
     waterAccount: '', 
     gasAccount: '', 
     heatingAccount: '' 
   }, 
   
   onLoad(options) { 
     wx.setNavigationBarTitle({ 
       title: '水电缴费指南' 
     }); 
     this.loadUtilityAccounts(); 
   }, 
   
   async loadUtilityAccounts() { 
     try { 
       const res = await wx.cloud.callFunction({ 
         name: 'getContractInfo', 
         data: { tenant_openid: wx.getStorageSync('openid') } 
       }); 
       
       if (res.result.success && res.result.data.utilities) { 
         this.setData({ 
           electricAccount: res.result.data.utilities.electric_account || '', 
           waterAccount: res.result.data.utilities.water_account || '', 
           gasAccount: res.result.data.utilities.gas_account || '', 
           heatingAccount: res.result.data.utilities.heating_account || '' 
         }); 
       } 
     } catch (error) { 
       console.error('获取户号失败', error); 
     } 
   }, 
   
   onCopy(e) { 
     const { type, value } = e.currentTarget.dataset; 
     
     if (!value) { 
       wx.showToast({ 
         title: '暂无户号信息', 
         icon: 'none' 
       }); 
       return; 
     } 
     
     wx.setClipboardData({ 
       data: value, 
       success: () => { 
         wx.showToast({ 
           title: '已复制到剪贴板', 
           icon: 'success' 
         }); 
       } 
     }); 
   } 
 });