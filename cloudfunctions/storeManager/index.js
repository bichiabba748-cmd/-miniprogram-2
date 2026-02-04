// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { action, ...params } = event;
    
    switch (action) {
      case 'getStores':
        return await getStores(params);
      case 'createStore':
        return await createStore(params);
      case 'updateStore':
        return await updateStore(params);
      case 'deleteStore':
        return await deleteStore(params);
      case 'getStoreDetail':
        return await getStoreDetail(params);
      default:
        return {
          code: 4000,
          message: '未知操作类型'
        };
    }
  } catch (err) {
    console.error('服务器错误:', err);
    return {
      code: 5000,
      message: '服务器内部错误'
    };
  }
};

// 获取门店列表
async function getStores(params) {
  try {
    const { keyword, page = 1, pageSize = 20 } = params;
    
    let query = db.collection('stores');
    
    // 搜索条件
    if (keyword) {
      query = query.where(_.or([
        { name: db.RegExp({ regexp: keyword, options: 'i' }) },
        { code: db.RegExp({ regexp: keyword, options: 'i' }) },
        { address: db.RegExp({ regexp: keyword, options: 'i' }) },
        { managerName: db.RegExp({ regexp: keyword, options: 'i' }) }
      ]));
    }
    
    // 计算总数
    const countResult = await query.count();
    const total = countResult.total;
    
    // 分页查询
    const stores = await query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('createdAt', 'desc')
      .get();
    
    return {
      code: 0,
      data: {
        stores: stores.data,
        total,
        page,
        pageSize
      },
      message: '获取门店列表成功'
    };
  } catch (err) {
    console.error('获取门店列表失败:', err);
    throw err;
  }
}

// 创建门店
async function createStore(params) {
  try {
    const { name, code, address, managerName, phone, status = 'active' } = params;
    
    // 验证参数
    if (!name || !code || !address || !managerName || !phone) {
      return {
        code: 4001,
        message: '缺少必要参数'
      };
    }
    
    // 检查代码是否已存在
    const existingStore = await db.collection('stores')
      .where({ code })
      .get();
    
    if (existingStore.data.length > 0) {
      return {
        code: 4002,
        message: '门店代码已存在'
      };
    }
    
    // 创建门店
    const result = await db.collection('stores').add({
      data: {
        name,
        code,
        address,
        managerName,
        phone,
        status,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });
    
    // 获取创建后的门店信息
    const newStore = await db.collection('stores')
      .doc(result._id)
      .get();
    
    return {
      code: 0,
      data: {
        store: newStore.data
      },
      message: '创建门店成功'
    };
  } catch (err) {
    console.error('创建门店失败:', err);
    throw err;
  }
}

// 更新门店
async function updateStore(params) {
  try {
    const { storeId, name, code, address, managerName, phone, status } = params;
    
    // 验证参数
    if (!storeId) {
      return {
        code: 4001,
        message: '缺少门店ID'
      };
    }
    
    // 检查门店是否存在
    const existingStore = await db.collection('stores')
      .doc(storeId)
      .get();
    
    if (!existingStore.data) {
      return {
        code: 4003,
        message: '门店不存在'
      };
    }
    
    // 检查代码是否已被其他门店使用
    if (code && code !== existingStore.data.code) {
      const codeStore = await db.collection('stores')
        .where({ code, _id: _.neq(storeId) })
        .get();
      
      if (codeStore.data.length > 0) {
        return {
          code: 4002,
          message: '门店代码已存在'
        };
      }
    }
    
    // 构建更新数据
    const updateData = {
      updatedAt: db.serverDate()
    };
    
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (address !== undefined) updateData.address = address;
    if (managerName !== undefined) updateData.managerName = managerName;
    if (phone !== undefined) updateData.phone = phone;
    if (status !== undefined) updateData.status = status;
    
    // 更新门店
    await db.collection('stores')
      .doc(storeId)
      .update({ data: updateData });
    
    // 获取更新后的门店信息
    const updatedStore = await db.collection('stores')
      .doc(storeId)
      .get();
    
    return {
      code: 0,
      data: {
        store: updatedStore.data
      },
      message: '更新门店成功'
    };
  } catch (err) {
    console.error('更新门店失败:', err);
    throw err;
  }
}

// 删除门店（软删除）
async function deleteStore(params) {
  try {
    const { storeId } = params;
    
    // 验证参数
    if (!storeId) {
      return {
        code: 4001,
        message: '缺少门店ID'
      };
    }
    
    // 检查门店是否存在
    const existingStore = await db.collection('stores')
      .doc(storeId)
      .get();
    
    if (!existingStore.data) {
      return {
        code: 4003,
        message: '门店不存在'
      };
    }
    
    // 软删除（修改状态为inactive）
    await db.collection('stores')
      .doc(storeId)
      .update({
        data: {
          status: 'inactive',
          updatedAt: db.serverDate()
        }
      });
    
    return {
      code: 0,
      message: '删除门店成功'
    };
  } catch (err) {
    console.error('删除门店失败:', err);
    throw err;
  }
}

// 获取门店详情
async function getStoreDetail(params) {
  try {
    const { storeId } = params;
    
    // 验证参数
    if (!storeId) {
      return {
        code: 4001,
        message: '缺少门店ID'
      };
    }
    
    // 获取门店信息
    const store = await db.collection('stores')
      .doc(storeId)
      .get();
    
    if (!store.data) {
      return {
        code: 4003,
        message: '门店不存在'
      };
    }
    
    // 获取门店关联的用户
    const users = await db.collection('users')
      .where({ storeId })
      .get();
    
    return {
      code: 0,
      data: {
        store: store.data,
        users: users.data
      },
      message: '获取门店详情成功'
    };
  } catch (err) {
    console.error('获取门店详情失败:', err);
    throw err;
  }
}
