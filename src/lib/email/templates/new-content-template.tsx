import {
  Button,
  Heading,
  Img,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"
import { BaseTemplate } from "./base-template"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clubedoecg.com.br"

interface NewContentTemplateProps {
  userName: string
  contentType: "lesson" | "course" | "module"
  contentTitle: string
  contentDescription?: string
  contentThumbnail?: string
  contentUrl: string
  courseName?: string
}

export function NewContentTemplate({
  userName = "Estudante",
  contentType = "lesson",
  contentTitle = "Nova Aula Disponível",
  contentDescription = "Aprenda mais sobre interpretação de ECG",
  contentThumbnail = "",
  contentUrl = "/cursos",
  courseName = "ECG na Prática",
}: NewContentTemplateProps) {
  const typeLabels = {
    lesson: "Nova Aula",
    course: "Novo Curso",
    module: "Novo Módulo",
  }

  const previewText = `${typeLabels[contentType]}: ${contentTitle} está disponível no Clube do ECG!`

  return (
    <BaseTemplate previewText={previewText}>
      {/* Badge de novo */}
      <Section style={badgeContainer}>
        <Text style={badge}>
          🎉 {typeLabels[contentType]}
        </Text>
      </Section>

      {/* Título */}
      <Heading style={heading}>
        {contentTitle}
      </Heading>

      {/* Curso relacionado */}
      {courseName && contentType !== "course" && (
        <Text style={courseLabel}>
          📚 {courseName}
        </Text>
      )}

      {/* Thumbnail */}
      {contentThumbnail && (
        <Section style={thumbnailContainer}>
          <Img
            src={contentThumbnail}
            width="100%"
            alt={contentTitle}
            style={thumbnail}
          />
          {/* Play button overlay */}
          <Section style={playOverlay}>
            <Text style={playButton}>▶</Text>
          </Section>
        </Section>
      )}

      {/* Descrição */}
      {contentDescription && (
        <Text style={description}>
          {contentDescription}
        </Text>
      )}

      {/* CTA */}
      <Section style={buttonContainer}>
        <Button
          href={`${baseUrl}${contentUrl}`}
          style={button}
        >
          {contentType === "lesson" ? "Assistir Agora" : "Ver Conteúdo"} →
        </Button>
      </Section>

      {/* Info adicional */}
      <Section style={infoBox}>
        <Text style={infoText}>
          💡 <strong>Dica:</strong> Assista logo após o lançamento e ganhe pontos extras de engajamento!
        </Text>
      </Section>
    </BaseTemplate>
  )
}

// Estilos específicos
const badgeContainer = {
  textAlign: "center" as const,
  marginBottom: "16px",
}

const badge = {
  backgroundColor: "#7db975",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  display: "inline-block",
  padding: "8px 16px",
  borderRadius: "100px",
  margin: "0",
}

const heading = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 12px",
  lineHeight: "36px",
}

const courseLabel = {
  color: "#888",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "0 0 24px",
}

const thumbnailContainer = {
  position: "relative" as const,
  marginBottom: "24px",
  borderRadius: "12px",
  overflow: "hidden" as const,
}

const thumbnail = {
  borderRadius: "12px",
  border: "2px solid #333",
}

const playOverlay = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
}

const playButton = {
  backgroundColor: "rgba(157, 25, 21, 0.9)",
  color: "#ffffff",
  fontSize: "24px",
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0",
  lineHeight: "64px",
  textAlign: "center" as const,
}

const description = {
  color: "#cccccc",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "center" as const,
  margin: "0 0 24px",
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

const infoBox = {
  backgroundColor: "#1e1e1e",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
}

const infoText = {
  color: "#888",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
}

export default NewContentTemplate

