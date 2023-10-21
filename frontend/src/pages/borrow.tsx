import BalanceTracker from "@/components/BalanceTracker";
import ShowTx from "@/components/ShowTx";
import {
  DaiABI,
  InvoiceTokenABI,
  StrategyManagerABI,
} from "@/components/constants/abi";
import {
  ARRANGER_CONDUIT_ADDRESS,
  DAI_ADDRESS,
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
} from "@nextui-org/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { formatEther, parseUnits } from "viem";
import { Address, useAccount, useContractWrite } from "wagmi";


const BorrowPage = () => {
  const { invoiceTokenBalance } = useTokenBalances();
  const [borrowAmount, setBorrowAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { address } = useAccount();
  const [txHash, setTxHash] = useState("");
  const { writeAsync: _mintDai } = useContractWrite({
    address: DAI_ADDRESS,
    abi: DaiABI,
    functionName: "mint",
  });

  const { writeAsync: _borrow } = useContractWrite({
    address: STRATEGY_MANAGER_ADDRESS,
    abi: StrategyManagerABI,
    functionName: "borrow",
    account: address,
  });

  const { writeAsync: _approveInvoiceToken } = useContractWrite({
    address: INVOICE_TOKEN_ADDRESS,
    abi: InvoiceTokenABI,
    functionName: "approve",
    account: address,
  });

  const borrow = async () => {
    try {
      setIsProcessing(true);
      const approve = await _approveInvoiceToken({
        args: [
          ARRANGER_CONDUIT_ADDRESS,
          parseUnits(borrowAmount.toString(), 18),
        ],
      });
      toast.success("Approve Success");

      const mintTx = await _mintDai({
        args: [
          STRATEGY_MANAGER_ADDRESS,
          parseUnits(borrowAmount.toString(), 18),
        ],
      });


      console.log("Minted dai", mintTx);
      const borrowTx = await _borrow({
        args: [DAI_ADDRESS, parseUnits(borrowAmount.toString(), 18)],
      });

      setTxHash(borrowTx.hash);
      toast.success("Borrow success");
    } catch (err) {
      console.log(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-8 ">
        <Card className="col-span-2">
          <CardBody>
            <Heading text="Borrow" />
            <p className="text-lg text-default-500">
              Stake your invoice tokens to borrow dai tokens .
            </p>
            <div className="flex gap-4 my-4">
              <div className="bg-default-100 p-3 w-full px-5 rounded-xl">
                <p className="text-default-500">You can borrow</p>
                <p className="uppercase text-2xl  font-semibold">
                  {invoiceTokenBalance
                    ? formatEther(invoiceTokenBalance as bigint)
                    : 0}{" "}
                  DAI
                </p>
              </div>
              <div className="bg-default-100 p-3 w-full px-5 rounded-xl">
                <p className="text-default-500">Total Staked tokens</p>
                <p className="uppercase text-2xl  font-semibold">TBA</p>
              </div>
            </div>
            <div className="bg-default-100 p-3 w-full px-5 rounded-xl">
              <p className="text-3xl font-medium text-center">
                {borrowAmount} DAI
              </p>
              <Input
                value={borrowAmount.toString()}
                onChange={(e) => setBorrowAmount(Number(e.target.value))}
                type="range"
                max={
                  invoiceTokenBalance
                    ? formatEther(invoiceTokenBalance as bigint)
                    : 0
                }
                className="accent-blue-500"
              />
            </div>
            <Button
              size="lg"
              className="h-16 text-lg mt-4 font-medium "
              color="primary"
              onClick={borrow}
              isLoading={isProcessing}
            >
              {isProcessing ? "Processing..." : "Borrow"}
            </Button>
            <ShowTx hash={txHash} className="mt-4 bg-default-100/50"/>
          </CardBody>

          <Divider />
          <CardFooter className="p-5">
            {"Don't have invoice tokens ? "}
            <Link
              href="/mint"
              className="text-primary-600 ml-2 underline underline-offset-4"
            >
              Click here to Mint
            </Link>
          </CardFooter>
        </Card>
        <div>
          <BalanceTracker />
        </div>
      </div>
    </>
  );
};

export default BorrowPage;
