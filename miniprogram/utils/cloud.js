const { handleError, ErrorTypes, withRetry } = require('./errorHandler')
const { Logger } = require('./logger')
const { getCache, setCache, generateCacheKey } = require('./cache')

const logger = new Logger()

/**
 * 统一云函数调用工具
 * @param {string} name 云函数名称
 * @param {object} data 参数
 * @param {object} options 配置项
 * @param {boolean} [options.showLoading=true] 是否显示Loading
 * @param {string} [options.loadingTitle='加载中...'] Loading提示文案
 * @param {boolean} [options.showError=true] 是否显示错误提示
 * @param {boolean} [options.throwError=true] 是否抛出错误
 * @param {boolean} [options.retry=false] 是否自动重试（仅网络错误）
 * @param {boolean} [options.cache=false] 是否启用缓存
 * @param {number} [options.cacheTTL=3600000] 缓存过期时间（毫秒）
 * @param {string} [options.cacheKey] 自定义缓存键
 * @returns {Promise<any>}
 */
const call = async (name, data = {}, options = {}) => {
  const {
    showLoading = true,
    loadingTitle = '加载中...',
    showError = true,
    throwError = true,
    retry = false,
    cache = false,
    cacheTTL = 3600000,
    cacheKey
  } = options

  // 生成缓存键
  const generateCacheKeyForCall = () => {
    if (cacheKey) {
      return cacheKey
    }
    return generateCacheKey(`cloud_${name}`, data)
  }

  // 检查缓存
  if (cache) {
    const cachedValue = getCache(generateCacheKeyForCall())
    if (cachedValue !== null) {
      logger.info(`云函数调用缓存命中: ${name}`)
      return cachedValue
    }
  }

  if (showLoading) {
    wx.showLoading({ title: loadingTitle, mask: true })
  }

  const execute = async () => {
    const startTime = Date.now()
    try {
      const res = await wx.cloud.callFunction({
        name,
        data
      })
      const duration = Date.now() - startTime

      // 记录调用日志
      logger.info(`云函数调用成功: ${name}`, {
        duration,
        params: data,
        result: res.result,
        cache: cache
      })

      return res
    } catch (err) {
      const duration = Date.now() - startTime
      logger.error(`云函数调用失败: ${name}`, err, {
        duration,
        params: data
      })
      throw err
    }
  }

  try {
    let res
    if (retry) {
      // 重试3次，每次间隔1秒
      res = await withRetry(execute, 3, 1000)
    } else {
      res = await execute()
    }

    if (showLoading) {
      wx.hideLoading()
    }

    // 检查业务状态码
    if (res.result && res.result.code !== undefined && res.result.code !== 0) {
      const error = new Error(res.result.message || '未知错误')
      error.code = res.result.code
      error.data = res.result.data
      error.type = 'BUSINESS_ERROR'
      throw error
    }

    const result = res.result.data || res.result

    // 缓存结果
    if (cache) {
      setCache(generateCacheKeyForCall(), result, cacheTTL)
      logger.info(`云函数调用结果已缓存: ${name}`)
    }

    return result

  } catch (err) {
    if (showLoading) {
      wx.hideLoading()
    }

    // 统一错误处理
    const errorInfo = handleError(err)
    
    // 显示错误提示
    if (showError) {
      let title = errorInfo.message
      
      // 特殊错误类型处理
      if (errorInfo.type === ErrorTypes.NETWORK_ERROR) {
        title = '网络连接失败，请重试'
      } else if (errorInfo.type === ErrorTypes.PERMISSION_DENIED) {
        title = '权限不足'
      } else if (err.type === 'BUSINESS_ERROR') {
        title = err.message
      }
      
      wx.showToast({
        title,
        icon: 'none',
        duration: 2000
      })
    }

    // 抛出错误供调用方处理
    if (throwError) {
      throw err
    }
  }
}

module.exports = {
  call
}
