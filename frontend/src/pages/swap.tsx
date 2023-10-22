import BalanceTracker from "@/components/BalanceTracker";
import { DaiABI, StrategyManagerABI, UsdcTokenABI } from "@/components/constants/abi";
import { ARRANGER_CONDUIT_ADDRESS, DAI_ADDRESS, STRATEGY_MANAGER_ADDRESS, USDC_TOKEN_ADDRESS } from "@/components/constants/addresses";
import Heading from "@/components/ui/Heading";
import {
  Input,
  Card,
  CardBody,
  useAccordion,
  Tab,
  Tabs,
  Button,
} from "@nextui-org/react";
import React, { useState } from "react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { useAccount, useContractWrite } from "wagmi";
import { TbArrowRight } from "react-icons/tb";
import useTokenBalances from "@/components/hooks/useTokenBalances";

type Props = {};

const SwapPage = (props: Props) => {
  const { address } = useAccount();
  const [state, setState] = useState({
    from: "usdc",
    to: "dai",
  });
  const {daiTokenBalance,usdcTokenBalance} = useTokenBalances()

  const [processing, setProcessing] = useState(false);
  const [amount, setAmount] = useState(0);
  const [txHash, setTxHash] = useState("");
  const { writeAsync: _swapUsdc } = useContractWrite({
    address: STRATEGY_MANAGER_ADDRESS,
    abi: StrategyManagerABI,
    functionName: "swapUsdc",
    account: address,
  });

  const { writeAsync: _swapDai } = useContractWrite({
    address: STRATEGY_MANAGER_ADDRESS,
    abi: StrategyManagerABI,
    functionName: "swapDai",
    account: address,
  });

  const { writeAsync: _approveDai } = useContractWrite({
    address: DAI_ADDRESS,
    abi: DaiABI,
    functionName: "approve",
    account:address
  });

  const { writeAsync: _approveUsdc } = useContractWrite({
    address: USDC_TOKEN_ADDRESS,
    abi: UsdcTokenABI,
    functionName: "approve",
    account:address
  });



  const swapUsdc = async () => {
    try {
      // DAI -> UDSC

      if (amount === 0) {
        throw new Error("Amount cannot be 0");
      }

      if (amount < 0) {
        throw new Error("Amount cannot be less than 0");
      }
      // check dai balance
      if(amount > Number(daiTokenBalance?.toString())){
        throw new Error("Insufficient balance")
      }
      setProcessing(true);
      // await _approveUsdc({args:[address, parseUnits(amount.toString(),18)]})
      // await _approveUsdc({args:[STRATEGY_MANAGER_ADDRESS,parseUnits(amount.toString(),18)]})
      // await _approveUsdc({args:[address, parseUnits(amount.toString(),18)]})
      
      const swapTx = await _swapUsdc({
        args: [parseUnits(amount.toString(), 18)],
      });
      
      console.log({ swapTx });
      setTxHash(swapTx.hash);
      toast.success("Swap successful");
    } catch (err: any) {
      console.log("Error in swapUsdc :", err);
      toast.error(err?.message ?? "Failed to swap usdc");
    } finally {
      setProcessing(false);
      setAmount(0.0);
    }
  };

  const swapDai = async () => {
    try {
      // USDC -> DAI
      setProcessing(true);
      if (amount === 0) {
        throw new Error("Amount cannot be 0");

      }

      if (amount < 0) {
        throw new Error("Amount cannot be less than 0");
      }

      // check usdc Balance
      if(amount > Number(usdcTokenBalance?.toString())){
        throw new Error("Insufficient balance")
      }

      // await _approveDai({args:[STRATEGY_MANAGER_ADDRESS, parseUnits(amount.toString(),18)]})
      // await _approveUsdc({args:[, parseUnits(amount.toString(),18)]})

      const swapTx = await _swapDai({
        args: [parseUnits(amount.toString(), 18)],
      });
      console.log({ swapTx });
      setTxHash(swapTx.hash);
      toast.success("Swap successful");
    } catch (err: any) {
      console.log("Error in swapDai :", err);
      toast.error(err?.message ?? "Failed to swap Dai");
    } finally {
      setProcessing(false);
      setAmount(0.0);
    }
  };

  const [direction, setDirection] = useState({
    from: "usdc",
    to: "dai",
    swapFn: () => console.log("Swapped usdc"),
  });

  return (
    <div className="grid grid-cols-3  gap-8">
      <Card className="rounded-3xl col-span-2">
        <CardBody>
          <div className="flex justify-between items-center ">
            <Heading text="Swap" />
            <Tabs
              radius="full"
              color="primary"

              onSelectionChange={(key) => {
                if (key === "usdc-dai") {
                  setState({
                    from: "usdc",
                    to: "dai",
                  });
                }
                if (key === "dai-usdc") {
                  setState({
                    from: "dai",
                    to: "usdc",
                  });
                }
              }}
            >
              <Tab key="usdc-dai" title="USDC to DAI" className="font-medium" />
              <Tab key="dai-usdc" title="DAI to USDC" className="font-medium" />
            </Tabs>
          </div>
          <div className="flex justify-between mt-4 gap-4 items-center ">
            <div className="bg-default-100 p-3 px-5 rounded-xl">
              <p className="text-default-500">You Supply</p>
              <p className="uppercase text-2xl font-heading font-semibold">
                {state.from}
              </p>
            </div>
            <div>
              <TbArrowRight className="text-6xl animate-pulse" />
            </div>
            <div className="bg-default-100 p-3 px-5 rounded-xl">
              <p className="text-default-500">You Recieve</p>
              <p className="uppercase text-2xl font-heading font-semibold">
                {state.to}
              </p>
            </div>
          </div>
          <Input
          label={"Amount"}
          labelPlacement="outside"
            value={amount.toString()}
            onChange={(e)=>setAmount(Number(e.target.value))}
            type="number"
            placeholder={`Enter ${state.from} amount `}
            size="lg"
            className="mt-4"
            classNames={{
              input: "text-xl font-medium p-4",
              inputWrapper: "h-16",
            }}
          />
          <Button size='lg' isLoading={processing } color="primary" className="h-16 mt-4 text-xl font-medium" 
          onClick={async ()=>{
            if(state.to === 'usdc'){
              await swapUsdc()
            } 
            if(state.to === 'dai'){
              await swapDai()
            }
            
          }}>
            {processing ? "Processing..." : `Swap to get ${state.to.toUpperCase()}`}
          </Button>
        </CardBody>
      </Card>
      <BalanceTracker />
    </div>
  );
};

export default SwapPage;
