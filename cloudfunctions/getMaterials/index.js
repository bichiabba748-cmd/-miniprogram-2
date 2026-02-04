// getMaterials 云函数 - 处理素材查询
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const { type, category, page = 1, pageSize = 20 } = event;
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    
    // 验证参数
    if (page < 1 || pageSize < 1) {
      return {
        code: 1001,
        message: '参数错误：页码和每页数量必须大于0'
      };
    }
    
    // 查询条件
    let query = db.collection('materials');
    
    // 添加类型筛选
    if (type) {
      query = query.where({
        type: type
      });
    }
    
    // 添加分类筛选
    if (category) {
      query = query.where({
        category: category
      });
    }
    
    // 计算总记录数
    const countResult = await query.count();
    const total = countResult.total;
    
    // 分页查询
    const skip = (page - 1) * pageSize;
    const materials = await query
      .skip(skip)
      .limit(pageSize)
      .orderBy('createTime', 'desc')
      .get();
    
    // 格式化返回数据
    const formattedMaterials = materials.data.map(material => ({
      _id: material._id,
      type: material.type,
      category: material.category,
      fileUrl: material.fileUrl,
      title: material.title,
      uploadBy: material.uploadBy,
      createTime: material.createTime
    }));
    
    return {
      code: 0,
      data: {
        list: formattedMaterials,
        total: total,
        page: page,
        pageSize: pageSize,
        hasMore: skip + pageSize < total
      }
    };
  } catch (err) {
    console.error('素材查询失败:', err);
    return {
      code: 5000,
      message: '服务器内部错误'
    };
  }
};