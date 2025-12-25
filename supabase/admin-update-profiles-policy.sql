-- =============================================
-- ADICIONAR POLICY PARA ADMINS EDITAREM PROFILES
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Permitir que admins atualizem perfis de outros usuários
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Verificar se foi criada
SELECT policyname FROM pg_policies WHERE tablename = 'profiles';

