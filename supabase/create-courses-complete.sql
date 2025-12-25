-- =============================================
-- CRIAR CURSOS FAIXA AZUL E FAIXA PRETA
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Criar curso Faixa Azul
INSERT INTO public.courses (title, slug, description, difficulty, thumbnail_url, is_published)
VALUES (
  'ECG: Faixa Azul - Arritmias e Bloqueios',
  'ecg-faixa-azul',
  'Domine arritmias, bloqueios e alterações do segmento ST. Curso intermediário para médicos que já dominam os fundamentos.',
  'faixa-azul',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Criar curso Faixa Preta
INSERT INTO public.courses (title, slug, description, difficulty, thumbnail_url, is_published)
VALUES (
  'ECG: Faixa Preta - Casos Complexos',
  'ecg-faixa-preta',
  'Casos complexos de especialista. Para médicos experientes que buscam o mais alto nível de interpretação de ECG.',
  'faixa-preta',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 3. Criar módulos para Faixa Azul
INSERT INTO public.modules (course_id, title, description, order_index)
SELECT 
  c.id,
  m.title,
  m.description,
  m.order_index
FROM public.courses c
CROSS JOIN (VALUES
  ('Arritmias Supraventriculares', 'Taquicardias atriais, flutter e fibrilação', 0),
  ('Arritmias Ventriculares', 'Taquicardias ventriculares e fibrilação ventricular', 1),
  ('Bloqueios Cardíacos', 'BAV de 1º, 2º e 3º graus', 2),
  ('Alterações do ST', 'Isquemia, lesão e infarto', 3)
) AS m(title, description, order_index)
WHERE c.slug = 'ecg-faixa-azul'
AND NOT EXISTS (
  SELECT 1 FROM public.modules WHERE course_id = c.id AND modules.title = m.title
);

-- 4. Criar módulos para Faixa Preta
INSERT INTO public.modules (course_id, title, description, order_index)
SELECT 
  c.id,
  m.title,
  m.description,
  m.order_index
FROM public.courses c
CROSS JOIN (VALUES
  ('Canalopatias', 'Brugada, QT longo e curto', 0),
  ('Cardiomiopatias', 'Hipertrófica, dilatada e restritiva', 1),
  ('ECG Pediátrico', 'Particularidades do ECG em crianças', 2),
  ('Casos Raros', 'Dextrocardia, inversão de eletrodos e artefatos', 3)
) AS m(title, description, order_index)
WHERE c.slug = 'ecg-faixa-preta'
AND NOT EXISTS (
  SELECT 1 FROM public.modules WHERE course_id = c.id AND modules.title = m.title
);

-- 5. Criar aulas para Faixa Azul (primeira aula de cada módulo é gratuita)
INSERT INTO public.lessons (module_id, title, description, video_url, duration_seconds, order_index, is_free)
SELECT 
  m.id,
  l.title,
  l.description,
  'https://player.pandavideo.com.br/example',
  l.duration,
  l.order_index,
  l.is_free
FROM public.modules m
JOIN public.courses c ON c.id = m.course_id
CROSS JOIN (VALUES
  -- Módulo 1: Arritmias Supraventriculares
  ('Introdução às Arritmias', 'Conceitos básicos sobre arritmias', 480, 0, true),
  ('Taquicardia Sinusal', 'Quando é normal e quando investigar', 420, 1, false),
  ('Flutter Atrial', 'Diagnóstico e tratamento', 540, 2, false),
  ('Fibrilação Atrial', 'A arritmia mais comum', 600, 3, false)
) AS l(title, description, duration, order_index, is_free)
WHERE c.slug = 'ecg-faixa-azul' 
AND m.title = 'Arritmias Supraventriculares'
AND NOT EXISTS (
  SELECT 1 FROM public.lessons WHERE module_id = m.id AND lessons.title = l.title
);

INSERT INTO public.lessons (module_id, title, description, video_url, duration_seconds, order_index, is_free)
SELECT 
  m.id,
  l.title,
  l.description,
  'https://player.pandavideo.com.br/example',
  l.duration,
  l.order_index,
  l.is_free
FROM public.modules m
JOIN public.courses c ON c.id = m.course_id
CROSS JOIN (VALUES
  -- Módulo 2: Arritmias Ventriculares
  ('Extrassístoles Ventriculares', 'Quando se preocupar', 420, 0, true),
  ('Taquicardia Ventricular', 'Monomórfica e polimórfica', 600, 1, false),
  ('Fibrilação Ventricular', 'Emergência cardiológica', 480, 2, false)
) AS l(title, description, duration, order_index, is_free)
WHERE c.slug = 'ecg-faixa-azul' 
AND m.title = 'Arritmias Ventriculares'
AND NOT EXISTS (
  SELECT 1 FROM public.lessons WHERE module_id = m.id AND lessons.title = l.title
);

-- 6. Criar aulas para Faixa Preta (apenas primeira aula gratuita)
INSERT INTO public.lessons (module_id, title, description, video_url, duration_seconds, order_index, is_free)
SELECT 
  m.id,
  l.title,
  l.description,
  'https://player.pandavideo.com.br/example',
  l.duration,
  l.order_index,
  l.is_free
FROM public.modules m
JOIN public.courses c ON c.id = m.course_id
CROSS JOIN (VALUES
  ('Síndrome de Brugada', 'Critérios diagnósticos e manejo', 720, 0, true),
  ('QT Longo Congênito', 'Tipos e tratamento', 600, 1, false),
  ('QT Curto', 'Diagnóstico diferencial', 540, 2, false)
) AS l(title, description, duration, order_index, is_free)
WHERE c.slug = 'ecg-faixa-preta' 
AND m.title = 'Canalopatias'
AND NOT EXISTS (
  SELECT 1 FROM public.lessons WHERE module_id = m.id AND lessons.title = l.title
);

-- 7. Marcar primeira aula do curso Faixa Branca como gratuita
UPDATE public.lessons
SET is_free = true
WHERE id IN (
  SELECT l.id
  FROM public.lessons l
  JOIN public.modules m ON m.id = l.module_id
  JOIN public.courses c ON c.id = m.course_id
  WHERE c.slug = 'ecg-faixa-branca'
  AND l.order_index = 0
  AND m.order_index = 0
);

-- 8. Verificar cursos criados
SELECT c.title, c.difficulty, 
  (SELECT COUNT(*) FROM public.modules WHERE course_id = c.id) as modulos,
  (SELECT COUNT(*) FROM public.lessons l JOIN public.modules m ON m.id = l.module_id WHERE m.course_id = c.id) as aulas,
  (SELECT COUNT(*) FROM public.lessons l JOIN public.modules m ON m.id = l.module_id WHERE m.course_id = c.id AND l.is_free = true) as aulas_gratuitas
FROM public.courses c
ORDER BY c.created_at;



