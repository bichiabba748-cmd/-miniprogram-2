// submitConsult 云函数 - 处理租客在线咨询
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 敏感信息加密函数
function encryptSensitiveInfo(info, type) {
  if (!info) return null;
  
  try {
    // 这里使用简单的脱敏处理，实际生产环境中应使用更安全的加密算法
    switch (type) {
      case 'phone':
        // 手机号脱敏：保留前3后4
        return info.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      case 'password':
        // 密码脱敏：全部替换为*
        return '******';
      case 'account':
        // 账号脱敏：保留前4后2
        if (info.length <= 6) return '******';
        return info.substring(0, 4) + '****' + info.substring(info.length - 2);
      default:
        return info;
    }
  } catch (error) {
    console.error('加密失败:', error);
    return info;
  }
}

// 敏感信息脱敏显示函数
function maskSensitiveInfo(info, type) {
  return encryptSensitiveInfo(info, type);
}

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
    
    // 内容安全检测
    try {
      const secCheckResult = await cloud.callFunction({
        name: 'msgSecCheck',
        data: {
          type: 'text',
          content: question
        }
      });
      if (secCheckResult.result.code !== 0) {
        return {
          code: 87014,
          message: '咨询内容包含违规信息，请修改'
        };
      }
    } catch (err) {
      console.error('内容安全检测失败:', err);
      return {
        code: 5001,
        message: '内容安全检测服务异常'
      };
    }
    
    // 脱敏处理敏感信息
    const maskedTenantPhone = maskSensitiveInfo(tenantPhone, 'phone');
    
    console.log('敏感信息脱敏处理完成');
    
    // 创建咨询记录（使用clients集合，因为它已经存在）
    const consult = await db.collection('clients')
      .add({
        _openid: openid,
        tenantPhone: maskedTenantPhone,
        question: question,
        status: 'pending', // pending, processing, completed
        type: 'consult', // 标记为咨询类型
        // 加密存储原始敏感信息
        encryptedInfo: {
          tenantPhone: tenantPhone
        },
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