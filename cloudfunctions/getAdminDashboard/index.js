// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 返回静态数据，确保云函数能够成功部署
    return {
      code: 0,
      data: {
        stats: {
          todayLeads: 158,
          todayShowings: 45,
          totalMembers: 45
        },
        pending: {
          applications: 4,
          articles: 3,
          reports: 2
        },
        systemStatus: {
          auditFree: false,
          maintenance: false,
          silent: false
        },
        recentActivities: []
      }
    };
  } catch (err) {
    console.error('服务器错误:', err);
    return {
      code: 5000,
      message: '服务器内部错误'
    };
  }
};