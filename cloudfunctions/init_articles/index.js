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
      await db.collection('articles').where({
        _id: _.exists(true)
      }).remove();
    }
    
    const articles = [
      {
        id: 1,
        title: '直播间留人话术：3秒抓住客户注意力',
        category: '口播',
        securityLevel: '公开',
        content: {
          script: '家人们，今天我要分享一个90%的经纪人都不知道的留人秘籍！\n\n第一句话决定客户去留，你还在说"欢迎来到直播间"吗？\n\n试试这个开场：\n"今天这套房，我敢说全天津只有3个人敢这么讲真话！"\n\n为什么这样说？因为制造了悬念+稀缺感！\n\n接下来3分钟，我会教你：\n1. 如何用一句话让客户停留\n2. 如何用痛点让客户产生共鸣\n3. 如何用利益让客户主动咨询\n\n觉得有用的扣1，我发你完整话术模板！',
          duration: '60s',
          scenes: ['直播开场', '留人技巧', '互动话术']
        },
        analysis: {
          hook: '制造悬念"90%的人都不知道" + 稀缺感"全天津只有3个人"',
          trust: '承诺提供价值"教你3个技巧" + 社会认同"扣1的人"',
          action: '明确行动指令"扣1" + 利益驱动"发你完整模板"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['直播', '留人', '话术', '互动'],
        status: 'pending',
        stats: {
          leads: 158,
          views: 2340,
          copies: 89
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 2,
        title: '和平区学区房避坑：这3个坑90%家长都踩过',
        category: '避坑',
        securityLevel: '内部',
        content: {
          script: '各位家长注意了！\n\n今天我要曝光和平区学区房的3个致命坑！\n\n坑一：距离学校近就是学区房？\n错！必须是划片范围内的！\n\n坑二：名校分校也是名校？\n错！师资和本部天差地别！\n\n坑三：买了房就能上？\n错！还要看落户年限！\n\n想知道怎么避坑？\n评论区回复"避坑"，我发你完整避坑指南！\n\n关注我，买房不踩坑！',
          duration: '45s',
          scenes: ['学区房', '避坑指南', '家长教育']
        },
        analysis: {
          hook: '制造紧迫感"致命坑" + 数字"3个" + 恐惧营销"90%都踩过"',
          trust: '专业知识"划片范围" + 真实案例"师资天差地别"',
          action: '明确行动"回复避坑" + 利益"发你指南" + 关注引导'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['学区房', '避坑', '和平区', '教育'],
        status: 'published',
        stats: {
          leads: 234,
          views: 4567,
          copies: 156
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 3,
        title: '探盘实战：如何用30秒讲透一个小区',
        category: '探盘',
        securityLevel: '内部',
        content: {
          script: '今天带大家看这个小区，为什么说它是性价比之王？\n\n第一，地段：\n距离地铁3号线只有200米，步行3分钟！\n\n第二，配套：\n楼下就是商场，买菜、吃饭、看电影一站式！\n\n第三，价格：\n同地段均价3万，这个小区只要2万5！\n\n为什么这么便宜？\n因为房龄稍老，但物业费只要1块2！\n\n适合谁？\n刚需上车、投资出租、老人养老！\n\n想看房的评论区扣"看房"！',
          duration: '30s',
          scenes: ['探盘', '小区介绍', '卖点提炼']
        },
        analysis: {
          hook: '制造悬念"性价比之王" + 承诺"30秒讲透"',
          trust: '具体数据"200米""3分钟""2万5" + 对比"同地段3万"',
          action: '明确目标客群"刚需/投资/养老" + 行动指令"扣看房"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['探盘', '小区', '性价比', '刚需'],
        status: 'draft',
        stats: {
          leads: 189,
          views: 3456,
          copies: 123
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 4,
        title: 'IP人设打造：如何成为客户信任的房产专家',
        category: 'IP人设',
        securityLevel: '内部',
        content: {
          script: '我是做了10年房产的王金牌，\n\n今天不卖房，只讲真话！\n\n为什么我敢说真话？\n因为我已经实现了财务自由！\n\n这10年，我见过太多坑：\n有人买了烂尾楼，血本无归！\n有人被中介忽悠，多花几十万！\n\n所以，我决定把我知道的都告诉你！\n\n关注我，买房不踩坑！\n\n有问题评论区留言，我一一解答！',
          duration: '50s',
          scenes: ['IP打造', '人设建立', '信任构建']
        },
        analysis: {
          hook: '权威背书"10年房产专家" + 反差"不卖房只讲真话"',
          trust: '社会认同"财务自由" + 痛点共鸣"见过太多坑"',
          action: '价值承诺"把知道的都告诉你" + 关注引导 + 互动引导'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['IP', '人设', '专家', '信任'],
        status: 'published',
        stats: {
          leads: 267,
          views: 5678,
          copies: 178
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 5,
        title: '政策解读：2026年天津楼市新政策全解析',
        category: '政策解读',
        securityLevel: '公开',
        content: {
          script: '2026年天津楼市有3个重大变化！\n\n变化一：首付比例下调\n首套房首付从30%降到20%！\n\n变化二：利率优惠\nLPR基础上再降20个基点！\n\n变化三：限购放松\n外地人买房只需社保满6个月！\n\n这意味着什么？\n买房门槛降低，月供压力减小！\n\n想买房的现在就是最佳时机！\n\n想了解具体怎么省钱的，\n评论区回复"政策"，我发你计算器！',
          duration: '55s',
          scenes: ['政策解读', '楼市新政', '买房时机']
        },
        analysis: {
          hook: '制造紧迫感"重大变化" + 数字"3个"',
          trust: '具体政策"首付30%→20%""利率降20基点" + 权威解读',
          action: '明确时机"现在就是最佳时机" + 行动"回复政策" + 利益"发计算器"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['政策', '楼市', '天津', '买房'],
        status: 'published',
        stats: {
          leads: 345,
          views: 6789,
          copies: 234
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 6,
        title: '成交技巧：如何用3句话让客户下定金',
        category: '成交技巧',
        securityLevel: '绝密',
        content: {
          script: '第一句话：制造稀缺\n"这套房昨天刚挂牌，今天已经有3个人在谈了！"\n\n第二句话：制造紧迫\n"房东说今晚12点前不签就涨价！"\n\n第三句话：制造损失\n"你现在不下定，明天可能就没了！"\n\n为什么这3句话有效？\n因为利用了人的3个心理：\n1. 稀缺心理\n2. 损失厌恶\n3. 从众心理\n\n想学更多成交技巧，\n评论区回复"成交"！',
          duration: '40s',
          scenes: ['成交', '逼定', '心理战']
        },
        analysis: {
          hook: '承诺"3句话" + 结果"让客户下定金"',
          trust: '心理学原理"稀缺/损失/从众" + 专业分析',
          action: '价值承诺"学更多技巧" + 行动"回复成交"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['成交', '逼定', '心理', '技巧'],
        status: 'published',
        stats: {
          leads: 412,
          views: 7890,
          copies: 312
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 7,
        title: '房源介绍：如何用30秒讲透一套房的卖点',
        category: '房源介绍',
        securityLevel: '内部',
        content: {
          script: '这套房为什么说它是"王炸"？\n\n第一，位置：\n南开区核心，距离地铁2号线500米！\n\n第二，配套：\n楼下就是重点小学，孩子上学不用过马路！\n\n第三，户型：\n南北通透，采光无敌，全天都有阳光！\n\n第四，价格：\n同小区最低，房东急售，还能谈！\n\n适合谁？\n有孩子的家庭、刚需上车、投资出租！\n\n想看房的评论区扣"看房"！',
          duration: '35s',
          scenes: ['房源介绍', '卖点提炼', '客户匹配']
        },
        analysis: {
          hook: '制造悬念"王炸" + 承诺"30秒讲透"',
          trust: '具体卖点"地铁500米""重点小学""南北通透" + 价格优势',
          action: '明确客群"有孩子/刚需/投资" + 行动"扣看房"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['房源', '介绍', '卖点', '南开区'],
        status: 'published',
        stats: {
          leads: 278,
          views: 4567,
          copies: 189
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 8,
        title: '学区分析：如何选择真正的学区房',
        category: '学区分析',
        securityLevel: '内部',
        content: {
          script: '买学区房，这3点必须搞清楚！\n\n第一，划片范围\n不是离学校近就是学区房，必须是划片范围内的！\n\n第二，落户年限\n很多学校要求落户满3年，提前了解！\n\n第三，学位占用\n如果学位被占用，买了也上不了！\n\n怎么查？\n1. 去教育局官网查划片\n2. 去学校问落户年限\n3. 去房产局查学位占用\n\n想了解具体怎么操作的，\n评论区回复"学区"！',
          duration: '50s',
          scenes: ['学区房', '选房技巧', '政策解读']
        },
        analysis: {
          hook: '制造紧迫感"必须搞清楚" + 数字"3点"',
          trust: '专业知识"划片范围""落户年限""学位占用" + 实操方法',
          action: '明确操作步骤"123" + 行动"回复学区" + 利益"发你操作指南"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['学区房', '选房', '政策', '教育'],
        status: 'published',
        stats: {
          leads: 321,
          views: 5678,
          copies: 234
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 9,
        title: '税费计算：买房到底要交哪些税',
        category: '税费计算',
        securityLevel: '公开',
        content: {
          script: '买房要交哪些税？\n\n第一，契税\n首套房90平以下1%，90平以上1.5%！\n\n第二，个税\n满五唯一免征，不满五年按差价20%！\n\n第三，增值税\n满两年免征，不满两年按5.3%！\n\n举个例子：\n200万的房子，首套房，满五唯一\n契税：200万×1%=2万\n个税：0\n增值税：0\n总共只要2万！\n\n想知道你的房子要交多少税？\n评论区回复"税费"，我发你计算器！',
          duration: '55s',
          scenes: ['税费', '计算', '买房成本']
        },
        analysis: {
          hook: '制造悬念"要交哪些税" + 具体数字',
          trust: '专业知识"契税1%""个税20%""增值税5.3%" + 实际案例',
          action: '明确计算"总共2万" + 行动"回复税费" + 利益"发计算器"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['税费', '计算', '买房', '成本'],
        status: 'published',
        stats: {
          leads: 289,
          views: 4567,
          copies: 178
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 10,
        title: '直播互动：如何让客户主动评论',
        category: '口播',
        securityLevel: '内部',
        content: {
          script: '直播间没人评论？\n试试这3个技巧！\n\n技巧一：提问式互动\n"这套房你们觉得值多少钱？评论区告诉我！"\n\n技巧二：投票式互动\n"觉得这个小区好的扣1，觉得不好的扣2！"\n\n技巧三：悬念式互动\n"下一套房子有惊喜，想知道的扣666！"\n\n为什么有效？\n因为人都喜欢表达自己的观点！\n\n想学更多互动技巧，\n评论区回复"互动"！',
          duration: '45s',
          scenes: ['直播', '互动', '评论'],
        },
        analysis: {
          hook: '痛点"没人评论" + 承诺"3个技巧"',
          trust: '具体方法"提问/投票/悬念" + 心理学原理',
          action: '价值承诺"学更多技巧" + 行动"回复互动"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['直播', '互动', '评论', '技巧'],
        status: 'published',
        stats: {
          leads: 234,
          views: 3456,
          copies: 156
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 11,
        title: '房源拍摄：如何用手机拍出专业房源视频',
        category: '探盘',
        securityLevel: '内部',
        content: {
          script: '拍房源视频，这3个技巧必须掌握！\n\n技巧一：稳定镜头\n双手持机，身体站稳，不要晃！\n\n技巧二：光线充足\n白天拍摄，拉开窗帘，自然光最好！\n\n技巧三：构图合理\n从客厅到卧室，按顺序拍摄，不要跳！\n\n拍摄顺序：\n1. 小区外观\n2. 楼道电梯\n3. 客厅\n4. 卧室\n5. 厨房\n6. 卫生间\n7. 阳台\n\n想看拍摄示范视频，\n评论区回复"拍摄"！',
          duration: '50s',
          scenes: ['拍摄', '房源', '视频', '技巧']
        },
        analysis: {
          hook: '承诺"3个技巧" + 权威"必须掌握"',
          trust: '具体方法"稳定/光线/构图" + 清晰步骤',
          action: '明确顺序"1234567" + 行动"回复拍摄" + 利益"示范视频"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['拍摄', '房源', '视频', '技巧'],
        status: 'published',
        stats: {
          leads: 267,
          views: 3789,
          copies: 189
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 12,
        title: '客户跟进：如何让客户记住你',
        category: '成交技巧',
        securityLevel: '绝密',
        content: {
          script: '客户看完房就消失？\n试试这3个跟进技巧！\n\n技巧一：价值跟进\n"这套房今天又有2个人在看，您考虑得怎么样了？"\n\n技巧二：情感跟进\n"今天降温了，您和家人注意保暖！"\n\n技巧三：专业跟进\n"今天出了个新政策，对您买房有影响，我发您看看！"\n\n为什么有效？\n因为客户需要的是关心，不是骚扰！\n\n想学更多跟进技巧，\n评论区回复"跟进"！',
          duration: '45s',
          scenes: ['跟进', '客户', '成交', '技巧']
        },
        analysis: {
          hook: '痛点"客户消失" + 承诺"3个技巧"',
          trust: '具体方法"价值/情感/专业" + 心理学原理',
          action: '价值承诺"学更多技巧" + 行动"回复跟进"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['跟进', '客户', '成交', '技巧'],
        status: 'published',
        stats: {
          leads: 356,
          views: 4567,
          copies: 234
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 13,
        title: '房源标题：如何写出高点击率的房源标题',
        category: '房源介绍',
        securityLevel: '内部',
        content: {
          script: '房源标题没人点？\n试试这3个公式！\n\n公式一：地段+价格\n"南开核心，地铁口，总价200万！"\n\n公式二：痛点+解决方案\n"孩子上学难？这套房对口重点小学！"\n\n公式三：稀缺+紧迫\n"房东急售，降价20万，仅此一套！"\n\n为什么有效？\n因为标题要抓住客户的痛点！\n\n想学更多标题技巧，\n评论区回复"标题"！',
          duration: '40s',
          scenes: ['房源', '标题', '文案', '技巧']
        },
        analysis: {
          hook: '痛点"没人点" + 承诺"3个公式"',
          trust: '具体公式"地段+价格""痛点+方案""稀缺+紧迫" + 实际案例',
          action: '价值承诺"学更多技巧" + 行动"回复标题"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['房源', '标题', '文案', '技巧'],
        status: 'published',
        stats: {
          leads: 289,
          views: 3456,
          copies: 178
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 14,
        title: '直播留人：如何让客户停留更久',
        category: '口播',
        securityLevel: '内部',
        content: {
          script: '直播间留不住人？\n试试这3个技巧！\n\n技巧一：制造悬念\n"这套房有个秘密，90%的人都不知道！"\n\n技巧二：提供价值\n"今天教你们3个选房技巧，学到就是赚到！"\n\n技巧三：互动引导\n"觉得有用的扣1，我继续讲！"\n\n为什么有效？\n因为人都有好奇心和学习欲！\n\n想学更多留人技巧，\n评论区回复"留人"！',
          duration: '45s',
          scenes: ['直播', '留人', '技巧', '互动']
        },
        analysis: {
          hook: '痛点"留不住人" + 承诺"3个技巧"',
          trust: '具体方法"悬念/价值/互动" + 心理学原理',
          action: '价值承诺"学更多技巧" + 行动"回复留人"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['直播', '留人', '技巧', '互动'],
        status: 'published',
        stats: {
          leads: 312,
          views: 3789,
          copies: 189
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 15,
        title: '房源拍摄：如何拍出有质感的房源照片',
        category: '探盘',
        securityLevel: '内部',
        content: {
          script: '拍房源照片，这3个技巧必须掌握！\n\n技巧一：光线充足\n白天拍摄，拉开窗帘，自然光最好！\n\n技巧二：角度合理\n从房间角落拍摄，显得空间大！\n\n技巧三：构图清晰\n不要拍杂物，保持画面干净！\n\n拍摄顺序：\n1. 客厅全景\n2. 卧室全景\n3. 厨房全景\n4. 卫生间全景\n5. 阳台全景\n\n想看拍摄示范，\n评论区回复"照片"！',
          duration: '45s',
          scenes: ['拍摄', '房源', '照片', '技巧']
        },
        analysis: {
          hook: '承诺"3个技巧" + 权威"必须掌握"',
          trust: '具体方法"光线/角度/构图" + 清晰步骤',
          action: '明确顺序"12345" + 行动"回复照片" + 利益"示范"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['拍摄', '房源', '照片', '技巧'],
        status: 'published',
        stats: {
          leads: 267,
          views: 3456,
          copies: 178
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 16,
        title: '客户异议：如何处理客户说"太贵了"',
        category: '成交技巧',
        securityLevel: '绝密',
        content: {
          script: '客户说"太贵了"，怎么回应？\n试试这3个技巧！\n\n技巧一：价值锚定\n"这套房比同小区便宜20万，为什么？因为房东急售！"\n\n技巧二：对比法\n"您看的那套200万，这套220万，但多20平，单价更便宜！"\n\n技巧三：拆分法\n"这套房贵10万，但您住30年，每天只要9块钱！"\n\n为什么有效？\n因为客户不是嫌贵，是觉得不值！\n\n想学更多异议处理技巧，\n评论区回复"异议"！',
          duration: '50s',
          scenes: ['异议', '成交', '技巧', '价格']
        },
        analysis: {
          hook: '痛点"太贵了" + 承诺"3个技巧"',
          trust: '具体方法"价值锚定/对比/拆分" + 实际案例',
          action: '价值承诺"学更多技巧" + 行动"回复异议"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['异议', '成交', '技巧', '价格'],
        status: 'published',
        stats: {
          leads: 389,
          views: 4567,
          copies: 256
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 17,
        title: '房源描述：如何写出吸引人的房源描述',
        category: '房源介绍',
        securityLevel: '内部',
        content: {
          script: '房源描述没人看？\n试试这3个公式！\n\n公式一：痛点+解决方案\n"孩子上学难？这套房对口重点小学，步行5分钟！"\n\n公式二：场景化描述\n"早上在阳台喝咖啡，看楼下车水马龙，生活多惬意！"\n\n公式三：数据化表达\n"这套房采光无敌，全天12小时阳光！"\n\n为什么有效？\n因为描述要让客户有画面感！\n\n想学更多描述技巧，\n评论区回复"描述"！',
          duration: '45s',
          scenes: ['房源', '描述', '文案', '技巧']
        },
        analysis: {
          hook: '痛点"没人看" + 承诺"3个公式"',
          trust: '具体公式"痛点+方案""场景化""数据化" + 实际案例',
          action: '价值承诺"学更多技巧" + 行动"回复描述"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['房源', '描述', '文案', '技巧'],
        status: 'published',
        stats: {
          leads: 278,
          views: 3456,
          copies: 189
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 18,
        title: '直播开场：如何用第一句话留住客户',
        category: '口播',
        securityLevel: '内部',
        content: {
          script: '直播第一句话，决定客户去留！\n试试这3个开场白！\n\n开场一：悬念式\n"今天这套房，我敢说全天津只有3个人敢这么讲真话！"\n\n开场二：痛点式\n"买房最怕什么？踩坑！今天我教你3个避坑技巧！"\n\n开场三：利益式\n"今天这套房，我教你怎么省20万！"\n\n为什么有效？\n因为第一句话必须抓住客户注意力！\n\n想学更多开场技巧，\n评论区回复"开场"！',
          duration: '40s',
          scenes: ['直播', '开场', '留人', '技巧']
        },
        analysis: {
          hook: '权威"决定客户去留" + 承诺"3个开场白"',
          trust: '具体方法"悬念/痛点/利益" + 实际案例',
          action: '价值承诺"学更多技巧" + 行动"回复开场"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['直播', '开场', '留人', '技巧'],
        status: 'published',
        stats: {
          leads: 345,
          views: 3789,
          copies: 234
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 19,
        title: '客户跟进：如何让客户主动找你',
        category: '成交技巧',
        securityLevel: '绝密',
        content: {
          script: '客户从不主动找你？\n试试这3个技巧！\n\n技巧一：提供价值\n"今天出了个新盘，我觉得很适合您，发您看看！"\n\n技巧二：制造稀缺\n"您看的那套房今天又有2个人在看，您考虑得怎么样了？"\n\n技巧三：情感连接\n"今天降温了，您和家人注意保暖！"\n\n为什么有效？\n因为客户需要的是价值，不是骚扰！\n\n想学更多跟进技巧，\n评论区回复"跟进"！',
          duration: '45s',
          scenes: ['跟进', '客户', '成交', '技巧']
        },
        analysis: {
          hook: '痛点"从不主动" + 承诺"3个技巧"',
          trust: '具体方法"价值/稀缺/情感" + 心理学原理',
          action: '价值承诺"学更多技巧" + 行动"回复跟进"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['跟进', '客户', '成交', '技巧'],
        status: 'published',
        stats: {
          leads: 367,
          views: 4567,
          copies: 245
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 20,
        title: '房源拍摄：如何拍出专业的房源视频',
        category: '探盘',
        securityLevel: '内部',
        content: {
          script: '拍房源视频，这5个技巧必须掌握！\n\n技巧一：稳定镜头\n双手持机，身体站稳，不要晃！\n\n技巧二：光线充足\n白天拍摄，拉开窗帘，自然光最好！\n\n技巧三：构图合理\n从房间角落拍摄，显得空间大！\n\n技巧四：顺序清晰\n从客厅到卧室，按顺序拍摄！\n\n技巧五：语速适中\n说话不要太快，让客户听得清！\n\n拍摄顺序：\n1. 小区外观\n2. 楼道电梯\n3. 客厅\n4. 卧室\n5. 厨房\n6. 卫生间\n7. 阳台\n\n想看拍摄示范，\n评论区回复"拍摄"！',
          duration: '55s',
          scenes: ['拍摄', '房源', '视频', '技巧']
        },
        analysis: {
          hook: '承诺"5个技巧" + 权威"必须掌握"',
          trust: '具体方法"稳定/光线/构图/顺序/语速" + 清晰步骤',
          action: '明确顺序"1234567" + 行动"回复拍摄" + 利益"示范"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['拍摄', '房源', '视频', '技巧'],
        status: 'published',
        stats: {
          leads: 289,
          views: 3789,
          copies: 189
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 21,
        title: '直播带货：如何在直播间卖房',
        category: '口播',
        securityLevel: '内部',
        content: {
          script: '直播间卖房，这3个技巧必须掌握！\n\n技巧一：制造稀缺\n"这套房今天刚挂牌，已经有3个人在谈了！"\n\n技巧二：提供价值\n"今天教你们3个选房技巧，学到就是赚到！"\n\n技巧三：互动引导\n"觉得这套房好的扣1，我发你详细资料！"\n\n为什么有效？\n因为直播卖房要抓住客户的痛点！\n\n想学更多卖房技巧，\n评论区回复"卖房"！',
          duration: '50s',
          scenes: ['直播', '卖房', '技巧', '成交']
        },
        analysis: {
          hook: '承诺"3个技巧" + 权威"必须掌握"',
          trust: '具体方法"稀缺/价值/互动" + 心理学原理',
          action: '价值承诺"学更多技巧" + 行动"回复卖房"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['直播', '卖房', '技巧', '成交'],
        status: 'published',
        stats: {
          leads: 356,
          views: 4567,
          copies: 234
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      },
      {
        id: 22,
        title: '房源标题：如何写出高点击率的标题',
        category: '房源介绍',
        securityLevel: '内部',
        content: {
          script: '房源标题没人点？\n试试这3个公式！\n\n公式一：地段+价格\n"南开核心，地铁口，总价200万！"\n\n公式二：痛点+解决方案\n"孩子上学难？这套房对口重点小学！"\n\n公式三：稀缺+紧迫\n"房东急售，降价20万，仅此一套！"\n\n为什么有效？\n因为标题要抓住客户的痛点！\n\n想学更多标题技巧，\n评论区回复"标题"！',
          duration: '40s',
          scenes: ['房源', '标题', '文案', '技巧']
        },
        analysis: {
          hook: '痛点"没人点" + 承诺"3个公式"',
          trust: '具体公式"地段+价格""痛点+方案""稀缺+紧迫" + 实际案例',
          action: '价值承诺"学更多技巧" + 行动"回复标题"'
        },
        media: {
          cover: '',
          video: ''
        },
        tags: ['房源', '标题', '文案', '技巧'],
        status: 'published',
        stats: {
          leads: 289,
          views: 3456,
          copies: 178
        },
        author: {
          _openid: 'admin',
          nickname: '星火计划'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    ];

    for (const article of articles) {
      await db.collection('articles').add({
        data: article
      });
    }

    return {
      code: 0,
      message: '初始化成功',
      data: {
        count: articles.length
      }
    };

  } catch (err) {
    console.error('初始化文案数据失败:', err);
    return {
      code: 5000,
      message: '初始化失败',
      error: err.message
    };
  }
};
