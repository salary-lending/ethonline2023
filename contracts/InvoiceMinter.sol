// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

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
        uint256 amount;
        InvoiceStatus status;
        address financedBy;
    }

    mapping(string => Invoice) public invoices;

    constructor(address _invoiceTokenAddress) {
        invoiceToken = InvoiceToken(_invoiceTokenAddress);
    }

    function financeInvoice(string memory invoiceId, uint256 amount) external {
        require(
            invoices[invoiceId].status == InvoiceStatus.None,
            "Invoice already exists"
        );
        // uint256 mintAmount = (amount * 90) / 100; // Mint 90% of the invoice amount
        uint256 mintAmount = amount;

        invoices[invoiceId] = Invoice({
            amount: amount,
            status: InvoiceStatus.Financed,
            financedBy: msg.sender
        });

        invoiceToken.mint(msg.sender, mintAmount);
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
        // invoiceToken.burn(msg.sender, amount);
        invoices[invoiceId].status = InvoiceStatus.Paid;
    }
}
