const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  try {
    const db = cloud.database();
    const _ = db.command;
    
    const testData = [
      {
        name: '张三',
        phone: '13800138000',
        level: 3,
        status: 'follow',
        source: '直播间',
        date: '01-15 12:00',
        anchorName: '李主播',
        daysLeft: 7,
        brokerName: '王经纪人',
        rotationCount: 2,
        createTime: new Date('2024-01-15T12:00:00')
      },
      {
        name: '李四',
        phone: '13900139000',
        level: 4,
        status: 'deal',
        source: '短视频',
        date: '01-14 10:00',
        anchorName: '李主播',
        daysLeft: 0,
        brokerName: '王经纪人',
        rotationCount: 1,
        createTime: new Date('2024-01-14T10:00:00')
      },
      {
        name: '王五',
        phone: '13700137000',
        level: 2,
        status: 'follow',
        source: '熟人介绍',
        date: '01-13 15:00',
        anchorName: '张主播',
        daysLeft: 5,
        brokerName: '赵经纪人',
        rotationCount: 3,
        createTime: new Date('2024-01-13T15:00:00')
      },
      {
        name: '赵六',
        phone: '13600136000',
        level: 5,
        status: 'follow',
        source: '直播间',
        date: '01-12 09:00',
        anchorName: '李主播',
        daysLeft: 3,
        brokerName: '钱经纪人',
        rotationCount: 1,
        createTime: new Date('2024-01-12T09:00:00')
      },
      {
        name: '孙七',
        phone: '13500135000',
        level: 1,
        status: 'deal',
        source: '短视频',
        date: '01-11 14:00',
        anchorName: '张主播',
        daysLeft: 0,
        brokerName: '钱经纪人',
        rotationCount: 2,
        createTime: new Date('2024-01-11T14:00:00')
      }
    ];
    
    const result = await db.collection('clients').remove();
    
    const addResult = await db.collection('clients').add({
      data: testData
    });
    
    console.log('initClients 成功，删除旧数据，添加了', testData.length, '条数据');
    
    return {
      code: 0,
      message: `成功初始化 ${testData.length} 条客户数据`
    };
    
  } catch (err) {
    console.error('initClients 云函数执行失败:', err);
    return {
      code: 5000,
      message: '初始化数据失败'
    };
  }
};
