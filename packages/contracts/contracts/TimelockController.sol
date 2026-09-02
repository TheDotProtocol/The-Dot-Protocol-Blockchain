// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TimelockController
 * @notice Adds time-delayed execution to critical DPC20 operations.
 * @dev Operations: rebase, mint, pause, unpause. Each requires a proposal,
 *      approval by required signers, and a delay before execution.
 */
contract TimelockController is AccessControl {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    uint256 public constant MIN_DELAY = 1 hours;
    uint256 public constant MAX_DELAY = 72 hours;

    enum OperationState { Unset, Pending, Ready, Done }

    struct Operation {
        address target;
        bytes callData;
        uint256 delay;
        uint256 eta;          // earliest execution time
        uint256 approvals;
        uint256 requiredApprovals;
        bool executed;
        mapping(address => bool) hasApproved;
    }

    mapping(bytes32 => Operation) public operations;
    uint256 public requiredApprovals;

    event OperationScheduled(bytes32 indexed opHash, address target, bytes callData, uint256 delay, uint256 eta);
    event OperationApproved(bytes32 indexed opHash, address indexed approver);
    event OperationExecuted(bytes32 indexed opHash);
    event OperationCancelled(bytes32 indexed opHash);

    modifier onlyProposer() {
        require(hasRole(PROPOSER_ROLE, msg.sender), "Timelock: NOT_PROPOSER");
        _;
    }

    modifier onlyExecutor() {
        require(hasRole(EXECUTOR_ROLE, msg.sender), "Timelock: NOT_EXECUTOR");
        _;
    }

    constructor(
        address admin,
        address[] memory proposers,
        address[] memory executors,
        uint256 _requiredApprovals
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        for (uint256 i = 0; i < proposers.length; i++) {
            _grantRole(PROPOSER_ROLE, proposers[i]);
        }
        for (uint256 i = 0; i < executors.length; i++) {
            _grantRole(EXECUTOR_ROLE, executors[i]);
        }
        requiredApprovals = _requiredApprovals;
    }

    /**
     * @notice Schedule a timelocked operation.
     */
    function schedule(
        address target,
        bytes calldata callData,
        uint256 delay
    ) external onlyProposer returns (bytes32 opHash) {
        require(delay >= MIN_DELAY && delay <= MAX_DELAY, "Timelock: INVALID_DELAY");
        opHash = keccak256(abi.encode(target, callData, block.timestamp));
        require(operations[opHash].eta == 0, "Timelock: ALREADY_SCHEDULED");

        Operation storage op = operations[opHash];
        op.target = target;
        op.callData = callData;
        op.delay = delay;
        op.eta = block.timestamp + delay;
        op.requiredApprovals = requiredApprovals;

        emit OperationScheduled(opHash, target, callData, delay, op.eta);
    }

    /**
     * @notice Approve a scheduled operation.
     */
    function approve(bytes32 opHash) external onlyProposer {
        Operation storage op = operations[opHash];
        require(op.eta > 0, "Timelock: NOT_SCHEDULED");
        require(!op.executed, "Timelock: ALREADY_EXECUTED");
        require(!op.hasApproved[msg.sender], "Timelock: ALREADY_APPROVED");
        require(block.timestamp >= op.eta, "Timelock: NOT_READY");

        op.hasApproved[msg.sender] = true;
        op.approvals++;

        emit OperationApproved(opHash, msg.sender);
    }

    /**
     * @notice Execute a scheduled operation after enough approvals and delay.
     */
    function execute(bytes32 opHash) external onlyExecutor {
        Operation storage op = operations[opHash];
        require(op.eta > 0, "Timelock: NOT_SCHEDULED");
        require(!op.executed, "Timelock: ALREADY_EXECUTED");
        require(block.timestamp >= op.eta, "Timelock: NOT_READY");
        require(op.approvals >= op.requiredApprovals, "Timelock: INSUFFICIENT_APPROVALS");

        op.executed = true;

        (bool success, ) = op.target.call(op.callData);
        require(success, "Timelock: EXECUTION_FAILED");

        emit OperationExecuted(opHash);
    }

    /**
     * @notice Cancel a scheduled operation (admin only).
     */
    function cancel(bytes32 opHash) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Operation storage op = operations[opHash];
        require(op.eta > 0, "Timelock: NOT_SCHEDULED");
        require(!op.executed, "Timelock: ALREADY_EXECUTED");

        delete operations[opHash];
        emit OperationCancelled(opHash);
    }

    /**
     * @notice Get operation state.
     */
    function getOperationState(bytes32 opHash) external view returns (OperationState) {
        Operation storage op = operations[opHash];
        if (op.eta == 0) return OperationState.Unset;
        if (op.executed) return OperationState.Done;
        if (block.timestamp >= op.eta) return OperationState.Ready;
        return OperationState.Pending;
    }
}
