import React from "react";
import { useAccount, useBalance, useContractRead } from "wagmi";
import {
  DaiABI,
  InvoiceTokenABI,
  UsdcTokenABI,
} from "@/components/constants/abi";
import {
  DAI_ADDRESS,
  INVOICE_TOKEN_ADDRESS,
  USDC_TOKEN_ADDRESS,
} from "@/components/constants/addresses";

const useTokenBalances = () => {

  
  const { address } = useAccount();
  const { data: invoiceTokenBalance } = useContractRead({
    abi: InvoiceTokenABI,
    address: INVOICE_TOKEN_ADDRESS,
    functionName: "balanceOf",
    args: [address],
  });
  const { data: daiTokenBalance } = useContractRead({
    abi: DaiABI,
    address: DAI_ADDRESS,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: usdcTokenBalance } = useContractRead({
    abi: UsdcTokenABI,
    address: USDC_TOKEN_ADDRESS,
    functionName: "balanceOf",
    args: [address],
  });

  return { invoiceTokenBalance, daiTokenBalance, usdcTokenBalance };
};

export default useTokenBalances;
