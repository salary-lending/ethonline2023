import express, { Request, Response } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import axios from "axios";
import { Web3Storage, getFilesFromPath } from "web3.storage";
import fs from "fs";
dotenv.config();

const DEEL_INVOICE_URL: string =
  "https://api-staging.letsdeel.com/rest/v1/contracts/nw9z5ww/invoice-adjustments";

const deel_key: string = process.env.DEEL_KEY!;
const web3storage_key: string = process.env.WEB3STORAGE_KEY!;

const app = express();
const PORT = process.env.PORT || 3000;

// const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const contractABI: any[] = [
  /* ...your contract ABI here... */
];
const contractAddress = "YOUR_CONTRACT_ADDRESS";

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
