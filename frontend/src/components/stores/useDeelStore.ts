import { create } from "zustand";
import { InvoiceType } from "../types/invoice.type";
import { DEEL_TEST_INVOICES } from "../constants/invoice_data";



type InvoiceState = {
  apiKey: string;
  isFetching: boolean;
  invoices: InvoiceType[];
  setInvoices: (invoices: InvoiceType[]) => void;
  setApiKey: (apiKey: string) => void;
};

const useDeelStore = create<InvoiceState>((set) => ({
  apiKey: "",
  currentStep: 0,
  invoices: [],
  isFetching: false,
  setInvoices: (_invoices: InvoiceType[]) => {
    set((state) => ({
      ...state,
      invoices: _invoices,
    }));
  },
  setApiKey: (apiKey: string) => {
    set((state) => ({
      ...state,
      apiKey,
    }));
  },
  setIsFetching: (isFetching: boolean) => {
    set((state) => ({
      ...state,
      isFetching,
    }));
  },
}));

export default useDeelStore;
