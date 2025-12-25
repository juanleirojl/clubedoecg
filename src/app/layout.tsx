import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Clube do ECG - Método CAMPOS-ECG™",
  description: "Plataforma de aprendizado contínuo em eletrocardiografia, focada em raciocínio clínico e conduta prática para estudantes e médicos recém-formados.",
  keywords: ["ECG", "eletrocardiograma", "medicina", "cardiologia", "curso online", "plantão"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
