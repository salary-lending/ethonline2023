import { Button, Input } from "@nextui-org/react";
import React, { useState } from "react";
import { AiOutlineApi } from "react-icons/ai";
import useDeelStore from "../stores/useDeelStore";
import { toast } from "sonner";
import useBorrowFormState from "../stores/useBorrowStore";
import axios from "axios";
import { API_URL } from "../constants/api";

type Props = {};

const ApiKeyInput = (props: Props) => {
  const { setApiKey, apiKey, setInvoices } = useDeelStore();
  const { setCurrentStep } = useBorrowFormState();
  const [isFetching, setIsFetching] = useState(false);
  
  const handleSubmit = async () => {
    if (!apiKey) {
      toast.error("Invalid api key");
      return
    } else {
      try {
        setIsFetching(true);
        // const invoicesRes = await axios.get(`${API_URL}/deel/invoice`);
        // console.log(invoicesRes);
        // setInvoices(invoicesRes.data.data);
        setCurrentStep(1);
      } catch (err: any) {
        console.log(err);
        toast.error(err?.message ?? "Something went wrong");
      } finally {
        setIsFetching(false);
      }
    }
  };

  return (
    <div className="flex mt-4 gap-4">
      <Input
        onChange={(e) => setApiKey(e.target.value)}
        startContent={<AiOutlineApi className="text-xl text-zinc-400" />}
        radius="lg"
        size="lg"
        value={apiKey}
        placeholder="Paste your deel api key here ..."
      />
      <Button
        disabled={!apiKey}
        radius="lg"
        className="group flex"
        color="primary"
        size="lg"
        onClick={handleSubmit}
        isLoading={isFetching}
      >
        {isFetching ? "Getting data..." : "Connect Deel"}
      </Button>
    </div>
  );
};

export default ApiKeyInput;
