import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  label: string;
  options: RadioOption[];
  error?: string;
  required?: boolean;
  register: UseFormRegisterReturn;
  currentValue?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  error,
  required,
  register,
  currentValue,
  className = '',
}) => {
  const name = register.name;

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`} role="radiogroup" aria-labelledby={`${name}-label`}>
      <span
        id={`${name}-label`}
        className="text-[11px] font-semibold tracking-[0.12em] uppercase text-neutral-500 flex items-center gap-1"
      >
        {label}
        {required && <span className="text-red-500 font-normal">*</span>}
      </span>

      <div className="grid grid-cols-2 gap-3 mt-1">
        {options.map((option) => {
          const isSelected = currentValue === option.value;
          return (
            <label
              key={option.value}
              className={`flex items-center justify-between px-4 py-4 rounded-[14px] border cursor-pointer 
                transition-all duration-300 select-none
                ${isSelected 
                  ? 'border-luxury-orange bg-black text-white shadow-sm' 
                  : 'border-neutral-200 bg-luxury-gray text-black hover:border-neutral-400 hover:bg-neutral-100'
                }
              `}
            >
              <span className="text-sm font-medium tracking-wide">{option.label}</span>
              <input
                type="radio"
                value={option.value}
                className="sr-only"
                {...register}
              />
              <div 
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300
                  ${isSelected ? 'border-luxury-orange bg-luxury-orange' : 'border-neutral-400 bg-transparent'}
                `}
              >
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <span className="text-xs text-red-500 font-medium tracking-wide mt-0.5" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
