
import {create} from 'zustand';
import { InvoiceType } from '../types/invoice.type';

type BorrowFormState = {
  currentStep: number;
  selectedInvoiceToMint:InvoiceType
  setCurrentStep: (step: number) => void;
  setSelectedInvoiceToMint:(invoice:InvoiceType) => void;
  nextStep: () => void;
  prevStep: () => void;
};

const useBorrowFormState = create<BorrowFormState>((set) => ({
  currentStep: 0,
  selectedInvoiceToMint:{} as InvoiceType,
  setCurrentStep: (step) => set({ currentStep: step }),
  setSelectedInvoiceToMint: (invoice) => set((state)=> ({selectedInvoiceToMint:invoice})),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
}));

export default useBorrowFormState