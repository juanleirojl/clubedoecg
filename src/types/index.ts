// ==========================================
// TIPOS DO CLUBE DO ECG
// ==========================================

// Usuário
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_type: 'free' | 'monthly' | 'yearly';
  created_at: string;
}

// Curso
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  teaser: string;
  thumbnail_url: string;
  trailer_url?: string;
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  duration_minutes: number;
  lessons_count: number;
  quizzes_count: number;
  is_published: boolean;
  is_free: boolean;
  created_at: string;
  modules?: Module[];
  resources?: CourseResource[];
  learning_goals?: string[];
}

// Módulo
export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  lessons?: Lesson[];
  quizzes?: Quiz[];
}

// Aula
export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds: number;
  order_index: number;
  is_free: boolean;
  resources?: LessonResource[];
}

// Quiz
export interface Quiz {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  order_index: number;
  questions?: QuizQuestion[];
}

// Pergunta do Quiz
export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  image_url?: string; // Imagem do ECG para análise
  clinical_context?: string; // "Paciente 65 anos, dor torácica..."
  options: string[];
  correct_answer: number; // índice da opção correta (0-3)
  explanation: string;
  clinical_tip?: string; // Dica clínica adicional
  explanation_video_url?: string;
  order_index: number;
}

// Recurso do Curso (PDFs, etc)
export interface CourseResource {
  id: string;
  course_id: string;
  name: string;
  file_url: string;
  file_size_bytes: number;
  file_type: string;
}

// Recurso da Aula
export interface LessonResource {
  id: string;
  lesson_id: string;
  name: string;
  file_url: string;
  file_size_bytes: number;
  file_type: string;
}

// Progresso do Usuário na Aula
export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  watch_time_seconds: number;
  last_position_seconds: number;
  completed_at?: string;
}

// Tentativa de Quiz
export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number; // 0-100
  answers: { question_id: string; selected_answer: number; is_correct: boolean }[];
  completed_at: string;
}

// Progresso Geral do Curso
export interface UserCourseProgress {
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  last_accessed_at: string;
  last_lesson_id?: string;
}

// Curso com Progresso (para exibição)
export interface CourseWithProgress extends Course {
  progress?: UserCourseProgress;
}

// Módulo com Conteúdo Completo
export interface ModuleWithContent extends Module {
  contents: (LessonWithProgress | QuizWithProgress)[];
}

// Aula com Progresso
export interface LessonWithProgress extends Lesson {
  type: 'lesson';
  progress?: UserLessonProgress;
}

// Quiz com Progresso
export interface QuizWithProgress extends Quiz {
  type: 'quiz';
  best_score?: number;
  attempts_count?: number;
}

// Tipo para conteúdo do módulo
export type ModuleContent = LessonWithProgress | QuizWithProgress;

