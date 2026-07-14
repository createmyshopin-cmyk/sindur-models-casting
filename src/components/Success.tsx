import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface SuccessProps {
  onReset: () => void;
}

export const Success: React.FC<SuccessProps> = ({ onReset }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "https://instagram.com/sindur.kalpetta";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10 bg-white rounded-[18px] min-h-[500px]">
      {/* Animated Circle Checkmark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-luxury-orange text-white flex items-center justify-center mb-6 shadow-lg shadow-luxury-orange/20"
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Check className="w-10 h-10 stroke-[3px]" />
        </motion.div>
      </motion.div>

      {/* Success Messages */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="font-serif text-3xl font-light tracking-wide text-black mb-4 leading-tight"
      >
        Application Submitted<br />Successfully
      </motion.h1>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-neutral-500 text-sm leading-relaxed max-w-[280px] mb-6 flex flex-col gap-1"
      >
        <p>Thank you for applying.</p>
        <p>If you are shortlisted, our casting team will contact you through WhatsApp.</p>
      </motion.div>

      {/* Instagram Redirection Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full mb-8 p-4 rounded-[14px] bg-neutral-50 border border-neutral-100 flex flex-col items-center gap-1.5"
      >
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.15em]">Follow Us</span>
        <a 
          href="https://instagram.com/sindur.kalpetta" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-base font-bold text-black hover:text-luxury-orange transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4 fill-current text-[#E1306C]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
          </svg>
          @sindur.kalpetta
        </a>
        <p className="text-[11px] text-neutral-400 font-semibold tracking-wide mt-1 select-none">
          Redirecting to Instagram in <span className="text-black font-bold tabular-nums">{countdown}</span>s...
        </p>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3.5 w-full">
        {/* Reset Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          type="button"
          onClick={onReset}
          className="w-full bg-black text-white py-4 rounded-[14px] font-semibold text-[15px] tracking-wide 
            hover:bg-neutral-800 active:scale-[0.98] transition-luxury shadow-md focus:outline-none"
        >
          Submit Another Application
        </motion.button>

        {/* WhatsApp Support Button */}
        <motion.a
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          href="https://wa.me/919400902360"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full border border-neutral-200 text-black py-4 rounded-[14px] font-semibold text-[15px] tracking-wide 
            hover:border-black hover:bg-neutral-50 active:scale-[0.98] transition-luxury flex items-center justify-center gap-2 focus:outline-none"
        >
          <svg className="w-4 h-4 fill-current text-[#25D366]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-11.585c-.205-.34-.041-.527.127-.697.168-.17.37-.43.554-.646.186-.215.247-.359.37-.599.123-.242.062-.453-.03-.646-.09-.194-.813-1.96-1.113-2.684-.29-.702-.587-.607-.812-.619-.21-.01-.45-.012-.69-.012-.24 0-.63.09-.96.45-.33.36-1.258 1.233-1.258 3.007 0 1.775 1.293 3.487 1.473 3.729.18.24 2.545 3.887 6.164 5.45.86.372 1.532.593 2.054.76.864.275 1.65.236 2.272.143.693-.103 2.13-.87 2.428-1.71.298-.84.298-1.56.21-1.71-.09-.15-.33-.24-.69-.42-.36-.18-2.13-1.05-2.46-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.9-1.79-1.072-.958-1.795-2.14-2.007-2.502z"/>
          </svg>
          Chat on WhatsApp Support
        </motion.a>
      </div>
    </div>
  );
};
