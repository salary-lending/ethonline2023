import { before, describe } from "mocha";
import mockStdin from "mock-stdin";
import { expect } from "chai";
import { ethers } from "hardhat";
import { LocalTableland, getAccounts } from "@tableland/local";
import { Database, Validator, helpers } from "@tableland/sdk";

process.env.NODE_NO_WARNINGS = "stream/web";

// setup a mocked stdin that lets us interact with the cli
mockStdin.stdin();

const lt = new LocalTableland({ silent: true, verbose: false });
const accounts = getAccounts();
// Create a database connection; the signer passes the connected
// chain and is used for signing create table transactions
const db = new Database({
  signer: accounts[0],
  baseUrl: helpers.getBaseUrl(31337),
});
let invoiceTable;

before(async function () {
  this.timeout(25000);
  console.log("Starting LocalTableland");
  await lt.start();
  console.log("LocalTableland started");
  await lt.isReady();
  console.log("LocalTableland is ready");

  // Deploy the InvoiceTable contract
  const InvoiceTable = await ethers.getContractFactory("InvoiceTable");
  invoiceTable = await InvoiceTable.deploy();

  // Wait for the deployment to be mined
  await invoiceTable.deployed();
  console.log(`InvoiceTable contract deployed at: ${invoiceTable.address}`);

  await invoiceTable.create();
  console.log(`InvoiceTable created at: ${invoiceTable.address}`);
});

describe("InvoiceFinancer", function () {
  this.timeout(8000);

  let InvoiceToken, InvoiceFinancer, invoiceToken, invoiceFinancer;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

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

  describe("Tableland operations", function () {
    it("Should insert a new invoice into the table", async function () {
      const invoiceAmount = ethers.utils.parseEther("10"); // 10 ethers as an example
      const invoiceId = "INV001";
      const description = "Invoice Description 1";

      await invoiceFinancer
        .connect(addr1)
        .financeInvoice(invoiceId, description, invoiceAmount);

      const [signer] = await ethers.getSigners();
      const chainId = await signer.getChainId();

      // Use a `Validator` to get the table name
      const validator = new Validator(db.config);
      const tableName = await validator.getTableById({
        chainId: chainId,
        tableId: "2",
      });

      const data: JSON = await db
        .prepare(`SELECT * from ${tableName.name}`)
        .first();
      console.log(`Data in table '${tableName.name}':`);
      console.log(data);
      expect(data["id"]).to.equal(invoiceId);
      expect(data["details"]).to.equal(description);
      expect(BigInt(Number(data["amount"])).toString()).to.equal(
        invoiceAmount.toString()
      );
      expect(data["status"]).to.equal("Financed");
    });
  });

  // ... Add more tests as needed
});

after(async function () {
  await lt.shutdown();
});
