const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const { page = 1, pageSize = 20 } = event;
    const skip = (page - 1) * pageSize;

    const result = await db.collection('script_templates')
      .skip(skip)
      .limit(pageSize)
      .orderBy('createdAt', 'desc')
      .get();

    return {
      success: true,
      templates: result.data,
      total: result.data.length
    };
  } catch (error) {
    console.error('获取脚本模板失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};