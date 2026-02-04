const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    // 确保集合存在
    try {
      await db.createCollection('courses');
    } catch (err) {
      if (err.errCode !== -1 && err.errCode !== -501001) {
        throw err;
      }
    }
    
    // 清空集合 - 使用limit方式删除
    try {
      const allData = await db.collection('courses').limit(1000).get();
      if (allData.data.length > 0) {
        const deletePromises = allData.data.map(item => {
          return db.collection('courses').doc(item._id).remove();
        });
        await Promise.all(deletePromises);
      }
    } catch (delError) {
      // 如果清空失败，继续执行
    }
    
    // 课程数据（从course.js中提取）
    const courses = [
      {
        id: 101,
        title: '天津二手房：如何通过"学区"痛点变现？',
        category: '文案创作',
        author: '王金牌',
        view: 12000,
        badge: '战区免费',
        duration: '12:30',
        coverUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example1',
        description: '深入分析天津学区房市场，掌握学区痛点变现的核心策略',
        status: 'published'
      },
      {
        id: 102,
        title: '剪映实操：房产号这3个特效千万别乱用！',
        category: '视频剪辑',
        author: '视觉中心',
        view: 8560,
        badge: '必修',
        duration: '08:45',
        coverUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example2',
        description: '详解房产视频剪辑中常见的3个错误特效，避免踩坑',
        status: 'published'
      },
      {
        id: 103,
        title: '直播复盘：昨天那场百人在线是怎么做到的？',
        category: '直播运营',
        author: '陈店长',
        view: 21000,
        badge: '高阶',
        duration: '45:00',
        coverUrl: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example3',
        description: '深度复盘百人在线直播案例，拆解成功要素',
        status: 'published'
      },
      {
        id: 104,
        title: 'ChatGPT助力房产文案：3秒生成高质量标题',
        category: 'AI应用',
        author: 'AI实验室',
        view: 35000,
        badge: '热门',
        duration: '15:20',
        coverUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example4',
        description: '利用ChatGPT快速生成房产文案标题，提升创作效率',
        status: 'published'
      },
      {
        id: 105,
        title: '从0到1：房产账号起号全攻略',
        category: '账号起号',
        author: '运营中心',
        view: 28000,
        badge: '必修',
        duration: '30:15',
        coverUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example5',
        description: '完整的房产账号起号流程，从0到1的实战指南',
        status: 'published'
      },
      {
        id: 106,
        title: '个人IP打造：如何建立房产领域专业形象',
        category: 'IP打造',
        author: '品牌中心',
        view: 19000,
        badge: '高阶',
        duration: '25:40',
        coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example6',
        description: '打造房产领域专业IP，建立个人品牌影响力',
        status: 'published'
      },
      {
        id: 107,
        title: '社区型账号运营：如何构建高转化业主群',
        category: '社区型账号打造',
        author: '社群运营',
        view: 13000,
        badge: '实战',
        duration: '20:30',
        coverUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example7',
        description: '构建高转化业主群的运营策略与实操方法',
        status: 'published'
      },
      {
        id: 108,
        title: '文案改写技巧：如何让旧文案焕发新生机',
        category: '文案改写',
        author: '内容中心',
        view: 9860,
        badge: '实用',
        duration: '10:15',
        coverUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example8',
        description: '文案改写实战技巧，让旧文案焕发新生',
        status: 'published'
      },
      {
        id: 109,
        title: 'AI视频生成：如何用AI快速制作房产宣传短片',
        category: 'AI应用',
        author: 'AI实验室',
        view: 27000,
        badge: '创新',
        duration: '18:45',
        coverUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example9',
        description: '使用AI工具快速生成房产宣传视频，提升制作效率',
        status: 'published'
      },
      {
        id: 110,
        title: 'AI数据分析：如何利用AI优化房产获客策略',
        category: 'AI应用',
        author: '数据中心',
        view: 18000,
        badge: '进阶',
        duration: '22:10',
        coverUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example10',
        description: '利用AI数据分析优化房产获客策略，提升转化率',
        status: 'published'
      },
      {
        id: 111,
        title: '从竞品文案到原创：房产文案改写实战',
        category: '文案改写',
        author: '内容中心',
        view: 11000,
        badge: '实战',
        duration: '14:30',
        coverUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example11',
        description: '从竞品文案到原创的改写实战方法与技巧',
        status: 'published'
      },
      {
        id: 112,
        title: '季节性文案改写：如何快速调整房产文案适应不同季节',
        category: '文案改写',
        author: '内容中心',
        view: 8760,
        badge: '实用',
        duration: '09:45',
        coverUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example12',
        description: '季节性房产文案改写技巧，适应不同季节需求',
        status: 'published'
      },
      {
        id: 113,
        title: '房产文案黄金结构：3步写出高转化文案',
        category: '文案创作',
        author: '王金牌',
        view: 15000,
        badge: '必修',
        duration: '16:20',
        coverUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example13',
        description: '房产文案黄金结构，3步写出高转化文案',
        status: 'published'
      },
      {
        id: 114,
        title: '情感共鸣：如何在房产文案中打动目标客户',
        category: '文案创作',
        author: '王金牌',
        view: 13000,
        badge: '进阶',
        duration: '13:45',
        coverUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example14',
        description: '在房产文案中建立情感共鸣，打动目标客户',
        status: 'published'
      },
      {
        id: 115,
        title: '房产视频转场技巧：让你的视频更专业',
        category: '视频剪辑',
        author: '视觉中心',
        view: 12000,
        badge: '进阶',
        duration: '11:30',
        coverUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example15',
        description: '房产视频转场技巧，提升视频专业度',
        status: 'published'
      },
      {
        id: 116,
        title: '手机拍摄房产：如何用手机拍出专业级房产视频',
        category: '视频剪辑',
        author: '视觉中心',
        view: 19000,
        badge: '热门',
        duration: '15:40',
        coverUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example16',
        description: '手机拍摄房产视频的技巧与方法',
        status: 'published'
      },
      {
        id: 117,
        title: '直播脚本设计：房产直播30分钟黄金流程',
        category: '直播运营',
        author: '陈店长',
        view: 18000,
        badge: '必修',
        duration: '28:15',
        coverUrl: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example17',
        description: '房产直播30分钟黄金流程设计',
        status: 'published'
      },
      {
        id: 118,
        title: '直播互动技巧：如何提高房产直播的参与度',
        category: '直播运营',
        author: '陈店长',
        view: 15000,
        badge: '进阶',
        duration: '20:30',
        coverUrl: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example18',
        description: '提高房产直播参与度的互动技巧',
        status: 'published'
      },
      {
        id: 119,
        title: '房产账号定位：如何找到适合你的垂直领域',
        category: '账号起号',
        author: '运营中心',
        view: 22000,
        badge: '基础',
        duration: '18:45',
        coverUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example19',
        description: '房产账号定位方法，找到适合的垂直领域',
        status: 'published'
      },
      {
        id: 120,
        title: '账号冷启动：如何在7天内让房产账号获得初始流量',
        category: '账号起号',
        author: '运营中心',
        view: 25000,
        badge: '热门',
        duration: '24:20',
        coverUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example20',
        description: '房产账号冷启动策略，7天内获得初始流量',
        status: 'published'
      },
      {
        id: 121,
        title: '房产专家IP：如何塑造权威专业的个人形象',
        category: 'IP打造',
        author: '品牌中心',
        view: 16000,
        badge: '进阶',
        duration: '22:15',
        coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example21',
        description: '塑造权威专业的房产专家IP形象',
        status: 'published'
      },
      {
        id: 122,
        title: 'IP内容规划：房产领域个人IP的内容矩阵搭建',
        category: 'IP打造',
        author: '品牌中心',
        view: 14000,
        badge: '实战',
        duration: '20:30',
        coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example22',
        description: '房产领域个人IP内容矩阵搭建方法',
        status: 'published'
      },
      {
        id: 123,
        title: '社区内容运营：如何制作业主感兴趣的社区内容',
        category: '社区型账号打造',
        author: '社群运营',
        view: 11000,
        badge: '实用',
        duration: '16:45',
        coverUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example23',
        description: '制作业主感兴趣的社区内容的方法',
        status: 'published'
      },
      {
        id: 124,
        title: '社区活动策划：如何通过线上活动提升社区账号活跃度',
        category: '社区型账号打造',
        author: '社群运营',
        view: 9860,
        badge: '创新',
        duration: '18:20',
        coverUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop',
        mediaType: 'link',
        mediaUrl: 'https://mp.weixin.qq.com/s/example24',
        description: '通过线上活动提升社区账号活跃度的策划方法',
        status: 'published'
      }
    ];
    
    // 批量写入
    let successCount = 0;
    let failCount = 0;
    const batchSize = 10;
    
    for (let i = 0; i < courses.length; i += batchSize) {
      const batch = courses.slice(i, i + batchSize);
      
      const tasks = batch.map(course => {
        return db.collection('courses').add({
          data: {
            ...course,
            createdAt: db.serverDate(),
            updatedAt: db.serverDate()
          }
        }).then(() => true).catch(() => false);
      });
      
      try {
        const results = await Promise.all(tasks);
        const batchSuccess = results.filter(r => r).length;
        successCount += batchSuccess;
        failCount += results.filter(r => !r).length;
      } catch (batchError) {
        failCount += batch.length;
      }
    }
    
    return {
      code: 0,
      message: '课程初始化成功',
      data: {
        count: courses.length,
        success: successCount,
        failed: failCount,
        successRate: ((successCount / courses.length) * 100).toFixed(2) + '%'
      }
    };
    
  } catch (err) {
    return {
      code: 500,
      message: '服务器错误: ' + err.message
    };
  }
};
