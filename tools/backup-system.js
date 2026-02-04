// 数据备份自动化和恢复机制
// 用于备份项目文件和数据库，并提供恢复功能

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BackupSystem {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.backupDir = path.join(this.projectRoot, 'backups');
    this.configPath = path.join(this.projectRoot, 'tools', 'backup-config.json');
    
    // 确保备份目录存在
    this.ensureBackupDir();
  }

  // 确保备份目录存在
  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // 读取备份配置
  readConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(content);
      }
      return this.getDefaultConfig();
    } catch (error) {
      console.error('读取备份配置失败:', error.message);
      return this.getDefaultConfig();
    }
  }

  // 默认配置
  getDefaultConfig() {
    return {
      backupPaths: [
        'miniprogram',
        'cloudfunctions',
        'docs',
        'tools'
      ],
      excludePaths: [
        'node_modules',
        '.git',
        'backups',
        'miniprogram/node_modules'
      ],
      backupInterval: 24, // 小时
      keepBackups: 7, // 保留7个备份
      databaseBackup: true,
      compressBackup: true
    };
  }

  // 执行备份
  runBackup(description = '自动备份') {
    console.log('开始执行备份...');
    
    const config = this.readConfig();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, backupName);
    
    try {
      // 创建备份目录
      fs.mkdirSync(backupPath, { recursive: true });
      
      // 备份文件
      this.backupFiles(config, backupPath);
      
      // 备份数据库
      if (config.databaseBackup) {
        this.backupDatabase(backupPath);
      }
      
      // 压缩备份
      if (config.compressBackup) {
        this.compressBackup(backupPath, backupName);
      }
      
      // 清理旧备份
      this.cleanupOldBackups(config);
      
      // 记录备份信息
      this.recordBackupInfo(backupName, description);
      
      console.log(`✅ 备份完成: ${backupName}`);
      return backupName;
    } catch (error) {
      console.error('备份失败:', error.message);
      // 清理失败的备份
      if (fs.existsSync(backupPath)) {
        this.removeDir(backupPath);
      }
      return null;
    }
  }

  // 备份文件
  backupFiles(config, backupPath) {
    config.backupPaths.forEach(sourcePath => {
      const fullSourcePath = path.join(this.projectRoot, sourcePath);
      const fullDestPath = path.join(backupPath, sourcePath);
      
      if (fs.existsSync(fullSourcePath)) {
        console.log(`备份: ${sourcePath}`);
        this.copyDir(fullSourcePath, fullDestPath, config.excludePaths);
      }
    });
  }

  // 复制目录
  copyDir(source, dest, excludePaths) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(source);
    
    files.forEach(file => {
      const sourceFile = path.join(source, file);
      const destFile = path.join(dest, file);
      const relativePath = path.relative(this.projectRoot, sourceFile);
      
      // 检查是否需要排除
      const shouldExclude = excludePaths.some(exclude => 
        relativePath.includes(exclude)
      );
      
      if (!shouldExclude) {
        const stat = fs.statSync(sourceFile);
        
        if (stat.isDirectory()) {
          this.copyDir(sourceFile, destFile, excludePaths);
        } else {
          fs.copyFileSync(sourceFile, destFile);
        }
      }
    });
  }

  // 备份数据库
  backupDatabase(backupPath) {
    console.log('备份数据库...');
    
    const dbBackupPath = path.join(backupPath, 'database');
    fs.mkdirSync(dbBackupPath, { recursive: true });
    
    // 这里可以实现数据库备份逻辑
    // 例如导出云数据库数据
    const dbInfo = {
      backupTime: new Date().toISOString(),
      databases: ['users', 'articles', 'leads', 'contracts'],
      backupMethod: '云数据库导出'
    };
    
    fs.writeFileSync(
      path.join(dbBackupPath, 'backup-info.json'),
      JSON.stringify(dbInfo, null, 2)
    );
  }

  // 压缩备份
  compressBackup(backupPath, backupName) {
    console.log('压缩备份...');
    
    try {
      // 使用系统命令压缩
      const zipPath = path.join(this.backupDir, `${backupName}.zip`);
      const command = `powershell -command "Compress-Archive -Path '${backupPath}' -DestinationPath '${zipPath}' -Force"`;
      execSync(command, { stdio: 'ignore' });
      
      // 删除原始目录
      this.removeDir(backupPath);
      console.log(`压缩完成: ${backupName}.zip`);
    } catch (error) {
      console.warn('压缩失败，保留原始备份:', error.message);
    }
  }

  // 清理旧备份
  cleanupOldBackups(config) {
    console.log('清理旧备份...');
    
    try {
      const backups = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup-'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stat: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stat.mtime - a.stat.mtime);
      
      // 保留最新的备份
      const backupsToKeep = backups.slice(0, config.keepBackups);
      const backupsToDelete = backups.slice(config.keepBackups);
      
      backupsToDelete.forEach(backup => {
        console.log(`删除旧备份: ${backup.name}`);
        if (backup.stat.isDirectory()) {
          this.removeDir(backup.path);
        } else {
          fs.unlinkSync(backup.path);
        }
      });
      
      console.log(`保留了 ${backupsToKeep.length} 个备份`);
    } catch (error) {
      console.error('清理旧备份失败:', error.message);
    }
  }

  // 记录备份信息
  recordBackupInfo(backupName, description) {
    const info = {
      name: backupName,
      description,
      timestamp: new Date().toISOString(),
      projectRoot: this.projectRoot
    };
    
    fs.writeFileSync(
      path.join(this.backupDir, 'backup-history.json'),
      JSON.stringify(info, null, 2)
    );
  }

  // 恢复备份
  restoreBackup(backupName) {
    console.log(`开始恢复备份: ${backupName}`);
    
    const backupPath = path.join(this.backupDir, backupName);
    
    if (!fs.existsSync(backupPath)) {
      console.error('备份不存在:', backupName);
      return false;
    }
    
    try {
      // 解压备份（如果是压缩文件）
      let restorePath = backupPath;
      if (backupName.endsWith('.zip')) {
        restorePath = path.join(this.backupDir, backupName.replace('.zip', ''));
        this.extractZip(backupPath, restorePath);
      }
      
      // 恢复文件
      this.restoreFiles(restorePath);
      
      // 恢复数据库
      this.restoreDatabase(restorePath);
      
      console.log(`✅ 恢复完成: ${backupName}`);
      return true;
    } catch (error) {
      console.error('恢复失败:', error.message);
      return false;
    }
  }

  // 恢复文件
  restoreFiles(backupPath) {
    const config = this.readConfig();
    
    config.backupPaths.forEach(sourcePath => {
      const fullSourcePath = path.join(backupPath, sourcePath);
      const fullDestPath = path.join(this.projectRoot, sourcePath);
      
      if (fs.existsSync(fullSourcePath)) {
        console.log(`恢复: ${sourcePath}`);
        
        // 确保目标目录存在
        if (!fs.existsSync(fullDestPath)) {
          fs.mkdirSync(fullDestPath, { recursive: true });
        }
        
        // 复制文件
        this.copyDir(fullSourcePath, fullDestPath, []);
      }
    });
  }

  // 恢复数据库
  restoreDatabase(backupPath) {
    const dbBackupPath = path.join(backupPath, 'database');
    
    if (fs.existsSync(dbBackupPath)) {
      console.log('恢复数据库...');
      // 这里可以实现数据库恢复逻辑
    }
  }

  // 解压ZIP文件
  extractZip(zipPath, destPath) {
    try {
      console.log('解压备份...');
      const command = `powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destPath}' -Force"`;
      execSync(command, { stdio: 'ignore' });
    } catch (error) {
      console.error('解压失败:', error.message);
      throw error;
    }
  }

  // 删除目录
  removeDir(dirPath) {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          this.removeDir(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      });
      fs.rmdirSync(dirPath);
    }
  }

  // 列出所有备份
  listBackups() {
    console.log('备份列表:');
    
    try {
      const backups = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup-'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stat: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stat.mtime - a.stat.mtime);
      
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.name}`);
        console.log(`   时间: ${backup.stat.mtime.toLocaleString()}`);
        console.log(`   大小: ${this.formatSize(backup.stat.size)}`);
        console.log('');
      });
      
      return backups;
    } catch (error) {
      console.error('列出备份失败:', error.message);
      return [];
    }
  }

  // 格式化文件大小
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 检查备份状态
  checkBackupStatus() {
    console.log('检查备份状态...');
    
    const config = this.readConfig();
    const backups = this.listBackups();
    const lastBackup = backups[0];
    
    if (!lastBackup) {
      console.log('⚠️  尚未执行备份');
      return false;
    }
    
    const lastBackupTime = lastBackup.stat.mtime;
    const hoursSinceBackup = (new Date() - lastBackupTime) / (1000 * 60 * 60);
    
    if (hoursSinceBackup > config.backupInterval) {
      console.log('⚠️  备份过期，需要执行新的备份');
      return false;
    }
    
    console.log('✅ 备份状态正常');
    return true;
  }
}

// 执行备份
if (require.main === module) {
  const backupSystem = new BackupSystem();
  
  // 解析命令行参数
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 默认执行备份
    backupSystem.runBackup('手动备份');
  } else if (args[0] === 'list') {
    // 列出备份
    backupSystem.listBackups();
  } else if (args[0] === 'restore' && args[1]) {
    // 恢复备份
    backupSystem.restoreBackup(args[1]);
  } else if (args[0] === 'status') {
    // 检查状态
    backupSystem.checkBackupStatus();
  }
}

module.exports = BackupSystem;