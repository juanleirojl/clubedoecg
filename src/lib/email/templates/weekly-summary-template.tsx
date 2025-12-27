import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"
import { BaseTemplate } from "./base-template"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clubedoecg.com.br"

interface WeeklySummaryTemplateProps {
  userName: string
  weekNumber: number
  lessonsCompleted: number
  minutesWatched: number
  currentStreak: number
  bestStreak: number
  coursesInProgress: Array<{
    name: string
    progress: number
    slug: string
  }>
  achievements?: Array<{
    name: string
    icon: string
  }>
}

export function WeeklySummaryTemplate({
  userName = "Estudante",
  weekNumber = 1,
  lessonsCompleted = 5,
  minutesWatched = 120,
  currentStreak = 3,
  bestStreak = 7,
  coursesInProgress = [
    { name: "ECG na Prática", progress: 45, slug: "ecg-pratica" },
    { name: "Arritmias Cardíacas", progress: 20, slug: "arritmias" },
  ],
  achievements = [],
}: WeeklySummaryTemplateProps) {
  const previewText = `Seu resumo semanal: ${lessonsCompleted} aulas completadas, ${minutesWatched} minutos estudados!`

  const formatMinutes = (mins: number) => {
    const hours = Math.floor(mins / 60)
    const minutes = mins % 60
    if (hours === 0) return `${minutes}min`
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}min`
  }

  return (
    <BaseTemplate previewText={previewText}>
      {/* Header com semana */}
      <Section style={weekBadge}>
        <Text style={weekNumber as React.CSSProperties}>
          📅 Semana {weekNumber}
        </Text>
      </Section>

      {/* Saudação */}
      <Heading style={heading}>
        Seu Resumo Semanal
      </Heading>
      
      <Text style={greeting}>
        Olá, {userName}! Aqui está o que você conquistou esta semana:
      </Text>

      {/* Stats Grid */}
      <Section style={statsGrid}>
        {/* Aulas Completadas */}
        <Section style={statCard}>
          <Text style={statEmoji}>📚</Text>
          <Text style={statValue}>{lessonsCompleted}</Text>
          <Text style={statLabel}>Aulas</Text>
        </Section>

        {/* Tempo de Estudo */}
        <Section style={statCard}>
          <Text style={statEmoji}>⏱️</Text>
          <Text style={statValue}>{formatMinutes(minutesWatched)}</Text>
          <Text style={statLabel}>Estudados</Text>
        </Section>

        {/* Streak */}
        <Section style={statCard}>
          <Text style={statEmoji}>🔥</Text>
          <Text style={statValue}>{currentStreak}</Text>
          <Text style={statLabel}>Dias seguidos</Text>
        </Section>
      </Section>

      {/* Comparação com recorde */}
      {currentStreak > 0 && (
        <Text style={streakText}>
          {currentStreak >= bestStreak 
            ? "🏆 Você está no seu melhor momento! Continue assim!"
            : `Seu recorde é ${bestStreak} dias. Faltam ${bestStreak - currentStreak} dias para bater!`
          }
        </Text>
      )}

      <Hr style={hr} />

      {/* Cursos em Andamento */}
      {coursesInProgress.length > 0 && (
        <>
          <Heading as="h2" style={sectionTitle}>
            Seus Cursos
          </Heading>
          
          {coursesInProgress.map((course, index) => (
            <Section key={index} style={courseCard}>
              <Section style={courseHeader}>
                <Text style={courseName}>{course.name}</Text>
                <Text style={courseProgress}>{course.progress}%</Text>
              </Section>
              <Section style={progressBar}>
                <Section style={{ ...progressFill, width: `${course.progress}%` }} />
              </Section>
            </Section>
          ))}
        </>
      )}

      {/* Conquistas */}
      {achievements && achievements.length > 0 && (
        <>
          <Hr style={hr} />
          <Heading as="h2" style={sectionTitle}>
            Conquistas Desbloqueadas 🏅
          </Heading>
          <Section style={achievementsContainer}>
            {achievements.map((achievement, index) => (
              <Section key={index} style={achievementBadge}>
                <Text style={achievementIcon}>{achievement.icon}</Text>
                <Text style={achievementName}>{achievement.name}</Text>
              </Section>
            ))}
          </Section>
        </>
      )}

      <Hr style={hr} />

      {/* CTA */}
      <Section style={buttonContainer}>
        <Button href={`${baseUrl}/cursos`} style={button}>
          Continuar Estudando →
        </Button>
      </Section>

      {/* Motivação */}
      <Text style={motivation}>
        &ldquo;Cada aula assistida é um passo mais perto de se tornar um expert em ECG!&rdquo;
      </Text>
    </BaseTemplate>
  )
}

// Estilos específicos
const weekBadge = {
  textAlign: "center" as const,
  marginBottom: "16px",
}

const heading = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 12px",
}

const greeting = {
  color: "#cccccc",
  fontSize: "16px",
  textAlign: "center" as const,
  margin: "0 0 24px",
}

const statsGrid = {
  display: "flex",
  justifyContent: "center",
  gap: "16px",
  marginBottom: "24px",
}

const statCard = {
  backgroundColor: "#2a2a2a",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  flex: "1",
  minWidth: "100px",
  display: "inline-block",
  margin: "0 8px",
}

const statEmoji = {
  fontSize: "24px",
  margin: "0 0 8px",
}

const statValue = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
  lineHeight: "1.2",
}

const statLabel = {
  color: "#888",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "4px 0 0",
}

const streakText = {
  color: "#7db975",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "0 0 24px",
}

const hr = {
  borderColor: "#333",
  margin: "24px 0",
}

const sectionTitle = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px",
}

const courseCard = {
  backgroundColor: "#2a2a2a",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "12px",
}

const courseHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "8px",
}

const courseName = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
  display: "inline-block",
}

const courseProgress = {
  color: "#7db975",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0",
  display: "inline-block",
  float: "right" as const,
}

const progressBar = {
  backgroundColor: "#333",
  borderRadius: "100px",
  height: "6px",
  overflow: "hidden" as const,
}

const progressFill = {
  backgroundColor: "#9d1915",
  height: "100%",
  borderRadius: "100px",
}

const achievementsContainer = {
  textAlign: "center" as const,
}

const achievementBadge = {
  display: "inline-block",
  backgroundColor: "#2a2a2a",
  borderRadius: "8px",
  padding: "12px 16px",
  margin: "4px",
}

const achievementIcon = {
  fontSize: "24px",
  margin: "0 0 4px",
}

const achievementName = {
  color: "#ffffff",
  fontSize: "12px",
  margin: "0",
}

const buttonContainer = {
  textAlign: "center" as const,
  marginBottom: "24px",
}

const button = {
  backgroundColor: "#9d1915",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
}

const motivation = {
  color: "#888",
  fontSize: "14px",
  fontStyle: "italic",
  textAlign: "center" as const,
  margin: "0",
}

export default WeeklySummaryTemplate

