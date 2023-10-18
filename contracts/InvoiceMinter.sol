// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// Add the InvoiceTable import
import "./InvoiceTable.sol";

contract InvoiceToken is ERC20 {
    constructor() ERC20("InvoiceToken", "INV") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address account, uint256 amount) external {
        _burn(account, amount);
    }
}

contract InvoiceFinancer {
    InvoiceToken public invoiceToken;

    enum InvoiceStatus {
        None,
        Financed,
        Paid
    }

    struct Invoice {
        string invoiceId;
        uint256 amount;
        InvoiceStatus status;
        string details;
        address financedBy;
    }

    Invoice[] public invoicesArray;
    mapping(string => uint256) public invoiceIdToIndex;
    mapping(string => Invoice) public invoices;

    event InvoiceFinanced(string invoiceId, string details, uint256 amount);

    InvoiceTable private invoiceTable; // Instance of the InvoiceTable contract

    constructor(address _invoiceTokenAddress, address _invoiceTableAddress) {
        invoiceToken = InvoiceToken(_invoiceTokenAddress);
        invoiceTable = InvoiceTable(_invoiceTableAddress); // Initialize the InvoiceTable instance
    }

    function financeInvoice(
        string memory invoiceId,
        string memory details,
        uint256 amount
    ) external {
        require(
            invoices[invoiceId].status == InvoiceStatus.None,
            "Invoice already exists"
        );

        // uint256 mintAmount = (amount * 90) / 100; // Mint 90% of the invoice amount
        uint256 mintAmount = amount;

        Invoice memory newInvoice = Invoice({
            invoiceId: invoiceId,
            amount: mintAmount,
            status: InvoiceStatus.Financed,
            details: details,
            financedBy: msg.sender
        });

        invoices[invoiceId] = newInvoice;
        invoicesArray.push(newInvoice);

        invoiceIdToIndex[invoiceId] = invoicesArray.length;

        invoiceToken.mint(msg.sender, mintAmount);
        // Add to Tableland's InvoiceTable after the logic
        invoiceTable.insert(
            invoiceId,
            details,
            amount,
            "Financed", // status
            msg.sender // financedBy
        );
        emit InvoiceFinanced(invoiceId, details, mintAmount);
    }

    function payInvoice(string memory invoiceId, uint256 amount) external {
        require(
            invoices[invoiceId].status == InvoiceStatus.Financed,
            "Invoice not financed or already repaid"
        );
        require(
            invoices[invoiceId].amount == amount,
            "Amount has to equal invoice amount"
        );

        invoiceToken.transferFrom(msg.sender, address(this), amount);
        invoiceToken.burn(address(this), amount);
        invoices[invoiceId].status = InvoiceStatus.Paid;
        // Update Tableland's InvoiceTable after the logic
        invoiceTable.updateStatus(invoiceId, "Paid");
    }

    function getInvoicesCount() public view returns (uint256) {
        return invoicesArray.length;
    }
}
