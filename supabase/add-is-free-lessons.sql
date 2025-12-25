-- =============================================
-- ADICIONAR CAMPO is_free NAS AULAS
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Adicionar campo is_free na tabela lessons
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- 2. Adicionar comentário explicativo
COMMENT ON COLUMN public.lessons.is_free IS 'Indica se a aula está disponível gratuitamente para usuários do plano Free';

-- 3. Marcar a primeira aula de cada módulo como gratuita (opcional - para teste)
-- UPDATE public.lessons l
-- SET is_free = true
-- WHERE l.order_index = 1;

-- 4. Verificar a estrutura atualizada
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'lessons' AND table_schema = 'public'
ORDER BY ordinal_position;

