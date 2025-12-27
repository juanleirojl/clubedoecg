"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, defaultChecked, onCheckedChange, disabled, className, size = "md", ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked || checked || false)
    
    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked)
      }
    }, [checked])
    
    const handleClick = () => {
      if (disabled) return
      const newValue = !isChecked
      setIsChecked(newValue)
      onCheckedChange?.(newValue)
    }
    
    const sizes = {
      sm: { track: "h-5 w-9", thumb: "h-4 w-4", translate: "translate-x-4" },
      md: { track: "h-6 w-11", thumb: "h-5 w-5", translate: "translate-x-5" },
      lg: { track: "h-7 w-14", thumb: "h-6 w-6", translate: "translate-x-7" },
    }
    
    const { track, thumb, translate } = sizes[size]
    
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        ref={ref}
        onClick={handleClick}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600",
          track,
          className
        )}
        {...props}
      >
        {/* Labels ON/OFF */}
        <span className={cn(
          "absolute left-1 text-[8px] font-bold uppercase transition-opacity",
          isChecked ? "opacity-100 text-white" : "opacity-0"
        )}>
          ON
        </span>
        <span className={cn(
          "absolute right-1 text-[8px] font-bold uppercase transition-opacity",
          isChecked ? "opacity-0" : "opacity-100 text-slate-500 dark:text-slate-400"
        )}>
          OFF
        </span>
        
        {/* Thumb */}
        <span
          className={cn(
            "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
            thumb,
            isChecked ? translate : "translate-x-0"
          )}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
