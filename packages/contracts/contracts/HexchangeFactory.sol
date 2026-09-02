// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./HexchangePair.sol";

/**
 * @title HexchangeFactory
 * @notice Creates and tracks HexchangePair AMM pools.
 */
contract HexchangeFactory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    address public feeTo;
    address public feeToSetter;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint256);

    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "Factory: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "Factory: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "Factory: PAIR_EXISTS");

        // Deploy pair
        bytes memory bytecode = type(HexchangePair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(pair != address(0), "Factory: CREATE2_FAILED");

        HexchangePair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate both directions
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, "Factory: FORBIDDEN");
        feeTo = _feeTo;
    }
}
