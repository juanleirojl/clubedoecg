"use client"

import { cn } from "@/lib/utils"

interface BeltIconProps {
  belt: "white" | "blue" | "black"
  size?: "sm" | "md" | "lg"
  className?: string
}

const beltColors = {
  white: {
    belt: "bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300",
    gi: "bg-white",
    text: "Faixa Branca",
    level: "Básico",
  },
  blue: {
    belt: "bg-gradient-to-r from-blue-500 to-blue-600",
    gi: "bg-white",
    text: "Faixa Azul",
    level: "Intermediário",
  },
  black: {
    belt: "bg-gradient-to-r from-gray-800 to-gray-900",
    gi: "bg-white",
    text: "Faixa Preta",
    level: "Avançado",
  },
}

const sizes = {
  sm: { container: "w-16 h-20", belt: "h-2", person: "w-10 h-12" },
  md: { container: "w-24 h-28", belt: "h-3", person: "w-14 h-16" },
  lg: { container: "w-32 h-36", belt: "h-4", person: "w-20 h-24" },
}

export function BeltIcon({ belt, size = "md", className }: BeltIconProps) {
  const colors = beltColors[belt]
  const sizeClasses = sizes[size]

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Atleta com faixa */}
      <div className={cn("relative flex flex-col items-center", sizeClasses.container)}>
        {/* Cabeça */}
        <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-amber-300 mb-1" />
        
        {/* Corpo (Gi) */}
        <div className={cn(
          "relative rounded-t-lg shadow-md flex-1 w-full",
          colors.gi,
          "border border-gray-200"
        )}>
          {/* Gola do Gi */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-3 bg-gray-100 rounded-b-full" />
          
          {/* Faixa */}
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 left-0 right-0 mx-1 rounded-sm shadow-sm",
            sizeClasses.belt,
            colors.belt
          )}>
            {/* Nó da faixa */}
            <div className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2 w-2 h-4 rounded-full",
              colors.belt
            )} />
          </div>
        </div>
      </div>
      
      {/* Label */}
      <div className="mt-2 text-center">
        <p className="font-bold text-sm text-foreground">{colors.text}</p>
        <p className="text-xs text-muted-foreground">{colors.level}</p>
      </div>
    </div>
  )
}

// Versão simplificada só com a faixa (para badges)
export function BeltBadge({ belt, className }: { belt: "white" | "blue" | "black"; className?: string }) {
  const colors = beltColors[belt]
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
      belt === "white" && "bg-gray-100 text-gray-700 border border-gray-300",
      belt === "blue" && "bg-blue-500 text-white",
      belt === "black" && "bg-gray-900 text-white",
      className
    )}>
      {/* Mini faixa */}
      <div className={cn(
        "w-6 h-1.5 rounded-full",
        colors.belt
      )} />
      <span className="text-xs font-semibold">{colors.text}</span>
    </div>
  )
}



