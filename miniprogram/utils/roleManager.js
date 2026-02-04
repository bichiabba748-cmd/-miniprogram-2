/**
 * 角色管理器
 * 负责处理用户角色的权限控制和相关逻辑
 */

// 角色列表
const ROLES = {
  // 1. 默认访客
  visitor: {
    name: '外部访客',
    code: 'visitor',
    desc: '未加入星火计划',
    color: '#999999'
  },
  // 2. 认证学员
  student: {
    name: '星火学员',
    code: 'student',
    desc: '已加入星火计划',
    color: '#ff9a00'
  },
  // 3. C端客户
  customer: {
    name: 'C端客户',
    code: 'customer',
    desc: '购房意向客户',
    color: '#07c160'
  },
  // 4. 实战主播 (B端核心)
  anchor: {
    name: '实战主播',
    code: 'anchor',
    desc: '内部作战人员',
    color: '#D4B083'
  },
  // 5. 内部经纪人 (B端核心，按业务类型分化)
  broker: {
    name: '内部经纪人',
    code: 'broker',
    desc: '内部作战人员',
    color: '#D4B083'
  },
  // 6. 管理员 (上帝视角)
  admin: {
    name: '管理员',
    code: 'admin',
    desc: '最高权限指挥官',
    color: '#ff0000'
  },
  
  // 7. 租客 (租赁业务)
  tenant: {
    name: '租客',
    code: 'tenant',
    desc: '已签约租客',
    color: '#00a8ff'
  }
};

// 经纪人业务类型枚举（broker角色的细分）
const BUSINESS_TYPES = {
  rental: {
    name: '租赁经纪人',
    code: 'rental',
    desc: '租赁业务经纪人'
  },
  trading: {
    name: '二手房经纪人',
    code: 'trading',
    desc: '二手房业务经纪人'
  },
  new_house: {
    name: '新房经纪人',
    code: 'new_house',
    desc: '新房业务经纪人'
  }
};

// 权限控制矩阵
const PERMISSIONS = {
  // 页面访问权限
  PAGES: {
    home: ['visitor', 'student', 'anchor', 'broker', 'customer', 'tenant', 'admin'],
    art: ['student', 'anchor', 'broker', 'admin'],
    profile: ['student', 'anchor', 'broker', 'admin'],
    admin: ['admin'],
    course: ['student', 'anchor', 'broker', 'admin'],
    join: ['visitor', 'customer'],
    crm: ['broker', 'admin'],
    'broker-rental': ['broker', 'admin'],
    tenant: ['tenant']
  },
  
  // 功能权限
  FEATURES: {
    submitLead: ['anchor', 'broker', 'admin'],
    viewSecret: ['anchor', 'broker', 'admin'],
    manageUsers: ['admin'],
    createArticle: ['anchor', 'admin'],
    reviewApplication: ['admin'],
    assignClue: ['admin'],
    updateSystemConfig: ['admin']
  },
  
  // 云函数权限
  FUNCTIONS: {
    login: ['visitor', 'student', 'anchor', 'broker', 'customer', 'tenant', 'admin'],
    init_db: ['admin'],
    adminTools: ['admin'],
    submitContract: ['broker', 'admin'],
    getBrokerContracts: ['broker', 'admin'],
    uploadMaterial: ['broker', 'admin'],
    getMaterials: ['broker', 'admin'],
    submitRenewal: ['tenant'],
    getContractInfo: ['tenant', 'broker', 'admin'],
    submit_application: ['visitor', 'customer'],
    adminReviewApplication: ['admin'],
    getArticles: ['student', 'anchor', 'broker', 'admin'],
    getLeaderboard: ['student', 'anchor', 'broker', 'admin'],
    getProfileData: ['student', 'anchor', 'broker', 'admin'],
    getAdminDashboard: ['admin']
  },
  
  // 看板权限：只有内部战斗序列可看
  canViewStats: ['student', 'anchor', 'broker', 'admin'], 
  
  // 提报权限：只有实战人员可提报 (学员不可)
  canSubmitReport: ['anchor', 'broker', 'admin'], 
  
  // 文案权限
  canViewArtTitle: ['visitor', 'student', 'customer', 'anchor', 'broker', 'admin'], // 所有人看标题
  canViewArtContent: ['student', 'anchor', 'broker', 'admin'], // 只有学员/内部可看内容
  canCopyArt: ['student', 'anchor', 'broker', 'admin'], // 复制权限
  canContributeArt: ['anchor', 'broker', 'admin'], // 贡献脚本
  canViewArtDetail: ['student', 'anchor', 'broker', 'admin'], // 查看详情权限
  canCollectArt: ['student', 'anchor', 'broker', 'admin'], // 收藏权限
  
  // 课程权限
  canViewCourseList: ['visitor', 'student', 'anchor', 'broker', 'admin'],
  canViewFullCourse: ['student', 'anchor', 'broker', 'admin'],
  
  // 龙虎榜权限
  canViewRank: ['anchor', 'broker', 'admin'],
  
  // C端功能
  canViewBuilding: ['customer', 'anchor', 'broker', 'admin'], // 看楼盘
  canUseCalculator: ['customer', 'anchor', 'broker', 'admin'], // 算税费
  
  // 租客权限
  canViewContract: ['tenant', 'admin'], // 查看合同
  canApplyRenewal: ['tenant', 'admin'], // 申请续租
  canViewUtilities: ['tenant', 'admin'], // 查看水电信息
  canContactBroker: ['tenant', 'admin'], // 联系经纪人
  
  // 租赁经纪人专属权限
  canManageRentalContract: ['broker', 'admin'], // 管理租赁合同
  canSubmitRentalContract: ['broker', 'admin'], // 提报租赁合同
  canVerifyRentalClient: ['broker', 'admin'], // 核验租赁客户
  canUploadRentalMaterial: ['broker', 'admin'], // 上传租赁素材
  canViewRentalLeaderboard: ['broker', 'admin'] // 查看租赁排行榜
};

class RoleManager {
  // 获取当前身份代码
  static getCurrentRole() {
    try {
      return wx.getStorageSync('currentRole') || wx.getStorageSync('userRole') || 'visitor';
    } catch (e) {
      return 'visitor';
    }
  }
  
  // 切换身份 (用于登录/变身)
  static setRole(roleCode) {
    if (!ROLES[roleCode]) {
      console.error('非法角色代码:', roleCode);
      return false;
    }
    wx.setStorageSync('userRole', roleCode);
    wx.setStorageSync('currentRole', roleCode);
    return true;
  }
  
  // 获取业务类型
  static getBusinessType() {
    return wx.getStorageSync('businessType') || null;
  }
  
  // 设置业务类型
  static setBusinessType(businessType) {
    if (!BUSINESS_TYPES[businessType]) {
      console.error('非法业务类型:', businessType);
      return false;
    }
    wx.setStorageSync('businessType', businessType);
    return true;
  }
  
  // 获取业务类型详情
  static getBusinessTypeInfo(businessType) {
    businessType = businessType || this.getBusinessType();
    return BUSINESS_TYPES[businessType] || null;
  }
  
  // 判断是否为特定业务类型的经纪人
  static isBrokerType(businessType) {
    const currentRole = this.getCurrentRole();
    const currentBusinessType = this.getBusinessType();
    return currentRole === 'broker' && currentBusinessType === businessType;
  }
  
  // 获取角色详情对象
  static getRoleInfo(roleCode) {
    roleCode = roleCode || this.getCurrentRole();
    return ROLES[roleCode] || ROLES['visitor'];
  }
  
  // 核心判定：是否有某项权限
  static hasPermission(permissionKey) {
    const currentRole = this.getCurrentRole();
    const allowedRoles = PERMISSIONS[permissionKey] || [];
    // 自动容错：如果忘记配置admin，默认admin拥有所有权限
    if (currentRole === 'admin') return true; 
    return allowedRoles.includes(currentRole);
  }
  
  // 获取展示名称
  static getRoleDisplayText() {
    const role = this.getCurrentRole();
    const roleInfo = ROLES[role];
    return roleInfo ? roleInfo.name : '未知身份';
  }
  
  // 检查用户是否有页面访问权限
  static hasPageAccess(page) {
    const role = this.getCurrentRole();
    const allowedRoles = PERMISSIONS.PAGES[page];
    return allowedRoles ? allowedRoles.includes(role) : false;
  }
  
  // 检查用户是否有功能权限
  static hasFeatureAccess(feature) {
    const role = this.getCurrentRole();
    const allowedRoles = PERMISSIONS.FEATURES[feature];
    return allowedRoles ? allowedRoles.includes(role) : false;
  }
  
  // 检查用户是否有云函数调用权限
  static hasFunctionAccess(funcName) {
    const role = this.getCurrentRole();
    const allowedRoles = PERMISSIONS.FUNCTIONS[funcName];
    return allowedRoles ? allowedRoles.includes(role) : false;
  }
  
  // 获取角色的权限列表
  static getRolePermissions(role) {
    role = role || this.getCurrentRole();
    const permissions = {
      pages: [],
      features: [],
      functions: []
    };
    
    // 检查页面权限
    for (const page in PERMISSIONS.PAGES) {
      if (PERMISSIONS.PAGES[page].includes(role)) {
        permissions.pages.push(page);
      }
    }
    
    // 检查功能权限
    for (const feature in PERMISSIONS.FEATURES) {
      if (PERMISSIONS.FEATURES[feature].includes(role)) {
        permissions.features.push(feature);
      }
    }
    
    // 检查云函数权限
    for (const func in PERMISSIONS.FUNCTIONS) {
      if (PERMISSIONS.FUNCTIONS[func].includes(role)) {
        permissions.functions.push(func);
      }
    }
    
    return permissions;
  }
  
  // 检查用户角色是否有效
  static isValidRole(role) {
    return Object.keys(ROLES).includes(role);
  }
  
  // 获取角色的优先级（数字越小，优先级越高）
  static getRolePriority(role) {
    const priorityMap = {
      admin: 1,
      broker: 2,
      anchor: 3,
      student: 4,
      tenant: 5,
      customer: 6,
      visitor: 7
    };
    
    return priorityMap[role] || 7;
  }
  
  // 比较两个角色的权限等级
  static compareRoles(role1, role2) {
    const priority1 = this.getRolePriority(role1);
    const priority2 = this.getRolePriority(role2);
    
    if (priority1 < priority2) {
      return 1;
    } else if (priority1 > priority2) {
      return -1;
    } else {
      return 0;
    }
  }
}

module.exports = {
  RoleManager,
  ROLES,
  BUSINESS_TYPES,
  PERMISSIONS
};
