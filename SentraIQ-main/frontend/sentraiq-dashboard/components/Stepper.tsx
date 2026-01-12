import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepperProps {
  currentStep: number;
  steps: Array<{ id: number; label: string; description?: string }>;
  onStepClick?: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps, onStepClick }) => {
  return (
    <div className="w-full py-3">
      <div className="flex items-start justify-between relative">
        {/* Progress Line - Centered with circle centers (w-8 h-8 = 32px, center at 16px) */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
          <motion.div
            className="h-full bg-blue-900"
            initial={{ width: 0 }}
            animate={{ 
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <div
              key={step.id}
              className="flex flex-col items-center flex-1 relative"
              style={{ minWidth: 0 }}
            >
              {/* Step Circle */}
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 relative z-10
                  ${isCompleted 
                    ? 'bg-blue-900 text-white shadow-sm' 
                    : isCurrent 
                    ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-200' 
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                  }
                  ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                    {step.id}
                  </span>
                )}
              </button>

              {/* Step Label - Centered and properly aligned */}
              <div className="mt-1.5 text-center w-full px-1">
                <div className={`
                  text-xs font-semibold leading-tight break-words
                  ${isCurrent ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                `}>
                  {step.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
