import express, { Request, Response } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import axios from "axios";
import { Web3Storage, getFilesFromPath } from "web3.storage";
import fs from "fs";
dotenv.config();

const ERC20_ADDRESS: string = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
const INVOICE_MINTER_ADDRESS: string =
  "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const DEEL_INVOICE_URL: string =
  "https://api-staging.letsdeel.com/rest/v1/contracts/nw9z5ww/invoice-adjustments";
const deel_key: string = process.env.DEEL_KEY!;
const web3storage_key: string = process.env.WEB3STORAGE_KEY!;

const app = express();

const PORT = process.env.PORT || 3000;

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);

const erc20ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const invoiceMinterABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_invoiceTokenAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "invoiceId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "details",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "InvoiceFinanced",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "invoiceId",
        type: "string",
      },
      {
        internalType: "string",
        name: "details",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "financeInvoice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getInvoicesCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "invoiceIdToIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "invoiceToken",
    outputs: [
      {
        internalType: "contract InvoiceToken",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "invoices",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "enum InvoiceFinancer.InvoiceStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "details",
        type: "string",
      },
      {
        internalType: "address",
        name: "financedBy",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "invoicesArray",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "enum InvoiceFinancer.InvoiceStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "details",
        type: "string",
      },
      {
        internalType: "address",
        name: "financedBy",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "invoiceId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "payInvoice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// const signer = provider.getSigner();
// const contract = new ethers.Contract(contractAddress, contractABI, signer);

app.use(express.json());

// Construct with token and endpoint
const client = new Web3Storage({ token: web3storage_key });

const getData = (latest_invoice) => {
  const name = latest_invoice.contract.title;
  const status = latest_invoice.status;
  const descr = latest_invoice.description;
  const id = latest_invoice.id;
  const amount = latest_invoice.total_amount;
  const end_date = latest_invoice.payment_cycle.end_date;

  console.log(
    `Latest invoice data: name: ${name}, status: ${status}, descr: ${descr}, id: ${id}, amount: ${amount}, end_date: ${end_date}`
  );
  return id;
};

interface Invoice {
  invoiceId: number;
  details: string;
  amount: string;
}

app.get("/", (req, res) => {
  res.send("Salary API is running");
});

app.get("/deel/invoice", async (req: Request, res: Response) => {
  console.log("Start fetching data from Deel");
  try {
    const deelResponse = await axios.get(DEEL_INVOICE_URL, {
      headers: {
        Authorization: `Bearer ${deel_key}`,
      },
    });
    const latest_invoice = deelResponse.data.data[0];
    const invoice_id = getData(latest_invoice); // Make sure getData is defined
    const file_name = `${invoice_id}.json`;

    await fs.writeFileSync(
      `/tmp/${file_name}`,
      JSON.stringify(latest_invoice, null, 2)
    );
    const files = await getFilesFromPath(`/tmp/${file_name}`); // Make sure getFilesFromPath is defined
    const cid = await client.put(files);
    fs.unlinkSync(`/tmp/${file_name}`);

    console.log("After data upload", cid);

    res.json(deelResponse.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch data from Deel" });
  }
});

app.post("/invoice/mint", async (req, res) => {
  try {
    const { invoiceId, details, amount } = req.body;

    const invoiceMinterContract = new ethers.Contract(
      INVOICE_MINTER_ADDRESS,
      invoiceMinterABI,
      wallet
    );
    const tx = await invoiceMinterContract.financeInvoice(
      invoiceId,
      details,
      amount
    );

    await tx.wait();

    res.json({
      status: "success",
      message: "Invoice created and tokens minted successfully!",
      mintedTokens: amount,
    });
  } catch (error: any) {
    console.log("Error", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.get("/invoice/minted", async (req, res) => {
  try {
    const invoiceMinterContract = new ethers.Contract(
      INVOICE_MINTER_ADDRESS,
      invoiceMinterABI,
      wallet
    );
    const invoicesCount = await invoiceMinterContract.getInvoicesCount();

    let invoices: Invoice[] = [];
    for (let i = 0; i < invoicesCount; i++) {
      const invoice = await invoiceMinterContract.invoicesArray(i);
      invoices.push({
        invoiceId: invoice.invoiceId,
        details: invoice.details,
        amount: ethers.formatUnits(invoice.amount, 18), // Assuming 18 decimals, adjust if needed
      });
    }

    res.json({ invoicesCount: invoicesCount.toString(), invoices: invoices });
  } catch (error: any) {
    console.log("Error", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.get("/invoice-tokens/balance", async (req, res) => {
  try {
    const erc20Contract = new ethers.Contract(ERC20_ADDRESS, erc20ABI, wallet);
    console.log("erc20Contract", erc20Contract);
    console.log("erc20Contract", await erc20Contract.getAddress());
    const erc20Balance = await erc20Contract.totalSupply();

    res.json({
      totalBalance: ethers.formatUnits(erc20Balance, 18),
    });
  } catch (error: any) {
    console.log("Error", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// app.post("/create-invoice", async (req: Request, res: Response) => {
//   const { invoiceId, details, amount } = req.body;

//   try {
//     const tx = await contract.createInvoiceAndMintToken(
//       invoiceId,
//       details,
//       amount
//     );
//     await tx.wait();
//     res.json({ success: true, message: "Invoice created and tokens minted." });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
