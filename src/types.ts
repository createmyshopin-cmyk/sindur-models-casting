export interface FormData {
  name: string;
  gender: 'female' | 'male' | '';
  age: number | '';
  whatsapp: string;
  location: string;
  height: string;
  customHeight?: string;
  previousShoot: 'yes' | 'no' | '';
  instagram?: string;
  photo1: File | null;
  photo2: File | null;
}

export type StepId = 'personal' | 'model' | 'experience' | 'photos' | 'review';

export interface Step {
  id: StepId;
  title: string;
  subtitle: string;
  fields: (keyof FormData)[];
}
