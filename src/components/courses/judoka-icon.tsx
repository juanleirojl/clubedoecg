"use client"

import { cn } from "@/lib/utils"

interface JudokaIconProps {
  belt: "white" | "blue" | "black"
  size?: "sm" | "md" | "lg"
  className?: string
}

const beltColors = {
  white: {
    belt: "#FFFFFF",
    beltStroke: "#E5E5E5",
    gi: "#FAFAFA",
    giStroke: "#E5E5E5",
  },
  blue: {
    belt: "#3B82F6",
    beltStroke: "#2563EB",
    gi: "#FAFAFA",
    giStroke: "#E5E5E5",
  },
  black: {
    belt: "#1F2937",
    beltStroke: "#111827",
    gi: "#FAFAFA",
    giStroke: "#E5E5E5",
  },
}

const sizes = {
  sm: { width: 80, height: 100 },
  md: { width: 120, height: 150 },
  lg: { width: 160, height: 200 },
}

export function JudokaIcon({ belt, size = "md", className }: JudokaIconProps) {
  const colors = beltColors[belt]
  const dimensions = sizes[size]

  return (
    <svg
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 120 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Cabeça */}
      <ellipse cx="60" cy="25" rx="18" ry="20" fill="#FCD5B8" stroke="#E5C4A8" strokeWidth="1.5" />
      
      {/* Cabelo */}
      <path
        d="M42 20C42 12 50 5 60 5C70 5 78 12 78 20C78 15 72 10 60 10C48 10 42 15 42 20Z"
        fill="#4A3728"
      />
      
      {/* Olhos */}
      <ellipse cx="52" cy="24" rx="2.5" ry="3" fill="#2D2D2D" />
      <ellipse cx="68" cy="24" rx="2.5" ry="3" fill="#2D2D2D" />
      
      {/* Brilho nos olhos */}
      <circle cx="53" cy="23" r="1" fill="white" />
      <circle cx="69" cy="23" r="1" fill="white" />
      
      {/* Sobrancelhas */}
      <path d="M48 19C49 18 52 17 55 18" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M72 19C71 18 68 17 65 18" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Nariz */}
      <path d="M60 26L58 32H62L60 26Z" fill="#E5C4A8" />
      
      {/* Sorriso */}
      <path d="M54 36C56 38 64 38 66 36" stroke="#C4A088" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Orelhas */}
      <ellipse cx="41" cy="25" rx="3" ry="5" fill="#FCD5B8" stroke="#E5C4A8" strokeWidth="1" />
      <ellipse cx="79" cy="25" rx="3" ry="5" fill="#FCD5B8" stroke="#E5C4A8" strokeWidth="1" />
      
      {/* Pescoço */}
      <rect x="52" y="42" width="16" height="10" fill="#FCD5B8" />
      
      {/* Corpo - Gi (Kimono) */}
      <path
        d="M30 55L45 50L60 55L75 50L90 55L95 130H25L30 55Z"
        fill={colors.gi}
        stroke={colors.giStroke}
        strokeWidth="1.5"
      />
      
      {/* Lapela esquerda do Gi */}
      <path
        d="M45 50L60 75L40 130H25L30 55L45 50Z"
        fill={colors.gi}
        stroke={colors.giStroke}
        strokeWidth="1.5"
      />
      
      {/* Lapela direita do Gi */}
      <path
        d="M75 50L60 75L80 130H95L90 55L75 50Z"
        fill={colors.gi}
        stroke={colors.giStroke}
        strokeWidth="1.5"
      />
      
      {/* Gola em V */}
      <path
        d="M45 50L60 75L75 50"
        fill="none"
        stroke={colors.giStroke}
        strokeWidth="2"
      />
      
      {/* Faixa (Obi) */}
      <rect
        x="28"
        y="85"
        width="64"
        height="12"
        rx="2"
        fill={colors.belt}
        stroke={colors.beltStroke}
        strokeWidth="1.5"
      />
      
      {/* Nó da faixa */}
      <rect
        x="54"
        y="83"
        width="12"
        height="16"
        rx="2"
        fill={colors.belt}
        stroke={colors.beltStroke}
        strokeWidth="1.5"
      />
      
      {/* Pontas da faixa caindo */}
      <path
        d="M54 99L48 125L54 123L54 99Z"
        fill={colors.belt}
        stroke={colors.beltStroke}
        strokeWidth="1"
      />
      <path
        d="M66 99L72 125L66 123L66 99Z"
        fill={colors.belt}
        stroke={colors.beltStroke}
        strokeWidth="1"
      />
      
      {/* Braços */}
      <path
        d="M30 55L15 85L20 90L35 65"
        fill={colors.gi}
        stroke={colors.giStroke}
        strokeWidth="1.5"
      />
      <path
        d="M90 55L105 85L100 90L85 65"
        fill={colors.gi}
        stroke={colors.giStroke}
        strokeWidth="1.5"
      />
      
      {/* Mãos */}
      <ellipse cx="17" cy="88" rx="6" ry="5" fill="#FCD5B8" stroke="#E5C4A8" strokeWidth="1" />
      <ellipse cx="103" cy="88" rx="6" ry="5" fill="#FCD5B8" stroke="#E5C4A8" strokeWidth="1" />
      
      {/* Detalhes da faixa - listras para faixa preta */}
      {belt === "black" && (
        <>
          <rect x="30" y="88" width="8" height="6" fill="#DC2626" rx="1" />
          <rect x="82" y="88" width="8" height="6" fill="#DC2626" rx="1" />
        </>
      )}
      
      {/* Brilho/Destaque no kimono */}
      <path
        d="M50 60L55 70L50 80"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Versão alternativa - Judoca em pose de luta
export function JudokaFightingIcon({ belt, size = "md", className }: JudokaIconProps) {
  const colors = beltColors[belt]
  const dimensions = sizes[size]

  return (
    <svg
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 140 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Sombra no chão */}
      <ellipse cx="70" cy="145" rx="35" ry="5" fill="rgba(0,0,0,0.1)" />
      
      {/* Cabeça */}
      <ellipse cx="70" cy="25" rx="18" ry="20" fill="#FCD5B8" stroke="#E5C4A8" strokeWidth="1.5" />
      
      {/* Cabelo */}
      <path
        d="M52 20C52 12 60 5 70 5C80 5 88 12 88 20C88 15 82 10 70 10C58 10 52 15 52 20Z"
        fill="#4A3728"
      />
      
      {/* Olhos determinados */}
      <path d="M62 22L66 24L62 26" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
      <path d="M78 22L74 24L78 26" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
      
      {/* Sobrancelhas franzidas */}
      <path d="M58 18L66 20" stroke="#4A3728" strokeWidth="2" strokeLinecap="round" />
      <path d="M82 18L74 20" stroke="#4A3728" strokeWidth="2" strokeLinecap="round" />
      
      {/* Boca determinada */}
      <path d="M65 35H75" stroke="#C4A088" strokeWidth="2" strokeLinecap="round" />
      
      {/* Orelhas */}
      <ellipse cx="51" cy="25" rx="3" ry="5" fill="#FCD5B8" stroke="#E5C4A8" strokeWidth="1" />
      <ellipse cx="89" cy="25" rx="3" ry="5" fill="#FCD5B8" stroke="#E5C4A8" strokeWidth="1" />
      
      {/* Pescoço */}
      <rect x="62" y="42" width="16" height="10" fill="#FCD5B8" />
      
      {/* Corpo - Gi em posição de luta */}
      <path
        d="M40 55L55 50L70 55L85 50L100 55L105 130H35L40 55Z"
        fill={colors.gi}
        stroke={colors.giStroke}
        strokeWidth="1.5"
      />
      
      {/* Gola em V */}
      <path
        d="M55 50L70 75L85 50"
        fill="none"
        stroke={colors.giStroke}
        strokeWidth="2"
      />
      
      {/* Faixa (Obi) */}
      <rect
        x="38"
        y="85"
        width="64"
        height="12"
        rx="2"
        fill={colors.belt}
        stroke={colors.beltStroke}
        strokeWidth="1.5"
      />
      
      {/* Nó da faixa */}
      <rect
        x="64"
        y="83"
        width="12"
        height="16"
        rx="2"
        fill={colors.belt}
        stroke={colors.beltStroke}
        strokeWidth="1.5"
      />
      
      {/* Pontas da faixa esvoaçando */}
      <path
        d="M64 99L55 120C55 120 50 125 52 127"
        fill="none"
        stroke={colors.belt}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M76 99L85 120C85 120 90 125 88 127"
        fill="none"
        stroke={colors.belt}
        strokeWidth="6"
        strokeLinecap="round"
      />
      
      {/* Braço esquerdo - posição de guarda */}
      <path
        d="M40 55L20 70L25 95"
        fill="none"
        stroke={colors.gi}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 55L20 70L25 95"
        fill="none"
        stroke={colors.giStroke}
        strokeWidth="1.5"
      />
      
      {/* Braço direito - posição de guarda */}
      <path
        d="M100 55L120 70L115 95"
        fill="none"
        stroke={colors.gi}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M100 55L120 70L115 95"
        fill="none"
        stroke={colors.giStroke}
        strokeWidth="1.5"
      />
      
      {/* Mãos fechadas */}
      <circle cx="25" cy="97" r="7" fill="#FCD5B8" stroke="#E5C4A8" strokeWidth="1" />
      <circle cx="115" cy="97" r="7" fill="#FCD5B8" stroke="#E5C4A8" strokeWidth="1" />
      
      {/* Detalhes da faixa preta */}
      {belt === "black" && (
        <>
          <rect x="40" y="88" width="8" height="6" fill="#DC2626" rx="1" />
          <rect x="92" y="88" width="8" height="6" fill="#DC2626" rx="1" />
        </>
      )}
    </svg>
  )
}



