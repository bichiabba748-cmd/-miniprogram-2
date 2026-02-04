// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  try {
    // 解析手机号
    const { cloudID, phone, referrerId, referrerRole, referrerName } = event;
    
    let phoneNumber;
    
    // 测试模式：直接传入手机号
    if (phone) {
      console.log('⚠️ 测试模式：直接使用传入的手机号');
      phoneNumber = phone;
    } else if (cloudID) {
      // 正常模式：通过cloudID获取手机号信息
      const phoneResult = await cloud.openapi.cloudbase.getOpenData({
        openid: openid,
        cloudid: cloudID,
      });
      
      const phoneInfo = phoneResult.openData;
      phoneNumber = phoneInfo.phoneNumber;
    } else {
      // 简化模式：只返回openid，不获取手机号
      console.log('🔐 简化模式：只返回openid');
      return {
        success: true,
        openid: openid,
        role: 'tenant'
      };
    }
    
    // 1. 查询 contracts 集合，判断是否为租客
    const contractResult = await db.collection('contracts')
      .where({
        tenantPhone: phoneNumber
      })
      .get();

    // 2. 如果匹配到合同，返回 tenant 角色
    if (contractResult.data.length > 0) {
      // 更新或创建 users 记录
      await db.collection('users').doc(openid).set({
        data: {
          _openid: openid,
          role: 'tenant',
          profile: {
            phone: phoneNumber,
            nickname: contractResult.data[0].tenantName || '租客'
          },
          createdAt: db.serverDate()
        }
      });
      
      return {
        success: true,
        openid: openid,
        role: 'tenant',
        contractId: contractResult.data[0]._id,
        phoneNumber: phoneNumber
      };
    }
    
    // 3. 否则按原有逻辑处理客户信息
    // 查询是否已有该手机号的客户记录
    const existingClient = await db.collection('clients')
      .where({
        phone: phoneNumber
      })
      .get();
    
    let clientId;
    
    if (existingClient.data.length > 0) {
      // 如果已有记录，更新客户信息
      clientId = existingClient.data[0]._id;
      await db.collection('clients')
        .doc(clientId)
        .update({
          data: {
            update_time: Date.now(),
            referrer_id: referrerId,
            referrer_role: referrerRole,
            referrer_name: referrerName,
            status: existingClient.data[0].status || 0 // 保持原状态或设为默认状态
          }
        });
    } else {
      // 如果没有记录，创建新客户
      const newClient = await db.collection('clients')
        .add({
          data: {
            name: '微信客户',
            phone: phoneNumber,
            owner_id: referrerRole === 'broker' ? referrerId : '',
            source: '购房资料解锁',
            status: referrerRole === 'broker' ? 1 : 0, // 如果有推荐人且是经纪人，状态设为跟进中，否则设为公海
            tags: [],
            logs: [
              {
                time: Date.now(),
                content: '通过购房资料解锁获取客户信息',
                type: 'system'
              }
            ],
            referrer_id: referrerId,
            referrer_role: referrerRole,
            referrer_name: referrerName,
            create_time: Date.now(),
            update_time: Date.now()
          }
        });
      
      clientId = newClient._id;
    }
    
    return {
      success: true,
      openid: openid,
      clientId: clientId,
      phoneNumber: phoneNumber
    };
    
  } catch (err) {
    console.error('处理手机号授权失败:', err);
    return {
      success: false,
      error: err.message
    };
  }
};