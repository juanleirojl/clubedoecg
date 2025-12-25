"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Eye,
  BookOpen,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getCourses, deleteCourse } from "@/lib/supabase/admin"

interface Course {
  id: string
  title: string
  slug: string
  description: string
  difficulty: "iniciante" | "intermediario" | "avancado"
  is_published: boolean
  is_free: boolean
  created_at: string
}

const difficultyLabels = {
  iniciante: { label: "Faixa Branca", color: "bg-gray-100 text-gray-800" },
  intermediario: { label: "Faixa Azul", color: "bg-blue-100 text-blue-800" },
  avancado: { label: "Faixa Preta", color: "bg-gray-900 text-white" },
}

export default function AdminCursosPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function loadCourses() {
    setIsLoading(true)
    try {
      const data = await getCourses()
      setCourses(data || [])
    } catch (error) {
      console.error("Erro ao carregar cursos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  async function handleDelete() {
    if (!courseToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteCourse(courseToDelete.id)
      setCourses(courses.filter(c => c.id !== courseToDelete.id))
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
    } catch (error) {
      console.error("Erro ao deletar curso:", error)
      alert("Erro ao deletar curso")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cursos</h1>
          <p className="text-gray-500 mt-1">Gerencie os cursos da plataforma</p>
        </div>
        <Link href="/admin/cursos/novo">
          <Button className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Novo Curso
          </Button>
        </Link>
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum curso cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
              Comece criando seu primeiro curso
            </p>
            <Link href="/admin/cursos/novo">
              <Button className="bg-red-500 hover:bg-red-600">
                <Plus className="w-4 h-4 mr-2" />
                Criar Curso
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/cursos/${course.slug}`} target="_blank">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver no site
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/cursos/${course.id}`}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/cursos/${course.id}/modulos`}>
                          <Layers className="w-4 h-4 mr-2" />
                          Módulos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          setCourseToDelete(course)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge className={difficultyLabels[course.difficulty].color}>
                    {difficultyLabels[course.difficulty].label}
                  </Badge>
                  {course.is_free && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Gratuito
                    </Badge>
                  )}
                  {!course.is_published && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Rascunho
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/cursos/${course.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      <Pencil className="w-3 h-3 mr-2" />
                      Editar
                    </Button>
                  </Link>
                  <Link href={`/admin/cursos/${course.id}/modulos`} className="flex-1">
                    <Button className="w-full bg-red-500 hover:bg-red-600" size="sm">
                      <Layers className="w-3 h-3 mr-2" />
                      Módulos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Curso</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o curso &quot;{courseToDelete?.title}&quot;?
              Esta ação não pode ser desfeita e todos os módulos, aulas e quizzes 
              serão excluídos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

