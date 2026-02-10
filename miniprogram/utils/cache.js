/**
 * 统一缓存管理工具
 * 提供高效的缓存机制，支持TTL设置、缓存失效机制、缓存键设计和存储方案
 */

// 缓存配置
const CACHE_CONFIG = {
  // 默认TTL（毫秒）
  DEFAULT_TTL: 3600000, // 1小时
  // 缓存键前缀
  KEY_PREFIX: 'spark_cache_',
  // 最大缓存大小（条目数）
  MAX_CACHE_SIZE: 100,
  // 缓存清理阈值（达到此比例时触发清理）
  CLEANUP_THRESHOLD: 0.8
};

// 缓存统计
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  errors: 0
};

/**
 * 生成缓存键
 * @param {string} key 原始键
 * @param {Object} params 参数对象（可选）
 * @returns {string} 生成的缓存键
 */
export function generateCacheKey(key, params = {}) {
  try {
    const paramsStr = Object.keys(params).length > 0 
      ? '_' + Object.entries(params)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${v}`)
          .join('_')
      : '';
    return `${CACHE_CONFIG.KEY_PREFIX}${key}${paramsStr}`;
  } catch (error) {
    console.error('生成缓存键失败:', error);
    return `${CACHE_CONFIG.KEY_PREFIX}${key}`;
  }
}

/**
 * 设置缓存
 * @param {string} key 缓存键
 * @param {any} value 缓存值
 * @param {number} ttl 过期时间（毫秒，可选）
 * @param {Object} params 参数对象（可选）
 * @returns {boolean} 是否设置成功
 */
export function setCache(key, value, ttl = CACHE_CONFIG.DEFAULT_TTL, params = {}) {
  try {
    const cacheKey = generateCacheKey(key, params);
    const cacheData = {
      value,
      expireTime: Date.now() + ttl,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };

    wx.setStorageSync(cacheKey, cacheData);
    cacheStats.sets++;
    
    // 检查缓存大小，触发清理
    checkAndCleanupCache();
    
    return true;
  } catch (error) {
    console.error('设置缓存失败:', error);
    cacheStats.errors++;
    return false;
  }
}

/**
 * 获取缓存
 * @param {string} key 缓存键
 * @param {Object} params 参数对象（可选）
 * @returns {any|null} 缓存值或null
 */
export function getCache(key, params = {}) {
  try {
    const cacheKey = generateCacheKey(key, params);
    const cacheData = wx.getStorageSync(cacheKey);

    if (!cacheData) {
      cacheStats.misses++;
      return null;
    }

    // 检查是否过期
    if (cacheData.expireTime <= Date.now()) {
      // 过期，删除缓存
      wx.removeStorageSync(cacheKey);
      cacheStats.misses++;
      return null;
    }

    // 更新最后访问时间
    cacheData.lastAccessed = Date.now();
    wx.setStorageSync(cacheKey, cacheData);
    
    cacheStats.hits++;
    return cacheData.value;
  } catch (error) {
    console.error('获取缓存失败:', error);
    cacheStats.errors++;
    return null;
  }
}

/**
 * 删除缓存
 * @param {string} key 缓存键
 * @param {Object} params 参数对象（可选）
 * @returns {boolean} 是否删除成功
 */
export function deleteCache(key, params = {}) {
  try {
    const cacheKey = generateCacheKey(key, params);
    wx.removeStorageSync(cacheKey);
    cacheStats.deletes++;
    return true;
  } catch (error) {
    console.error('删除缓存失败:', error);
    cacheStats.errors++;
    return false;
  }
}

/**
 * 清空所有缓存
 * @returns {boolean} 是否清空成功
 */
export function clearAllCache() {
  try {
    const keys = wx.getStorageInfoSync().keys;
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_CONFIG.KEY_PREFIX));
    
    cacheKeys.forEach(key => {
      try {
        wx.removeStorageSync(key);
      } catch (e) {
        console.error(`删除缓存键 ${key} 失败:`, e);
      }
    });
    
    // 重置统计
    Object.keys(cacheStats).forEach(key => {
      cacheStats[key] = 0;
    });
    
    return true;
  } catch (error) {
    console.error('清空缓存失败:', error);
    return false;
  }
}

/**
 * 检查缓存是否存在
 * @param {string} key 缓存键
 * @param {Object} params 参数对象（可选）
 * @returns {boolean} 是否存在
 */
export function hasCache(key, params = {}) {
  try {
    const cacheKey = generateCacheKey(key, params);
    const cacheData = wx.getStorageSync(cacheKey);
    
    if (!cacheData) {
      return false;
    }
    
    // 检查是否过期
    return cacheData.expireTime > Date.now();
  } catch (error) {
    console.error('检查缓存失败:', error);
    return false;
  }
}

/**
 * 获取缓存状态
 * @param {string} key 缓存键（可选）
 * @param {Object} params 参数对象（可选）
 * @returns {Object} 缓存状态信息
 */
export function getCacheStatus(key = null, params = {}) {
  try {
    if (key) {
      // 获取单个缓存状态
      const cacheKey = generateCacheKey(key, params);
      const cacheData = wx.getStorageSync(cacheKey);
      
      if (!cacheData) {
        return {
          exists: false,
          expired: true,
          value: null,
          expireTime: null,
          createdAt: null,
          lastAccessed: null
        };
      }
      
      return {
        exists: true,
        expired: cacheData.expireTime <= Date.now(),
        value: cacheData.value,
        expireTime: cacheData.expireTime,
        createdAt: cacheData.createdAt,
        lastAccessed: cacheData.lastAccessed
      };
    } else {
      // 获取整体缓存状态
      const keys = wx.getStorageInfoSync().keys;
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_CONFIG.KEY_PREFIX));
      const cacheItems = [];
      
      cacheKeys.forEach(key => {
        try {
          const cacheData = wx.getStorageSync(key);
          cacheItems.push({
            key: key.replace(CACHE_CONFIG.KEY_PREFIX, ''),
            expired: cacheData.expireTime <= Date.now(),
            size: JSON.stringify(cacheData).length,
            createdAt: cacheData.createdAt,
            lastAccessed: cacheData.lastAccessed
          });
        } catch (e) {
          console.error(`获取缓存键 ${key} 状态失败:`, e);
        }
      });
      
      return {
        totalItems: cacheItems.length,
        expiredItems: cacheItems.filter(item => item.expired).length,
        items: cacheItems,
        stats: { ...cacheStats }
      };
    }
  } catch (error) {
    console.error('获取缓存状态失败:', error);
    return {
      error: error.message
    };
  }
}

/**
 * 检查并清理缓存
 * 当缓存达到阈值时，删除最旧的缓存项
 */
function checkAndCleanupCache() {
  try {
    const keys = wx.getStorageInfoSync().keys;
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_CONFIG.KEY_PREFIX));
    
    if (cacheKeys.length >= CACHE_CONFIG.MAX_CACHE_SIZE * CACHE_CONFIG.CLEANUP_THRESHOLD) {
      // 获取所有缓存项及其最后访问时间
      const cacheItems = [];
      
      cacheKeys.forEach(key => {
        try {
          const cacheData = wx.getStorageSync(key);
          if (cacheData) {
            cacheItems.push({
              key,
              lastAccessed: cacheData.lastAccessed || cacheData.createdAt || Date.now()
            });
          }
        } catch (e) {
          console.error(`获取缓存项 ${key} 失败:`, e);
        }
      });
      
      // 按最后访问时间排序，删除最旧的项
      cacheItems.sort((a, b) => a.lastAccessed - b.lastAccessed);
      const itemsToDelete = cacheItems.slice(0, Math.floor(cacheItems.length * 0.3));
      
      itemsToDelete.forEach(item => {
        try {
          wx.removeStorageSync(item.key);
          cacheStats.deletes++;
        } catch (e) {
          console.error(`删除缓存项 ${item.key} 失败:`, e);
        }
      });
      
      console.log(`缓存清理完成，删除了 ${itemsToDelete.length} 个旧缓存项`);
    }
  } catch (error) {
    console.error('缓存清理失败:', error);
  }
}

/**
 * 缓存装饰器 - 用于装饰函数，自动缓存其返回值
 * @param {Object} options 配置选项
 * @param {string} options.key 缓存键
 * @param {number} options.ttl 过期时间（毫秒）
 * @param {Function} options.getKey 自定义键生成函数（可选）
 * @returns {Function} 装饰后的函数
 */
export function cacheDecorator(options) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      try {
        // 生成缓存键
        const cacheKey = options.getKey 
          ? options.getKey(args, this)
          : generateCacheKey(options.key, { args: JSON.stringify(args) });
        
        // 尝试从缓存获取
        const cachedValue = getCache(cacheKey);
        if (cachedValue !== null) {
          return cachedValue;
        }
        
        // 调用原始方法
        const result = await originalMethod.apply(this, args);
        
        // 缓存结果
        setCache(cacheKey, result, options.ttl);
        
        return result;
      } catch (error) {
        console.error('缓存装饰器错误:', error);
        // 出错时调用原始方法
        return originalMethod.apply(this, args);
      }
    };
    
    return descriptor;
  };
}

/**
 * 批量设置缓存
 * @param {Array} items 缓存项数组，每项包含key、value、ttl、params
 * @returns {Object} 批量操作结果
 */
export function batchSetCache(items) {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  items.forEach(item => {
    try {
      const success = setCache(item.key, item.value, item.ttl, item.params);
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
      results.errors.push(error.message);
    }
  });
  
  return results;
}

/**
 * 批量获取缓存
 * @param {Array} items 缓存项数组，每项包含key、params
 * @returns {Object} 批量操作结果
 */
export function batchGetCache(items) {
  const results = {};
  
  items.forEach(item => {
    try {
      const value = getCache(item.key, item.params);
      results[item.key] = value;
    } catch (error) {
      console.error(`获取缓存项 ${item.key} 失败:`, error);
      results[item.key] = null;
    }
  });
  
  return results;
}

/**
 * 导出缓存统计
 * @returns {Object} 缓存统计信息
 */
export function getCacheStats() {
  return { ...cacheStats };
}

/**
 * 重置缓存统计
 */
export function resetCacheStats() {
  Object.keys(cacheStats).forEach(key => {
    cacheStats[key] = 0;
  });
}

/**
 * 缓存管理器类
 * 提供面向对象的缓存管理接口
 */
export class CacheManager {
  constructor(namespace = 'default') {
    this.namespace = namespace;
  }
  
  /**
   * 设置缓存
   * @param {string} key 缓存键
   * @param {any} value 缓存值
   * @param {number} ttl 过期时间（毫秒）
   * @param {Object} params 参数对象
   * @returns {boolean} 是否设置成功
   */
  set(key, value, ttl = CACHE_CONFIG.DEFAULT_TTL, params = {}) {
    return setCache(`${this.namespace}_${key}`, value, ttl, params);
  }
  
  /**
   * 获取缓存
   * @param {string} key 缓存键
   * @param {Object} params 参数对象
   * @returns {any|null} 缓存值或null
   */
  get(key, params = {}) {
    return getCache(`${this.namespace}_${key}`, params);
  }
  
  /**
   * 删除缓存
   * @param {string} key 缓存键
   * @param {Object} params 参数对象
   * @returns {boolean} 是否删除成功
   */
  delete(key, params = {}) {
    return deleteCache(`${this.namespace}_${key}`, params);
  }
  
  /**
   * 检查缓存是否存在
   * @param {string} key 缓存键
   * @param {Object} params 参数对象
   * @returns {boolean} 是否存在
   */
  has(key, params = {}) {
    return hasCache(`${this.namespace}_${key}`, params);
  }
  
  /**
   * 获取缓存状态
   * @param {string} key 缓存键（可选）
   * @param {Object} params 参数对象（可选）
   * @returns {Object} 缓存状态信息
   */
  getStatus(key = null, params = {}) {
    return getCacheStatus(key ? `${this.namespace}_${key}` : null, params);
  }
}

// 导出默认实例
const defaultCache = new CacheManager();
export default defaultCache;