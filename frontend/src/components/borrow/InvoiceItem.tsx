import React, { useState } from "react";
import { InvoiceType } from "../types/invoice.type";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Divider,
} from "@nextui-org/react";
import { BsArrowRight } from "react-icons/bs";
import { useContractRead } from "wagmi";
import { INVOICE_FINANCER_ADDRESS } from "../constants/addresses";
import { InvoiceFinancerABI } from "../constants/abi";

enum InvoiceStatus {
  None = 0,
  Financed = 1,
  Repaid = 2,
}

function getStatusString(statusNumber: number ): string {
  return InvoiceStatus[statusNumber];
}

type Props = {
  invoice: InvoiceType;
  handleMintClick: (invoiceId: string, amount: string) => void;
  isMinted: boolean;
};

const InvoiceItem = ({ invoice, handleMintClick, isMinted }: Props) => {
  const [status,setStatus] = useState(invoice.status);
  const colorMap = {
    "Financed":"warning",
    "Repaid":"success",
  }
  const {data} = useContractRead({
    abi:InvoiceFinancerABI,
    address:INVOICE_FINANCER_ADDRESS,
    functionName:'invoices',
    args:[invoice.id],
    onSuccess(data:any) {
      if(data){
        setStatus(getStatusString(Number(data[2])))
      }
    },
})

  return (
    <Card className={`bg-default-100/50 group  hover:ring-primary hover:ring-1 ${isMinted && "brightness-75 hover:ring-default-300"}`}>
      <CardBody>
        <div className="flex items-center justify-between">
          <h6 className="font-semibold font-heading text-xl">
            {invoice.contract.title}
          </h6>
         {status !=='None' && <Chip color={colorMap[status]} className='capitalize'>
            {status === 'None' ? invoice.status : status}
          </Chip>}
        </div>
        <div className="text-default-500">
          <p className="capitalize ">
            Contract Type: {invoice.contract.type.split("_").join(" ")}
          </p>

          <p className="flex items-center gap-2">
            Payment Cycle :{" "}
            {new Date(invoice.payment_cycle.start_date).toDateString()}
            <BsArrowRight />
            {new Date(invoice.payment_cycle.end_date).toDateString()}
          </p>
          <p className="capitalize ">
            Reported By: {invoice.reported_by.full_name}
          </p>
        </div>
      </CardBody>
      <Divider />
      <CardFooter className="p-3 flex justify-between">
        <p className="font-medium text-lg text-success-600">
          <span className="font-heading text-default-600">Amount : </span>
          {` ${Number(invoice.total_amount).toFixed(2)} ${
            invoice.currency_code
          }`}
        </p>
        {!isMinted && (
          <Button
            color="primary"
            variant="solid"
            onClick={() =>
              handleMintClick(invoice.id.toString(), invoice.total_amount)
            }
          >
            Mint Token
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InvoiceItem;
