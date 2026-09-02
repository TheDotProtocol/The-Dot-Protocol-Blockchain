// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IHexchangePair {
    function mint(address to) external returns (uint256 liquidity);
    function burn(address to) external returns (uint256 amount0, uint256 amount1);
    function swap(uint256 amount0Out, uint256 amount1Out, address to) external;
    function getReserves() external view returns (uint112, uint112, uint32);
    function token0() external view returns (address);
    function token1() external view returns (address);
}

interface IHexchangeFactory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

/**
 * @title HexchangeRouter
 * @notice Uniswap V2-style router for swaps and liquidity.
 */
contract HexchangeRouter {
    using SafeERC20 for IERC20;

    address public factory;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "Router: EXPIRED");
        _;
    }

    constructor(address _factory) {
        factory = _factory;
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        (amountA, amountB) = _calculateOptimalAmounts(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = IHexchangeFactory(factory).getPair(tokenA, tokenB);
        if (pair == address(0)) {
            pair = IHexchangeFactory(factory).createPair(tokenA, tokenB);
        }
        IERC20(tokenA).safeTransferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, pair, amountB);
        liquidity = IHexchangePair(pair).mint(to);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256 amountA, uint256 amountB) {
        address pair = IHexchangeFactory(factory).getPair(tokenA, tokenB);
        IERC20(pair).safeTransferFrom(msg.sender, pair, liquidity);
        (uint256 amount0, uint256 amount1) = IHexchangePair(pair).burn(to);
        (address token0,) = _sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin && amountB >= amountBMin, "Router: INSUFFICIENT_AMOUNTS");
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256[] memory amounts) {
        amounts = getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "Router: INSUFFICIENT_OUTPUT_AMOUNT");
        address pair = IHexchangeFactory(factory).getPair(path[0], path[1]);
        require(pair != address(0), "Router: PAIR_NOT_FOUND");
        _swap(amounts, path, to);
    }

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256[] memory amounts) {
        amounts = getAmountsIn(amountOut, path);
        require(amounts[0] <= amountInMax, "Router: EXCESSIVE_INPUT_AMOUNT");
        _swap(amounts, path, to);
    }

    function getAmountsOut(uint256 amountIn, address[] memory path) public view returns (uint256[] memory amounts) {
        require(path.length >= 2, "Router: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        for (uint256 i; i < path.length - 1; i++) {
            address pair = IHexchangeFactory(factory).getPair(path[i], path[i + 1]);
            require(pair != address(0), "Router: PAIR_NOT_FOUND");
            (uint112 reserve0, uint112 reserve1,) = IHexchangePair(pair).getReserves();
            (address token0,) = _sortTokens(path[i], path[i + 1]);
            (uint256 reserveIn, uint256 reserveOut) = path[i] == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }

    function getAmountsIn(uint256 amountOut, address[] memory path) public view returns (uint256[] memory amounts) {
        require(path.length >= 2, "Router: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[amounts.length - 1] = amountOut;
        for (uint256 i = path.length - 1; i > 0; i--) {
            address pair = IHexchangeFactory(factory).getPair(path[i - 1], path[i]);
            require(pair != address(0), "Router: PAIR_NOT_FOUND");
            (uint112 reserve0, uint112 reserve1,) = IHexchangePair(pair).getReserves();
            (address token0,) = _sortTokens(path[i - 1], path[i]);
            (uint256 reserveIn, uint256 reserveOut) = path[i - 1] == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
            amounts[i - 1] = getAmountIn(amounts[i], reserveIn, reserveOut);
        }
    }

    // --- Internal ---
    function _swap(uint256[] memory amounts, address[] memory path, address _to) internal {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = _sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));
            address to = i < path.length - 2 ? IHexchangeFactory(factory).getPair(output, path[i + 2]) : _to;
            IHexchangePair(IHexchangeFactory(factory).getPair(input, output)).swap(amount0Out, amount1Out, to);
        }
    }

    function _calculateOptimalAmounts(
        address tokenA, address tokenB,
        uint256 amountADesired, uint256 amountBDesired,
        uint256 amountAMin, uint256 amountBMin
    ) internal view returns (uint256 amountA, uint256 amountB) {
        amountA = amountADesired;
        amountB = amountBDesired;
        address pair = IHexchangeFactory(factory).getPair(tokenA, tokenB);
        if (pair != address(0)) {
            (uint112 reserve0, uint112 reserve1,) = IHexchangePair(pair).getReserves();
            (address token0,) = _sortTokens(tokenA, tokenB);
            (uint256 reserveA, uint256 reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
            if (reserveA > 0 && reserveB > 0) {
                amountB = (amountA * reserveB) / reserveA;
                amountA = (amountB * reserveA) / reserveB;
            }
        }
        require(amountA >= amountAMin && amountB >= amountBMin, "Router: INSUFFICIENT_AMOUNTS");
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) internal pure returns (uint256) {
        require(amountIn > 0 && reserveIn > 0 && reserveOut > 0, "Router: INSUFFICIENT_LIQUIDITY");
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        return numerator / denominator;
    }

    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) internal pure returns (uint256) {
        require(amountOut > 0 && reserveIn > 0 && reserveOut > 0, "Router: INSUFFICIENT_LIQUIDITY");
        uint256 numerator = (reserveIn * amountOut * 1000) / (reserveOut - amountOut);
        return (numerator / 997) + 1;
    }

    function _sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "Router: IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "Router: ZERO_ADDRESS");
    }
}
