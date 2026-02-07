// uploadMaterial 云函数 - 处理素材上传
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 权限校验函数
async function checkPermission(openid) {
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
    
    console.log('权限校验 - 用户角色:', userRole);
    
    // 定义允许上传素材的角色
    const allowedRoles = ['admin', 'broker', 'anchor', 'student'];
    
    if (allowedRoles.includes(userRole)) {
      return {
        allowed: true,
        reason: '角色权限匹配'
      };
    } else {
      return {
        allowed: false,
        reason: `需要以下角色之一: ${allowedRoles.join(', ')}`
      };
    }
  } catch (error) {
    console.error('权限校验失败:', error);
    return {
      allowed: false,
      reason: '权限校验异常'
    };
  }
}

exports.main = async (event, context) => {
  try {
    const { fileID, type, category, title } = event;
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    
    console.log('uploadMaterial 云函数调用 - 用户:', openid);
    
    // 权限校验
    const permissionResult = await checkPermission(openid);
    if (!permissionResult.allowed) {
      console.warn('uploadMaterial 权限验证失败 - 用户:', openid, '原因:', permissionResult.reason);
      return {
        code: 1002,
        message: '权限不足',
        reason: permissionResult.reason
      };
    }
    
    // 验证参数
    if (!fileID || !type || !category || !title) {
      return {
        code: 1001,
        message: '参数错误：缺少文件ID、类型、分类或标题'
      };
    }
    
    // 验证类型和分类
    const validTypes = ['image', 'video', 'document'];
    const validCategories = ['house_tour', 'community', 'nearby'];
    
    if (!validTypes.includes(type)) {
      return {
        code: 1001,
        message: '参数错误：无效的素材类型'
      };
    }
    
    if (!validCategories.includes(category)) {
      return {
        code: 1001,
        message: '参数错误：无效的素材分类'
      };
    }

    // 内容安全检测
    try {
      // 1. 检测标题
      const textCheckResult = await cloud.callFunction({
        name: 'msgSecCheck',
        data: {
          type: 'text',
          content: title
        }
      });
      if (textCheckResult.result.code !== 0) {
        return {
          code: 87014,
          message: '标题包含违规内容'
        };
      }

      // 2. 检测图片 (如果是图片类型)
      if (type === 'image') {
        const imgCheckResult = await cloud.callFunction({
          name: 'msgSecCheck',
          data: {
            type: 'image',
            fileID: fileID
          }
        });
        if (imgCheckResult.result.code !== 0) {
          return {
            code: 87014,
            message: '图片包含违规内容'
          };
        }
      }
    } catch (err) {
      console.error('内容安全检测失败:', err);
      return {
        code: 5001,
        message: '内容安全检测服务异常'
      };
    }
    
    // 创建素材记录
    const material = await db.collection('materials')
      .add({
        type: type,
        category: category,
        fileUrl: fileID,
        title: title,
        uploadBy: openid,
        createTime: db.serverDate()
      });
    
    return {
      code: 0,
      message: '素材上传成功',
      data: {
        materialId: material._id,
        fileUrl: fileID,
        title: title
      }
    };
  } catch (err) {
    console.error('素材上传失败:', err);
    return {
      code: 5000,
      message: '服务器内部错误'
    };
  }
};