import { Card, CardBody } from "@nextui-org/react";
import React, { useDebugValue, useEffect, useState } from "react";
import Heading from "../ui/Heading";
import ApiKeyInput from "./ApiKeyInput";
import useBorrowFormState from "../stores/useBorrowStore";
import useDeelStore from "../stores/useDeelStore";

type Props = {};

const ConnectDeelStep = (props: Props) => {
  const { apiKey } = useDeelStore();
  const { setCurrentStep } = useBorrowFormState();

  return (
    <Card>
      <CardBody>
        <Heading text="Connect your Deel account" />
        <p className="text-lg md:text-xl text-default-500">
          Borrow capital with your salary invoices.{" "}
        </p>
        <ApiKeyInput />
      </CardBody>
    </Card>
  );
};

export default ConnectDeelStep;
