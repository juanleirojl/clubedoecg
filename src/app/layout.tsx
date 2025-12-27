import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BRAND_COLORS } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Melhora performance de fonte
});

// ==========================================
// SEO & METADATA COMPLETO
// ==========================================

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clubedoecg.com.br";

export const metadata: Metadata = {
  // Básico
  title: {
    default: "Clube do ECG - Método CAMPOS-ECG™",
    template: "%s | Clube do ECG",
  },
  description: "Domine o ECG no plantão com clareza e confiança. Método exclusivo de interpretação clínica do ECG aplicada ao plantão, criado pela Dra. Antonina Campos.",
  keywords: [
    "ECG",
    "eletrocardiograma",
    "medicina",
    "cardiologia",
    "curso online",
    "plantão",
    "Método CAMPOS-ECG",
    "Antonina Campos",
    "interpretação ECG",
    "arritmias",
    "raciocínio clínico",
  ],
  authors: [{ name: "Dra. Antonina Campos", url: siteUrl }],
  creator: "Clube do ECG",
  publisher: "Clube do ECG",
  
  // Canonical URL
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  
  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Clube do ECG",
    title: "Clube do ECG - Método CAMPOS-ECG™",
    description: "Domine o ECG no plantão com clareza e confiança. Método exclusivo da Dra. Antonina Campos.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Clube do ECG - Método CAMPOS-ECG™",
      },
    ],
  },
  
  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Clube do ECG - Método CAMPOS-ECG™",
    description: "Domine o ECG no plantão com clareza e confiança.",
    images: ["/og-image.jpg"],
    creator: "@clubedoecg",
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },
  
  // PWA Manifest
  manifest: "/manifest.json",
  
  // Verificação (adicionar quando tiver)
  // verification: {
  //   google: "seu-codigo-google",
  // },
};

// Viewport separado (Next.js 14+)
export const viewport: Viewport = {
  themeColor: BRAND_COLORS.primary,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Preconnect para recursos externos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://player.pandavideo.com.br" />
        
        {/* DNS Prefetch para Supabase */}
        <link rel="dns-prefetch" href="https://jgcolkkztqimtvdpuvxy.supabase.co" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
