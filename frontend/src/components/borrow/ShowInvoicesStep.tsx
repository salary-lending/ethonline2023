import { Card, CardBody } from "@nextui-org/react";
import React from "react";
import Heading from "../ui/Heading";
import { DEEL_TEST_INVOICES } from "../constants/invoice_data";
import InvoiceItem from "./InvoiceItem";

type Props = {};

const ShowInvoicesStep = (props: Props) => {
  return (
    <Card>
      <CardBody>
        <Heading text="Recent Invoices" />
        <p className="text-lg md:text-xl text-default-500">
          Select an invoice to mint as token and borrow capital.
        </p>
        <div className="flex flex-col gap-4 mt-4">
          {DEEL_TEST_INVOICES.map((it) => (
            <InvoiceItem key={it.id} {...it} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default ShowInvoicesStep;
