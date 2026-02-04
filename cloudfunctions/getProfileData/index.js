// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const openid = cloud.getWXContext().OPENID;
    
    // 1. 获取用户信息
    const userInfo = await db.collection('users').where({
      _openid: openid
    }).get();
    
    if (userInfo.data.length === 0) {
      return {
        code: 0,
        data: {
          role: 'visitor',
          dashboard: [],
          rankInfo: null,
          medals: []
        }
      };
    }
    
    const user = userInfo.data[0];
    const role = user.role || 'visitor';
    
    // 2. 根据角色生成仪表盘数据
    let dashboard = [];
    
    switch (role) {
      case 'visitor':
        // Visitor: 返回空仪表盘
        dashboard = [];
        break;
        
      case 'student':
        // Student: 返回学习进度和收藏文案
        const learningProgress = user.learningProgress || 0;
        const savedArticles = user.savedArticles || [];
        dashboard = [
          {
            label: '学习进度',
            value: `${learningProgress}%`
          },
          {
            label: '收藏文案',
            value: savedArticles.length
          }
        ];
        break;
        
      case 'anchor':
      case 'broker':
        // Anchor/Broker: 返回全量排名、贡献和累计获客
        const totalLeads = await db.collection('clients').where({
          owner_id: openid
        }).count();
        
        // 计算排名
        const allUsers = await db.collection('clients')
          .aggregate()
          .group({
            _id: '$owner_id',
            leads: _.sum(1)
          })
          .sort({ leads: -1 })
          .end();
        
        let rank = 0;
        let currentRank = 1;
        for (const item of allUsers.list) {
          if (item._id === openid) {
            rank = currentRank;
            break;
          }
          currentRank++;
        }
        
        dashboard = [
          {
            label: '全量排名',
            value: rank || '未上榜'
          },
          {
            label: '贡献',
            value: user.contribution || 0
          },
          {
            label: '累计获客',
            value: totalLeads.total
          }
        ];
        break;
        
      case 'admin':
        // Admin: 返回今日总线索、今日总带看和待审人员
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayLeads = await db.collection('clients').where({
          createTime: _.gte(today)
        }).count();
        
        const todayShowings = await db.collection('showings').where({
          createTime: _.gte(today)
        }).count();
        
        const pendingApplications = await db.collection('applications').where({
          status: 'pending'
        }).count();
        
        dashboard = [
          {
            label: '今日总线索',
            value: todayLeads.total
          },
          {
            label: '今日总带看',
            value: todayShowings.total
          },
          {
            label: '待审人员',
            value: pendingApplications.total
          }
        ];
        break;
        
      default:
        dashboard = [];
    }
    
    // 3. 获取排名信息
    let rankInfo = null;
    if (role === 'anchor' || role === 'broker') {
      const totalLeads = await db.collection('clients').where({
        owner_id: openid
      }).count();
      
      // 计算排名
      const allUsers = await db.collection('clients')
        .aggregate()
        .group({
          _id: '$owner_id',
          leads: _.sum(1)
        })
        .sort({ leads: -1 })
        .end();
      
      let rank = 0;
      let currentRank = 1;
      for (const item of allUsers.list) {
        if (item._id === openid) {
          rank = currentRank;
          break;
        }
        currentRank++;
      }
      
      rankInfo = {
        rank: rank || null,
        totalLeads: totalLeads.total
      };
    }
    
    // 4. 获取勋章列表
    let medals = [];
    const userMedals = user.medals || [];
    
    // 定义勋章列表
    const allMedals = [
      {
        id: 'first_lead',
        name: '首单达人',
        icon: 'cloud://.../medals/first_lead.png'
      },
      {
        id: 'top_seller',
        name: '销售冠军',
        icon: 'cloud://.../medals/top_seller.png'
      },
      {
        id: 'content_master',
        name: '内容大师',
        icon: 'cloud://.../medals/content_master.png'
      },
      {
        id: 'social_king',
        name: '社交王者',
        icon: 'cloud://.../medals/social_king.png'
      }
    ];
    
    // 生成用户勋章列表
    for (const medal of allMedals) {
      medals.push({
        id: medal.id,
        name: medal.name,
        icon: medal.icon,
        unlocked: userMedals.includes(medal.id)
      });
    }
    
    return {
      code: 0,
      data: {
        role: role,
        dashboard: dashboard,
        rankInfo: rankInfo,
        medals: medals
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
