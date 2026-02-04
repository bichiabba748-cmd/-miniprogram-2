const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const { category, securityLevel, page = 1, pageSize = 20 } = event;
    const openid = cloud.getWXContext().OPENID;
    
    let query = db.collection('articles');
    
    if (category && category !== 'all') {
      query = query.where({
        category: category
      });
    }
    
    if (securityLevel && securityLevel !== 'all') {
      query = query.where({
        securityLevel: securityLevel
      });
    }
    
    const countResult = await query.count();
    const total = countResult.total;
    
    const skip = (page - 1) * pageSize;
    const articles = await query
      .skip(skip)
      .limit(pageSize)
      .orderBy('createdAt', 'desc')
      .get();
    
    return {
      code: 0,
      data: {
        list: articles.data,
        total: total,
        hasMore: skip + pageSize < total
      }
    };
    
  } catch (err) {
    console.error('获取文案失败:', err);
    return {
      code: 5000,
      message: '服务器内部错误'
    };
  }
};
