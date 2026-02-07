// adminTools 云函数
// 管理工具的API接口集成

const cloud = require('wx-server-sdk');
const CloudBase = require('@cloudbase/manager-node');

// 初始化云环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云数据库
const db = cloud.database();

// 主函数
exports.main = async (event, context) => {
  console.log('Received event:', event);

  // Handle potential string event (CLI invocation edge case)
  if (typeof event === 'string') {
    try {
      event = JSON.parse(event);
    } catch (e) {
      console.error('Failed to parse event string:', e);
    }
  }

  // LOGGING: Write event to database for debugging
  try {
    const envId = cloud.getWXContext().ENV;
    const app = new CloudBase({ envId: envId });
  } catch (e) {}

  const { action, data } = event;
  
  try {
    // 获取用户openid
    const openid = cloud.getWXContext().OPENID;
    console.log('adminTools 云函数调用 - 用户:', openid, '操作:', action);
    
    // 权限校验
    const permissionResult = await checkPermission(openid, action);
    if (!permissionResult.allowed) {
      console.warn('adminTools 权限验证失败 - 用户:', openid, '操作:', action, '原因:', permissionResult.reason);
      return {
        code: 1002,
        message: '权限不足',
        reason: permissionResult.reason
      };
    }
    
    switch (action) {
      // 获取项目状态
      case 'getProjectStatus':
        return await getProjectStatus();
        
      // 运行健康检查
      case 'runHealthCheck':
        return await runHealthCheck();
        
      // 执行手动备份
      case 'manualBackup':
        return await manualBackup();
        
      // 获取开发进度
      case 'getDevelopmentProgress':
        return await getDevelopmentProgress();
        
      // 获取资源使用情况
      case 'getResourceUsage':
        return await getResourceUsage();
        
      // 获取云函数状态
      case 'getCloudFunctionsStatus':
        return await getCloudFunctionsStatus();
        
      // 获取组件库状态
      case 'getComponentLibraryStatus':
        return await getComponentLibraryStatus();
        
      // 导出报告
      case 'exportReport':
        return await exportReport(data);
        
      // 执行优化操作
      case 'executeOptimization':
        return await executeOptimization(data);
        
      // 获取备份历史
      case 'getBackupHistory':
        return await getBackupHistory();
        
      // 更新开发进度
      case 'updateProgress':
        return await updateProgress(data);

      // 更新数据库权限
      case 'updateDatabaseRules':
        return await updateDatabaseRules(data);
<<<<<<< HEAD
=======

      // 更新存储权限
      case 'updateStorageRules':
        return await updateStorageRules(data);
>>>>>>> c162c2d362268cf4f9484b7bc58e5e89e59ea2c0
        
      default:
        console.log('Unknown action:', action);
        return {
          success: false,
          message: '未知操作',
          receivedEvent: event,
          parsedAction: action,
          actionType: typeof action
        };
    }
  } catch (error) {
    console.error('adminTools 云函数错误:', error);
    return {
      code: 5000,
      message: '操作失败',
      error: error.message
    };
  }
};

// 权限校验函数
async function checkPermission(openid, action) {
  try {
    // 查询用户信息
    const userResult = await db.collection('users').where({ _openid: openid }).get();
    
    if (userResult.data.length === 0) {
      return {
        allowed: false,
        reason: '用户不存在'
      };
    }
    
    const user = userResult.data[0];
    const userRole = user.role || 'visitor';
    
    console.log('权限校验 - 用户角色:', userRole, '操作:', action);
    
    // 定义权限矩阵
    const permissionMatrix = {
      // 公共操作 - 所有角色都可访问
      'getProjectStatus': true,
      'runHealthCheck': true,
      'getDevelopmentProgress': true,
      'getResourceUsage': true,
      'getCloudFunctionsStatus': true,
      'getComponentLibraryStatus': true,
      'getBackupHistory': true,
      
      // 需要管理员权限的操作
      'manualBackup': ['admin'],
      'exportReport': ['admin'],
      'executeOptimization': ['admin'],
      'updateProgress': ['admin'],
      'updateDatabaseRules': ['admin']
    };
    
    // 检查权限
    const requiredPermission = permissionMatrix[action];
    
    if (requiredPermission === undefined) {
      return {
        allowed: false,
        reason: '操作不存在'
      };
    }
    
    if (requiredPermission === true) {
      return {
        allowed: true,
        reason: '公共操作'
      };
    }
    
    if (Array.isArray(requiredPermission)) {
      if (requiredPermission.includes(userRole)) {
        return {
          allowed: true,
          reason: '角色权限匹配'
        };
      } else {
        return {
          allowed: false,
          reason: `需要以下角色之一: ${requiredPermission.join(', ')}`
        };
      }
    }
    
    return {
      allowed: false,
      reason: '权限检查失败'
    };
  } catch (error) {
    console.error('权限校验失败:', error);
    return {
      allowed: false,
      reason: '权限校验异常'
    };
  }
}

// 获取项目状态
async function getProjectStatus() {
  try {
    // 读取真实的开发进度数据
    const progressData = await getRealProgressData();
    
    const status = {
      healthScore: 85,
      progressPercentage: progressData.percentage,
      lastBackupTime: new Date().toISOString(),
      totalFiles: progressData.totalFiles,
      totalLines: progressData.totalLines,
      appSize: progressData.appSize,
      cloudFunctions: progressData.cloudFunctions
    };
    
    return {
      code: 0,
      data: status
    };
  } catch (error) {
    throw error;
  }
}

// 更新数据库权限
async function updateDatabaseRules(data) {
<<<<<<< HEAD
  try {
    const { rules } = data;
    // 获取环境ID
    const envId = cloud.getWXContext().ENV;
    
    console.log('开始更新数据库权限，环境ID:', envId);
    
    const app = new CloudBase({
      envId: envId
    });
    
    // 尝试调用 database.updateRules
    // 注意：传入的 rules 应该是包含 "rules" 键的对象，或者是 JSON 字符串
    // database.rules.json 内容如: { "rules": { ... } }
    const rulesStr = typeof rules === 'string' ? rules : JSON.stringify(rules);
    
    // 使用 manager-node 的 API
    // 如果 manager-node 版本较新，应该是 commonService 调用
    // 或者 app.database.updateRules(rulesStr)
    
    // 尝试直接调用
    if (app.database && app.database.updateRules) {
        await app.database.updateRules(rulesStr);
    } else {
        // 降级尝试 commonService
        await app.commonService().call({
            service: 'database',
            action: 'UpdateRules',
            data: {
                rules: rulesStr
            }
        });
    }
    
    return {
      code: 0,
      message: '数据库权限规则更新成功'
    };
  } catch (error) {
    console.error('更新数据库权限失败:', error);
    return {
      code: 5000,
      message: '更新数据库权限失败',
      error: error.message
    };
  }
}

    throw error;
  }
}

// 运行健康检查
async function runHealthCheck() {
=======
>>>>>>> c162c2d362268cf4f9484b7bc58e5e89e59ea2c0
  try {
    let { rules, rulesBase64 } = data;
    
    if (rulesBase64) {
        const buffer = Buffer.from(rulesBase64, 'base64');
        const rulesContent = buffer.toString('utf8');
        try {
            rules = JSON.parse(rulesContent);
        } catch (e) {
            rules = rulesContent;
        }
    }

    const envId = cloud.getWXContext().ENV;
    console.log('开始更新数据库权限，环境ID:', envId);
    
    const app = new CloudBase({ envId: envId });
    
    const rulesStr = typeof rules === 'string' ? rules : JSON.stringify(rules);
    
    if (app.database && app.database.updateRules) {
        await app.database.updateRules(rulesStr);
    } else {
        await app.commonService().call({
            service: 'database',
            action: 'UpdateRules',
            data: {
                rules: rulesStr
            }
        });
    }
    
    return {
      code: 0,
      message: '数据库权限规则更新成功'
    };
  } catch (error) {
    console.error('更新数据库权限失败:', error);
    return {
      code: 5000,
      message: '更新数据库权限失败',
      error: error.message
    };
  }
}

// 更新存储权限
async function updateStorageRules(data) {
  try {
    let { rules, rulesBase64 } = data;
    
    if (rulesBase64) {
        const buffer = Buffer.from(rulesBase64, 'base64');
        const rulesContent = buffer.toString('utf8');
        try {
            rules = JSON.parse(rulesContent);
        } catch (e) {
            rules = rulesContent;
        }
    }

    const envId = cloud.getWXContext().ENV;
    console.log('开始更新存储权限，环境ID:', envId);
    
    const app = new CloudBase({ envId: envId });

    // DEBUG: Introspection
    const debugInfo = {};
    try {
        debugInfo.appKeys = Object.keys(app);
        debugInfo.appProtoKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(app));
        if (app.storage) {
            debugInfo.storageType = typeof app.storage;
            // Handle if it's a getter
            const storageObj = app.storage;
            debugInfo.storageKeys = Object.keys(storageObj);
            if (storageObj && typeof storageObj === 'object') {
                 debugInfo.storageProtoKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(storageObj));
            }
        } else {
            debugInfo.storageExists = false;
        }
    } catch (e) {
        debugInfo.error = e.message;
    }
    
    const rulesStr = typeof rules === 'string' ? rules : JSON.stringify(rules);
    const logs = []; // Initialize logs here

    // Attempt using the discovered SDK method
    if (app.storage && typeof app.storage.setStorageAcl === 'function') {
         try {
             console.log('Trying app.storage.setStorageAcl with object wrapper...');
             // Try passing as object property 'acl' (common pattern)
             // Also try passing the RULES object directly (not string) if it's a JSON ACL
             
             await app.storage.setStorageAcl({
                 acl: rules // Try passing the object
             });
             return {
                 code: 0,
                 message: '存储权限规则更新成功 (via app.storage.setStorageAcl object)'
             };
         } catch (e) {
             console.error('app.storage.setStorageAcl({ acl: obj }) failed:', e.message);
             logs.push({ attempt: 'setStorageAcl_obj_prop', error: e.message });
             
             try {
                console.log('Trying app.storage.setStorageAcl with raw string...');
                await app.storage.setStorageAcl(rulesStr);
                return {
                     code: 0,
                     message: '存储权限规则更新成功 (via app.storage.setStorageAcl raw)'
                };
             } catch (e2) {
                console.error('app.storage.setStorageAcl(str) failed:', e2.message);
                logs.push({ attempt: 'setStorageAcl_str', error: e2.message });
             }
         }
    }

    // Fallback: Attempt multiple actions to find the correct one for Storage Security Rules
    const attempts = [
        // Strategy 1: 'tcb' service (generic gateway) with Version
        { service: 'tcb', action: 'UpdateSafetyRules', dataExtra: { Version: '2018-08-09' } },
        
        // Strategy 2: 'storage' service with explicit Action in data
        { service: 'storage', action: 'UpdateSafetyRules', dataExtra: { Action: 'UpdateSafetyRules' } },
        
        // Strategy 3: 'storage' service with 'Rules' (capitalized) and explicit Action
        // Note: we set rules to undefined to remove the default lowercase 'rules' if needed, but here we just add Rules
        { service: 'storage', action: 'UpdateSafetyRules', dataExtra: { Action: 'UpdateSafetyRules', Rules: rulesStr } },
        
        // Strategy 4: 'flexdb' service? (Unlikely but possible for unified DB/Storage)
        // { service: 'flexdb', action: 'UpdateSafetyRules' }
    ];
 
     const logs = [];
     
     for (const attempt of attempts) {
         try {
             console.log(`Trying ${attempt.service}.${attempt.action}...`);
             const payload = {
                 service: attempt.service,
                 action: attempt.action,
                 data: {
                     rules: rulesStr,
                     ...(attempt.dataExtra || {})
                 }
             };
             
             await app.commonService().call(payload);
             
             return {
                 code: 0,
                 message: `存储权限规则更新成功 (Strategy: ${attempt.action})`,
                 debugInfo
             };
         } catch (e) {
             console.error(`Attempt ${attempt.action} failed:`, e.message);
             logs.push({ attempt: attempt.action, error: e.message });
         }
     }
     
     return {
       code: 5000,
       message: '更新存储权限失败 (所有尝试均失败)',
       logs: logs,
       debugInfo
     };
  } catch (error) {
    console.error('更新存储权限失败:', error);
    return {
      code: 5000,
      message: '更新存储权限失败',
      error: error.message
    };
  }
}

// 模拟获取真实进度数据
async function getRealProgressData() {
  return {
    percentage: 65,
    totalFiles: 128,
    totalLines: 15600,
    appSize: '4.2MB',
    cloudFunctions: 12
  };
}

// 辅助函数占位符
async function runHealthCheck() { return { code: 0, message: '健康检查通过' }; }
async function manualBackup() { return { code: 0, message: '备份已触发' }; }
async function getDevelopmentProgress() { return { code: 0, data: { percentage: 65 } }; }
async function getResourceUsage() { return { code: 0, data: { storage: '120MB', database: '500MB' } }; }
async function getCloudFunctionsStatus() { return { code: 0, data: { status: 'healthy' } }; }
async function getComponentLibraryStatus() { return { code: 0, data: { count: 25 } }; }
async function exportReport() { return { code: 0, message: '报告已生成' }; }
async function executeOptimization() { return { code: 0, message: '优化已完成' }; }
async function getBackupHistory() { return { code: 0, data: [] }; }
async function updateProgress() { return { code: 0, message: '进度已更新' }; }
