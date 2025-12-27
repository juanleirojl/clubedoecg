-- ================================================
-- ÍNDICES DE PERFORMANCE PARA ESCALA
-- Execute este script no Supabase SQL Editor
-- ================================================

-- 1. Índice para busca de progresso por usuário e aula (MUITO usado)
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_lesson 
ON user_lesson_progress(user_id, lesson_id);

-- 2. Índice para aulas completadas por usuário (usado no dashboard e sidebar)
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_completed 
ON user_lesson_progress(user_id) 
WHERE completed = true;

-- 3. Índice para cursos publicados (filtro comum)
CREATE INDEX IF NOT EXISTS idx_courses_published 
ON courses(is_published) 
WHERE is_published = true;

-- 4. Índice para módulos por curso (JOIN frequente)
CREATE INDEX IF NOT EXISTS idx_modules_course_id 
ON modules(course_id);

-- 5. Índice para aulas por módulo (JOIN frequente)
CREATE INDEX IF NOT EXISTS idx_lessons_module_id 
ON lessons(module_id);

-- 6. Índice para ordenação de módulos
CREATE INDEX IF NOT EXISTS idx_modules_order 
ON modules(course_id, order_index);

-- 7. Índice para ordenação de aulas
CREATE INDEX IF NOT EXISTS idx_lessons_order 
ON lessons(module_id, order_index);

-- 8. Índice para quizzes por módulo
CREATE INDEX IF NOT EXISTS idx_quizzes_module_id 
ON quizzes(module_id);

-- 9. Índice para questões do quiz
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id 
ON quiz_questions(quiz_id);

-- 10. Índice para tentativas de quiz por usuário
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz 
ON quiz_attempts(user_id, quiz_id);

-- 11. Índice para busca de curso por slug (muito usado em rotas)
CREATE INDEX IF NOT EXISTS idx_courses_slug 
ON courses(slug);

-- 12. Índice para perfis por subscription_plan (para relatórios admin)
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan 
ON profiles(subscription_plan);

-- ================================================
-- FUNÇÃO RPC PARA INCREMENTAR TEMPO DE ESTUDO
-- Operação atômica para evitar race conditions
-- ================================================

CREATE OR REPLACE FUNCTION increment_watch_time(
  user_id_param UUID,
  seconds_param INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET total_watch_time = COALESCE(total_watch_time, 0) + seconds_param
  WHERE id = user_id_param;
END;
$$;

-- ================================================
-- FUNÇÃO RPC PARA OBTER PROGRESSO DO CURSO ATUAL
-- Reduz múltiplas queries para uma única
-- ================================================

CREATE OR REPLACE FUNCTION get_current_course_progress(p_user_id UUID)
RETURNS TABLE (
  course_id UUID,
  course_title TEXT,
  course_slug TEXT,
  difficulty TEXT,
  total_lessons BIGINT,
  completed_lessons BIGINT,
  progress_percentage INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH course_stats AS (
    SELECT 
      c.id,
      c.title,
      c.slug,
      c.difficulty,
      COUNT(DISTINCT l.id) as total,
      COUNT(DISTINCT CASE WHEN ulp.completed = true THEN l.id END) as completed
    FROM courses c
    LEFT JOIN modules m ON m.course_id = c.id
    LEFT JOIN lessons l ON l.module_id = m.id
    LEFT JOIN user_lesson_progress ulp ON ulp.lesson_id = l.id AND ulp.user_id = p_user_id
    WHERE c.is_published = true
    GROUP BY c.id, c.title, c.slug, c.difficulty, c.created_at
    ORDER BY c.created_at ASC
  )
  SELECT 
    cs.id,
    cs.title,
    cs.slug,
    cs.difficulty,
    cs.total,
    cs.completed,
    CASE WHEN cs.total > 0 
      THEN ROUND((cs.completed::NUMERIC / cs.total::NUMERIC) * 100)::INTEGER 
      ELSE 0 
    END
  FROM course_stats cs
  WHERE cs.completed > 0 AND cs.completed < cs.total
  ORDER BY cs.completed DESC
  LIMIT 1;
END;
$$;

-- ================================================
-- FUNÇÃO RPC PARA OBTER STATS DO DASHBOARD
-- Uma única chamada para todas as estatísticas
-- ================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID)
RETURNS TABLE (
  lessons_completed BIGINT,
  total_watch_time INTEGER,
  quizzes_passed BIGINT,
  current_streak INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM user_lesson_progress WHERE user_id = p_user_id AND completed = true),
    COALESCE((SELECT p.total_watch_time FROM profiles p WHERE p.id = p_user_id), 0),
    (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = p_user_id AND score >= 100),
    COALESCE((SELECT p.current_streak FROM profiles p WHERE p.id = p_user_id), 0);
END;
$$;

-- ================================================
-- PERMISSÕES RLS (Row Level Security)
-- Certifique-se de que as políticas estão otimizadas
-- ================================================

-- Verificar se as políticas existem antes de criar
DO $$
BEGIN
  -- Política para user_lesson_progress
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_lesson_progress' 
    AND policyname = 'Users can manage their own progress'
  ) THEN
    CREATE POLICY "Users can manage their own progress"
    ON user_lesson_progress
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ================================================
-- ANALYZE para atualizar estatísticas
-- Execute após criar os índices
-- ================================================

ANALYZE courses;
ANALYZE modules;
ANALYZE lessons;
ANALYZE user_lesson_progress;
ANALYZE quiz_attempts;
ANALYZE profiles;

-- ================================================
-- VERIFICAR ÍNDICES CRIADOS
-- ================================================

-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;





