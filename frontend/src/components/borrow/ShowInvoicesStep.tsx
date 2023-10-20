import { Card, CardBody } from "@nextui-org/react";
import React from "react";
import Heading from "../ui/Heading";
import InvoiceItem from "./InvoiceItem";
import useDeelStore from "../stores/useDeelStore";

type Props = {};

const ShowInvoicesStep = (props: Props) => {
  const {invoices,setInvoices} = useDeelStore()
  return (
    <Card>
      <CardBody>
        <Heading text="Recent Invoices" />
        <p className="text-lg md:text-xl text-default-500">
          Select an invoice to mint as token and borrow capital.
        </p>
        <div className="flex flex-col gap-4 mt-4">
          {invoices.length === 0 &&  <p className="text-center font-heading text-red-600 font-medium">No invoices found !!</p>}
          {invoices.map((it) => (
            <InvoiceItem key={it.id} {...it} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default ShowInvoicesStep;
