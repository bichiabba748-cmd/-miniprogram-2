// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { name, cloudID, identity, painPoints } = event;
    const openid = cloud.getWXContext().OPENID;
    
    // 1. 参数验证
    if (!name || !identity || !painPoints || !Array.isArray(painPoints) || painPoints.length === 0) {
      return {
        code: 1001,
        message: '参数错误：name为空/identity非法/painPoints为空'
      };
    }

    // 内容安全检测
    try {
      const secCheckResult = await cloud.callFunction({
        name: 'msgSecCheck',
        data: {
          type: 'text',
          content: name
        }
      });
      if (secCheckResult.result.code !== 0) {
        return {
          code: 87014,
          message: '姓名包含违规内容，请修改'
        };
      }
    } catch (err) {
      console.error('内容安全检测失败:', err);
      // 如果检测失败（如调用超时），可以选择放行或拦截，这里选择安全拦截
      return {
        code: 5001,
        message: '内容安全检测服务异常'
      };
    }
    
    // 2. 查重：根据 _openid 查询 applications 表
    const existingApplication = await db.collection('applications').where({
      _openid: openid
    }).get();
    
    if (existingApplication.data.length > 0) {
      return {
        code: -1,
        message: '已存在（重复申请）'
      };
    }
    
    // 3. 解密手机号
    let phoneNumber;
    try {
      const phoneResult = await cloud.openapi.phonenumber.getPhoneNumber({
        cloudID: cloudID
      });
      phoneNumber = phoneResult.phoneInfo.phoneNumber;
    } catch (err) {
      console.error('手机号解密失败:', err);
      return {
        code: 1002,
        message: '手机号解密失败'
      };
    }
    
    // 4. 入库
    const result = await db.collection('applications').add({
      data: {
        _openid: openid,
        name,
        phone: phoneNumber,
        identity,
        painPoints,
        status: 'pending',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    });
    
    return {
      code: 0,
      message: '申请已提交，等待审核',
      data: {
        applicationId: openid
      }
    };
    
  } catch (err) {
    console.error('服务器错误:', err);
    return {
      code: 500,
      message: '服务器错误'
    };
  }
};
