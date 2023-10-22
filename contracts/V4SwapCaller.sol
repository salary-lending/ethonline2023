// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import {GasSnapshot} from "forge-gas-snapshot/GasSnapshot.sol";
import {Deployers} from "@uniswap/v4-core/test/foundry-tests/utils/Deployers.sol";
import {PoolManager} from "@uniswap/v4-core/contracts/PoolManager.sol";
import {IPoolManager} from "@uniswap/v4-core/contracts/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/contracts/types/PoolKey.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {TickMath} from "@uniswap/v4-core/contracts/libraries/TickMath.sol";

import {CurrencyLibrary, Currency} from "@uniswap/v4-core/contracts/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/contracts/types/PoolId.sol";
import {IHooks} from "@uniswap/v4-core/contracts/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/contracts/libraries/Hooks.sol";
import {PoolModifyPositionTest} from "@uniswap/v4-core/contracts/test/PoolModifyPositionTest.sol";
import {PoolSwapTest} from "@uniswap/v4-core/contracts/test/PoolSwapTest.sol";

import {HookTest} from "./swapTest/swapUtils/HookTest.sol";
import {HookMiner} from "./swapTest/swapUtils/HookMiner.sol";
import {VerifierHook} from "./VerifierHook.sol";


// @notice: Usage of V4SwapCaller: same in VerifierHookTest
// For operation test, run v4PoolSetUp() with 2 token_address

contract V4SwapCaller is HookTest, Deployers, GasSnapshot{
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;

    VerifierHook verifierHook;
    PoolKey poolKey;
    PoolId poolId;

    error InvalidSwapAmount();

    function v4PoolSetUp(address token0_addr, address token1_addr) public {
        // creates the pool manager, test tokens, and other utility routers
        HookTest.initHookTestEnv();

        // Deploy the hook to an address with the correct flags
        uint160 flags = uint160(
            Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_MODIFY_POSITION_FLAG
                | Hooks.AFTER_MODIFY_POSITION_FLAG
        );
        (address hookAddress, bytes32 salt) =
            HookMiner.find(address(this), flags, 0, type(VerifierHook).creationCode, abi.encode(address(manager)));
        verifierHook = new VerifierHook{salt: salt}(IPoolManager(address(manager)));
        require(address(verifierHook) == hookAddress, "VerifierHookTest: hook address mismatch");

        // Create the pool
        // token0, token1 is declared in HookTest.sol -> will orverride
        // PoolKey params:
        // - The lower currency
        // - The higher currency
        // - The pool swap fee
        // - Ticks
        // - Hook
        poolKey = PoolKey(Currency.wrap(token0_addr), Currency.wrap(token1_addr), 3000, 60, IHooks(verifierHook));
        poolId = poolKey.toId();
        manager.initialize(poolKey, SQRT_RATIO_1_1, "");

        // @notice: Provide liquidity to the pool
        // params of ModifyPositionParams: 
        // - tickLower
        // - tickUpper
        // - liquidityDelta <- Initial pool liquidity

        // Todo: why calls 3 times!??
        modifyPositionRouter.modifyPosition(poolKey, IPoolManager.ModifyPositionParams(-60, 60, 10 ether), "");
        modifyPositionRouter.modifyPosition(poolKey, IPoolManager.ModifyPositionParams(-120, 120, 10 ether), "");
        // the lower and upper tick of the position
        modifyPositionRouter.modifyPosition(
            poolKey,
            IPoolManager.ModifyPositionParams(TickMath.minUsableTick(60), TickMath.maxUsableTick(60), 10 ether),
            ""
        );

        // approve
        approve(token0_addr, token1_addr);
    }

    function approve(address token0_addr, address token1_addr, uint256 amount0, uint256 amount1) internal {
        ERC20(token0).approve(address(swapRouter), amount0);
        ERC20(token1).approve(address(swapRouter), amount1);
    }

    // TODO: execute swap() declared in HookTest.sol
    function executeSwap(int256 _amount)public {
        if(_amount > 0) revert InvalidSwapAmount();
        int256 amount = 100; // which amount?
        bool zeroForOne = true;

        swap(poolKey, amount, zeroForOne, "");
    }
}