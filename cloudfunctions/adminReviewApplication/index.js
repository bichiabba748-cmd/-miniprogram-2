// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { applicationId, action, reason } = event;
    const openid = cloud.getWXContext().OPENID;
    
    // 1. 检查操作类型
    if (action !== 'approve' && action !== 'reject') {
      return {
        code: 1001,
        message: '参数错误：action必须为approve或reject'
      };
    }
    
    // 2. 检查用户角色是否为admin
    const adminUser = await db.collection('users').where({
      _openid: openid
    }).get();
    
    if (adminUser.data.length === 0 || adminUser.data[0].role !== 'admin') {
      return {
        code: 2001,
        message: '权限不足：只有管理员可以审核申请'
      };
    }
    
    // 3. 查询申请记录
    const application = await db.collection('applications').where({
      _openid: applicationId
    }).get();
    
    if (application.data.length === 0) {
      return {
        code: 2002,
        message: '数据不存在：申请记录未找到'
      };
    }
    
    // 4. 更新申请状态
    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      updateTime: db.serverDate()
    };
    
    if (action === 'reject' && reason) {
      updateData.reason = reason;
    }
    
    await db.collection('applications').where({
      _openid: applicationId
    }).update({
      data: updateData
    });
    
    // 5. 如果审核通过，更新用户角色为student
    if (action === 'approve') {
      await db.collection('users').where({
        _openid: applicationId
      }).update({
        data: {
          role: 'student',
          updateTime: db.serverDate()
        }
      });
    }
    
    return {
      code: 0,
      message: '审核完成'
    };
    
  } catch (err) {
    console.error('服务器错误:', err);
    return {
      code: 5000,
      message: '服务器内部错误'
    };
  }
};
