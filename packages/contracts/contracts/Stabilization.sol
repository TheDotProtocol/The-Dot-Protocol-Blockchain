// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IMintable {
    function mint(address to, uint256 amount) external;
    function burnFrom(address from, uint256 amount) external;
}

/**
 * @title Stabilization
 * @notice Collateral vault and price stabilization for DPC20.
 * @dev Deployed at:
 *   Chennai: 0x436A576D59f7C38BC804ED29251601Eb176f8667
 *   Mainnet: 0x2000fd82FEC13e6F7af9B2CA5762374E13bfa552
 */
contract Stabilization is AccessControl {
    using SafeERC20 for IERC20;
    IERC20 public collateralToken;   // accepted collateral (e.g., USDT)
    IERC20 public targetToken;       // DPC20 being stabilized

    uint256 public targetPrice;      // target price in collateral (18 decimals)
    uint256 public collateralRatio;  // basis points (e.g., 15000 = 150%)
    uint256 public totalCollateral;
    uint256 public totalStaked;

    struct Position {
        uint256 collateral;
        uint256 debt;            // DPC20 borrowed against collateral
        uint256 createdAt;
    }

    mapping(address => Position) public positions;
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    event CollateralDeposited(address indexed user, uint256 amount);
    event DebtIssued(address indexed user, uint256 amount);
    event DebtRepaid(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event Liquidated(address indexed user, uint256 collateralSeized, uint256 debtRepaid);

    constructor(address _collateral, address _target, uint256 _targetPrice, uint256 _collateralRatio) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        collateralToken = IERC20(_collateral);
        targetToken = IERC20(_target);
        targetPrice = _targetPrice;
        collateralRatio = _collateralRatio;
    }

    /**
     * @notice Deposit collateral.
     */
    function depositCollateral(uint256 amount) external {
        require(amount > 0, "Stab: ZERO_AMOUNT");
        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        positions[msg.sender].collateral += amount;
        totalCollateral += amount;
        emit CollateralDeposited(msg.sender, amount);
    }

    /**
     * @notice Borrow DPC20 against collateral.
     */
    function borrow(uint256 debtAmount) external {
        Position storage pos = positions[msg.sender];
        require(pos.collateral > 0, "Stab: NO_COLLATERAL");

        // Check collateralization ratio
        uint256 requiredCollateral = (debtAmount * targetPrice * collateralRatio) / (1e18 * 10000);
        require(pos.collateral >= requiredCollateral, "Stab: UNDERCOLLATERALIZED");

        pos.debt += debtAmount;
        totalStaked += debtAmount;
        IMintable(address(targetToken)).mint(msg.sender, debtAmount);
        emit DebtIssued(msg.sender, debtAmount);
    }

    /**
     * @notice Repay debt and reclaim collateral.
     */
    function repay(uint256 debtAmount) external {
        Position storage pos = positions[msg.sender];
        require(pos.debt > 0, "Stab: NO_DEBT");
        require(debtAmount <= pos.debt, "Stab: EXCESSIVE_REPAY");

        IMintable(address(targetToken)).burnFrom(msg.sender, debtAmount);
        pos.debt -= debtAmount;
        totalStaked -= debtAmount;
        emit DebtRepaid(msg.sender, debtAmount);
    }

    /**
     * @notice Withdraw collateral (only if position remains healthy).
     */
    function withdrawCollateral(uint256 amount) external {
        Position storage pos = positions[msg.sender];
        require(pos.collateral >= amount, "Stab: INSUFFICIENT_COLLATERAL");
        require(pos.collateral - amount == 0 || pos.debt == 0 || _isHealthy(
            pos.collateral - amount, pos.debt
        ), "Stab: WOULD_BE_UNDERCOLLATERALIZED");

        pos.collateral -= amount;
        totalCollateral -= amount;
        collateralToken.safeTransfer(msg.sender, amount);
        emit CollateralWithdrawn(msg.sender, amount);
    }

    /**
     * @notice Liquidate an undercollateralized position.
     */
    function liquidate(address user) external {
        Position storage pos = positions[user];
        require(pos.debt > 0, "Stab: NO_DEBT");
        require(!_isHealthy(pos.collateral, pos.debt), "Stab: POSITION_HEALTHY");

        uint256 debtRepaid = pos.debt;
        uint256 collateralSeized = pos.collateral;

        pos.collateral = 0;
        pos.debt = 0;
        totalCollateral -= collateralSeized;
        totalStaked -= debtRepaid;

        collateralToken.safeTransfer(msg.sender, collateralSeized);
        emit Liquidated(user, collateralSeized, debtRepaid);
    }

    function _isHealthy(uint256 collateral, uint256 debt) internal view returns (bool) {
        if (debt == 0) return true;
        uint256 collateralValue = (collateral * 1e18) / targetPrice;
        return (collateralValue * 10000) >= (debt * collateralRatio);
    }

    function getPosition(address user) external view returns (uint256 collateral, uint256 debt, bool healthy) {
        Position storage pos = positions[user];
        return (pos.collateral, pos.debt, _isHealthy(pos.collateral, pos.debt));
    }
}
