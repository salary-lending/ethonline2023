import React, { useEffect } from "react";

import { Card, CardBody } from "@nextui-org/react";
import useTokenBalances from "./stores/useTokenBalances";

type Props = {};

const BalanceTracker = (props: Props) => {
  const { invoiceTokenBalance, daiTokenBalance, usdcTokenBalance } =
    useTokenBalances();
  return (
    <Card className="rounded-3xl">
      <CardBody>
        <h6 className="font-bold font-heading text-default-500">Balances</h6>
        <div className="flex flex-wrap mt-2 gap-3">
          <div className="bg-default-100 border border-default-200/50 w-full p-3 rounded-xl">
            <p className="font-medium text-default-500 font-heading">
              Invoice Token
            </p>
            <p className="text-2xl font-semibold">
              {invoiceTokenBalance?.toString()} INV
            </p>
          </div>

          <div className="bg-default-100 border border-default-200/50 w-full p-3 rounded-xl">
            <p className="font-medium text-default-500 font-heading">
              Dai Token
            </p>
            <p className="text-2xl font-semibold">
              {daiTokenBalance?.toString()} DAI
            </p>
          </div>

          <div className="bg-default-100 border border-default-200/50 w-full p-3 rounded-xl">
            <p className="font-medium text-default-500 font-heading">
              Usdc Token
            </p>
            <p className="text-2xl font-semibold">
              {usdcTokenBalance?.toString()} USDC
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default BalanceTracker;
