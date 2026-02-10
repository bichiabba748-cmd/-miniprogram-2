const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 缓存配置
const CACHE_CONFIG = {
  ttl: 3600, // 1小时缓存
  prefix: 'articles_'
};

exports.main = async (event, context) => {
  try {
    const { category, securityLevel, page = 1, pageSize = 20, useCache = true } = event;
    const openid = cloud.getWXContext().OPENID;
    
    // 生成缓存键
    const cacheKey = `${CACHE_CONFIG.prefix}${category || 'all'}_${securityLevel || 'all'}_${page}_${pageSize}`;
    
    // 尝试从缓存获取
    if (useCache) {
      try {
        const cached = await cloud.database().collection('cache').where({ key: cacheKey }).get();
        if (cached.data && cached.data.length > 0) {
          const cacheItem = cached.data[0];
          const now = Date.now();
          if (now - new Date(cacheItem.createdAt).getTime() < CACHE_CONFIG.ttl * 1000) {
            console.log('从缓存获取文章数据');
            return {
              code: 0,
              data: cacheItem.value
            };
          }
        }
      } catch (cacheErr) {
        console.warn('缓存读取失败:', cacheErr);
      }
    }
    
    // 构建查询
    let query = db.collection('articles');
    
    // 应用过滤条件
    const filters = {};
    if (category && category !== 'all') {
      filters.category = category;
    }
    if (securityLevel && securityLevel !== 'all') {
      filters.securityLevel = securityLevel;
    }
    
    if (Object.keys(filters).length > 0) {
      query = query.where(filters);
    }
    
    // 并行执行计数和查询
    const [countResult, articlesResult] = await Promise.all([
      query.count(),
      query
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .orderBy('createdAt', 'desc')
        .get()
    ]);
    
    const total = countResult.total;
    const data = {
      list: articlesResult.data,
      total: total,
      hasMore: (page - 1) * pageSize + pageSize < total
    };
    
    // 缓存结果
    if (useCache) {
      try {
        await cloud.database().collection('cache').where({ key: cacheKey }).remove();
        await cloud.database().collection('cache').add({
          data: {
            key: cacheKey,
            value: data,
            createdAt: db.serverDate()
          }
        });
      } catch (cacheErr) {
        console.warn('缓存写入失败:', cacheErr);
      }
    }
    
    return {
      code: 0,
      data: data
    };
    
  } catch (err) {
    console.error('获取文案失败:', err);
    return {
      code: 5000,
      message: '服务器内部错误'
    };
  }
};
