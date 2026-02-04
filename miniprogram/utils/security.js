/**
 * 安全工具模块
 * 用于处理敏感信息的加密和解密
 */

/**
 * 加密手机号
 * @param {string} phone - 原始手机号
 * @returns {string} 加密后的手机号
 */
function encryptPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return phone;
  }
  
  // 简单的加密算法：将手机号转换为数字数组，然后进行位移
  let encrypted = '';
  for (let i = 0; i < phone.length; i++) {
    const char = phone[i];
    if (!isNaN(char)) {
      // 数字字符进行位移
      let num = parseInt(char);
      num = (num + 5) % 10;
      encrypted += num.toString();
    } else {
      // 非数字字符保持不变
      encrypted += char;
    }
  }
  
  return encrypted;
}

/**
 * 解密手机号
 * @param {string} encryptedPhone - 加密后的手机号
 * @returns {string} 解密后的手机号
 */
function decryptPhone(encryptedPhone) {
  if (!encryptedPhone || typeof encryptedPhone !== 'string') {
    return encryptedPhone;
  }
  
  // 解密算法：将加密后的手机号转换为数字数组，然后进行反向位移
  let decrypted = '';
  for (let i = 0; i < encryptedPhone.length; i++) {
    const char = encryptedPhone[i];
    if (!isNaN(char)) {
      // 数字字符进行反向位移
      let num = parseInt(char);
      num = (num - 5 + 10) % 10;
      decrypted += num.toString();
    } else {
      // 非数字字符保持不变
      decrypted += char;
    }
  }
  
  return decrypted;
}

/**
 * 隐藏手机号中间四位
 * @param {string} phone - 原始手机号
 * @returns {string} 隐藏后的手机号
 */
function maskPhone(phone) {
  if (!phone || typeof phone !== 'string' || phone.length < 11) {
    return phone;
  }
  
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 加密身份证号
 * @param {string} idCard - 原始身份证号
 * @returns {string} 加密后的身份证号
 */
function encryptIdCard(idCard) {
  if (!idCard || typeof idCard !== 'string') {
    return idCard;
  }
  
  // 简单的加密算法：将身份证号转换为字符数组，然后进行位移
  let encrypted = '';
  for (let i = 0; i < idCard.length; i++) {
    const char = idCard[i];
    if (!isNaN(char)) {
      // 数字字符进行位移
      let num = parseInt(char);
      num = (num + 7) % 10;
      encrypted += num.toString();
    } else {
      // 字母字符进行位移
      let code = char.charCodeAt(0);
      code = (code + 10) % 26;
      if (char >= 'A' && char <= 'Z') {
        encrypted += String.fromCharCode(code + 65);
      } else if (char >= 'a' && char <= 'z') {
        encrypted += String.fromCharCode(code + 97);
      } else {
        encrypted += char;
      }
    }
  }
  
  return encrypted;
}

/**
 * 解密身份证号
 * @param {string} encryptedIdCard - 加密后的身份证号
 * @returns {string} 解密后的身份证号
 */
function decryptIdCard(encryptedIdCard) {
  if (!encryptedIdCard || typeof encryptedIdCard !== 'string') {
    return encryptedIdCard;
  }
  
  // 解密算法：将加密后的身份证号转换为字符数组，然后进行反向位移
  let decrypted = '';
  for (let i = 0; i < encryptedIdCard.length; i++) {
    const char = encryptedIdCard[i];
    if (!isNaN(char)) {
      // 数字字符进行反向位移
      let num = parseInt(char);
      num = (num - 7 + 10) % 10;
      decrypted += num.toString();
    } else {
      // 字母字符进行反向位移
      let code = char.charCodeAt(0);
      if (char >= 'A' && char <= 'Z') {
        code = (code - 65 - 10 + 26) % 26;
        decrypted += String.fromCharCode(code + 65);
      } else if (char >= 'a' && char <= 'z') {
        code = (code - 97 - 10 + 26) % 26;
        decrypted += String.fromCharCode(code + 97);
      } else {
        decrypted += char;
      }
    }
  }
  
  return decrypted;
}

/**
 * 隐藏身份证号中间部分
 * @param {string} idCard - 原始身份证号
 * @returns {string} 隐藏后的身份证号
 */
function maskIdCard(idCard) {
  if (!idCard || typeof idCard !== 'string' || idCard.length < 15) {
    return idCard;
  }
  
  return idCard.replace(/(\d{6})\d{8,10}(\d{4})/, '$1********$2');
}

/**
 * 生成随机加密密钥
 * @returns {string} 随机密钥
 */
function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 16; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/**
 * 加密敏感信息
 * @param {string} data - 原始数据
 * @param {string} key - 加密密钥
 * @returns {string} 加密后的数据
 */
function encryptData(data, key) {
  if (!data || typeof data !== 'string') {
    return data;
  }
  
  if (!key || typeof key !== 'string') {
    key = 'default_key';
  }
  
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    const dataChar = data.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    const encryptedChar = dataChar ^ keyChar;
    encrypted += String.fromCharCode(encryptedChar);
  }
  
  // 转换为Base64编码，方便存储
  return btoa(encrypted);
}

/**
 * 解密敏感信息
 * @param {string} encryptedData - 加密后的数据
 * @param {string} key - 加密密钥
 * @returns {string} 解密后的数据
 */
function decryptData(encryptedData, key) {
  if (!encryptedData || typeof encryptedData !== 'string') {
    return encryptedData;
  }
  
  if (!key || typeof key !== 'string') {
    key = 'default_key';
  }
  
  try {
    // 从Base64编码解码
    const encrypted = atob(encryptedData);
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
      const encryptedChar = encrypted.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const decryptedChar = encryptedChar ^ keyChar;
      decrypted += String.fromCharCode(decryptedChar);
    }
    
    return decrypted;
  } catch (error) {
    console.error('解密失败:', error);
    return encryptedData;
  }
}

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean} 是否为有效手机号
 */
function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证身份证号格式
 * @param {string} idCard - 身份证号
 * @returns {boolean} 是否为有效身份证号
 */
function isValidIdCard(idCard) {
  if (!idCard || typeof idCard !== 'string') {
    return false;
  }
  
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return idCardRegex.test(idCard);
}

// 导出模块
module.exports = {
  encryptPhone,
  decryptPhone,
  maskPhone,
  encryptIdCard,
  decryptIdCard,
  maskIdCard,
  generateKey,
  encryptData,
  decryptData,
  isValidPhone,
  isValidIdCard
};