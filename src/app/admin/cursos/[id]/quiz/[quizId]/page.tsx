"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical,
  Save,
  Upload,
  Image as ImageIcon,
  Video,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  getQuizQuestions, 
  createQuizQuestion, 
  updateQuizQuestion, 
  deleteQuizQuestion,
  updateQuiz,
} from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface QuizQuestion {
  id: string
  question: string
  image_url?: string
  clinical_context?: string
  options: string[]
  correct_answer: number
  explanation: string
  clinical_tip?: string
  explanation_video_url?: string
  order_index: number
}

interface Quiz {
  id: string
  title: string
  description?: string
  module_id: string
}

export default function QuizEditorPage({ 
  params 
}: { 
  params: Promise<{ id: string; quizId: string }> 
}) {
  const { id: courseId, quizId } = use(params)
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Modal state
  const [questionModalOpen, setQuestionModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  // Form state
  const [form, setForm] = useState({
    question: "",
    image_url: "",
    clinical_context: "",
    options: ["", "", "", ""],
    correct_answer: 0,
    explanation: "",
    clinical_tip: "",
    explanation_video_url: "",
  })

  async function loadData() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      // Load quiz info
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single()
      
      setQuiz(quizData)
      
      // Load questions
      const questionsData = await getQuizQuestions(quizId)
      setQuestions(questionsData || [])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [quizId])

  function openQuestionModal(question?: QuizQuestion) {
    if (question) {
      setEditingQuestion(question)
      setForm({
        question: question.question,
        image_url: question.image_url || "",
        clinical_context: question.clinical_context || "",
        options: question.options.length === 4 ? question.options : ["", "", "", ""],
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        clinical_tip: question.clinical_tip || "",
        explanation_video_url: question.explanation_video_url || "",
      })
    } else {
      setEditingQuestion(null)
      setForm({
        question: "",
        image_url: "",
        clinical_context: "",
        options: ["", "", "", ""],
        correct_answer: 0,
        explanation: "",
        clinical_tip: "",
        explanation_video_url: "",
      })
    }
    setQuestionModalOpen(true)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    try {
      const supabase = createClient()
      
      const fileExt = file.name.split(".").pop()
      const fileName = `ecg-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(data.path)

      setForm({ ...form, image_url: publicUrl })
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      alert("Erro ao fazer upload da imagem. Verifique se o bucket 'images' existe no Supabase Storage.")
    } finally {
      setIsUploading(false)
    }
  }

  function handleOptionChange(index: number, value: string) {
    const newOptions = [...form.options]
    newOptions[index] = value
    setForm({ ...form, options: newOptions })
  }

  async function handleSaveQuestion() {
    // Validação
    if (!form.question.trim()) {
      alert("Digite a pergunta")
      return
    }
    if (form.options.some(o => !o.trim())) {
      alert("Preencha todas as opções")
      return
    }
    if (!form.explanation.trim()) {
      alert("Digite a explicação")
      return
    }

    setIsSaving(true)
    try {
      if (editingQuestion) {
        await updateQuizQuestion(editingQuestion.id, {
          question: form.question,
          image_url: form.image_url || undefined,
          clinical_context: form.clinical_context || undefined,
          options: form.options,
          correct_answer: form.correct_answer,
          explanation: form.explanation,
          clinical_tip: form.clinical_tip || undefined,
          explanation_video_url: form.explanation_video_url || undefined,
        })
      } else {
        await createQuizQuestion({
          quiz_id: quizId,
          question: form.question,
          image_url: form.image_url || undefined,
          clinical_context: form.clinical_context || undefined,
          options: form.options,
          correct_answer: form.correct_answer,
          explanation: form.explanation,
          clinical_tip: form.clinical_tip || undefined,
          explanation_video_url: form.explanation_video_url || undefined,
          order_index: questions.length,
        })
      }
      await loadData()
      setQuestionModalOpen(false)
    } catch (error) {
      console.error("Erro ao salvar questão:", error)
      alert("Erro ao salvar questão")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm("Tem certeza que deseja excluir esta questão?")) return
    
    try {
      await deleteQuizQuestion(questionId)
      await loadData()
    } catch (error) {
      console.error("Erro ao excluir questão:", error)
      alert("Erro ao excluir questão")
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
        <Link href={`/admin/cursos/${courseId}/modulos`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{quiz?.title}</h1>
          <p className="text-gray-500 mt-1">Gerencie as questões do quiz</p>
        </div>
        <Button onClick={() => openQuestionModal()} className="bg-red-500 hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Nova Questão
        </Button>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma questão cadastrada
            </h3>
            <p className="text-gray-500 mb-6">
              Adicione questões com imagens de ECG para os alunos analisarem
            </p>
            <Button onClick={() => openQuestionModal()} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Criar Questão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {question.image_url ? (
                      <Image
                        src={question.image_url}
                        alt="ECG"
                        width={192}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="mb-2">Questão {index + 1}</Badge>
                        <h3 className="font-semibold text-lg mb-2">{question.question}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openQuestionModal(question)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Options */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {question.options.map((option, optIndex) => (
                        <div 
                          key={optIndex}
                          className={cn(
                            "text-sm px-3 py-2 rounded-lg",
                            optIndex === question.correct_answer
                              ? "bg-green-100 text-green-800 font-medium"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {optIndex === question.correct_answer && (
                            <CheckCircle className="w-4 h-4 inline ml-2" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Meta info */}
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      {question.clinical_context && (
                        <span>📋 Com contexto clínico</span>
                      )}
                      {question.clinical_tip && (
                        <span>💡 Com dica de plantão</span>
                      )}
                      {question.explanation_video_url && (
                        <span>🎬 Com vídeo explicativo</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Question Modal */}
      <Dialog open={questionModalOpen} onOpenChange={setQuestionModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Editar Questão" : "Nova Questão"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Imagem do ECG</Label>
              <div className="flex gap-4">
                <div className="w-64 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {form.image_url ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={form.image_url}
                        alt="ECG"
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => setForm({ ...form, image_url: "" })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">
                        {isUploading ? "Enviando..." : "Clique para upload"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Ou cole a URL da imagem</Label>
                  <Input
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  />
                </div>
              </div>
            </div>
            
            {/* Clinical Context */}
            <div className="space-y-2">
              <Label>Contexto Clínico (opcional)</Label>
              <textarea
                className="w-full min-h-[60px] px-3 py-2 border rounded-md resize-none"
                placeholder="Ex: Paciente de 65 anos, hipertenso, chega ao PS com dor torácica há 2 horas..."
                value={form.clinical_context}
                onChange={(e) => setForm({ ...form, clinical_context: e.target.value })}
              />
            </div>
            
            {/* Question */}
            <div className="space-y-2">
              <Label>Pergunta *</Label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 border rounded-md resize-none"
                placeholder="Ex: Qual é o diagnóstico mais provável deste ECG?"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
            </div>
            
            {/* Options */}
            <div className="space-y-3">
              <Label>Opções de Resposta *</Label>
              {form.options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold cursor-pointer transition-colors",
                      form.correct_answer === index
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    )}
                    onClick={() => setForm({ ...form, correct_answer: index })}
                    title="Clique para marcar como resposta correta"
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <Input
                    placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {form.correct_answer === index && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              ))}
              <p className="text-sm text-gray-500">
                Clique na letra para marcar a resposta correta
              </p>
            </div>
            
            {/* Explanation */}
            <div className="space-y-2">
              <Label>Explicação da Resposta *</Label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-none"
                placeholder="Explique por que a resposta correta é essa e o que o ECG mostra..."
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              />
            </div>
            
            {/* Clinical Tip */}
            <div className="space-y-2">
              <Label>Dica para o Plantão (opcional)</Label>
              <textarea
                className="w-full min-h-[60px] px-3 py-2 border rounded-md resize-none"
                placeholder="Ex: Neste caso, a conduta imediata é..."
                value={form.clinical_tip}
                onChange={(e) => setForm({ ...form, clinical_tip: e.target.value })}
              />
            </div>
            
            {/* Video URL */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                URL do Vídeo Explicativo (Panda Video)
              </Label>
              <Input
                placeholder="https://player.pandavideo.com.br/..."
                value={form.explanation_video_url}
                onChange={(e) => setForm({ ...form, explanation_video_url: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveQuestion} 
              disabled={isSaving}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSaving ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Questão
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



