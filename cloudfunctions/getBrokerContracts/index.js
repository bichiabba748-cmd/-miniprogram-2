// getBrokerContracts 云函数 - 获取经纪人的合同列表
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const { page = 1, pageSize = 20, status } = event;
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    
    // 验证参数
    if (page < 1 || pageSize < 1) {
      return {
        code: 1001,
        message: '参数错误：页码和每页数量必须大于0'
      };
    }
    
    // 查询条件
    let query = db.collection('contracts');
    
    // 如果指定了状态，添加状态筛选
    if (status) {
      query = query.where({
        status: status
      });
    }
    
    // 计算总记录数
    const countResult = await query.count();
    const total = countResult.total;
    
    // 分页查询
    const skip = (page - 1) * pageSize;
    const contracts = await query
      .skip(skip)
      .limit(pageSize)
      .orderBy('createTime', 'desc')
      .get();
    
    // 格式化返回数据
    const formattedContracts = contracts.data.map(contract => ({
      _id: contract._id,
      contractId: contract.contractId,
      tenantName: contract.tenantName,
      tenantPhone: contract.tenantPhone,
      propertyAddress: contract.propertyAddress,
      rent: contract.rent,
      startDate: contract.startDate,
      endDate: contract.endDate,
      brokerName: contract.brokerName,
      brokerPhone: contract.brokerPhone,
      createTime: contract.createTime,
      status: contract.status || 'active' // 默认状态为active
    }));
    
    return {
      code: 0,
      data: {
        list: formattedContracts,
        total: total,
        page: page,
        pageSize: pageSize,
        hasMore: skip + pageSize < total
      }
    };
  } catch (err) {
    console.error('获取合同列表失败:', err);
    return {
      code: 5000,
      message: '服务器内部错误'
    };
  }
};