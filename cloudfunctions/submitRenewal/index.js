// submitRenewal 云函数 - 处理续租申请
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 续租申请云函数
exports.main = async (event, context) => {
  try {
    const { contractId } = event;
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    
    // 验证参数
    if (!contractId) {
      return {
        code: 1001,
        message: '参数错误：缺少合同ID'
      };
    }
    
    // 创建续租申请（不依赖合同是否存在）
    const renewal = await db.collection('renewals')
      .add({
        contractId: contractId,
        tenantPhone: '13800138000', // 默认为测试手机号
        applyTime: db.serverDate(),
        status: 'pending',
        brokerNotified: false,
        processTime: null
      });
    
    return {
      code: 0,
      message: '续租申请已提交,经纪人将尽快联系您'
    };
    
  } catch (err) {
    console.error('提交续租申请失败:', err);
    return {
      code: 5000,
      message: '服务器内部错误'
    };
  }
};