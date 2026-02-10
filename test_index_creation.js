// 测试索引创建的脚本
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

async function createIndexes() {
  try {
    console.log('开始创建数据库索引...');
    
    // 1. 为 articles 集合创建索引
    console.log('创建 articles 集合索引...');
    await db.collection('articles').createIndex({
      category: 1,
      securityLevel: 1,
      createdAt: -1
    });
    await db.collection('articles').createIndex({
      createdAt: -1
    });
    await db.collection('articles').createIndex({
      status: 1
    });
    console.log('articles 集合索引创建完成');
    
    // 2. 为 reports 集合创建索引
    console.log('创建 reports 集合索引...');
    await db.collection('reports').createIndex({
      createdAt: -1
    });
    await db.collection('reports').createIndex({
      status: 1
    });
    await db.collection('reports').createIndex({
      reporterId: 1
    });
    console.log('reports 集合索引创建完成');
    
    // 3. 为 applications 集合创建索引
    console.log('创建 applications 集合索引...');
    await db.collection('applications').createIndex({
      status: 1
    });
    await db.collection('applications').createIndex({
      _openid: 1
    });
    await db.collection('applications').createIndex({
      createdAt: -1
    });
    console.log('applications 集合索引创建完成');
    
    // 4. 为 users 集合创建索引
    console.log('创建 users 集合索引...');
    await db.collection('users').createIndex({
      phone: 1
    });
    await db.collection('users').createIndex({
      role: 1
    });
    await db.collection('users').createIndex({
      createdAt: -1
    });
    console.log('users 集合索引创建完成');
    
    // 5. 为 contracts 集合创建索引
    console.log('创建 contracts 集合索引...');
    await db.collection('contracts').createIndex({
      brokerId: 1
    });
    await db.collection('contracts').createIndex({
      status: 1
    });
    await db.collection('contracts').createIndex({
      createdAt: -1
    });
    console.log('contracts 集合索引创建完成');
    
    // 6. 为 courses 集合创建索引
    console.log('创建 courses 集合索引...');
    await db.collection('courses').createIndex({
      category: 1
    });
    await db.collection('courses').createIndex({
      level: 1
    });
    await db.collection('courses').createIndex({
      createdAt: -1
    });
    console.log('courses 集合索引创建完成');
    
    console.log('所有索引创建成功！');
    return { success: true };
    
  } catch (err) {
    console.error('创建索引失败:', err);
    return { success: false, error: err.message };
  }
}

// 执行索引创建
if (require.main === module) {
  createIndexes().then(result => {
    console.log('索引创建结果:', result);
    process.exit(result.success ? 0 : 1);
  }).catch(err => {
    console.error('执行失败:', err);
    process.exit(1);
  });
}

module.exports = createIndexes;
