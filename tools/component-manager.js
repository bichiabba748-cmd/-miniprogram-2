// 组件库管理规范和工具
// 用于管理小程序组件库，包括清单更新、依赖管理和使用规范

const fs = require('fs');
const path = require('path');

class ComponentManager {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.componentLibPath = path.join(this.projectRoot, 'docs', '项目规格', '组件库清单.md');
    this.componentsPath = path.join(this.projectRoot, 'miniprogram', 'components');
    this.pagesPath = path.join(this.projectRoot, 'miniprogram', 'pages');
  }

  // 读取组件库清单
  readComponentLib() {
    try {
      if (fs.existsSync(this.componentLibPath)) {
        const content = fs.readFileSync(this.componentLibPath, 'utf8');
        return this.parseComponentLib(content);
      }
      return this.getDefaultComponentLib();
    } catch (error) {
      console.error('读取组件库清单失败:', error.message);
      return this.getDefaultComponentLib();
    }
  }

  // 解析组件库清单
  parseComponentLib(content) {
    const components = [];
    const lines = content.split('\n');
    let currentCategory = null;
    
    lines.forEach(line => {
      line = line.trim();
      
      if (line.startsWith('## ')) {
        currentCategory = line.substring(3).trim();
      } else if (line.startsWith('- ') && currentCategory) {
        const match = line.match(/- (\w+): (.*)/);
        if (match) {
          components.push({
            name: match[1],
            description: match[2],
            category: currentCategory,
            used: false
          });
        }
      }
    });
    
    return components;
  }

  // 默认组件库
  getDefaultComponentLib() {
    return [
      {
        name: 'Button',
        description: '自定义按钮组件',
        category: '基础组件',
        used: false
      },
      {
        name: 'Card',
        description: '卡片组件',
        category: '基础组件',
        used: false
      },
      {
        name: 'List',
        description: '列表组件',
        category: '基础组件',
        used: false
      },
      {
        name: 'Form',
        description: '表单组件',
        category: '表单组件',
        used: false
      },
      {
        name: 'Modal',
        description: '弹窗组件',
        category: '反馈组件',
        used: false
      },
      {
        name: 'Toast',
        description: '提示组件',
        category: '反馈组件',
        used: false
      }
    ];
  }

  // 扫描项目中的组件使用
  scanComponentsUsage() {
    console.log('扫描组件使用情况...');
    
    const components = this.readComponentLib();
    const usage = {};
    
    // 初始化使用统计
    components.forEach(component => {
      usage[component.name] = {
        ...component,
        usageCount: 0,
        usedIn: []
      };
    });
    
    // 扫描页面和组件
    this.scanDirectory(this.pagesPath, usage);
    this.scanDirectory(this.componentsPath, usage);
    
    return usage;
  }

  // 扫描目录
  scanDirectory(dir, usage) {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          this.scanDirectory(filePath, usage);
        } else if (file.endsWith('.wxml')) {
          this.scanFile(filePath, usage);
        }
      });
    } catch (error) {
      console.error('扫描目录失败:', error.message);
    }
  }

  // 扫描文件
  scanFile(filePath, usage) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.projectRoot, filePath);
      
      // 匹配组件使用
      Object.keys(usage).forEach(componentName => {
        const componentRegex = new RegExp(`<${componentName}[^>]*>`, 'g');
        const matches = content.match(componentRegex);
        
        if (matches) {
          usage[componentName].usageCount += matches.length;
          usage[componentName].usedIn.push(relativePath);
          usage[componentName].used = true;
        }
      });
    } catch (error) {
      console.error('扫描文件失败:', error.message);
    }
  }

  // 更新组件库清单
  updateComponentLib() {
    console.log('更新组件库清单...');
    
    const usage = this.scanComponentsUsage();
    const componentsByCategory = this.groupComponentsByCategory(usage);
    
    // 生成新的清单内容
    let content = '# 组件库清单\n\n';
    
    Object.entries(componentsByCategory).forEach(([category, components]) => {
      content += `## ${category}\n\n`;
      
      components.forEach(component => {
        content += `- ${component.name}: ${component.description} ${component.used ? '(已使用)' : '(未使用)'}\n`;
      });
      
      content += '\n';
    });
    
    // 添加使用统计
    content += '## 使用统计\n\n';
    const totalComponents = Object.keys(usage).length;
    const usedComponents = Object.values(usage).filter(c => c.used).length;
    content += `- 总组件数: ${totalComponents}\n`;
    content += `- 已使用组件: ${usedComponents}\n`;
    content += `- 使用率: ${((usedComponents / totalComponents) * 100).toFixed(1)}%\n\n`;
    
    // 添加更新时间
    content += `## 更新时间\n\n${new Date().toISOString()}\n`;
    
    try {
      fs.writeFileSync(this.componentLibPath, content);
      console.log('✅ 组件库清单已更新');
      return true;
    } catch (error) {
      console.error('更新组件库清单失败:', error.message);
      return false;
    }
  }

  // 按类别分组组件
  groupComponentsByCategory(usage) {
    const grouped = {};
    
    Object.values(usage).forEach(component => {
      if (!grouped[component.category]) {
        grouped[component.category] = [];
      }
      grouped[component.category].push(component);
    });
    
    return grouped;
  }

  // 检查组件使用规范
  checkComponentUsage() {
    console.log('检查组件使用规范...');
    
    const usage = this.scanComponentsUsage();
    const issues = [];
    
    // 检查未使用的组件
    Object.values(usage).forEach(component => {
      if (!component.used) {
        issues.push({
          type: 'WARNING',
          message: `组件未使用: ${component.name}`,
          description: component.description
        });
      }
    });
    
    // 检查组件使用频率
    Object.values(usage).forEach(component => {
      if (component.usageCount > 10) {
        issues.push({
          type: 'INFO',
          message: `组件使用频繁: ${component.name} (${component.usageCount}次)`,
          description: '考虑优化组件性能'
        });
      }
    });
    
    // 生成报告
    this.generateUsageReport(issues, usage);
    
    return issues;
  }

  // 生成使用报告
  generateUsageReport(issues, usage) {
    console.log('\n=== 组件使用报告 ===');
    
    if (issues.length === 0) {
      console.log('✅ 未发现组件使用问题');
    } else {
      console.log(`❌ 发现 ${issues.length} 个问题:`);
      
      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. [${issue.type}] ${issue.message}`);
        console.log(`   描述: ${issue.description}`);
      });
    }
    
    // 组件使用统计
    console.log('\n=== 组件使用统计 ===');
    Object.values(usage)
      .sort((a, b) => b.usageCount - a.usageCount)
      .forEach(component => {
        console.log(`${component.name}: ${component.usageCount}次 ${component.used ? '(已使用)' : '(未使用)'}`);
        if (component.usedIn.length > 0) {
          console.log(`  使用位置: ${component.usedIn.slice(0, 3).join(', ')}${component.usedIn.length > 3 ? '...' : ''}`);
        }
      });
  }

  // 生成组件使用规范
  generateUsageGuide() {
    console.log('\n=== 组件使用规范 ===');
    
    const guide = {
      naming: {
        title: '命名规范',
        rules: [
          '组件名称使用 PascalCase 格式',
          '组件文件名与组件名称保持一致',
          '避免使用保留字和特殊字符'
        ]
      },
      structure: {
        title: '目录结构',
        rules: [
          '每个组件独立一个目录',
          '目录包含 wxml、wxss、js、json 文件',
          '复杂组件可创建子组件目录'
        ]
      },
      usage: {
        title: '使用规范',
        rules: [
          '在页面 json 文件中声明组件',
          '使用 <component-name> 标签引入组件',
          '通过属性传递数据，事件传递交互'
        ]
      },
      performance: {
        title: '性能优化',
        rules: [
          '避免在组件中使用复杂计算',
          '合理使用 wx:if 和 wx:else 控制渲染',
          '组件数据变更时使用 setData 方法'
        ]
      }
    };
    
    Object.entries(guide).forEach(([key, section]) => {
      console.log(`\n${section.title}:`);
      section.rules.forEach(rule => {
        console.log(`- ${rule}`);
      });
    });
  }

  // 导出组件使用统计
  exportUsageStats() {
    const usage = this.scanComponentsUsage();
    const stats = {
      timestamp: new Date().toISOString(),
      totalComponents: Object.keys(usage).length,
      usedComponents: Object.values(usage).filter(c => c.used).length,
      usageRate: ((Object.values(usage).filter(c => c.used).length / Object.keys(usage).length) * 100).toFixed(1),
      components: Object.values(usage).map(c => ({
        name: c.name,
        category: c.category,
        usageCount: c.usageCount,
        used: c.used,
        usedIn: c.usedIn
      }))
    };
    
    try {
      const statsPath = path.join(this.projectRoot, 'tools', 'component-stats.json');
      fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
      console.log(`✅ 组件使用统计已导出: ${statsPath}`);
      return stats;
    } catch (error) {
      console.error('导出统计失败:', error.message);
      return null;
    }
  }

  // 验证组件库完整性
  validateComponentLib() {
    console.log('验证组件库完整性...');
    
    const components = this.readComponentLib();
    const issues = [];
    
    // 检查组件目录是否存在
    components.forEach(component => {
      const componentDir = path.join(this.componentsPath, component.name);
      if (!fs.existsSync(componentDir)) {
        issues.push({
          type: 'ERROR',
          message: `组件目录不存在: ${component.name}`,
          path: componentDir
        });
      } else {
        // 检查组件文件是否完整
        const requiredFiles = ['index.wxml', 'index.wxss', 'index.js', 'index.json'];
        requiredFiles.forEach(file => {
          const filePath = path.join(componentDir, file);
          if (!fs.existsSync(filePath)) {
            issues.push({
              type: 'ERROR',
              message: `组件文件缺失: ${component.name}/${file}`,
              path: filePath
            });
          }
        });
      }
    });
    
    // 检查未在清单中的组件
    if (fs.existsSync(this.componentsPath)) {
      const componentDirs = fs.readdirSync(this.componentsPath);
      componentDirs.forEach(dir => {
        const dirPath = path.join(this.componentsPath, dir);
        if (fs.statSync(dirPath).isDirectory()) {
          const inLib = components.some(c => c.name === dir);
          if (!inLib) {
            issues.push({
              type: 'WARNING',
              message: `组件未在清单中: ${dir}`,
              path: dirPath
            });
          }
        }
      });
    }
    
    // 生成报告
    console.log('\n=== 组件库完整性报告 ===');
    
    if (issues.length === 0) {
      console.log('✅ 组件库完整性检查通过');
    } else {
      console.log(`❌ 发现 ${issues.length} 个问题:`);
      
      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. [${issue.type}] ${issue.message}`);
        console.log(`   路径: ${issue.path}`);
      });
    }
    
    return issues;
  }
}

// 执行管理
if (require.main === module) {
  const manager = new ComponentManager();
  
  // 解析命令行参数
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 默认更新组件库清单
    manager.updateComponentLib();
    manager.checkComponentUsage();
  } else if (args[0] === 'stats') {
    // 导出统计
    manager.exportUsageStats();
  } else if (args[0] === 'validate') {
    // 验证完整性
    manager.validateComponentLib();
  } else if (args[0] === 'guide') {
    // 生成使用规范
    manager.generateUsageGuide();
  }
}

module.exports = ComponentManager;