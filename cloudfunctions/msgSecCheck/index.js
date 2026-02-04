// msgSecCheck 云函数
// 内容安全检测，防止违规内容

const cloud = require('wx-server-sdk');

// 初始化云环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 主函数
exports.main = async (event, context) => {
  const { type, content, fileID } = event;
  
  try {
    switch (type) {
      case 'text':
        return await checkTextContent(content);
      case 'image':
        return await checkImageContent(fileID);
      default:
        return {
          code: 1001,
          message: '未知检测类型'
        };
    }
  } catch (error) {
    console.error('msgSecCheck 云函数错误:', error);
    return {
      code: 5000,
      message: '检测失败',
      error: error.message
    };
  }
};

/**
 * 检测文本内容
 * @param {string} content - 待检测的文本内容
 * @returns {Promise<Object>} 检测结果
 */
async function checkTextContent(content) {
  try {
    if (!content || typeof content !== 'string') {
      return {
        code: 1002,
        message: '文本内容不能为空'
      };
    }
    
    // 调用云开发文本内容安全检测
    const result = await cloud.openapi.security.msgSecCheck({
      content: content
    });
    
    if (result.errCode === 0) {
      // 检测通过
      return {
        code: 0,
        data: {
          passed: true,
          suggestion: '通过'
        }
      };
    } else {
      // 检测不通过
      return {
        code: 2001,
        data: {
          passed: false,
          suggestion: '不通过',
          errCode: result.errCode,
          errMsg: result.errMsg
        }
      };
    }
  } catch (error) {
    console.error('文本检测失败:', error);
    throw error;
  }
}

/**
 * 检测图片内容
 * @param {string} fileID - 待检测的图片文件ID
 * @returns {Promise<Object>} 检测结果
 */
async function checkImageContent(fileID) {
  try {
    if (!fileID) {
      return {
        code: 1003,
        message: '图片文件ID不能为空'
      };
    }
    
    // 调用云开发图片内容安全检测
    const result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image',
        value: await cloud.downloadFile({ fileID }).then(res => res.fileContent)
      }
    });
    
    if (result.errCode === 0) {
      // 检测通过
      return {
        code: 0,
        data: {
          passed: true,
          suggestion: '通过'
        }
      };
    } else {
      // 检测不通过
      return {
        code: 2002,
        data: {
          passed: false,
          suggestion: '不通过',
          errCode: result.errCode,
          errMsg: result.errMsg
        }
      };
    }
  } catch (error) {
    console.error('图片检测失败:', error);
    throw error;
  }
}
