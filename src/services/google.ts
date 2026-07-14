import type { FormData } from '../types';
import { GOOGLE_SCRIPT_URL } from '../config';

// Helper to convert a File object to Base64
const fileToBase64 = (file: File): Promise<{ base64: string; name: string; type: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1]; // extract base64 string after the comma
      resolve({
        base64,
        name: file.name,
        type: file.type,
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

export const submitApplication = async (data: FormData): Promise<{ success: boolean; message?: string }> => {
  // If GOOGLE_SCRIPT_URL is not set, simulate successful submission in demo mode
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.trim() === '') {
    console.warn('Google Apps Script URL is empty. Running in Demo Mode.');
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const payload = {
      name: data.name,
      gender: data.gender,
      age: data.age,
      whatsapp: data.whatsapp,
      location: data.location,
      height: data.height,
      previousShoot: data.previousShoot,
      instagram: data.instagram || '',
      photo1: data.photo1 ? { name: data.photo1.name, type: data.photo1.type } : null,
      photo2: data.photo2 ? { name: data.photo2.name, type: data.photo2.type } : null,
    };
    
    console.log('Demo Mode Payload:', payload);
    return {
      success: true,
      message: 'Demo Mode: Form submitted successfully! Set GOOGLE_SCRIPT_URL in config.ts to enable real database storage.',
    };
  }

  try {
    // 1. Convert files to Base64 format
    const photo1Base64 = data.photo1 ? await fileToBase64(data.photo1) : null;
    const photo2Base64 = data.photo2 ? await fileToBase64(data.photo2) : null;

    const payload = {
      name: data.name,
      gender: data.gender,
      age: data.age,
      whatsapp: data.whatsapp,
      location: data.location,
      height: data.height,
      previousShoot: data.previousShoot,
      instagram: data.instagram || '',
      photo1: photo1Base64,
      photo2: photo2Base64,
    };

    // Use fetch with text/plain content-type to avoid CORS preflight options blocks in browsers
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned error status ${response.status}`);
    }

    const result = await response.json();
    if (result && result.success) {
      return { success: true };
    } else {
      throw new Error(result.error || 'Submission failed on Google side.');
    }

  } catch (error: any) {
    console.error('Google submission error:', error);
    throw new Error(error?.message || 'Network error occurred while submitting.');
  }
};
