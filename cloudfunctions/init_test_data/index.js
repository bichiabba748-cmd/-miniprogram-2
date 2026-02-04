const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const { clear = false } = event;
    
    if (clear) {
      await db.collection('reports').where({
        _id: _.exists(true)
      }).remove();
      
      await db.collection('applications').where({
        _id: _.exists(true)
      }).remove();
    }
    
    const reports = [
      {
        name: '王金牌',
        store: '南开门店',
        leads: 12,
        videos: 5,
        lives: 2,
        status: 'pending',
        createdAt: db.serverDate()
      },
      {
        name: '李销冠',
        store: '和平门店',
        leads: 8,
        videos: 3,
        lives: 1,
        status: 'pending',
        createdAt: db.serverDate()
      },
      {
        name: '张主播',
        store: '河西门店',
        leads: 15,
        videos: 6,
        lives: 3,
        status: 'pending',
        createdAt: db.serverDate()
      },
      {
        name: '刘经纪',
        store: '河东门店',
        leads: 10,
        videos: 4,
        lives: 2,
        status: 'pending',
        createdAt: db.serverDate()
      },
      {
        name: '陈经理',
        store: '红桥门店',
        leads: 20,
        videos: 8,
        lives: 4,
        status: 'pending',
        createdAt: db.serverDate()
      }
    ];
    
    const applications = [
      {
        name: '张小明',
        identity: '经纪人(有经验)',
        painPoints: '缺客流,没素材',
        phone: '138****1234',
        status: 'pending',
        createdAt: db.serverDate()
      },
      {
        name: '李小红',
        identity: '经纪人(无经验)',
        painPoints: '不会播',
        phone: '139****5678',
        status: 'pending',
        createdAt: db.serverDate()
      },
      {
        name: '王大伟',
        identity: '主播(有经验)',
        painPoints: '缺素材,不会剪辑',
        phone: '137****9012',
        status: 'pending',
        createdAt: db.serverDate()
      },
      {
        name: '赵小丽',
        identity: '学员(无经验)',
        painPoints: '不知道怎么开始',
        phone: '136****3456',
        status: 'pending',
        createdAt: db.serverDate()
      }
    ];
    
    for (const report of reports) {
      await db.collection('reports').add({
        data: report
      });
    }
    
    for (const application of applications) {
      await db.collection('applications').add({
        data: application
      });
    }
    
    return {
      code: 0,
      message: '初始化成功',
      data: {
        reportsCount: reports.length,
        applicationsCount: applications.length
      }
    };
    
  } catch (err) {
    console.error('初始化测试数据失败:', err);
    return {
      code: 5000,
      message: '初始化失败',
      error: err.message
    };
  }
};
