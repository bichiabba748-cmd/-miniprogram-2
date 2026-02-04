// uploadMaterial 云函数 - 处理素材上传
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const { fileID, type, category, title } = event;
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    
    // 验证参数
    if (!fileID || !type || !category || !title) {
      return {
        code: 1001,
        message: '参数错误：缺少文件ID、类型、分类或标题'
      };
    }
    
    // 验证类型和分类
    const validTypes = ['image', 'video', 'document'];
    const validCategories = ['house_tour', 'community', 'nearby'];
    
    if (!validTypes.includes(type)) {
      return {
        code: 1001,
        message: '参数错误：无效的素材类型'
      };
    }
    
    if (!validCategories.includes(category)) {
      return {
        code: 1001,
        message: '参数错误：无效的素材分类'
      };
    }
    
    // 创建素材记录
    const material = await db.collection('materials')
      .add({
        type: type,
        category: category,
        fileUrl: fileID,
        title: title,
        uploadBy: openid,
        createTime: db.serverDate()
      });
    
    return {
      code: 0,
      message: '素材上传成功',
      data: {
        materialId: material._id,
        fileUrl: fileID,
        title: title
      }
    };
  } catch (err) {
    console.error('素材上传失败:', err);
    return {
      code: 5000,
      message: '服务器内部错误'
    };
  }
};