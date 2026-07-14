import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  register: UseFormRegisterReturn;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type = 'text',
  placeholder,
  error,
  required,
  register,
  className = '',
  min,
  max,
  step,
}) => {
  const id = register.name;

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <label
        htmlFor={id}
        className="text-[11px] font-semibold tracking-[0.12em] uppercase text-neutral-500 flex items-center gap-1"
      >
        {label}
        {required && <span className="text-red-500 font-normal">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full bg-luxury-gray text-black px-4 py-3.5 rounded-[12px] border border-transparent 
            text-[15px] font-normal transition-all duration-300 placeholder-neutral-400
            hover:bg-neutral-100/80 focus:bg-white focus:border-black focus:ring-1 focus:ring-black
            ${error ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          {...register}
        />
      </div>
      {error && (
        <span
          id={`${id}-error`}
          className="text-xs text-red-500 font-medium tracking-wide mt-0.5"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};
