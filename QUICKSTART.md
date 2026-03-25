# 共享相册 MVP - 快速启动指南

## 5分钟快速开始

### 前置条件
- Node.js 18+ 已安装
- Supabase 账户（免费）

### 步骤 1: 克隆并设置

```bash
# 进入项目目录
cd shared-album

# 安装依赖
npm install
```

### 步骤 2: 配置 Supabase

1. 访问 [Supabase](https://supabase.com) 并登录
2. 创建新项目
3. 等待项目初始化完成
4. 复制 URL 和 Anon Key

### 步骤 3: 创建环境变量

创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_KEY=[YOUR_SERVICE_KEY]
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 步骤 4: 初始化数据库

1. 在 Supabase Dashboard 进入 "SQL Editor"
2. 新建 Query
3. 复制 `scripts/init-database.sql` 内容
4. 执行

### 步骤 5: 创建存储桶

1. 进入 Supabase Dashboard 的 "Storage"
2. 创建新的 public bucket
3. 命名为 `photos`

### 步骤 6: 运行项目

```bash
npm run dev
```

访问 http://localhost:3000

## 功能测试

### 测试流程

1. **登录**
   - 点击"登录"
   - 输入邮箱
   - 查收邮件验证链接

2. **创建相册**
   - 首页点击"创建相册"
   - 输入相册名称
   - 创建成功进入详情页

3. **邀请成员**
   - 相册详情页点击"邀请成员"
   - 复制邀请链接
   - 分享给朋友
   - 新用户打开链接 → 登录 → 自动加入

4. **上传照片**
   - 相册详情页的"上传照片"区域
   - 选择或拖拽照片
   - 等待上传完成

5. **浏览和下载**
   - 点击图片查看大图
   - 点击"下载"按钮保存

## 部署到 Vercel

1. 推送代码到 GitHub
2. 访问 [Vercel](https://vercel.com)
3. 导入项目（选择 GitHub）
4. 添加环境变量
5. 点击部署

## 常见问题

### Q: 邮件验证链接收不到？
A: 检查垃圾箱，或在 Supabase Dashboard 中"Authentication" → "Email Templates"中配置

### Q: 上传照片失败？
A: 确保 `photos` storage bucket 已创建，且 RLS 策略正确

### Q: 邀请链接不工作？
A: 确保被邀请的用户已登录或登录后重试

### Q: 如何切换成私有存储？
A: 参考 SETUP.md 中的"存储策略配置"部分

## 获取帮助

- 项目文档: `README.md`
- 设置指南: `SETUP.md`
- 原始需求: `../mvp_shared_album_project.md`
- 进度跟踪: `../../jiaqixu-progress.md`

## 下一步

项目已完成 MVP 功能！现在可以：

1. ✅ 本地测试
2. ✅ 部署到 Vercel
3. ✅ 邀请朋友试用
4. ✅ 收集反馈
5. ✅ 计划后续功能迭代

祝你使用愉快！🎉
