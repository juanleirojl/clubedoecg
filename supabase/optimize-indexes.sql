-- =============================================
-- ÍNDICES OTIMIZADOS PARA PRODUÇÃO
-- Executar no Supabase SQL Editor
-- =============================================

-- 1. Índices compostos para consultas frequentes

-- user_lesson_progress: consultas por usuário + completed
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_completed 
ON public.user_lesson_progress(user_id, completed) 
WHERE completed = true;

-- user_lesson_progress: ordenação por updated_at (para "curso atual")
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_updated 
ON public.user_lesson_progress(user_id, updated_at DESC);

-- courses: cursos publicados ordenados por data
CREATE INDEX IF NOT EXISTS idx_courses_published_created 
ON public.courses(created_at) 
WHERE is_published = true;

-- modules: ordenação por curso e ordem
CREATE INDEX IF NOT EXISTS idx_modules_course_order 
ON public.modules(course_id, order_index);

-- lessons: ordenação por módulo e ordem
CREATE INDEX IF NOT EXISTS idx_lessons_module_order 
ON public.lessons(module_id, order_index);

-- quiz_attempts: consultas por usuário + score alto
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_score 
ON public.quiz_attempts(user_id, score DESC);

-- 2. Função RPC para incrementar tempo de estudo (atômica)
CREATE OR REPLACE FUNCTION increment_watch_time(user_id_param UUID, seconds_param INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET total_watch_time = COALESCE(total_watch_time, 0) + seconds_param
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função para buscar estatísticas do usuário em UMA query
CREATE OR REPLACE FUNCTION get_user_stats(user_id_param UUID)
RETURNS TABLE (
  lessons_completed BIGINT,
  total_watch_time INTEGER,
  current_streak INTEGER,
  quizzes_passed BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.user_lesson_progress WHERE user_id = user_id_param AND completed = true) as lessons_completed,
    COALESCE(p.total_watch_time, 0) as total_watch_time,
    COALESCE(p.current_streak, 0) as current_streak,
    (SELECT COUNT(*) FROM public.quiz_attempts WHERE user_id = user_id_param AND score >= 100) as quizzes_passed
  FROM public.profiles p
  WHERE p.id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. View materializada para contagem de aulas por curso (refresh periódico)
-- Nota: Descomentar se tiver muitos cursos
/*
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_course_lesson_counts AS
SELECT 
  c.id as course_id,
  c.slug,
  COUNT(DISTINCT l.id) as total_lessons,
  SUM(l.duration_seconds) as total_duration
FROM public.courses c
LEFT JOIN public.modules m ON m.course_id = c.id
LEFT JOIN public.lessons l ON l.module_id = m.id
WHERE c.is_published = true
GROUP BY c.id, c.slug;

CREATE UNIQUE INDEX ON mv_course_lesson_counts(course_id);

-- Para atualizar: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_course_lesson_counts;
*/

-- 5. Política de cache headers (para Supabase Edge)
-- Configurar no dashboard do Supabase em Settings > API

-- 6. Comentários para documentação
COMMENT ON INDEX idx_user_lesson_progress_user_completed IS 'Otimiza contagem de aulas completadas por usuário';
COMMENT ON INDEX idx_user_lesson_progress_user_updated IS 'Otimiza busca do curso atual do usuário';
COMMENT ON INDEX idx_courses_published_created IS 'Otimiza listagem de cursos publicados';
COMMENT ON FUNCTION increment_watch_time IS 'Incrementa tempo de estudo de forma atômica';
COMMENT ON FUNCTION get_user_stats IS 'Busca todas as estatísticas do usuário em uma query';

-- 7. Verificar se os índices foram criados
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('user_lesson_progress', 'courses', 'modules', 'lessons', 'quiz_attempts')
ORDER BY tablename, indexname;




