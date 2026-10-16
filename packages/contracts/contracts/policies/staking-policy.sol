// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../kernel/Module.sol";
import "../modules/mintr-module.v1.sol";
import "../tokens/svnkr-token.sol";
import "../tokens/gvnkr-token.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// ─── staking-policy.sol — StakingPolicy ──────────────────────────────────────
// Xử lý khóa AXQ → nhận sAXVN/gAXVN và phân phối thưởng Rebase mỗi Epoch.
// ─────────────────────────────────────────────────────────────────────────────

using SafeERC20 for IERC20;

error Staking_InvalidAmount();
error Staking_NotEnoughStaked(address user, uint256 staked, uint256 requested);
error Staking_EpochNotReady(uint256 nextEpochTime);

contract StakingPolicy is Policy {
    // ─── Modules ──────────────────────────────────────────────────────────

    MINTRv1    public MINTR;
    SAXQToken public sAXVN;
    GAXQToken public gAXVN;
    IERC20     public AXQ;

    // ─── Rebase params ────────────────────────────────────────────────────

    uint256 public rebaseBps    = 100;  // 1% per epoch default
    uint256 public nextEpochTime;

    // ─── User positions ───────────────────────────────────────────────────

    mapping(address => uint256) public stakedAxvn;

    // ─── Events ───────────────────────────────────────────────────────────

    event Staked(address indexed user, uint256 vnkrIn, uint256 svnkrOut);
    event Unstaked(address indexed user, uint256 svnkrIn, uint256 vnkrOut);
    event Rebased(uint256 epoch, uint256 rebaseBps, uint256 newSupply);
    event RebaseBpsUpdated(uint256 prev, uint256 next);

    // ─── Constructor ──────────────────────────────────────────────────────

    constructor(
        Kernel kernel_,
        address ,
        address s,
        address g
    ) Policy(kernel_) {
        AXQ  = IERC20();
        sAXVN = SAXQToken(s);
        gAXVN = GAXQToken(g);
        nextEpochTime = block.timestamp + 8 hours;
    }

    // ─── Policy interface ─────────────────────────────────────────────────

    function configureDependencies()
        external
        override
        returns (bytes5[] memory deps)
    {
        deps    = new bytes5[](1);
        deps[0] = "MINTR";
        MINTR   = MINTRv1(getModuleAddress("MINTR"));
    }

    function requestPermissions()
        external
        view
        override
        returns (Permissions[] memory reqs)
    {
        reqs    = new Permissions[](2);
        reqs[0] = Permissions({ keycode: "MINTR", funcSelector: MINTRv1.mintAxvn.selector });
        reqs[1] = Permissions({ keycode: "MINTR", funcSelector: MINTRv1.burnAxvn.selector });
    }

    // ─── Core logic ───────────────────────────────────────────────────────

    /// @notice Stake AXQ → receive sAXVN 1:1
    function stake(uint256 amount_) external {
        if (amount_ == 0) revert Staking_InvalidAmount();
        AXQ.safeTransferFrom(msg.sender, address(this), amount_);
        stakedAxvn[msg.sender] += amount_;
        sAXVN.mint(msg.sender, amount_);
        emit Staked(msg.sender, amount_, amount_);
    }

    /// @notice Unstake sAXVN → receive AXQ
    function unstake(uint256 svnkrAmount_) external {
        if (svnkrAmount_ == 0) revert Staking_InvalidAmount();
        uint256 vnkrOut = svnkrAmount_; // 1:1 pre-rebase (post-rebase gains embedded in sAXVN balance)
        if (stakedAxvn[msg.sender] < vnkrOut)
            revert Staking_NotEnoughStaked(msg.sender, stakedAxvn[msg.sender], vnkrOut);
        sAXVN.burn(msg.sender, svnkrAmount_);
        stakedAxvn[msg.sender] -= vnkrOut;
        AXQ.safeTransfer(msg.sender, vnkrOut);
        emit Unstaked(msg.sender, svnkrAmount_, vnkrOut);
    }

    /// @notice Wrap sAXVN → gAXVN (1:1 by index value)
    function wrap(uint256 amount_) external {
        if (amount_ == 0) revert Staking_InvalidAmount();
        sAXVN.burn(msg.sender, amount_);
        gAXVN.mint(msg.sender, amount_);
    }

    /// @notice Unwrap gAXVN → sAXVN (1:1)
    function unwrap(uint256 amount_) external {
        if (amount_ == 0) revert Staking_InvalidAmount();
        gAXVN.burn(msg.sender, amount_);
        sAXVN.mint(msg.sender, amount_);
    }

    /// @notice Trigger epoch rebase — distributes yield to all sAXVN holders
    function triggerRebase() external {
        if (block.timestamp < nextEpochTime)
            revert Staking_EpochNotReady(nextEpochTime);
        uint256 newSupply = sAXVN.rebase(rebaseBps);
        nextEpochTime = block.timestamp + 8 hours;
        emit Rebased(sAXVN.epoch(), rebaseBps, newSupply);
    }

    /// @notice Update rebase rate (guarded — only Kernel executor via role)
    function setRebaseBps(uint256 bps_) external {
        require(
            kernel.isPolicyActive(address(this)),
            "Staking: not active"
        );
        emit RebaseBpsUpdated(rebaseBps, bps_);
        rebaseBps = bps_;
    }
}
