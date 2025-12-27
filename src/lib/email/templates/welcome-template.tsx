import {
  Button,
  Heading,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"
import { BaseTemplate } from "./base-template"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clubedoecg.com.br"

interface WelcomeTemplateProps {
  userName: string
}

export function WelcomeTemplate({
  userName = "Estudante",
}: WelcomeTemplateProps) {
  const previewText = `Bem-vindo(a) ao Clube do ECG, ${userName}! Sua jornada para dominar o ECG começa agora.`

  return (
    <BaseTemplate previewText={previewText}>
      {/* Emoji de boas-vindas */}
      <Section style={emojiSection}>
        <Text style={emoji}>🎉</Text>
      </Section>

      {/* Título */}
      <Heading style={heading}>
        Bem-vindo(a) ao Clube do ECG!
      </Heading>

      <Text style={greeting}>
        Olá, <strong>{userName}</strong>!
      </Text>

      <Text style={paragraph}>
        Você acaba de dar o primeiro passo para dominar a interpretação de ECG 
        com <strong style={highlight}>clareza e confiança</strong>!
      </Text>

      {/* O que você vai encontrar */}
      <Section style={featuresSection}>
        <Heading as="h2" style={sectionTitle}>
          O que você vai encontrar aqui:
        </Heading>

        <Section style={featureItem}>
          <Text style={featureIcon}>🎓</Text>
          <Section style={featureContent}>
            <Text style={featureTitle}>Método CAMPOS-ECG™</Text>
            <Text style={featureDesc}>Aprenda a interpretar ECG de forma estruturada e sistemática</Text>
          </Section>
        </Section>

        <Section style={featureItem}>
          <Text style={featureIcon}>📚</Text>
          <Section style={featureContent}>
            <Text style={featureTitle}>Aulas em Vídeo</Text>
            <Text style={featureDesc}>Conteúdo direto ao ponto, sem enrolação</Text>
          </Section>
        </Section>

        <Section style={featureItem}>
          <Text style={featureIcon}>🧠</Text>
          <Section style={featureContent}>
            <Text style={featureTitle}>Quizzes Interativos</Text>
            <Text style={featureDesc}>Teste seus conhecimentos com casos clínicos reais</Text>
          </Section>
        </Section>

        <Section style={featureItem}>
          <Text style={featureIcon}>🏆</Text>
          <Section style={featureContent}>
            <Text style={featureTitle}>Gamificação</Text>
            <Text style={featureDesc}>Acompanhe seu progresso e desbloqueie conquistas</Text>
          </Section>
        </Section>
      </Section>

      {/* Primeiro passo */}
      <Section style={ctaSection}>
        <Text style={ctaText}>
          Pronto para começar? Sua primeira aula está esperando:
        </Text>
        
        <Button href={`${baseUrl}/cursos`} style={button}>
          Ir para os Cursos →
        </Button>
      </Section>

      {/* Dica */}
      <Section style={tipSection}>
        <Text style={tipTitle}>💡 Dica de Ouro</Text>
        <Text style={tipText}>
          Comece pelo curso <strong>&ldquo;Faixa Branca&rdquo;</strong> - é gratuito e vai 
          te dar a base necessária para avançar nos próximos níveis!
        </Text>
      </Section>

      {/* Assinatura */}
      <Section style={signatureSection}>
        <Text style={signatureText}>
          Estou aqui para te ajudar nessa jornada!
        </Text>
        <Text style={signatureName}>
          Dra. Antonina Campos
        </Text>
        <Text style={signatureRole}>
          Criadora do Método CAMPOS-ECG™
        </Text>
      </Section>
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

const greeting = {
  color: "#ffffff",
  fontSize: "18px",
  textAlign: "center" as const,
  margin: "0 0 16px",
}

const paragraph = {
  color: "#cccccc",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "center" as const,
  margin: "0 0 32px",
}

const highlight = {
  color: "#9d1915",
}

const featuresSection = {
  backgroundColor: "#2a2a2a",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "32px",
}

const sectionTitle = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 20px",
  textAlign: "center" as const,
}

const featureItem = {
  marginBottom: "16px",
  display: "flex",
  alignItems: "flex-start",
}

const featureIcon = {
  fontSize: "24px",
  margin: "0 12px 0 0",
  display: "inline-block",
  width: "32px",
}

const featureContent = {
  flex: "1",
  display: "inline-block",
}

const featureTitle = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 4px",
}

const featureDesc = {
  color: "#888",
  fontSize: "14px",
  margin: "0",
  lineHeight: "20px",
}

const ctaSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
}

const ctaText = {
  color: "#cccccc",
  fontSize: "16px",
  margin: "0 0 16px",
}

const button = {
  backgroundColor: "#9d1915",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 40px",
}

const tipSection = {
  backgroundColor: "#1a2e1a",
  border: "1px solid #7db975",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "32px",
}

const tipTitle = {
  color: "#7db975",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 8px",
}

const tipText = {
  color: "#cccccc",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
}

const signatureSection = {
  textAlign: "center" as const,
  borderTop: "1px solid #333",
  paddingTop: "24px",
}

const signatureText = {
  color: "#888",
  fontSize: "14px",
  fontStyle: "italic",
  margin: "0 0 12px",
}

const signatureName = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
}

const signatureRole = {
  color: "#9d1915",
  fontSize: "14px",
  margin: "4px 0 0",
}

export default WelcomeTemplate

