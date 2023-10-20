// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import {PoolManager} from "@uniswap/v4-core/contracts/PoolManager.sol";
import {IPoolManager} from "@uniswap/v4-core/contracts/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/contracts/types/PoolKey.sol";
import {PoolModifyPositionTest} from "@uniswap/v4-core/contracts/test/PoolModifyPositionTest.sol";
import {PoolSwapTest} from "@uniswap/v4-core/contracts/test/PoolSwapTest.sol";

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {TickMath} from "@uniswap/v4-core/contracts/libraries/TickMath.sol";

contract V4SwapCaller is Test{
    PoolManager poolManager;
    PoolModifyPositionTest modifyPositionRouter;
    PoolSwapTest swapRouter;

    uint160 public constant MIN_PRICE_LIMIT = TickMath.MIN_SQRT_RATIO + 1;
    uint160 public constant MAX_PRICE_LIMIT = TickMath.MAX_SQRT_RATIO - 1;

    function init(address token0, address token1, uint256 amount0, uint256 amount1) public {
        poolManager = new PoolManager(500000);
        modifyPositionRouter = new PoolModifyPositionTest(IPoolManager(address(poolManager)));
        swapRouter = new PoolSwapTest(IPoolManager(address(poolManager)));
    }

    function approve(address token0, address token1, uint256 amount0, uint256 amount1) internal {
        ERC20(token0).approve(address(swapRouter), amount0);
        ERC20(token1).approve(address(swapRouter), amount1);
    }

    function swap(PoolKey memory key, int256 amountSpecified, bool zeroForOne, bytes memory hookData) internal {
        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
            zeroForOne: zeroForOne,
            amountSpecified: amountSpecified,
            sqrtPriceLimitX96: zeroForOne ? MIN_PRICE_LIMIT : MAX_PRICE_LIMIT // unlimited impact
        });

        PoolSwapTest.TestSettings memory testSettings =
            PoolSwapTest.TestSettings({withdrawTokens: true, settleUsingTransfer: true});

        swapRouter.swap(key, params, testSettings, hookData);
    }
}