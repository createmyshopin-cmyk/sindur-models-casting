import React from 'react';
import { Check } from 'lucide-react';
import type { StepId } from '../types';

interface StepTimelineProps {
  currentStepIndex: number;
  steps: { id: StepId; title: string }[];
}

export const StepTimeline: React.FC<StepTimelineProps> = ({ currentStepIndex, steps }) => {
  const progressPercentage = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div className="w-full flex flex-col gap-5 py-4 border-b border-neutral-100 bg-white">
      {/* Upper Status Row */}
      <div className="flex items-center justify-between px-2">
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400">
          Step {currentStepIndex + 1} of {steps.length}
        </span>
        <span className="text-xs font-bold tracking-[0.05em] text-black">
          {progressPercentage}% Completed
        </span>
      </div>

      {/* Sleek Progress Line */}
      <div className="relative w-full h-[2px] bg-neutral-100">
        <div
          className="absolute left-0 top-0 h-full bg-luxury-orange transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Steps Dots List */}
      <div className="flex items-center justify-between px-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <div key={step.id} className="flex flex-col items-center gap-1.5 flex-1 relative">
              {/* Dot Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wide transition-luxury
                  ${isCompleted 
                    ? 'bg-luxury-orange text-white border border-luxury-orange' 
                    : isActive 
                      ? 'bg-black text-white border border-black scale-110 shadow-sm' 
                      : 'bg-white text-neutral-400 border border-neutral-200'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Title label - Only show on larger sizes or just make it tiny and uppercase */}
              <span
                className={`text-[9px] font-semibold uppercase tracking-wider text-center max-w-[70px] truncate transition-colors duration-300
                  ${isActive ? 'text-luxury-orange font-bold' : 'text-neutral-400'}
                `}
              >
                {step.title.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
