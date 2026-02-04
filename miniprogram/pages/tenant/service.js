Page({ 
   data: {}, 
   
   onLoad(options) { 
     wx.setNavigationBarTitle({ 
       title: '便民服务' 
     }); 
   }, 
   
   onCall(e) { 
     const phone = e.currentTarget.dataset.phone; 
     wx.makePhoneCall({ 
       phoneNumber: phone 
     }); 
   } 
 });