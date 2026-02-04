const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

async function testConcurrentCalls() {
  const testCount = 10
  const startTime = Date.now()
  const promises = []

  for (let i = 0; i < testCount; i++) {
    promises.push(
      db.collection('users').limit(1).get()
    )
  }

  const results = await Promise.all(promises)
  const endTime = Date.now()
  const duration = endTime - startTime
  const avgTime = duration / testCount

  return {
    testCount,
    duration,
    avgTime,
    tps: testCount / (duration / 1000)
  }
}

async function testQueryPerformance() {
  const queries = [
    {
      name: '简单查询',
      fn: () => db.collection('users').limit(10).get()
    },
    {
      name: '条件查询',
      fn: () => db.collection('users').where({ role: 'student' }).limit(10).get()
    },
    {
      name: '排序查询',
      fn: () => db.collection('users').orderBy('createdAt', 'desc').limit(10).get()
    },
    {
      name: '聚合查询',
      fn: () => db.collection('users').count()
    }
  ]

  const results = []

  for (const query of queries) {
    const startTime = Date.now()
    try {
      await query.fn()
      const duration = Date.now() - startTime
      results.push({
        name: query.name,
        duration,
        status: 'success'
      })
    } catch (error) {
      results.push({
        name: query.name,
        duration: Date.now() - startTime,
        status: 'error',
        error: error.message
      })
    }
  }

  return results
}

async function testWritePerformance() {
  const testCount = 5
  const startTime = Date.now()
  const promises = []

  try {
    // 尝试写入测试数据
    for (let i = 0; i < testCount; i++) {
      promises.push(
        db.collection('users').add({
          data: {
            testId: i,
            timestamp: db.serverDate(),
            testData: 'test',
            role: 'visitor'
          }
        })
      )
    }

    const results = await Promise.all(promises)
    const endTime = Date.now()
    const duration = endTime - startTime
    const avgTime = duration / testCount

    return {
      testCount,
      duration,
      avgTime,
      tps: testCount / (duration / 1000)
    }
  } catch (error) {
    console.error('写入性能测试失败:', error)
    // 如果写入失败，返回模拟数据
    const endTime = Date.now()
    const duration = endTime - startTime
    return {
      testCount,
      duration,
      avgTime: duration / testCount,
      tps: testCount / (duration / 1000),
      warning: '使用模拟数据，实际写入失败'
    }
  }
}

exports.main = async (event, context) => {
  const { testType = 'all' } = event

  const result = {
    code: 0,
    message: '性能测试完成',
    data: {}
  }

  try {
    if (testType === 'all' || testType === 'concurrent') {
      result.data.concurrent = await testConcurrentCalls()
    }

    if (testType === 'all' || testType === 'query') {
      result.data.query = await testQueryPerformance()
    }

    if (testType === 'all' || testType === 'write') {
      result.data.write = await testWritePerformance()
    }

    return result
  } catch (error) {
    console.error('性能测试失败:', error)
    return {
      code: 5000,
      message: '性能测试失败',
      error: error.message
    }
  }
}
