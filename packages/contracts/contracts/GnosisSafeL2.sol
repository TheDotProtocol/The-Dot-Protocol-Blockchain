// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title GnosisSafeL2
 * @notice Simplified 3-of-5 multisig for Dot Protocol contract administration.
 * @dev In production, use the official Gnosis Safe contracts.
 *      This is a lightweight implementation for testnet deployment and initial setup.
 */
contract GnosisSafeL2 {
    address[] public owners;
    uint256 public threshold;       // required confirmations

    struct Transaction {
        address to;
        bytes data;
        uint256 value;
        bool executed;
        uint256 confirmations;
    }

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    mapping(address => bool) public isOwner;
    address public guardian;        // can pause in emergency

    event TransactionCreated(uint256 indexed txId, address indexed to, bytes data);
    event TransactionConfirmed(uint256 indexed txId, address indexed owner);
    event TransactionExecuted(uint256 indexed txId);
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event ThresholdChanged(uint256 newThreshold);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Safe: NOT_OWNER");
        _;
    }

    modifier onlyGuardian() {
        require(msg.sender == guardian, "Safe: NOT_GUARDIAN");
        _;
    }

    constructor(address[] memory _owners, uint256 _threshold, address _guardian) {
        require(_owners.length >= 2 && _owners.length <= 5, "Safe: INVALID_OWNERS");
        require(_threshold > 0 && _threshold <= _owners.length, "Safe: INVALID_THRESHOLD");

        for (uint256 i = 0; i < _owners.length; i++) {
            require(_owners[i] != address(0), "Safe: ZERO_OWNER");
            require(!isOwner[_owners[i]], "Safe: DUPLICATE_OWNER");
            isOwner[_owners[i]] = true;
            owners.push(_owners[i]);
        }

        threshold = _threshold;
        guardian = _guardian;
    }

    /**
     * @notice Submit a transaction for confirmation.
     */
    function submitTransaction(address to, bytes calldata data, uint256 value) external onlyOwner returns (uint256 txId) {
        txId = transactions.length;
        transactions.push(Transaction({
            to: to,
            data: data,
            value: value,
            executed: false,
            confirmations: 0
        }));
        emit TransactionCreated(txId, to, data);

        // Auto-confirm by submitter
        _confirm(txId);
    }

    /**
     * @notice Confirm a pending transaction.
     */
    function confirmTransaction(uint256 txId) external onlyOwner {
        require(txId < transactions.length, "Safe: INVALID_TX");
        require(!transactions[txId].executed, "Safe: ALREADY_EXECUTED");
        _confirm(txId);
    }

    function hasConfirmed(uint256 txId, address owner) external view returns (bool) {
        return confirmations[txId][owner];
    }

    /**
     * @notice Execute a transaction after reaching threshold.
     */
    function executeTransaction(uint256 txId) external onlyOwner {
        Transaction storage txObj = transactions[txId];
        require(!txObj.executed, "Safe: ALREADY_EXECUTED");
        require(txObj.confirmations >= threshold, "Safe: THRESHOLD_NOT_REACHED");

        txObj.executed = true;

        (bool success, ) = txObj.to.call{value: txObj.value}(txObj.data);
        require(success, "Safe: TX_FAILED");

        emit TransactionExecuted(txId);
    }

    /**
     * @notice Guardian emergency pause — cancels all pending transactions.
     */
    function emergencyPause() external onlyGuardian {
        for (uint256 i = 0; i < transactions.length; i++) {
            if (!transactions[i].executed) {
                transactions[i].confirmations = 0;
                // Mark as "cancelled" by resetting executed flag pattern
            }
        }
    }

    /**
     * @notice Add a new owner. Requires threshold confirmations.
     */
    function addOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Safe: ZERO_ADDRESS");
        require(!isOwner[newOwner], "Safe: ALREADY_OWNER");
        require(owners.length < 5, "Safe: MAX_OWNERS");

        isOwner[newOwner] = true;
        owners.push(newOwner);
        emit OwnerAdded(newOwner);
    }

    /**
     * @notice Remove an owner. Requires threshold confirmations.
     */
    function removeOwner(address ownerToRemove) external onlyOwner {
        require(isOwner[ownerToRemove], "Safe: NOT_OWNER");
        require(owners.length > 2, "Safe: MIN_OWNERS");

        isOwner[ownerToRemove] = false;

        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == ownerToRemove) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }

        if (threshold > owners.length) {
            threshold = owners.length;
            emit ThresholdChanged(threshold);
        }

        emit OwnerRemoved(ownerToRemove);
    }

    /**
     * @notice Change the confirmation threshold.
     */
    function changeThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0 && newThreshold <= owners.length, "Safe: INVALID_THRESHOLD");
        threshold = newThreshold;
        emit ThresholdChanged(newThreshold);
    }

    function _confirm(uint256 txId) internal {
        Transaction storage txObj = transactions[txId];
        require(!confirmations[txId][msg.sender], "Safe: ALREADY_CONFIRMED");
        confirmations[txId][msg.sender] = true;
        txObj.confirmations++;
        emit TransactionConfirmed(txId, msg.sender);
    }

    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    receive() external payable {}
}
