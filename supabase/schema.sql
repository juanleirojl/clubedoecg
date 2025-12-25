-- =============================================
-- SCHEMA DO BANCO DE DADOS - CLUBE DO ECG
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA: users (perfil do usuário)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'monthly', 'yearly')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TABELA: courses (cursos)
-- =============================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  teaser TEXT,
  thumbnail_url TEXT,
  trailer_url TEXT,
  difficulty TEXT DEFAULT 'iniciante' CHECK (difficulty IN ('iniciante', 'intermediario', 'avancado')),
  duration_minutes INTEGER DEFAULT 0,
  lessons_count INTEGER DEFAULT 0,
  quizzes_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false,
  learning_goals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true);

-- =============================================
-- TABELA: modules (módulos do curso)
-- =============================================
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para modules
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules" ON public.modules
  FOR SELECT USING (true);

-- =============================================
-- TABELA: lessons (aulas)
-- =============================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons" ON public.lessons
  FOR SELECT USING (true);

-- =============================================
-- TABELA: quizzes
-- =============================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quizzes" ON public.quizzes
  FOR SELECT USING (true);

-- =============================================
-- TABELA: quiz_questions (perguntas do quiz)
-- =============================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  image_url TEXT, -- Imagem do ECG para análise
  clinical_context TEXT, -- Ex: "Paciente 65 anos, dor torácica há 2h..."
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  clinical_tip TEXT, -- Dica clínica adicional (conduta)
  explanation_video_url TEXT, -- Vídeo explicativo da resposta
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para quiz_questions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions
  FOR SELECT USING (true);

-- =============================================
-- TABELA: course_resources (arquivos para download)
-- =============================================
CREATE TABLE IF NOT EXISTS public.course_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para course_resources
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view course resources" ON public.course_resources
  FOR SELECT USING (true);

-- =============================================
-- TABELA: user_lesson_progress (progresso do usuário nas aulas)
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  watch_time_seconds INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- RLS para user_lesson_progress
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- TABELA: quiz_attempts (tentativas de quiz)
-- =============================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- ÍNDICES para performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_module_id ON public.quizzes(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON public.user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);

-- =============================================
-- VIEWS úteis
-- =============================================

-- View para progresso do usuário por curso
CREATE OR REPLACE VIEW public.user_course_progress AS
SELECT 
  ulp.user_id,
  c.id as course_id,
  c.slug as course_slug,
  COUNT(DISTINCT l.id) as total_lessons,
  COUNT(DISTINCT CASE WHEN ulp.completed = true THEN l.id END) as completed_lessons,
  ROUND(
    COUNT(DISTINCT CASE WHEN ulp.completed = true THEN l.id END)::decimal / 
    NULLIF(COUNT(DISTINCT l.id), 0) * 100, 
    2
  ) as progress_percentage,
  MAX(ulp.updated_at) as last_accessed_at
FROM public.courses c
JOIN public.modules m ON m.course_id = c.id
JOIN public.lessons l ON l.module_id = m.id
LEFT JOIN public.user_lesson_progress ulp ON ulp.lesson_id = l.id
WHERE ulp.user_id IS NOT NULL
GROUP BY ulp.user_id, c.id, c.slug;

-- =============================================
-- DADOS DE EXEMPLO (opcional)
-- =============================================

-- Inserir curso de exemplo
INSERT INTO public.courses (title, slug, description, teaser, difficulty, is_published, is_free, learning_goals)
VALUES (
  'Método CAMPOS-ECG™ - Nível 1',
  'metodo-campos-ecg-nivel-1',
  'Este curso ensina os fundamentos do Método CAMPOS-ECG™, uma abordagem sistemática para leitura de eletrocardiogramas.',
  'Aprenda a ler ECG de forma sistemática e nunca mais trave no plantão',
  'iniciante',
  true,
  true,
  '["Identificar os componentes do complexo QRS", "Medir intervalos PR e QT", "Reconhecer ritmo sinusal", "Aplicar o método CAMPOS"]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Inserir módulo de exemplo
INSERT INTO public.modules (course_id, title, description, order_index)
SELECT 
  id,
  'Fundamentos do ECG',
  'Entenda os componentes básicos do eletrocardiograma',
  1
FROM public.courses WHERE slug = 'metodo-campos-ecg-nivel-1'
LIMIT 1;

-- Inserir aula de exemplo
INSERT INTO public.lessons (module_id, title, description, video_url, duration_seconds, order_index, is_free)
SELECT 
  m.id,
  'Identificando componentes do QRS',
  'Nesta aula, você vai aprender a identificar cada componente do complexo QRS',
  'https://vimeo.com/999233514',
  581,
  1,
  true
FROM public.modules m
JOIN public.courses c ON c.id = m.course_id
WHERE c.slug = 'metodo-campos-ecg-nivel-1'
LIMIT 1;

-- Pronto! Seu banco de dados está configurado.

