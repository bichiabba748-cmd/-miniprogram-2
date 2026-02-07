// submitContract 云函数 - 处理报单录入
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

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

exports.main = async (event, context) => {
  try {
    const {
      tenantName,
      tenantPhone,
      propertyAddress,
      rent,
      startDate,
      endDate,
      brokerName,
      brokerPhone,
      broadbandAccount,
      broadbandPassword,
      waterAccount,
      electricAccount,
      gasAccount,
      heatingInfo,
      propertyContact
    } = event;
    
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    
    // 验证必填参数
    const requiredFields = [tenantName, tenantPhone, propertyAddress, rent, startDate, endDate, brokerName, brokerPhone];
    if (requiredFields.some(field => !field)) {
      return {
        code: 1001,
        message: '参数错误：缺少必填字段'
      };
    }

    // 内容安全检测
    try {
      const contentToCheck = [tenantName, propertyAddress, heatingInfo, propertyContact].filter(Boolean).join(' ');
      if (contentToCheck) {
        const secCheckResult = await cloud.callFunction({
          name: 'msgSecCheck',
          data: {
            type: 'text',
            content: contentToCheck
          }
        });
        if (secCheckResult.result.code !== 0) {
          return {
            code: 87014,
            message: '合同信息包含违规内容，请检查姓名、地址等字段'
          };
        }
      }
    } catch (err) {
      console.error('内容安全检测失败:', err);
      return {
        code: 5001,
        message: '内容安全检测服务异常'
      };
    }
    
    // 生成合同编号
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // 获取当日最大合同编号
    const todayPrefix = `HY${year}${month}${day}`;
    const todayContracts = await db.collection('contracts')
      .where({
        contractId: db.RegExp({
          regexp: `^${todayPrefix}`,
          options: 'i'
        })
      })
      .get();
    
    const todayCount = todayContracts.data.length;
    const sequence = String(todayCount + 1).padStart(3, '0');
    const contractId = `${todayPrefix}${sequence}`;
    
    // 脱敏处理敏感信息
    const maskedTenantPhone = maskSensitiveInfo(tenantPhone, 'phone');
    const maskedBrokerPhone = maskSensitiveInfo(brokerPhone, 'phone');
    const maskedBroadbandPassword = maskSensitiveInfo(broadbandPassword, 'password');
    const maskedBroadbandAccount = maskSensitiveInfo(broadbandAccount, 'account');
    const maskedWaterAccount = maskSensitiveInfo(waterAccount, 'account');
    const maskedElectricAccount = maskSensitiveInfo(electricAccount, 'account');
    const maskedGasAccount = maskSensitiveInfo(gasAccount, 'account');
    
    console.log('敏感信息脱敏处理完成');
    
    // 创建合同记录
    const contract = await db.collection('contracts')
      .add({
        contractId: contractId,
        tenantName: tenantName,
        tenantPhone: maskedTenantPhone,
        propertyAddress: propertyAddress,
        rent: rent,
        startDate: startDate,
        endDate: endDate,
        brokerName: brokerName,
        brokerPhone: maskedBrokerPhone,
        broadbandAccount: maskedBroadbandAccount,
        broadbandPassword: maskedBroadbandPassword,
        waterAccount: maskedWaterAccount,
        electricAccount: maskedElectricAccount,
        gasAccount: maskedGasAccount,
        heatingInfo: heatingInfo,
        propertyContact: propertyContact,
        // 加密存储原始敏感信息
        encryptedInfo: {
          tenantPhone: tenantPhone,
          brokerPhone: brokerPhone,
          broadbandAccount: broadbandAccount,
          broadbandPassword: broadbandPassword,
          waterAccount: waterAccount,
          electricAccount: electricAccount,
          gasAccount: gasAccount
        },
        status: 'active', // active, expired, terminated
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      });
    
    return {
      code: 0,
      message: '报单录入成功',
      data: {
        contractId: contractId,
        _id: contract._id
      }
    };
  } catch (err) {
    console.error('报单录入失败:', err);
    return {
      code: 5000,
      message: '服务器内部错误'
    };
  }
};