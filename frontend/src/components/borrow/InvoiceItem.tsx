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
import useBorrowFormState from "../stores/useBorrowStore";

const InvoiceItem = (invoice: InvoiceType) => {
  const { setSelectedInvoiceToMint, setCurrentStep } = useBorrowFormState();
  
  const handleOnMint = () => {
    setSelectedInvoiceToMint(invoice);
    setCurrentStep(2);
  };
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
      <CardFooter className="p-5 py-2.5 flex justify-between">
        <p className="font-medium text-lg text-success-600">
          <span className="font-heading text-default-600">Amount : </span>
          {` ${Number(invoice.total_amount).toFixed(2)} ${
            invoice.currency_code
          }`}
        </p>
        <Button color="primary" variant="solid" onClick={handleOnMint}>
          Mint Token
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InvoiceItem;
