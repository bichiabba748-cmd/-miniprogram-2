// 开发进度自动同步机制
// 用于自动更新开发进度文档和跟踪项目状态

const fs = require('fs');
const path = require('path');

class ProgressSync {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.progressPath = path.join(this.projectRoot, 'docs', '开发进度', 'progress.md');
    this.codeDbConsistencyPath = path.join(this.projectRoot, 'docs', '开发进度', 'code-db-consistency.md');
    this.indexPath = path.join(this.projectRoot, 'docs', '开发进度', 'index.md');
  }

  // 读取开发进度
  readProgress() {
    try {
      if (fs.existsSync(this.progressPath)) {
        const content = fs.readFileSync(this.progressPath, 'utf8');
        return this.parseProgress(content);
      }
      return this.getDefaultProgress();
    } catch (error) {
      console.error('读取开发进度失败:', error.message);
      return this.getDefaultProgress();
    }
  }

  // 解析开发进度
  parseProgress(content) {
    const progress = {
      sections: [],
      lastUpdated: new Date().toISOString()
    };
    
    const lines = content.split('\n');
    let currentSection = null;
    
    lines.forEach(line => {
      line = line.trim();
      
      if (line.startsWith('### ')) {
        currentSection = {
          title: line.substring(4),
          tasks: []
        };
        progress.sections.push(currentSection);
      } else if (line.startsWith('- [') && currentSection) {
        const completed = line.startsWith('- [x]');
        const taskText = line.replace(/^- \[x\] /, '').replace(/^- \[ \] /, '');
        
        currentSection.tasks.push({
          text: taskText,
          completed
        });
      } else if (line.includes('最后更新:')) {
        const match = line.match(/最后更新: (.*)/);
        if (match) {
          progress.lastUpdated = match[1];
        }
      }
    });
    
    return progress;
  }

  // 默认进度
  getDefaultProgress() {
    return {
      sections: [
        {
          title: 'P1 - 核心架构',
          tasks: [
            { text: '角色管理架构实现', completed: false },
            { text: '权限控制矩阵建立', completed: false },
            { text: '数据库模型设计', completed: false }
          ]
        },
        {
          title: 'P2 - 基础页面',
          tasks: [
            { text: '首页实现', completed: false },
            { text: '登录页实现', completed: false },
            { text: '个人中心实现', completed: false }
          ]
        },
        {
          title: 'P3 - 核心功能',
          tasks: [
            { text: '文案管理功能', completed: false },
            { text: '客户管理功能', completed: false },
            { text: '培训管理功能', completed: false }
          ]
        }
      ],
      lastUpdated: new Date().toISOString()
    };
  }

  // 扫描项目状态
  scanProjectStatus() {
    console.log('扫描项目状态...');
    
    const status = {
      files: {
        pages: this.countFiles('miniprogram/pages'),
        components: this.countFiles('miniprogram/components'),
        cloudFunctions: this.countFiles('cloudfunctions'),
        utils: this.countFiles('miniprogram/utils')
      },
      progress: this.readProgress(),
      timestamp: new Date().toISOString()
    };
    
    return status;
  }

  // 统计文件数量
  countFiles(dirPath) {
    const fullPath = path.join(this.projectRoot, dirPath);
    
    try {
      if (fs.existsSync(fullPath)) {
        const files = this.getFilesRecursive(fullPath);
        return files.length;
      }
      return 0;
    } catch (error) {
      console.error(`统计文件失败: ${dirPath}`, error.message);
      return 0;
    }
  }

  // 递归获取文件
  getFilesRecursive(dir) {
    let files = [];
    
    const entries = fs.readdirSync(dir);
    
    entries.forEach(entry => {
      const entryPath = path.join(dir, entry);
      const stat = fs.statSync(entryPath);
      
      if (stat.isDirectory()) {
        files = files.concat(this.getFilesRecursive(entryPath));
      } else {
        files.push(entryPath);
      }
    });
    
    return files;
  }

  // 更新开发进度
  updateProgress() {
    console.log('更新开发进度...');
    
    const projectStatus = this.scanProjectStatus();
    const progress = projectStatus.progress;
    
    // 生成新的进度文档
    let content = '# 开发进度\n\n';
    
    // 添加统计信息
    content += '## 项目概览\n\n';
    content += `- 页面数量: ${projectStatus.files.pages}\n`;
    content += `- 组件数量: ${projectStatus.files.components}\n`;
    content += `- 云函数数量: ${projectStatus.files.cloudFunctions}\n`;
    content += `- 工具数量: ${projectStatus.files.utils}\n`;
    content += `- 最后更新: ${projectStatus.timestamp}\n\n`;
    
    // 添加进度部分
    progress.sections.forEach(section => {
      content += `### ${section.title}\n\n`;
      
      section.tasks.forEach(task => {
        content += `- [${task.completed ? 'x' : ' '}] ${task.text}\n`;
      });
      
      content += '\n';
    });
    
    // 添加自动更新说明
    content += '## 自动更新\n\n';
    content += '此文档由开发进度同步工具自动生成和更新。\n';
    content += '更新时间: ' + projectStatus.timestamp + '\n';
    
    try {
      fs.writeFileSync(this.progressPath, content);
      console.log('✅ 开发进度已更新');
      return true;
    } catch (error) {
      console.error('更新开发进度失败:', error.message);
      return false;
    }
  }

  // 更新代码-数据库一致性文档
  updateCodeDbConsistency() {
    console.log('更新代码-数据库一致性文档...');
    
    const status = this.scanProjectStatus();
    
    // 生成一致性文档
    let content = '# 代码-数据库一致性检查报告\n\n';
    
    content += '## 项目状态\n\n';
    content += `- 页面数量: ${status.files.pages}\n`;
    content += `- 云函数数量: ${status.files.cloudFunctions}\n`;
    content += `- 最后检查: ${status.timestamp}\n\n`;
    
    content += '## 一致性状态\n\n';
    content += '### 待检查项\n\n';
    content += '- [ ] 代码中的数据库操作与模型一致\n';
    content += '- [ ] 云函数依赖关系清晰\n';
    content += '- [ ] 权限控制矩阵完整\n\n';
    
    content += '## 建议操作\n\n';
    content += '1. 定期运行代码-数据库一致性检查工具\n';
    content += '2. 每次修改数据库模型后更新相关代码\n';
    content += '3. 保持云函数依赖的一致性\n';
    
    try {
      fs.writeFileSync(this.codeDbConsistencyPath, content);
      console.log('✅ 代码-数据库一致性文档已更新');
      return true;
    } catch (error) {
      console.error('更新一致性文档失败:', error.message);
      return false;
    }
  }

  // 更新开发进度索引
  updateProgressIndex() {
    console.log('更新开发进度索引...');
    
    const status = this.scanProjectStatus();
    
    // 生成索引文档
    let content = '# 开发进度索引\n\n';
    
    content += '## 文档列表\n\n';
    content += '- [progress.md](progress.md) - 开发进度主文档\n';
    content += '- [code-db-consistency.md](code-db-consistency.md) - 代码-数据库一致性\n\n';
    
    content += '## 项目统计\n\n';
    content += `- 页面数量: ${status.files.pages}\n`;
    content += `- 组件数量: ${status.files.components}\n`;
    content += `- 云函数数量: ${status.files.cloudFunctions}\n`;
    content += `- 工具数量: ${status.files.utils}\n`;
    content += `- 最后更新: ${status.timestamp}\n\n`;
    
    content += '## 快速导航\n\n';
    content += '### 开发阶段\n\n';
    content += '- [核心架构](#核心架构)\n';
    content += '- [基础页面](#基础页面)\n';
    content += '- [核心功能](#核心功能)\n';
    content += '- [测试部署](#测试部署)\n';
    
    try {
      fs.writeFileSync(this.indexPath, content);
      console.log('✅ 开发进度索引已更新');
      return true;
    } catch (error) {
      console.error('更新索引失败:', error.message);
      return false;
    }
  }

  // 执行全量同步
  runFullSync() {
    console.log('执行全量同步...');
    
    const results = {
      progress: this.updateProgress(),
      consistency: this.updateCodeDbConsistency(),
      index: this.updateProgressIndex()
    };
    
    // 生成同步报告
    console.log('\n=== 同步报告 ===');
    
    Object.entries(results).forEach(([key, success]) => {
      console.log(`${key}: ${success ? '✅' : '❌'}`);
    });
    
    const allSuccess = Object.values(results).every(r => r);
    
    if (allSuccess) {
      console.log('\n✅ 全量同步完成');
    } else {
      console.log('\n❌ 部分同步失败');
    }
    
    return allSuccess;
  }

  // 检查进度状态
  checkProgressStatus() {
    console.log('检查进度状态...');
    
    const progress = this.readProgress();
    const status = {
      totalTasks: 0,
      completedTasks: 0,
      sections: []
    };
    
    progress.sections.forEach(section => {
      const sectionStatus = {
        title: section.title,
        totalTasks: section.tasks.length,
        completedTasks: section.tasks.filter(t => t.completed).length,
        completionRate: 0
      };
      
      sectionStatus.completionRate = sectionStatus.totalTasks > 0 
        ? (sectionStatus.completedTasks / sectionStatus.totalTasks) * 100 
        : 0;
      
      status.totalTasks += sectionStatus.totalTasks;
      status.completedTasks += sectionStatus.completedTasks;
      status.sections.push(sectionStatus);
    });
    
    status.overallCompletionRate = status.totalTasks > 0 
      ? (status.completedTasks / status.totalTasks) * 100 
      : 0;
    
    // 生成状态报告
    this.generateStatusReport(status);
    
    return status;
  }

  // 生成状态报告
  generateStatusReport(status) {
    console.log('\n=== 进度状态报告 ===');
    console.log(`总任务数: ${status.totalTasks}`);
    console.log(`已完成: ${status.completedTasks}`);
    console.log(`完成率: ${status.overallCompletionRate.toFixed(1)}%`);
    
    console.log('\n各部分进度:');
    status.sections.forEach(section => {
      console.log(`\n${section.title}:`);
      console.log(`  任务数: ${section.completedTasks}/${section.totalTasks}`);
      console.log(`  完成率: ${section.completionRate.toFixed(1)}%`);
    });
    
    // 检查是否有延误
    const overdueSections = status.sections.filter(s => s.completionRate < 50);
    if (overdueSections.length > 0) {
      console.log('\n⚠️  需要关注的部分:');
      overdueSections.forEach(section => {
        console.log(`  - ${section.title} (完成率: ${section.completionRate.toFixed(1)}%)`);
      });
    }
  }

  // 标记任务完成
  markTaskComplete(sectionTitle, taskText) {
    console.log(`标记任务完成: ${taskText}`);
    
    const progress = this.readProgress();
    let found = false;
    
    progress.sections.forEach(section => {
      if (section.title === sectionTitle) {
        section.tasks.forEach(task => {
          if (task.text === taskText) {
            task.completed = true;
            found = true;
          }
        });
      }
    });
    
    if (found) {
      // 更新进度文档
      this.updateProgress();
      console.log('✅ 任务已标记为完成');
      return true;
    } else {
      console.error('❌ 任务未找到');
      return false;
    }
  }

  // 添加新任务
  addNewTask(sectionTitle, taskText) {
    console.log(`添加新任务: ${taskText} 到 ${sectionTitle}`);
    
    const progress = this.readProgress();
    let sectionFound = false;
    
    progress.sections.forEach(section => {
      if (section.title === sectionTitle) {
        section.tasks.push({
          text: taskText,
          completed: false
        });
        sectionFound = true;
      }
    });
    
    if (sectionFound) {
      // 更新进度文档
      this.updateProgress();
      console.log('✅ 任务已添加');
      return true;
    } else {
      console.error('❌ 部分未找到');
      return false;
    }
  }

  // 导出进度数据
  exportProgressData() {
    console.log('导出进度数据...');
    
    const progress = this.readProgress();
    const status = this.checkProgressStatus();
    
    const exportData = {
      ...status,
      progress: progress,
      timestamp: new Date().toISOString()
    };
    
    try {
      const exportPath = path.join(this.projectRoot, 'tools', 'progress-export.json');
      fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
      console.log(`✅ 进度数据已导出: ${exportPath}`);
      return exportData;
    } catch (error) {
      console.error('导出进度数据失败:', error.message);
      return null;
    }
  }

  // 生成里程碑报告
  generateMilestoneReport() {
    console.log('生成里程碑报告...');
    
    const progress = this.readProgress();
    const status = this.checkProgressStatus();
    
    // 确定当前里程碑
    const currentMilestone = this.determineCurrentMilestone(status);
    
    // 生成报告
    let report = '# 项目里程碑报告\n\n';
    report += `## 当前里程碑\n\n`;
    report += `${currentMilestone}\n\n`;
    
    report += `## 进度概览\n\n`;
    report += `- 总完成率: ${status.overallCompletionRate.toFixed(1)}%\n`;
    report += `- 已完成任务: ${status.completedTasks}/${status.totalTasks}\n`;
    report += `- 最后更新: ${new Date().toISOString()}\n\n`;
    
    report += `## 各部分进度\n\n`;
    status.sections.forEach(section => {
      report += `### ${section.title}\n`;
      report += `- 完成率: ${section.completionRate.toFixed(1)}%\n`;
      report += `- 状态: ${this.getSectionStatus(section.completionRate)}\n\n`;
    });
    
    report += `## 下一步建议\n\n`;
    report += this.generateNextSteps(status);
    
    try {
      const reportPath = path.join(this.projectRoot, 'docs', '开发进度', 'milestone-report.md');
      fs.writeFileSync(reportPath, report);
      console.log(`✅ 里程碑报告已生成: ${reportPath}`);
      return report;
    } catch (error) {
      console.error('生成里程碑报告失败:', error.message);
      return null;
    }
  }

  // 确定当前里程碑
  determineCurrentMilestone(status) {
    if (status.overallCompletionRate < 25) {
      return '初始化阶段 - 搭建基础架构';
    } else if (status.overallCompletionRate < 50) {
      return '开发阶段 - 实现核心功能';
    } else if (status.overallCompletionRate < 75) {
      return '测试阶段 - 完善功能和修复问题';
    } else {
      return '部署阶段 - 准备上线';
    }
  }

  // 获取部分状态
  getSectionStatus(completionRate) {
    if (completionRate === 100) {
      return '已完成';
    } else if (completionRate >= 75) {
      return '接近完成';
    } else if (completionRate >= 50) {
      return '进行中';
    } else if (completionRate >= 25) {
      return '开始启动';
    } else {
      return '未开始';
    }
  }

  // 生成下一步建议
  generateNextSteps(status) {
    let steps = '';
    
    status.sections.forEach(section => {
      if (section.completionRate < 100) {
        steps += `- 继续推进 ${section.title}，当前完成率 ${section.completionRate.toFixed(1)}%\n`;
      }
    });
    
    if (status.overallCompletionRate < 50) {
      steps += `- 确保核心架构的稳定性\n`;
      steps += `- 优先实现基础页面和功能\n`;
    } else if (status.overallCompletionRate < 75) {
      steps += `- 加强测试，确保功能稳定性\n`;
      steps += `- 优化用户体验\n`;
    } else {
      steps += `- 准备部署和发布\n`;
      steps += `- 制定运维计划\n`;
    }
    
    return steps;
  }
}

// 执行同步
if (require.main === module) {
  const sync = new ProgressSync();
  
  // 解析命令行参数
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 默认执行全量同步
    sync.runFullSync();
  } else if (args[0] === 'status') {
    // 检查进度状态
    sync.checkProgressStatus();
  } else if (args[0] === 'export') {
    // 导出进度数据
    sync.exportProgressData();
  } else if (args[0] === 'milestone') {
    // 生成里程碑报告
    sync.generateMilestoneReport();
  } else if (args[0] === 'complete' && args.length >= 3) {
    // 标记任务完成
    sync.markTaskComplete(args[1], args.slice(2).join(' '));
  } else if (args[0] === 'add' && args.length >= 3) {
    // 添加新任务
    sync.addNewTask(args[1], args.slice(2).join(' '));
  }
}

module.exports = ProgressSync;