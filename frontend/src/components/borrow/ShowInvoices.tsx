import { Card, CardBody, useDisclosure } from "@nextui-org/react";
import React, { useState } from "react";
import Heading from "../ui/Heading";
import InvoiceItem from "./InvoiceItem";
import { InvoiceType } from "../types/invoice.type";

import MintModal from "./MintModal";

type Props = {
  invoices: InvoiceType[];
  mintedInvoices:string[]
};

const ShowInvoices = ({ invoices,mintedInvoices }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedInvoice, setSelectedInvoice] = useState(
    {} as { invoiceId: string; amount: string }
  );

  const handleMintClick = async (invoiceId: string, amount: string) => {
    // open modal
    setSelectedInvoice({ invoiceId, amount });
    onOpen();
  };

  return (
    <>
      <Card>
        <CardBody>
          <Heading text="Recent Invoices" />
          <p className="text-lg md:text-xl text-default-500">
            Select an invoice to mint as token and borrow capital.
          </p>
          <div className="flex flex-col gap-4 mt-4">
            {invoices.length === 0 && (
              <p className="text-center font-heading text-red-600 font-medium">
                No invoices found !!
              </p>
            )}
            {invoices.map((it) => (
              <InvoiceItem
                key={it.id}
                invoice={it}
                handleMintClick={handleMintClick}
                isMinted={mintedInvoices.includes(it.id.toString())}
              />
            ))}
          </div>
        </CardBody>
      </Card>
      <MintModal
        onOpenChange={onOpenChange}
        isOpen={isOpen}
        invoiceId={selectedInvoice.invoiceId}
        amount={selectedInvoice.amount}
      />
    </>
  );
};

export default ShowInvoices;
