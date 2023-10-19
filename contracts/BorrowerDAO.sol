// SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity ^0.8.16;

import "./interfaces/IAllocatorConduit.sol";
import "./InvoiceMinter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface RolesLike {
    function canCall(bytes32, address, address, bytes4) external view returns (bool);
}

interface RegistryLike {
    function buffers(bytes32) external view returns (address);
}

interface BufferLike {
    function approve(address, address, uint256) external;
}

interface TokenLike {
    function transfer(address, uint256) external;
    function transferFrom(address, address, uint256) external;
}

interface IInvoiceFinancer {
    function getInvoiceAmount(string calldata invoiceId) external view returns (uint256);
}

contract BorrowerDAO is IAllocatorConduit {

    IInvoiceFinancer public invoiceFinancer;


    mapping(address => uint256) public borrowers;
    mapping(bytes32 => mapping(address => uint256)) public debt;

    // --- immutables ---

    RolesLike    public immutable roles;
    RegistryLike public immutable registry;
    address public immutable borrower;
    address public immutable vault;

    // --- events ---

    event Rely(address indexed usr);
    event Deny(address indexed usr);
    event SetRoles(bytes32 indexed ilk, address roles_);

    // --- modifiers ---

    modifier auth() {
        require(borrowers[msg.sender] == 1, "AllocatorBuffer/not-authorized");
        _;
    }

    modifier ilkAuth(bytes32 ilk) {
        require(roles.canCall(ilk, msg.sender, address(this), msg.sig), "AllocatorConduitExample/ilk-not-authorized");
        _;
    }

    // --- constructor ---

    constructor(address roles_, address registry_, address vault_, address _invoiceFinancerAddress ) {
        invoiceFinancer = IInvoiceFinancer(_invoiceFinancerAddress);
        roles = RolesLike(roles_);
        registry = RegistryLike(registry_);
        borrower = msg.sender;
        vault = vault_;
    }
    // --- getters ---

    function maxDeposit(bytes32 ilk, address asset) external pure returns (uint256 maxDeposit_) {
        ilk;asset;
        maxDeposit_ = type(uint256).max;
    }

    function maxWithdraw(bytes32 ilk, address asset) external view returns (uint256 maxWithdraw_) {
        maxWithdraw_ = debt[ilk][asset];
    }

    // --- admininstration ---

    function rely(address usr) external auth {
        borrowers[usr] = 1;
        emit Rely(usr);
    }

    function deny(address usr) external auth {
        borrowers[usr] = 0;
        emit Deny(usr);
    }

    // --- functions ---

    //deposit asset = Invoice minted 
     
    function deposit(bytes32 ilk, address asset, string calldata invoiceId) external {
        uint256 amount = invoiceFinancer.getInvoiceAmount(invoiceId);
        require(amount > 0, "Invalid invoice amount");
        debt[ilk][asset] += amount;
        TokenLike(asset).transferFrom(vault, borrower, amount);
        emit Deposit(ilk, asset, borrower, amount);
    }

    // asset = DAI 
    function withdraw(bytes32 ilk, address asset, uint256 maxAmount) external returns (uint256 amount) {
        uint256 balance = debt[ilk][asset];
        amount = balance < maxAmount ? balance : maxAmount;
        debt[ilk][asset] = balance - amount;
        TokenLike(asset).transferFrom(vault, borrower, amount);
        emit Withdraw(ilk, asset, vault, amount);
    }
}
