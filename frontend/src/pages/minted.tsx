"use client";
import { API_URL } from "@/components/constants/api";
import Layout from "@/components/layout/Layout";
import Heading from "@/components/ui/Heading";
import { Spinner } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const MintedPage = () => {
  const [mintedTokens, setMintedTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const getMintedTokens = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/invoice/minted`);
        console.log(res);
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
      </div>
    </Layout>
  );
};

export default MintedPage;
