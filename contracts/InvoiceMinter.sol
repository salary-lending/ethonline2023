// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function mint(address to, uint256 amount) external;
}

contract InvoiceMinter {
    address public tokenAddress;

    event InvoiceCreated(string invoiceId, string details, uint256 amount);

    // Constructor to initialize the token's address
    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }

    struct Invoice {
        string invoiceId;
        string details;
        uint256 amount;
    }

    Invoice[] public invoicesArray;
    mapping(string => uint256) public invoiceIdToIndex; // Maps an invoiceId to its index in the array

    mapping(string => Invoice) public invoices; // Maps an invoiceId to its Invoice struct

    function createInvoiceAndMintToken(
        string memory _invoiceId,
        string memory _details,
        uint256 _amount
    ) public {
        // Ensure the invoice doesn't already exist
        require(
            bytes(invoices[_invoiceId].invoiceId).length == 0,
            "Invoice ID already exists"
        );

        // Create the invoice
        Invoice memory newInvoice = Invoice({
            invoiceId: _invoiceId,
            details: _details,
            amount: _amount
        });

        invoices[_invoiceId] = newInvoice;
        invoicesArray.push(
            Invoice({invoiceId: _invoiceId, details: _details, amount: _amount})
        );

        invoiceIdToIndex[_invoiceId] = invoicesArray.length; // Update the mapping with the index of the newly created invoice

        // Mint the token
        IERC20(tokenAddress).mint(msg.sender, _amount);
        emit InvoiceCreated(_invoiceId, _details, _amount);
    }

    function getInvoicesCount() public view returns (uint256) {
        return invoicesArray.length;
    }
}

contract ERC20Token is IERC20 {
    string public name = "InvoiceToken";
    string public symbol = "INV";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balances;

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    // modifier onlyAdmin() {
    //     require(msg.sender == admin, "Only admin can mint");
    //     _;
    // }

    function mint(address to, uint256 amount) external override {
        totalSupply += amount;
        balances[to] += amount;
    }

    //... other ERC20 methods
}
