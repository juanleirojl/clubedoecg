-- =============================================
-- ADICIONAR CAMPOS DE ESTATÍSTICAS
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Adicionar campo total_watch_time no profiles (segundos totais assistidos)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_watch_time INTEGER DEFAULT 0;

-- 2. Adicionar campo de streak (sequência de dias)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

-- 3. Adicionar campo de último acesso para calcular streak
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- 4. Adicionar campo de watch_time em user_lesson_progress
ALTER TABLE public.user_lesson_progress 
ADD COLUMN IF NOT EXISTS watch_time_seconds INTEGER DEFAULT 0;

-- 5. Verificar estrutura
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('total_watch_time', 'current_streak', 'last_activity_date');



