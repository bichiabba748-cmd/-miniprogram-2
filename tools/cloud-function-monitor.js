// 云函数依赖管理和性能监控工具
// 用于分析云函数依赖和监控性能

const fs = require('fs');
const path = require('path');

class CloudFunctionMonitor {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.cloudFunctionsPath = path.join(this.projectRoot, 'cloudfunctions');
    this.performanceLogPath = path.join(this.projectRoot, 'tools', 'function-performance.json');
  }

  // 扫描云函数
  scanCloudFunctions() {
    console.log('扫描云函数...');
    
    const functions = [];
    
    try {
      const functionDirs = fs.readdirSync(this.cloudFunctionsPath);
      
      functionDirs.forEach(dir => {
        const functionPath = path.join(this.cloudFunctionsPath, dir);
        
        if (fs.statSync(functionPath).isDirectory()) {
          const functionInfo = this.analyzeFunction(functionPath, dir);
          if (functionInfo) {
            functions.push(functionInfo);
          }
        }
      });
      
      return functions;
    } catch (error) {
      console.error('扫描云函数失败:', error.message);
      return [];
    }
  }

  // 分析单个云函数
  analyzeFunction(functionPath, functionName) {
    try {
      const packageJsonPath = path.join(functionPath, 'package.json');
      const indexJsPath = path.join(functionPath, 'index.js');
      
      const functionInfo = {
        name: functionName,
        path: functionPath,
        hasPackageJson: fs.existsSync(packageJsonPath),
        hasIndexJs: fs.existsSync(indexJsPath),
        dependencies: {},
        size: 0,
        complexity: 0
      };
      
      // 分析依赖
      if (functionInfo.hasPackageJson) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        functionInfo.dependencies = packageJson.dependencies || {};
      }
      
      // 分析代码
      if (functionInfo.hasIndexJs) {
        const code = fs.readFileSync(indexJsPath, 'utf8');
        functionInfo.size = code.length;
        functionInfo.complexity = this.analyzeCodeComplexity(code);
      }
      
      return functionInfo;
    } catch (error) {
      console.error(`分析云函数失败: ${functionName}`, error.message);
      return null;
    }
  }

  // 分析代码复杂度
  analyzeCodeComplexity(code) {
    const lines = code.split('\n');
    let complexity = 0;
    
    // 简单复杂度分析
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // 增加复杂度的关键词
      if (trimmedLine.includes('if (') ||
          trimmedLine.includes('for (') ||
          trimmedLine.includes('while (') ||
          trimmedLine.includes('switch (') ||
          trimmedLine.includes('function ') ||
          trimmedLine.includes('=>')) {
        complexity++;
      }
    });
    
    return complexity;
  }

  // 检查依赖一致性
  checkDependencyConsistency() {
    console.log('检查依赖一致性...');
    
    const functions = this.scanCloudFunctions();
    const dependencyMap = {};
    const issues = [];
    
    // 收集所有依赖
    functions.forEach(func => {
      Object.entries(func.dependencies).forEach(([dep, version]) => {
        if (!dependencyMap[dep]) {
          dependencyMap[dep] = {};
        }
        
        if (!dependencyMap[dep][version]) {
          dependencyMap[dep][version] = [];
        }
        
        dependencyMap[dep][version].push(func.name);
      });
    });
    
    // 检查版本不一致
    Object.entries(dependencyMap).forEach(([dep, versions]) => {
      if (Object.keys(versions).length > 1) {
        issues.push({
          type: 'WARNING',
          message: `依赖版本不一致: ${dep}`,
          versions: Object.entries(versions).map(([version, funcs]) => ({
            version,
            functions: funcs
          }))
        });
      }
    });
    
    // 生成报告
    this.generateDependencyReport(issues, dependencyMap);
    
    return issues;
  }

  // 生成依赖报告
  generateDependencyReport(issues, dependencyMap) {
    console.log('\n=== 云函数依赖报告 ===');
    
    if (issues.length === 0) {
      console.log('✅ 依赖版本一致');
    } else {
      console.log(`❌ 发现 ${issues.length} 个依赖问题:`);
      
      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. [${issue.type}] ${issue.message}`);
        issue.versions.forEach(({ version, functions }) => {
          console.log(`   版本 ${version}: ${functions.join(', ')}`);
        });
      });
    }
    
    // 依赖统计
    console.log('\n=== 依赖统计 ===');
    Object.entries(dependencyMap).forEach(([dep, versions]) => {
      const totalFunctions = Object.values(versions).reduce((sum, funcs) => sum + funcs.length, 0);
      console.log(`${dep}: ${totalFunctions}个云函数使用`);
    });
  }

  // 分析云函数性能
  analyzeFunctionPerformance() {
    console.log('分析云函数性能...');
    
    const functions = this.scanCloudFunctions();
    const performanceData = [];
    
    functions.forEach(func => {
      // 模拟性能数据（实际项目中应从日志获取）
      const performance = {
        functionName: func.name,
        size: func.size,
        complexity: func.complexity,
        estimatedExecutionTime: Math.max(10, Math.round(func.size / 100) + func.complexity * 5),
        memoryUsage: Math.max(10, Math.round(func.size / 1000) + Object.keys(func.dependencies).length * 2),
        riskLevel: this.calculateRiskLevel(func)
      };
      
      performanceData.push(performance);
    });
    
    // 保存性能数据
    this.savePerformanceData(performanceData);
    
    // 生成性能报告
    this.generatePerformanceReport(performanceData);
    
    return performanceData;
  }

  // 计算风险等级
  calculateRiskLevel(func) {
    const sizeScore = func.size > 5000 ? 3 : func.size > 2000 ? 2 : 1;
    const complexityScore = func.complexity > 50 ? 3 : func.complexity > 20 ? 2 : 1;
    const dependencyScore = Object.keys(func.dependencies).length > 10 ? 3 : Object.keys(func.dependencies).length > 5 ? 2 : 1;
    
    const totalScore = sizeScore + complexityScore + dependencyScore;
    
    if (totalScore >= 8) return '高';
    if (totalScore >= 5) return '中';
    return '低';
  }

  // 保存性能数据
  savePerformanceData(data) {
    try {
      const performanceInfo = {
        timestamp: new Date().toISOString(),
        functions: data
      };
      
      fs.writeFileSync(this.performanceLogPath, JSON.stringify(performanceInfo, null, 2));
      console.log(`✅ 性能数据已保存: ${this.performanceLogPath}`);
    } catch (error) {
      console.error('保存性能数据失败:', error.message);
    }
  }

  // 生成性能报告
  generatePerformanceReport(data) {
    console.log('\n=== 云函数性能报告 ===');
    
    data.sort((a, b) => b.estimatedExecutionTime - a.estimatedExecutionTime)
      .forEach((perf, index) => {
        console.log(`\n${index + 1}. ${perf.functionName}`);
        console.log(`   执行时间: ${perf.estimatedExecutionTime}ms`);
        console.log(`   内存使用: ${perf.memoryUsage}MB`);
        console.log(`   代码大小: ${perf.size} bytes`);
        console.log(`   复杂度: ${perf.complexity}`);
        console.log(`   风险等级: ${perf.riskLevel}`);
      });
    
    // 性能统计
    const totalFunctions = data.length;
    const highRiskFunctions = data.filter(p => p.riskLevel === '高').length;
    const avgExecutionTime = data.reduce((sum, p) => sum + p.estimatedExecutionTime, 0) / totalFunctions;
    
    console.log('\n=== 性能统计 ===');
    console.log(`总云函数数: ${totalFunctions}`);
    console.log(`高风险云函数: ${highRiskFunctions} (${((highRiskFunctions / totalFunctions) * 100).toFixed(1)}%)`);
    console.log(`平均执行时间: ${avgExecutionTime.toFixed(2)}ms`);
  }

  // 生成优化建议
  generateOptimizationSuggestions() {
    console.log('\n=== 云函数优化建议 ===');
    
    const functions = this.scanCloudFunctions();
    const performanceData = this.analyzeFunctionPerformance();
    
    // 按风险等级排序
    performanceData
      .filter(p => p.riskLevel !== '低')
      .forEach(perf => {
        console.log(`\n云函数: ${perf.functionName} (${perf.riskLevel}风险)`);
        console.log('优化建议:');
        
        if (perf.size > 5000) {
          console.log('  - 代码过大，建议拆分为多个云函数');
        }
        
        if (perf.complexity > 50) {
          console.log('  - 代码复杂度高，建议简化逻辑或拆分函数');
        }
        
        const funcInfo = functions.find(f => f.name === perf.functionName);
        if (funcInfo && Object.keys(funcInfo.dependencies).length > 10) {
          console.log('  - 依赖过多，建议移除不必要的依赖');
        }
      });
  }

  // 检查云函数配置
  checkFunctionConfig() {
    console.log('检查云函数配置...');
    
    const functions = this.scanCloudFunctions();
    const issues = [];
    
    functions.forEach(func => {
      // 检查必要文件
      if (!func.hasIndexJs) {
        issues.push({
          type: 'ERROR',
          message: `云函数缺少入口文件: ${func.name}`,
          function: func.name
        });
      }
      
      // 检查代码质量
      if (func.hasIndexJs && func.complexity > 100) {
        issues.push({
          type: 'WARNING',
          message: `云函数代码复杂度高: ${func.name}`,
          function: func.name
        });
      }
      
      // 检查依赖
      if (func.hasPackageJson && Object.keys(func.dependencies).length === 0) {
        issues.push({
          type: 'INFO',
          message: `云函数无依赖: ${func.name}`,
          function: func.name
        });
      }
    });
    
    // 生成报告
    console.log('\n=== 云函数配置报告 ===');
    
    if (issues.length === 0) {
      console.log('✅ 云函数配置检查通过');
    } else {
      console.log(`❌ 发现 ${issues.length} 个配置问题:`);
      
      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. [${issue.type}] ${issue.message}`);
      });
    }
    
    return issues;
  }

  // 生成云函数依赖图
  generateDependencyGraph() {
    console.log('生成云函数依赖图...');
    
    const functions = this.scanCloudFunctions();
    const dependencyGraph = {
      nodes: [],
      links: []
    };
    
    // 添加节点
    functions.forEach(func => {
      dependencyGraph.nodes.push({
        id: func.name,
        size: func.size,
        complexity: func.complexity
      });
    });
    
    // 添加依赖关系
    const depToFunctions = {};
    
    functions.forEach(func => {
      Object.keys(func.dependencies).forEach(dep => {
        if (!depToFunctions[dep]) {
          depToFunctions[dep] = [];
        }
        depToFunctions[dep].push(func.name);
      });
    });
    
    // 保存依赖图
    try {
      const graphPath = path.join(this.projectRoot, 'tools', 'dependency-graph.json');
      fs.writeFileSync(graphPath, JSON.stringify(dependencyGraph, null, 2));
      console.log(`✅ 依赖图已生成: ${graphPath}`);
    } catch (error) {
      console.error('生成依赖图失败:', error.message);
    }
    
    return dependencyGraph;
  }
}

// 执行监控
if (require.main === module) {
  const monitor = new CloudFunctionMonitor();
  
  // 解析命令行参数
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 默认执行所有检查
    monitor.checkDependencyConsistency();
    monitor.analyzeFunctionPerformance();
    monitor.checkFunctionConfig();
  } else if (args[0] === 'deps') {
    // 检查依赖
    monitor.checkDependencyConsistency();
  } else if (args[0] === 'perf') {
    // 分析性能
    monitor.analyzeFunctionPerformance();
  } else if (args[0] === 'config') {
    // 检查配置
    monitor.checkFunctionConfig();
  } else if (args[0] === 'optimize') {
    // 生成优化建议
    monitor.generateOptimizationSuggestions();
  } else if (args[0] === 'graph') {
    // 生成依赖图
    monitor.generateDependencyGraph();
  }
}

module.exports = CloudFunctionMonitor;