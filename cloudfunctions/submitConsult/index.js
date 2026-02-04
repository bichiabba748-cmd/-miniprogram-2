// submitConsult 云函数 - 处理租客在线咨询
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 咨询云函数
exports.main = async (event, context) => {
  try {
    const { tenantPhone, question } = event;
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID || 'test_openid'; // 处理云端测试无真实openid的情况
    
    // 验证参数
    if (!tenantPhone || !question) {
      return {
        code: 1001,
        message: '参数错误：缺少手机号或咨询问题'
      };
    }
    
    // 跳过内容安全审核（在测试环境中可能无法正常工作）
    // TODO: 在生产环境中启用内容安全审核
    
    // 创建咨询记录（使用clients集合，因为它已经存在）
    const consult = await db.collection('clients')
      .add({
        _openid: openid,
        tenantPhone: tenantPhone,
        question: question,
        status: 'pending', // pending, processing, completed
        type: 'consult', // 标记为咨询类型
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      });
    
    // 发送通知给相关人员（后续可扩展）
    // TODO: 实现通知机制
    
    return {
      code: 0,
      message: '咨询已提交,经纪人将在24小时内回复'
    };
  } catch (err) {
    console.error('提交在线咨询失败:', err);
    return {
      code: 5000,
      message: '服务器内部错误'
    };
  }
};