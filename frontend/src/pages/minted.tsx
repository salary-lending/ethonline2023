"use client";
import { InvoiceFinancerABI } from "@/components/constants/abi";
import {
  DAI_ADDRESS,
  INVOICE_FINANCER_ADDRESS,
} from "@/components/constants/addresses";
import { API_URL } from "@/components/constants/api";
import useStrategyManager from "@/components/hooks/useStrategyManager";
import Layout from "@/components/layout/Layout";
import Heading from "@/components/ui/Heading";
import { Button, Spinner } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { getContract } from "viem";
import { usePublicClient } from "wagmi";

// inv id"66139613"
// "0xDC4bD7d0f8638Cb7d1Cb8CeBa1C3357869B8224D"

const MintedPage = () => {
  const [mintedTokens, setMintedTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { borrow } = useStrategyManager();
  const publicClient = usePublicClient();

  useEffect(() => {
    const getMintedTokens = async () => {
      try {
        setIsLoading(true);
        // const InvoiceFinancer = getContract({
        //   abi: InvoiceFinancerABI,
        //   address: INVOICE_FINANCER_ADDRESS,
        //   publicClient,
        // });
        // const result = await InvoiceFinancer.read.invoicesArray([0])
      } catch (err: any) {
        console.log(err);
        toast.error(err.message ?? "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    getMintedTokens();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex mt-16 flex-col gap-4 items-center justify-center">
          <Spinner size="lg" />
          Loading ...
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div>
        <Heading text="My minted Invoices" />
        <Button
          onClick={async () => {

            await borrow({ assetAddress: DAI_ADDRESS, amount: 500 });
          }}
        >
          borroww
        </Button>
      </div>
    </Layout>
  );
};

export default MintedPage;
