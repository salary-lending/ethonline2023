import { run, ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  const ERC20TokenFactory = await ethers.getContractFactory("ERC20Token");
  const erc20token = await ERC20TokenFactory.deploy();
  await erc20token.waitForDeployment();
  console.log(`ERC20Token contract deployed at: ${erc20token.getAddress()}`);

  const InvoiceMinterFactory = await ethers.getContractFactory("InvoiceMinter");
  const invoiceMinter = await InvoiceMinterFactory.deploy(
    erc20token.getAddress()
  );
  await invoiceMinter.waitForDeployment();
  console.log(
    `InvoiceMinter contract deployed at: ${invoiceMinter.getAddress}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
