import { Button, Input } from "@nextui-org/react";
import React from "react";
import { AiOutlineApi } from "react-icons/ai";
import useDeelStore from "../stores/useDeelStore";
import { toast } from "sonner";
import useBorrowFormState from "../stores/useBorrowStore";

type Props = {};

const ApiKeyInput = (props: Props) => {
  const { setApiKey, apiKey } = useDeelStore();
  const { setCurrentStep } = useBorrowFormState();

  const handleSubmit = () => {
    if (!apiKey) {
      toast.error("Invalid api key");
    } else {
      setCurrentStep(1);
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
      >
        Connect Deel
      </Button>
    </div>
  );
};

export default ApiKeyInput;
