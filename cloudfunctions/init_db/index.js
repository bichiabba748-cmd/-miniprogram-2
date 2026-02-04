// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 创建集合（如果不存在）
const createCollectionIfNotExists = async (collectionName) => {
  try {
    await db.createCollection(collectionName);
    console.log(`✅ 集合 ${collectionName} 创建成功`);
    return { success: true, created: true };
  } catch (e) {
    // 集合已存在，这是正常的
    if (e.errCode === -1 || e.errCode === -501001 || e.message.includes('Table exist') || e.message.includes('Collection exist')) {
      console.log(`ℹ️ 集合 ${collectionName} 已存在`);
      return { success: true, created: false };
    }
    throw e;
  }
};

// 检查集合是否为空
const isCollectionEmpty = async (collectionName) => {
  try {
    const result = await db.collection(collectionName).limit(1).get();
    return result.data.length === 0;
  } catch (e) {
    // 如果集合不存在或出错，视为空
    return true;
  }
};

// 初始化用户数据
const initUsers = async () => {
  const isEmpty = await isCollectionEmpty('users');
  if (!isEmpty) {
    console.log('ℹ️ users 集合已有数据，跳过初始化');
    return { success: true, skipped: true };
  }

  const users = [
    {
      _openid: 'admin_test_openid_001',
      role: 'admin',
      password: '123456',
      stats: {
        totalLeads: 0,
        studyProgress: 0
      },
      medals: [],
      storeId: null,
      createdAt: db.serverDate()
    },
    {
      _openid: 'anchor_test_openid_002',
      role: 'anchor',
      stats: {
        totalLeads: 0,
        studyProgress: 0
      },
      medals: [],
      storeId: null,
      createdAt: db.serverDate()
    }
  ];

  try {
    for (const user of users) {
      await db.collection('users').add({ data: user });
    }
    console.log('✅ 用户数据初始化成功');
    return { success: true, count: users.length };
  } catch (e) {
    console.error('❌ 用户数据初始化失败:', e);
    throw e;
  }
};

// 初始化课程数据
const initCourses = async () => {
  const isEmpty = await isCollectionEmpty('courses');
  if (!isEmpty) {
    console.log('ℹ️ courses 集合已有数据，跳过初始化');
    return { success: true, skipped: true };
  }

  const courses = [
    {
      title: '剪映实操：3分钟剪出探盘大片',
      category: 'editing',
      mediaType: 'link',
      url: 'https://example.com/course/jianying-tutorial',
      relatedArticleId: null,
      createdAt: db.serverDate()
    },
    {
      title: 'AI赋能：DeepSeek 写脚本教程',
      category: 'ai',
      mediaType: 'link',
      url: 'https://example.com/course/deepseek-script',
      relatedArticleId: null,
      createdAt: db.serverDate()
    },
    {
      title: '资质认证：房产号直播开通指南',
      category: 'setup',
      mediaType: 'link',
      url: 'https://example.com/course/live-setup',
      relatedArticleId: null,
      createdAt: db.serverDate()
    }
  ];

  try {
    for (const course of courses) {
      await db.collection('courses').add({ data: course });
    }
    console.log('✅ 课程数据初始化成功');
    return { success: true, count: courses.length };
  } catch (e) {
    console.error('❌ 课程数据初始化失败:', e);
    throw e;
  }
};

// 初始化文章数据
const initArticles = async () => {
  const isEmpty = await isCollectionEmpty('articles');
  if (!isEmpty) {
    console.log('ℹ️ articles 集合已有数据，跳过初始化');
    return { success: true, skipped: true };
  }

  const articles = [
    {
      title: '2026天津学区地图高清版',
      category: 'avoid',
      baitType: 'image',
      securityLevel: 'public',
      createdAt: db.serverDate()
    },
    {
      title: '和平区购房避坑指南',
      category: 'avoid',
      baitType: 'pdf',
      securityLevel: 'public',
      createdAt: db.serverDate()
    }
  ];

  try {
    for (const article of articles) {
      await db.collection('articles').add({ data: article });
    }
    console.log('✅ 文章数据初始化成功');
    return { success: true, count: articles.length };
  } catch (e) {
    console.error('❌ 文章数据初始化失败:', e);
    throw e;
  }
};

// 初始化战报数据
const initReports = async () => {
  const isEmpty = await isCollectionEmpty('reports');
  if (!isEmpty) {
    console.log('ℹ️ reports 集合已有数据，跳过初始化');
    return { success: true, skipped: true };
  }

  const reports = [
    {
      reporterId: 'anchor_test_openid_002',
      type: 'leads',
      count: 15,
      status: 'pending',
      createdAt: db.serverDate()
    },
    {
      reporterId: 'anchor_test_openid_002',
      type: 'showings',
      count: 3,
      status: 'pending',
      createdAt: db.serverDate()
    }
  ];

  try {
    for (const report of reports) {
      await db.collection('reports').add({ data: report });
    }
    console.log('✅ 战报数据初始化成功');
    return { success: true, count: reports.length };
  } catch (e) {
    console.error('❌ 战报数据初始化失败:', e);
    throw e;
  }
};

// 初始化入伍申请数据
const initApplications = async () => {
  const isEmpty = await isCollectionEmpty('applications');
  if (!isEmpty) {
    console.log('ℹ️ applications 集合已有数据，跳过初始化');
    return { success: true, skipped: true };
  }

  const applications = [
    {
      _openid: 'applicant_test_openid_003',
      name: '张小明',
      phone: '138****1234',
      identity: '经纪人(有经验)',
      painPoints: ['缺客流', '没素材'],
      status: 'pending',
      createdAt: db.serverDate(),
      updateTime: db.serverDate()
    },
    {
      _openid: 'applicant_test_openid_004',
      name: '李小红',
      phone: '139****5678',
      identity: '经纪人(无经验)',
      painPoints: ['不会播'],
      status: 'pending',
      createdAt: db.serverDate(),
      updateTime: db.serverDate()
    },
    {
      _openid: 'applicant_test_openid_005',
      name: '王大伟',
      phone: '137****9012',
      identity: '主播(有经验)',
      painPoints: ['缺素材', '不会剪辑'],
      status: 'pending',
      createdAt: db.serverDate(),
      updateTime: db.serverDate()
    },
    {
      _openid: 'applicant_test_openid_006',
      name: '赵小丽',
      phone: '136****3456',
      identity: '学员(无经验)',
      painPoints: ['不知道怎么开始'],
      status: 'pending',
      createdAt: db.serverDate(),
      updateTime: db.serverDate()
    }
  ];

  try {
    for (const application of applications) {
      await db.collection('applications').add({ data: application });
    }
    console.log('✅ 入伍申请数据初始化成功');
    return { success: true, count: applications.length };
  } catch (e) {
    console.error('❌ 入伍申请数据初始化失败:', e);
    throw e;
  }
};

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('🚀 开始初始化数据库...');

  try {
    // 1. 创建所有集合
    console.log('\n📦 步骤1: 创建集合');
    const collections = [
      'users',
      'articles',
      'courses',
      'applications',
      'clients',
      'reports',
      'system_config',
      'stores'
    ];
    
    const collectionResults = {};
    for (const collectionName of collections) {
      const result = await createCollectionIfNotExists(collectionName);
      collectionResults[collectionName] = result;
    }

    // 2. 初始化用户数据
    console.log('\n👥 步骤2: 初始化用户数据');
    const userResult = await initUsers();

    // 3. 初始化课程数据
    console.log('\n📚 步骤3: 初始化课程数据');
    const courseResult = await initCourses();

    // 4. 初始化文章数据
    console.log('\n📄 步骤4: 初始化文章数据');
    const articleResult = await initArticles();

    // 5. 初始化战报数据
    console.log('\n📢 步骤5: 初始化战报数据');
    try {
      const reportResult = await initReports();
      console.log('战报数据初始化结果:', reportResult);
    } catch (error) {
      console.error('战报数据初始化失败:', error);
    }

    // 6. 初始化入伍申请数据
    console.log('\n🎖️ 步骤6: 初始化入伍申请数据');
    try {
      const applicationResult = await initApplications();
      console.log('入伍申请数据初始化结果:', applicationResult);
    } catch (error) {
      console.error('入伍申请数据初始化失败:', error);
    }

    return {
      success: true,
      message: '数据库初始化完成',
      results: {
        collections: collectionResults,
        users: userResult,
        courses: courseResult,
        articles: articleResult
      }
    };
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    return {
      success: false,
      error: error.message,
      errCode: error.errCode
    };
  }
};