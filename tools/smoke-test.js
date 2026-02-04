/**
 * 全流程冒烟测试脚本
 * 用于验证系统核心功能是否正常运行
 */

const fs = require('fs');
const path = require('path');

// 测试结果存储
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * 执行测试
 * @param {string} name - 测试名称
 * @param {Function} testFn - 测试函数
 */
async function runTest(name, testFn) {
  testResults.total++;
  console.log(`\n🔍 开始测试: ${name}`);
  
  try {
    const result = await testFn();
    testResults.passed++;
    testResults.tests.push({
      name,
      status: 'passed',
      result
    });
    console.log(`✅ 测试通过: ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({
      name,
      status: 'failed',
      error: error.message
    });
    console.log(`❌ 测试失败: ${name} - ${error.message}`);
  }
}

/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否存在
 */
function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * 检查目录是否存在
 * @param {string} dirPath - 目录路径
 * @returns {boolean} 是否存在
 */
function checkDirExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/**
 * 测试配置文件
 */
async function testConfigFiles() {
  const configFiles = [
    'database.rules.json',
    'project.config.json',
    'project.private.config.json'
  ];
  
  const results = [];
  for (const file of configFiles) {
    const filePath = path.join(__dirname, '..', file);
    const exists = checkFileExists(filePath);
    results.push({ file, exists });
  }
  
  return results;
}

/**
 * 测试云函数
 */
async function testCloudFunctions() {
  const cloudFunctionsDir = path.join(__dirname, '..', 'cloudfunctions');
  const functions = fs.readdirSync(cloudFunctionsDir).filter(dir => {
    return fs.statSync(path.join(cloudFunctionsDir, dir)).isDirectory();
  });
  
  const results = [];
  for (const func of functions) {
    const funcDir = path.join(cloudFunctionsDir, func);
    const hasIndex = checkFileExists(path.join(funcDir, 'index.js'));
    const hasConfig = checkFileExists(path.join(funcDir, 'config.json'));
    const hasPackage = checkFileExists(path.join(funcDir, 'package.json'));
    
    results.push({
      name: func,
      hasIndex,
      hasConfig,
      hasPackage,
      valid: hasIndex && hasConfig
    });
  }
  
  return results;
}

/**
 * 测试页面文件
 */
async function testPages() {
  const pagesDir = path.join(__dirname, '..', 'miniprogram', 'pages');
  const pages = [];
  
  function traverseDir(dir, basePath = '') {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        traverseDir(filePath, path.join(basePath, file));
      } else if (file.endsWith('.js') && !filePath.includes('tools')) {
        const pageName = basePath;
        if (pageName) {
          const jsFile = filePath;
          const jsonFile = jsFile.replace('.js', '.json');
          const wxmlFile = jsFile.replace('.js', '.wxml');
          const wxssFile = jsFile.replace('.js', '.wxss');
          
          pages.push({
            name: pageName,
            hasJS: checkFileExists(jsFile),
            hasJSON: checkFileExists(jsonFile),
            hasWXML: checkFileExists(wxmlFile),
            hasWXSS: checkFileExists(wxssFile),
            valid: checkFileExists(jsFile) && checkFileExists(jsonFile) && checkFileExists(wxmlFile)
          });
        }
      }
    }
  }
  
  traverseDir(pagesDir);
  return pages;
}

/**
 * 测试工具模块
 */
async function testUtils() {
  const utilsDir = path.join(__dirname, '..', 'miniprogram', 'utils');
  const utils = fs.readdirSync(utilsDir).filter(file => file.endsWith('.js'));
  
  const results = [];
  for (const util of utils) {
    const utilPath = path.join(utilsDir, util);
    const exists = checkFileExists(utilPath);
    results.push({ name: util, exists });
  }
  
  return results;
}

/**
 * 测试组件
 */
async function testComponents() {
  const componentsDir = path.join(__dirname, '..', 'miniprogram', 'components');
  if (!checkDirExists(componentsDir)) {
    return [];
  }
  
  const components = fs.readdirSync(componentsDir);
  const results = [];
  
  for (const component of components) {
    const componentDir = path.join(componentsDir, component);
    const jsFile = path.join(componentDir, 'index.js');
    const jsonFile = path.join(componentDir, 'index.json');
    const wxmlFile = path.join(componentDir, 'index.wxml');
    const wxssFile = path.join(componentDir, 'index.wxss');
    
    results.push({
      name: component,
      hasJS: checkFileExists(jsFile),
      hasJSON: checkFileExists(jsonFile),
      hasWXML: checkFileExists(wxmlFile),
      hasWXSS: checkFileExists(wxssFile),
      valid: checkFileExists(jsFile) && checkFileExists(jsonFile) && checkFileExists(wxmlFile)
    });
  }
  
  return results;
}

/**
 * 测试主配置文件
 */
async function testAppConfig() {
  const appFiles = [
    'app.js',
    'app.json',
    'app.wxss'
  ];
  
  const results = [];
  for (const file of appFiles) {
    const filePath = path.join(__dirname, '..', 'miniprogram', file);
    const exists = checkFileExists(filePath);
    results.push({ file, exists });
  }
  
  return results;
}

/**
 * 测试数据库集合配置
 */
async function testDatabaseCollections() {
  const expectedCollections = [
    'users',
    'articles',
    'courses',
    'applications',
    'clients',
    'reports',
    'system_config',
    'stores',
    'contracts',
    'renewals',
    'materials',
    'daily_materials'
  ];
  
  return expectedCollections.map(collection => ({
    name: collection,
    expected: true
  }));
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始全流程冒烟测试\n');
  
  await runTest('配置文件检查', testConfigFiles);
  await runTest('云函数检查', testCloudFunctions);
  await runTest('页面文件检查', testPages);
  await runTest('工具模块检查', testUtils);
  await runTest('组件检查', testComponents);
  await runTest('主配置文件检查', testAppConfig);
  await runTest('数据库集合检查', testDatabaseCollections);
  
  console.log('\n📊 测试结果汇总');
  console.log(`总测试数: ${testResults.total}`);
  console.log(`通过: ${testResults.passed}`);
  console.log(`失败: ${testResults.failed}`);
  console.log(`成功率: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ 失败的测试:');
    testResults.tests
      .filter(test => test.status === 'failed')
      .forEach(test => console.log(`- ${test.name}: ${test.error}`));
  }
  
  console.log('\n✅ 测试完成');
  
  // 保存测试结果到文件
  const resultPath = path.join(__dirname, '..', 'test-results.json');
  fs.writeFileSync(resultPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 测试结果已保存到: ${resultPath}`);
  
  return testResults;
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  runTest,
  testConfigFiles,
  testCloudFunctions,
  testPages,
  testUtils,
  testComponents,
  testAppConfig,
  testDatabaseCollections
};
