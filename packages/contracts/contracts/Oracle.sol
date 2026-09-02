// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Oracle
 * @notice Price oracle for Dot Protocol — stores and validates price feeds.
 * @dev Deployed at:
 *   Chennai: 0x435d6A390c865De76c80c6262aD2D7a5b5D41931
 *   Mainnet: 0xAE7D6822975e9050bF3AafB823351F95eD518eeb
 */
contract Oracle is AccessControl {
    struct PriceData {
        uint256 price;       // price with 18 decimals
        uint256 timestamp;
        uint256 staleAfter;  // max age in seconds
    }

    mapping(bytes32 => PriceData) public prices;
    bytes32 public constant FEEDER_ROLE = keccak256("FEEDER_ROLE");

    event PriceUpdated(bytes32 indexed feedId, uint256 price, uint256 timestamp);
    event FeedCreated(bytes32 indexed feedId, uint256 staleAfter);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FEEDER_ROLE, msg.sender);
    }

    /**
     * @notice Register a new price feed.
     */
    function createFeed(bytes32 feedId, uint256 staleAfter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(prices[feedId].timestamp == 0, "Oracle: FEED_EXISTS");
        prices[feedId] = PriceData({price: 0, timestamp: 0, staleAfter: staleAfter});
        emit FeedCreated(feedId, staleAfter);
    }

    /**
     * @notice Update a price feed (authorized feeders only).
     */
    function updatePrice(bytes32 feedId, uint256 price) external onlyRole(FEEDER_ROLE) {
        require(prices[feedId].timestamp != 0, "Oracle: NO_FEED");
        require(price > 0, "Oracle: INVALID_PRICE");
        prices[feedId].price = price;
        prices[feedId].timestamp = block.timestamp;
        emit PriceUpdated(feedId, price, block.timestamp);
    }

    /**
     * @notice Get the current price for a feed.
     * @return price The price (18 decimals)
     * @return isStale Whether the price is stale
     */
    function getPrice(bytes32 feedId) external view returns (uint256 price, bool isStale) {
        PriceData storage data = prices[feedId];
        require(data.timestamp != 0, "Oracle: NO_FEED");
        isStale = block.timestamp > data.timestamp + data.staleAfter;
        price = data.price;
    }

    /**
     * @notice Get a price from two feeds and return a TWAP-like average.
     */
    function getAveragePrice(bytes32 feed1, bytes32 feed2) external view returns (uint256 avgPrice, bool stale) {
        PriceData storage d1 = prices[feed1];
        PriceData storage d2 = prices[feed2];
        require(d1.timestamp != 0 && d2.timestamp != 0, "Oracle: NO_FEED");
        bool s1 = block.timestamp > d1.timestamp + d1.staleAfter;
        bool s2 = block.timestamp > d2.timestamp + d2.staleAfter;
        avgPrice = (d1.price + d2.price) / 2;
        stale = s1 || s2;
    }
}
