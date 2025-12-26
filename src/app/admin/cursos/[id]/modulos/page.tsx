"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical,
  PlayCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Save,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  getCourse, 
  getModules, 
  createModule, 
  updateModule, 
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  createQuiz,
} from "@/lib/supabase/admin"
import { cn } from "@/lib/utils"

interface Lesson {
  id: string
  title: string
  description?: string
  video_url: string
  duration_seconds: number
  order_index: number
  is_free: boolean
}

interface Quiz {
  id: string
  title: string
  description?: string
  order_index: number
}

interface Module {
  id: string
  title: string
  description?: string
  order_index: number
  lessons: Lesson[]
  quizzes: Quiz[]
}

interface Course {
  id: string
  title: string
  slug: string
}

export default function ModulosPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id: courseId } = use(params)
  
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  
  // Modal states
  const [moduleModalOpen, setModuleModalOpen] = useState(false)
  const [lessonModalOpen, setLessonModalOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  
  // Form states
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" })
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    video_url: "",
    duration_seconds: 0,
    is_free: false,
  })
  const [isSaving, setIsSaving] = useState(false)

  async function loadData() {
    setIsLoading(true)
    try {
      const courseData = await getCourse(courseId)
      setCourse(courseData)
      
      const modulesData = await getModules(courseId)
      setModules(modulesData || [])
      
      // Expande todos os módulos por padrão
      setExpandedModules(new Set(modulesData?.map((m: Module) => m.id) || []))
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [courseId])

  function toggleModule(moduleId: string) {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  // Module handlers
  function openModuleModal(module?: Module) {
    if (module) {
      setEditingModule(module)
      setModuleForm({ title: module.title, description: module.description || "" })
    } else {
      setEditingModule(null)
      setModuleForm({ title: "", description: "" })
    }
    setModuleModalOpen(true)
  }

  async function handleSaveModule() {
    setIsSaving(true)
    try {
      if (editingModule) {
        await updateModule(editingModule.id, moduleForm)
      } else {
        await createModule({
          course_id: courseId,
          title: moduleForm.title,
          description: moduleForm.description,
          order_index: modules.length,
        })
      }
      await loadData()
      setModuleModalOpen(false)
    } catch (error) {
      console.error("Erro ao salvar módulo:", error)
      alert("Erro ao salvar módulo")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm("Tem certeza? Todas as aulas e quizzes deste módulo serão excluídos.")) return
    
    try {
      await deleteModule(moduleId)
      await loadData()
    } catch (error) {
      console.error("Erro ao excluir módulo:", error)
      alert("Erro ao excluir módulo")
    }
  }

  // Lesson handlers
  function openLessonModal(moduleId: string, lesson?: Lesson) {
    setSelectedModuleId(moduleId)
    if (lesson) {
      setEditingLesson(lesson)
      setLessonForm({
        title: lesson.title,
        description: lesson.description || "",
        video_url: lesson.video_url,
        duration_seconds: lesson.duration_seconds,
        is_free: lesson.is_free,
      })
    } else {
      setEditingLesson(null)
      setLessonForm({
        title: "",
        description: "",
        video_url: "",
        duration_seconds: 0,
        is_free: false,
      })
    }
    setLessonModalOpen(true)
  }

  async function handleSaveLesson() {
    if (!selectedModuleId) return
    
    setIsSaving(true)
    try {
      const module = modules.find(m => m.id === selectedModuleId)
      
      if (editingLesson) {
        await updateLesson(editingLesson.id, lessonForm)
      } else {
        await createLesson({
          module_id: selectedModuleId,
          ...lessonForm,
          order_index: module?.lessons.length || 0,
        })
      }
      await loadData()
      setLessonModalOpen(false)
    } catch (error) {
      console.error("Erro ao salvar aula:", error)
      alert("Erro ao salvar aula")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return
    
    try {
      await deleteLesson(lessonId)
      await loadData()
    } catch (error) {
      console.error("Erro ao excluir aula:", error)
      alert("Erro ao excluir aula")
    }
  }

  // Quiz handlers
  async function handleCreateQuiz(moduleId: string) {
    const title = prompt("Título do Quiz:")
    if (!title) return
    
    try {
      const module = modules.find(m => m.id === moduleId)
      const quiz = await createQuiz({
        module_id: moduleId,
        title,
        order_index: module?.quizzes.length || 0,
      })
      
      // Redireciona para editar o quiz
      window.location.href = `/admin/cursos/${courseId}/quiz/${quiz.id}`
    } catch (error) {
      console.error("Erro ao criar quiz:", error)
      alert("Erro ao criar quiz")
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/cursos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
          <p className="text-gray-500 mt-1">Gerencie módulos, aulas e quizzes</p>
        </div>
        <Button onClick={() => openModuleModal()} className="bg-red-500 hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Módulo
        </Button>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum módulo cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
              Comece criando o primeiro módulo do curso
            </p>
            <Button onClick={() => openModuleModal()} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Criar Módulo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <Card key={module.id}>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleModule(module.id)}
              >
                <div className="flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Módulo {moduleIndex + 1}: {module.title}
                    </CardTitle>
                    {module.description && (
                      <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Badge variant="outline">
                      {module.lessons.length} aulas
                    </Badge>
                    <Badge variant="outline">
                      {module.quizzes.length} quizzes
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openModuleModal(module)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteModule(module.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedModules.has(module.id) && (
                <CardContent className="pt-0">
                  {/* Lessons */}
                  <div className="space-y-2 mb-4">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div 
                        key={lesson.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <PlayCircle className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium">{lessonIndex + 1}. {lesson.title}</p>
                          <p className="text-sm text-gray-500">
                            {Math.floor(lesson.duration_seconds / 60)} min
                            {lesson.is_free && " • Gratuita"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openLessonModal(module.id, lesson)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLesson(lesson.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* Quizzes */}
                    {module.quizzes.map((quiz) => (
                      <Link 
                        key={quiz.id}
                        href={`/admin/cursos/${courseId}/quiz/${quiz.id}`}
                        className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg hover:bg-purple-100"
                      >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <HelpCircle className="w-5 h-5 text-purple-500" />
                        <div className="flex-1">
                          <p className="font-medium">{quiz.title}</p>
                          <p className="text-sm text-gray-500">Quiz</p>
                        </div>
                        <Pencil className="w-4 h-4 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                  
                  {/* Add buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openLessonModal(module.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Aula
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCreateQuiz(module.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Quiz
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Module Modal */}
      <Dialog open={moduleModalOpen} onOpenChange={setModuleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModule ? "Editar Módulo" : "Novo Módulo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                placeholder="Ex: Nível 1: Fundamentos do ECG"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 border rounded-md resize-none"
                placeholder="Descrição do módulo..."
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveModule} 
              disabled={isSaving || !moduleForm.title}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Modal */}
      <Dialog open={lessonModalOpen} onOpenChange={setLessonModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "Editar Aula" : "Nova Aula"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                placeholder="Ex: O que é o ECG?"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                className="w-full min-h-[60px] px-3 py-2 border rounded-md resize-none"
                placeholder="Descrição da aula..."
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL do Vídeo (Panda Video) *</label>
              <Input
                placeholder="https://...pandavideo.com.br/.../playlist.m3u8"
                value={lessonForm.video_url}
                onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Suporta: HLS (.m3u8) ou Embed (?v=ID)
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duração (segundos)</label>
              <Input
                type="number"
                placeholder="300"
                value={lessonForm.duration_seconds}
                onChange={(e) => setLessonForm({ ...lessonForm, duration_seconds: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500">
                {Math.floor(lessonForm.duration_seconds / 60)} minutos
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_free_lesson"
                checked={lessonForm.is_free}
                onChange={(e) => setLessonForm({ ...lessonForm, is_free: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_free_lesson" className="text-sm">
                Aula gratuita (disponível para todos)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveLesson} 
              disabled={isSaving || !lessonForm.title || !lessonForm.video_url}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



