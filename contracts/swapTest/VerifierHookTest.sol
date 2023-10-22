// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import {GasSnapshot} from "forge-gas-snapshot/GasSnapshot.sol";
import {IHooks} from "@uniswap/v4-core/contracts/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/contracts/libraries/Hooks.sol";
import {IPoolManager} from "@uniswap/v4-core/contracts/interfaces/IPoolManager.sol";
import {TickMath} from "@uniswap/v4-core/contracts/libraries/TickMath.sol";
import {PoolKey} from "@uniswap/v4-core/contracts/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/contracts/types/PoolId.sol";
import {Deployers} from "@uniswap/v4-core/test/foundry-tests/utils/Deployers.sol";
import {CurrencyLibrary, Currency} from "@uniswap/v4-core/contracts/types/Currency.sol";
import {HookTest} from "./swapUtils/HookTest.sol";
import {HookMiner} from "./swapUtils/HookMiner.sol";
import {VerifierHook} from "../VerifierHook.sol";

// @notice: Usage of VerifierHookTest contracts
// For operation test, run  setup()

contract VerifierHookTest is HookTest, Deployers, GasSnapshot {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;

    VerifierHook verifierHook;
    PoolKey poolKey;
    PoolId poolId;

    function setUp() public {
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
        // token0, token1 is declared in HookTest.sol
        // PoolKey params:
        // - The lower currency
        // - The higher currency
        // - The pool swap fee
        // - Ticks
        // - Hook
        poolKey = PoolKey(Currency.wrap(address(token0)), Currency.wrap(address(token1)), 3000, 60, IHooks(verifierHook));
        poolId = poolKey.toId();
        manager.initialize(poolKey, SQRT_RATIO_1_1, ZERO_BYTES);

        // @notice: Provide liquidity to the pool
        // params of ModifyPositionParams: 
        // - tickLower
        // - tickUpper
        // - liquidityDelta <- Initial pool liquidity

        // Todo: why calls 3 times!??
        modifyPositionRouter.modifyPosition(poolKey, IPoolManager.ModifyPositionParams(-60, 60, 10 ether), ZERO_BYTES);
        modifyPositionRouter.modifyPosition(poolKey, IPoolManager.ModifyPositionParams(-120, 120, 10 ether), ZERO_BYTES);
        // the lower and upper tick of the position
        modifyPositionRouter.modifyPosition(
            poolKey,
            IPoolManager.ModifyPositionParams(TickMath.minUsableTick(60), TickMath.maxUsableTick(60), 10 ether),
            ZERO_BYTES
        );
    }

    // TODO: just execute swap with the deployed Hook
    function testVerifierHook() public {
        // Pool liquidity is set up in setup()

        // assertEq(verifierHook.beforeSwapCount(poolId), 0);

        // Perform a test swap //
        int256 amount = 100; // TODO: amoutn of which currency!?
        bool zeroForOne = true;
        swap(poolKey, amount, zeroForOne, ZERO_BYTES); //
        // ------------------- //

        // assertEq(verifierHook.beforeSwapCount(poolId), 1);
    }
}