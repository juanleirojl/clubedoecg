"use client"

import { useState, memo, useCallback } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Play, 
  Lightbulb,
  User,
  Stethoscope,
  ZoomIn
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { QuizQuestion } from "@/types"

// Dynamic import do ReactPlayer - carrega apenas quando necessário
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(
  () => import("react-player").then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="aspect-video rounded-lg bg-slate-100 animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground">Carregando player...</span>
      </div>
    )
  }
) as any

interface QuizPlayerProps {
  title: string
  questions: QuizQuestion[]
  onComplete?: (score: number, answers: { question_id: string; selected_answer: number; is_correct: boolean }[]) => void
}

// Componente de opção memoizado
const QuizOption = memo(function QuizOption({
  option,
  index,
  isSelected,
  isAnswered,
  isCorrectAnswer,
  onSelect,
}: {
  option: string
  index: number
  isSelected: boolean
  isAnswered: boolean
  isCorrectAnswer: boolean
  onSelect: (index: number) => void
}) {
  let optionClass = "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
  
  if (isAnswered) {
    if (isCorrectAnswer) {
      optionClass = "border-green-500 bg-green-50"
    } else if (isSelected && !isCorrectAnswer) {
      optionClass = "border-red-500 bg-red-50"
    } else {
      optionClass = "border-gray-200 opacity-50"
    }
  } else if (isSelected) {
    optionClass = "border-primary bg-primary/5"
  }

  return (
    <button
      onClick={() => onSelect(index)}
      disabled={isAnswered}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
        optionClass
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
        isAnswered && isCorrectAnswer
          ? "bg-green-500 text-white"
          : isAnswered && isSelected && !isCorrectAnswer
          ? "bg-red-500 text-white"
          : isSelected
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-600"
      )}>
        {String.fromCharCode(65 + index)}
      </div>
      <span className="flex-1 text-base">{option}</span>
      {isAnswered && isCorrectAnswer && (
        <CheckCircle2 className="h-6 w-6 text-green-500" />
      )}
      {isAnswered && isSelected && !isCorrectAnswer && (
        <XCircle className="h-6 w-6 text-red-500" />
      )}
    </button>
  )
})

// Componente de resultado memoizado
const QuizResults = memo(function QuizResults({
  score,
  correctCount,
  totalQuestions,
  answers,
  onRestart,
}: {
  score: number
  correctCount: number
  totalQuestions: number
  answers: { is_correct: boolean }[]
  onRestart: () => void
}) {
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Quiz Concluído!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <div className={cn(
            "text-7xl font-bold mb-4",
            score >= 70 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500"
          )}>
            {Math.round(score)}%
          </div>
          <p className="text-xl text-muted-foreground">
            Você acertou <span className="font-bold text-foreground">{correctCount}</span> de{" "}
            <span className="font-bold text-foreground">{totalQuestions}</span> questões
          </p>
          
          {score >= 70 ? (
            <p className="text-green-600 font-medium mt-4">
              🎉 Excelente! Você domina esse conteúdo!
            </p>
          ) : score >= 50 ? (
            <p className="text-yellow-600 font-medium mt-4">
              📚 Bom, mas revise os conceitos para melhorar!
            </p>
          ) : (
            <p className="text-red-600 font-medium mt-4">
              💪 Não desista! Revise as aulas e tente novamente.
            </p>
          )}
        </div>

        {/* Resumo das Respostas */}
        <div className="grid grid-cols-5 gap-2">
          {answers.map((answer, index) => (
            <div
              key={index}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center font-bold text-white",
                answer.is_correct ? "bg-green-500" : "bg-red-500"
              )}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button variant="outline" onClick={onRestart} className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Refazer Quiz
        </Button>
        <Button className="flex-1 bg-primary hover:bg-primary/90">
          Próxima Aula
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
})

export function QuizPlayer({ title, questions, onComplete }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [answers, setAnswers] = useState<{ question_id: string; selected_answer: number; is_correct: boolean }[]>([])
  const [showResults, setShowResults] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [imageZoomed, setImageZoomed] = useState(false)

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const isCorrect = selectedAnswer === currentQuestion?.correct_answer

  const handleSelectAnswer = useCallback((index: number) => {
    if (isAnswered) return
    setSelectedAnswer(index)
  }, [isAnswered])

  const handleConfirm = useCallback(() => {
    if (selectedAnswer === null) return

    setIsAnswered(true)
    const newAnswer = {
      question_id: currentQuestion.id,
      selected_answer: selectedAnswer,
      is_correct: selectedAnswer === currentQuestion.correct_answer,
    }
    setAnswers(prev => [...prev, newAnswer])
  }, [selectedAnswer, currentQuestion])

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      setShowResults(true)
      const correctCount = answers.filter((a) => a.is_correct).length + (isCorrect ? 1 : 0)
      const score = (correctCount / questions.length) * 100
      const finalAnswers = [...answers, {
        question_id: currentQuestion.id,
        selected_answer: selectedAnswer!,
        is_correct: isCorrect,
      }]
      onComplete?.(score, finalAnswers)
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setShowVideo(false)
    }
  }, [isLastQuestion, answers, isCorrect, questions.length, onComplete, currentQuestion, selectedAnswer])

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setAnswers([])
    setShowResults(false)
    setShowVideo(false)
  }, [])

  const progress = ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100
  const correctCount = answers.filter((a) => a.is_correct).length
  const score = (correctCount / questions.length) * 100

  // Tela de Resultados
  if (showResults) {
    return (
      <QuizResults
        score={score}
        correctCount={correctCount}
        totalQuestions={questions.length}
        answers={answers}
        onRestart={handleRestart}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho com Progresso */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Questão {currentIndex + 1} de {questions.length}
            </span>
            <span className="text-sm font-bold text-primary">{title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Contexto Clínico */}
      {currentQuestion.clinical_context && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Caso Clínico</h4>
                <p className="text-blue-800">{currentQuestion.clinical_context}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Imagem do ECG */}
      {currentQuestion.image_url && (
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative">
            <div 
              className={cn(
                "relative cursor-pointer transition-all",
                imageZoomed ? "aspect-auto" : "aspect-[3/1]"
              )}
              onClick={() => setImageZoomed(!imageZoomed)}
            >
              <Image
                src={currentQuestion.image_url}
                alt="ECG para análise"
                fill={!imageZoomed}
                width={imageZoomed ? 1200 : undefined}
                height={imageZoomed ? 400 : undefined}
                className={cn(
                  "object-contain bg-white",
                  !imageZoomed && "object-cover"
                )}
                loading="eager"
                priority
              />
              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5">
                <ZoomIn className="h-3.5 w-3.5" />
                {imageZoomed ? "Clique para reduzir" : "Clique para ampliar"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pergunta e Opções */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <QuizOption
              key={index}
              option={option}
              index={index}
              isSelected={selectedAnswer === index}
              isAnswered={isAnswered}
              isCorrectAnswer={index === currentQuestion.correct_answer}
              onSelect={handleSelectAnswer}
            />
          ))}
        </CardContent>

        {/* Botão Confirmar */}
        {!isAnswered && (
          <CardFooter>
            <Button
              onClick={handleConfirm}
              disabled={selectedAnswer === null}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90"
            >
              Confirmar Resposta
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Feedback após responder */}
      {isAnswered && (
        <div className="space-y-4">
          {/* Resultado */}
          <Card className={cn(
            "border-2",
            isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
          )}>
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                {isCorrect ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <h3 className={cn(
                    "font-bold text-lg mb-2",
                    isCorrect ? "text-green-700" : "text-red-700"
                  )}>
                    {isCorrect ? "Correto! 🎉" : "Incorreto 😕"}
                  </h3>
                  <p className={cn(
                    "text-base",
                    isCorrect ? "text-green-800" : "text-red-800"
                  )}>
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dica Clínica */}
          {currentQuestion.clinical_tip && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Conduta no Plantão
                    </h4>
                    <p className="text-yellow-800">{currentQuestion.clinical_tip}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vídeo Explicativo - Lazy Load */}
          {currentQuestion.explanation_video_url && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Explicação em Vídeo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showVideo ? (
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <ReactPlayer
                      url={currentQuestion.explanation_video_url}
                      width="100%"
                      height="100%"
                      controls
                      playing
                      config={{
                        youtube: {
                          playerVars: { showinfo: 0, rel: 0 }
                        },
                        vimeo: {
                          playerOptions: { byline: false, portrait: false }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="w-full aspect-video rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 hover:border-primary"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                    <span className="text-muted-foreground font-medium">
                      Clique para assistir a explicação
                    </span>
                  </button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Botão Próxima */}
          <Button onClick={handleNext} size="lg" className="w-full">
            {isLastQuestion ? "Ver Resultado Final" : "Próxima Questão"}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
