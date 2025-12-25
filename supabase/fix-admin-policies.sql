-- =============================================
-- CORREÇÃO DAS POLÍTICAS DE ADMIN - CLUBE DO ECG
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Primeiro, remover as políticas problemáticas
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything on courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can do everything on modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can do everything on lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can do everything on quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can do everything on quiz_questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins can do everything on course_resources" ON public.course_resources;

-- 2. Criar função segura para verificar admin (evita recursão)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- 3. Recriar políticas usando a função (evita recursão)

-- Profiles: usuários veem o próprio perfil OU admins veem todos
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR public.is_admin(auth.uid())
  );

-- Courses: todos podem ver, admins podem tudo
CREATE POLICY "Admins can insert courses" ON public.courses
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update courses" ON public.courses
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete courses" ON public.courses
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Modules: todos podem ver, admins podem tudo
CREATE POLICY "Admins can insert modules" ON public.modules
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update modules" ON public.modules
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete modules" ON public.modules
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Lessons: todos podem ver, admins podem tudo
CREATE POLICY "Admins can insert lessons" ON public.lessons
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update lessons" ON public.lessons
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete lessons" ON public.lessons
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Quizzes: todos podem ver, admins podem tudo
CREATE POLICY "Admins can insert quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update quizzes" ON public.quizzes
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete quizzes" ON public.quizzes
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Quiz Questions: todos podem ver, admins podem tudo
CREATE POLICY "Admins can insert quiz_questions" ON public.quiz_questions
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update quiz_questions" ON public.quiz_questions
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete quiz_questions" ON public.quiz_questions
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Course Resources: todos podem ver, admins podem tudo
CREATE POLICY "Admins can insert course_resources" ON public.course_resources
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update course_resources" ON public.course_resources
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete course_resources" ON public.course_resources
  FOR DELETE USING (public.is_admin(auth.uid()));

-- =============================================
-- PRONTO! Agora recarregue a página /admin
-- =============================================

