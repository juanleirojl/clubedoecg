import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getCourseBySlug } from "@/lib/supabase/queries"
import { CourseContent } from "./course-content"
import { Loader2 } from "lucide-react"

// Gerar páginas estáticas para cursos conhecidos
export async function generateStaticParams() {
  // Slugs dos cursos principais - adicione mais conforme necessário
  return [
    { slug: "ecg-faixa-branca-fundamentos2" },
    { slug: "ecg-faixa-azul-arritmias-e-bloqueios" },
    { slug: "ecg-faixa-preta-casos-complexos" },
  ]
}

// Metadados dinâmicos para SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  
  if (!course) {
    return { title: "Curso não encontrado | Clube do ECG" }
  }

  return {
    title: `${course.title} | Clube do ECG`,
    description: course.description || course.teaser,
    openGraph: {
      title: course.title,
      description: course.description || course.teaser,
      images: course.thumbnail_url ? [course.thumbnail_url] : [],
    },
  }
}

// Loading fallback
function CourseLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Carregando curso...</span>
      </div>
    </div>
  )
}

// Página principal - Server Component
export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Buscar curso no servidor (COM CACHE!)
  const course = await getCourseBySlug(slug)

  if (!course) {
    notFound()
  }

  // Calcular estatísticas no servidor
  let totalLessons = 0
  let totalQuizzes = 0
  let totalSeconds = 0

  course.modules?.forEach(mod => {
    totalLessons += mod.lessons?.length || 0
    totalQuizzes += mod.quizzes?.length || 0
    mod.lessons?.forEach(lesson => {
      totalSeconds += lesson.duration_seconds || 0
    })
  })

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  const stats = { totalLessons, totalQuizzes, hours, minutes }

  // Instructor info (pode vir do banco futuramente)
  const instructor = {
    name: "Dr. Juan Lorenzo",
    title: "Cardiologista, Especialista em ECG",
    bio: "Juan é o fundador do Clube do ECG. Ele é cardiologista com especialização em eletrocardiografia e mestre em educação médica.",
    avatar_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200",
  }

  return (
    <Suspense fallback={<CourseLoading />}>
      <CourseContent 
        course={course} 
        stats={stats} 
        instructor={instructor}
      />
    </Suspense>
  )
}
