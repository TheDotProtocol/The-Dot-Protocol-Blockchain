// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Governance
 * @notice On-chain governance with quorum requirements and voting periods.
 * @dev Security fixes:
 *   - M-02: Removed admin execute override — requires quorum votes
 *   - Added voting period enforcement
 *   - Added quorum threshold (configurable)
 */
contract Governance is AccessControl {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");

    enum ProposalState { Pending, Active, Passed, Rejected, Executed, Cancelled }

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        bytes callData;
        address target;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startBlock;
        uint256 endBlock;
        uint256 quorumRequired;   // minimum votes needed
        ProposalState state;
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public votingPower;
    uint256 public proposalCount;
    uint256 public votingPeriod;      // blocks
    uint256 public quorumThreshold;   // minimum total votes

    event ProposalCreated(uint256 indexed id, address proposer, string description);
    event VoteCast(uint256 indexed id, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed id);
    event ProposalCancelled(uint256 indexed id);

    constructor(uint256 _votingPeriod, uint256 _quorumThreshold) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        votingPeriod = _votingPeriod;
        quorumThreshold = _quorumThreshold;
    }

    /**
     * @notice Create a new proposal. PROPOSER_ROLE only.
     */
    function propose(
        address target,
        bytes calldata callData,
        string calldata description
    ) external onlyRole(PROPOSER_ROLE) returns (uint256) {
        proposalCount++;
        Proposal storage p = proposals[proposalCount];
        p.id = proposalCount;
        p.proposer = msg.sender;
        p.description = description;
        p.callData = callData;
        p.target = target;
        p.startBlock = block.number;
        p.endBlock = block.number + votingPeriod;
        p.quorumRequired = quorumThreshold;
        p.state = ProposalState.Active;

        emit ProposalCreated(proposalCount, msg.sender, description);
        return proposalCount;
    }

    /**
     * @notice Cast a vote on a proposal. VOTER_ROLE only.
     */
    function castVote(uint256 proposalId, bool support) external onlyRole(VOTER_ROLE) {
        Proposal storage p = proposals[proposalId];
        require(p.state == ProposalState.Active, "Governance: NOT_ACTIVE");
        require(block.number <= p.endBlock, "Governance: VOTING_ENDED");
        require(!p.hasVoted[msg.sender], "Governance: ALREADY_VOTED");

        uint256 weight = votingPower[msg.sender];
        require(weight > 0, "Governance: NO_VOTING_POWER");

        p.hasVoted[msg.sender] = true;

        if (support) {
            p.forVotes += weight;
        } else {
            p.againstVotes += weight;
        }

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    /**
     * @notice Execute a proposal after voting period ends and quorum is reached.
     * @dev M-02 FIX: No admin override — requires actual votes.
     */
    function execute(uint256 proposalId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Proposal storage p = proposals[proposalId];
        require(p.state == ProposalState.Active, "Governance: NOT_ACTIVE");
        require(block.number > p.endBlock, "Governance: VOTING_NOT_ENDED");

        uint256 totalVotes = p.forVotes + p.againstVotes;
        require(totalVotes >= p.quorumRequired, "Governance: QUORUM_NOT_REACHED");
        require(p.forVotes > p.againstVotes, "Governance: NOT_PASSED");

        p.state = ProposalState.Executed;

        (bool success, ) = p.target.call(p.callData);
        require(success, "Governance: EXECUTION_FAILED");

        emit ProposalExecuted(proposalId);
    }

    /**
     * @notice Cancel a proposal. Admin only.
     */
    function cancel(uint256 proposalId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Proposal storage p = proposals[proposalId];
        require(p.state == ProposalState.Active, "Governance: NOT_ACTIVE");
        p.state = ProposalState.Cancelled;
        emit ProposalCancelled(proposalId);
    }

    /**
     * @notice Set voting power for an address. Admin only.
     */
    function setVotingPower(address voter, uint256 power) external onlyRole(DEFAULT_ADMIN_ROLE) {
        votingPower[voter] = power;
    }

    /**
     * @notice Get proposal state.
     */
    function getProposalState(uint256 proposalId) external view returns (ProposalState) {
        return proposals[proposalId].state;
    }
}
