// 代码-数据库一致性检查工具
// 用于检查代码中的数据库操作与数据库模型是否一致

const fs = require('fs');
const path = require('path');

class CodeDBConsistencyChecker {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.databaseModelPath = path.join(this.projectRoot, 'docs', '数据库模型', '🏛️ 数据库模型 (DB Schema).md');
    this.codePaths = {
      cloudFunctions: path.join(this.projectRoot, 'cloudfunctions'),
      pages: path.join(this.projectRoot, 'miniprogram', 'pages'),
      utils: path.join(this.projectRoot, 'miniprogram', 'utils')
    };
  }

  // 读取数据库模型
  readDatabaseModel() {
    try {
      const content = fs.readFileSync(this.databaseModelPath, 'utf8');
      return this.parseDatabaseModel(content);
    } catch (error) {
      console.error('读取数据库模型失败:', error.message);
      return null;
    }
  }

  // 解析数据库模型
  parseDatabaseModel(content) {
    const collections = [];
    const collectionRegex = /## (\w+) 集合[\s\S]*?\| 字段名 \| 类型 \| 描述 \|/g;
    let match;

    while ((match = collectionRegex.exec(content)) !== null) {
      const collectionName = match[1];
      collections.push(collectionName);
    }

    return collections;
  }

  // 扫描代码中的数据库操作
  scanCodeForDBOperations() {
    const dbOperations = [];
    
    this.scanDirectory(this.codePaths.cloudFunctions, dbOperations);
    this.scanDirectory(this.codePaths.pages, dbOperations);
    this.scanDirectory(this.codePaths.utils, dbOperations);

    return dbOperations;
  }

  // 扫描目录
  scanDirectory(dir, dbOperations) {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          this.scanDirectory(filePath, dbOperations);
        } else if (file.endsWith('.js')) {
          this.scanFile(filePath, dbOperations);
        }
      });
    } catch (error) {
      console.error('扫描目录失败:', error.message);
    }
  }

  // 扫描文件
  scanFile(filePath, dbOperations) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.projectRoot, filePath);
      
      // 匹配数据库操作
      const dbRegex = /db\.(collection|command)\(['"](\w+)['"]/g;
      let match;
      
      while ((match = dbRegex.exec(content)) !== null) {
        dbOperations.push({
          file: relativePath,
          operation: match[1],
          target: match[2],
          line: this.getLineNumber(content, match.index)
        });
      }
    } catch (error) {
      console.error('扫描文件失败:', error.message);
    }
  }

  // 获取行号
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // 检查一致性
  checkConsistency() {
    console.log('开始代码-数据库一致性检查...');
    
    const collections = this.readDatabaseModel();
    if (!collections) {
      return;
    }
    
    const dbOperations = this.scanCodeForDBOperations();
    const issues = [];
    
    // 检查未定义的集合操作
    dbOperations.forEach(op => {
      if (op.operation === 'collection' && !collections.includes(op.target)) {
        issues.push({
          type: 'ERROR',
          message: `操作未定义的集合: ${op.target}`,
          file: op.file,
          line: op.line
        });
      }
    });
    
    // 检查未使用的集合
    collections.forEach(collection => {
      const used = dbOperations.some(op => 
        op.operation === 'collection' && op.target === collection
      );
      
      if (!used) {
        issues.push({
          type: 'WARNING',
          message: `集合未被使用: ${collection}`,
          file: '数据库模型',
          line: 0
        });
      }
    });
    
    // 生成报告
    this.generateReport(issues);
  }

  // 生成报告
  generateReport(issues) {
    console.log('\n=== 代码-数据库一致性检查报告 ===');
    
    if (issues.length === 0) {
      console.log('✅ 未发现一致性问题');
      return;
    }
    
    console.log(`❌ 发现 ${issues.length} 个问题:`);
    
    issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. [${issue.type}] ${issue.message}`);
      console.log(`   文件: ${issue.file}`);
      if (issue.line > 0) {
        console.log(`   行号: ${issue.line}`);
      }
    });
    
    // 更新一致性文档
    this.updateConsistencyDoc(issues);
  }

  // 更新一致性文档
  updateConsistencyDoc(issues) {
    const docPath = path.join(this.projectRoot, 'docs', '开发进度', 'code-db-consistency.md');
    
    try {
      const content = fs.readFileSync(docPath, 'utf8');
      const timestamp = new Date().toISOString();
      
      const reportSection = `\n## 一致性检查报告

### 检查时间
${timestamp}

### 检查结果
- 问题数量: ${issues.length}

### 详细问题
${issues.map((issue, index) => `
${index + 1}. [${issue.type}] ${issue.message}
   文件: ${issue.file}
   ${issue.line > 0 ? `行号: ${issue.line}` : ''}`).join('')}`;
      
      // 替换或添加报告部分
      let newContent;
      if (content.includes('## 一致性检查报告')) {
        newContent = content.replace(/## 一致性检查报告[\s\S]*?(?=##|$)/, reportSection);
      } else {
        newContent = content + reportSection;
      }
      
      fs.writeFileSync(docPath, newContent, 'utf8');
      console.log('\n✅ 一致性文档已更新');
    } catch (error) {
      console.error('更新一致性文档失败:', error.message);
    }
  }
}

// 执行检查
if (require.main === module) {
  const checker = new CodeDBConsistencyChecker();
  checker.checkConsistency();
}

module.exports = CodeDBConsistencyChecker;