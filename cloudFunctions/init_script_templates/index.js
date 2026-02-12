const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

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
      painPoints: ['信息太多分不清真假', '看房容易踩坑', '价格谈不下来'],
      valuePoints: ['一句话判断是否该出手', '三类房源最抗跌', '砍价话术给你现成的'],
      interaction: ['你在哪个区？我按区给你一句建议', '想要清单的打"1"', '首套还是二套？我给你算一笔账'],
      cta: '私信我"区域+预算"，我发你一份本周可看的真实房源清单',
      notes: '适合开场吸引流量，节奏要快'
    },
    status: 'published',
    sort: 100,
    version: '1.0'
  },
  {
    id: 2,
    title: '今天这个政策，影响你买房吗',
    category: 'daily_hot',
    scene: '政策解读开场',
    tags: ['政策', '解读', '刚需'],
    durationMin: 4,
    content: {
      opening: '今天有个新政策出来了，很多粉丝问我：这个政策到底对我买房有没有影响？',
      painPoints: ['政策看不懂', '不知道什么时候买房合适', '担心买贵了'],
      valuePoints: ['3分钟看懂政策核心', '告诉你现在是不是买房时机', '教你如何利用政策优惠'],
      interaction: ['你现在是首套还是二套？', '打算什么时候买房？', '评论区告诉我你的预算'],
      cta: '想了解具体政策的，私信我"政策"，我发你详细解读',
      notes: '政策解读要通俗易懂'
    },
    status: 'published',
    sort: 90,
    version: '1.0'
  },
  {
    id: 3,
    title: '学区房别只看名校，这三个点最要命',
    category: 'school_zone',
    scene: '学区房专题，家长必看',
    tags: ['学区', '教育', '刚需'],
    durationMin: 5,
    content: {
      opening: '很多家长买学区房第一步就走错：只盯名校，不看落户和片区稳定...',
      painPoints: ['买了也上不了', '片区划片变动', '房龄老、交易难'],
      valuePoints: ['一分钟判断能不能稳上', '三种学区房最保值', '预算不足的替代方案'],
      interaction: ['孩子几年级？我按年级给策略', '你预算多少？我告诉你适合的学区类型'],
      cta: '打"学区"我给你发一张片区判断表（不解释，照着填就知道能不能买）',
      notes: '针对有学龄儿童的家庭'
    },
    status: 'published',
    sort: 100,
    version: '1.0'
  },
  {
    id: 4,
    title: '学区房买错了，孩子也上不了',
    category: 'school_zone',
    scene: '学区房避坑指南',
    tags: ['学区', '避坑', '教育'],
    durationMin: 4,
    content: {
      opening: '昨天有个粉丝找我，说买了学区房，结果孩子还是上不了名校，为什么？',
      painPoints: ['不了解落户政策', '不知道片区划分规则', '买了老破小没人要'],
      valuePoints: ['告诉你学区房落户的3个关键时间点', '教你如何查询片区划分', '推荐3种保值学区房'],
      interaction: ['你家孩子几年级？', '现在看中哪个学区？'],
      cta: '想了解学区房避坑的，私信我"学区避坑"，我发你详细指南',
      notes: '强调风险，建立信任'
    },
    status: 'published',
    sort: 90,
    version: '1.0'
  },
  {
    id: 5,
    title: '这套房值不值？我用5句话讲透',
    category: 'listing_intro',
    scene: '房源讲解通用模板',
    tags: ['房源', '讲解', '对比'],
    durationMin: 5,
    content: {
      opening: '家人们看房别被装修带跑，我用5句话把这套房的优缺点讲透...',
      painPoints: ['户型看不懂', '楼层采光没概念', '小区品质靠猜'],
      valuePoints: ['一眼看出户型雷点', '采光风向怎么判断', '同小区怎么比价'],
      interaction: ['你更在意采光还是楼层？', '要不要我把同小区对比也拉给你？'],
      cta: '想看同预算更优的，私信我"预算+区域"，我给你直接发对比表',
      notes: '适合看房时讲解，突出专业度'
    },
    status: 'published',
    sort: 100,
    version: '1.0'
  },
  {
    id: 6,
    title: '这套房为什么值得买？3个理由',
    category: 'listing_intro',
    scene: '房源亮点讲解',
    tags: ['房源', '亮点', '推荐'],
    durationMin: 3,
    content: {
      opening: '今天带大家看一套性价比很高的房源，为什么说它值得买？',
      painPoints: ['不知道怎么判断房源好坏', '担心买贵了', '怕买到问题房'],
      valuePoints: ['地段优势明显', '户型方正利用率高', '价格低于同小区10%'],
      interaction: ['你觉得这套房怎么样？', '想看更多房源的打"想看"'],
      cta: '想看这套房的，私信我"房源+联系方式"，我发你详细资料',
      notes: '突出性价比，促进成交'
    },
    status: 'published',
    sort: 90,
    version: '1.0'
  },
  {
    id: 7,
    title: '昨天成交这套房，客户砍价5万',
    category: 'deal_story',
    scene: '成交故事，建立信任',
    tags: ['成交', '砍价', '案例'],
    durationMin: 4,
    content: {
      opening: '昨天成交了一套河西区的房子，客户从260万砍到255万，我是怎么帮他谈下来的？',
      painPoints: ['不知道怎么砍价', '担心砍多了业主不卖', '不知道市场底价'],
      valuePoints: ['告诉你砍价的3个关键话术', '教你如何判断业主底价', '分享真实的成交案例'],
      interaction: ['你买房预算多少？', '想了解砍价技巧的打"技巧"'],
      cta: '想学习砍价技巧的，私信我"砍价"，我发你详细教程',
      notes: '用真实案例建立信任'
    },
    status: 'published',
    sort: 100,
    version: '1.0'
  },
  {
    id: 8,
    title: '这个客户买房只用了3天',
    category: 'deal_story',
    scene: '高效成交案例',
    tags: ['成交', '效率', '案例'],
    durationMin: 3,
    content: {
      opening: '有个客户找我买房，从第一次见面到签约，只用了3天，他是怎么做到的？',
      painPoints: ['看房看了几个月还没定', '不知道自己想要什么样的房子', '担心买错'],
      valuePoints: ['教你如何快速明确需求', '告诉你高效看房的3个方法', '分享快速成交的经验'],
      interaction: ['你买房看了多久了？', '想快速买房的打"快速"'],
      cta: '想快速找到合适房源的，私信我"快速+需求"，我帮你匹配',
      notes: '强调专业性和效率'
    },
    status: 'published',
    sort: 90,
    version: '1.0'
  },
  {
    id: 9,
    title: '买房这3个坑，90%的人都踩过',
    category: 'avoid_pit',
    scene: '避坑科普，反向吸引',
    tags: ['避坑', '科普', '必看'],
    durationMin: 5,
    content: {
      opening: '买房最容易踩的3个坑，90%的人都不知道，今天我一次性告诉你...',
      painPoints: ['不知道买房有哪些坑', '担心买到问题房', '买房流程不熟悉'],
      valuePoints: ['告诉你买房最常踩的3个坑', '教你如何避开这些坑', '分享买房的注意事项'],
      interaction: ['你买房遇到过什么问题？', '想了解避坑的打"避坑"'],
      cta: '想了解买房避坑的，私信我"避坑"，我发你详细指南',
      notes: '用恐惧心理吸引关注'
    },
    status: 'published',
    sort: 100,
    version: '1.0'
  },
  {
    id: 10,
    title: '这3种房千万别买，买了就亏',
    category: 'avoid_pit',
    scene: '避坑指南，风险提示',
    tags: ['避坑', '风险', '必看'],
    durationMin: 4,
    content: {
      opening: '今天告诉大家3种绝对不能买的房子，买了就亏，一定要看...',
      painPoints: ['不知道哪些房子有问题', '担心买到问题房', '买房没有风险意识'],
      valuePoints: ['告诉你3种绝对不能买的房子', '教你如何识别问题房', '分享买房的风险防范'],
      interaction: ['你看过哪些有问题的房子？', '想了解风险防范的打"风险"'],
      cta: '想了解买房风险的，私信我"风险"，我发你详细指南',
      notes: '强调风险，建立专业形象'
    },
    status: 'published',
    sort: 90,
    version: '1.0'
  }
];

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  
  try {
    const userResult = await db.collection('users')
      .where({
        _openid: wxContext.OPENID
      })
      .get();
      
    if (userResult.data.length === 0 || userResult.data[0].role !== 'admin') {
      return {
        code: 403,
        message: '权限不足，仅管理员可执行此操作'
      };
    }
    
    const countResult = await db.collection('script_templates').count();
    
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