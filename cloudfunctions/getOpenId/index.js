// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const openid = cloud.getWXContext().OPENID;
    
    return {
      code: 0,
      openid: openid
    };
    
  } catch (err) {
    console.error('获取OpenID失败:', err);
    return {
      code: 5000,
      message: '获取用户信息失败'
    };
  }
};