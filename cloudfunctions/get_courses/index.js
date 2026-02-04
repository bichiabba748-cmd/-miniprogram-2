const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const { category } = event;
    
    let query = db.collection('courses').where({
      status: 'published'
    });
    
    if (category && category !== '全部') {
      query = query.where({ category });
    }
    
    const res = await query.orderBy('id', 'asc').get();
    
    return {
      code: 0,
      message: '获取成功',
      data: res.data
    };
    
  } catch (err) {
    console.error('获取课程失败:', err);
    return {
      code: 500,
      message: '服务器错误: ' + err.message
    };
  }
};
