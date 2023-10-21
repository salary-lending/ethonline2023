import React, { useState } from "react";
import useBorrowFormState from "../stores/useBorrowStore";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from "@nextui-org/react";
import Heading from "../ui/Heading";
import { BsArrowRight } from "react-icons/bs";
import { toast } from "sonner";
import { InvoiceType } from "../types/invoice.type";
import { usePrepareContractWrite, useWalletClient } from "wagmi";
import useInvoiceFinancer from "../hooks/useInvoiceFinancer";


type Props = {};

const MintInvoice = (props: Props) => {
  const [isMinting, setIsMinting] = useState(false);

  const {mintInvoice} = useInvoiceFinancer()

  const {
    setCurrentStep,
    setSelectedInvoiceToMint,
    selectedInvoiceToMint: invoice,
  } = useBorrowFormState();
  const handleOnMint = async () => {
    try {
      setIsMinting(true);
      const data = {
        invoiceId: invoice.id.toString(),
        details: `${invoice.contract.title} ${invoice.description}`,
        amount: Number(invoice.total_amount),
      };
      await mintInvoice(data)
      setSelectedInvoiceToMint({} as InvoiceType);
      setCurrentStep(1);
    } catch (err: any) {
      console.log(err);
      toast.error(err?.message ?? "Somethinge went wrong");
    } finally {
      setIsMinting(false);
    }
  };
  return (
    <>
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <Heading text={invoice.contract.title} />
            {invoice.status === "paid" && (
              <Chip size="lg" variant="flat" color="success">
                Paid
              </Chip>
            )}
            {invoice.status === "approved" && (
              <Chip size="lg" variant="flat" color="warning">
                Approved
              </Chip>
            )}
          </div>
          <div className="flex items-center my-2 gap-2 text-default-500 text-lg">
            <Divider className="w-4" />
            Details
            <Divider className="" />
          </div>
          <div className="text-default-500">
            <p className=" font-medium">
              <span className="text-default-700"> Invoice Id : </span>
              {invoice.id}
            </p>
            <p className="capitalize">
              <span className="text-default-700"> Contract Type : </span>
              {invoice.contract.type.split("_").join(" ")}
            </p>

            <p className="flex items-center gap-2">
              <span className="text-default-700"> Payment Cycle : </span>
              {new Date(invoice.payment_cycle.start_date).toDateString()}
              <BsArrowRight />
              {new Date(invoice.payment_cycle.end_date).toDateString()}
            </p>
            <p className="capitalize ">
              <span className="text-default-700"> Reported By : </span>
              {invoice.reported_by.full_name}
            </p>
            <p className="capitalize ">
              <span className="text-default-700"> Amount : </span>
              {Number(invoice.total_amount).toFixed(2)} {invoice.currency_code}
            </p>
            <Divider className="my-5" />
            <div className="flex items-center justify-between">
              <Button size="lg">Go Back</Button>
              <Button
                color="primary"
                size="lg"
                isLoading={isMinting}
                onClick={handleOnMint}
              >
                {isMinting ? "Minting ... " : "Mint Invoice as Token"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default MintInvoice;
