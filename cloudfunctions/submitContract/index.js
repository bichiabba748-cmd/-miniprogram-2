// submitContract 云函数 - 处理报单录入
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

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
    
    // 创建合同记录
    const contract = await db.collection('contracts')
      .add({
        contractId: contractId,
        tenantName: tenantName,
        tenantPhone: tenantPhone,
        propertyAddress: propertyAddress,
        rent: rent,
        startDate: startDate,
        endDate: endDate,
        brokerName: brokerName,
        brokerPhone: brokerPhone,
        broadbandAccount: broadbandAccount,
        broadbandPassword: broadbandPassword,
        waterAccount: waterAccount,
        electricAccount: electricAccount,
        gasAccount: gasAccount,
        heatingInfo: heatingInfo,
        propertyContact: propertyContact,
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