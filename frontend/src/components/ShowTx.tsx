import { Link, Card, CardBody } from "@nextui-org/react";

import React from "react";

type Props = {};

const ShowTx = ({ hash,className }: { hash: string ,className?:string }) => {
  if (hash === "") {
    return null;
  }
  return (
    <Card className={className}>
      <CardBody>
        <p className="text-default-500">Transaction</p>
        <Link
          className="text-sm break-words"
          isExternal
          showAnchorIcon
          color="success"
          href={`https://sepolia.etherscan.io/tx/${hash}`}
        >
          See in explorer
        </Link>
        <p className="text-xs mt-1">{hash}</p>
      </CardBody>
    </Card>
  );
};

export default ShowTx;
