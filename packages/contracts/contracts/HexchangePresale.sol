// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HexchangePresale
 * @notice Token presale with vesting schedules and phased pricing.
 * @dev Security fixes:
 *   - M-03: Added emergency pause function
 *   - Added owner-only pause capability
 */
contract HexchangePresale is Ownable {
    enum Phase { NotStarted, Private, Public, Ended }

    struct PhaseConfig {
        uint256 price;           // price per token in wei
        uint256 tokensAllocated;
        uint256 tokensSold;
        uint256 startTime;
        uint256 endTime;
        uint256 minPurchase;
        uint256 maxPurchase;
    }

    struct Purchase {
        uint256 amount;          // ETH paid
        uint256 tokens;          // tokens purchased
        uint256 timestamp;
        bool claimed;
    }

    PhaseConfig[] public phases;
    mapping(address => Purchase[]) public purchases;
    mapping(address => uint256) public totalContributed;
    mapping(address => uint256) public totalTokensBought;

    address public tokenAddress;
    uint256 public totalRaised;
    uint256 public tgeUnlock;    // percentage unlocked at TGE (basis points)
    uint256 public vestingMonths;
    bool public paused;          // M-03: Emergency pause

    // Events
    event PresaleStarted(uint256 phaseCount);
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount, uint256 phase);
    event TokensClaimed(address indexed buyer, uint256 amount);
    event PhaseConfigured(uint256 indexed phase, uint256 price, uint256 allocation);
    event PresalePaused();
    event PresaleUnpaused();

    modifier whenNotPaused() {
        require(!paused, "Presale: PAUSED");
        _;
    }

    constructor(address _tokenAddress, uint256 _tgeUnlock, uint256 _vestingMonths) Ownable(msg.sender) {
        tokenAddress = _tokenAddress;
        tgeUnlock = _tgeUnlock;
        vestingMonths = _vestingMonths;
    }

    /**
     * @notice Configure a presale phase. Owner only.
     */
    function configurePhase(
        uint256 phase,
        uint256 price,
        uint256 tokensAllocated,
        uint256 startTime,
        uint256 endTime,
        uint256 minPurchase,
        uint256 maxPurchase
    ) external onlyOwner {
        require(phase < 3, "Presale: INVALID_PHASE");
        require(price > 0 && tokensAllocated > 0, "Presale: INVALID_CONFIG");

        if (phases.length <= phase) {
            phases.push();
        }

        phases[phase] = PhaseConfig({
            price: price,
            tokensAllocated: tokensAllocated,
            tokensSold: 0,
            startTime: startTime,
            endTime: endTime,
            minPurchase: minPurchase,
            maxPurchase: maxPurchase
        });

        emit PhaseConfigured(phase, price, tokensAllocated);
    }

    /**
     * @notice Start the presale. Owner only.
     */
    function startPresale() external onlyOwner whenNotPaused {
        require(phases.length >= 2, "Presale: NOT_CONFIGURED");
        emit PresaleStarted(phases.length);
    }

    /**
     * @notice Buy tokens in a specific phase.payable.
     */
    function buyWithETH(uint256 phase) external payable whenNotPaused {
        require(phase < phases.length, "Presale: INVALID_PHASE");
        require(block.timestamp >= phases[phase].startTime, "Presale: NOT_STARTED");
        require(block.timestamp <= phases[phase].endTime, "Presale: ENDED");

        PhaseConfig storage config = phases[phase];
        uint256 tokenAmount = (msg.value * 1e18) / config.price;
        require(tokenAmount > 0, "Presale: INSUFFICIENT_AMOUNT");
        require(config.tokensSold + tokenAmount <= config.tokensAllocated, "Presale: SOLD_OUT");
        require(msg.value >= config.minPurchase, "Presale: BELOW_MIN");
        require(totalContributed[msg.sender] + msg.value <= config.maxPurchase || config.maxPurchase == 0, "Presale: ABOVE_MAX");

        config.tokensSold += tokenAmount;
        totalRaised += msg.value;
        totalContributed[msg.sender] += msg.value;
        totalTokensBought[msg.sender] += tokenAmount;

        purchases[msg.sender].push(Purchase({
            amount: msg.value,
            tokens: tokenAmount,
            timestamp: block.timestamp,
            claimed: false
        }));

        emit TokensPurchased(msg.sender, msg.value, tokenAmount, phase);
    }

    /**
     * @notice Claim purchased tokens with vesting schedule.
     */
    function claimTokens() external {
        uint256 totalClaimable = 0;
        Purchase[] storage userPurchases = purchases[msg.sender];

        for (uint256 i = 0; i < userPurchases.length; i++) {
            if (!userPurchases[i].claimed) {
                totalClaimable += _calculateVestedAmount(userPurchases[i]);
                userPurchases[i].claimed = true;
            }
        }

        require(totalClaimable > 0, "Presale: NOTHING_TO_CLAIM");

        // Transfer tokens (requires presale contract to be funded)
        (bool success, ) = tokenAddress.call(
            abi.encodeWithSignature("transfer(address,uint256)", msg.sender, totalClaimable)
        );
        require(success, "Presale: TRANSFER_FAILED");

        emit TokensClaimed(msg.sender, totalClaimable);
    }

    /**
     * @notice M-03: Emergency pause. Owner only.
     */
    function emergencyPause() external onlyOwner {
        paused = true;
        emit PresalePaused();
    }

    /**
     * @notice Unpause. Owner only.
     */
    function unpause() external onlyOwner {
        paused = false;
        emit PresaleUnpaused();
    }

    /**
     * @notice Calculate vested amount for a purchase.
     */
    function _calculateVestedAmount(Purchase storage purchase) internal view returns (uint256) {
        if (vestingMonths == 0) return purchase.tokens;

        uint256 tgeAmount = (purchase.tokens * tgeUnlock) / 10000;
        uint256 vestedAmount = tgeAmount;

        uint256 monthsElapsed = (block.timestamp - purchase.timestamp) / 30 days;
        if (monthsElapsed > vestingMonths) monthsElapsed = vestingMonths;

        uint256 remainingTokens = purchase.tokens - tgeAmount;
        vestedAmount += (remainingTokens * monthsElapsed) / vestingMonths;

        return vestedAmount;
    }

    /**
     * @notice Get claimable amount for a user.
     */
    function getClaimableAmount(address user) external view returns (uint256) {
        uint256 total = 0;
        Purchase[] storage userPurchases = purchases[user];
        for (uint256 i = 0; i < userPurchases.length; i++) {
            if (!userPurchases[i].claimed) {
                total += _calculateVestedAmount(userPurchases[i]);
            }
        }
        return total;
    }

    receive() external payable {}
}
