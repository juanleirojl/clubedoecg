-- =============================================
-- OTIMIZAÇÕES DE PRODUÇÃO PARA ESCALA
-- Execute no Supabase SQL Editor
-- Data: 2024-12-25
-- =============================================

-- =============================================
-- 1. ÍNDICES ADICIONAIS PARA ALTA ESCALA
-- =============================================

-- Índice para busca de curso por slug (muito usado em rotas)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_slug_published 
ON courses(slug) 
WHERE is_published = true;

-- Índice covering para aulas (evita table lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_module_covering 
ON lessons(module_id, order_index, id, title, duration_seconds, is_free);

-- Índice para ordenação recente de progresso
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_user_recent 
ON user_lesson_progress(user_id, updated_at DESC) 
WHERE completed = true;

-- Índice para quiz attempts com score alto
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_attempts_passed 
ON quiz_attempts(user_id, quiz_id) 
WHERE score >= 100;

-- =============================================
-- 2. FUNÇÃO OTIMIZADA PARA BUSCAR DADOS INICIAIS
-- Uma única chamada para todo o contexto do usuário
-- =============================================

CREATE OR REPLACE FUNCTION get_user_context(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET statement_timeout = '10s'
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (
      SELECT json_build_object(
        'id', p.id,
        'email', p.email,
        'full_name', p.full_name,
        'avatar_url', p.avatar_url,
        'role', p.role,
        'subscription_plan', p.subscription_plan,
        'total_watch_time', COALESCE(p.total_watch_time, 0),
        'current_streak', COALESCE(p.current_streak, 0)
      )
      FROM profiles p
      WHERE p.id = p_user_id
    ),
    'stats', json_build_object(
      'lessons_completed', (
        SELECT COUNT(*) FROM user_lesson_progress 
        WHERE user_id = p_user_id AND completed = true
      ),
      'quizzes_passed', (
        SELECT COUNT(DISTINCT quiz_id) FROM quiz_attempts 
        WHERE user_id = p_user_id AND score >= 100
      )
    ),
    'completed_lesson_ids', (
      SELECT COALESCE(json_agg(lesson_id), '[]'::json)
      FROM user_lesson_progress
      WHERE user_id = p_user_id AND completed = true
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- =============================================
-- 3. FUNÇÃO PARA ATUALIZAÇÃO ATÔMICA DE PROGRESSO
-- Evita race conditions em atualizações simultâneas
-- =============================================

CREATE OR REPLACE FUNCTION update_lesson_progress_atomic(
  p_user_id UUID,
  p_lesson_id UUID,
  p_watch_time_seconds INTEGER,
  p_last_position_seconds INTEGER,
  p_completed BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_lesson_progress (
    user_id, 
    lesson_id, 
    watch_time_seconds, 
    last_position_seconds, 
    completed,
    completed_at,
    updated_at
  )
  VALUES (
    p_user_id, 
    p_lesson_id, 
    p_watch_time_seconds, 
    p_last_position_seconds, 
    p_completed,
    CASE WHEN p_completed THEN NOW() ELSE NULL END,
    NOW()
  )
  ON CONFLICT (user_id, lesson_id) 
  DO UPDATE SET
    watch_time_seconds = GREATEST(
      user_lesson_progress.watch_time_seconds, 
      EXCLUDED.watch_time_seconds
    ),
    last_position_seconds = EXCLUDED.last_position_seconds,
    completed = user_lesson_progress.completed OR EXCLUDED.completed,
    completed_at = COALESCE(
      user_lesson_progress.completed_at, 
      CASE WHEN EXCLUDED.completed THEN NOW() ELSE NULL END
    ),
    updated_at = NOW();
END;
$$;

-- =============================================
-- 4. FUNÇÃO PARA ATUALIZAR STREAK E TEMPO
-- Chamada uma vez por dia, não a cada segundo
-- =============================================

CREATE OR REPLACE FUNCTION update_user_activity(
  p_user_id UUID,
  p_additional_watch_time INTEGER DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_new_streak INTEGER;
  v_result JSON;
BEGIN
  -- Buscar dados atuais
  SELECT last_activity_date, current_streak
  INTO v_last_activity, v_current_streak
  FROM profiles
  WHERE id = p_user_id;
  
  -- Calcular novo streak
  IF v_last_activity IS NULL OR v_last_activity < v_today - 1 THEN
    v_new_streak := 1;
  ELSIF v_last_activity = v_today - 1 THEN
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
  ELSE
    v_new_streak := COALESCE(v_current_streak, 1);
  END IF;
  
  -- Atualizar apenas se necessário
  IF v_last_activity IS NULL OR v_last_activity < v_today OR p_additional_watch_time > 0 THEN
    UPDATE profiles
    SET 
      current_streak = v_new_streak,
      last_activity_date = v_today,
      total_watch_time = COALESCE(total_watch_time, 0) + p_additional_watch_time,
      updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
  
  SELECT json_build_object(
    'new_streak', v_new_streak,
    'last_activity', v_today
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- =============================================
-- 5. VIEW MATERIALIZADA PARA ESTATÍSTICAS DE CURSOS
-- Atualizar periodicamente via cron
-- =============================================

DROP MATERIALIZED VIEW IF EXISTS mv_course_stats;
CREATE MATERIALIZED VIEW mv_course_stats AS
SELECT 
  c.id as course_id,
  c.slug,
  c.title,
  c.difficulty,
  COUNT(DISTINCT m.id) as modules_count,
  COUNT(DISTINCT l.id) as lessons_count,
  COALESCE(SUM(l.duration_seconds), 0) as total_duration_seconds
FROM courses c
LEFT JOIN modules m ON m.course_id = c.id
LEFT JOIN lessons l ON l.module_id = m.id
WHERE c.is_published = true
GROUP BY c.id, c.slug, c.title, c.difficulty;

CREATE UNIQUE INDEX ON mv_course_stats(course_id);
CREATE INDEX ON mv_course_stats(slug);

-- Criar função para refresh (chamar via cron ou Edge Function)
CREATE OR REPLACE FUNCTION refresh_course_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_course_stats;
END;
$$;

-- =============================================
-- 6. POLÍTICAS RLS OTIMIZADAS
-- =============================================

-- Política para leitura de cursos públicos (sem verificação de auth)
DROP POLICY IF EXISTS "Anyone can read published courses" ON courses;
CREATE POLICY "Anyone can read published courses"
ON courses FOR SELECT
USING (is_published = true);

-- Política eficiente para progresso do usuário
DROP POLICY IF EXISTS "Users can manage own progress" ON user_lesson_progress;
CREATE POLICY "Users can manage own progress"
ON user_lesson_progress FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 7. CONFIGURAÇÕES DE PERFORMANCE
-- =============================================

-- Garantir que RLS está habilitado
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Política permissiva para módulos e aulas (conteúdo público)
DROP POLICY IF EXISTS "Anyone can read modules" ON modules;
CREATE POLICY "Anyone can read modules"
ON modules FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Anyone can read lessons" ON lessons;
CREATE POLICY "Anyone can read lessons"
ON lessons FOR SELECT
USING (true);

-- =============================================
-- 8. ANALYZE PARA OTIMIZAR PLANNER
-- =============================================

ANALYZE courses;
ANALYZE modules;
ANALYZE lessons;
ANALYZE user_lesson_progress;
ANALYZE quiz_attempts;
ANALYZE profiles;

-- =============================================
-- 9. GRANT PERMISSIONS
-- =============================================

GRANT EXECUTE ON FUNCTION get_user_context(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_lesson_progress_atomic(UUID, UUID, INTEGER, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_activity(UUID, INTEGER) TO authenticated;
GRANT SELECT ON mv_course_stats TO authenticated, anon;

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================

SELECT 
  'Índices criados' as status,
  COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public';

SELECT 
  'Funções criadas' as status,
  COUNT(*) as count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';


