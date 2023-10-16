# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

### Run tests
```shell
npm install
npx hardhat test --network localhost
```

### Run backend
```shell
npx hardhat node --network local-tableland
### deploy
npx hardhat run scripts/deploy.ts --network localhost

### Copy deployed address of ERC20Token and InvoiceMinter and add to server.ts file under ERC20_ADDRESS and INVOICE_MINTER_ADDRESS 
cd backend
npx ts-node src/server.ts
```
