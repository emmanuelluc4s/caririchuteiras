-- ============================================================
-- RLS policies — Cariri Chuteiras (Módulo 12)
-- ============================================================
-- COMO RODAR:
-- 1) Supabase Dashboard → SQL Editor
-- 2) Copiar este arquivo inteiro
-- 3) Run (uma vez por projeto)
--
-- Defesa em profundidade — Server Actions usam SERVICE_ROLE_KEY
-- e bypassam RLS, mas as policies cobrem qualquer chamada que
-- vier do ANON key (cliente).
-- ============================================================

-- ─────────────── Helpers ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_admin_role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT role::text FROM "AdminUser"
  WHERE "supabaseId" = auth.uid()::text
    AND "isActive" = true
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_user_can_mutate()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT public.current_admin_role() IN ('admin', 'editor')
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT public.current_admin_role() = 'admin'
$$;

-- ─────────────── Product ────────────────────────────────────
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read for active products" ON "Product";
CREATE POLICY "Public read for active products"
  ON "Product" FOR SELECT
  USING ("isActive" = true OR public.current_user_can_mutate());

DROP POLICY IF EXISTS "Admins/Editors can insert products" ON "Product";
CREATE POLICY "Admins/Editors can insert products"
  ON "Product" FOR INSERT
  WITH CHECK (public.current_user_can_mutate());

DROP POLICY IF EXISTS "Admins/Editors can update products" ON "Product";
CREATE POLICY "Admins/Editors can update products"
  ON "Product" FOR UPDATE
  USING (public.current_user_can_mutate());

DROP POLICY IF EXISTS "Only admins can delete products" ON "Product";
CREATE POLICY "Only admins can delete products"
  ON "Product" FOR DELETE
  USING (public.current_user_is_admin());

-- ─────────────── Category ───────────────────────────────────
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON "Category";
CREATE POLICY "Public read categories" ON "Category" FOR SELECT
  USING ("isActive" = true OR public.current_user_can_mutate());
DROP POLICY IF EXISTS "Mutate categories" ON "Category";
CREATE POLICY "Mutate categories" ON "Category" FOR INSERT
  WITH CHECK (public.current_user_can_mutate());
DROP POLICY IF EXISTS "Update categories" ON "Category";
CREATE POLICY "Update categories" ON "Category" FOR UPDATE
  USING (public.current_user_can_mutate());
DROP POLICY IF EXISTS "Delete categories" ON "Category";
CREATE POLICY "Delete categories" ON "Category" FOR DELETE
  USING (public.current_user_is_admin());

-- ─────────────── Coupon ─────────────────────────────────────
ALTER TABLE "Coupon" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read coupons" ON "Coupon";
CREATE POLICY "Public read coupons" ON "Coupon" FOR SELECT
  USING ("isActive" = true OR public.current_user_can_mutate());
DROP POLICY IF EXISTS "Mutate coupons" ON "Coupon";
CREATE POLICY "Mutate coupons" ON "Coupon" FOR INSERT
  WITH CHECK (public.current_user_can_mutate());
DROP POLICY IF EXISTS "Update coupons" ON "Coupon";
CREATE POLICY "Update coupons" ON "Coupon" FOR UPDATE
  USING (public.current_user_can_mutate());
DROP POLICY IF EXISTS "Delete coupons" ON "Coupon";
CREATE POLICY "Delete coupons" ON "Coupon" FOR DELETE
  USING (public.current_user_is_admin());

-- ─────────────── Review ─────────────────────────────────────
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read approved reviews" ON "Review";
CREATE POLICY "Public read approved reviews" ON "Review" FOR SELECT
  USING ("isApproved" = true OR public.current_user_can_mutate());
DROP POLICY IF EXISTS "Insert reviews" ON "Review";
CREATE POLICY "Insert reviews" ON "Review" FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Update reviews" ON "Review";
CREATE POLICY "Update reviews" ON "Review" FOR UPDATE
  USING (public.current_user_can_mutate());
DROP POLICY IF EXISTS "Delete reviews" ON "Review";
CREATE POLICY "Delete reviews" ON "Review" FOR DELETE
  USING (public.current_user_is_admin());

-- ─────────────── ProductImage / ProductVariant ──────────────
ALTER TABLE "ProductImage" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Mirror product access" ON "ProductImage";
CREATE POLICY "Mirror product access" ON "ProductImage" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Product"
      WHERE "Product"."id" = "ProductImage"."productId"
        AND ("Product"."isActive" = true OR public.current_user_can_mutate())
    )
  );

ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Mirror product access for variants" ON "ProductVariant";
CREATE POLICY "Mirror product access for variants" ON "ProductVariant" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Product"
      WHERE "Product"."id" = "ProductVariant"."productId"
        AND ("Product"."isActive" = true OR public.current_user_can_mutate())
    )
  );

-- ─────────────── AdminUser ──────────────────────────────────
ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view AdminUsers" ON "AdminUser";
CREATE POLICY "Admins can view AdminUsers" ON "AdminUser" FOR SELECT
  USING (public.current_user_is_admin() OR "supabaseId" = auth.uid()::text);
DROP POLICY IF EXISTS "Admins can mutate AdminUsers" ON "AdminUser";
CREATE POLICY "Admins can mutate AdminUsers" ON "AdminUser" FOR ALL
  USING (public.current_user_is_admin());

-- ─────────────── SiteConfig ─────────────────────────────────
ALTER TABLE "SiteConfig" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read SiteConfig" ON "SiteConfig";
CREATE POLICY "Public read SiteConfig" ON "SiteConfig" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only admins write SiteConfig" ON "SiteConfig";
CREATE POLICY "Only admins write SiteConfig" ON "SiteConfig" FOR ALL
  USING (public.current_user_is_admin());

-- ─────────────── SiteEvent (analytics) ──────────────────────
ALTER TABLE "SiteEvent" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Insert events public" ON "SiteEvent";
CREATE POLICY "Insert events public" ON "SiteEvent" FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Only admins read events" ON "SiteEvent";
CREATE POLICY "Only admins read events" ON "SiteEvent" FOR SELECT
  USING (public.current_admin_role() IS NOT NULL);

-- ─────────────── AuditLog ───────────────────────────────────
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins read AuditLog" ON "AuditLog";
CREATE POLICY "Only admins read AuditLog" ON "AuditLog" FOR SELECT
  USING (public.current_user_is_admin());
DROP POLICY IF EXISTS "Insert via service role only" ON "AuditLog";
CREATE POLICY "Insert via service role only" ON "AuditLog" FOR INSERT
  WITH CHECK (public.current_user_can_mutate());

-- ─────────────── WhatsappLead ───────────────────────────────
ALTER TABLE "WhatsappLead" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Insert leads public" ON "WhatsappLead";
CREATE POLICY "Insert leads public" ON "WhatsappLead" FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Only admins read leads" ON "WhatsappLead";
CREATE POLICY "Only admins read leads" ON "WhatsappLead" FOR SELECT
  USING (public.current_admin_role() IS NOT NULL);

-- ─────────────── Storage: avatars ───────────────────────────
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
