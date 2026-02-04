const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  INVALID_PARAMS: 'INVALID_PARAMS',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMIT: 'RATE_LIMIT'
}

const ErrorCodes = {
  NETWORK_ERROR: 5001,
  AUTH_ERROR: 2001,
  PERMISSION_DENIED: 2002,
  DATA_NOT_FOUND: 2003,
  INVALID_PARAMS: 1001,
  SERVER_ERROR: 5000,
  TIMEOUT: 5002,
  RATE_LIMIT: 5003
}

const ErrorMessages = {
  [ErrorTypes.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [ErrorTypes.AUTH_ERROR]: '身份验证失败，请重新登录',
  [ErrorTypes.PERMISSION_DENIED]: '权限不足，无法执行此操作',
  [ErrorTypes.DATA_NOT_FOUND]: '数据不存在',
  [ErrorTypes.INVALID_PARAMS]: '参数错误',
  [ErrorTypes.SERVER_ERROR]: '服务器错误，请稍后重试',
  [ErrorTypes.TIMEOUT]: '请求超时，请重试',
  [ErrorTypes.RATE_LIMIT]: '请求过于频繁，请稍后再试'
}

class AppError extends Error {
  constructor(type, message = null, data = null) {
    super(message || ErrorMessages[type])
    this.type = type
    this.code = ErrorCodes[type]
    this.data = data
    this.name = 'AppError'
  }
}

function handleError(error) {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      type: error.type,
      data: error.data
    }
  }

  if (error.errMsg) {
    if (error.errMsg.includes('network')) {
      return {
        code: ErrorCodes.NETWORK_ERROR,
        message: ErrorMessages[ErrorTypes.NETWORK_ERROR],
        type: ErrorTypes.NETWORK_ERROR
      }
    }

    if (error.errMsg.includes('auth')) {
      return {
        code: ErrorCodes.AUTH_ERROR,
        message: ErrorMessages[ErrorTypes.AUTH_ERROR],
        type: ErrorTypes.AUTH_ERROR
      }
    }

    if (error.errMsg.includes('permission')) {
      return {
        code: ErrorCodes.PERMISSION_DENIED,
        message: ErrorMessages[ErrorTypes.PERMISSION_DENIED],
        type: ErrorTypes.PERMISSION_DENIED
      }
    }
  }

  return {
    code: ErrorCodes.SERVER_ERROR,
    message: ErrorMessages[ErrorTypes.SERVER_ERROR],
    type: ErrorTypes.SERVER_ERROR
  }
}

async function withRetry(fn, maxRetries = 3, delay = 1000) {
  let lastError

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError
}

async function withTimeout(fn, timeout = 10000) {
  return Promise.race([
    fn(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new AppError(ErrorTypes.TIMEOUT)), timeout)
    )
  ])
}

function validateParams(params, rules) {
  const errors = []

  for (const [key, rule] of Object.entries(rules)) {
    const value = params[key]

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} 是必填项`)
      continue
    }

    if (value !== undefined && value !== null) {
      if (rule.type && typeof value !== rule.type) {
        errors.push(`${key} 类型错误，期望 ${rule.type}`)
      }

      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${key} 值无效`)
      }

      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${key} 不能小于 ${rule.min}`)
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${key} 不能大于 ${rule.max}`)
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${key} 格式错误`)
      }
    }
  }

  if (errors.length > 0) {
    throw new AppError(ErrorTypes.INVALID_PARAMS, errors.join('; '))
  }
}

function logError(error, context = {}) {
  console.error('Error occurred:', {
    type: error.type || 'UNKNOWN',
    code: error.code || 'UNKNOWN',
    message: error.message || error.toString(),
    context,
    timestamp: new Date().toISOString()
  })
}

module.exports = {
  ErrorTypes,
  ErrorCodes,
  ErrorMessages,
  AppError,
  handleError,
  withRetry,
  withTimeout,
  validateParams,
  logError
}
