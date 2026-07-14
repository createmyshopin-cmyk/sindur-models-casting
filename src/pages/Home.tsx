import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, User, FileImage } from 'lucide-react';

import type { FormData, Step } from '../types';
import { FormInput } from '../components/FormInput';
import { RadioGroup } from '../components/RadioGroup';
import { PhotoUploader } from '../components/PhotoUploader';
import { StepTimeline } from '../components/StepTimeline';
import { Success } from '../components/Success';
import { submitApplication } from '../services/google';
import logoImg from '../assets/logo.png';
import { sendWatiMessage } from '../services/wati';

// Validation Schema
const registrationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim(),
  gender: z.enum(['female', 'male', '']).refine((val) => val !== '', 'Please select your gender'),
  age: z
    .union([z.number(), z.string()])
    .transform((val) => (val === '' ? undefined : Number(val)))
    .refine((val) => val !== undefined && !isNaN(val), 'Age is required')
    .pipe(
      z
        .number()
        .min(1, 'Please enter a valid age')
    ),
  whatsapp: z
    .string()
    .min(1, 'WhatsApp number is required')
    .regex(/^(?:\+?91)?[6-9]\d{9}$/, 'WhatsApp number must be a valid 10-digit number (e.g. 9876543210 or +919876543210)'),
  location: z.string().min(2, 'Location is required').trim(),
  height: z.string().min(1, 'Please select your height'),
  previousShoot: z.enum(['yes', 'no', '']).refine((val) => val !== '', 'Please select whether you have done a shoot before'),
  instagram: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        return !/\s/.test(val.trim());
      },
      'Instagram must be a valid username or profile link (no spaces)'
    ),
  photo1: z.any().refine((file) => file instanceof File, 'Photo 1 is required'),
  photo2: z.any().refine((file) => file instanceof File, 'Photo 2 is required'),
});

const STEPS: Step[] = [
  {
    id: 'personal',
    title: 'Personal Details',
    subtitle: 'Step 1 of 5 • Enter your basic contact information.',
    fields: ['name', 'gender', 'age', 'whatsapp'],
  },
  {
    id: 'model',
    title: 'Model Info',
    subtitle: 'Step 2 of 5 • Tell us your height and location.',
    fields: ['location', 'height'],
  },
  {
    id: 'experience',
    title: 'Experience',
    subtitle: 'Step 3 of 5 • Share your modeling background and social handle.',
    fields: ['previousShoot', 'instagram'],
  },
  {
    id: 'photos',
    title: 'Upload Photos',
    subtitle: 'Step 4 of 5 • Provide exactly two high-quality photos.',
    fields: ['photo1', 'photo2'],
  },
  {
    id: 'review',
    title: 'Review',
    subtitle: 'Step 5 of 5 • Double check before submitting.',
    fields: [],
  },
];

const HEIGHT_OPTIONS = [
  "4'10\"", "4'11\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"",
  "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"",
  "6'2\"", "6'3\"", "6'4\""
];

export const Home: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState<number>(0); // -1 for back, 1 for next
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
        setIsKeyboardOpen(true);
      }
    };
    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
        setTimeout(() => {
          if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
            setIsKeyboardOpen(false);
          }
        }, 100);
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  const [isSuccess, setIsSuccess] = useState(false);

  const currentStep = STEPS[currentStepIndex];

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registrationSchema) as any,
    mode: 'onTouched',
    defaultValues: {
      name: '',
      gender: '',
      age: '',
      whatsapp: '',
      location: '',
      height: '',
      previousShoot: '',
      instagram: '',
      photo1: null,
      photo2: null,
    },
  });

  // Watch form fields for custom rendering
  const watchedGender = watch('gender');
  const watchedPreviousShoot = watch('previousShoot');
  const watchedPhoto1 = watch('photo1');
  const watchedPhoto2 = watch('photo2');
  const allFormValues = watch();

  const handleNext = async () => {
    // Determine which fields belong to current step
    const stepFields = currentStep.fields;
    
    // Validate only these fields
    const isValid = await trigger(stepFields);
    
    if (isValid) {
      setDirection(1);
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Auto-scroll to first validation error
      setTimeout(() => {
        const firstErrorEl = document.querySelector('[aria-invalid="true"]');
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight it using toast
          const errorMsg = Object.values(errors)[0]?.message as string;
          if (errorMsg) {
            toast.error(errorMsg, { id: 'validation-error' });
          }
        }
      }, 100);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    // Final check for photos
    if (!data.photo1 || !data.photo2) {
      toast.error('Exactly two photos are required before submitting.', { id: 'photo-missing' });
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress(0);

    // Simulated progress bar ticker (CORS safe, browser compatible)
    const progressInterval = window.setInterval(() => {
      setSubmitProgress((prev) => {
        if (prev >= 98) {
          clearInterval(progressInterval);
          return 98;
        }
        // Ticks up faster at first, then slows down as it approaches 98%
        const increment = prev < 50 ? 6 : prev < 80 ? 3 : 1;
        return prev + increment;
      });
    }, 120);

    try {
      const result = await submitApplication(data);
      clearInterval(progressInterval);
      setSubmitProgress(100);

      // Short delay so they see the progress reach 100%
      await new Promise((resolve) => setTimeout(resolve, 350));

      if (result.success) {
        try {
          await sendWatiMessage(data.whatsapp, data.name);
        } catch (watiError) {
          console.warn('Wati client message skip/fail:', watiError);
        }

        if (result.message && result.message.startsWith('Demo Mode')) {
          toast.success(result.message, { duration: 6000 });
        } else {
          toast.success('Application submitted successfully!');
        }
        setIsSuccess(true);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      toast.error(err?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setCurrentStepIndex(0);
    setDirection(0);
    setIsSuccess(false);
  };

  // Motion animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-[500px] min-h-[100dvh] md:min-h-0 bg-white md:rounded-[18px] md:shadow-xl md:border md:border-neutral-100 flex flex-col justify-between md:overflow-hidden">
        {/* Brand Logo Header */}
        <div className="w-full py-4 flex justify-center bg-white border-b border-neutral-100">
          <img src={logoImg} alt="Sindur Logo" className="h-12 object-contain" />
        </div>
        <Success onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[500px] min-h-[100dvh] md:min-h-0 bg-white md:rounded-[18px] md:shadow-2xl md:border md:border-neutral-100 flex flex-col justify-between md:overflow-hidden relative">
      {/* Brand Logo Header */}
      <div className="w-full py-4 flex justify-center bg-white border-b border-neutral-100">
        <img src={logoImg} alt="Sindur Logo" className="h-12 object-contain" />
      </div>
      
      {/* Submit Dark Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white gap-6">
          {/* Custom circular progress loader */}
          <div className="relative w-20 h-20 flex items-center justify-center select-none">
            {/* Background track circle */}
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            {/* Animated progress ring */}
            <svg className="absolute inset-0 w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                className="stroke-luxury-orange"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="226.2"
                strokeDashoffset={226.2 - (226.2 * submitProgress) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
              />
            </svg>
            {/* Ticking Percentage Text */}
            <span className="text-sm font-bold text-white tabular-nums">{submitProgress}%</span>
          </div>
          <div className="text-center flex flex-col gap-1.5 mt-1">
            <span className="font-serif text-xl font-light tracking-widest text-luxury-orange uppercase">Submitting</span>
            <span className="text-[11px] text-neutral-400 uppercase tracking-[0.2em]">your casting application...</span>
          </div>
        </div>
      )}

      {/* Main Form Body */}
      <div className="flex flex-col flex-1">
        {/* Step Progress Timeline Header */}
        <StepTimeline currentStepIndex={currentStepIndex} steps={STEPS} />

        <div className={`px-6 pt-6 flex-1 flex flex-col justify-start transition-all duration-300
          ${isKeyboardOpen ? 'pb-8' : 'pb-24 md:pb-8'}
        `}>
          {/* Headline Section */}
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-light text-black tracking-wide leading-tight">
              {currentStep.title === 'Review' ? 'Application Summary' : 'Model Casting'}
            </h2>
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-[0.1em] mt-1.5">
              {currentStep.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6 flex-1">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentStep.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-5 flex-1"
              >
                {/* STEP 1: PERSONAL DETAILS */}
                {currentStep.id === 'personal' && (
                  <>
                    <FormInput
                      label="Full Name"
                      placeholder="e.g. John Doe"
                      required
                      register={register('name')}
                      error={errors.name?.message}
                    />

                    <RadioGroup
                      label="Gender"
                      required
                      options={[
                        { label: 'Female', value: 'female' },
                        { label: 'Male', value: 'male' },
                      ]}
                      register={register('gender')}
                      currentValue={watchedGender}
                      error={errors.gender?.message}
                    />

                    <FormInput
                      label="Age"
                      type="number"
                      placeholder="e.g. 21"
                      required
                      register={register('age')}
                      error={errors.age?.message}
                      min={1}
                    />

                    <FormInput
                      label="WhatsApp Number"
                      type="tel"
                      placeholder="e.g. 9876543210 or +919876543210"
                      required
                      register={register('whatsapp')}
                      error={errors.whatsapp?.message}
                    />
                  </>
                )}

                {/* STEP 2: MODEL INFORMATION */}
                {currentStep.id === 'model' && (
                  <>
                    <FormInput
                      label="Location"
                      placeholder="e.g. Kochi"
                      required
                      register={register('location')}
                      error={errors.location?.message}
                    />

                    <div className="flex flex-col gap-2 w-full">
                      <label
                        htmlFor="height"
                        className="text-[11px] font-semibold tracking-[0.12em] uppercase text-neutral-500 flex items-center gap-1"
                      >
                        Height <span className="text-red-500 font-normal">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="height"
                          aria-invalid={errors.height ? 'true' : 'false'}
                          className={`w-full bg-luxury-gray text-black px-4 py-3.5 rounded-[12px] border border-transparent 
                            text-[15px] font-medium transition-all duration-300 appearance-none cursor-pointer
                            hover:bg-neutral-100/80 focus:bg-white focus:border-black focus:ring-1 focus:ring-black
                            ${errors.height ? 'border-red-500 bg-red-50/20' : ''}
                          `}
                          {...register('height')}
                        >
                          <option value="">Select your height</option>
                          {HEIGHT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                      {errors.height && (
                        <span className="text-xs text-red-500 font-medium tracking-wide mt-0.5" role="alert">
                          {errors.height.message}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {/* STEP 3: EXPERIENCE */}
                {currentStep.id === 'experience' && (
                  <>
                    <RadioGroup
                      label="Have you done a professional model shoot before?"
                      required
                      options={[
                        { label: 'Yes', value: 'yes' },
                        { label: 'No', value: 'no' },
                      ]}
                      register={register('previousShoot')}
                      currentValue={watchedPreviousShoot}
                      error={errors.previousShoot?.message}
                    />

                    <FormInput
                      label="Instagram ID / Profile Link (Optional)"
                      placeholder="e.g. @username or instagram.com/username"
                      register={register('instagram')}
                      error={errors.instagram?.message}
                    />
                  </>
                )}

                {/* STEP 4: UPLOAD PHOTOS */}
                {currentStep.id === 'photos' && (
                  <PhotoUploader
                    photo1={watchedPhoto1}
                    photo2={watchedPhoto2}
                    onChangePhoto1={(file) => setValue('photo1', file, { shouldValidate: true })}
                    onChangePhoto2={(file) => setValue('photo2', file, { shouldValidate: true })}
                    error={errors.photo1?.message || errors.photo2?.message}
                    isProcessing={isPhotoProcessing}
                    setIsProcessing={setIsPhotoProcessing}
                  />
                )}

                {/* STEP 5: REVIEW APPLICATION */}
                {currentStep.id === 'review' && (
                  <div className="flex flex-col gap-4">
                    {/* Data Summary Grid */}
                    <div className="bg-luxury-gray rounded-[16px] p-5 flex flex-col gap-4 border border-neutral-100">
                      
                      <div className="flex justify-between items-center pb-2.5 border-b border-neutral-200">
                        <span className="text-xs font-bold tracking-wider text-black uppercase flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Details
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-sm">
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">Full Name</span>
                          <span className="font-semibold text-black">{allFormValues.name}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">Gender</span>
                          <span className="font-semibold text-black capitalize">{allFormValues.gender}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">Age</span>
                          <span className="font-semibold text-black">{allFormValues.age} yrs</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">WhatsApp</span>
                          <span className="font-semibold text-black">{allFormValues.whatsapp}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">Location</span>
                          <span className="font-semibold text-black">{allFormValues.location}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">Height</span>
                          <span className="font-semibold text-black">{allFormValues.height}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">Prior Experience</span>
                          <span className="font-semibold text-black capitalize">{allFormValues.previousShoot}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">Instagram</span>
                          <span className="font-semibold text-black">{allFormValues.instagram || 'None'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Image Previews inside Review */}
                    <div className="bg-luxury-gray rounded-[16px] p-5 flex flex-col gap-4 border border-neutral-100">
                      <div className="flex justify-between items-center pb-2.5 border-b border-neutral-200">
                        <span className="text-xs font-bold tracking-wider text-black uppercase flex items-center gap-1.5">
                          <FileImage className="w-3.5 h-3.5" /> Full-Length Photos
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {watchedPhoto1 && (
                          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-neutral-200">
                            <img
                              src={URL.createObjectURL(watchedPhoto1)}
                              alt="Review Preview 1"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-black/65 px-2 py-0.5 rounded text-[9px] text-white">
                              Photo 1
                            </div>
                          </div>
                        )}
                        {watchedPhoto2 && (
                          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-neutral-200">
                            <img
                              src={URL.createObjectURL(watchedPhoto2)}
                              alt="Review Preview 2"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-black/65 px-2 py-0.5 rounded text-[9px] text-white">
                              Photo 2
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </form>
        </div>
      </div>

      {/* Button Controls Container (Sticky at bottom on mobile, relative on desktop) */}
      <div className={`border-t border-neutral-100 px-6 py-4 bg-white md:relative z-20 flex gap-4 w-full justify-between items-center max-w-[500px] mx-auto transition-all duration-300
        ${isKeyboardOpen 
          ? 'relative shadow-none pb-4' 
          : 'fixed bottom-0 left-0 right-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] md:shadow-none'
        }
      `}>
        {/* Back Button */}
        {currentStepIndex > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 px-5 py-4 border border-neutral-200 rounded-[14px] text-sm font-semibold tracking-wide hover:border-black active:scale-95 transition-luxury bg-white text-black"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}

        {/* Action Button: Next or Submit */}
        {currentStepIndex < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={isPhotoProcessing}
            className={`flex items-center justify-center gap-1 flex-1 py-4 bg-black text-white rounded-[14px] text-sm font-semibold tracking-wide
              active:scale-98 transition-luxury shadow-md hover:bg-neutral-800 focus:outline-none
              ${isPhotoProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit(handleFormSubmit)}
            className="flex items-center justify-center gap-1 flex-1 py-4 bg-black text-white rounded-[14px] text-sm font-semibold tracking-wide
              active:scale-98 transition-luxury shadow-md hover:bg-neutral-800 focus:outline-none"
          >
            Submit Application
          </button>
        )}
      </div>
    </div>
  );
};
export default Home;
