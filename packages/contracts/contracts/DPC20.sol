// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DPC20
 * @notice Dot Protocol native token — 1T supply cap, pause, rebase, role-based mint.
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

    // Mint log: reason string for transparency
    event Minted(address indexed to, uint256 amount, string reason);
    event Rebased(uint256 oldTotalSupply, uint256 newTotalSupply);
    event PausedState(bool isPaused);

    modifier whenNotPaused() {
        require(!paused, "DPC20: paused");
        _;
    }

    constructor() ERC20("Dot Protocol Coin", "3DOT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(REBASE_ROLE, msg.sender);
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
     * @dev Only callable by REBASE_ROLE. Cannot exceed MAX_SUPPLY.
     */
    function rebase(int256 delta) external onlyRole(REBASE_ROLE) whenNotPaused {
        uint256 oldSupply = totalSupply();
        if (delta > 0) {
            require(oldSupply + uint256(delta) <= MAX_SUPPLY, "DPC20: rebase exceeds max");
            _mint(address(this), uint256(delta));
        } else if (delta < 0) {
            uint256 burnAmount = uint256(-delta);
            require(burnAmount <= oldSupply, "DPC20: rebase below zero");
            _burn(address(this), burnAmount);
        }
        emit Rebased(oldSupply, totalSupply());
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        paused = true;
        emit PausedState(true);
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        paused = false;
        emit PausedState(false);
    }

    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
