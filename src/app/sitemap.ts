import { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clubedoecg.com.br"

/**
 * Sitemap dinâmico para SEO
 * Next.js gera automaticamente o sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/cadastro`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/venda`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/links`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/demo-video`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]

  // TODO: Adicionar páginas dinâmicas de cursos quando tiver a lista
  // const courses = await getAllCourses()
  // const coursePages = courses.map(course => ({
  //   url: `${siteUrl}/cursos/${course.slug}`,
  //   lastModified: new Date(course.updated_at),
  //   changeFrequency: "weekly" as const,
  //   priority: 0.8,
  // }))

  return [...staticPages]
}


