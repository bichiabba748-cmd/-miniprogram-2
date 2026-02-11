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
    
    // 优先使用前端传入的角色（用于测试角色切换）
    const clientRole = event.role;
    
    // 1. 获取用户信息
    const userInfo = await db.collection('users').where({
      _openid: openid
    }).get();
    
    if (userInfo.data.length === 0) {
      return {
        code: 0,
        data: {
          role: clientRole || 'visitor',
          dashboard: [],
          rankInfo: null,
          medals: []
        }
      };
    }
    
    const user = userInfo.data[0];
    // 使用前端传入的角色（如果有），否则使用数据库中的角色
    const role = clientRole || user.role || 'visitor';
    
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
        let rank = 0;
        try {
          const allUsers = await db.collection('clients')
            .aggregate()
            .group({
              _id: '$owner_id',
              leads: _.sum(1)
            })
            .sort({ leads: -1 })
            .end();
          
          console.log('Aggregate result for dashboard:', JSON.stringify(allUsers));
          
          if (allUsers && allUsers.list && Array.isArray(allUsers.list)) {
            let currentRank = 1;
            for (const item of allUsers.list) {
              if (item._id === openid) {
                rank = currentRank;
                break;
              }
              currentRank++;
            }
          }
        } catch (aggregateErr) {
          console.error('Dashboard aggregate error:', aggregateErr);
          rank = 0;
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
      let rank = 0;
      try {
        const allUsers = await db.collection('clients')
          .aggregate()
          .group({
            _id: '$owner_id',
            leads: _.sum(1)
          })
          .sort({ leads: -1 })
          .end();
        
        console.log('Aggregate result for rankInfo:', JSON.stringify(allUsers));
        
        if (allUsers && allUsers.list && Array.isArray(allUsers.list)) {
          let currentRank = 1;
          for (const item of allUsers.list) {
            if (item._id === openid) {
              rank = currentRank;
              break;
            }
            currentRank++;
          }
        }
      } catch (aggregateErr) {
        console.error('RankInfo aggregate error:', aggregateErr);
        rank = 0;
      }
      
      rankInfo = {
        rank: rank || null,
        totalLeads: totalLeads.total
      };
    }
    
    // 4. 获取勋章列表 - 按角色分类
    let medals = [];
    const userMedals = user.medals || [];
    
    // 定义勋章分类
    // 通用勋章（所有角色）
    const commonMedals = [
      {
        id: 'first_login',
        name: '初出茅庐',
        icon: '🌱',
        condition: '完成首次登录并加入星火计划'
      }
    ];
    
    // 学习类勋章（主播和经纪人共有）
    const learningMedals = [
      {
        id: 'content_master',
        name: '军火专家',
        icon: '⚔️',
        condition: '累计收藏30篇文案'
      },
      {
        id: 'course_complete',
        name: '学霸达人',
        icon: '📚',
        condition: '完成10门课程学习'
      }
    ];
    
    // 主播专属 - 获客类勋章
    const anchorMedals = [
      {
        id: 'lead_hunter',
        name: '获客达人',
        icon: '🎯',
        condition: '累计获客10组'
      },
      {
        id: 'lead_master',
        name: '百人斩',
        icon: '🔥',
        condition: '累计获客100组'
      },
      {
        id: 'lead_king',
        name: '获客王者',
        icon: '👑',
        condition: '累计获客500组'
      }
    ];
    
    // 经纪人专属 - 转化类勋章
    const brokerMedals = [
      {
        id: 'first_deal',
        name: '首单达人',
        icon: '🎉',
        condition: '完成首单成交'
      },
      {
        id: 'deal_master',
        name: '成交达人',
        icon: '💼',
        condition: '累计成交10单'
      },
      {
        id: 'top_seller',
        name: '销售冠军',
        icon: '🏆',
        condition: '月度成交冠军'
      }
    ];
    
    // 根据角色组合勋章列表
    let roleMedals = [];
    
    // 所有角色都有通用勋章
    roleMedals = [...commonMedals];
    
    // 学员、主播和经纪人有学习勋章
    if (role === 'student' || role === 'anchor' || role === 'broker') {
      roleMedals = [...roleMedals, ...learningMedals];
    }
    
    // 主播专属获客勋章
    if (role === 'anchor') {
      roleMedals = [...roleMedals, ...anchorMedals];
    }
    
    // 经纪人专属转化勋章
    if (role === 'broker') {
      roleMedals = [...roleMedals, ...brokerMedals];
    }
    
    // 生成用户勋章列表（带解锁状态和进度）
    for (const medal of roleMedals) {
      // 测试模式：根据角色解锁部分勋章，便于测试
      let unlocked = userMedals.includes(medal.id);
      
      // 测试数据：为不同角色解锁不同勋章
      if (!unlocked) {
        switch (role) {
          case 'student':
            // 学员解锁学习相关勋章
            if (medal.id === 'first_login' || medal.id === 'content_master') {
              unlocked = true;
            }
            break;
          case 'anchor':
            // 主播解锁获客相关勋章
            if (medal.id === 'first_login' || medal.id === 'lead_hunter' || medal.id === 'content_master') {
              unlocked = true;
            }
            break;
          case 'broker':
            // 经纪人解锁转化相关勋章
            if (medal.id === 'first_login' || medal.id === 'first_deal' || medal.id === 'content_master') {
              unlocked = true;
            }
            break;
        }
      }
      
      // 计算进度（简化版，实际应根据业务数据计算）
      let progress = 0;
      if (unlocked) {
        progress = 100;
      } else {
        // 根据勋章类型估算进度
        switch (medal.id) {
          case 'first_login':
            progress = 100; // 已登录即完成
            break;
          case 'content_master':
            progress = 50; // 测试进度
            break;
          case 'course_complete':
            progress = 30; // 测试进度
            break;
          case 'lead_hunter':
            progress = 60; // 测试进度
            break;
          case 'lead_master':
            progress = 20; // 测试进度
            break;
          case 'lead_king':
            progress = 5; // 测试进度
            break;
          case 'first_deal':
            progress = 100; // 测试进度
            break;
          case 'deal_master':
            progress = 40; // 测试进度
            break;
          case 'top_seller':
            progress = 10; // 测试进度
            break;
        }
      }
      
      medals.push({
        id: medal.id,
        name: medal.name,
        icon: medal.icon,
        locked: !unlocked,
        progress: Math.round(progress),
        condition: medal.condition
      });
    }
    
    return {
      code: 0,
      data: {
        role: role,
        userInfo: {
          nickName: user.nickname || user.nickName || '微信用户',
          avatarUrl: user.avatarUrl || user.avatar || ''
        },
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
