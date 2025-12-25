"use client"

export function ECGAnimation({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 100 40"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Traçado de ECG animado */}
        <path
          d="M0,20 L15,20 L18,20 L20,10 L22,30 L24,5 L26,35 L28,20 L32,20 L35,18 L38,22 L40,20 L100,20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ecg-line"
        />
        {/* Segundo traçado para loop contínuo */}
        <path
          d="M0,20 L15,20 L18,20 L20,10 L22,30 L24,5 L26,35 L28,20 L32,20 L35,18 L38,22 L40,20 L100,20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ecg-line ecg-line-2"
        />
      </svg>
      
      <style jsx>{`
        .ecg-line {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: ecg-draw 2s linear infinite;
        }
        
        .ecg-line-2 {
          animation-delay: 1s;
        }
        
        @keyframes ecg-draw {
          0% {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Versão alternativa com traçado contínuo movendo-se da direita para a esquerda
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
          {/* Traçado principal que se move */}
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
      
      <style jsx>{`
        .ecg-moving {
          animation: ecg-scroll 1.5s linear infinite;
        }
        
        @keyframes ecg-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-30px);
          }
        }
      `}</style>
    </div>
  )
}

