// 权限矩阵管理和测试工具
// 用于验证不同角色的权限配置

const fs = require('fs');
const path = require('path');

class PermissionTester {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.roleManagerPath = path.join(this.projectRoot, 'miniprogram', 'utils', 'roleManager.js');
    this.permissionMatrixPath = path.join(this.projectRoot, 'docs', '架构决策记录', '003-权限控制矩阵.md');
  }

  // 读取角色管理器
  readRoleManager() {
    try {
      const content = fs.readFileSync(this.roleManagerPath, 'utf8');
      return this.parseRoleManager(content);
    } catch (error) {
      console.error('读取角色管理器失败:', error.message);
      return null;
    }
  }

  // 解析角色管理器
  parseRoleManager(content) {
    const roles = [];
    const permissions = {};
    
    // 提取角色定义
    const roleRegex = /const ROLES =\s*\{[^}]*\}/g;
    const roleMatch = roleRegex.exec(content);
    if (roleMatch) {
      // 简单提取角色名称
      const roleContent = roleMatch[0];
      const roleNameRegex = /(\w+):\s*['"](\w+)['"]/g;
      let match;
      while ((match = roleNameRegex.exec(roleContent)) !== null) {
        roles.push(match[2]);
      }
    }
    
    // 提取权限矩阵
    const permRegex = /const PERMISSIONS =\s*\{[^}]*\}/g;
    const permMatch = permRegex.exec(content);
    if (permMatch) {
      // 简单提取权限定义
      const permContent = permMatch[0];
      const permRegex = /(\w+):\s*\[(.*?)\]/g;
      let match;
      while ((match = permRegex.exec(permContent)) !== null) {
        const permName = match[1];
        const permRoles = match[2].split(',').map(r => r.trim().replace(/['"]/g, ''));
        permissions[permName] = permRoles;
      }
    }
    
    return { roles, permissions };
  }

  // 读取权限矩阵文档
  readPermissionMatrix() {
    try {
      const content = fs.readFileSync(this.permissionMatrixPath, 'utf8');
      return this.parsePermissionMatrix(content);
    } catch (error) {
      console.error('读取权限矩阵文档失败:', error.message);
      return null;
    }
  }

  // 解析权限矩阵文档
  parsePermissionMatrix(content) {
    const matrix = {};
    const lines = content.split('\n');
    let inMatrix = false;
    let headers = [];
    
    for (const line of lines) {
      if (line.includes('| 权限 | visitor | student |')) {
        inMatrix = true;
        headers = line.split('|').map(h => h.trim()).filter(h => h);
        continue;
      }
      
      if (inMatrix && line.includes('| --- |')) {
        continue;
      }
      
      if (inMatrix && line.startsWith('|')) {
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length > 1) {
          const permission = cells[0];
          matrix[permission] = {};
          
          for (let i = 1; i < cells.length; i++) {
            if (i < headers.length) {
              matrix[permission][headers[i]] = cells[i] === '✅';
            }
          }
        }
      }
      
      if (inMatrix && line === '' && headers.length > 0) {
        break;
      }
    }
    
    return matrix;
  }

  // 测试权限配置
  testPermissions() {
    console.log('开始权限矩阵测试...');
    
    const roleManager = this.readRoleManager();
    const matrixDoc = this.readPermissionMatrix();
    
    if (!roleManager || !matrixDoc) {
      return;
    }
    
    const issues = [];
    
    // 检查角色定义一致性
    const docRoles = Object.keys(matrixDoc[Object.keys(matrixDoc)[0]] || {});
    const codeRoles = roleManager.roles;
    
    // 检查代码中缺少的角色
    docRoles.forEach(role => {
      if (!codeRoles.includes(role)) {
        issues.push({
          type: 'ERROR',
          message: `代码中缺少角色定义: ${role}`,
          source: 'roleManager.js'
        });
      }
    });
    
    // 检查文档中缺少的角色
    codeRoles.forEach(role => {
      if (!docRoles.includes(role)) {
        issues.push({
          type: 'WARNING',
          message: `文档中缺少角色: ${role}`,
          source: '003-权限控制矩阵.md'
        });
      }
    });
    
    // 检查权限定义一致性
    const docPermissions = Object.keys(matrixDoc);
    const codePermissions = Object.keys(roleManager.permissions);
    
    // 检查代码中缺少的权限
    docPermissions.forEach(permission => {
      if (!codePermissions.includes(permission)) {
        issues.push({
          type: 'ERROR',
          message: `代码中缺少权限定义: ${permission}`,
          source: 'roleManager.js'
        });
      }
    });
    
    // 检查文档中缺少的权限
    codePermissions.forEach(permission => {
      if (!docPermissions.includes(permission)) {
        issues.push({
          type: 'WARNING',
          message: `文档中缺少权限: ${permission}`,
          source: '003-权限控制矩阵.md'
        });
      }
    });
    
    // 检查权限配置一致性
    docPermissions.forEach(permission => {
      if (codePermissions.includes(permission)) {
        const codeRoles = roleManager.permissions[permission];
        
        docRoles.forEach(role => {
          const docHasPermission = matrixDoc[permission][role];
          const codeHasPermission = codeRoles.includes(role);
          
          if (docHasPermission !== codeHasPermission) {
            issues.push({
              type: 'ERROR',
              message: `权限配置不一致: ${permission} 对于角色 ${role}`,
              source: '权限矩阵不匹配'
            });
          }
        });
      }
    });
    
    // 生成报告
    this.generateReport(issues);
  }

  // 生成报告
  generateReport(issues) {
    console.log('\n=== 权限矩阵测试报告 ===');
    
    if (issues.length === 0) {
      console.log('✅ 权限矩阵配置一致');
      return;
    }
    
    console.log(`❌ 发现 ${issues.length} 个问题:`);
    
    issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. [${issue.type}] ${issue.message}`);
      console.log(`   来源: ${issue.source}`);
    });
  }

  // 生成权限测试用例
  generateTestCases() {
    console.log('\n=== 权限测试用例 ===');
    
    const roleManager = this.readRoleManager();
    if (!roleManager) {
      return;
    }
    
    const { roles, permissions } = roleManager;
    
    roles.forEach(role => {
      console.log(`\n角色: ${role}`);
      console.log('权限列表:');
      
      Object.entries(permissions).forEach(([permission, allowedRoles]) => {
        const hasPermission = allowedRoles.includes(role);
        console.log(`  - ${permission}: ${hasPermission ? '✅' : '❌'}`);
      });
    });
  }
}

// 执行测试
if (require.main === module) {
  const tester = new PermissionTester();
  tester.testPermissions();
  tester.generateTestCases();
}

module.exports = PermissionTester;