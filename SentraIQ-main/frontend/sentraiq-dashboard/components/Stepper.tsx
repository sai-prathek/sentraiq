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
    <div className="w-full py-8">
      <div className="flex items-start justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10" style={{ top: '24px' }}>
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
                  w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 relative z-10
                  ${isCompleted 
                    ? 'bg-blue-900 text-white shadow-lg' 
                    : isCurrent 
                    ? 'bg-blue-900 text-white shadow-lg ring-4 ring-blue-200' 
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                  }
                  ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                    {step.id}
                  </span>
                )}
              </button>

              {/* Step Label */}
              <div className="mt-4 text-center w-full px-2" style={{ maxWidth: '140px' }}>
                <div className={`
                  text-sm font-bold mb-1
                  ${isCurrent ? 'text-gray-900' : isCompleted ? 'text-gray-900' : 'text-gray-400'}
                `}>
                  {step.label}
                </div>
                {step.description && (
                  <div className={`text-xs mt-0.5 ${
                    isCurrent ? 'text-gray-600' : isCompleted ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
