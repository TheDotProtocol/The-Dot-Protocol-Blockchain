// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HexchangePresale
 * @notice 3-phase presale (Early Bird / Seed / Public) with 20% TGE + 6-month linear vesting.
 * @dev Deployed at:
 *   Chennai: 0x44Ca97cC50ae80Dcc513faDbFfda6e4C637692eA
 *   Mainnet: 0xd28f1f5eb7B605670eE295F00Ae512484e7D37a4
 */
contract HexchangePresale is Ownable {
    using SafeERC20 for IERC20;
    IERC20 public token;
    IERC20 public paymentToken; // stablecoin for buyWithStablecoin

    enum Phase { NotStarted, EarlyBird, Seed, Public, Ended }

    Phase public currentPhase;
    uint256 public totalSold;
    uint256 public totalRaised;

    // Phase configs
    uint256 public earlyBirdPrice;
    uint256 public seedPrice;
    uint256 public publicPrice;
    uint256 public minBuy;
    uint256 public maxBuy;
    uint256 public hardCap;

    // Phase timing
    uint256 public earlyBirdStart;
    uint256 public earlyBirdEnd;
    uint256 public seedStart;
    uint256 public seedEnd;
    uint256 public publicStart;
    uint256 public publicEnd;

    // Vesting: 20% at TGE, rest over 6 months
    uint256 public constant TGE_PERCENT = 20;
    uint256 public constant VESTING_PERIOD = 180 days;

    struct Purchase {
        uint256 id;
        address buyer;
        uint256 amount;      // tokens purchased
        uint256 paid;        // ETH or stablecoin amount paid
        uint256 phase;
        uint256 timestamp;
        uint256 claimed;
    }

    mapping(address => Purchase[]) public userPurchases;
    Purchase[] public allPurchases;

    event TokensPurchased(uint256 indexed purchaseId, address indexed buyer, uint256 amount, uint256 paid, uint8 phase);
    event TokensClaimed(address indexed buyer, uint256 amount);
    event PresaleStarted(uint8 phase);

    constructor(
        address _token,
        address _paymentToken,
        address _owner
    ) Ownable(_owner) {
        token = IERC20(_token);
        paymentToken = IERC20(_paymentToken);
        currentPhase = Phase.NotStarted;
    }

    function configurePhases(
        uint256 _earlyBirdPrice,
        uint256 _seedPrice,
        uint256 _publicPrice,
        uint256 _minBuy,
        uint256 _maxBuy,
        uint256 _hardCap,
        uint256 _earlyBirdStart,
        uint256 _earlyBirdEnd,
        uint256 _seedStart,
        uint256 _seedEnd,
        uint256 _publicStart,
        uint256 _publicEnd,
        uint256 _tgePercent,
        uint256 _vestingMonths
    ) external onlyOwner {
        earlyBirdPrice = _earlyBirdPrice;
        seedPrice = _seedPrice;
        publicPrice = _publicPrice;
        minBuy = _minBuy;
        maxBuy = _maxBuy;
        hardCap = _hardCap;
        earlyBirdStart = _earlyBirdStart;
        earlyBirdEnd = _earlyBirdEnd;
        seedStart = _seedStart;
        seedEnd = _seedEnd;
        publicStart = _publicStart;
        publicEnd = _publicEnd;
    }

    function startPresale() external onlyOwner {
        require(currentPhase == Phase.NotStarted, "Presale: ALREADY_STARTED");
        currentPhase = Phase.EarlyBird;
        emit PresaleStarted(1);
    }

    /**
     * @notice Buy with ETH (native currency).
     */
    function buyWithETH() external payable {
        require(msg.value > 0, "Presale: NO_VALUE");
        _processBuy(msg.value, true);
    }

    /**
     * @notice Buy with stablecoin (ERC20).
     */
    function buyWithStablecoin(uint256 amount) external {
        require(amount > 0, "Presale: ZERO_AMOUNT");
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        _processBuy(amount, false);
    }

    /**
     * @notice Claim vested tokens for a specific purchase.
     */
    function claimTokens(uint256 purchaseId) external {
        Purchase storage p = userPurchases[msg.sender][purchaseId];
        require(p.buyer == msg.sender, "Presale: NOT_YOUR_PURCHASE");
        require(p.claimed < p.amount, "Presale: FULLY_CLAIMED");

        uint256 claimable = getClaimableAmount(purchaseId);
        require(claimable > 0, "Presale: NOTHING_CLAIMABLE");

        p.claimed += claimable;
        token.safeTransfer(msg.sender, claimable);
        emit TokensClaimed(msg.sender, claimable);
    }

    /**
     * @notice Calculate claimable tokens for a purchase.
     * 20% TGE + linear vesting over 6 months.
     */
    function getClaimableAmount(uint256 purchaseId) public view returns (uint256) {
        Purchase storage p = userPurchases[msg.sender][purchaseId];
        if (p.amount == 0) return 0;

        uint256 tgeAmount = (p.amount * TGE_PERCENT) / 100;
        uint256 vestingAmount = p.amount - tgeAmount;

        // TGE portion
        uint256 totalClaimable = p.claimed < tgeAmount ? tgeAmount : 0;

        // Linear vesting after TGE
        if (block.timestamp > p.timestamp + 30 days) { // TGE is 30 days after purchase
            uint256 vestingStart = p.timestamp + 30 days;
            uint256 elapsed = block.timestamp - vestingStart;
            if (elapsed > VESTING_PERIOD) elapsed = VESTING_PERIOD;
            uint256 vested = (vestingAmount * elapsed) / VESTING_PERIOD;
            totalClaimable += vested;
        } else {
            totalClaimable = tgeAmount;
        }

        if (totalClaimable > p.claimed) {
            return totalClaimable - p.claimed;
        }
        return 0;
    }

    function getUserPurchases(address user) external view returns (uint256[] memory) {
        Purchase[] storage purchases = userPurchases[user];
        uint256[] memory ids = new uint256[](purchases.length);
        for (uint256 i = 0; i < purchases.length; i++) {
            ids[i] = purchases[i].id;
        }
        return ids;
    }

    function currentPhasePrice() public view returns (uint256) {
        if (currentPhase == Phase.EarlyBird) return earlyBirdPrice;
        if (currentPhase == Phase.Seed) return seedPrice;
        if (currentPhase == Phase.Public) return publicPrice;
        return 0;
    }

    function getPhaseTimeLeft() external view returns (uint256) {
        if (currentPhase == Phase.EarlyBird) return earlyBirdEnd > block.timestamp ? earlyBirdEnd - block.timestamp : 0;
        if (currentPhase == Phase.Seed) return seedEnd > block.timestamp ? seedEnd - block.timestamp : 0;
        if (currentPhase == Phase.Public) return publicEnd > block.timestamp ? publicEnd - block.timestamp : 0;
        return 0;
    }

    // --- Internal ---
    function _processBuy(uint256 paymentAmount, bool isETH) internal {
        require(currentPhase != Phase.NotStarted && currentPhase != Phase.Ended, "Presale: NOT_ACTIVE");
        _requireInPhase();
        require(totalRaised + paymentAmount <= hardCap, "Presale: HARD_CAP_REACHED");

        uint256 price = currentPhasePrice();
        uint256 tokenAmount = (paymentAmount * 1e18) / price;
        require(tokenAmount >= minBuy && tokenAmount <= maxBuy, "Presale: OUT_OF_RANGE");

        totalSold += tokenAmount;
        totalRaised += paymentAmount;

        Purchase memory p = Purchase({
            id: allPurchases.length,
            buyer: msg.sender,
            amount: tokenAmount,
            paid: paymentAmount,
            phase: uint8(currentPhase),
            timestamp: block.timestamp,
            claimed: 0
        });
        allPurchases.push(p);
        userPurchases[msg.sender].push(p);

        emit TokensPurchased(p.id, msg.sender, tokenAmount, paymentAmount, uint8(currentPhase));
    }

    function _requireInPhase() internal view {
        if (currentPhase == Phase.EarlyBird) {
            require(block.timestamp >= earlyBirdStart && block.timestamp <= earlyBirdEnd, "Presale: NOT_IN_PHASE");
        } else if (currentPhase == Phase.Seed) {
            require(block.timestamp >= seedStart && block.timestamp <= seedEnd, "Presale: NOT_IN_PHASE");
        } else if (currentPhase == Phase.Public) {
            require(block.timestamp >= publicStart && block.timestamp <= publicEnd, "Presale: NOT_IN_PHASE");
        }
    }

    receive() external payable {}
}
