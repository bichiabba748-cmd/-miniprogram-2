/**
 * 缓存模块单元测试
 * 测试缓存管理工具的核心功能
 */

const { 
  generateCacheKey, 
  setCache, 
  getCache, 
  deleteCache, 
  clearAllCache, 
  hasCache, 
  getCacheStatus,
  batchSetCache,
  batchGetCache,
  getCacheStats,
  resetCacheStats,
  CacheManager
} = require('../../miniprogram/utils/cache');

// 模拟wx对象
const mockWx = {
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  getStorageInfoSync: jest.fn()
};

global.wx = mockWx;

// 测试数据
const testData = {
  key: 'test_key',
  value: 'test_value',
  params: { userId: '123', page: 1 }
};

// 测试缓存键生成
describe('Cache Key Generation', () => {
  test('should generate cache key without params', () => {
    const key = generateCacheKey('test_key');
    expect(key).toBe('spark_cache_test_key');
  });

  test('should generate cache key with params', () => {
    const key = generateCacheKey('test_key', { userId: '123', page: 1 });
    expect(key).toContain('spark_cache_test_key');
    expect(key).toContain('userId:123');
    expect(key).toContain('page:1');
  });

  test('should handle empty params', () => {
    const key = generateCacheKey('test_key', {});
    expect(key).toBe('spark_cache_test_key');
  });
});

// 测试缓存设置和获取
describe('Cache Operations', () => {
  beforeEach(() => {
    // 重置mock
    mockWx.getStorageSync.mockClear();
    mockWx.setStorageSync.mockClear();
    mockWx.removeStorageSync.mockClear();
    mockWx.getStorageInfoSync.mockClear();
  });

  test('should set and get cache successfully', () => {
    // 模拟获取缓存返回null
    mockWx.getStorageSync.mockReturnValue(null);
    
    // 设置缓存
    const setResult = setCache(testData.key, testData.value);
    expect(setResult).toBe(true);
    expect(mockWx.setStorageSync).toHaveBeenCalled();

    // 模拟获取缓存返回数据
    const cacheKey = generateCacheKey(testData.key);
    const mockCacheData = {
      value: testData.value,
      expireTime: Date.now() + 3600000,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };
    mockWx.getStorageSync.mockReturnValue(mockCacheData);

    // 获取缓存
    const getResult = getCache(testData.key);
    expect(getResult).toBe(testData.value);
  });

  test('should return null for expired cache', () => {
    // 模拟获取缓存返回过期数据
    const cacheKey = generateCacheKey(testData.key);
    const mockCacheData = {
      value: testData.value,
      expireTime: Date.now() - 1000, // 已过期
      createdAt: Date.now() - 3600000,
      lastAccessed: Date.now() - 1800000
    };
    mockWx.getStorageSync.mockReturnValue(mockCacheData);

    // 获取缓存
    const getResult = getCache(testData.key);
    expect(getResult).toBeNull();
    expect(mockWx.removeStorageSync).toHaveBeenCalledWith(cacheKey);
  });

  test('should delete cache successfully', () => {
    // 删除缓存
    const deleteResult = deleteCache(testData.key);
    expect(deleteResult).toBe(true);
    expect(mockWx.removeStorageSync).toHaveBeenCalled();
  });

  test('should check if cache exists', () => {
    // 模拟获取缓存返回数据
    const cacheKey = generateCacheKey(testData.key);
    const mockCacheData = {
      value: testData.value,
      expireTime: Date.now() + 3600000,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };
    mockWx.getStorageSync.mockReturnValue(mockCacheData);

    // 检查缓存是否存在
    const hasResult = hasCache(testData.key);
    expect(hasResult).toBe(true);
  });

  test('should batch set cache', () => {
    // 模拟获取缓存返回null
    mockWx.getStorageSync.mockReturnValue(null);

    // 批量设置缓存
    const batchResult = batchSetCache([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' }
    ]);
    expect(batchResult.success).toBe(2);
  });

  test('should batch get cache', () => {
    // 模拟获取缓存返回数据
    const mockCacheData1 = {
      value: 'value1',
      expireTime: Date.now() + 3600000,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };
    const mockCacheData2 = {
      value: 'value2',
      expireTime: Date.now() + 3600000,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };
    mockWx.getStorageSync.mockReturnValueOnce(mockCacheData1).mockReturnValueOnce(mockCacheData2);

    // 批量获取缓存
    const batchResult = batchGetCache([
      { key: 'key1' },
      { key: 'key2' }
    ]);
    expect(batchResult.key1).toBe('value1');
    expect(batchResult.key2).toBe('value2');
  });
});

// 测试缓存管理器类
describe('CacheManager', () => {
  test('should create cache manager with namespace', () => {
    const cacheManager = new CacheManager('test_namespace');
    expect(cacheManager.namespace).toBe('test_namespace');
  });

  test('should use default namespace if not provided', () => {
    const cacheManager = new CacheManager();
    expect(cacheManager.namespace).toBe('default');
  });

  // 注意：CacheManager的方法测试需要更多的mock设置
  // 这里只测试基本功能，详细测试留给集成测试
});

// 测试缓存统计
describe('Cache Stats', () => {
  test('should reset cache stats', () => {
    resetCacheStats();
    const stats = getCacheStats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
    expect(stats.sets).toBe(0);
    expect(stats.deletes).toBe(0);
    expect(stats.errors).toBe(0);
  });

  test('should get cache stats', () => {
    const stats = getCacheStats();
    expect(stats).toHaveProperty('hits');
    expect(stats).toHaveProperty('misses');
    expect(stats).toHaveProperty('sets');
    expect(stats).toHaveProperty('deletes');
    expect(stats).toHaveProperty('errors');
  });
});

// 测试缓存状态
describe('Cache Status', () => {
  test('should get cache status for a specific key', () => {
    // 模拟获取缓存返回数据
    const cacheKey = generateCacheKey('test_key');
    const mockCacheData = {
      value: 'test_value',
      expireTime: Date.now() + 3600000,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };
    mockWx.getStorageSync.mockReturnValue(mockCacheData);

    const status = getCacheStatus('test_key');
    expect(status.exists).toBe(true);
    expect(status.expired).toBe(false);
    expect(status.value).toBe('test_value');
  });

  test('should get overall cache status', () => {
    // 模拟获取存储信息
    mockWx.getStorageInfoSync.mockReturnValue({ keys: ['spark_cache_test1', 'spark_cache_test2'] });
    mockWx.getStorageSync.mockReturnValueOnce({
      value: 'test1',
      expireTime: Date.now() + 3600000,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    }).mockReturnValueOnce({
      value: 'test2',
      expireTime: Date.now() - 1000,
      createdAt: Date.now() - 3600000,
      lastAccessed: Date.now() - 1800000
    });

    const status = getCacheStatus();
    expect(status.totalItems).toBe(2);
    expect(status.expiredItems).toBe(1);
  });
});

// 测试缓存清理
describe('Cache Cleanup', () => {
  test('should clear all cache', () => {
    // 模拟获取存储信息
    mockWx.getStorageInfoSync.mockReturnValue({ keys: ['spark_cache_test1', 'spark_cache_test2'] });

    const clearResult = clearAllCache();
    expect(clearResult).toBe(true);
    expect(mockWx.removeStorageSync).toHaveBeenCalledTimes(2);
  });
});

// 测试错误处理
describe('Error Handling', () => {
  test('should handle storage errors gracefully', () => {
    // 模拟存储错误
    mockWx.setStorageSync.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const setResult = setCache('test_key', 'test_value');
    expect(setResult).toBe(false);
  });

  test('should handle get storage errors gracefully', () => {
    // 模拟获取存储错误
    mockWx.getStorageSync.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const getResult = getCache('test_key');
    expect(getResult).toBeNull();
  });
});
