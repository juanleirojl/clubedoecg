-- Adicionar campos de streak e tempo de estudo na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS total_watch_time INTEGER DEFAULT 0;

-- Comentários explicativos
COMMENT ON COLUMN profiles.current_streak IS 'Número de dias consecutivos de atividade';
COMMENT ON COLUMN profiles.last_activity_date IS 'Última data em que o usuário teve atividade (aula ou quiz)';
COMMENT ON COLUMN profiles.total_watch_time IS 'Tempo total de estudo em segundos';




