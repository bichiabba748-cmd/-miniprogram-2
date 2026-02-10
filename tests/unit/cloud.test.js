/**
 * 云函数调用工具单元测试
 * 测试云函数调用的核心功能和错误处理机制
 */

const { call } = require('../../miniprogram/utils/cloud');
const { handleError } = require('../../miniprogram/utils/errorHandler');

// 模拟依赖
jest.mock('../../miniprogram/utils/errorHandler');
jest.mock('../../miniprogram/utils/logger');
jest.mock('../../miniprogram/utils/cache');

// 模拟wx对象
const mockWx = {
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showToast: jest.fn(),
  cloud: {
    callFunction: jest.fn()
  }
};

global.wx = mockWx;

// 模拟缓存函数
const { getCache, setCache } = require('../../miniprogram/utils/cache');

// 测试数据
const testData = {
  functionName: 'test_function',
  params: { userId: '123', page: 1 },
  successResult: {
    result: {
      code: 0,
      data: { message: 'success' }
    }
  },
  errorResult: {
    result: {
      code: 5000,
      message: 'Internal error'
    }
  }
};

// 测试云函数调用成功场景
describe('Cloud Function Call Success', () => {
  beforeEach(() => {
    // 重置mock
    mockWx.showLoading.mockClear();
    mockWx.hideLoading.mockClear();
    mockWx.showToast.mockClear();
    mockWx.cloud.callFunction.mockClear();
    handleError.mockClear();
    getCache.mockClear();
    setCache.mockClear();

    // 模拟缓存返回null
    getCache.mockReturnValue(null);
    // 模拟缓存设置成功
    setCache.mockReturnValue(true);
  });

  test('should call cloud function successfully', async () => {
    // 模拟云函数调用成功
    mockWx.cloud.callFunction.mockResolvedValue(testData.successResult);

    // 调用云函数
    const result = await call(testData.functionName, testData.params);

    // 验证结果
    expect(result).toEqual(testData.successResult.result.data);
    expect(mockWx.cloud.callFunction).toHaveBeenCalledWith({
      name: testData.functionName,
      data: testData.params
    });
    expect(mockWx.showLoading).toHaveBeenCalled();
    expect(mockWx.hideLoading).toHaveBeenCalled();
  });

  test('should use cached result when cache is enabled', async () => {
    // 模拟缓存返回数据
    const cachedData = { message: 'cached data' };
    getCache.mockReturnValue(cachedData);

    // 调用云函数（应该使用缓存）
    const result = await call(testData.functionName, testData.params, { cache: true });

    // 验证结果
    expect(result).toEqual(cachedData);
    expect(mockWx.cloud.callFunction).not.toHaveBeenCalled();
    expect(mockWx.hideLoading).toHaveBeenCalled();
  });

  test('should cache result when cache is enabled', async () => {
    // 模拟云函数调用成功
    mockWx.cloud.callFunction.mockResolvedValue(testData.successResult);

    // 调用云函数
    const result = await call(testData.functionName, testData.params, { cache: true });

    // 验证结果
    expect(result).toEqual(testData.successResult.result.data);
    expect(setCache).toHaveBeenCalled();
  });

  test('should handle retry option', async () => {
    // 模拟云函数调用成功
    mockWx.cloud.callFunction.mockResolvedValue(testData.successResult);

    // 调用云函数
    const result = await call(testData.functionName, testData.params, { retry: true });

    // 验证结果
    expect(result).toEqual(testData.successResult.result.data);
  });
});

// 测试云函数调用失败场景
describe('Cloud Function Call Failure', () => {
  beforeEach(() => {
    // 重置mock
    mockWx.showLoading.mockClear();
    mockWx.hideLoading.mockClear();
    mockWx.showToast.mockClear();
    mockWx.cloud.callFunction.mockClear();
    handleError.mockClear();
    getCache.mockClear();
    setCache.mockClear();

    // 模拟缓存返回null
    getCache.mockReturnValue(null);
  });

  test('should handle business error', async () => {
    // 模拟云函数调用返回业务错误
    mockWx.cloud.callFunction.mockResolvedValue(testData.errorResult);

    // 调用云函数
    await expect(call(testData.functionName, testData.params)).rejects.toThrow();

    // 验证
    expect(mockWx.showToast).toHaveBeenCalledWith({
      title: testData.errorResult.result.message,
      icon: 'none',
      duration: 2000
    });
  });

  test('should handle network error', async () => {
    // 模拟网络错误
    const networkError = new Error('Network error');
    mockWx.cloud.callFunction.mockRejectedValue(networkError);

    // 模拟错误处理
    handleError.mockReturnValue({
      message: 'Network error',
      type: 'NETWORK_ERROR'
    });

    // 调用云函数
    await expect(call(testData.functionName, testData.params)).rejects.toThrow();

    // 验证
    expect(mockWx.showToast).toHaveBeenCalledWith({
      title: '网络连接失败，请重试',
      icon: 'none',
      duration: 2000
    });
  });

  test('should handle permission error', async () => {
    // 模拟权限错误
    const permissionError = new Error('Permission denied');
    mockWx.cloud.callFunction.mockRejectedValue(permissionError);

    // 模拟错误处理
    handleError.mockReturnValue({
      message: 'Permission denied',
      type: 'PERMISSION_DENIED'
    });

    // 调用云函数
    await expect(call(testData.functionName, testData.params)).rejects.toThrow();

    // 验证
    expect(mockWx.showToast).toHaveBeenCalledWith({
      title: '权限不足',
      icon: 'none',
      duration: 2000
    });
  });

  test('should not throw error when throwError is false', async () => {
    // 模拟网络错误
    const networkError = new Error('Network error');
    mockWx.cloud.callFunction.mockRejectedValue(networkError);

    // 模拟错误处理
    handleError.mockReturnValue({
      message: 'Network error',
      type: 'NETWORK_ERROR'
    });

    // 调用云函数
    const result = await call(testData.functionName, testData.params, { throwError: false });

    // 验证
    expect(result).toBeUndefined();
    expect(mockWx.showToast).toHaveBeenCalled();
  });

  test('should not show error when showError is false', async () => {
    // 模拟网络错误
    const networkError = new Error('Network error');
    mockWx.cloud.callFunction.mockRejectedValue(networkError);

    // 模拟错误处理
    handleError.mockReturnValue({
      message: 'Network error',
      type: 'NETWORK_ERROR'
    });

    // 调用云函数
    await expect(call(testData.functionName, testData.params, { showError: false })).rejects.toThrow();

    // 验证
    expect(mockWx.showToast).not.toHaveBeenCalled();
  });

  test('should not show loading when showLoading is false', async () => {
    // 模拟网络错误
    const networkError = new Error('Network error');
    mockWx.cloud.callFunction.mockRejectedValue(networkError);

    // 模拟错误处理
    handleError.mockReturnValue({
      message: 'Network error',
      type: 'NETWORK_ERROR'
    });

    // 调用云函数
    await expect(call(testData.functionName, testData.params, { showLoading: false })).rejects.toThrow();

    // 验证
    expect(mockWx.showLoading).not.toHaveBeenCalled();
    expect(mockWx.hideLoading).not.toHaveBeenCalled();
  });
});

// 测试云函数调用选项
describe('Cloud Function Call Options', () => {
  beforeEach(() => {
    // 重置mock
    mockWx.showLoading.mockClear();
    mockWx.hideLoading.mockClear();
    mockWx.showToast.mockClear();
    mockWx.cloud.callFunction.mockClear();
    handleError.mockClear();

    // 模拟云函数调用成功
    mockWx.cloud.callFunction.mockResolvedValue(testData.successResult);
  });

  test('should use custom loading title', async () => {
    const customTitle = 'Custom loading...';

    // 调用云函数
    await call(testData.functionName, testData.params, { loadingTitle: customTitle });

    // 验证
    expect(mockWx.showLoading).toHaveBeenCalledWith({ title: customTitle, mask: true });
  });

  test('should use default options when not provided', async () => {
    // 调用云函数
    await call(testData.functionName, testData.params);

    // 验证
    expect(mockWx.showLoading).toHaveBeenCalledWith({ title: '加载中...', mask: true });
  });

  test('should handle empty params', async () => {
    // 调用云函数
    await call(testData.functionName);

    // 验证
    expect(mockWx.cloud.callFunction).toHaveBeenCalledWith({
      name: testData.functionName,
      data: {}
    });
  });

  test('should handle empty options', async () => {
    // 调用云函数
    await call(testData.functionName, testData.params, {});

    // 验证
    expect(mockWx.showLoading).toHaveBeenCalled();
  });
});

// 测试边界情况
describe('Cloud Function Call Edge Cases', () => {
  beforeEach(() => {
    // 重置mock
    mockWx.showLoading.mockClear();
    mockWx.hideLoading.mockClear();
    mockWx.showToast.mockClear();
    mockWx.cloud.callFunction.mockClear();
    handleError.mockClear();
  });

  test('should handle result without data', async () => {
    // 模拟云函数调用成功但没有data字段
    const resultWithoutData = {
      result: {
        code: 0,
        message: 'Success'
      }
    };
    mockWx.cloud.callFunction.mockResolvedValue(resultWithoutData);

    // 调用云函数
    const result = await call(testData.functionName, testData.params);

    // 验证结果
    expect(result).toEqual(resultWithoutData.result);
  });

  test('should handle result with only code', async () => {
    // 模拟云函数调用成功但只有code字段
    const resultWithOnlyCode = {
      result: {
        code: 0
      }
    };
    mockWx.cloud.callFunction.mockResolvedValue(resultWithOnlyCode);

    // 调用云函数
    const result = await call(testData.functionName, testData.params);

    // 验证结果
    expect(result).toEqual(resultWithOnlyCode.result);
  });
});
