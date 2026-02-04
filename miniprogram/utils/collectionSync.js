/**
 * 收藏数据同步工具
 * 提供收藏数据的缓存管理和服务器同步功能
 */

// 缓存键
const COLLECTION_CACHE_KEY = 'user_collections_cache';

/**
 * 获取缓存的收藏数据
 * @returns {Array|null} 收藏数据数组或null
 */
export function getCachedCollections() {
  try {
    const cached = wx.getStorageSync(COLLECTION_CACHE_KEY);
    if (cached && cached.expireTime > Date.now()) {
      return cached.data;
    }
    return null;
  } catch (error) {
    console.error('获取缓存失败:', error);
    return null;
  }
}

/**
 * 更新缓存的收藏数据
 * @param {Array} collections 收藏数据
 * @returns {boolean} 是否更新成功
 */
export function updateCachedCollections(collections) {
  try {
    wx.setStorageSync(COLLECTION_CACHE_KEY, {
      data: collections,
      expireTime: Date.now() + 3600000 // 1小时过期
    });
    return true;
  } catch (error) {
    console.error('更新缓存失败:', error);
    return false;
  }
}

/**
 * 清除缓存的收藏数据
 * @returns {boolean} 是否清除成功
 */
export function clearCachedCollections() {
  try {
    wx.removeStorageSync(COLLECTION_CACHE_KEY);
    return true;
  } catch (error) {
    console.error('清除缓存失败:', error);
    return false;
  }
}

/**
 * 同步收藏数据到服务器
 * @param {string} articleId 文章ID
 * @param {boolean} collect 是否收藏
 * @returns {Promise} 返回同步结果
 */
export function syncCollectionToServer(articleId, collect) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'toggleCollection',
      data: {
        articleId: articleId,
        collect: collect
      }
    })
    .then(res => {
      if (res.result.code === 2000) {
        // 同步成功后更新缓存
        wx.cloud.callFunction({
          name: 'getUserCollections',
          data: {
            status: 'collected'
          }
        })
        .then(res => {
          if (res.result.code === 2000 && res.result.data.collections) {
            updateCachedCollections(res.result.data.collections);
          }
        })
        .catch(err => {
          console.error('更新缓存失败:', err);
        });
        resolve(res.result);
      } else {
        reject(res.result);
      }
    })
    .catch(err => {
      console.error('同步到服务器失败:', err);
      reject(err);
    });
  });
}

/**
 * 从服务器获取最新收藏数据
 * @param {string} status 收藏状态
 * @returns {Promise} 返回服务器数据
 */
export function fetchCollectionsFromServer(status) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getUserCollections',
      data: {
        status: status
      }
    })
    .then(res => {
      if (res.result.code === 2000) {
        // 更新缓存
        updateCachedCollections(res.result.data.collections);
        resolve(res.result.data.collections);
      } else {
        reject(res.result);
      }
    })
    .catch(err => {
      console.error('从服务器获取收藏数据失败:', err);
      reject(err);
    });
  });
}

/**
 * 批量同步收藏数据
 * @param {Array} collectionChanges 收藏变更数组
 * @returns {Promise} 返回同步结果
 */
export function batchSyncCollections(collectionChanges) {
  return new Promise(async (resolve, reject) => {
    try {
      const results = [];
      
      for (const change of collectionChanges) {
        try {
          const result = await syncCollectionToServer(change.articleId, change.collect);
          results.push({ articleId: change.articleId, success: true, result });
        } catch (error) {
          results.push({ articleId: change.articleId, success: false, error });
        }
      }
      
      resolve(results);
    } catch (error) {
      console.error('批量同步失败:', error);
      reject(error);
    }
  });
}

/**
 * 检查缓存是否过期
 * @returns {boolean} 是否过期
 */
export function isCacheExpired() {
  try {
    const cached = wx.getStorageSync(COLLECTION_CACHE_KEY);
    return !cached || cached.expireTime <= Date.now();
  } catch (error) {
    console.error('检查缓存过期失败:', error);
    return true;
  }
}

/**
 * 获取缓存状态
 * @returns {Object} 缓存状态信息
 */
export function getCacheStatus() {
  try {
    const cached = wx.getStorageSync(COLLECTION_CACHE_KEY);
    if (cached) {
      return {
        exists: true,
        expired: cached.expireTime <= Date.now(),
        count: cached.data ? cached.data.length : 0,
        expireTime: cached.expireTime
      };
    }
    return {
      exists: false,
      expired: true,
      count: 0,
      expireTime: null
    };
  } catch (error) {
    console.error('获取缓存状态失败:', error);
    return {
      exists: false,
      expired: true,
      count: 0,
      expireTime: null
    };
  }
}
