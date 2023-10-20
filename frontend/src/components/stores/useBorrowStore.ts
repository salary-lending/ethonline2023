
import {create} from 'zustand';

type BorrowFormState = {
  currentStep: number;
  formData: {
    
  };
  setCurrentStep: (step: number) => void;
  setFormData: (data: Partial<BorrowFormState['formData']>) => void;
  nextStep: () => void;
  prevStep: () => void;
};

const useBorrowFormState = create<BorrowFormState>((set) => ({
  currentStep: 0,
  formData: {
    apiKey:"",
    selectedInvoiceToMint:""
  },
  setCurrentStep: (step) => set({ currentStep: step }),
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
}));

export default useBorrowFormState