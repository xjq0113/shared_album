-- ============================================
-- 简化 RLS 策略 - 先让应用跑通
-- 在 Supabase Dashboard → SQL Editor 中运行
-- ============================================

-- 1. 删除所有旧策略（覆盖所有可能存在的名称）
DROP POLICY IF EXISTS "Users can view albums they are members of" ON albums;
DROP POLICY IF EXISTS "Users can create albums" ON albums;
DROP POLICY IF EXISTS "Users can view album members" ON album_members;
DROP POLICY IF EXISTS "Users can insert album members" ON album_members;
DROP POLICY IF EXISTS "Album owners can insert members" ON album_members;
DROP POLICY IF EXISTS "Users can view photos in their albums" ON photos;
DROP POLICY IF EXISTS "Users can upload photos to their albums" ON photos;
DROP POLICY IF EXISTS "Users can view invites for their albums" ON invites;
DROP POLICY IF EXISTS "Users can create invites for their albums" ON invites;

-- 2. 新策略：已登录用户可以进行所有操作
CREATE POLICY "auth_select" ON albums FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON albums FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON albums FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON albums FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth_select" ON album_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON album_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON album_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON album_members FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth_select" ON photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON photos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON photos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON photos FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth_select" ON invites FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON invites FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON invites FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON invites FOR DELETE TO authenticated USING (true);
