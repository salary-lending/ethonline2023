# SalaryFi

SalaryFi is a cutting-edge platform designed to bridge the gap between traditional salary systems and the expansive realm of decentralized finance (DeFi). At its core, it's a tool that allows individuals to access their earned salaries ahead of the traditional payday, offering flexibility and empowerment in personal financial management.

---

**Core Functionalities**:

1. **Integration with Deel**:
   - Using a unique API key, users can quickly link their SalaryFi account to Deel, a platform widely recognized for handling contractual and payment solutions, especially for freelancers and remote teams.
2. **Invoice Management**:
   - Once integrated, SalaryFi pulls the user's invoice data from Deel.
   - This data undergoes two primary storage processes:
     - It's securely stored on **Web3 storage**, a decentralized storage network, ensuring that the user's data remains tamper-proof and safe from centralized server failures.
     - For users who prefer a structured and tabular view of their data, the invoice is also systematically organized in **TableLand**, a database solution, allowing for easier tracking and management.
3. **Tokenization of Invoices**:
   - In a unique financial twist, SalaryFi allows users to mint their invoices into what's termed as **InvoiceTokens**. These tokens effectively tokenize the user's earned salary.
4. **Borrowing Mechanism**:
   - With these minted InvoiceTokens, users can borrow the cryptocurrency, DAI, which is a stablecoin that mirrors the value of the US dollar.
   - This borrowing leverages **Spark Conduits**, which act as middlemen protocols, facilitating the deposit of InvoiceTokens and ensuring the seamless borrowing of DAI against them.
5. **Currency Conversion**:
   - SalaryFi is integrated with **Uniswap**. Users can swap their borrowed DAI for USDC (or any other currency) right within the platform.
6. **Repayment through Deel**:
   - Unlike conventional systems, SalaryFi's repayment process stands out. Users don't need to manually handle the repayment of their borrowed amount.
   - Instead, repayments are automated and channeled directly through the Deel payroll system. Once a user's payday arrives on Deel, the borrowed amount is automatically deducted from the invoice, settling the loan.
   - This integration ensures a hassle-free experience, as the dues are cleared without manual intervention.

**Technological Stack**:

---

**Backend**:

- **Node.js**: Our preferred pick for a scalable runtime, smoothly processing a vast array of user requests.
- **Express.js**: In tandem with Node, Express.js laid the groundwork for our API, seamlessly weaving together Deel.

---

**Frontend**:

- **Next.js**: Combining the prowess of React and the advantages of server-side rendering, Next.js was our ace for delivering a snappy interface.
- **Redux**: This toolkit proved invaluable, untangling state management intricacies, especially during multiple external platform integrations.

---

**Blockchain & DeFi Integration**:

- **Wagmi**: For intuitive and secure wallet interactions, we integrated Wagmi. This not only facilitated seamless token transactions but also bolstered the trust quotient for our users, ensuring they truly felt "We're all gonna make it!".
- **Ethereum Smart Contracts**: The pillars of SalaryFi. Crafted in Solidity, they oversee token intricacies and ensure foolproof transaction mechanics.

---

**Data Management & Storage**:

- **Web3.storage/Filecoin**: Utilizing IPFS's and Filecoins decentralized architecture, it provided an impregnable sanctuary for our invoice data.
- **TableLand**: This agile relational database emerged as a perfect choice for orderly data storage.

---

**Integration & Plugins**:

- **Deel API**: The linchpin of SalaryFi. Integrating it was paramount to resonate with the dynamic world of remote work.
- **SparkConduit**: Central to our operations, enhancing token transactions and making loan mechanisms silky smooth.
- **Uniswap SDK**: Beyond mere currency conversion, it's our passport to the expansive realms of DeFi for our user base.

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

### Run frontend

```shell
cd frontend
npm run dev
```

## deployedContract
- on Scrolls:
   - contracts/InvoiceFinancer.sol: https://sepolia.scrollscan.dev/address/0x80e491E5d9Fa0503306b4496E9440816Bf56d14c#code 
   - contracts/ArrangerConduit.sol: https://sepolia.scrollscan.dev/address/0x0513224aaaCbf9EC34E13ab5F0BA3467Bad6C591#code
   - contracts/AllocatorRoles.sol: https://sepolia.scrollscan.dev/address/0x338bB9CDE4158bc90a4d5113EC33fd534F9A12E9#code
   - contracts/InvoiceTable.sol: https://sepolia.scrollscan.dev/address/0x80e491E5d9Fa0503306b4496E9440816Bf56d14c#code