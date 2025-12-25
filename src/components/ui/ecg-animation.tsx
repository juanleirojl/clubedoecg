"use client"

// Versão com traçado contínuo movendo-se da direita para a esquerda
// Usa CSS global para compatibilidade com Safari iOS
export function ECGAnimationContinuous({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 60 30"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id="ecg-clip">
            <rect x="0" y="0" width="60" height="30" />
          </clipPath>
        </defs>
        
        <g clipPath="url(#ecg-clip)">
          {/* Traçado principal que se move - usa classe CSS global */}
          <g className="ecg-moving">
            {/* Primeiro conjunto de batimentos */}
            <path
              d="M0,15 L8,15 L10,15 L12,8 L14,22 L16,4 L18,26 L20,15 L25,15 L27,13 L29,17 L30,15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Segundo conjunto para loop */}
            <path
              d="M30,15 L38,15 L40,15 L42,8 L44,22 L46,4 L48,26 L50,15 L55,15 L57,13 L59,17 L60,15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Terceiro conjunto para continuidade */}
            <path
              d="M60,15 L68,15 L70,15 L72,8 L74,22 L76,4 L78,26 L80,15 L85,15 L87,13 L89,17 L90,15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>
    </div>
  )
}

// Alias para compatibilidade
export const ECGAnimation = ECGAnimationContinuous
