-- =============================================
-- CONFIGURAÇÃO DE ADMIN - CLUBE DO ECG
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Adicionar coluna role na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'admin', 'instructor'));

-- 2. Criar índice para busca por role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Atualizar políticas RLS para permitir admins verem tudo

-- Admins podem ver todos os profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Políticas de admin para cursos (CRUD completo)
CREATE POLICY "Admins can do everything on courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Políticas de admin para modules
CREATE POLICY "Admins can do everything on modules" ON public.modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Políticas de admin para lessons
CREATE POLICY "Admins can do everything on lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Políticas de admin para quizzes
CREATE POLICY "Admins can do everything on quizzes" ON public.quizzes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Políticas de admin para quiz_questions
CREATE POLICY "Admins can do everything on quiz_questions" ON public.quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 9. Políticas de admin para course_resources
CREATE POLICY "Admins can do everything on course_resources" ON public.course_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 10. Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Função para promover usuário a admin (use com cuidado!)
-- Execute: SELECT promote_to_admin('email@exemplo.com');
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.profiles 
  SET role = 'admin', updated_at = NOW()
  WHERE email = user_email;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count > 0 THEN
    RETURN 'Usuário ' || user_email || ' promovido a admin com sucesso!';
  ELSE
    RETURN 'Usuário não encontrado: ' || user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PARA PROMOVER VOCÊ A ADMIN, EXECUTE:
-- SELECT promote_to_admin('juan.leiro@gmail.com');
-- =============================================

