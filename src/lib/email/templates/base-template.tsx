import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clubedoecg.com.br"

interface BaseTemplateProps {
  previewText: string
  children: React.ReactNode
}

export function BaseTemplate({ previewText, children }: BaseTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header com Logo */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/logo-antonina-transparente.png`}
              width="150"
              height="50"
              alt="Clube do ECG"
              style={logo}
            />
          </Section>

          {/* Conteúdo Principal */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Você está recebendo este email porque se cadastrou no{" "}
              <Link href={baseUrl} style={link}>
                Clube do ECG
              </Link>
              .
            </Text>
            <Text style={footerText}>
              <Link href={`${baseUrl}/configuracoes`} style={link}>
                Gerenciar preferências de email
              </Link>
              {" | "}
              <Link href={`${baseUrl}/configuracoes`} style={link}>
                Cancelar inscrição
              </Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Clube do ECG - Método CAMPOS-ECG™
              <br />
              Todos os direitos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Estilos
const main = {
  backgroundColor: "#0a0505",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#1a1a1a",
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
  borderRadius: "8px",
}

const header = {
  padding: "24px",
  textAlign: "center" as const,
  backgroundColor: "#9d1915",
  borderRadius: "8px 8px 0 0",
}

const logo = {
  margin: "0 auto",
}

const content = {
  padding: "32px 24px",
}

const hr = {
  borderColor: "#333",
  margin: "32px 0",
}

const footer = {
  padding: "0 24px",
}

const footerText = {
  color: "#666",
  fontSize: "12px",
  lineHeight: "20px",
  textAlign: "center" as const,
  margin: "8px 0",
}

const link = {
  color: "#9d1915",
  textDecoration: "underline",
}

export default BaseTemplate

