import {
  Button,
  Heading,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"
import { BaseTemplate } from "./base-template"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clubedoecg.com.br"

interface ReminderTemplateProps {
  userName: string
  daysInactive: number
  lastCourseName?: string
  lastCourseProgress?: number
  lastCourseSlug?: string
}

export function ReminderTemplate({
  userName = "Estudante",
  daysInactive = 3,
  lastCourseName = "ECG na Prática",
  lastCourseProgress = 45,
  lastCourseSlug = "ecg-pratica",
}: ReminderTemplateProps) {
  const previewText = `${userName}, sentimos sua falta! Continue de onde parou no Clube do ECG.`

  return (
    <BaseTemplate previewText={previewText}>
      {/* Emoji de coração */}
      <Section style={emojiSection}>
        <Text style={emoji}>🫀</Text>
      </Section>

      {/* Saudação */}
      <Heading style={heading}>
        Olá, {userName}!
      </Heading>

      {/* Mensagem principal */}
      <Text style={paragraph}>
        Percebemos que você não estuda há <strong style={highlight}>{daysInactive} dias</strong>. 
        Sabemos que a rotina do médico é corrida, mas cada minuto de estudo conta!
      </Text>

      {/* Card do curso em andamento */}
      {lastCourseName && (
        <Section style={courseCard}>
          <Text style={courseCardLabel}>Seu último curso:</Text>
          <Heading as="h2" style={courseCardTitle}>
            {lastCourseName}
          </Heading>
          
          {/* Barra de progresso */}
          <Section style={progressContainer}>
            <Section style={progressBar}>
              <Section style={{ ...progressFill, width: `${lastCourseProgress}%` }} />
            </Section>
            <Text style={progressText}>{lastCourseProgress}% concluído</Text>
          </Section>
        </Section>
      )}

      {/* CTA Principal */}
      <Section style={buttonContainer}>
        <Button
          href={lastCourseSlug ? `${baseUrl}/cursos/${lastCourseSlug}` : `${baseUrl}/cursos`}
          style={button}
        >
          Continuar de onde parei →
        </Button>
      </Section>

      {/* Motivação */}
      <Section style={motivationSection}>
        <Text style={motivationQuote}>
          &ldquo;Consistência supera intensidade. Poucos minutos por dia fazem toda a diferença.&rdquo;
        </Text>
        <Text style={motivationAuthor}>
          — Dra. Antonina Campos
        </Text>
      </Section>

      {/* Estatística motivacional */}
      <Text style={statText}>
        📊 Alunos que estudam regularmente têm <strong>3x mais chance</strong> de completar os cursos!
      </Text>
    </BaseTemplate>
  )
}

// Estilos específicos
const emojiSection = {
  textAlign: "center" as const,
  marginBottom: "16px",
}

const emoji = {
  fontSize: "48px",
  lineHeight: "1",
  margin: "0",
}

const heading = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 24px",
}

const paragraph = {
  color: "#cccccc",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "center" as const,
  margin: "0 0 24px",
}

const highlight = {
  color: "#9d1915",
}

const courseCard = {
  backgroundColor: "#2a2a2a",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "24px",
  border: "1px solid #333",
}

const courseCardLabel = {
  color: "#888",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 8px",
}

const courseCardTitle = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 16px",
}

const progressContainer = {
  marginTop: "12px",
}

const progressBar = {
  backgroundColor: "#333",
  borderRadius: "100px",
  height: "8px",
  overflow: "hidden" as const,
}

const progressFill = {
  backgroundColor: "#9d1915",
  height: "100%",
  borderRadius: "100px",
}

const progressText = {
  color: "#7db975",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "8px 0 0",
  textAlign: "right" as const,
}

const buttonContainer = {
  textAlign: "center" as const,
  marginBottom: "32px",
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

const motivationSection = {
  backgroundColor: "#1e1e1e",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
  borderLeft: "4px solid #9d1915",
}

const motivationQuote = {
  color: "#ffffff",
  fontSize: "16px",
  fontStyle: "italic",
  lineHeight: "24px",
  margin: "0 0 8px",
}

const motivationAuthor = {
  color: "#888",
  fontSize: "14px",
  margin: "0",
  textAlign: "right" as const,
}

const statText = {
  color: "#888",
  fontSize: "14px",
  lineHeight: "22px",
  textAlign: "center" as const,
  margin: "0",
}

export default ReminderTemplate

