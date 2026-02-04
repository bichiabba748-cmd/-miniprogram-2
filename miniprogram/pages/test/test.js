Page({
  data: {
    testResults: [],
    // 全部测试相关状态
    testing: false,
    currentTest: 0,
    totalTests: 0,
    currentFunction: '',
    progressPercentage: 0,
    reportReady: false,
    testReport: '',
    allTestResults: []
  },

  onLoad: function () {
    console.log('测试页面加载');
  },

  // 测试报单
  testSubmitContract: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'submitContract',
      data: {
        tenantName: '测试租客',
        tenantPhone: '13800138000',
        propertyAddress: '北京市朝阳区测试小区',
        rent: 3000,
        startDate: '2026-02-01',
        endDate: '2026-08-01',
        brokerName: '测试经纪人',
        brokerPhone: '13900139000'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('submitContract', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('submitContract', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试续租
  testSubmitRenewal: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'submitRenewal',
      data: {
        contractId: 'HY20260131001'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('submitRenewal', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('submitRenewal', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试咨询
  testSubmitConsult: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'submitConsult',
      data: {
        tenantPhone: '13800138000',
        question: '测试咨询问题，请问如何办理宽带？'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('submitConsult', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('submitConsult', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试素材上传
  testUploadMaterial: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'uploadMaterial',
      data: {
        fileID: 'cloud://test-123456.7465-test-123456/test.jpg',
        title: '测试素材',
        type: 'image',
        category: 'house_tour'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('uploadMaterial', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('uploadMaterial', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试初始化日签数据
  testInitDailyMaterials: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'init_daily_materials'
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('init_daily_materials', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('init_daily_materials', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试初始化租赁集合
  testInitRentalCollections: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'init_rental_collections'
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('init_rental_collections', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('init_rental_collections', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试初始化数据库
  testInitDB: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'init_db'
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('init_db', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('init_db', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试更新用户Schema
  testUpdateUserSchema: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'update_users_schema'
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('update_users_schema', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('update_users_schema', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试添加测试合同
  testAddTestContract: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'add_test_contract'
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('add_test_contract', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('add_test_contract', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试获取合同信息
  testGetContractInfo: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'getContractInfo',
      data: {
        contractId: 'HY20260131001'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('getContractInfo', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('getContractInfo', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试获取经纪人合同
  testGetBrokerContracts: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'getBrokerContracts',
      data: {
        brokerId: 'test_broker'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('getBrokerContracts', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('getBrokerContracts', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试获取素材列表
  testGetMaterials: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'getMaterials',
      data: {
        category: 'house_tour'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('getMaterials', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('getMaterials', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试登录
  testLogin: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'login',
      data: {
        phone: '13800138000'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('login', JSON.stringify(res.result, null, 2));
      if (res.result.success) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('login', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试管理工具
  testAdminTools: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'adminTools',
      data: {
        action: 'getStats'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('adminTools', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('adminTools', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试快速开始函数 - getOpenId
  testQuickStartGetOpenId: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-getOpenId', JSON.stringify(res.result, null, 2));
      wx.showToast({ title: '测试成功', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-getOpenId', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试快速开始函数 - getMiniProgramCode
  testQuickStartGetMiniProgramCode: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getMiniProgramCode'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-getMiniProgramCode', JSON.stringify(res.result, null, 2));
      wx.showToast({ title: '测试成功', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-getMiniProgramCode', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试快速开始函数 - createCollection
  testQuickStartCreateCollection: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'createCollection'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-createCollection', JSON.stringify(res.result, null, 2));
      wx.showToast({ title: '测试成功', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-createCollection', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试快速开始函数 - selectRecord
  testQuickStartSelectRecord: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'selectRecord'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-selectRecord', JSON.stringify(res.result, null, 2));
      wx.showToast({ title: '测试成功', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-selectRecord', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试快速开始函数 - insertRecord
  testQuickStartInsertRecord: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'insertRecord',
        data: {
          region: '测试区域',
          city: '测试城市',
          sales: 100
        }
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-insertRecord', JSON.stringify(res.result, null, 2));
      wx.showToast({ title: '测试成功', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-insertRecord', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试快速开始函数 - updateRecord
  testQuickStartUpdateRecord: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'selectRecord'
      }
    }).then(selectRes => {
      if (selectRes.result.data && selectRes.result.data.length > 0) {
        const recordId = selectRes.result.data[0]._id;
        
        return wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'updateRecord',
            data: [
              {
                _id: recordId,
                sales: 999
              }
            ]
          }
        });
      } else {
        throw new Error('没有可更新的记录');
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-updateRecord', JSON.stringify(res.result, null, 2));
      wx.showToast({ title: '测试成功', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-updateRecord', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试快速开始函数 - deleteRecord
  testQuickStartDeleteRecord: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'selectRecord'
      }
    }).then(selectRes => {
      if (selectRes.result.data && selectRes.result.data.length > 0) {
        const recordId = selectRes.result.data[0]._id;
        
        return wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'deleteRecord',
            data: {
              _id: recordId
            }
          }
        });
      } else {
        throw new Error('没有可删除的记录');
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-deleteRecord', JSON.stringify(res.result, null, 2));
      wx.showToast({ title: '测试成功', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('quickstartFunctions-deleteRecord', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 添加测试结果
  addTestResult: function (functionName, result) {
    const newResult = {
      function: functionName,
      time: new Date().toLocaleString(),
      result: result
    };
    this.setData({
      testResults: [newResult, ...this.data.testResults]
    });
  },

  // 一键全部测试
  testAllFunctions: function () {
    wx.showModal({
      title: '确认操作',
      content: '将按顺序测试所有云函数，预计需要2-3分钟时间。请确保网络连接稳定。',
      confirmText: '开始测试',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.startAllTests();
        }
      }
    });
  },

  // 开始全部测试
  startAllTests: function () {
    const testFunctions = [
      { name: 'init_daily_materials', desc: '初始化日签数据' },
      { name: 'init_rental_collections', desc: '初始化租赁集合' },
      { name: 'init_db', desc: '初始化数据库' },
      { name: 'update_users_schema', desc: '更新用户Schema' },
      { name: 'add_test_contract', desc: '添加测试合同' },
      { name: 'getContractInfo', desc: '获取合同信息', data: { contractId: 'HY20260131001' } },
      { name: 'submitRenewal', desc: '提交续租申请', data: { contractId: 'HY20260131001' } },
      { name: 'getBrokerContracts', desc: '获取经纪人合同', data: { brokerId: 'test_broker' } },
      { name: 'submitContract', desc: '报单测试', data: {
        tenantName: '测试租客',
        tenantPhone: '13800138000',
        propertyAddress: '北京市朝阳区测试小区',
        rent: 3000,
        startDate: '2026-02-01',
        endDate: '2026-08-01',
        brokerName: '测试经纪人',
        brokerPhone: '13900139000'
      } },
      { name: 'submitConsult', desc: '咨询测试', data: {
        tenantPhone: '13800138000',
        question: '测试咨询问题，请问如何办理宽带？'
      } },
      { name: 'uploadMaterial', desc: '素材上传测试', data: {
        fileID: 'cloud://test-123456.7465-test-123456/test.jpg',
        title: '测试素材',
        type: 'image',
        category: 'house_tour'
      } },
      { name: 'getMaterials', desc: '获取素材列表', data: { category: 'house_tour' } },
      { name: 'login', desc: '登录测试', data: { phone: '13800138000' } },
      { name: 'adminTools', desc: '管理工具测试', data: { action: 'getProjectStatus' } },
      { name: 'quickstartFunctions', desc: '快速开始-获取OpenID', data: { type: 'getOpenId' } },
      { name: 'quickstartFunctions', desc: '快速开始-获取小程序码', data: { type: 'getMiniProgramCode' } },
      { name: 'quickstartFunctions', desc: '快速开始-创建集合', data: { type: 'createCollection' } },
      { name: 'quickstartFunctions', desc: '快速开始-查询记录', data: { type: 'selectRecord' } },
      { name: 'quickstartFunctions', desc: '快速开始-插入记录', data: { type: 'insertRecord', data: { region: '测试区域', city: '测试城市', sales: 100 } } },
      { name: 'quickstartFunctions', desc: '快速开始-更新记录', data: { type: 'updateRecord', data: [{ _id: 'placeholder', sales: 999 }] } },
      { name: 'quickstartFunctions', desc: '快速开始-删除记录', data: { type: 'deleteRecord', data: { _id: 'placeholder' } } }
    ];

    this.setData({
      testing: true,
      currentTest: 0,
      totalTests: testFunctions.length,
      currentFunction: '准备测试环境...',
      progressPercentage: 0,
      allTestResults: [],
      reportReady: false
    });

    this.runTestSequence(testFunctions, 0);
  },

  // 运行测试序列
  runTestSequence: function (testFunctions, index) {
    if (index >= testFunctions.length) {
      // 测试完成
      this.generateReport();
      return;
    }

    const testFunc = testFunctions[index];
    const progress = ((index + 1) / testFunctions.length) * 100;

    this.setData({
      currentTest: index + 1,
      currentFunction: `测试: ${testFunc.desc}`,
      progressPercentage: progress
    });

    // 运行当前测试
    this.runTestFunction(testFunc)
      .then((result) => {
        // 添加到测试结果
        const testResult = {
          function: testFunc.name,
          desc: testFunc.desc,
          success: result.success,
          message: result.message,
          time: new Date().toLocaleString()
        };

        const allResults = this.data.allTestResults;
        allResults.push(testResult);
        this.setData({ allTestResults: allResults });

        // 延迟100ms继续下一个测试，避免请求过于密集
        setTimeout(() => {
          this.runTestSequence(testFunctions, index + 1);
        }, 100);
      })
      .catch((error) => {
        // 测试失败
        const testResult = {
          function: testFunc.name,
          desc: testFunc.desc,
          success: false,
          message: error.message || '测试失败',
          time: new Date().toLocaleString()
        };

        const allResults = this.data.allTestResults;
        allResults.push(testResult);
        this.setData({ allTestResults: allResults });

        // 继续下一个测试
        setTimeout(() => {
          this.runTestSequence(testFunctions, index + 1);
        }, 100);
      });
  },

  // 运行单个测试函数
  runTestFunction: function (testFunc) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: testFunc.name,
        data: testFunc.data || {}
      }).then(res => {
        let success = false;
        let message = '';

        if (res.result.code === 0 || res.result.success) {
          success = true;
          message = '测试成功';
        } else {
          success = false;
          message = res.result.message || '测试失败';
        }

        resolve({ success, message, result: res.result });
      }).catch(err => {
        reject(err);
      });
    });
  },

  // 生成测试报告
  generateReport: function () {
    const results = this.data.allTestResults;
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const failCount = totalCount - successCount;
    const successRate = ((successCount / totalCount) * 100).toFixed(1);

    // 生成报告
    let report = `📊 云函数测试报告\n`;
    report += `====================\n`;
    report += `测试时间: ${new Date().toLocaleString()}\n`;
    report += `测试总数: ${totalCount}个\n`;
    report += `成功数量: ${successCount}个\n`;
    report += `失败数量: ${failCount}个\n`;
    report += `成功率: ${successRate}%\n`;
    report += `====================\n\n`;

    // 详细测试结果
    report += `📋 详细测试结果\n`;
    report += `====================\n`;

    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      report += `${index + 1}. ${status} ${result.desc} (${result.function})\n`;
      report += `   状态: ${result.success ? '成功' : '失败'}\n`;
      report += `   时间: ${result.time}\n`;
      report += `   信息: ${result.message}\n\n`;
    });

    // 失败汇总
    if (failCount > 0) {
      report += `❌ 失败汇总\n`;
      report += `====================\n`;
      const failedTests = results.filter(r => !r.success);
      failedTests.forEach((test, index) => {
        report += `${index + 1}. ${test.desc} (${test.function})\n`;
        report += `   原因: ${test.message}\n\n`;
      });
    }

    this.setData({
      testing: false,
      currentFunction: '测试完成',
      progressPercentage: 100,
      testReport: report,
      reportReady: true
    });

    // 保存报告到本地文件
    this.saveReportToFile(report);

    wx.showToast({
      title: `测试完成！成功: ${successCount}, 失败: ${failCount}\n报告已保存到本地文件`,
      icon: 'success',
      duration: 3000
    });
  },

  // 保存报告到本地文件
  saveReportToFile: function (report) {
    const fileName = `test-report-${new Date().getTime()}.txt`;
    const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;

    // 保存文件
    wx.getFileSystemManager().writeFile({
      filePath: filePath,
      data: report,
      encoding: 'utf8',
      success: (res) => {
        console.log('报告保存成功:', filePath);
        // 同时保存到固定路径，方便读取
        const fixedPath = `${wx.env.USER_DATA_PATH}/latest-test-report.txt`;
        wx.getFileSystemManager().writeFile({
          filePath: fixedPath,
          data: report,
          encoding: 'utf8',
          success: (res) => {
            console.log('最新报告保存成功:', fixedPath);
          },
          fail: (err) => {
            console.error('保存最新报告失败:', err);
          }
        });
      },
      fail: (err) => {
        console.error('保存报告失败:', err);
        wx.showToast({
          title: '报告保存失败',
          icon: 'none',
          duration: 1500
        });
      }
    });
  },

  // 复制测试报告
  copyReport: function () {
    const report = this.data.testReport;
    wx.setClipboardData({
      data: report,
      success: (res) => {
        wx.showToast({
          title: '报告已复制到剪贴板',
          icon: 'success',
          duration: 1500
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '复制失败，请手动复制',
          icon: 'none',
          duration: 1500
        });
      }
    });
  },

  // 测试性能测试
  testPerformanceTest: function () {
    wx.showLoading({ title: '测试中...' });
    
    wx.cloud.callFunction({
      name: 'performanceTest',
      data: {
        testType: 'all'
      }
    }).then(res => {
      wx.hideLoading();
      this.addTestResult('performanceTest', JSON.stringify(res.result, null, 2));
      if (res.result.code === 0) {
        wx.showToast({ title: '测试成功', icon: 'success' });
      } else {
        wx.showToast({ title: '测试失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.addTestResult('performanceTest', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    });
  },

  // 测试错误处理
  testErrorHandler: function () {
    wx.showLoading({ title: '测试中...' });
    
    const errorHandler = require('../../utils/errorHandler');
    
    try {
      const error = new errorHandler.AppError(
        errorHandler.ErrorTypes.INVALID_PARAMS,
        '测试错误消息',
        { testField: 'testValue' }
      );
      
      const handled = errorHandler.handleError(error);
      
      wx.hideLoading();
      this.addTestResult('errorHandler', JSON.stringify(handled, null, 2));
      wx.showToast({ title: '测试成功', icon: 'success' });
    } catch (err) {
      wx.hideLoading();
      this.addTestResult('errorHandler', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    }
  },

  // 测试敏感信息加密
  testSecurity: function () {
    wx.showLoading({ title: '测试中...' });
    
    const security = require('../../utils/security');
    
    try {
      const phone = '13800138000';
      const idCard = '110101199001011234';
      
      const encryptedPhone = security.encryptPhone(phone);
      const encryptedIdCard = security.encryptIdCard(idCard);
      
      const decryptedPhone = security.decryptPhone(encryptedPhone);
      const decryptedIdCard = security.decryptIdCard(encryptedIdCard);
      
      const maskedPhone = security.maskPhone(phone);
      const maskedIdCard = security.maskIdCard(idCard);
      
      const result = {
        original: { phone, idCard },
        encrypted: { phone: encryptedPhone, idCard: encryptedIdCard },
        decrypted: { phone: decryptedPhone, idCard: decryptedIdCard },
        masked: { phone: maskedPhone, idCard: maskedIdCard },
        validation: {
          phoneValid: security.isValidPhone(phone),
          idCardValid: security.isValidIdCard(idCard)
        }
      };
      
      wx.hideLoading();
      this.addTestResult('security', JSON.stringify(result, null, 2));
      wx.showToast({ title: '测试成功', icon: 'success' });
    } catch (err) {
      wx.hideLoading();
      this.addTestResult('security', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    }
  },

  // 测试日志记录
  testLogger: function () {
    wx.showLoading({ title: '测试中...' });
    
    const logger = require('../../utils/logger');
    
    try {
      const log = logger.createLogger({ test: 'testLogger' });
      
      log.debug('这是调试日志', { data: 'test' });
      log.info('这是信息日志', { data: 'test' });
      log.warn('这是警告日志', { data: 'test' });
      log.error('这是错误日志', new Error('测试错误'), { data: 'test' });
      
      wx.hideLoading();
      this.addTestResult('logger', '日志记录成功，请查看数据库logs集合');
      wx.showToast({ title: '测试成功', icon: 'success' });
    } catch (err) {
      wx.hideLoading();
      this.addTestResult('logger', '错误: ' + JSON.stringify(err, null, 2));
      wx.showToast({ title: '测试失败', icon: 'none' });
    }
  }
});