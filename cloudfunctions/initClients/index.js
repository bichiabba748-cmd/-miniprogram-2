const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  try {
    const db = cloud.database();
    const _ = db.command;
    
    // 获取当前用户的openid作为owner_id
    const { OPENID } = cloud.getWXContext();
    const ownerId = OPENID || 'test_user_001';
    
    // 使用当前时间生成测试数据，确保能被月度榜查询到
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDate = now.getDate();
    
    // 模拟多个主播的openid（用于生成排行榜数据）
    const mockAnchors = [
      { openid: ownerId, name: '当前用户', leads: 15 },
      { openid: 'anchor_001', name: '王金牌', leads: 158 },
      { openid: 'anchor_002', name: '李销冠', leads: 126 },
      { openid: 'anchor_003', name: '张三', leads: 98 },
      { openid: 'anchor_004', name: '赵四', leads: 85 },
      { openid: 'anchor_005', name: '钱五', leads: 72 },
      { openid: 'anchor_006', name: '孙六', leads: 65 },
      { openid: 'anchor_007', name: '周七', leads: 58 },
      { openid: 'anchor_008', name: '吴八', leads: 45 },
      { openid: 'anchor_009', name: '郑九', leads: 38 }
    ];
    
    const testData = [];
    
    // 为每个主播生成客户数据
    mockAnchors.forEach((anchor, anchorIndex) => {
      const leadsCount = anchor.leads;
      
      // 生成该主播的客户数据
      for (let i = 0; i < leadsCount; i++) {
        const dayOffset = Math.floor(Math.random() * 28) + 1; // 1-28天内随机
        const hour = Math.floor(Math.random() * 14) + 8; // 8-22点
        const level = Math.floor(Math.random() * 5) + 1;
        const sources = ['直播间', '短视频', '熟人介绍', '朋友圈', '抖音'];
        const source = sources[Math.floor(Math.random() * sources.length)];
        const statuses = ['follow', 'deal', 'contact'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        testData.push({
          name: `客户${anchorIndex + 1}-${i + 1}`,
          phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
          level: level,
          status: status,
          source: source,
          date: `${String(currentMonth).padStart(2, '0')}-${String(dayOffset).padStart(2, '0')} ${String(hour).padStart(2, '0')}:00`,
          anchorName: anchor.name,
          daysLeft: Math.floor(Math.random() * 10),
          brokerName: `经纪人${anchorIndex + 1}`,
          rotationCount: Math.floor(Math.random() * 5) + 1,
          owner_id: anchor.openid,
          createTime: new Date(now.getFullYear(), now.getMonth(), dayOffset, hour, 0, 0)
        });
      }
    });
    
    // 先查询所有数据，然后逐个删除（云开发不支持无条件删除）
    const oldData = await db.collection('clients').limit(1000).get();
    if (oldData.data.length > 0) {
      const deletePromises = oldData.data.map(item => {
        return db.collection('clients').doc(item._id).remove();
      });
      await Promise.all(deletePromises);
      console.log('已删除', oldData.data.length, '条旧数据');
    }
    
    // 分批添加数据（云开发一次最多添加100条）
    const batchSize = 100;
    let addedCount = 0;
    
    for (let i = 0; i < testData.length; i += batchSize) {
      const batch = testData.slice(i, i + batchSize);
      await db.collection('clients').add({
        data: batch
      });
      addedCount += batch.length;
    }
    
    // 同时为mock的主播创建users集合数据（用于排行榜显示昵称和头像）
    const userData = mockAnchors.map((anchor, index) => ({
      _openid: anchor.openid,
      nickname: anchor.name,
      avatarUrl: `https://example.com/avatar${index + 1}.png`,
      role: 'anchor',
      store: `门店${index + 1}`,
      createTime: new Date()
    }));
    
    // 检查并添加users数据
    for (const user of userData) {
      const existingUser = await db.collection('users').where({
        _openid: user._openid
      }).get();
      
      if (existingUser.data.length === 0) {
        await db.collection('users').add({
          data: user
        });
      }
    }
    
    console.log('initClients 成功，删除旧数据，添加了', addedCount, '条客户数据');
    
    return {
      code: 0,
      message: `成功初始化 ${addedCount} 条客户数据，覆盖 ${mockAnchors.length} 个主播`,
      data: {
        total: addedCount,
        anchors: mockAnchors.length
      }
    };
    
  } catch (err) {
    console.error('initClients 云函数执行失败:', err);
    return {
      code: 5000,
      message: '初始化数据失败',
      error: err.message
    };
  }
};
