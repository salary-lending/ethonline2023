import BalanceTracker from "@/components/BalanceTracker";
import ShowTx from "@/components/ShowTx";
import {
  DaiABI,
  InvoiceFinancerABI,
  InvoiceTokenABI,
  StrategyManagerABI,
} from "@/components/constants/abi";
import {
  DAI_ADDRESS,
  INVOICE_FINANCER_ADDRESS,
  INVOICE_TOKEN_ADDRESS,
  STRATEGY_MANAGER_ADDRESS,
} from "@/components/constants/addresses";
import useTokenBalances from "@/components/hooks/useTokenBalances";
import Heading from "@/components/ui/Heading";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Input,
  Link,
  Select,
  SelectItem,
} from "@nextui-org/react";
import React, { useState } from "react";
import { toast } from "sonner";
import { formatEther, parseUnits } from "viem";
import { useAccount, useContractRead, useContractWrite } from "wagmi";

type Props = {};

const waitForConfirmation = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
const RepayPage = (props: Props) => {
  const { invoiceTokenBalance, daiTokenBalance } = useTokenBalances();

  const [selectedInvoice, setSelectedInvoice] = useState(
    {} as { invoiceId: string; amount: string }
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState("");
  const { address } = useAccount();

  const { data: mintedInvoices } = useContractRead({
    abi: InvoiceFinancerABI,
    address: INVOICE_FINANCER_ADDRESS,
    functionName: "getAllInvoices",
  });

  const { data: stakedTokens } = useContractRead({
    address: STRATEGY_MANAGER_ADDRESS,
    abi: StrategyManagerABI,
    functionName: "stakedSecurityTokens",
    args: [address],
  });

  const { writeAsync: _payInvoice } = useContractWrite({
    address: INVOICE_FINANCER_ADDRESS,
    abi: InvoiceFinancerABI,
    functionName: "payInvoice",
  });

  const { writeAsync: _repay } = useContractWrite({
    address: STRATEGY_MANAGER_ADDRESS,
    abi: StrategyManagerABI,
    functionName: "repay",
    account: address,
  });

  const { writeAsync: _approveDaiToken } = useContractWrite({
    address: DAI_ADDRESS,
    abi: DaiABI,
    functionName: "approve",
    account: address,
  });

  const { writeAsync: _approveInvoiceToken } = useContractWrite({
    address: INVOICE_TOKEN_ADDRESS,
    abi: InvoiceTokenABI,
    functionName: "approve",
    account: address,
  });

  const { writeAsync: _mintInvoiceTokens } = useContractWrite({
    address: INVOICE_TOKEN_ADDRESS,
    abi: InvoiceTokenABI,
    functionName: "mint",
  });

  const repay = async () => {
    try {
      setIsProcessing(true);

      const approveDaiTx = await _approveDaiToken({
        args: [STRATEGY_MANAGER_ADDRESS, selectedInvoice.amount],
      });
      const approveInvTx = await _approveInvoiceToken({
        args: [INVOICE_FINANCER_ADDRESS, selectedInvoice.amount],
      });
      toast.success("Approved dai token");

      await waitForConfirmation(10 * 1000);
      console.log(selectedInvoice.amount, stakedTokens);
      const repayTx = await _repay({
        args: [DAI_ADDRESS, selectedInvoice.amount],
      });

      await waitForConfirmation(10 * 1000);

      const paidInvoice = await _payInvoice({
        args: [selectedInvoice.invoiceId, selectedInvoice.amount],
      });
      console.log(repayTx);
      setTxHash(repayTx.hash);
      toast.success("Repaid Successfully");
    } catch (err: any) {
      console.log(err);
      toast.error("Failed to repay");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-8 ">
        <div className="col-span-2">
          <Card>
            <CardBody>
              <Heading text="Repay" />
              <p className="text-lg text-default-500">
                Repay borrowed dai tokens
              </p>
              <Select
                label="Select Invoice to Repay"
                placeholder="Select Invoice to repay"
                className="max-w-xs mt-4"
                size="lg"
                onChange={(e) => {
                  const [invoiceId, amount] = e.target.value.split("_");
                  setSelectedInvoice({ invoiceId, amount });
                }}
              >
                {(mintedInvoices as any[])?.map((it) => (
                  <SelectItem
                    key={it.invoiceId + "_" + it.amount}
                    value={it.amount}
                  >
                    {`Id : ${it.invoiceId} | Amount : ${formatEther(
                      it.amount
                    )}`}
                  </SelectItem>
                ))}
              </Select>

              <Button
                size="lg"
                className="h-16 text-lg mt-4 font-medium "
                color="primary"
                onClick={repay}
                isLoading={isProcessing}
              >
                {isProcessing ? "Processing..." : "Repay"}
              </Button>
              <ShowTx hash={txHash} className="mt-4 bg-default-100/50" />
            </CardBody>
          </Card>
        </div>
        <div>
          <BalanceTracker />
        </div>
      </div>
    </>
  );
};

export default RepayPage;
