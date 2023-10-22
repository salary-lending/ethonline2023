import express, { Request, Response } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import axios from "axios";
import { Web3Storage, getFilesFromPath } from "web3.storage";
import fs from "fs";
import { invoiceMinterABI } from "./ABIs/invoiceMinterABI";
import { erc20ABI } from "./ABIs/erc20ABI";
import cors from "cors";

dotenv.config();

const ERC20_ADDRESS: string = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const INVOICE_MINTER_ADDRESS: string =
  "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const DEEL_INVOICE_URL: string =
  "https://api-staging.letsdeel.com/rest/v1/contracts/nw9z5ww/invoice-adjustments";
const deel_key: string = process.env.DEEL_KEY!;
const web3storage_key: string = process.env.WEB3STORAGE_KEY!;

const app = express();

const PORT = process.env.PORT || 3001;

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
const wallet = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);

const erc20Contract = new ethers.Contract(ERC20_ADDRESS, erc20ABI, wallet);
const invoiceMinterContract = new ethers.Contract(
  INVOICE_MINTER_ADDRESS,
  invoiceMinterABI,
  wallet
);

enum InvoiceStatus {
  None = 0,
  Financed = 1,
  Paid = 2,
}

function getStatusString(statusNumber: number): string {
  return InvoiceStatus[statusNumber];
}

// const signer = provider.getSigner();
// const contract = new ethers.Contract(contractAddress, contractABI, signer);

app.use(express.json());
app.use(cors());
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
  status: string;
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
    const invoicesAll = await invoiceMinterContract.getAllInvoices();

    let invoices: Invoice[] = [];
    // Iterate over the invoices
    for (let invoice of invoicesAll) {
      console.log("invoice", invoice);
      invoices.push({
        invoiceId: invoice.invoiceId,
        details: invoice.details,
        status: getStatusString(invoice.status),
        amount: ethers.formatUnits(invoice.amount, 18), // Assuming 18 decimals, adjust if needed
      });
    }

    res.json({ invoices: invoices });
  } catch (error: any) {
    console.log("Error", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.post("/invoice/pay", async (req, res) => {
  try {
    const { invoiceId, amount } = req.body;
    console.log("invoiceId", invoiceId);

    const invoiceMinterContract = new ethers.Contract(
      INVOICE_MINTER_ADDRESS,
      invoiceMinterABI,
      wallet
    );
    const t1 = await erc20Contract.mint(wallet.address, amount);
    await t1.wait();
    const t2 = await erc20Contract.approve(INVOICE_MINTER_ADDRESS, amount);
    await t2.wait();
    const tx = await invoiceMinterContract.payInvoice(invoiceId, amount);

    await tx.wait();

    res.json({
      status: "success",
      message: "Invoice paid successfully!",
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

app.get("/invoice-tokens/balance", async (req, res) => {
  try {
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
