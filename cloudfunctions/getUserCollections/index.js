const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 获取用户收藏列表
exports.main = async (event, context) => {
  try {
    const { status } = event;
    const openid = cloud.getWXContext().OPENID;
    
    console.log('=== 获取用户收藏列表开始 ===');
    console.log('用户OpenID:', openid);
    console.log('查询状态:', status);
    
    // 构建查询
    let query = db.collection('user_collections')
      .where({
        _openid: openid
      });
    
    // 如果指定了状态，按状态筛选
    if (status) {
      console.log('按状态筛选:', status);
      query = query.where({ status: status });
    }
    
    console.log('执行数据库查询...');
    
    // 按更新时间倒序排序
    const collections = await query
      .orderBy('updatedAt', 'desc')
      .get();
    
    console.log('查询结果:', { total: collections.data.length });
    
    if (collections.data.length === 0) {
      console.log('收藏列表为空');
      return {
        code: 2000,
        message: '获取收藏列表成功',
        data: {
          collections: []
        }
      };
    }
    
    console.log('开始获取文章详情...');
    
    // 为每个收藏记录获取对应的文章详情
    const collectionList = await Promise.all(
      collections.data.map(async (item) => {
        try {
          console.log('获取文章详情:', item.articleId);
          const article = await db.collection('articles')
            .doc(item.articleId)
            .get();
          
          return {
            ...item,
            article: article.data || null
          };
        } catch (error) {
          console.error('获取文章详情失败:', { articleId: item.articleId, error: error.message });
          return {
            ...item,
            article: null
          };
        }
      })
    );
    
    console.log('文章详情获取完成:', { total: collectionList.length });
    console.log('=== 获取用户收藏列表完成 ===');
    
    return {
      code: 2000,
      message: '获取收藏列表成功',
      data: {
        collections: collectionList
      }
    };
    
  } catch (error) {
    console.error('=== 获取收藏列表失败 ===');
    console.error('错误详情:', error);
    return {
      code: 5000,
      message: '获取收藏列表失败',
      data: null,
      error: error.message
    };
  }
};