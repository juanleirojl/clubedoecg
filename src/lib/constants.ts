// ==========================================
// CONSTANTES GLOBAIS - CLUBE DO ECG
// ==========================================

/**
 * Cores da identidade visual
 * Usar estas constantes em vez de hardcoded colors
 */
export const BRAND_COLORS = {
  primary: "#9d1915",      // Vermelho principal
  primaryHover: "#c0201c", // Vermelho hover
  primaryDark: "#7d1210",  // Vermelho escuro
  secondary: "#7db975",    // Verde
  secondaryHover: "#6aa862",
  light: "#f5f4ec",        // Bege claro
  cream: "#fbefce",        // Creme
  dark: "#0a0505",         // Fundo escuro
} as const

/**
 * Rotas da aplicação
 * Centraliza todas as rotas para evitar typos e facilitar refatoração
 */
export const ROUTES = {
  // Públicas
  HOME: "/",
  LOGIN: "/login",
  CADASTRO: "/cadastro",
  LINKS: "/links",
  VENDA: "/venda",
  DEMO_VIDEO: "/demo-video",
  
  // Autenticadas
  DASHBOARD: "/dashboard",
  CURSOS: "/cursos",
  CONQUISTAS: "/conquistas",
  PERFIL: "/perfil",
  CONFIGURACOES: "/configuracoes",
  
  // Admin
  ADMIN: "/admin",
  ADMIN_CURSOS: "/admin/cursos",
  ADMIN_USUARIOS: "/admin/usuarios",
  ADMIN_ANALYTICS: "/admin/analytics",
  
  // Dinâmicas (funções)
  curso: (slug: string) => `/cursos/${slug}`,
  aula: (slug: string, lessonId: string) => `/cursos/${slug}/aula/${lessonId}`,
  quiz: (slug: string, quizId: string) => `/cursos/${slug}/quiz/${quizId}`,
} as const

/**
 * Rotas protegidas que requerem autenticação
 */
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/cursos",
  "/conquistas",
  "/perfil",
  "/configuracoes",
  "/aula",
  "/quiz",
] as const

/**
 * Configurações de cache (em segundos)
 */
export const CACHE_CONFIG = {
  COURSES: 600,        // 10 minutos
  COURSE_DETAIL: 300,  // 5 minutos
  LESSONS: 300,        // 5 minutos
  USER_PROGRESS: 60,   // 1 minuto
  STATIC_ASSETS: 31536000, // 1 ano
} as const

/**
 * Configurações do player de vídeo
 */
export const VIDEO_CONFIG = {
  PROGRESS_REPORT_INTERVAL: 5, // segundos
  COMPLETION_THRESHOLD: 0.9,    // 90% para marcar como completo
  PANDA_API_URL: "https://player.pandavideo.com.br/api.v2.js",
} as const

/**
 * Configurações de UI
 */
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  MOBILE_BREAKPOINT: 768,
} as const

/**
 * Níveis de dificuldade dos cursos
 */
export const DIFFICULTY_LEVELS = {
  iniciante: { label: "Iniciante", color: "green" },
  intermediario: { label: "Intermediário", color: "yellow" },
  avancado: { label: "Avançado", color: "red" },
} as const

/**
 * Status de assinatura
 */
export const SUBSCRIPTION_TYPES = {
  free: { label: "Gratuito", features: ["Aulas gratuitas", "Quizzes básicos"] },
  monthly: { label: "Mensal", features: ["Acesso completo", "Suporte prioritário"] },
  yearly: { label: "Anual", features: ["Acesso completo", "Suporte VIP", "Desconto 20%"] },
} as const

/**
 * Mensagens de erro padrão
 */
export const ERROR_MESSAGES = {
  GENERIC: "Ocorreu um erro. Tente novamente.",
  NETWORK: "Erro de conexão. Verifique sua internet.",
  UNAUTHORIZED: "Você precisa estar logado para acessar.",
  FORBIDDEN: "Você não tem permissão para acessar.",
  NOT_FOUND: "Página não encontrada.",
  SESSION_EXPIRED: "Sua sessão expirou. Faça login novamente.",
} as const

/**
 * Mensagens de sucesso padrão
 */
export const SUCCESS_MESSAGES = {
  LOGIN: "Login realizado com sucesso!",
  LOGOUT: "Você saiu da sua conta.",
  PROGRESS_SAVED: "Progresso salvo!",
  LESSON_COMPLETED: "Aula concluída! 🎉",
  QUIZ_COMPLETED: "Quiz finalizado!",
} as const

