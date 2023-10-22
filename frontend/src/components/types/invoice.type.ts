export type InvoiceType = {
  id: number;
  public_id: string;
  date_submitted: string;
  created_at: string;
  description: string;
  type: string;
  status: string;
  currency_code: string;
  quantity: number;
  total_amount: string;
  contract: {
    id: string;
    title: string;
    type: string;
  };
  reported_by: {
    id: number;
    full_name: string;
  };
  reviewed_by: null | any; // Replace 'any' with the actual type if known
  payment_cycle: {
    start_date: string;
    end_date: string;
  };
  worksheet: {
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
  };
  attachment: null | any; // Replace 'any' with the actual type if known
};
