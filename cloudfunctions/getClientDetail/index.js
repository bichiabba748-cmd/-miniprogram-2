const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  try {
    const { id } = event;
    
    if (!id) {
      return {
        code: 4001,
        message: '缺少客户ID'
      };
    }
    
    const db = cloud.database();
    
    const result = await db.collection('clients')
      .doc(id)
      .get();
    
    if (!result.data) {
      return {
        code: 4002,
        message: '客户不存在'
      };
    }
    
    const client = {
      ...result.data,
      id: result.data._id
    };
    
    return {
      code: 0,
      data: client
    };
    
  } catch (err) {
    console.error('getClientDetail 云函数执行失败:', err);
    return {
      code: 5000,
      message: '获取客户详情失败'
    };
  }
};
