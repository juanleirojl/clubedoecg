"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCourse, updateCourse } from "@/lib/supabase/admin"
import { ImageUpload } from "@/components/ui/image-upload"

export default function EditarCursoPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    teaser: "",
    thumbnail_url: "",
    trailer_url: "",
    difficulty: "iniciante" as "iniciante" | "intermediario" | "avancado",
    is_free: false,
    is_published: false,
    learning_goals: [""],
  })

  useEffect(() => {
    async function loadCourse() {
      try {
        const course = await getCourse(courseId)
        setFormData({
          title: course.title || "",
          slug: course.slug || "",
          description: course.description || "",
          teaser: course.teaser || "",
          thumbnail_url: course.thumbnail_url || "",
          trailer_url: course.trailer_url || "",
          difficulty: course.difficulty || "iniciante",
          is_free: course.is_free || false,
          is_published: course.is_published || false,
          learning_goals: course.learning_goals?.length > 0 ? course.learning_goals : [""],
        })
      } catch (error) {
        console.error("Erro ao carregar curso:", error)
        alert("Erro ao carregar curso.")
        router.push("/admin/cursos")
      } finally {
        setIsFetching(false)
      }
    }
    loadCourse()
  }, [courseId, router])

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  function handleTitleChange(title: string) {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    })
  }

  function handleGoalChange(index: number, value: string) {
    const newGoals = [...formData.learning_goals]
    newGoals[index] = value
    setFormData({ ...formData, learning_goals: newGoals })
  }

  function addGoal() {
    setFormData({
      ...formData,
      learning_goals: [...formData.learning_goals, ""],
    })
  }

  function removeGoal(index: number) {
    const newGoals = formData.learning_goals.filter((_, i) => i !== index)
    setFormData({ ...formData, learning_goals: newGoals })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateCourse(courseId, {
        ...formData,
        learning_goals: formData.learning_goals.filter(g => g.trim() !== ""),
      })
      
      alert("Curso atualizado com sucesso!")
      router.push("/admin/cursos")
    } catch (error) {
      console.error("Erro ao atualizar curso:", error)
      alert("Erro ao atualizar curso. Verifique os dados e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/cursos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Curso</h1>
          <p className="text-gray-500 mt-1">Atualize as informações do curso</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Curso *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: ECG: Faixa Branca"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    placeholder="ecg-faixa-branca"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teaser">Teaser (resumo curto) *</Label>
                <Input
                  id="teaser"
                  placeholder="Domine os fundamentos do ECG em 4 horas"
                  value={formData.teaser}
                  onChange={(e) => setFormData({ ...formData, teaser: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição Completa *</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[120px] px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Descrição detalhada do curso..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Nível de Dificuldade *</Label>
                <select
                  id="difficulty"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    difficulty: e.target.value as "iniciante" | "intermediario" | "avancado" 
                  })}
                >
                  <option value="iniciante">🥋 Faixa Branca (Iniciante)</option>
                  <option value="intermediario">🥋 Faixa Azul (Intermediário)</option>
                  <option value="avancado">🥋 Faixa Preta (Avançado)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Mídia */}
          <Card>
            <CardHeader>
              <CardTitle>Mídia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Thumbnail do Curso</Label>
                <ImageUpload
                  value={formData.thumbnail_url}
                  onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                  folder="thumbnails"
                  placeholder="Cole uma URL ou faça upload (recomendado: 1280x720)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trailer_url">URL do Vídeo Trailer (Panda Video)</Label>
                <Input
                  id="trailer_url"
                  type="url"
                  placeholder="https://player.pandavideo.com.br/..."
                  value={formData.trailer_url}
                  onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  Vídeo de apresentação do curso
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Objetivos de Aprendizado */}
          <Card>
            <CardHeader>
              <CardTitle>Objetivos de Aprendizado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.learning_goals.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Objetivo ${index + 1}`}
                    value={goal}
                    onChange={(e) => handleGoalChange(index, e.target.value)}
                  />
                  {formData.learning_goals.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeGoal(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addGoal}
                className="w-full"
              >
                + Adicionar Objetivo
              </Button>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_free"
                  checked={formData.is_free}
                  onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="is_free" className="cursor-pointer">
                  Curso Gratuito
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="is_published" className="cursor-pointer">
                  Curso Publicado
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex gap-4">
            <Link href="/admin/cursos">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-red-500 hover:bg-red-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}



