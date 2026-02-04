const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 切换收藏状态
exports.main = async (event, context) => {
  try {
    const { articleId, collect } = event;
    const openid = cloud.getWXContext().OPENID;
    
    if (!articleId) {
      return {
        code: 4000,
        message: '缺少文章ID',
        data: null
      };
    }
    
    // 检查文章是否存在
    const article = await db.collection('articles').doc(articleId).get();
    if (!article.data) {
      return {
        code: 4040,
        message: '文章不存在',
        data: null
      };
    }
    
    if (collect) {
      // 添加收藏
      const collectionData = {
        _openid: openid,
        articleId: articleId,
        articleTitle: article.data.title,
        articleCategory: article.data.category,
        status: 'collected', // collected | shooting
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 检查是否已经收藏
      const existing = await db.collection('user_collections')
        .where({
          _openid: openid,
          articleId: articleId
        })
        .get();
      
      if (existing.data.length > 0) {
        // 已经收藏，更新状态
        await db.collection('user_collections')
          .doc(existing.data[0]._id)
          .update({
            data: {
              status: 'collected',
              updatedAt: new Date()
            }
          });
      } else {
        // 新增收藏
        await db.collection('user_collections').add(collectionData);
      }
      
      return {
        code: 2000,
        message: '收藏成功',
        data: {
          collected: true
        }
      };
    } else {
      // 取消收藏
      await db.collection('user_collections')
        .where({
          _openid: openid,
          articleId: articleId
        })
        .remove();
      
      return {
        code: 2000,
        message: '取消收藏成功',
        data: {
          collected: false
        }
      };
    }
    
  } catch (error) {
    console.error('切换收藏状态失败:', error);
    return {
      code: 5000,
      message: '切换收藏状态失败',
      data: null,
      error: error.message
    };
  }
};