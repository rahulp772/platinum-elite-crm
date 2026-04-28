"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepperProps {
  steps: {
    label: string
    description?: string
  }[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full py-2", className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-muted -z-0" />
        <div 
          className="absolute top-4 left-0 h-0.5 bg-realty-gold transition-all duration-500 ease-in-out -z-0"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isActive = index === currentStep
          
          return (
            <div key={step.label} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background",
                  isCompleted 
                    ? "bg-realty-gold border-realty-gold text-primary-foreground" 
                    : isActive 
                    ? "border-realty-gold text-realty-gold" 
                    : "border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[3px]" />
                ) : (
                  <span className="text-xs font-bold tabular-nums">{index + 1}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                  isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
