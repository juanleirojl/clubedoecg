"use client"

import { use, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Play, RotateCcw, Award, Lightbulb, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Mock data para quiz com imagens de ECG
const mockQuiz = {
  id: "quiz-1",
  title: "Quiz: Fundamentos do ECG",
  description: "Teste seus conhecimentos sobre os componentes básicos do eletrocardiograma",
  chapter: "Nível 1: A Curva do ECG",
}

const mockQuestions = [
  {
    id: "q1",
    question: "Analise o ECG abaixo. Qual é o ritmo cardíaco deste paciente?",
    ecg_image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800",
    options: [
      "Ritmo sinusal normal",
      "Fibrilação atrial",
      "Flutter atrial",
      "Taquicardia ventricular",
    ],
    correct_answer: 0,
    explanation: "Este ECG mostra um ritmo sinusal normal. Observe a presença de onda P antes de cada complexo QRS, com intervalo PR constante e frequência regular entre 60-100 bpm.",
    explanation_video: "https://vimeo.com/999233514",
    clinical_tip: "No plantão, sempre confirme o ritmo em pelo menos 2 derivações (DII e V1 são as melhores para análise de ritmo).",
  },
  {
    id: "q2",
    question: "Observe o traçado. Qual componente está marcado com a seta vermelha?",
    ecg_image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
    options: [
      "Onda P",
      "Complexo QRS",
      "Onda T",
      "Segmento ST",
    ],
    correct_answer: 1,
    explanation: "O componente marcado é o Complexo QRS, que representa a despolarização ventricular. É a deflexão mais proeminente do ECG e tem duração normal de 80-120ms.",
    explanation_video: "https://vimeo.com/984243986",
    clinical_tip: "Um QRS alargado (>120ms) pode indicar bloqueio de ramo ou ritmo de origem ventricular.",
  },
  {
    id: "q3",
    question: "Este paciente de 55 anos chegou com dor torácica. Qual é a alteração mais preocupante neste ECG?",
    ecg_image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800",
    options: [
      "Onda P ausente",
      "Supradesnivelamento do segmento ST",
      "QRS alargado",
      "Intervalo QT prolongado",
    ],
    correct_answer: 1,
    explanation: "O supradesnivelamento do segmento ST é a alteração mais preocupante neste contexto clínico, pois indica Infarto Agudo do Miocárdio com Supradesnivelamento de ST (IAMCSST). Este paciente precisa de reperfusão imediata!",
    explanation_video: "https://vimeo.com/999233514",
    clinical_tip: "TEMPO É MÚSCULO! Em caso de IAMCSST, o tempo porta-balão deve ser <90 minutos.",
  },
  {
    id: "q4",
    question: "Qual é a frequência cardíaca aproximada deste ECG?",
    ecg_image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
    options: [
      "50 bpm",
      "75 bpm",
      "100 bpm",
      "150 bpm",
    ],
    correct_answer: 1,
    explanation: "A frequência é aproximadamente 75 bpm. Usando o método dos 300, contamos 4 quadrados grandes entre os complexos QRS: 300 ÷ 4 = 75 bpm.",
    explanation_video: "https://vimeo.com/984243986",
    clinical_tip: "Método rápido: 300/nº de quadrados grandes entre R-R = FC aproximada.",
  },
]

export default function QuizPage({ 
  params 
}: { 
  params: Promise<{ slug: string; quizId: string }> 
}) {
  const { slug, quizId } = use(params)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [answers, setAnswers] = useState<{ question_id: string; selected_answer: number; is_correct: boolean }[]>([])
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = mockQuestions[currentIndex]
  const isLastQuestion = currentIndex === mockQuestions.length - 1
  const isCorrect = selectedAnswer === currentQuestion?.correct_answer
  const progress = ((currentIndex + (isAnswered ? 1 : 0)) / mockQuestions.length) * 100

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return
    setSelectedAnswer(index)
  }

  const handleConfirm = () => {
    if (selectedAnswer === null) return
    setIsAnswered(true)
    const newAnswer = {
      question_id: currentQuestion.id,
      selected_answer: selectedAnswer,
      is_correct: selectedAnswer === currentQuestion.correct_answer,
    }
    setAnswers([...answers, newAnswer])
  }

  const handleNext = () => {
    if (isLastQuestion) {
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

  const correctCount = answers.filter((a) => a.is_correct).length
  const score = Math.round((correctCount / mockQuestions.length) * 100)

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
                Você acertou {correctCount} de {mockQuestions.length} questões
              </p>

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
              <p className="text-sm text-muted-foreground">{mockQuiz.chapter}</p>
              <h1 className="font-semibold">{mockQuiz.title}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Questão</p>
              <p className="font-semibold">{currentIndex + 1} / {mockQuestions.length}</p>
            </div>
          </div>
          
          <Progress value={progress} className="h-2 mt-3" />
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ECG Image */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative aspect-[16/9] bg-slate-100">
            <Image
              src={currentQuestion.ecg_image}
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

        {/* Question */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
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
        {isAnswered && (
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

            {/* Vídeo de Explicação */}
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
                      src={`https://player.vimeo.com/video/${currentQuestion.explanation_video.split('/').pop()}?autoplay=1`}
                      className="w-full h-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  </div>
                )}
              </CardContent>
            </Card>
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
            <Button onClick={handleNext} size="lg" className="bg-primary">
              {isLastQuestion ? "Ver Resultado" : "Próxima Questão"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
