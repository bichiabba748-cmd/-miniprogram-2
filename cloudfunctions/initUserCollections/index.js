const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 初始化数据库集合
exports.main = async (event, context) => {
  try {
    // 尝试获取集合数据
    let collections = null;
    try {
      collections = await db.collection('user_collections').count();
      console.log('user_collections集合已存在:', collections);
    } catch (err) {
      console.log('user_collections集合不存在，需要创建');
      // 集合不存在，尝试通过add操作自动创建
      const testData = {
        _openid: 'test_openid',
        articleId: 'test_article_id',
        articleTitle: '测试文章',
        articleCategory: '测试分类',
        status: 'collected',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('user_collections').add(testData);
      console.log('user_collections集合已创建');
      
      // 删除测试数据
      const result = await db.collection('user_collections').where({ _openid: 'test_openid' }).remove();
      console.log('测试数据已删除:', result);
    }
    
    return {
      code: 2000,
      message: '初始化集合成功',
      data: {
        collections: collections
      }
    };
  } catch (error) {
    console.error('初始化集合失败:', error);
    return {
      code: 5000,
      message: '初始化集合失败',
      data: null,
      error: error.message
    };
  }
};