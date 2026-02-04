/**
 * 图片映射工具
 * 将本地图片路径映射为网络图片URL
 */

const imageMapping = {
  // TabBar 图标
  'images/icons/home.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20home%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/icons/home-active.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20home%20icon%20in%20gold%20color%20scheme%20with%20glow%20effect&image_size=square',
  'images/icons/goods.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20goods%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/icons/goods-active.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20goods%20icon%20in%20gold%20color%20scheme%20with%20glow%20effect&image_size=square',
  'images/icons/examples.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20examples%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/icons/examples-active.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20examples%20icon%20in%20gold%20color%20scheme%20with%20glow%20effect&image_size=square',
  'images/icons/business.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20business%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/icons/business-active.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20business%20icon%20in%20gold%20color%20scheme%20with%20glow%20effect&image_size=square',
  'images/icons/usercenter.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20user%20center%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/icons/usercenter-active.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20user%20center%20icon%20in%20gold%20color%20scheme%20with%20glow%20effect&image_size=square',
  
  // 租客模块图标
  'images/icons/tenant/contract.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20contract%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/icons/tenant/service.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20service%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/icons/tenant/life.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20life%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/icons/tenant/utilities.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20utilities%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/icons/tenant/building.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20building%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/icons/tenant/wifi.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20wifi%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  
  // 头像图标
  'images/icons/avatars/top1.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20real%20estate%20agent%20avatar%20portrait%20in%20business%20attire%20with%20confident%20expression&image_size=square',
  'images/icons/avatars/top2.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20real%20estate%20agent%20avatar%20portrait%20in%20business%20attire%20with%20smile&image_size=square',
  'images/icons/avatars/top3.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20male%20real%20estate%20agent%20avatar%20portrait%20in%20business%20suit&image_size=square',
  'images/icons/avatars/top4.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20real%20estate%20agent%20avatar%20portrait%20in%20modern%20business%20attire&image_size=square',
  'images/icons/avatars/top5.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20real%20estate%20agent%20avatar%20portrait%20with%20confident%20pose&image_size=square',
  
  // 其他图标
  'images/icons/close.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20close%20icon%20in%20black%20color&image_size=square',
  'images/icons/copy.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20copy%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/icons/avatar.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20user%20avatar%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  
  // 示例图片
  'images/avatar.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20real%20estate%20agent%20profile%20photo%20in%20business%20attire&image_size=square',
  'images/ai_example1.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20real%20estate%20marketing%20materials%20with%20black%20and%20gold%20theme&image_size=landscape_16_9',
  'images/ai_example2.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20real%20estate%20brochure%20design%20with%20black%20and%20gold%20color%20scheme&image_size=landscape_16_9',
  'images/default-goods-image.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20real%20estate%20property%20image%20placeholder%20with%20black%20and%20gold%20frame&image_size=square',
  
  // 云开发示例图片
  'images/cloud_dev.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20cloud%20computing%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/database.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20database%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/database_add.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20database%20add%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/scf-enter.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20serverless%20function%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/function_deploy.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20function%20deployment%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/create_cbr.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20code%20repository%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/create_cbrf.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20cloud%20function%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/create_env.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20environment%20creation%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square',
  'images/env-select.png': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20environment%20selection%20icon%20in%20black%20and%20gold%20color%20scheme&image_size=square'
};

/**
 * 获取网络图片URL
 * @param {string} localPath - 本地图片路径
 * @returns {string} 网络图片URL
 */
function getNetworkImage(localPath) {
  return imageMapping[localPath] || localPath;
}

/**
 * 替换所有本地图片为网络图片
 * @param {string} content - 包含本地图片路径的内容
 * @returns {string} 替换后的内容
 */
function replaceLocalImages(content) {
  let result = content;
  
  Object.keys(imageMapping).forEach(localPath => {
    const networkUrl = imageMapping[localPath];
    const regex = new RegExp(localPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, networkUrl);
  });
  
  return result;
}

module.exports = {
  imageMapping,
  getNetworkImage,
  replaceLocalImages
};
