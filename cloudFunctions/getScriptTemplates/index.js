const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { category, status, keyword, page = 1, pageSize = 20 } = event;
  
  try {
    let query = db.collection('script_templates');
    
    const conditions = {};
    
    if (category) {
      conditions.category = category;
    }
    
    if (status) {
      conditions.status = status;
    } else {
      conditions.status = 'published';
    }
    
    if (keyword) {
      conditions.title = db.RegExp({
        regexp: keyword,
        options: 'i'
      });
    }
    
    query = query.where(conditions);
    
    const countResult = await query.count();
    const total = countResult.total;
    
    const listResult = await query
      .orderBy('sort', 'desc')
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    
    return {
      code: 0,
      message: '获取成功',
      data: {
        list: listResult.data,
        total: total,
        page: page,
        pageSize: pageSize,
        hasMore: total > page * pageSize
      }
    };
  } catch (error) {
    console.error('[getScriptTemplates] 错误：', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message
    };
  }
};