-- 创建 albums 表
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建 album_members 表
CREATE TABLE IF NOT EXISTS album_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(album_id, user_id)
);

-- 创建 photos 表
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建 invites 表
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  token VARCHAR(100) NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expired_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_albums_owner_id ON albums(owner_id);
CREATE INDEX IF NOT EXISTS idx_album_members_album_id ON album_members(album_id);
CREATE INDEX IF NOT EXISTS idx_album_members_user_id ON album_members(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_expired_at ON invites(expired_at);

-- 启用 RLS（行级安全）
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- 辅助函数：检查用户是否是相册成员（SECURITY DEFINER 绕过 RLS 避免递归）
CREATE OR REPLACE FUNCTION is_album_member(album_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM album_members
    WHERE album_id = album_uuid AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS 策略 - albums 表
CREATE POLICY "Users can view albums they are members of"
  ON albums FOR SELECT
  USING (owner_id = auth.uid() OR is_album_member(id));

CREATE POLICY "Users can create albums"
  ON albums FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- RLS 策略 - album_members 表
CREATE POLICY "Users can view album members"
  ON album_members FOR SELECT
  USING (is_album_member(album_id));

CREATE POLICY "Album owners can insert members"
  ON album_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      album_id IN (SELECT id FROM albums WHERE owner_id = auth.uid())
      OR album_id IN (SELECT album_id FROM invites WHERE expired_at > now())
    )
  );

-- RLS 策略 - photos 表
CREATE POLICY "Users can view photos in their albums"
  ON photos FOR SELECT
  USING (is_album_member(album_id));

CREATE POLICY "Users can upload photos to their albums"
  ON photos FOR INSERT
  WITH CHECK (is_album_member(album_id) AND uploader_id = auth.uid());

-- RLS 策略 - invites 表
CREATE POLICY "Users can view invites for their albums"
  ON invites FOR SELECT
  USING (album_id IN (SELECT id FROM albums WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create invites for their albums"
  ON invites FOR INSERT
  WITH CHECK (
    album_id IN (SELECT id FROM albums WHERE owner_id = auth.uid())
    AND created_by = auth.uid()
  );
