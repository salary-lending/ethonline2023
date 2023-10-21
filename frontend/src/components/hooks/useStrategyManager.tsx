import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, usePublicClient, useWalletClient } from "wagmi";
import { DaiABI, InvoiceTokenABI, StrategyManagerABI } from "../constants/abi";
import {
  ARRANGER_CONDUIT_ADDRESS,
  DAI_ADDRESS,
  INVOICE_TOKEN_ADDRESS,
  STRATEGY_MANAGER_ADDRESS,
} from "../constants/addresses";
import { Address, getContract, parseEther, parseUnits } from "viem";
import { parse } from "path";

type BorrowParams = {
  assetAddress: Address;
  amount: number;
};

const useStrategyManager = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient()
  const {data:walletClient} = useWalletClient()
  const { writeAsync: _approve } = useContractWrite({
    address: INVOICE_TOKEN_ADDRESS,
    abi: InvoiceTokenABI,
    functionName: "approve",
    account:address
  });




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



  const { writeAsync: _repay } = useContractWrite({
    address: STRATEGY_MANAGER_ADDRESS,
    abi: StrategyManagerABI,
    functionName: "repay",
    account: address,
  });

  const {data:daiBalanceStratManager} = useContractRead({
    abi:DaiABI,
    address:DAI_ADDRESS,
    functionName:'balanceOf',
    args:[STRATEGY_MANAGER_ADDRESS]
  })

  const {data:daiBalanceUser} = useContractRead({
    abi:DaiABI,
  address:DAI_ADDRESS,
    functionName:'balanceOf',
    args:[address]
  })

  const {data:invoiceTokenBalanc} = useContractRead({
    abi:InvoiceTokenABI,
    address:INVOICE_TOKEN_ADDRESS,
    functionName:'balanceOf',
    args:[address]
  })

  const borrow = async ({ assetAddress, amount }: BorrowParams) => {
    try {
      const approve = await _approve({ args: [ARRANGER_CONDUIT_ADDRESS, parseUnits(amount.toString(),18)] });
      // const mintTx = await _mintDai({args:[STRATEGY_MANAGER_ADDRESS,parseUnits(amount.toString(),18)]})
      // console.log("Minted dai",mintTx)
      const borrowTx = await _borrow({ args: [assetAddress, parseUnits("1",18)] });
      console.log(borrowTx);
    } catch (err) {
      console.log(err);
    }
  };

  const repay = async ({ assetAddress, amount }: BorrowParams) => {
    try {
      const approve = await _approve({ args: [ARRANGER_CONDUIT_ADDRESS, parseUnits(amount.toString(),18)] });
      // const mintTx = await _mintDai({args:[STRATEGY_MANAGER_ADDRESS,parseUnits(amount.toString(),18)]})
      // console.log("Minted dai",mintTx)
      const borrowTx = await _borrow({ args: [assetAddress, parseUnits("1",18)] });
      console.log(borrowTx);
    } catch (err) {
      console.log(err);
    }
  };

  const swapUsdc = async ({ assetAddress, amount }: BorrowParams) => {
    try {
      const approve = await _approve({ args: [ARRANGER_CONDUIT_ADDRESS, parseUnits(amount.toString(),18)] });
      // const mintTx = await _mintDai({args:[STRATEGY_MANAGER_ADDRESS,parseUnits(amount.toString(),18)]})
      // console.log("Minted dai",mintTx)
      const borrowTx = await _borrow({ args: [assetAddress, parseUnits("1",18)] });
      console.log(borrowTx);
    } catch (err) {
      console.log(err);
    }
  };

  const swapDai = async ({ assetAddress, amount }: BorrowParams) => {
    try {
      const approve = await _approve({ args: [ARRANGER_CONDUIT_ADDRESS, parseUnits(amount.toString(),18)] });
      // const mintTx = await _mintDai({args:[STRATEGY_MANAGER_ADDRESS,parseUnits(amount.toString(),18)]})
      // console.log("Minted dai",mintTx)
      const borrowTx = await _borrow({ args: [assetAddress, parseUnits("1",18)] });
      console.log(borrowTx);
    } catch (err) {
      console.log(err);
    }
  };


  return {
    borrow,
  };
};

export default useStrategyManager;
