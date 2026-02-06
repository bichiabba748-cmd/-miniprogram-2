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
    const { type = 'month', topN = 10 } = event;
    const openid = cloud.getWXContext().OPENID;
    
    // 1. 计算时间范围（如果是月度榜）
    let timeCondition = {};
    if (type === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      timeCondition = {
        createTime: _.gte(startOfMonth)
      };
    }
    
    // 2. 聚合查询获取龙虎榜数据
    // 按用户分组，统计获客数
    const leaderboard = await db.collection('clients')
      .where(timeCondition)
      .aggregate()
      .group({
        _id: '$owner_id',
        leads: _.sum(1)
      })
      .sort({
        leads: -1
      })
      .limit(topN)
      .end();
    
    // 3. 获取用户信息（昵称、头像等）
    const leaderboardList = [];
    let rank = 1;
    
    for (const item of leaderboard.list) {
      const userInfo = await db.collection('users').where({
        _openid: item._id
      }).get();
      
      if (userInfo.data.length > 0) {
        const user = userInfo.data[0];
        leaderboardList.push({
          _openid: item._id,
          nickname: user.nickname || '未知用户',
          avatar: user.avatarUrl || '',
          leads: item.leads,
          rank: rank
        });
        rank++;
      }
    }
    
    // 4. 获取当前用户的排名
    let myRank = null;
    if (openid) {
      // 统计当前用户的获客数
      const myClients = await db.collection('clients')
        .where({
          owner_id: openid,
          ...timeCondition
        })
        .count();
      
      const myLeads = myClients.total;
      
      if (myLeads > 0) {
        // 统计比当前用户获客数多的用户数量
        const higherRankUsers = await db.collection('clients')
          .where(timeCondition)
          .aggregate()
          .group({
            _id: '$owner_id',
            leads: _.sum(1)
          })
          .match({
            leads: _.gt(myLeads)
          })
          .end();
        
        myRank = {
          rank: higherRankUsers.list.length + 1,
          leads: myLeads
        };
      }
    }

    return {
      code: 0,
      data: {
        list: leaderboardList,
        myRank: myRank
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
