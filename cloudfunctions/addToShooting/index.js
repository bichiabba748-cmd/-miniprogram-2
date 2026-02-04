const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 添加到待拍摄
exports.main = async (event, context) => {
  try {
    const { collectionId } = event;
    const openid = cloud.getWXContext().OPENID;
    
    if (!collectionId) {
      return {
        code: 4000,
        message: '缺少收藏ID',
        data: null
      };
    }
    
    // 检查收藏记录是否存在且属于当前用户
    const collection = await db.collection('user_collections')
      .doc(collectionId)
      .get();
    
    if (!collection.data) {
      return {
        code: 4040,
        message: '收藏记录不存在',
        data: null
      };
    }
    
    if (collection.data._openid !== openid) {
      return {
        code: 4030,
        message: '无权限操作此收藏',
        data: null
      };
    }
    
    // 更新状态为待拍摄
    await db.collection('user_collections')
      .doc(collectionId)
      .update({
        data: {
          status: 'shooting',
          updatedAt: new Date(),
          shootingAt: new Date() // 记录加入待拍摄的时间
        }
      });
    
    return {
      code: 2000,
      message: '已加入待拍摄',
      data: {
        success: true
      }
    };
    
  } catch (error) {
    console.error('加入待拍摄失败:', error);
    return {
      code: 5000,
      message: '加入待拍摄失败',
      data: null,
      error: error.message
    };
  }
};