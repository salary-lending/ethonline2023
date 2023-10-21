import React from "react";
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

type Props = {
  invoice: InvoiceType;
  handleMintClick: (invoiceId: string, amount: string) => void;
};

const InvoiceItem = ({ invoice, handleMintClick }: Props) => {
  return (
    <Card className="bg-default-100/50 group  hover:ring-primary hover:ring-1">
      <CardBody>
        <div className="flex items-center justify-between">
          <h6 className="font-semibold font-heading text-xl">
            {invoice.contract.title}
          </h6>
          {invoice.status === "paid" && (
            <Chip variant="flat" color="success">
              Paid
            </Chip>
          )}
          {invoice.status === "approved" && (
            <Chip variant="flat" color="warning">
              Approved
            </Chip>
          )}
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
        <Button
          color="primary"
          variant="solid"
          onClick={() =>
            handleMintClick(invoice.id.toString(), invoice.total_amount)
          }
        >
          Mint Token
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InvoiceItem;
