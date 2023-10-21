import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { INVOICE_FINANCER_ADDRESS, INVOICE_TOKEN_ADDRESS } from "../constants/addresses";
import { InvoiceFinancerABI, InvoiceTokenABI } from "../constants/abi";
import { parseUnits } from "viem";

type MintInvoiceParams = {
  invoiceId: string;
  details: string;
  amount: number;
};

const useInvoiceFinancer = () => {
  const { address } = useAccount();

  const { writeAsync: _mintInvoice } = useContractWrite({
    address: INVOICE_FINANCER_ADDRESS,
    abi: InvoiceFinancerABI,
    functionName: "financeInvoice",
    account: address,
  });

  const mintInvoice = async ({
    invoiceId,
    details,
    amount,
  }: MintInvoiceParams) => {
    try {
      const mintTx = await _mintInvoice({ args: [invoiceId, details, parseUnits(amount.toString(),18)] });
      console.log(mintTx.hash);
    } catch (err) {
      console.log(err);
    }
  };
  return {
    mintInvoice,
  };
};

export default useInvoiceFinancer;
