import { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clubedoecg.com.br"

/**
 * Robots.txt dinâmico
 * Controla o que os crawlers podem indexar
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",           // APIs internas
          "/admin/",         // Área admin
          "/dashboard/",     // Dashboard (requer login)
          "/cursos/*/aula/", // Aulas (conteúdo pago)
          "/cursos/*/quiz/", // Quizzes (conteúdo pago)
          "/perfil/",        // Perfil do usuário
          "/configuracoes/", // Configurações
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}


