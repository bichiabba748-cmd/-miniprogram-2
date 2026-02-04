// 小程序端日志工具
// 注意：在小程序端无法直接操作数据库，日志将仅打印到控制台

const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
}

class Logger {
  constructor(context = {}) {
    this.context = {
      timestamp: new Date().toISOString(),
      ...context
    }
  }

  formatMessage(level, message, data = {}) {
    return {
      level,
      message,
      data,
      ...this.context,
      timestamp: new Date().toISOString()
    }
  }

  async writeLog(logEntry) {
    // 在小程序端仅打印日志到控制台
    console.log(`[${logEntry.level}] ${logEntry.message}`, logEntry.data || {})
  }

  debug(message, data = {}) {
    const logEntry = this.formatMessage(LogLevel.DEBUG, message, data)
    console.debug('[DEBUG]', logEntry)
    return this.writeLog(logEntry)
  }

  info(message, data = {}) {
    const logEntry = this.formatMessage(LogLevel.INFO, message, data)
    console.info('[INFO]', logEntry)
    return this.writeLog(logEntry)
  }

  warn(message, data = {}) {
    const logEntry = this.formatMessage(LogLevel.WARN, message, data)
    console.warn('[WARN]', logEntry)
    return this.writeLog(logEntry)
  }

  error(message, error = null, data = {}) {
    const logEntry = this.formatMessage(LogLevel.ERROR, message, {
      ...data,
      error: error ? {
        message: error.message,
        stack: error.stack,
        code: error.code
      } : null
    })
    console.error('[ERROR]', logEntry)
    return this.writeLog(logEntry)
  }

  async logApiCall(apiName, params = {}, result = null, error = null) {
    const logEntry = this.formatMessage(LogLevel.INFO, `API调用: ${apiName}`, {
      apiName,
      params: this.sanitizeParams(params),
      success: !error,
      error: error ? {
        message: error.message,
        code: error.code
      } : null,
      duration: result?.duration
    })
    return this.writeLog(logEntry)
  }

  async logUserAction(userId, action, details = {}) {
    const logEntry = this.formatMessage(LogLevel.INFO, `用户操作: ${action}`, {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    })
    return this.writeLog(logEntry)
  }

  async logSecurityEvent(eventType, details = {}) {
    const logEntry = this.formatMessage(LogLevel.WARN, `安全事件: ${eventType}`, {
      eventType,
      details,
      timestamp: new Date().toISOString()
    })
    return this.writeLog(logEntry)
  }

  sanitizeParams(params) {
    const sensitiveFields = ['password', 'phone', 'idCard', 'token', 'secret']
    const sanitized = { ...params }

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***'
      }
    }

    return sanitized
  }
}

function createLogger(context) {
  return new Logger(context)
}

// 小程序端不支持直接查询数据库，返回模拟数据
async function queryLogs(filters = {}, page = 1, pageSize = 50) {
  return {
    code: 0,
    data: [],
    total: 0,
    message: '小程序端不支持直接查询数据库日志'
  }
}

// 小程序端不支持直接查询数据库，返回模拟数据
async function getLogStats(startTime, endTime) {
  return {
    code: 0,
    data: [],
    message: '小程序端不支持直接查询数据库日志'
  }
}

module.exports = {
  LogLevel,
  Logger,
  createLogger,
  queryLogs,
  getLogStats
}
