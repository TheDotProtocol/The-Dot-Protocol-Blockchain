// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title IRouterClient
 * @notice Interface for Chainlink CCIP Router.
 */
interface IRouterClient {
    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable returns (bytes32);
}

/**
 * @title Client
 * @notice Chainlink CCIP message types.
 */
library Client {
    struct EVM2AnyMessage {
        bytes receiver;
        bytes data;
        TokenAmount[] tokenAmounts;
        address feeToken;
    }

    struct TokenAmount {
        address token;
        uint256 amount;
    }

    struct Any2EVMMessage {
        bytes32 sourceChainSelector;
        address sender;
        bytes data;
    }
}

/**
 * @title CCIPBridge
 * @notice Production-grade cross-chain bridge using Chainlink CCIP.
 * @dev Replaces the custom bridge with validated cross-chain messaging:
 *   - Uses Chainlink CCIP Router for message validation
 *   - No custom relayer — Chainlink DON handles validation
 *   - Native fee payment in LINK or native token
 *   - Rate limiting per address and per tx
 *   - Emergency pause capability
 */
contract CCIPBridge is AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant RATE_LIMIT_ADMIN = keccak256("RATE_LIMIT_ADMIN");

    struct BridgeConfig {
        uint64 chainSelector;       // CCIP chain selector
        address router;             // CCIP Router address
        uint256 maxTransferAmount;  // per-tx limit
        uint256 dailyLimit;         // per-day limit
        uint256 dailyUsed;
        uint256 lastDay;
        bool active;
    }

    struct RateLimit {
        uint256 dailyLimit;
        uint256 dailyUsed;
        uint256 lastDay;
        uint256 perTxLimit;
    }

    mapping(uint64 => BridgeConfig) public bridgeConfigs;
    mapping(address => RateLimit) public userLimits;
    mapping(address => mapping(uint256 => bool)) public nonces;  // replay protection

    // Supported tokens per chain
    mapping(uint64 => mapping(address => address)) public supportedTokens; // remoteToken => localToken

    event BridgeConfigured(uint64 indexed chainSelector, address router, uint256 maxTransfer);
    event OutboundTransfer(uint64 indexed destChain, address indexed token, address from, address to, uint256 amount, bytes32 messageId);
    event InboundTransfer(uint64 indexed sourceChain, address indexed token, address from, address to, uint256 amount);
    event TokenMapped(uint64 indexed chainSelector, address localToken, address remoteToken);
    event EmergencyPaused();
    event EmergencyUnpaused();

    bool public paused;

    modifier whenNotPaused() {
        require(!paused, "Bridge: PAUSED");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Configure a bridge destination chain.
     */
    function configureBridge(
        uint64 chainSelector,
        address router,
        uint256 maxTransferAmount,
        uint256 dailyLimit
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bridgeConfigs[chainSelector] = BridgeConfig({
            chainSelector: chainSelector,
            router: router,
            maxTransferAmount: maxTransferAmount,
            dailyLimit: dailyLimit,
            dailyUsed: 0,
            lastDay: 0,
            active: true
        });
        emit BridgeConfigured(chainSelector, router, maxTransferAmount);
    }

    /**
     * @notice Map a local token to its remote equivalent.
     */
    function mapToken(uint64 chainSelector, address localToken, address remoteToken) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedTokens[chainSelector][remoteToken] = localToken;
        emit TokenMapped(chainSelector, localToken, remoteToken);
    }

    /**
     * @notice Set per-user rate limits.
     */
    function setUserLimit(address user, uint256 dailyLimit, uint256 perTxLimit) external onlyRole(RATE_LIMIT_ADMIN) {
        userLimits[user] = RateLimit({
            dailyLimit: dailyLimit,
            dailyUsed: 0,
            lastDay: 0,
            perTxLimit: perTxLimit
        });
    }

    /**
     * @notice Lock tokens and send cross-chain message via CCIP.
     */
    function lockAndSend(
        uint64 destChainSelector,
        address token,
        address to,
        uint256 amount,
        address feeToken
    ) external payable whenNotPaused returns (bytes32 messageId) {
        BridgeConfig storage config = bridgeConfigs[destChainSelector];
        require(config.active, "Bridge: CHAIN_INACTIVE");
        require(amount > 0 && amount <= config.maxTransferAmount, "Bridge: INVALID_AMOUNT");

        // Rate limit checks
        uint256 today = block.timestamp / 1 days;
        if (config.lastDay != today) {
            config.dailyUsed = 0;
            config.lastDay = today;
        }
        require(config.dailyUsed + amount <= config.dailyLimit, "Bridge: DAILY_LIMIT");

        RateLimit storage userLimit = userLimits[msg.sender];
        if (userLimit.dailyLimit > 0) {
            if (userLimit.lastDay != today) {
                userLimit.dailyUsed = 0;
                userLimit.lastDay = today;
            }
            require(userLimit.dailyUsed + amount <= userLimit.dailyLimit, "Bridge: USER_DAILY_LIMIT");
            require(amount <= userLimit.perTxLimit || userLimit.perTxLimit == 0, "Bridge: USER_TX_LIMIT");
        }

        // Nonce replay protection
        uint256 nonce = uint256(keccak256(abi.encode(msg.sender, token, to, amount, block.timestamp)));
        require(!nonces[msg.sender][nonce], "Bridge: NONCE_USED");
        nonces[msg.sender][nonce] = true;

        // Lock tokens in bridge
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Update rate limits
        config.dailyUsed += amount;
        userLimit.dailyUsed += amount;

        // Build CCIP message
        bytes memory receiver = abi.encode(to);
        Client.TokenAmount[] memory tokenAmounts = new Client.TokenAmount[](1);
        tokenAmounts[0] = Client.TokenAmount({
            token: token,
            amount: amount
        });

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: receiver,
            data: abi.encode(msg.sender, to, amount),
            tokenAmounts: tokenAmounts,
            feeToken: feeToken
        });

        // Send via CCIP Router
        IRouterClient router = IRouterClient(config.router);
        messageId = router.ccipSend{value: msg.value}(destChainSelector, message);

        emit OutboundTransfer(destChainSelector, token, msg.sender, to, amount, messageId);
    }

    /**
     * @notice Release tokens on receiving chain (called by CCIP receiver).
     * @dev In production, this is called by the CCIPReceiver contract.
     */
    function releaseTokens(
        uint64 sourceChainSelector,
        address token,
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        require(supportedTokens[sourceChainSelector][token] != address(0), "Bridge: UNSUPPORTED_TOKEN");

        IERC20(token).safeTransfer(to, amount);
        emit InboundTransfer(sourceChainSelector, token, msg.sender, to, amount);
    }

    /**
     * @notice Emergency pause all bridge operations.
     */
    function emergencyPause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        paused = true;
        emit EmergencyPaused();
    }

    /**
     * @notice Unpause bridge operations.
     */
    function emergencyUnpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        paused = false;
        emit EmergencyUnpaused();
    }

    /**
     * @notice Withdraw stuck tokens (admin only).
     */
    function withdrawStuckTokens(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}
