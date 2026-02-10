const cloud = require('../../utils/cloud.js');

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
       const data = await cloud.call('getContractInfo', { 
         tenant_openid: wx.getStorageSync('openid') 
       }, {
         loadingTitle: '加载中...'
       }); 
       
       if (data && data.success && data.data && data.data.utilities) { 
         this.setData({ 
           electricAccount: data.data.utilities.electric_account || '', 
           waterAccount: data.data.utilities.water_account || '', 
           gasAccount: data.data.utilities.gas_account || '', 
           heatingAccount: data.data.utilities.heating_account || '' 
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