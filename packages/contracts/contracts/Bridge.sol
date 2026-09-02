// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface IMintableERC20 is IERC20 {
    function mint(address to, uint256 amount) external;
}

/**
 * @title Bridge
 * @notice Cross-chain lock/mint bridge for Dot Protocol tokens.
 * @dev Deployed at:
 *   Chennai: 0xd28f1f5eb7B605670eE295F00Ae512484e7D37a4
 *   Mainnet: 0xe90813974118D9A582A011ab8fDFda57acD2AE13
 */
contract Bridge is AccessControl {
    using SafeERC20 for IERC20;

    struct BridgeMessage {
        uint256 nonce;
        address sender;
        address token;
        uint256 amount;
        uint256 sourceChainId;
        uint256 targetChainId;
    }

    mapping(uint256 => bool) public processedNonces; // sourceChainId => nonce
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256) public chainId;
    uint256 public totalLocked;
    uint256 public totalMinted;

    address[] public validators;
    uint256 public requiredSignatures;

    bytes32 public constant BRIDGE_PREFIX = keccak256("DotProtocolBridge");

    event TokensLocked(uint256 indexed nonce, address indexed sender, address token, uint256 amount, uint256 targetChain);
    event TokensMinted(uint256 indexed nonce, address indexed recipient, address token, uint256 amount, uint256 sourceChain);
    event TokensUnlocked(uint256 indexed nonce, address indexed recipient, address token, uint256 amount);

    constructor(uint256 _requiredSignatures) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        requiredSignatures = _requiredSignatures;
    }

    /**
     * @notice Lock tokens on source chain (bridge out).
     */
    function lockTokens(
        address token,
        uint256 amount,
        uint256 targetChainId
    ) external {
        require(supportedTokens[token], "Bridge: UNSUPPORTED_TOKEN");
        require(amount > 0, "Bridge: ZERO_AMOUNT");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        totalLocked += amount;

        uint256 nonce = totalLocked; // simple nonce from lock count

        emit TokensLocked(nonce, msg.sender, token, amount, targetChainId);
    }

    /**
     * @notice Mint tokens on destination chain (bridge in).
     * @dev Requires MINTER_ROLE (typically the bridge relayer).
     */
    function mintTokens(
        uint256 nonce,
        address recipient,
        address token,
        uint256 amount,
        uint256 sourceChainId,
        bytes calldata /* signatures */ // simplified: in production, verify multisig
    ) external onlyRole(MINTER_ROLE) {
        require(!processedNonces[sourceChainId * 1000000 + nonce], "Bridge: ALREADY_PROCESSED");
        require(supportedTokens[token], "Bridge: UNSUPPORTED_TOKEN");
        require(amount > 0, "Bridge: ZERO_AMOUNT");

        processedNonces[sourceChainId * 1000000 + nonce] = true;
        totalMinted += amount;

        // In production: verify signatures from validators
        // For now, trusted relayer can mint
        IMintableERC20(token).mint(recipient, amount);

        emit TokensMinted(nonce, recipient, token, amount, sourceChainId);
    }

    /**
     * @notice Unlock tokens on source chain (after failed bridge).
     */
    function unlockTokens(
        uint256 nonce,
        address recipient,
        address token,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        totalLocked -= amount;
        IERC20(token).safeTransfer(recipient, amount);
        emit TokensUnlocked(nonce, recipient, token, amount);
    }

    function addSupportedToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedTokens[token] = false;
    }

    function addValidator(address validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        validators.push(validator);
    }

    function getValidators() external view returns (address[] memory) {
        return validators;
    }

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
}
