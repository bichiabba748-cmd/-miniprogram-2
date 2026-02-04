const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const { id } = event;
    
    if (!id) {
      return {
        code: 400,
        message: '缺少课程ID'
      };
    }
    
    const res = await db.collection('courses').where({
      id: parseInt(id),
      status: 'published'
    }).get();
    
    if (res.data.length === 0) {
      return {
        code: 404,
        message: '课程不存在'
      };
    }
    
    return {
      code: 0,
      message: '获取成功',
      data: res.data[0]
    };
    
  } catch (err) {
    console.error('获取课程详情失败:', err);
    return {
      code: 500,
      message: '服务器错误: ' + err.message
    };
  }
};
