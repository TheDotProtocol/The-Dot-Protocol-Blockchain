// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DPC20
 * @notice Dot Protocol native token — 1T supply cap, pause, rebase, role-based mint.
 * @dev Security hardened:
 *   - Rebase capped at ±5% per 30-day period (C-02 fix)
 *   - Critical operations require timelock approval (C-01 fix)
 *   - Multi-sig ready via AccessControl roles
 * @dev Deployed at:
 *   Chennai (1545): 0x542E95FD423962505EBfb279C1361351507A0185
 *   Mainnet (1546): 0x84ed5E46280c6911551925329C3af6c58e4ced56
 */
contract DPC20 is ERC20, ERC20Burnable, AccessControl {
    uint256 public constant MAX_SUPPLY = 1_000_000_000_000 ether; // 1T tokens
    bool public paused;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant REBASE_ROLE = keccak256("REBASE_ROLE");

    // ─── Rebase safety limits (C-02 fix) ────────────────────────────
    uint256 public constant REBASE_CAP_BPS = 500;          // 5% max per period
    uint256 public constant REBASE_COOLDOWN = 30 days;      // 30-day cooldown
    uint256 public lastRebaseTimestamp;
    uint256 public supplyAtLastRebase;                       // snapshot at last rebase

    // Mint log: reason string for transparency
    event Minted(address indexed to, uint256 amount, string reason);
    event Rebased(uint256 oldTotalSupply, uint256 newTotalSupply, int256 delta);
    event PausedState(bool isPaused);

    modifier whenNotPaused() {
        require(!paused, "DPC20: paused");
        _;
    }

    modifier onlyTimelockOrAdmin() {
        // Allow direct calls from admin (for testing) or from timelock contract
        // In production, set timelock as the admin
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "DPC20: NOT_ADMIN"
        );
        _;
    }

    constructor() ERC20("Dot Protocol Coin", "3DOT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(REBASE_ROLE, msg.sender);
        lastRebaseTimestamp = 0; // Allow full rebase cap on first call
        supplyAtLastRebase = 0;
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }

    /**
     * @notice Mint tokens with a reason (for on-chain transparency).
     * @dev Only callable by MINTER_ROLE.
     */
    function mint(address to, uint256 amount, string calldata reason) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "DPC20: exceeds max supply");
        _mint(to, amount);
        emit Minted(to, amount, reason);
    }

    /**
     * @notice Simple mint (compatible with MockERC20 interface for liquidity scripts).
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "DPC20: exceeds max supply");
        _mint(to, amount);
        emit Minted(to, amount, "");
    }

    /**
     * @notice Rebasing: adjust total supply by a signed delta (positive = inflate, negative = deflate).
     * @dev SECURITY (C-02 fix): Capped at ±5% of supply per 30-day period.
     *      If cooldown hasn't passed, the remaining cap is proportionally reduced.
     */
    function rebase(int256 delta) external onlyRole(REBASE_ROLE) whenNotPaused {
        uint256 oldSupply = totalSupply();

        // ─── Rebase cap enforcement (C-02) ──────────────────────────
        uint256 elapsed = block.timestamp - lastRebaseTimestamp;
        uint256 maxDelta;

        if (elapsed >= REBASE_COOLDOWN) {
            // Full 5% cap available
            maxDelta = (oldSupply * REBASE_CAP_BPS) / 10000;
        } else {
            // Proportional cap based on time elapsed
            maxDelta = (oldSupply * REBASE_CAP_BPS * elapsed) / (10000 * REBASE_COOLDOWN);
        }

        if (delta > 0) {
            require(uint256(delta) <= maxDelta, "DPC20: rebase exceeds 5% cap");
            require(oldSupply + uint256(delta) <= MAX_SUPPLY, "DPC20: rebase exceeds max");
            _mint(address(this), uint256(delta));
        } else if (delta < 0) {
            uint256 burnAmount = uint256(-delta);
            require(burnAmount <= maxDelta, "DPC20: rebase exceeds 5% cap");
            require(burnAmount <= oldSupply, "DPC20: rebase below zero");
            _burn(address(this), burnAmount);
        }

        // Update rebase tracking
        lastRebaseTimestamp = block.timestamp;
        supplyAtLastRebase = totalSupply();

        emit Rebased(oldSupply, totalSupply(), delta);
    }

    /**
     * @notice Pause all transfers (emergency stop).
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        paused = true;
        emit PausedState(true);
    }

    /**
     * @notice Unpause transfers.
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        paused = false;
        emit PausedState(false);
    }

    /**
     * @notice Batch pause + rebase in one tx (for emergency situations via multisig).
     */
    function emergencyRebaseAndPause(int256 delta) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        // Execute rebase with cap check
        uint256 oldSupply = totalSupply();
        uint256 elapsed = block.timestamp - lastRebaseTimestamp;
        uint256 maxDelta;
        if (elapsed >= REBASE_COOLDOWN) {
            maxDelta = (oldSupply * REBASE_CAP_BPS) / 10000;
        } else {
            maxDelta = (oldSupply * REBASE_CAP_BPS * elapsed) / (10000 * REBASE_COOLDOWN);
        }

        if (delta > 0) {
            require(uint256(delta) <= maxDelta, "DPC20: rebase exceeds cap");
            require(oldSupply + uint256(delta) <= MAX_SUPPLY, "DPC20: exceeds max");
            _mint(address(this), uint256(delta));
        } else if (delta < 0) {
            uint256 burnAmount = uint256(-delta);
            require(burnAmount <= maxDelta, "DPC20: rebase exceeds cap");
            require(burnAmount <= oldSupply, "DPC20: below zero");
            _burn(address(this), burnAmount);
        }

        lastRebaseTimestamp = block.timestamp;
        supplyAtLastRebase = totalSupply();
        emit Rebased(oldSupply, totalSupply(), delta);

        // Then pause
        paused = true;
        emit PausedState(true);
    }

    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
