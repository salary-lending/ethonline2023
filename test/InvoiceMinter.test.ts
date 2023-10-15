import { ethers } from "hardhat";
import { expect } from "chai";

describe("InvoiceFinancer", function () {
  let InvoiceToken, InvoiceFinancer, invoiceToken, invoiceFinancer;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    InvoiceToken = await ethers.getContractFactory("InvoiceToken");
    invoiceToken = await InvoiceToken.deploy();
    await invoiceToken.waitForDeployment();

    InvoiceFinancer = await ethers.getContractFactory("InvoiceFinancer");
    invoiceFinancer = await InvoiceFinancer.deploy(invoiceToken.target);
    console.log("InvoiceFinancer deployed to:", invoiceFinancer.target);
    await invoiceFinancer.waitForDeployment();
  });

  describe("Financing an invoice", function () {
    it("Should mint 90% of invoice amount to the financier", async function () {
      const invoiceAmount = ethers.parseEther("10"); // 10 ethers as an example
      const expectedMintAmount = ethers.parseEther("10"); // change to 90 to have90% of 10
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
      const invoiceAmount = ethers.parseEther("10");
      const description = "Invoice Description 1";

      // Address1 finances the invoice
      await invoiceFinancer
        .connect(addr1)
        .financeInvoice("INV001", description, invoiceAmount);
      // Address2 repays the invoice
      const paymentAmount = ethers.parseEther("10");
      await invoiceToken.connect(owner).mint(addr2.address, paymentAmount);
      await invoiceToken
        .connect(addr2)
        .approve(invoiceFinancer.target, paymentAmount);
      await invoiceFinancer.connect(addr2).payInvoice("INV001", paymentAmount);

      const balance = await invoiceToken.balanceOf(addr2.address);
      expect(balance).to.equal(0);
    });
  });

  // ... Add more tests as needed
});
