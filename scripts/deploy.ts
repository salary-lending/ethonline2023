import { run, ethers } from "hardhat";
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  const ERC20TokenFactory = await ethers.getContractFactory("InvoiceToken");
  const erc20token = await ERC20TokenFactory.deploy();
  await erc20token.deployed();
  console.log(`ERC20Token contract deployed at: ${erc20token.address}`);
  // Save the contract address to a file

  fs.writeFileSync("./deployments/localhost/erc20.txt", erc20token.address);

  // Deploy the InvoiceTable contract
  const InvoiceTable = await ethers.getContractFactory("InvoiceTable");
  const invoiceTable = await InvoiceTable.deploy();

  // Wait for the deployment to be mined
  await invoiceTable.deployed();
  console.log(`InvoiceTable contract deployed at: ${invoiceTable.address}`);

  await invoiceTable.create({ gasLimit: 30000000 });
  console.log(`InvoiceTable created at: ${invoiceTable.address}`);

  const InvoiceMinterFactory = await ethers.getContractFactory(
    "InvoiceFinancer"
  );
  const invoiceMinter = await InvoiceMinterFactory.deploy(
    erc20token.address,
    invoiceTable.address
  );
  await invoiceMinter.deployed();
  console.log(`InvoiceMinter contract deployed at: ${invoiceMinter.address}`);
  // Save the contract address to a file
  fs.writeFileSync(
    "./deployments/localhost/invoice-minter.txt",
    invoiceMinter.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
