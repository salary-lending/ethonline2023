import { before, describe, test } from "mocha";
import mockStdin from "mock-stdin";
import { expect } from "chai";
import { ethers } from "hardhat";
import { LocalTableland, getAccounts } from "@tableland/local";
import { Database } from "@tableland/sdk";
import { deployments } from "../deployments";

process.env.NODE_NO_WARNINGS = "stream/web";

// setup a mocked stdin that lets us interact with the cli
mockStdin.stdin();

const lt = new LocalTableland({ silent: true });
const accounts = getAccounts();

describe("InvoiceFinancer", function () {
  this.timeout(8000);

  const accounts = getAccounts();
  // Create a database connection; the signer passes the connected
  // chain and is used for signing create table transactions
  const db = new Database({ signer: accounts[0] });
  // const tableland = connect({ chain: "local-tableland", signer: accounts[0] });

  let InvoiceToken, InvoiceFinancer, invoiceToken, invoiceFinancer;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    this.timeout(25000);
    console.log("Starting LocalTableland");
    await lt.start();
    console.log("LocalTableland started");
    await lt.isReady();
    console.log("LocalTableland is ready");

    // Deploy the InvoiceTable contract
    const InvoiceTable = await ethers.getContractFactory("InvoiceTable");
    const invoiceTable = await InvoiceTable.deploy({ gasLimit: 3000000 });

    // Wait for the deployment to be mined
    await invoiceTable.deployed();
    console.log(`InvoiceTable contract deployed at: ${invoiceTable.address}`);
    const { meta: create } = await db
      .prepare(`CREATE TABLE testTable (id integer primary key, val text);`)
      .run();

    // The table's `name` is in the format `{prefix}_{chainId}_{tableId}`
    const txn = await create.txn; // e.g., my_sdk_table_80001_311
    console.log(`InvoiceTable created at: ${txn}`);
    // await invoiceTable.create();

    InvoiceToken = await ethers.getContractFactory("InvoiceToken");
    invoiceToken = await InvoiceToken.deploy();
    await invoiceToken.deployed();
    console.log("InvoiceToken deployed to:", invoiceToken.address);

    InvoiceFinancer = await ethers.getContractFactory("InvoiceFinancer");
    invoiceFinancer = await InvoiceFinancer.deploy(
      invoiceToken.address,
      invoiceTable.address
    );
    console.log("InvoiceFinancer deployed to:", invoiceFinancer.address);
    await invoiceFinancer.deployed();
  });

  describe("Financing an invoice", function () {
    it("Should mint 90% of invoice amount to the financier", async function () {
      const invoiceAmount = ethers.utils.parseEther("10"); // 10 ethers as an example
      const expectedMintAmount = ethers.utils.parseEther("10"); // change to 90 to have90% of 10
      const description = "Invoice Description 1";

      await invoiceFinancer
        .connect(addr1)
        .financeInvoice("INV001", description, invoiceAmount);
      const balance = await invoiceToken.balanceOf(addr1.address);

      expect(balance).to.equal(expectedMintAmount);
    });
  });

  describe("Paying an invoice", function () {
    it("Should allow repayment of 100% invoice amount", async function () {
      const invoiceAmount = ethers.utils.parseEther("10");
      const description = "Invoice Description 1";

      // Address1 finances the invoice
      await invoiceFinancer
        .connect(addr1)
        .financeInvoice("INV001", description, invoiceAmount);
      // Address2 repays the invoice
      const paymentAmount = ethers.utils.parseEther("10");
      await invoiceToken.connect(owner).mint(addr2.address, paymentAmount);
      await invoiceToken
        .connect(addr2)
        .approve(invoiceFinancer.address, paymentAmount);
      await invoiceFinancer.connect(addr2).payInvoice("INV001", paymentAmount);

      const balance = await invoiceToken.balanceOf(addr2.address);
      expect(balance).to.equal(0);
    });
  });

  // ... Add more tests as needed
});
