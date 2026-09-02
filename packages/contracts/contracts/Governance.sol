// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Governance
 * @notice On-chain governance for Dot Protocol — proposal creation, voting, execution.
 * @dev Deployed at:
 *   Chennai: 0xde455081D202269e8fD7B4b37bb85f1Fd81fF126
 *   Mainnet: 0x002fB3bAB0544880a8e23122dE6133Ff090eAc81
 */
contract Governance is AccessControl {
    IERC20 public governanceToken;

    enum ProposalState { Pending, Active, Succeeded, Defeated, Executed, Canceled }

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startBlock;
        uint256 endBlock;
        ProposalState state;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public voteChoice; // true = for
    uint256 public proposalCount;
    uint256 public votingPeriod = 7200; // ~24h at 2s blocks
    uint256 public quorumThreshold; // min total votes needed

    event ProposalCreated(uint256 indexed id, address proposer, string description);
    event VoteCast(uint256 indexed id, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed id);

    constructor(address _token, uint256 _quorum) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        governanceToken = IERC20(_token);
        quorumThreshold = _quorum;
    }

    /**
     * @notice Create a new governance proposal.
     */
    function propose(string calldata description) external returns (uint256) {
        require(governanceToken.balanceOf(msg.sender) > 0, "Gov: NO_TOKENS");
        uint256 id = proposalCount++;
        proposals[id] = Proposal({
            id: id,
            proposer: msg.sender,
            description: description,
            forVotes: 0,
            againstVotes: 0,
            startBlock: block.number + 1,
            endBlock: block.number + 1 + votingPeriod,
            state: ProposalState.Pending,
            executed: false
        });
        emit ProposalCreated(id, msg.sender, description);
        return id;
    }

    /**
     * @notice Cast a vote on a proposal.
     * @param support True = for, false = against
     */
    function castVote(uint256 proposalId, bool support) external {
        Proposal storage p = proposals[proposalId];
        require(block.number >= p.startBlock && block.number <= p.endBlock, "Gov: NOT_VOTING");
        require(!hasVoted[proposalId][msg.sender], "Gov: ALREADY_VOTED");

        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "Gov: NO_VOTE_WEIGHT");

        hasVoted[proposalId][msg.sender] = true;
        voteChoice[proposalId][msg.sender] = support;

        if (support) {
            p.forVotes += weight;
        } else {
            p.againstVotes += weight;
        }

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    /**
     * @notice Finalize a proposal after voting ends.
     */
    function finalize(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(block.number > p.endBlock, "Gov: VOTING_NOT_ENDED");
        require(p.state == ProposalState.Pending, "Gov: ALREADY_FINALIZED");

        if (p.forVotes > p.againstVotes && (p.forVotes + p.againstVotes) >= quorumThreshold) {
            p.state = ProposalState.Succeeded;
        } else {
            p.state = ProposalState.Defeated;
        }
    }

    /**
     * @notice Execute a succeeded proposal (admin only for now).
     */
    function execute(uint256 proposalId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Proposal storage p = proposals[proposalId];
        require(p.state == ProposalState.Succeeded, "Gov: NOT_SUCCEEDED");
        require(!p.executed, "Gov: ALREADY_EXECUTED");

        p.executed = true;
        p.state = ProposalState.Executed;
        emit ProposalExecuted(proposalId);
    }

    function getProposal(uint256 id) external view returns (Proposal memory) {
        return proposals[id];
    }

    function getVotes(uint256 proposalId) external view returns (uint256 forVotes, uint256 againstVotes) {
        Proposal storage p = proposals[proposalId];
        return (p.forVotes, p.againstVotes);
    }
}
