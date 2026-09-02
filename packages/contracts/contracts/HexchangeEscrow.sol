// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title HexchangeEscrow
 * @notice P2P escrow for peer-to-peer trading with dispute resolution and ratings.
 * @dev Deployed at:
 *   Chennai: 0xeA86701A2D46316D6BE3b031Ad719Ee0d9bbc04C
 *   Mainnet: 0xde455081D202269e8fD7B4b37bb85f1Fd81fF126
 */
contract HexchangeEscrow {
    using SafeERC20 for IERC20;

    enum OrderState { Created, Funded, PaymentSent, Completed, Disputed, Cancelled, Refunded }

    struct Order {
        uint256 id;
        address seller;
        address buyer;
        address token;
        uint256 amount;
        uint256 price;       // price per token in payment currency
        uint256 deposited;   // amount seller deposited
        OrderState state;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Rating {
        uint256 total;
        uint256 count;
    }

    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public userOrders;
    mapping(address => Rating) public ratings;
    uint256 public nextOrderId;
    address public admin;
    uint256 public feeBps; // fee in basis points (e.g. 50 = 0.5%)

    event OrderCreated(uint256 indexed orderId, address indexed seller, address token, uint256 amount, uint256 price);
    event OrderFunded(uint256 indexed orderId);
    event PaymentSent(uint256 indexed orderId, address indexed buyer);
    event OrderCompleted(uint256 indexed orderId, address indexed seller, address indexed buyer, uint256 amount);
    event OrderCancelled(uint256 indexed orderId);
    event DisputeRaised(uint256 indexed orderId, address indexed raisedBy);
    event DisputeResolved(uint256 indexed orderId, bool releasedToSeller);
    event UserRated(address indexed user, uint256 score);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Escrow: NOT_ADMIN");
        _;
    }

    constructor(address _admin, uint256 _feeBps) {
        admin = _admin;
        feeBps = _feeBps;
    }

    /**
     * @notice Seller creates an order and deposits tokens into escrow.
     */
    function createOrder(
        address token,
        uint256 amount,
        uint256 price
    ) external returns (uint256 orderId) {
        require(amount > 0 && price > 0, "Escrow: INVALID_AMOUNT");

        orderId = nextOrderId++;
        orders[orderId] = Order({
            id: orderId,
            seller: msg.sender,
            buyer: address(0),
            token: token,
            amount: amount,
            price: price,
            deposited: 0,
            state: OrderState.Created,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        userOrders[msg.sender].push(orderId);

        emit OrderCreated(orderId, msg.sender, token, amount, price);
    }

    /**
     * @notice Seller deposits tokens to fund the escrow order.
     */
    function fundOrder(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.seller == msg.sender, "Escrow: NOT_SELLER");
        require(order.state == OrderState.Created, "Escrow: INVALID_STATE");

        IERC20(order.token).safeTransferFrom(msg.sender, address(this), order.amount);
        order.deposited = order.amount;
        order.state = OrderState.Funded;
        order.updatedAt = block.timestamp;

        emit OrderFunded(orderId);
    }

    /**
     * @notice Buyer accepts and sends off-chain payment. Seller must confirm.
     */
    function acceptAndPay(uint256 orderId) external payable {
        Order storage order = orders[orderId];
        require(order.state == OrderState.Funded, "Escrow: NOT_FUNDED");
        require(msg.sender != order.seller, "Escrow: SELLER_CANNOT_BUY");
        require(msg.value > 0, "Escrow: NO_PAYMENT");

        order.buyer = msg.sender;
        order.state = OrderState.PaymentSent;
        order.updatedAt = block.timestamp;

        emit PaymentSent(orderId, msg.sender);
    }

    /**
     * @notice Seller confirms payment received and releases tokens to buyer.
     */
    function confirmAndRelease(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.seller == msg.sender, "Escrow: NOT_SELLER");
        require(order.state == OrderState.PaymentSent, "Escrow: NO_PAYMENT");

        uint256 fee = (order.amount * feeBps) / 10000;
        uint256 buyerAmount = order.amount - fee;

        order.state = OrderState.Completed;
        order.updatedAt = block.timestamp;

        IERC20(order.token).safeTransfer(order.buyer, buyerAmount);
        if (fee > 0) {
            IERC20(order.token).safeTransfer(admin, fee);
        }

        emit OrderCompleted(orderId, order.seller, order.buyer, buyerAmount);
    }

    /**
     * @notice Either party can cancel before payment is sent.
     */
    function cancelOrder(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(
            msg.sender == order.seller || msg.sender == order.buyer,
            "Escrow: NOT_PARTY"
        );
        require(
            order.state == OrderState.Created || order.state == OrderState.Funded,
            "Escrow: CANNOT_CANCEL"
        );

        order.state = OrderState.Cancelled;
        order.updatedAt = block.timestamp;

        if (order.deposited > 0) {
            IERC20(order.token).safeTransfer(order.seller, order.deposited);
        }

        emit OrderCancelled(orderId);
    }

    /**
     * @notice Raise a dispute (buyer or seller).
     */
    function raiseDispute(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(
            msg.sender == order.seller || msg.sender == order.buyer,
            "Escrow: NOT_PARTY"
        );
        require(order.state == OrderState.PaymentSent, "Escrow: NO_DISPUTE");

        order.state = OrderState.Disputed;
        order.updatedAt = block.timestamp;

        emit DisputeRaised(orderId, msg.sender);
    }

    /**
     * @notice Admin resolves dispute — releases to seller or refunds buyer.
     */
    function resolveDispute(uint256 orderId, bool releaseToSeller) external onlyAdmin {
        Order storage order = orders[orderId];
        require(order.state == OrderState.Disputed, "Escrow: NOT_DISPUTED");

        order.updatedAt = block.timestamp;

        if (releaseToSeller) {
            order.state = OrderState.Completed;
            // ETH stays in contract (admin can withdraw)
            IERC20(order.token).safeTransfer(order.seller, order.deposited);
            emit OrderCompleted(orderId, order.seller, order.buyer, 0);
        } else {
            order.state = OrderState.Refunded;
            IERC20(order.token).safeTransfer(order.buyer, order.deposited);
            emit OrderCancelled(orderId);
        }

        emit DisputeResolved(orderId, releaseToSeller);
    }

    /**
     * @notice Rate a counterparty (1-5 stars).
     */
    function rateUser(address user, uint256 score) external {
        require(score >= 1 && score <= 5, "Escrow: INVALID_SCORE");
        ratings[user].total += score;
        ratings[user].count += 1;
        emit UserRated(user, score);
    }

    /**
     * @notice Get user's average rating.
     */
    function getUserRating(address user) external view returns (uint256 avg, uint256 count) {
        Rating storage r = ratings[user];
        count = r.count;
        avg = count > 0 ? r.total / count : 0;
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    function getUserOrders(address user) external view returns (uint256[] memory) {
        return userOrders[user];
    }

    receive() external payable {}
}
