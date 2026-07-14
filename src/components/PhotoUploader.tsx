import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Camera, X, RefreshCw } from 'lucide-react';

interface PhotoUploaderProps {
  photo1: File | null;
  photo2: File | null;
  onChangePhoto1: (file: File | null) => void;
  onChangePhoto2: (file: File | null) => void;
  error?: string;
  isProcessing: boolean;
  setIsProcessing: (loading: boolean) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photo1,
  photo2,
  onChangePhoto1,
  onChangePhoto2,
  error,
  isProcessing,
  setIsProcessing,
}) => {
  const [compressing1, setCompressing1] = useState(false);
  const [compressing2, setCompressing2] = useState(false);
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  const processFile = async (
    file: File,
    setCompressing: (val: boolean) => void,
    onChange: (file: File | null) => void
  ) => {
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, JPEG, and PNG files are allowed.');
      return;
    }

    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      alert('The file is larger than 10MB. Please select a smaller image.');
      return;
    }

    setIsProcessing(true);
    // Compress if file is larger than 5MB (5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      setCompressing(true);
      try {
        const options = {
          maxSizeMB: 4.5, // Ensure it stays well under 5MB after compression
          maxWidthOrHeight: 2048,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        // Retain original name
        const renamedCompressedFile = new File([compressedFile], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });
        onChange(renamedCompressedFile);
      } catch (err) {
        console.error('Image compression error:', err);
        alert('Failed to compress image. Proceeding with original.');
        onChange(file);
      } finally {
        setCompressing(false);
      }
    } else {
      onChange(file);
    }
    setIsProcessing(false);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setCompressing: (val: boolean) => void,
    onChange: (file: File | null) => void
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0], setCompressing, onChange);
    }
  };

  const removePhoto = (
    _slot: 1 | 2,
    onChange: (file: File | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const renderSlot = (
    slotNum: 1 | 2,
    file: File | null,
    compressing: boolean,
    onChange: (file: File | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const isSlotEmpty = !file && !compressing;

    return (
      <div className="relative w-full aspect-[3/4] rounded-[16px] overflow-hidden border border-neutral-200 bg-luxury-gray transition-luxury group hover:border-black flex flex-col items-center justify-center p-4">
        {/* Hidden Input */}
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          ref={inputRef}
          className="hidden"
          onChange={(e) => handleFileChange(e, slotNum === 1 ? setCompressing1 : setCompressing2, onChange)}
          disabled={isProcessing}
        />

        {compressing && (
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
            <span className="text-xs font-medium tracking-wider text-neutral-500 uppercase">
              Compressing...
            </span>
          </div>
        )}

        {isSlotEmpty && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
            className="w-full h-full flex flex-col items-center justify-center gap-4 text-neutral-400 group-hover:text-black transition-luxury focus:outline-none"
          >
            <div className="w-12 h-12 rounded-full border border-neutral-300 flex items-center justify-center bg-white group-hover:border-black transition-luxury shadow-sm">
              <Camera className="w-5 h-5 text-neutral-500 group-hover:text-black" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-semibold tracking-wide text-black mb-1">
                Photo {slotNum}
              </span>
              <span className="block text-[11px] text-neutral-400 uppercase tracking-widest">
                Full-Length
              </span>
            </div>
          </button>
        )}

        {file && !compressing && (
          <>
            {/* Image Preview */}
            <img
              src={URL.createObjectURL(file)}
              alt={`Upload ${slotNum}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                type="button"
                onClick={() => removePhoto(slotNum, onChange, inputRef)}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-115 transition-transform shadow-md"
                title="Remove photo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Metadata Badge */}
            <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm text-[10px] text-white font-medium px-2.5 py-1 rounded-full tracking-wide">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-neutral-500 flex items-center gap-1">
          Upload 2 Full-Length Photos <span className="text-red-500">*</span>
        </span>
        <span className="text-[10px] text-neutral-400 font-medium">
          JPG, JPEG, PNG (Max 10MB)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-1">
        {renderSlot(1, photo1, compressing1, onChangePhoto1, fileInputRef1)}
        {renderSlot(2, photo2, compressing2, onChangePhoto2, fileInputRef2)}
      </div>

      {error && (
        <span className="text-xs text-red-500 font-medium tracking-wide mt-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
