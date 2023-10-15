import { expect } from "chai";
import { ethers } from "hardhat";

describe("Invoice Minter", function () {
  it("Should create an invoice and mint token", async function () {
    const ERC20TokenFactory = await ethers.getContractFactory("ERC20Token");
    const erc20token = await ERC20TokenFactory.deploy();
    await erc20token.waitForDeployment();

    const InvoiceMinterFactory = await ethers.getContractFactory(
      "InvoiceMinter"
    );
    const invoiceMinter = await InvoiceMinterFactory.deploy(
      erc20token.getAddress()
    );
    await invoiceMinter.waitForDeployment();

    await erc20token.mint(invoiceMinter.getAddress(), 1000);

    await invoiceMinter.createInvoiceAndMintToken("INV01", "Test Invoice", 500);

    // Validate
    const invoice = await invoiceMinter.invoices("INV01");
    expect(invoice.invoiceId).to.equal("INV01");
    expect(invoice.amount).to.equal(500);
  });
});
