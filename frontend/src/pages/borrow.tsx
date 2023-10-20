"use client";
import Layout from "@/components/layout/Layout";
import React from "react";
import useBorrowFormState from "@/components/stores/useBorrowStore";
import ConnectDeelStep from "@/components/borrow/ConnectDeelStep";
import ShowInvoicesStep from "@/components/borrow/ShowInvoicesStep";
type Props = {};

const Borrow = (props: Props) => {
  const { currentStep } = useBorrowFormState();

  const renderSteps = () => {
    switch (currentStep) {
      case 0:
        return <ConnectDeelStep />;
      case 1:
        return <ShowInvoicesStep />;
      default:
        <ConnectDeelStep />;
    }
  };
  return <Layout>{renderSteps()}</Layout>;
};

export default Borrow;
