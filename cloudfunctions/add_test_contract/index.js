const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 检查是否已有相同 tenantPhone 的记录
const checkExistingContract = async (tenantPhone) => {
  try {
    const result = await db.collection('contracts')
      .where({ tenantPhone })
      .get();
    return result.data.length > 0;
  } catch (e) {
    console.error('检查现有合同失败:', e);
    return false;
  }
};

// 创建测试合同数据
const createTestContract = async () => {
  const testData = {
    contractId: "TEST20260126001",
    tenantPhone: "13800138000",
    tenantName: "测试租客",
    tenantOpenid: "",
    brokerOpenid: "test_broker_openid",
    brokerName: "王经理",
    brokerPhone: "15900001111",
    brokerAvatar: "",
    propertyAddress: "天津市华苑小区 3 号楼 2 单元 501",
    rent: 3500,
    startDate: "2026-01-01",
    endDate: "2027-01-01",
    landlordName: "李业主",
    landlordPhone: "13900139000",
    propertyManagement: {
      company: "华苑物业服务中心",
      phone: "022-2345-6789",
      address: "华苑小区 1 号楼东侧"
    },
    utilities: {
      waterAccount: "9876543210",
      electricAccount: "1234567890",
      gasAccount: "1122334455",
      heatingAccount: "5544332211"
    },
    status: "active",
    createdAt: db.serverDate()
  };

  try {
    // 检查 contracts 集合是否存在
    try {
      await db.collection('contracts').limit(1).get();
      console.log('✅ contracts 集合已存在');
    } catch (e) {
      // 集合不存在，创建集合
      await db.createCollection('contracts');
      console.log('✅ contracts 集合创建成功');
    }

    // 检查是否已有相同 tenantPhone 的记录
    const exists = await checkExistingContract(testData.tenantPhone);
    if (exists) {
      console.log('ℹ️ 已有相同手机号的合同记录，跳过添加');
      return {
        code: 0,
        skipped: true,
        message: '已有相同手机号的合同记录'
      };
    }

    // 添加测试数据
    const result = await db.collection('contracts').add({ data: testData });
    console.log('✅ 测试合同数据添加成功，记录ID:', result._id);
    
    return {
      code: 0,
      added: true,
      message: '测试合同数据添加成功',
      contractId: result._id
    };
  } catch (e) {
    console.error('❌ 添加测试合同数据失败:', e);
    throw e;
  }
};

exports.main = async (event, context) => {
  try {
    console.log('🚀 开始添加测试合同数据...');
    const result = await createTestContract();
    return result;
  } catch (error) {
    console.error('❌ 操作失败:', error);
    return {
      code: 5000,
      message: '操作失败',
      error: error.message
    };
  }
};