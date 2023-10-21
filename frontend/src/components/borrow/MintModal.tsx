import {
  Input,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  CardBody,
  Card,
  CardHeader,
  Link,
} from "@nextui-org/react";
import React, { useState } from "react";
import { useAccount, useContractWrite } from "wagmi";
import { InvoiceFinancerABI } from "../constants/abi";
import { INVOICE_FINANCER_ADDRESS } from "../constants/addresses";
import { parseUnits } from "viem";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ShowTx from "../ShowTx";

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
  invoiceId: string;
  amount: string;
};

const MintModal = ({ isOpen, onOpenChange, invoiceId, amount }: Props) => {
  const [details, setDetails] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const { address } = useAccount();
  const { writeAsync: _mintInvoiceToken } = useContractWrite({
    abi: InvoiceFinancerABI,
    address: INVOICE_FINANCER_ADDRESS,
    functionName: "financeInvoice",
    account: address,
  });

  const mintInvoiceToken = async () => {
    try {
      setIsMinting(true);
      const mintRes = await _mintInvoiceToken({
        args: [invoiceId, details, parseUnits(amount, 18)],
      });
      console.log(mintRes);
      setTxHash(mintRes.hash);
      toast.success("Invoice minted successfully!");
      setDetails("");
    } catch (err:any) {
      console.log(err);
      toast.error("Something went wrong , check console")
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Modal
      className="ring-1 ring-default-100"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex font-heading ">
              Mint Invoice
            </ModalHeader>
            <ModalBody className="">
              <Input
                value={invoiceId}
                readOnly
                label="Invoice Id"
                classNames={{ label: "text-default-500" }}
              />
              <Input
                value={amount}
                readOnly
                label="Amount"
                classNames={{ label: "text-default-500" }}
              />
              <Input
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                classNames={{ label: "text-default-500" }}
                placeholder="Enter additional info"
                label={"Details"}
              />
             <ShowTx hash={txHash}/>
            </ModalBody>
            <ModalFooter>
              <Button
                disabled={isMinting}
                color="danger"
                variant="light"
                onPress={()=>{
                  setDetails("")
                  setTxHash("")
                  onClose()
                }}
              >
                Close
              </Button>
              <Button
                isLoading={isMinting}
                color="primary"
                onPress={mintInvoiceToken}
              >
                {isMinting ? "Minting..." : "Mint"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MintModal;
