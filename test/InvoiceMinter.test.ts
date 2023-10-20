import { before, describe } from "mocha";
import mockStdin from "mock-stdin";
import { expect } from "chai";
import { ethers } from "hardhat";
import { LocalTableland, getAccounts } from "@tableland/local";
import { Database, Validator, helpers } from "@tableland/sdk";
import { buffer } from "stream/consumers";

// setup a mocked stdin that lets us interact with the cli
// mockStdin.stdin();

const lt = new LocalTableland({ silent: true, verbose: false });
const accounts = getAccounts();
// Create a database connection; the signer passes the connected
// chain and is used for signing create table transactions
const db = new Database({
  signer: accounts[0],
  baseUrl: helpers.getBaseUrl(31337),
});
let invoiceTable, buffer1, roles, registry, dai, usdc;

before(async function () {
  this.timeout(25000);
  console.log("Starting LocalTableland");
  await lt.start();
  console.log("LocalTableland started");
  await lt.isReady();
  console.log("LocalTableland is ready");

  const Dai = await ethers.getContractFactory("Dai");
  dai = await Dai.deploy();
  console.log(`Dai contract deployed at: ${dai.address}`);

  const Usdc = await ethers.getContractFactory("Usdc");
  usdc = await Usdc.deploy();
  console.log(`Usdc contract deployed at: ${usdc.address}`);

  // Deploy the InvoiceTable contract
  const InvoiceTable = await ethers.getContractFactory("InvoiceTable");
  invoiceTable = await InvoiceTable.deploy();

  // Wait for the deployment to be mined
  await invoiceTable.deployed();
  console.log(`InvoiceTable contract deployed at: ${invoiceTable.address}`);

  await invoiceTable.create();
  console.log(`InvoiceTable created at: ${invoiceTable.address}`);

  const AllocatorRoles = await ethers.getContractFactory("AllocatorRoles");
  roles = await AllocatorRoles.deploy();
  await roles.deployed();
  console.log(`Roles contract deployed at: ${roles.address}`);

  const AllocatorRegistry = await ethers.getContractFactory(
    "AllocatorRegistry"
  );
  registry = await AllocatorRegistry.deploy();
  await registry.deployed();
  console.log(`Registry contract deployed at: ${registry.address}`);
  const ilk1 = "ilk1";
  buffer1 = accounts[1];
  registry.file(
    ethers.utils.formatBytes32String(ilk1),
    "buffer",
    buffer1.address
  );
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
      const beforeTokenBalance = await invoiceToken.totalSupply();
      await invoiceToken
        .connect(addr2)
        .approve(invoiceFinancer.address, paymentAmount);
      await invoiceFinancer.connect(addr2).payInvoice("INV001", paymentAmount);

      const balance = await invoiceToken.balanceOf(addr2.address);
      const afterTokenBalance = await invoiceToken.totalSupply();
      expect(balance).to.equal(0);
      expect(beforeTokenBalance.sub(paymentAmount)).to.equal(afterTokenBalance);
    });
  });

  describe("SparkConduit", function () {
    it("Should deposit Invoice Tokens and borrow Dai", async function () {
      const invoiceAmount = ethers.utils.parseEther("10"); // 10 ethers as an example
      const expectedMintAmount = ethers.utils.parseEther("10"); // change to 90 to have90% of 10
      const description = "Invoice Description 1";

      await invoiceFinancer
        .connect(addr1)
        .financeInvoice("INV001", description, invoiceAmount);
      const balance = await invoiceToken.balanceOf(addr1.address);

      const ArrangerConduit = await ethers.getContractFactory(
        "ArrangerConduit"
      );
      const arrangerConduit = await ArrangerConduit.deploy();
      await arrangerConduit.deployed();
      console.log(
        `ArrangerConduit contract deployed at: ${arrangerConduit.address}`
      );

      arrangerConduit.file("arranger", owner.address);
      arrangerConduit.file("registry", registry.address);
      arrangerConduit.file("roles", roles.address);

      registry.file("ilk1", "buffer", buffer1.address);

      await arrangerConduit.setBroker(
        invoiceFinancer.address,
        invoiceToken.address,
        true
      );

      const beforeTokenBalance = await invoiceToken.balanceOf(buffer1.address);
      await invoiceToken.mint(buffer1.address, 100);
      const mintedTokenBalance = await invoiceToken.balanceOf(buffer1.address);
      expect(mintedTokenBalance).to.equal(beforeTokenBalance.add(100));

      await invoiceToken.connect(buffer1).approve(arrangerConduit.address, 100);
      await arrangerConduit.deposit(
        buffer1.address,
        invoiceToken.address,
        100,
        { gasLimit: 4000000 }
      );
      console.log("deposit done");

      const beforeOwnerBalance = await dai.balanceOf(owner.address);
      await dai.mint(arrangerConduit.address, 100);
      const daiBalance = await dai.balanceOf(arrangerConduit.address);
      await arrangerConduit.drawFunds(dai.address, owner.address, 100, {
        gasLimit: 4000000,
      });

      const afterOwnerBalance = await dai.balanceOf(owner.address);
      const afterDaiBalance = await dai.balanceOf(arrangerConduit.address);

      expect(afterOwnerBalance).to.equal(beforeOwnerBalance.add(100));
      expect(afterDaiBalance).to.equal(daiBalance.sub(100));
      expect(balance).to.equal(expectedMintAmount);
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

  describe("StrategyManager", function () {
    it("Should borrow", async function () {
      const ArrangerConduit = await ethers.getContractFactory(
        "ArrangerConduit"
      );
      const arrangerConduit = await ArrangerConduit.deploy();
      await arrangerConduit.deployed();
      console.log(
        `ArrangerConduit contract deployed at: ${arrangerConduit.address}`
      );
      const StrategyManager = await ethers.getContractFactory(
        "StrategyManager"
      );
      const strategyManager = await StrategyManager.deploy(
        invoiceToken.address,
        dai.address,
        invoiceFinancer.address,
        arrangerConduit.address,
        usdc.address
      );
      console.log("StrategyManager deployed to:", strategyManager.address);
      console.log("Addr1", addr1.address);

      await invoiceToken.mint(addr1.address, 100);
      await dai.mint(strategyManager.address, 100);
      await invoiceToken.connect(addr1).approve(arrangerConduit.address, 100);
      await strategyManager
        .connect(addr1)
        .borrow(dai.address, 100, { gasLimit: 400000 });
      const balance = await dai.balanceOf(addr1.address);
      expect(balance).to.equal(100);
    });

    it("Should repay", async function () {
      const invoiceAmount = ethers.utils.parseEther("10");
      const description = "Invoice Description 1";

      // Address1 finances the invoice
      await invoiceFinancer
        .connect(addr1)
        .financeInvoice("INV001", description, invoiceAmount);
      // Address2 repays the invoice
      const paymentAmount = ethers.utils.parseEther("10");
      await invoiceToken.connect(owner).mint(addr2.address, paymentAmount);
      const beforeTokenBalance = await invoiceToken.totalSupply();
      await invoiceToken
        .connect(addr2)
        .approve(invoiceFinancer.address, paymentAmount);
      await invoiceFinancer.connect(addr2).payInvoice("INV001", paymentAmount);

      const balance = await invoiceToken.balanceOf(addr2.address);
      const afterTokenBalance = await invoiceToken.totalSupply();
      expect(balance).to.equal(0);
      expect(beforeTokenBalance.sub(paymentAmount)).to.equal(afterTokenBalance);
    });
  });

  // ... Add more tests as needed
});

after(async function () {
  await lt.shutdown();
});
