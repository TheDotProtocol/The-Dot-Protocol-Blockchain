// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DecentralizedOracle
 * @notice Multi-source price oracle with aggregation, staleness checks, and deviation thresholds.
 * @dev Replaces the single-admin Oracle with a decentralized design:
 *   - Multiple independent price reporters can submit prices
 *   - Prices are aggregated (median) to resist manipulation
 *   - Staleness checks prevent stale price usage
 *   - Deviation threshold rejects outlier prices
 *   - Admin can only add/remove reporters, not set prices directly
 */
contract DecentralizedOracle is AccessControl {
    bytes32 public constant REPORTER_ROLE = keccak256("REPORTER_ROLE");
    bytes32 public constant FEED_ADMIN_ROLE = keccak256("FEED_ADMIN_ROLE");

    struct PriceFeed {
        bytes32 feedId;
        string name;              // e.g. "3DOT/USD"
        uint256 staleAfter;       // seconds before price is stale
        uint256 minReporters;     // minimum reports needed for aggregation
        uint256 deviationThreshold; // max deviation from median (basis points)
        bool active;
    }

    struct PriceReport {
        address reporter;
        uint256 price;            // price in USD (18 decimals)
        uint256 timestamp;
    }

    struct AggregatedPrice {
        uint256 price;
        uint256 timestamp;
        uint256 reportCount;
        address[] reporters;
    }

    // Feed configuration
    mapping(bytes32 => PriceFeed) public feeds;
    bytes32[] public feedIds;

    // Price reports per feed (last N reports)
    mapping(bytes32 => PriceReport[]) public priceReports;
    mapping(bytes32 => uint256) public lastReportTime;

    // Aggregated prices cache
    mapping(bytes32 => AggregatedPrice) public aggregatedPrices;

    // Events
    event FeedCreated(bytes32 indexed feedId, string name, uint256 staleAfter, uint256 minReporters);
    event PriceReported(bytes32 indexed feedId, address indexed reporter, uint256 price);
    event PriceAggregated(bytes32 indexed feedId, uint256 price, uint256 reportCount);
    event FeedDeactivated(bytes32 indexed feedId);
    event ReporterAdded(address indexed reporter);
    event ReporterRemoved(address indexed reporter);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FEED_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Create a new price feed. FEED_ADMIN_ROLE only.
     */
    function createFeed(
        bytes32 feedId,
        string calldata name,
        uint256 staleAfter,
        uint256 minReporters,
        uint256 deviationThreshold
    ) external onlyRole(FEED_ADMIN_ROLE) {
        require(feeds[feedId].staleAfter == 0, "Oracle: FEED_EXISTS");
        require(minReporters >= 2, "Oracle: NEED_MIN_2_REPORTERS");

        feeds[feedId] = PriceFeed({
            feedId: feedId,
            name: name,
            staleAfter: staleAfter,
            minReporters: minReporters,
            deviationThreshold: deviationThreshold,
            active: true
        });

        feedIds.push(feedId);
        emit FeedCreated(feedId, name, staleAfter, minReporters);
    }

    /**
     * @notice Submit a price report. REPORTER_ROLE only.
     */
    function reportPrice(bytes32 feedId, uint256 price) external onlyRole(REPORTER_ROLE) {
        PriceFeed storage feed = feeds[feedId];
        require(feed.active, "Oracle: FEED_INACTIVE");
        require(price > 0, "Oracle: INVALID_PRICE");

        PriceReport memory report = PriceReport({
            reporter: msg.sender,
            price: price,
            timestamp: block.timestamp
        });

        priceReports[feedId].push(report);
        lastReportTime[feedId] = block.timestamp;

        // Keep only last 10 reports per feed to save gas
        if (priceReports[feedId].length > 10) {
            // Shift array (simplified — in production use circular buffer)
            delete priceReports[feedId][0];
        }

        emit PriceReported(feedId, msg.sender, price);

        // Auto-aggregate if we have enough reports
        if (priceReports[feedId].length >= feed.minReporters) {
            _aggregatePrice(feedId);
        }
    }

    /**
     * @notice Get the latest aggregated price for a feed.
     */
    function getPrice(bytes32 feedId) external view returns (uint256 price, uint256 timestamp, bool stale) {
        AggregatedPrice storage agg = aggregatedPrices[feedId];
        PriceFeed storage feed = feeds[feedId];

        require(feed.active, "Oracle: FEED_INACTIVE");
        require(agg.reportCount >= feed.minReporters, "Oracle: INSUFFICIENT_REPORTS");

        stale = block.timestamp > agg.timestamp + feed.staleAfter;
        price = agg.price;
        timestamp = agg.timestamp;
    }

    /**
     * @notice Get price with automatic staleness revert.
     */
    function getFreshPrice(bytes32 feedId) external view returns (uint256 price, uint256 timestamp) {
        bool stale;
        (price, timestamp, stale) = this.getPrice(feedId);
        require(!stale, "Oracle: STALE_PRICE");
    }

    /**
     * @notice Get the average of two feeds (for cross-rate calculations).
     */
    function getAveragePrice(bytes32 feed1, bytes32 feed2) external view returns (uint256 avgPrice, bool stale) {
        (uint256 price1, uint256 time1, bool stale1) = this.getPrice(feed1);
        (uint256 price2, uint256 time2, bool stale2) = this.getPrice(feed2);

        stale = stale1 || stale2;
        avgPrice = (price1 + price2) / 2;
    }

    /**
     * @notice Deactivate a feed. FEED_ADMIN_ROLE only.
     */
    function deactivateFeed(bytes32 feedId) external onlyRole(FEED_ADMIN_ROLE) {
        feeds[feedId].active = false;
        emit FeedDeactivated(feedId);
    }

    /**
     * @notice Add a price reporter. DEFAULT_ADMIN_ROLE only.
     */
    function addReporter(address reporter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(REPORTER_ROLE, reporter);
        emit ReporterAdded(reporter);
    }

    /**
     * @notice Remove a price reporter. DEFAULT_ADMIN_ROLE only.
     */
    function removeReporter(address reporter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(REPORTER_ROLE, reporter);
        emit ReporterRemoved(reporter);
    }

    /**
     * @notice Get all configured feed IDs.
     */
    function getFeedIds() external view returns (bytes32[] memory) {
        return feedIds;
    }

    /**
     * @notice Internal price aggregation using median.
     */
    function _aggregatePrice(bytes32 feedId) internal {
        PriceReport[] storage reports = priceReports[feedId];
        PriceFeed storage feed = feeds[feedId];

        if (reports.length < feed.minReporters) return;

        // Collect valid (non-stale) prices
        uint256[] memory prices = new uint256[](reports.length);
        uint256 validCount = 0;

        for (uint256 i = 0; i < reports.length; i++) {
            if (reports[i].timestamp > 0 &&
                block.timestamp <= reports[i].timestamp + feed.staleAfter) {
                prices[validCount] = reports[i].price;
                validCount++;
            }
        }

        if (validCount < feed.minReporters) return;

        // Sort prices for median calculation
        for (uint256 i = 0; i < validCount - 1; i++) {
            for (uint256 j = i + 1; j < validCount; j++) {
                if (prices[j] < prices[i]) {
                    uint256 temp = prices[i];
                    prices[i] = prices[j];
                    prices[j] = temp;
                }
            }
        }

        // Get median
        uint256 median;
        if (validCount % 2 == 0) {
            median = (prices[validCount / 2 - 1] + prices[validCount / 2]) / 2;
        } else {
            median = prices[validCount / 2];
        }

        // Reject outlier reports (deviation threshold)
        uint256 maxDeviation = (median * feed.deviationThreshold) / 10000;
        uint256 validPriceCount = 0;
        uint256 priceSum = 0;

        for (uint256 i = 0; i < validCount; i++) {
            uint256 deviation = prices[i] > median ? prices[i] - median : median - prices[i];
            if (deviation <= maxDeviation) {
                priceSum += prices[i];
                validPriceCount++;
            }
        }

        if (validPriceCount < feed.minReporters) return;

        // Final aggregated price (average of non-outlier reports)
        uint256 finalPrice = priceSum / validPriceCount;

        aggregatedPrices[feedId] = AggregatedPrice({
            price: finalPrice,
            timestamp: block.timestamp,
            reportCount: validPriceCount,
            reporters: new address[](0)
        });

        emit PriceAggregated(feedId, finalPrice, validPriceCount);
    }
}
