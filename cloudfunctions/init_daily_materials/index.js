const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    // 确保集合存在
    try {
      await db.createCollection('daily_materials');
    } catch (err) {
      if (err.errCode !== -1 && err.errCode !== -501001) {
        throw err;
      }
    }
    
    // 检查是否已有数据
    const existing = await db.collection('daily_materials').count();
    if (existing.total > 0) {
      // 清空集合 - 使用limit方式删除
      try {
        const allData = await db.collection('daily_materials').limit(1000).get();
        if (allData.data.length > 0) {
          const deletePromises = allData.data.map(item => {
            return db.collection('daily_materials').doc(item._id).remove();
          });
          await Promise.all(deletePromises);
        }
      } catch (delError) {
        // 如果清空失败，继续执行
      }
    }
    
    // 文案模板
    const textTemplates = {
      morning: [
        '早安。真正的安全感，来自对生活的掌控。每一个为梦想奋斗的清晨，都是对自己最好的投资。',
        '城市醒来的样子，就是你奋斗的模样。早安，为理想中的家努力的你。',
        '有人等日出，有人等房本。但所有的等待，都值得一个笃定的早安。',
        '房子是租来的，但生活不是。早安，今天也要为属于自己的空间努力。',
        '每一次看房，都是在寻找未来生活的答案。早安，愿你今天离理想的家更近一步。',
        '晨光映照的不只是城市，还有你对美好生活的向往。早安，奋斗者。',
        '每个清晨都是新的开始，每套房子都是新的可能。早安，追梦人。',
        '从租客到业主，这条路很长，但每一天都在靠近。早安。',
        '早晨的第一缕光，照亮的是回家的路。为了那个家，继续加油。',
        '好的人生，从选对房子开始。早安，愿你找到心之所向。'
      ],
      noon: [
        '午间小憩，是为了下午更好地出发。就像选房，停下来思考，是为了遇见更对的那一套。',
        '正午的阳光，会告诉你房子的采光有多重要。好房配好光，生活才敞亮。',
        '午后时光，适合想象：如果在自己的家里，此刻会做些什么？',
        '中午好。每一次带看，都是在为客户描绘未来生活的画面。',
        '午间是思考的时刻。好房子，是生活品质的底层逻辑。',
        '停下来休息，不是浪费时间，而是为了走得更远。就像买房，不急于一时。',
        '午后的宁静，像极了理想居所带来的安心感。',
        '中午好。房子不只是钢筋水泥，更是情绪价值的容器。',
        '午间片刻，想想你理想中的家是什么样子。',
        '午后阳光正好，就像找到心仪房子时的心情。'
      ],
      night: [
        '晚安。家的意义，是无论走多远，都有灯为你亮着。',
        '夜深了，有人在为明天的看房做准备，有人在规划人生的下一步。晚安，奋斗者。',
        '每一盏窗前的灯，都是一个家的故事。晚安，愿你早日拥有属于自己的那盏灯。',
        '晚安。好的房子，让你在城市找到归属感。',
        '夜幕降临，有房的人在回家，没房的人在找家。晚安，追光者。',
        '晚安。每一次熄灯前的规划，都是对未来的投资。',
        '深夜的城市，每扇亮着灯的窗都是温暖的证明。晚安。',
        '晚安。房子是物理空间，家是情感归宿。',
        '夜色中的万家灯火，总有一盏属于你。晚安。',
        '晚安。明天又是全新的一天，继续为梦想中的家努力。'
      ]
    };
    
    // 真实网络图片URL（Unsplash高清免费图）
    const imageTemplates = {
      morning: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&h=800&fit=crop'
      ],
      noon: [
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=800&fit=crop'
      ],
      night: [
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop'
      ]
    };
    
    const materials = [];
    
    // 生成文案
    for (const category in textTemplates) {
      textTemplates[category].forEach(content => {
        materials.push({
          type: 'text',
          category: category,
          content: content,
          active: true
        });
      });
    }
    
    // 生成图片记录
    for (const category in imageTemplates) {
      imageTemplates[category].forEach(url => {
        materials.push({
          type: 'image',
          category: category,
          content: url,
          active: true
        });
      });
    }
    
    // 批量写入 - 优化版本
    let successCount = 0;
    let failCount = 0;
    const batchSize = 10; // 增大批量大小，减少循环次数
    
    for (let i = 0; i < materials.length; i += batchSize) {
      const batch = materials.slice(i, i + batchSize);
      
      const tasks = batch.map(material => {
        return db.collection('daily_materials').add({
          data: material
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
      message: '初始化成功',
      data: { 
        count: materials.length,
        success: successCount,
        failed: failCount,
        successRate: ((successCount / materials.length) * 100).toFixed(2) + '%'
      }
    };
    
  } catch (err) {
    return { 
      code: 500, 
      message: '服务器错误: ' + err.message
    };
  }
};