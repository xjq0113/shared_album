# 共享相册 MVP - 设置指南

## 前置要求

- Node.js 18+ 
- npm 或 yarn
- Supabase 账户
- Vercel 账户（用于部署）

## 1. Supabase 项目设置

### 创建新项目
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 记录以下信息：
   - Project URL
   - Anon Key
   - Service Key

### 创建存储桶
1. 在 Supabase Dashboard 中，进入 "Storage"
2. 创建新的 public bucket，名称为 `photos`
3. 配置策略（参考下面的 RLS 章节）

### 运行数据库初始化脚本
1. 在 Supabase Dashboard 中，进入 SQL Editor
2. 创建新的 Query
3. 复制 `scripts/init-database.sql` 的内容
4. 执行脚本

## 2. 本地开发设置

### 克隆项目
```bash
cd shared-album
```

### 创建环境变量文件
```bash
cp .env.example .env.local
```

### 填写环境变量
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 3. Supabase 存储策略配置

### 创建照片上传策略

在 Storage 的 `photos` bucket 中，创建以下 RLS 策略：

**允许已认证用户上传**
```sql
CREATE POLICY "Users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id = 'photos'
  );
```

**允许已认证用户查看他们上传的文件**
```sql
CREATE POLICY "Users can view their album photos"
  ON storage.objects FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'photos'
  );
```

## 4. 部署到 Vercel

### 连接项目
1. 访问 [Vercel](https://vercel.com)
2. 导入项目
3. 选择 Next.js 作为框架

### 设置环境变量
在 Vercel Dashboard 中添加：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `NEXT_PUBLIC_APP_URL=<your-vercel-domain>`

### 部署
点击 "Deploy"，Vercel 会自动部署项目

## 5. 配置自定义域名（可选）

1. 在 Vercel 中添加自定义域名
2. 按照 Vercel 的指示配置 DNS

## 6. 邮件配置（可选）

如果要自定义邮件模板，在 Supabase Dashboard 中：
1. 进入 "Authentication" > "Email Templates"
2. 编辑 "Magic Link" 模板

## 7. 故障排查

### 错误：无法访问存储桶
- 确保 `photos` bucket 已创建
- 检查 RLS 策略是否正确配置

### 错误：认证失败
- 确保 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 正确
- 检查 Supabase 认证是否启用

### 错误：上传失败
- 确保存储桶大小限制设置足够大
- 检查文件大小是否超过限制

## 8. 性能优化建议

- 考虑启用图片压缩
- 添加 CDN 缓存策略
- 定期清理过期的邀请链接

## 9. 安全建议

- 定期轮换 Supabase Service Key
- 启用 RLS 确保数据安全
- 考虑在生产环境中使用私有存储桶 + 签名 URL
- 定期审计数据库访问日志

## 10. 后续迭代

参考 MVP 项目文档中的"后续迭代方向"部分继续开发新功能。
