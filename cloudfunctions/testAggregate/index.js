const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const $ = db.command.aggregate;

exports.main = async (event, context) => {
  try {
    console.log('开始测试聚合查询');
    
    // 1. 先查询所有数据
    const allData = await db.collection('clients').limit(10).get();
    console.log('总数据条数:', allData.data.length);
    console.log('样本数据:', JSON.stringify(allData.data[0]));
    
    // 2. 测试简单聚合 - 按owner_id分组计数
    const result = await db.collection('clients').aggregate()
      .group({
        _id: '$owner_id',
        count: $.sum(1)
      })
      .end();
    
    console.log('聚合结果:', JSON.stringify(result));
    
    return {
      code: 0,
      data: {
        total: allData.data.length,
        aggregate: result
      }
    };
  } catch (err) {
    console.error('错误:', err);
    return { code: 500, error: err.message };
  }
};
