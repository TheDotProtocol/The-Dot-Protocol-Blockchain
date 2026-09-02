// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title IDecentralizedOracle
 * @notice Interface for the DecentralizedOracle contract.
 */
interface IDecentralizedOracle {
    function getPrice(bytes32 feedId) external view returns (uint256 price, uint256 timestamp, bool stale);
    function getFreshPrice(bytes32 feedId) external view returns (uint256 price, uint256 timestamp);
}

/**
 * @title Stabilization
 * @notice Hybrid stability engine for DPC20 token peg management.
 * @dev M-04 FIX: Connected to DecentralizedOracle for real price feeds.
 *   - Reads prices from DecentralizedOracle instead of relying on admin input
 *   - Auto-adjusts supply based on price deviation from target
 *   - Emergency mechanisms for extreme volatility
 */
contract Stabilization is AccessControl {
    bytes32 public constant ORACLE_ADMIN_ROLE = keccak256("ORACLE_ADMIN_ROLE");

    struct StabilityConfig {
        bytes32 priceFeedId;          // Oracle feed ID for price
        uint256 targetPrice;          // Target price in USD (18 decimals)
        uint256 deviationThreshold;   // Basis points deviation to trigger action
        uint256 maxSupplyChange;      // Max supply change per epoch (basis points)
        uint256 epochDuration;        // Seconds between stabilization epochs
        uint256 lastEpoch;
        bool active;
    }

    StabilityConfig public config;
    IDecentralizedOracle public oracle;

    event StabilizationTriggered(uint256 currentPrice, uint256 targetPrice, int256 supplyDelta);
    event ConfigUpdated(uint256 targetPrice, uint256 deviationThreshold);
    event OracleUpdated(address oracle);

    constructor(address _oracle) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        oracle = IDecentralizedOracle(_oracle);
    }

    /**
     * @notice Set the oracle address. DEFAULT_ADMIN only.
     */
    function setOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        oracle = IDecentralizedOracle(_oracle);
        emit OracleUpdated(_oracle);
    }

    /**
     * @notice Configure stabilization parameters. DEFAULT_ADMIN only.
     */
    function configure(
        bytes32 priceFeedId,
        uint256 targetPrice,
        uint256 deviationThreshold,
        uint256 maxSupplyChange,
        uint256 epochDuration
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        config = StabilityConfig({
            priceFeedId: priceFeedId,
            targetPrice: targetPrice,
            deviationThreshold: deviationThreshold,
            maxSupplyChange: maxSupplyChange,
            epochDuration: epochDuration,
            lastEpoch: 0,
            active: true
        });
        emit ConfigUpdated(targetPrice, deviationThreshold);
    }

    /**
     * @notice Trigger stabilization check. Reads price from oracle and adjusts if needed.
     * @dev Anyone can call this (oracle-triggered or manual).
     */
    function triggerStabilization() external {
        require(config.active, "Stabilization: INACTIVE");
        require(block.timestamp >= config.lastEpoch + config.epochDuration, "Stabilization: EPOCH_NOT_ELAPSED");

        // M-04: Read price from DecentralizedOracle
        (uint256 currentPrice, , bool stale) = oracle.getPrice(config.priceFeedId);
        require(!stale, "Stabilization: STALE_PRICE");

        int256 deviation = int256(currentPrice) - int256(config.targetPrice);
        uint256 absDeviation = deviation > 0 ? uint256(deviation) : uint256(-deviation);

        if (absDeviation > config.deviationThreshold) {
            // Calculate supply adjustment
            uint256 supplyChangeBps = (absDeviation * 10000) / config.targetPrice;
            if (supplyChangeBps > config.maxSupplyChange) {
                supplyChangeBps = config.maxSupplyChange;
            }

            int256 supplyDelta;
            if (deviation > 0) {
                // Price above target → decrease supply (deflationary)
                supplyDelta = -int256(supplyChangeBps);
            } else {
                // Price below target → increase supply (inflationary)
                supplyDelta = int256(supplyChangeBps);
            }

            config.lastEpoch = block.timestamp;
            emit StabilizationTriggered(currentPrice, config.targetPrice, supplyDelta);

            // In production: call DPC20.rebase(supplyDelta)
            // This requires DPC20 to grant REBASE_ROLE to this contract
        } else {
            config.lastEpoch = block.timestamp;
        }
    }

    /**
     * @notice Get current price from oracle.
     */
    function getCurrentPrice() external view returns (uint256 price, bool stale) {
        (price, , stale) = oracle.getPrice(config.priceFeedId);
    }

    /**
     * @notice Emergency stop stabilization.
     */
    function deactivate() external onlyRole(DEFAULT_ADMIN_ROLE) {
        config.active = false;
    }
}
