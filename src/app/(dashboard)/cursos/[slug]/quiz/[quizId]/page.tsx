"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, RotateCcw, Award, Lightbulb, Video, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useQuizProgress } from "@/hooks/use-progress"
import { useUser } from "@/contexts/user-context"

interface QuizQuestion {
  id: string
  question: string
  image_url: string | null
  clinical_context: string | null
  options: string[]
  correct_answer: number
  explanation: string
  explanation_video_url: string | null
  clinical_tip: string | null
  order_index: number
}

interface Quiz {
  id: string
  title: string
  description: string
  module?: {
    title: string
    course?: {
      title: string
      slug: string
    }
  }
}

export default function QuizPage({ 
  params 
}: { 
  params: Promise<{ slug: string; quizId: string }> 
}) {
  const { slug, quizId } = use(params)
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [answers, setAnswers] = useState<{ question_id: string; selected_answer: number; is_correct: boolean }[]>([])
  const [showResults, setShowResults] = useState(false)

  const { bestScore, saveAttempt, isSaving } = useQuizProgress(quizId)
  const { markQuizCompleted } = useUser()

  // Buscar dados do quiz - otimizado com query única
  useEffect(() => {
    async function fetchQuiz() {
      const supabase = createClient()

      // Query única que busca quiz + módulo + curso + perguntas
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select(`
          id, title, description,
          module:modules(
            title,
            course:courses(title, slug)
          ),
          quiz_questions(
            id, question, image_url, clinical_context,
            options, correct_answer, explanation,
            explanation_video_url, clinical_tip, order_index
          )
        `)
        .eq("id", quizId)
        .single()

      if (quizError) {
        console.error("Erro ao buscar quiz:", quizError)
        setError("Quiz não encontrado")
        setIsLoading(false)
        return
      }

      // Ordenar perguntas
      const sortedQuestions = (quizData.quiz_questions || [])
        .sort((a: QuizQuestion, b: QuizQuestion) => a.order_index - b.order_index)

      // Normalizar dados do quiz (Supabase pode retornar arrays para relações)
      const rawModule = Array.isArray(quizData.module) ? quizData.module[0] : quizData.module
      const rawCourse = rawModule?.course
      const normalizedCourse = Array.isArray(rawCourse) ? rawCourse[0] : rawCourse
      
      const normalizedQuiz: Quiz = {
        id: quizData.id,
        title: quizData.title,
        description: quizData.description,
        module: rawModule ? {
          title: rawModule.title,
          course: normalizedCourse,
        } : undefined,
      }
      
      setQuiz(normalizedQuiz)
      setQuestions(sortedQuestions)
      setIsLoading(false)
    }

    fetchQuiz()
  }, [quizId])

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const isCorrect = selectedAnswer === currentQuestion?.correct_answer
  const progress = questions.length > 0 ? ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100 : 0

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return
    setSelectedAnswer(index)
  }

  const handleConfirm = () => {
    if (selectedAnswer === null || !currentQuestion) return
    setIsAnswered(true)
    const newAnswer = {
      question_id: currentQuestion.id,
      selected_answer: selectedAnswer,
      is_correct: selectedAnswer === currentQuestion.correct_answer,
    }
    setAnswers([...answers, newAnswer])
  }

  const handleNext = async () => {
    if (isLastQuestion) {
      // Salvar tentativa no banco
      const correctCount = answers.filter((a) => a.is_correct).length
      const score = Math.round((correctCount / questions.length) * 100)
      await saveAttempt(score, answers)
      // Marcar quiz como concluído no contexto (atualização otimista)
      markQuizCompleted(quizId, score)
      setShowResults(true)
    } else {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setShowVideo(false)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setShowVideo(false)
    setAnswers([])
    setShowResults(false)
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Carregando quiz...</span>
        </div>
      </div>
    )
  }

  // Erro ou sem perguntas
  if (error || !quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">{error || "Quiz sem perguntas"}</h2>
          <Link href={`/cursos/${slug}`}>
            <Button className="mt-4">Voltar ao curso</Button>
          </Link>
        </div>
      </div>
    )
  }

  const correctCount = answers.filter((a) => a.is_correct).length
  const score = Math.round((correctCount / questions.length) * 100)

  // Tela de Resultados
  if (showResults) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              {/* Score Circle */}
              <div className={cn(
                "w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-6",
                score >= 70 ? "bg-green-100" : score >= 50 ? "bg-yellow-100" : "bg-red-100"
              )}>
                <div>
                  <div className={cn(
                    "text-4xl font-bold",
                    score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {score}%
                  </div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2">
                {score >= 70 ? "Excelente! 🎉" : score >= 50 ? "Bom trabalho! 👍" : "Continue praticando! 💪"}
              </h2>
              <p className="text-muted-foreground mb-6">
                Você acertou {correctCount} de {questions.length} questões
              </p>

              {bestScore !== null && bestScore > score && (
                <p className="text-sm text-muted-foreground mb-4">
                  Seu melhor resultado: {bestScore}%
                </p>
              )}

              {/* Resumo */}
              <div className="grid grid-cols-4 gap-2 mb-8">
                {answers.map((answer, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 rounded-full",
                      answer.is_correct ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={handleRestart}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refazer Quiz
                </Button>
                <Button asChild className="bg-primary">
                  <Link href={`/cursos/${slug}`}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Continuar Curso
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href={`/cursos/${slug}`} className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
            <Badge variant="secondary">
              <Award className="w-3 h-3 mr-1" />
              Quiz
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{quiz.module?.title}</p>
              <h1 className="font-semibold">{quiz.title}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Questão</p>
              <p className="font-semibold">{currentIndex + 1} / {questions.length}</p>
            </div>
          </div>
          
          <Progress value={progress} className="h-2 mt-3" />
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ECG Image */}
        {currentQuestion?.image_url && (
          <Card className="mb-6 overflow-hidden">
            <div className="relative aspect-[16/9] bg-slate-100">
              <Image
                src={currentQuestion.image_url}
                alt="ECG para análise"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-black/60 text-white">
                  ECG do Paciente
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {/* Clinical Context */}
        {currentQuestion?.clinical_context && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800">
                <strong>Contexto Clínico:</strong> {currentQuestion.clinical_context}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Question */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">{currentQuestion?.question}</h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrectAnswer = index === currentQuestion.correct_answer
                
                let optionClass = "border-gray-200 hover:border-primary hover:bg-red-50"
                
                if (isAnswered) {
                  if (isCorrectAnswer) {
                    optionClass = "border-green-500 bg-green-50"
                  } else if (isSelected && !isCorrectAnswer) {
                    optionClass = "border-red-500 bg-red-50"
                  } else {
                    optionClass = "border-gray-200 opacity-60"
                  }
                } else if (isSelected) {
                  optionClass = "border-primary bg-red-50"
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={isAnswered}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                      optionClass
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2",
                      isSelected || (isAnswered && isCorrectAnswer)
                        ? isAnswered && isCorrectAnswer
                          ? "bg-green-500 border-green-500 text-white"
                          : isAnswered && isSelected && !isCorrectAnswer
                            ? "bg-red-500 border-red-500 text-white"
                            : "bg-primary border-primary text-white"
                        : "bg-white border-gray-300 text-gray-600"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 font-medium">{option}</span>
                    {isAnswered && isCorrectAnswer && (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    )}
                    {isAnswered && isSelected && !isCorrectAnswer && (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Feedback após responder */}
        {isAnswered && currentQuestion && (
          <div className="space-y-4 animate-fade-in">
            {/* Resultado */}
            <Card className={cn(
              "border-2",
              isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
            )}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {isCorrect ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className={cn(
                      "font-bold text-lg mb-2",
                      isCorrect ? "text-green-700" : "text-red-700"
                    )}>
                      {isCorrect ? "Correto! 🎉" : "Incorreto"}
                    </h3>
                    <p className="text-gray-700">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dica Clínica */}
            {currentQuestion.clinical_tip && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-1">Dica para o Plantão</h4>
                      <p className="text-amber-700 text-sm">{currentQuestion.clinical_tip}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vídeo de Explicação */}
            {currentQuestion.explanation_video_url && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Video className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold">Vídeo Explicativo</h4>
                    </div>
                    <Button 
                      variant={showVideo ? "secondary" : "default"}
                      onClick={() => setShowVideo(!showVideo)}
                    >
                      {showVideo ? "Ocultar" : "Assistir"}
                    </Button>
                  </div>
                  
                  {showVideo && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={currentQuestion.explanation_video_url}
                        className="w-full h-full"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          {!isAnswered ? (
            <Button
              onClick={handleConfirm}
              disabled={selectedAnswer === null}
              size="lg"
              className="bg-primary"
            >
              Confirmar Resposta
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              size="lg" 
              className="bg-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isLastQuestion ? "Ver Resultado" : "Próxima Questão"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
