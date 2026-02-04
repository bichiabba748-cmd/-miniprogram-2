# Git使用说明

## 常用命令

### 1. 提交代码
```bash
git add .
git commit -m "描述你做了什么"
```

### 2. 推送到GitHub
```bash
git push origin main
```

### 3. 拉取远程代码
```bash
git pull origin main
```

## 问题解决

### 推送冲突时
**问题原因**：本地和远程历史不相关

**解决方法**：
```bash
git push origin main --force
```

**说明**：强制推送会用本地覆盖远程，适用于远程是旧版本的情况

### index.lock文件被占用
**问题原因**：Git进程异常退出

**解决方法**：
```bash
Remove-Item .git/index.lock -Force
```

## 什么时候需要拉取
- 在GitHub网页上直接改了代码
- 别人推了新代码到GitHub
- 换电脑继续开发时

## 什么时候需要合并
- 一般不需要手动合并
- `git pull` 会自动合并
- 如果有冲突，需要手动解决

## 记住这3个命令就够了
- `git push` - 上传代码
- `git pull` - 下载代码
- `git commit` - 保存修改

## 历史问题记录

### 2026-02-03 - Git推送冲突
**问题**：本地有最新提交（v2.2.5），但远程仓库是旧版本，本地和远程历史不相关

**解决过程**：
1. 直接推送失败 - 远程有本地没有的提交
2. 拉取失败 - 历史不相关
3. 允许不相关历史拉取 - 产生大量冲突
4. 选择强制推送 - 用本地覆盖远程

**关键命令**：
```bash
git push origin main --force
```

**经验总结**：
- 本地和远程历史不相关时，直接用 `--force` 强制推送
- 不需要先pull，直接force push更快
- 强制推送会覆盖远程所有内容
