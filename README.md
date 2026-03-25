# 共享相册 MVP

一个用于朋友间分享旅行照片的网页版相册应用。

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: Next.js Server Actions / Route Handlers
- **数据库**: Supabase PostgreSQL
- **文件存储**: Supabase Storage
- **认证**: Supabase Auth
- **部署**: Vercel

## 快速开始

### 环境配置

1. 创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

2. 安装依赖：

```bash
npm install
```

3. 运行开发服务器：

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
app/                   # 页面和 API 路由
├── login/            # 登录页
├── albums/           # 相册页面
│   ├── new/         # 创建相册
│   └── [id]/        # 相册详情
├── invite/          # 邀请加入
│   └── [token]/
└── api/             # API 路由

components/          # React 组件
├── Header.tsx
├── AlbumCard.tsx
├── PhotoGrid.tsx
└── ...

lib/                 # 工具函数和配置
├── supabase.ts      # Supabase 客户端
├── auth.ts          # 认证相关
└── utils/

types/               # TypeScript 类型定义
```

## MVP 功能

- [x] 用户登录
- [ ] 创建相册
- [ ] 查看相册列表
- [ ] 上传图片
- [ ] 浏览图片
- [ ] 邀请成员
- [ ] 下载图片

## 数据库表

- `albums` - 相册信息
- `album_members` - 相册成员
- `photos` - 照片信息
- `invites` - 邀请链接

详见项目文档 `mvp_shared_album_project.md`
