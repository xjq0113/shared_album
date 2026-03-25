# 共享相册 MVP - 快速启动指南

## 5 分钟快速开始

### 前置条件
- Node.js 18+ 已安装
- Supabase 账户（免费）

### 步骤 1: 克隆并安装

```bash
cd shared-album
npm install
```

### 步骤 2: 配置 Supabase

1. 访问 [Supabase](https://supabase.com) 并登录
2. 创建新项目
3. 等待项目初始化完成
4. 在 Project Settings > API 中复制 URL 和 Anon Key

### 步骤 3: 创建环境变量

在项目根目录创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_KEY=[YOUR_SERVICE_KEY]
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 步骤 4: 初始化数据库

1. 进入 Supabase Dashboard > **SQL Editor**
2. 新建 Query
3. 复制 `scripts/init-database.sql` 的内容并粘贴
4. 点击运行

然后关闭 RLS（在 SQL Editor 中运行）：

```sql
ALTER TABLE albums DISABLE ROW LEVEL SECURITY;
ALTER TABLE album_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE invites DISABLE ROW LEVEL SECURITY;
```

### 步骤 5: 创建存储桶

1. 进入 Supabase Dashboard > **Storage**
2. 点击 **New bucket**
3. 名称填 `photos`，勾选 **Public bucket**
4. 创建后进入该桶，点击 **Policies** 标签
5. 添加策略：Allowed operation 选 **INSERT**，Target roles 选 **authenticated**

### 步骤 6: 创建用户

本应用使用邮箱+密码登录，不支持自行注册，需要手动添加用户：

1. 进入 Supabase Dashboard > **Authentication** > **Users**
2. 点击 **Add user** > **Create new user**
3. 输入邮箱和密码
4. 确保在 Authentication > Settings 中开启了 **Auto Confirm User**

### 步骤 7: 本地运行

```bash
npm run dev
```

打开 http://localhost:3000

## 功能说明

### 使用流程

1. **登录**
   - 输入邮箱和密码
   - 仅预先注册的用户可以登录

2. **创建相册**
   - 首页点击 "+ New Album"
   - 输入相册名称
   - 创建成功后跳转到相册详情页

3. **邀请成员**
   - 相册详情页点击 "Invite Members"
   - 生成并复制邀请链接
   - 分享给朋友
   - 朋友打开链接 > 登录 > 自动加入相册

4. **上传照片**
   - 相册详情页点击 "Select photos to upload"
   - 选择一张或多张图片

5. **查看和下载**
   - 点击照片查看大图预览
   - 点击 "Download" 下载单张

6. **删除照片**
   - 点击照片 > 在预览中点击 "Delete" 删除单张
   - 或点击 "Select" 进入批量模式 > 选择照片 > "Delete (N)" 批量删除

7. **删除相册**
   - 相册所有者可以点击 "Delete Album"（会同时删除所有照片和成员记录）

## 部署到 Netlify

1. 将代码推送到 GitHub
2. 访问 [Netlify](https://app.netlify.com)，用 GitHub 账号登录
3. 点击 **Add new site** > **Import an existing project**
4. 选择你的 GitHub 仓库
5. 构建配置会从 `netlify.toml` 自动识别
6. 添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`（你的 Netlify 站点地址，如 `https://xxx.netlify.app`）
7. 点击 **Deploy site**

部署完成后，记得将 `NEXT_PUBLIC_APP_URL` 更新为实际的 Netlify 地址。

## 常见问题

### Q: 上传照片失败？
A: 确保 `photos` 存储桶已创建，且添加了 INSERT 策略（Target roles 选 authenticated）。

### Q: 邀请链接不起作用？
A: 被邀请的用户必须先登录。如果还没有账号，需要在 Supabase 后台手动创建。

### Q: 如何添加新用户？
A: 进入 Supabase Dashboard > Authentication > Users > Add user，手动添加。只有手动添加的用户才能登录。

### Q: Netlify 构建失败？
A: 检查 Netlify 的 Site settings 里是否正确设置了 3 个环境变量。
