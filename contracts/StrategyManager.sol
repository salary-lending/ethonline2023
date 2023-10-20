// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./InvoiceToken.sol";
import "./Usdc.sol";
import "./Dai.sol";
import "./InvoiceFinancer.sol";
import "./ArrangerConduit.sol";

contract StrategyManager is ERC165, ReentrancyGuard {
    using SafeMath for uint256;

    InvoiceToken public invoiceToken;
    InvoiceFinancer public invoiceFinancer;
    ArrangerConduit public arrangerConduit;
    Usdc public usdc;
    Dai public dai;

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
        address _arrangerConduitAddress,
        address _usdcAddress
    ) {
        invoiceToken = InvoiceToken(_invoiceTokenAddress);
        invoiceFinancer = InvoiceFinancer(_invoiceFinancerAddress);
        dai = Dai(_dividendCurrency);
        arrangerConduit = ArrangerConduit(_arrangerConduitAddress);
        usdc = Usdc(_usdcAddress);
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
        arrangerConduit.drawFunds(address(dai), msg.sender, amount);
        bool success = dai.transfer(msg.sender, amount);
        emit Borrow(msg.sender, asset, amount);
    }

    function repay(address asset, uint256 amount) external nonReentrant {
        stakedSecurityTokens[msg.sender] -= amount;
        // arrangerConduit.returnFunds(fundRequestId, amount);
        // invoiceFinancer.payInvoice("1", amount);
        bool success = dai.transferFrom(msg.sender, address(this), amount);
        invoiceToken.transfer(msg.sender, amount);
        emit Repay(msg.sender, asset, amount);
    }

    function swapUsdc(uint256 amount) external nonReentrant {
        // TODO: implement
        // should call uniswap v4 router to swap tokens DAI -> USDC and return USDC to the user
        // and check if user has PolygonID minted
        dai.transferFrom(msg.sender, address(this), amount);
        usdc.mint(msg.sender, amount);
    }

    function swapDai(uint256 amount) external nonReentrant {
        usdc.transferFrom(msg.sender, address(this), amount);
        dai.mint(msg.sender, amount);
    }
}
