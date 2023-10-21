import { run, ethers } from "hardhat";
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  const InvoiceToken = await ethers.getContractFactory("InvoiceToken");
  const invoiceToken = await InvoiceToken.deploy();
  await invoiceToken.deployed();
  console.log(`Invoice contract deployed at: ${invoiceToken.address}`);
  // Save the contract address to a file
  fs.writeFileSync("./deployments/localhost/erc20.txt", invoiceToken.address);

  const Dai = await ethers.getContractFactory("Dai");
  const dai = await Dai.deploy();
  await dai.deployed();
  console.log(`Dai contract deployed at: ${dai.address}`);

  const Usdc = await ethers.getContractFactory("Usdc");
  const usdc = await Usdc.deploy();
  await usdc.deployed();
  console.log(`Usdc contract deployed at: ${usdc.address}`);

  // Deploy the InvoiceTable contract
  const InvoiceTable = await ethers.getContractFactory("InvoiceTable");
  const invoiceTable = await InvoiceTable.deploy();

  // Wait for the deployment to be mined
  await invoiceTable.deployed();
  console.log(`InvoiceTable contract deployed at: ${invoiceTable.address}`);

  await invoiceTable.create();
  console.log(`InvoiceTable created at: ${invoiceTable.address}`);

  const InvoiceFinancerFactory = await ethers.getContractFactory(
    "InvoiceFinancer"
  );
  const invoiceFinancer = await InvoiceFinancerFactory.deploy(
    invoiceToken.address,
    invoiceTable.address
  );
  await invoiceFinancer.deployed();
  console.log(
    `InvoiceFinancer contract deployed at: ${invoiceFinancer.address}`
  );
  // Save the contract address to a file
  fs.writeFileSync(
    "./deployments/localhost/invoice-minter.txt",
    invoiceFinancer.address
  );

  const RolesAddress = await ethers.getContractFactory("AllocatorRoles");
  const rolesAddress = await RolesAddress.deploy();
  await rolesAddress.deployed();
  console.log(`Roles contract deployed at: ${rolesAddress.address}`);

  const RegistryAddress = await ethers.getContractFactory("AllocatorRegistry");
  const registryAddress = await RegistryAddress.deploy();
  await registryAddress.deployed();
  console.log(`Registry contract deployed at: ${registryAddress.address}`);

  const ArrangerConduit = await ethers.getContractFactory("ArrangerConduit");
  const arrangerConduit = await ArrangerConduit.deploy();
  await arrangerConduit.deployed();
  console.log(
    `ArrangerConduit contract deployed at: ${arrangerConduit.address}`
  );

  await arrangerConduit.setBroker(
    invoiceFinancer.address,
    invoiceToken.address,
    true
  );

  const StrategyManager = await ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.deploy(
    invoiceToken.address,
    dai.address,
    invoiceFinancer.address,
    arrangerConduit.address,
    usdc.address
  );
  await strategyManager.deployed();
  console.log(
    `StrategyManager contract deployed at: ${strategyManager.address}`
  );

  // Mint dai tokens
  const amount = ethers.utils.parseEther("1000000");
  const mintDai = await dai.mint(arrangerConduit.address, amount);
  console.log("Successfully minted dai : ", amount, mintDai);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
