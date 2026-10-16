// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../kernel/Module.sol";
import "../modules/ROLES/ROLES.v1.sol";
import "../tokens/sAXQToken.sol";
import "../tokens/gAXQToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// ─── Governance.sol — Wrap sAXVN → gAXVN (Index Multiplier) ─────────────────
// Wrap sAXVN thành gAXVN có chỉ số nhân (Index) để biểu quyết DAO,
// giao dịch Cross-Chain và thế chấp tín chấp tại các L2/Sidechain.
// ─────────────────────────────────────────────────────────────────────────────

using SafeERC20 for IERC20;

error Governance_ZeroAmount();
error Governance_InvalidIndex();

contract Governance is Policy {
    // ─── Modules ──────────────────────────────────────────────────────────

    ROLESv1    public ROLES;
    SAXQToken public sAXVN;
    GAXQToken public gAXVN;

    // ─── Index (gAXVN index multiplier — tăng theo mỗi Epoch rebase) ────
    /// @notice Index = tổng tích lũy rebase — 1 gAXVN = index × sAXVN (18 dec)
    uint256 public index = 1e18;

    // ─── Events ───────────────────────────────────────────────────────────

    event Wrapped(address indexed user, uint256 svnkrIn, uint256 gvnkrOut);
    event Unwrapped(address indexed user, uint256 gvnkrIn, uint256 svnkrOut);
    event IndexUpdated(uint256 prevIndex, uint256 newIndex);

    // ─── Constructor ──────────────────────────────────────────────────────

    constructor(Kernel kernel_, address s, address g) Policy(kernel_) {
        sAXVN = SAXQToken(s);
        gAXVN = GAXQToken(g);
    }

    // ─── Policy interface ─────────────────────────────────────────────────

    function configureDependencies() external override returns (bytes5[] memory deps) {
        deps    = new bytes5[](1);
        deps[0] = "ROLES";
        ROLES   = ROLESv1(getModuleAddress("ROLES"));
    }

    function requestPermissions() external view override returns (Permissions[] memory reqs) {
        reqs = new Permissions[](0);
    }

    // ─── Wrap / Unwrap ────────────────────────────────────────────────────

    /// @notice Wrap sAXVN → gAXVN theo index hiện tại
    /// gvnkrOut = svnkrIn × 1e18 / index
    function wrap(uint256 svnkrAmount_) external returns (uint256 gvnkrOut) {
        if (svnkrAmount_ == 0) revert Governance_ZeroAmount();
        if (index == 0) revert Governance_InvalidIndex();
        gvnkrOut = (svnkrAmount_ * 1e18) / index;
        sAXVN.burn(msg.sender, svnkrAmount_);
        gAXVN.mint(msg.sender, gvnkrOut);
        emit Wrapped(msg.sender, svnkrAmount_, gvnkrOut);
    }

    /// @notice Unwrap gAXVN → sAXVN theo index hiện tại
    /// svnkrOut = gvnkrIn × index / 1e18
    function unwrap(uint256 gvnkrAmount_) external returns (uint256 svnkrOut) {
        if (gvnkrAmount_ == 0) revert Governance_ZeroAmount();
        svnkrOut = (gvnkrAmount_ * index) / 1e18;
        gAXVN.burn(msg.sender, gvnkrAmount_);
        sAXVN.mint(msg.sender, svnkrOut);
        emit Unwrapped(msg.sender, gvnkrAmount_, svnkrOut);
    }

    /// @notice Cập nhật index sau mỗi Epoch rebase (gọi bởi StakingPolicy)
    function updateIndex(uint256 newIndex_) external {
        require(kernel.isPolicyActive(address(this)), "Governance: not active");
        if (newIndex_ == 0) revert Governance_InvalidIndex();
        emit IndexUpdated(index, newIndex_);
        index = newIndex_;
    }

    // ─── View helpers ─────────────────────────────────────────────────────

    /// @notice Quy đổi sAXVN → gAXVN theo index
    function toGAXVN(uint256 svnkrAmount_) external view returns (uint256) {
        return (svnkrAmount_ * 1e18) / index;
    }

    /// @notice Quy đổi gAXVN → sAXVN theo index
    function toSAXVN(uint256 gvnkrAmount_) external view returns (uint256) {
        return (gvnkrAmount_ * index) / 1e18;
    }
}
