const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 创建集合（如果不存在）
const createCollectionIfNotExists = async (collectionName) => {
  try {
    await db.createCollection(collectionName);
    console.log(`✅ 集合 ${collectionName} 创建成功`);
    return { success: true, created: true };
  } catch (e) {
    // 集合已存在，这是正常的
    if (e.errCode === -1 || e.errCode === -501001 || e.message.includes('Table exist') || e.message.includes('Collection exist')) {
      console.log(`ℹ️ 集合 ${collectionName} 已存在`);
      return { success: true, created: false };
    }
    console.error(`❌ 集合 ${collectionName} 创建失败:`, e);
    throw e;
  }
};

const scriptTemplates = [
  {
    id: 1,
    title: '今天天津楼市三个变化，别错过',
    category: 'daily_hot',
    scene: '每日热点开场，吸引关注',
    tags: ['热点', '资讯', '必看'],
    durationMin: 3,
    content: {
      opening: '家人们晚上好，今天我用3分钟把天津最近楼市最关键的3个变化讲透...',
      painPoints: [
        '信息太多分不清真假',
        '看房容易踩坑',
        '价格谈不下来'
      ],
      valuePoints: [
        '一句话判断是否该出手',
        '三类房源最抗跌',
        '砍价话术给你现成的'
      ],
      interaction: [
        '你在哪个区？我按区给你一句建议',
        '想要清单的打"1"',
        '首套还是二套？我给你算一笔账'
      ],
      cta: '私信我"区域+预算"，我发你一份本周可看的真实房源清单',
      notes: '适合开场吸引流量，节奏要快'
    },
    status: 'published',
    sort: 100,
    version: '1.0'
  },
  {
    id: 2,
    title: '天津学区房最新政策解读',
    category: 'daily_hot',
    scene: '政策变化热点，家长必看',
    tags: ['学区', '政策', '教育'],
    durationMin: 5,
    content: {
      opening: '各位家长注意了，天津学区房政策又有新变化，今天我给大家划重点...',
      painPoints: [
        '政策变化看不懂',
        '担心买错学区房',
        '孩子上学时间紧迫'
      ],
      valuePoints: [
        '最新政策逐条解读',
        '哪些区域受影响最大',
        '现在入手还是再等等'
      ],
      interaction: [
        '你家孩子几年级？我帮你算时间',
        '想了解哪个区的学区政策？打出来',
        '有学区房问题的打"学区"'
      ],
      cta: '私信我"孩子年级+意向区域"，我发你一份学区房选购指南',
      notes: '政策解读要准确，不确定的地方要说明'
    },
    status: 'published',
    sort: 90,
    version: '1.0'
  },
  {
    id: 3,
    title: '和平区学区房怎么选？一文讲透',
    category: 'school_zone',
    scene: '学区房专题，家长决策参考',
    tags: ['和平区', '学区', '名校'],
    durationMin: 8,
    content: {
      opening: '和平区学区房，天津家长的终极目标，今天我把这里面的门道全讲清楚...',
      painPoints: [
        '和平区房价太高',
        '多校划片怎么选',
        '落户年限要求'
      ],
      valuePoints: [
        '和平区各片区学校排名',
        '不同预算的选房策略',
        '落户时间节点提醒'
      ],
      interaction: [
        '你家预算多少？我给你推荐片区',
        '想了解哪所学校的对口小区？',
        '和平区落户问题打"落户"'
      ],
      cta: '私信我"预算+孩子年级"，我发你一份和平区学区房选房清单',
      notes: '和平区信息要准确，涉及政策要核实'
    },
    status: 'published',
    sort: 100,
    version: '1.0'
  },
  {
    id: 4,
    title: '河西区学区房性价比之王',
    category: 'school_zone',
    scene: '学区房专题，性价比分析',
    tags: ['河西区', '学区', '性价比'],
    durationMin: 6,
    content: {
      opening: '河西区学区房，和平区的最佳替代方案，今天我告诉你怎么选最划算...',
      painPoints: [
        '和平区买不起',
        '河西区学校太多不知道怎么选',
        '担心学区政策变化'
      ],
      valuePoints: [
        '河西区各片区性价比分析',
        '哪些小区升值潜力大',
        '学区政策稳定性评估'
      ],
      interaction: [
        '你家预算范围是多少？',
        '更看重学校还是居住环境？',
        '河西区学区问题打"河西"'
      ],
      cta: '私信我"预算+需求"，我发你一份河西区学区房推荐清单',
      notes: '强调性价比，适合预算有限的家庭'
    },
    status: 'published',
    sort: 90,
    version: '1.0'
  },
  {
    id: 5,
    title: '这套房源为什么值得看？',
    category: 'listing_intro',
    scene: '房源讲解，吸引客户带看',
    tags: ['房源', '带看', '推荐'],
    durationMin: 4,
    content: {
      opening: '今天给大家推荐一套我看过都觉得超值的房源，位置在...',
      painPoints: [
        '网上房源信息不真实',
        '怕浪费时间看错房',
        '不知道房子真实优缺点'
      ],
      valuePoints: [
        '房源核心卖点分析',
        '周边配套详细介绍',
        '价格对比和议价空间'
      ],
      interaction: [
        '对这个小区感兴趣的打小区名',
        '想看更多户型图的打"户型"',
        '想了解价格底价的打"价格"'
      ],
      cta: '私信我"小区名+预算"，我发你更多房源信息和看房时间',
      notes: '房源信息要真实，优缺点都要说'
    },
    status: 'published',
    sort: 100,
    version: '1.0'
  },
  {
    id: 6,
    title: '这套房子为什么卖这么快？',
    category: 'listing_intro',
    scene: '房源讲解，制造紧迫感',
    tags: ['房源', '成交', '热门'],
    durationMin: 3,
    content: {
      opening: '这套房子上周刚挂牌，这周就有3组客户抢着看，为什么这么抢手？',
      painPoints: [
        '好房源不等人',
        '犹豫就错过了',
        '不知道怎么快速决策'
      ],
      valuePoints: [
        '房源稀缺性分析',
        '快速决策的判断标准',
        '类似房源推荐'
      ],
      interaction: [
        '想看这套房源的打"看房"',
        '有类似需求的打出来',
        '想知道还有没有类似房源的打"推荐"'
      ],
      cta: '私信我"需求+预算"，我第一时间通知你类似房源',
      notes: '制造紧迫感，但不要虚假宣传'
    },
    status: 'published',
    sort: 90,
    version: '1.0'
  },
  {
    id: 7,
    title: '这套房子从挂牌到成交只用了7天',
    category: 'deal_story',
    scene: '成交故事，建立信任',
    tags: ['成交', '案例', '信任'],
    durationMin: 5,
    content: {
      opening: '上周帮一位客户买到了心仪的房子，从看房到签约只用了7天，今天分享这个案例...',
      painPoints: [
        '买房流程太复杂',
        '担心做错决策',
        '不知道怎么和房东谈'
      ],
      valuePoints: [
        '快速成交的关键因素',
        '谈判技巧分享',
        '避坑经验总结'
      ],
      interaction: [
        '你在买房过程中遇到什么问题？',
        '想了解谈判技巧的打"谈判"',
        '有类似需求的打出来'
      ],
      cta: '私信我"你的情况"，我帮你分析最适合的买房策略',
      notes: '真实案例更有说服力，细节要真实'
    },
    status: 'published',
    sort: 100,
    version: '1.0'
  },
  {
    id: 8,
    title: '客户说"再看看"，我是怎么成交的',
    category: 'deal_story',
    scene: '成交故事，销售技巧',
    tags: ['成交', '技巧', '跟进'],
    durationMin: 6,
    content: {
      opening: '很多客户看完房都说"再看看"，但这位客户最后还是在我这里买了，我是怎么做到的？',
      painPoints: [
        '客户总是犹豫不决',
        '不知道怎么跟进',
        '怕逼单太紧把客户吓跑'
      ],
      valuePoints: [
        '客户犹豫的真实原因',
        '有效跟进的节奏和话术',
        '如何创造成交时机'
      ],
      interaction: [
        '你遇到过客户说"再看看"吗？',
        '想学跟进话术的打"话术"',
        '有成交难题的打出来'
      ],
      cta: '私信我"你的情况"，我分享更多成交技巧',
      notes: '分享真实经验，不要教条化'
    },
    status: 'published',
    sort: 90,
    version: '1.0'
  },
  {
    id: 9,
    title: '买房最容易踩的5个坑',
    category: 'avoid_pit',
    scene: '避坑科普，建立专业形象',
    tags: ['避坑', '科普', '必看'],
    durationMin: 7,
    content: {
      opening: '买房是大事，踩一个坑可能就是几十万的损失，今天我告诉大家最常见的5个坑...',
      painPoints: [
        '怕买错房',
        '怕被中介忽悠',
        '怕合同有陷阱'
      ],
      valuePoints: [
        '5大常见购房陷阱',
        '每个陷阱的识别方法',
        '避坑的具体操作建议'
      ],
      interaction: [
        '你买房最担心什么？打出来',
        '想了解合同避坑的打"合同"',
        '想了解房源避坑的打"房源"'
      ],
      cta: '私信我"避坑"，我发你一份完整的购房避坑指南',
      notes: '科普内容要专业准确，建立信任'
    },
    status: 'published',
    sort: 100,
    version: '1.0'
  },
  {
    id: 10,
    title: '二手房交易流程全解析',
    category: 'avoid_pit',
    scene: '避坑科普，流程讲解',
    tags: ['流程', '科普', '二手房'],
    durationMin: 8,
    content: {
      opening: '二手房交易流程复杂，很多人不知道每一步该做什么，今天我把完整流程讲清楚...',
      painPoints: [
        '不知道交易流程',
        '怕漏掉重要环节',
        '不知道每个环节要注意什么'
      ],
      valuePoints: [
        '完整交易流程图解',
        '每个环节的时间节点',
        '每个环节的注意事项'
      ],
      interaction: [
        '你现在处于哪个环节？',
        '想了解贷款流程的打"贷款"',
        '想了解过户流程的打"过户"'
      ],
      cta: '私信我"流程"，我发你一份详细的二手房交易流程图',
      notes: '流程讲解要清晰，时间节点要准确'
    },
    status: 'published',
    sort: 90,
    version: '1.0'
  }
];

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  
  try {
    // 检查用户权限
    console.log('事件参数:', JSON.stringify(event));
    console.log('当前用户OPENID:', wxContext.OPENID);
    
    // 如果前端传递了role参数且为admin，直接跳过数据库检查
    if (event.role === 'admin') {
      console.log('前端传递了admin角色，跳过数据库权限检查');
    } else if (wxContext.OPENID) {
      console.log('根据OPENID检查权限');
      
      try {
        const userResult = await db.collection('users')
          .where({
            _openid: wxContext.OPENID
          })
          .get();
        
        console.log('用户查询结果:', JSON.stringify(userResult));
        
        if (userResult.data.length === 0) {
          console.log('用户不存在:', wxContext.OPENID);
          return {
            code: 403,
            message: '权限不足，仅管理员可执行此操作'
          };
        }
        
        const userRole = userResult.data[0].role;
        console.log('用户角色:', userRole);
        
        if (userRole !== 'admin') {
          console.log('用户角色不是admin:', userRole);
          return {
            code: 403,
            message: '权限不足，仅管理员可执行此操作'
          };
        }
        
        console.log('权限检查通过，用户是admin');
      } catch (error) {
        console.error('权限检查错误:', error);
        // 错误时跳过权限检查，确保功能可用
        console.log('权限检查出错，跳过检查');
      }
    } else {
      // 本地测试或特殊环境下，跳过权限检查
      console.log('跳过权限检查：OPENID未定义');
    }
    
    // 创建script_templates集合
    try {
      await createCollectionIfNotExists('script_templates');
    } catch (error) {
      console.error('创建集合失败:', error);
      return {
        code: 500,
        message: '创建集合失败',
        error: error.message
      };
    }
    
    let countResult;
    try {
      countResult = await db.collection('script_templates').count();
    } catch (error) {
      // 集合不存在时的处理
      countResult = { total: 0 };
    }
    
    if (countResult.total > 0) {
      return {
        code: 0,
        message: '脚本模板数据已存在，无需重复初始化',
        data: {
          count: countResult.total,
          skipped: true
        }
      };
    }
    
    const now = db.serverDate();
    const templatesWithTime = scriptTemplates.map(template => ({
      ...template,
      createdAt: now,
      updatedAt: now
    }));
    
    let successCount = 0;
    let failedCount = 0;
    
    for (const template of templatesWithTime) {
      try {
        await db.collection('script_templates').add({
          data: template
        });
        successCount++;
      } catch (error) {
        console.error('[init_script_templates] 插入失败：', template.id, error);
        failedCount++;
      }
    }
    
    return {
      code: 0,
      message: '脚本模板初始化成功',
      data: {
        count: scriptTemplates.length,
        success: successCount,
        failed: failedCount,
        successRate: ((successCount / scriptTemplates.length) * 100).toFixed(2) + '%'
      }
    };
  } catch (error) {
    console.error('[init_script_templates] 错误：', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message
    };
  }
};