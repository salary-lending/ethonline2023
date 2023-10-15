import express, { Request, Response } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import axios from "axios";
import { Web3Storage, getFilesFromPath } from "web3.storage";
import fs from "fs";
dotenv.config();

const DEEL_INVOICE_URL: string =
  "https://api-staging.letsdeel.com/rest/v1/contracts/nw9z5ww/invoice-adjustments";
const ERC20Address: string = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
const INVOICE_MINTER_ADDRESS: string =
  "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
const deel_key: string = process.env.DEEL_KEY!;
const web3storage_key: string = process.env.WEB3STORAGE_KEY!;

const app = express();
const PORT = process.env.PORT || 3000;

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);
const contractABI: any[] = [
  /* ...your contract ABI here... */
];
const contractAddress = "YOUR_CONTRACT_ADDRESS";

const erc20ABI = fs.readFileSync(
  "../deployments/localhost/erc20ABI.json",
  "utf8"
);
const invoiceMinterABI = fs.readFileSync(
  "../deployments/localhost/invoiceMinterABI.json",
  "utf8"
);
const invoiceMinterAddress = INVOICE_MINTER_ADDRESS;
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

app.post("/create-invoice", async (req, res) => {
  try {
    const { invoiceId, details, amount } = req.body;

    const invoiceMinterContract = new ethers.Contract(
      invoiceMinterAddress,
      invoiceMinterABI,
      wallet
    );
    const tx = await invoiceMinterContract.createInvoiceAndMintToken(
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

app.get("/invoices/minted", async (req, res) => {
  try {
    const invoiceMinterContract = new ethers.Contract(
      invoiceMinterAddress,
      invoiceMinterABI,
      wallet
    );
    const tx = await invoiceMinterContract.invoices("ID1");
    console.log("tx", tx);
    console.log("tx", tx.toString());

    await tx.wait();

    res.json({
      status: "success",
      message: "Invoice created and tokens minted successfully!",
      mintedTokens: tx.toString(),
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
    const erc20Contract = new ethers.Contract(ERC20Address, erc20ABI, wallet);
    const erc20Balance = await erc20Contract.totalSupply();

    res.json({
      totalBalance: erc20Balance.toString(),
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
