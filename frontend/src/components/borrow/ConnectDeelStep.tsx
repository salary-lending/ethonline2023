import { Card, CardBody } from "@nextui-org/react";
import React from "react";
import Heading from "../ui/Heading";
import ApiKeyInput from "./ApiKeyInput";

type Props = {};

const ConnectDeelStep = (props: Props) => {
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
