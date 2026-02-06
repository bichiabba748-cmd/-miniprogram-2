const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  try {
    const { page = 1, pageSize = 20, status, searchText } = event;
    
    const db = cloud.database();
    const _ = db.command;
    
    let query = db.collection('clients');
    
    if (status && status !== 'all') {
      query = query.where({
        status: status
      });
    }
    
    if (searchText) {
      query = query.where({
        name: db.RegExp({
          regexp: searchText,
          options: 'i'
        })
      });
    }
    
    const countResult = await query.count();
    const total = countResult.total;
    
    const skip = (page - 1) * pageSize;
    const result = await query
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();
    
    const list = result.data
      .filter(item => item.name && item.name.trim())
      .map(item => ({
        ...item,
        id: item._id
      }));
    
    return {
      code: 0,
      data: {
        list: list,
        total: total,
        page: page,
        pageSize: pageSize,
        hasMore: skip + pageSize < total
      }
    };
    
  } catch (err) {
    console.error('getClients云函数执行失败:', err);
    return {
      code: 5000,
      message: '获取客户列表失败'
    };
  }
};
