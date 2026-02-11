// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { type = 'month', topN = 10, businessType = 'anchor' } = event;
    const openid = cloud.getWXContext().OPENID;
    
    console.log(`获取龙虎榜数据 - 类型: ${type}, 业务类型: ${businessType}, topN: ${topN}`);
    
    // 1. 计算时间范围（如果是月度榜）
    let timeCondition = {};
    if (type === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      timeCondition = {
        createTime: _.gte(startOfMonth)
      };
    }
    
    let leaderboardList = [];
    let myRank = null;
    
    // 根据不同业务类型获取不同的排行榜数据
    switch (businessType) {
      case 'rental':
        // 租赁经纪人：统计签约数（contracts表）
        const rentalResult = await getRentalLeaderboard(timeCondition, topN, openid);
        leaderboardList = rentalResult.leaderboardList;
        myRank = rentalResult.myRank;
        break;
        
      case 'trading':
      case 'new_house':
        // 买卖/新房经纪人：统计带看数（reports表，type='showings'）
        const tradingResult = await getTradingLeaderboard(timeCondition, topN, openid);
        leaderboardList = tradingResult.leaderboardList;
        myRank = tradingResult.myRank;
        break;
        
      case 'anchor':
      default:
        // 主播：统计获客数（clients表）
        const anchorResult = await getAnchorLeaderboard(timeCondition, topN, openid);
        leaderboardList = anchorResult.leaderboardList;
        myRank = anchorResult.myRank;
        break;
    }
    
    return {
      code: 0,
      data: {
        list: leaderboardList,
        myRank: myRank,
        businessType: businessType
      }
    };
    
  } catch (err) {
    console.error('服务器错误:', err);
    return {
      code: 5000,
      message: '服务器内部错误',
      error: err.message
    };
  }
};

// 主播：统计获客数（clients表）
async function getAnchorLeaderboard(timeCondition, topN, openid) {
  try {
    console.log('主播榜查询条件:', JSON.stringify(timeCondition));
    
    // 先查询总数据量（用于调试）
    const totalCount = await db.collection('clients').count();
    console.log('clients表总数据量:', totalCount.total);
    
    // 聚合查询获取获客榜数据（使用 $match 阶段处理时间过滤）
    const aggregation = db.collection('clients').aggregate();
    
    // 添加时间过滤条件（兼容 createTime 和 createdAt）
    if (timeCondition.createTime) {
      aggregation.match({
        $or: [
          { createTime: timeCondition.createTime },
          { createdAt: timeCondition.createTime }
        ]
      });
    }
    
    const leaderboard = await aggregation
      .group({
        _id: '$owner_id',
        count: $.sum(1)
      })
      .sort({
        count: -1
      })
      .limit(topN)
      .end();
    
    console.log('聚合查询结果数量:', leaderboard.list.length);
    
    // 获取用户信息
    const leaderboardList = await getUserInfoForLeaderboard(leaderboard.list, 'leads');
    
    // 获取当前用户排名
    const myRank = await getMyRank(openid, timeCondition, 'clients', 'owner_id');
    
    return { leaderboardList, myRank };
  } catch (err) {
    console.error('获取主播获客榜失败:', err);
    throw err;
  }
}

// 租赁经纪人：统计签约数（contracts表）
async function getRentalLeaderboard(timeCondition, topN, openid) {
  try {
    // 获取当前用户的手机号用于匹配
    let myPhone = null;
    if (openid) {
      const myUserInfo = await db.collection('users').where({ _openid: openid }).get();
      if (myUserInfo.data.length > 0) {
        myPhone = myUserInfo.data[0].phone;
      }
    }
    
    // 聚合查询获取签约榜数据（按brokerPhone分组）
    // 注意：aggregate() 不能与 where() 链式调用，需要使用 match 阶段
    const aggregation = db.collection('contracts').aggregate();
    
    // 添加时间过滤条件
    if (timeCondition.createTime) {
      aggregation.match({
        $or: [
          { createTime: timeCondition.createTime },
          { createdAt: timeCondition.createTime }
        ]
      });
    }
    
    const leaderboard = await aggregation
      .group({
        _id: '$brokerPhone',
        count: $.sum(1)
      })
      .sort({
        count: -1
      })
      .limit(topN)
      .end();
    
    // 获取用户信息（通过手机号匹配）
    const leaderboardList = [];
    let rank = 1;
    
    for (const item of leaderboard.list) {
      const userInfo = await db.collection('users').where({
        phone: item._id
      }).get();
      
      if (userInfo.data.length > 0) {
        const user = userInfo.data[0];
        leaderboardList.push({
          _openid: user._openid,
          nickname: user.nickname || '未知用户',
          avatar: user.avatarUrl || '',
          contracts: item.count,
          rank: rank
        });
        rank++;
      }
    }
    
    // 获取当前用户排名
    let myRank = null;
    if (myPhone) {
      const myContracts = await db.collection('contracts')
        .where({
          brokerPhone: myPhone,
          ...timeCondition
        })
        .count();
      
      const myCount = myContracts.total;
      
      if (myCount > 0) {
        const higherRankUsers = await db.collection('contracts')
          .where(timeCondition)
          .aggregate()
          .group({
            _id: '$brokerPhone',
            count: $.sum(1)
          })
          .match({
            count: $.gt(myCount)
          })
          .end();
        
        myRank = {
          rank: higherRankUsers.list.length + 1,
          contracts: myCount
        };
      }
    }
    
    return { leaderboardList, myRank };
  } catch (err) {
    console.error('获取租赁签约榜失败:', err);
    throw err;
  }
}

// 买卖/新房经纪人：统计带看数（reports表，type='showings'）
async function getTradingLeaderboard(timeCondition, topN, openid) {
  try {
    // 聚合查询获取带看榜数据
    // 注意：aggregate() 不能与 where() 链式调用，需要使用 match 阶段
    const aggregation = db.collection('reports').aggregate();
    
    // 构建 match 条件：type='showings' + 时间条件
    const matchCondition = {
      type: 'showings'
    };
    
    if (timeCondition.createTime) {
      matchCondition.$or = [
        { createTime: timeCondition.createTime },
        { createdAt: timeCondition.createTime }
      ];
    }
    
    const leaderboard = await aggregation
      .match(matchCondition)
      .group({
        _id: '$reporterId',
        count: $.sum('$count')
      })
      .sort({
        count: -1
      })
      .limit(topN)
      .end();
    
    // 获取用户信息
    const leaderboardList = await getUserInfoForLeaderboard(leaderboard.list, 'showings');
    
    // 获取当前用户排名
    let myRank = null;
    if (openid) {
      const myReports = await db.collection('reports')
        .where({
          reporterId: openid,
          type: 'showings',
          ...timeCondition
        })
        .get();
      
      const myCount = myReports.data.reduce((sum, item) => sum + (item.count || 0), 0);
      
      if (myCount > 0) {
        const higherRankUsers = await db.collection('reports')
          .where(queryCondition)
          .aggregate()
          .group({
            _id: '$reporterId',
            count: $.sum('$count')
          })
          .match({
            count: $.gt(myCount)
          })
          .end();
        
        myRank = {
          rank: higherRankUsers.list.length + 1,
          showings: myCount
        };
      }
    }
    
    return { leaderboardList, myRank };
  } catch (err) {
    console.error('获取买卖带看榜失败:', err);
    throw err;
  }
}

// 通用函数：获取用户信息并格式化排行榜数据
async function getUserInfoForLeaderboard(list, countField) {
  const leaderboardList = [];
  let rank = 1;
  
  for (const item of list) {
    const userInfo = await db.collection('users').where({
      _openid: item._id
    }).get();
    
    if (userInfo.data.length > 0) {
      const user = userInfo.data[0];
      leaderboardList.push({
        _openid: item._id,
        nickname: user.nickname || '未知用户',
        avatar: user.avatarUrl || '',
        [countField]: item.count,
        rank: rank
      });
      rank++;
    } else {
      // 如果没有users记录，也显示在排行榜中（使用默认信息）
      leaderboardList.push({
        _openid: item._id,
        nickname: `主播${rank}`,
        avatar: '',
        [countField]: item.count,
        rank: rank
      });
      rank++;
    }
  }
  
  return leaderboardList;
}

// 通用函数：获取当前用户排名
async function getMyRank(openid, timeCondition, collection, idField) {
  if (!openid) return null;
  
  try {
    // 兼容两种时间字段名
    let queryCondition = {};
    if (timeCondition.createTime) {
      queryCondition = {
        $or: [
          { createTime: timeCondition.createTime },
          { createdAt: timeCondition.createTime }
        ]
      };
    }
    
    const myCountResult = await db.collection(collection)
      .where({
        [idField]: openid,
        ...queryCondition
      })
      .count();
    
    const myCount = myCountResult.total;
    
    if (myCount === 0) return null;
    
    const higherRankUsers = await db.collection(collection)
      .where(queryCondition)
      .aggregate()
      .group({
        _id: `$${idField}`,
        count: $.sum(1)
      })
      .match({
        count: $.gt(myCount)
      })
      .end();
    
    return {
      rank: higherRankUsers.list.length + 1,
      count: myCount
    };
  } catch (err) {
    console.error('获取用户排名失败:', err);
    return null;
  }
}
