import ApiKeyInput from "@/components/borrow/ApiKeyInput";
import ShowInvoices from "@/components/borrow/ShowInvoices";
import ShowInvoicesStep from "@/components/borrow/ShowInvoices";
import { API_URL } from "@/components/constants/api";
import { DEEL_TEST_INVOICES } from "@/components/constants/invoice_data";
import { InvoiceType } from "@/components/types/invoice.type";
import Heading from "@/components/ui/Heading";
import { Card, CardBody } from "@nextui-org/react";
import axios from "axios";
import React, { useState } from "react";

type Props = {};

const MintPage = (props: Props) => {
  const [apiKey, setApiKey] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceType[]>(DEEL_TEST_INVOICES);

  const connectDeel = async () => {
    try { 
      setIsFetching(true)
      const res = await axios.get(`${API_URL}/invoices/deel`)
      console.log(res.data)
      setInvoices(res.data.data)

    } catch (err) {
      console.log(err)
    } finally {
      setIsFetching(false)
    }
  };
  return (
    <>
      <div className="space-y-8">
        <Card>
          <CardBody>
            <Heading text="Connect your Deel account" />
            <p className="text-lg md:text-xl text-default-500">
              Borrow capital with your salary invoices.{" "}
            </p>
            <ApiKeyInput
              apiKey={apiKey}
              setApiKey={setApiKey}
              handleSubmit={connectDeel}
            />
          </CardBody>
        </Card>
        {invoices.length > 0 ? <ShowInvoices invoices={invoices} /> : null}
      </div>
    </>
  );
};

export default MintPage;
