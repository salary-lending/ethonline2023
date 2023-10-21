import { Button, Input } from "@nextui-org/react";
import React, { Dispatch, SetStateAction, useState } from "react";
import { AiOutlineApi } from "react-icons/ai";

type Props = {
  apiKey:string
  setApiKey:Dispatch<SetStateAction<string>>
  handleSubmit:() => void
  isFetching?:boolean
};

const ApiKeyInput = ({apiKey,setApiKey,handleSubmit,isFetching=false}: Props) => {

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
