// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./InvoiceToken.sol";
import "./InvoiceFinancer.sol";
import "./ArrangerConduit.sol";
// import "./V4SwapCaller.sol";

contract StrategyManager is ERC165, ReentrancyGuard {
    using SafeMath for uint256;

    InvoiceToken public invoiceToken;
    InvoiceFinancer public invoiceFinancer;
    ArrangerConduit public arrangerConduit;

    // the address of the stable coinin which dividend is paid
    IERC20 public daiToken;

    mapping(address => uint256) public stakedSecurityTokens;

    address[] lenders;
    event Borrow(address indexed who, address indexed asset, uint256 amount);
    event Repay(address indexed who, address indexed asset, uint256 amount);

    /**
     * @param _invoiceTokenAddress address of the security contract
     * @param _dividendCurrency address of the stable coin / cbdc in which dividend is paid
     */
    constructor(
        address _invoiceTokenAddress,
        address _dividendCurrency,
        address _invoiceFinancerAddress,
        address _arrangerConduitAddress
    ) {
        invoiceToken = InvoiceToken(_invoiceTokenAddress);
        invoiceFinancer = InvoiceFinancer(_invoiceFinancerAddress);
        daiToken = IERC20(_dividendCurrency);
        arrangerConduit = ArrangerConduit(_arrangerConduitAddress);

        // TODO: init UniswapPool
        // V4SwapCaller().init();
    }

    // /**
    //  * @notice send ETH to trigger minting of mithril tokens.
    //  *         amount of mithril to be minted is controled by the state of linear bonding curve at any given time
    //  *
    //  */
    // receive() external payable {
    //     // increament pool balance
    //     require(
    //         msg.value > 0,
    //         "FORBIDDEN: only nonzero eth values are accepted"
    //     );
    //     ethBalance += msg.value;
    //     updateAccountBalance(msg.sender, msg.value);

    //     if (ethBalance >= thresholdAmount) {
    //         invoiceToken.BuyTreasuryBond{value: 2 wei}();
    //     }
    // }

    function borrow(address asset, uint256 amount) external nonReentrant {
        stakedSecurityTokens[msg.sender] += amount;
        arrangerConduit.deposit(msg.sender, address(invoiceToken), amount);
        // arrangerConduit.drawFunds(address(daiToken), msg.sender, amount);
        bool success = daiToken.transfer(msg.sender, amount);
        emit Borrow(msg.sender, asset, amount);
    }

    function repay(address asset, uint256 amount) external nonReentrant {
        stakedSecurityTokens[msg.sender] -= amount;
        // arrangerConduit.returnFunds(fundRequestId, amount);
        // invoiceFinancer.payInvoice("1", amount);
        bool success = daiToken.transferFrom(msg.sender, address(this), amount);
        invoiceToken.transfer(msg.sender, amount);
        emit Repay(msg.sender, asset, amount);
    }

    // TODO
    function swap(address asset, uint256 amount) external nonReentrant {
        // should call uniswap v4 router to swap tokens DAI -> USDC and return USDC to the user
        // V4SwapCaller.swap();
        // and check if user has PolygonID minted
    }
}
