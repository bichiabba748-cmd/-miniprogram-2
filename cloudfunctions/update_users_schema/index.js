const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 检查集合是否存在
const checkCollectionExists = async (collectionName) => {
  try {
    await db.collection(collectionName).limit(1).get();
    return true;
  } catch (e) {
    return false;
  }
};

// 创建集合（如果不存在）
const createCollectionIfNotExists = async (collectionName) => {
  try {
    await db.createCollection(collectionName);
    console.log(`✅ 集合 ${collectionName} 创建成功`);
    return true;
  } catch (e) {
    // 集合已存在，这是正常的
    if (e.errCode === -1 || e.errCode === -501001 || e.message.includes('Table exist') || e.message.includes('Collection exist')) {
      console.log(`ℹ️ 集合 ${collectionName} 已存在`);
      return true;
    }
    throw e;
  }
};

// 检查是否已有 broker 用户
const checkBrokerExists = async () => {
  try {
    const result = await db.collection('users').where({ role: 'broker' }).limit(1).get();
    return result.data.length > 0;
  } catch (e) {
    return false;
  }
};

// 检查是否已有带 businessType 的 broker 用户
const checkBrokerWithBusinessType = async () => {
  try {
    const result = await db.collection('users').where({
      role: 'broker',
      'profile.businessType': db.command.exists(true)
    }).limit(1).get();
    return result.data.length > 0;
  } catch (e) {
    return false;
  }
};

// 更新现有 broker 用户，添加 businessType 字段
const updateExistingBroker = async () => {
  try {
    const result = await db.collection('users').where({ role: 'broker' }).limit(1).get();
    if (result.data.length === 0) {
      return false;
    }

    const brokerId = result.data[0]._id;
    await db.collection('users').doc(brokerId).update({
      data: {
        profile: {
          ...result.data[0].profile,
          businessType: 'rental'
        }
      }
    });
    console.log('✅ 已更新现有 broker 用户，添加了 businessType 字段');
    return true;
  } catch (e) {
    console.error('❌ 更新现有 broker 用户失败:', e);
    return false;
  }
};

// 添加新的 broker 用户，包含 businessType 字段
const addNewBroker = async () => {
  try {
    const newBroker = {
      _openid: 'broker_test_openid_003',
      role: 'broker',
      profile: {
        businessType: 'rental'
      },
      stats: {
        totalLeads: 0,
        studyProgress: 0
      },
      medals: [],
      storeId: null,
      createdAt: db.serverDate()
    };

    await db.collection('users').add({ data: newBroker });
    console.log('✅ 已添加新的 broker 用户，包含 businessType 字段');
    return true;
  } catch (e) {
    console.error('❌ 添加新 broker 用户失败:', e);
    throw e;
  }
};

// 权限校验函数
async function checkAdminPermission(openid) {
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
    
    console.log('管理员权限校验 - 用户角色:', userRole);
    
    // 检查是否为admin角色
    if (userRole === 'admin') {
      return {
        allowed: true,
        reason: '管理员权限验证通过'
      };
    } else {
      return {
        allowed: false,
        reason: '需要管理员角色'
      };
    }
  } catch (error) {
    console.error('管理员权限校验失败:', error);
    return {
      allowed: false,
      reason: '权限校验异常'
    };
  }
}

exports.main = async (event, context) => {
  try {
    // 获取用户openid
    const openid = cloud.getWXContext().OPENID;
    console.log('update_users_schema 云函数调用 - 用户:', openid);
    
    // 权限校验
    const permissionResult = await checkAdminPermission(openid);
    if (!permissionResult.allowed) {
      console.warn('update_users_schema 权限验证失败 - 用户:', openid, '原因:', permissionResult.reason);
      return {
        code: 1002,
        message: '权限不足',
        reason: permissionResult.reason
      };
    }
    
    console.log('🚀 开始更新 users 集合 Schema...');

    // 1. 确保 users 集合存在
    await createCollectionIfNotExists('users');

    // 2. 检查是否已有带 businessType 的 broker 用户
    const hasBrokerWithBusinessType = await checkBrokerWithBusinessType();
    if (hasBrokerWithBusinessType) {
      console.log('✅ users 集合中已有带 businessType 字段的 broker 记录');
      return {
        code: 0,
        message: 'users 集合中已有带 businessType 字段的 broker 记录',
        updated: false
      };
    }

    // 3. 检查是否已有 broker 用户
    const hasBroker = await checkBrokerExists();
    if (hasBroker) {
      // 更新现有 broker 用户
      const updated = await updateExistingBroker();
      if (updated) {
        return {
          code: 0,
          message: '已更新现有 broker 用户，添加了 businessType 字段',
          updated: true
        };
      }
    }

    // 4. 添加新的 broker 用户
    await addNewBroker();

    return {
      code: 0,
      message: '已添加新的 broker 用户，包含 businessType 字段',
      added: true
    };

  } catch (error) {
    console.error('❌ 更新 users 集合 Schema 失败:', error);
    return {
      code: 5000,
      message: '更新 users 集合 Schema 失败',
      error: error.message
    };
  }
};