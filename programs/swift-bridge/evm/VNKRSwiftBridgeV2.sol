// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─── Interface ────────────────────────────────────────────────────────────────

interface IERC20Mintable {
    function mint(address to, uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

// ─── AXVNSwiftBridgeV2 ────────────────────────────────────────────────────────
//
// Smart Contract nâng cấp từ AXVNSwiftBridge.sol với:
//   • FX Rate Oracle: quy đổi ngoại tệ (USD/EUR/JPY/SGD/GBP) → AXQ (1 AXQ = 1 VND)
//   • Gas Fee Controller: Base Gas Fee cố định + Bridge Fee % (bps)
//   • Treasury Vault: phí gas/bridge chuyển về AXQ Treasury thay vì fee recipient
//   • Multi-currency OUTBOUND: user burn AXQ → request amount theo ngoại tệ
//
// Công thức quy đổi:
//   grossAxvn    = originalAmount × fxRate
//   gasFee       = baseGasFeeAxvn + (grossAxvn × bridgeFeeBps / 10000)
//   netAxvnMint  = grossAxvn − gasFee
//
// Deployed on: AXQ Enterprise App-Chain EVM (Hyperledger Besu)

contract AXVNSwiftBridgeV2 {

    // ─── Storage ──────────────────────────────────────────────────────────────

    address public oracleRelayer;
    address public pendingRelayer;
    address public owner;
    address public treasuryVault;

    /// AXQ Token — 1 AXQ = 1 VND (18 decimals)
    IERC20Mintable public vnkrToken;

    /// Phí bridge mặc định: 10 bps = 0.1%
    uint256 public bridgeFeeBps = 10;

    /// Phí gas cơ bản mặc định: 10,000 AXQ (10,000 VND)
    /// Có thể ghi đè bởi Relayer khi gọi settleInboundSwiftWithFX
    uint256 public defaultBaseGasFeeAxvn = 10_000 * 1e18;

    // ─── Structs ──────────────────────────────────────────────────────────────

    enum TxStatus { NONE, PENDING, SETTLED, FAILED, REFUNDED }

    struct SwiftRecord {
        bytes32 uetrHash;
        /// Ký hiệu ngoại tệ gốc: "USD", "EUR", "JPY", "SGD", "VND", ...
        string  originalCurrency;
        /// Số tiền ngoại tệ gốc (đơn vị nguyên, e.g. USD cents hoặc full unit)
        uint256 originalAmount;
        /// Tỷ giá quy đổi sang VND, ví dụ: 25450 (1 USD = 25,450 VND)
        uint256 fxRate;
        /// Tổng AXQ trước khi trừ phí: originalAmount × fxRate
        uint256 grossAxvnAmount;
        /// Phí gas + bridge (AXQ) chuyển về Treasury
        uint256 gasFeeAxvn;
        /// AXQ thực nhận sau trừ phí
        uint256 netAxvnAmount;
        address beneficiary;
        TxStatus status;
        uint256  settledAt;
    }

    mapping(bytes32 => SwiftRecord) public swiftRecords;

    /// Tổng AXQ đã mint inbound (theo lịch sử)
    uint256 public totalAxvnMinted;
    /// Tổng phí AXQ đã thu về Treasury
    uint256 public totalFeeCollected;

    // ─── Events ───────────────────────────────────────────────────────────────

    /// Phát ra khi inbound SWIFT được settle và AXQ được mint với FX conversion
    event SwiftInboundConverted(
        bytes32 indexed uetrHash,
        address indexed beneficiary,
        string  originalCurrency,
        uint256 originalAmount,
        uint256 fxRate,
        uint256 grossAxvnAmount,
        uint256 netAxvnAmount,
        uint256 gasFeeAxvn
    );

    /// Phát ra khi người dùng burn AXQ để yêu cầu outbound SWIFT (multi-currency)
    event SwiftOutboundRequestedV2(
        bytes32 indexed uetrHash,
        address indexed sender,
        string  receiverBic,
        string  targetCurrency,   // Tiền nhận: "USD", "EUR", ...
        uint256 vnkrAmountBurned, // AXQ đã burn
        uint256 estimatedFiatAmount // Ước tính fiat nhận
    );

    event BridgeFeeUpdated(uint256 oldBps, uint256 newBps);
    event DefaultGasFeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryVaultUpdated(address oldVault, address newVault);
    event RelayerChanged(address indexed oldRelayer, address indexed newRelayer);

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyRelayer() {
        require(msg.sender == oracleRelayer, "AXQ: Unauthorized Relayer");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "AXQ: Only Owner");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(
        address _vnkrToken,
        address _oracleRelayer,
        address _treasuryVault
    ) {
        require(_vnkrToken     != address(0), "AXQ: zero token");
        require(_oracleRelayer != address(0), "AXQ: zero relayer");
        require(_treasuryVault != address(0), "AXQ: zero treasury");

        vnkrToken      = IERC20Mintable(_vnkrToken);
        oracleRelayer  = _oracleRelayer;
        treasuryVault  = _treasuryVault;
        owner          = msg.sender;
    }

    // ─── INBOUND: SWIFT Fiat Ngoại Tệ → Mint AXQ (1 AXQ = 1 VND) ─────────

    /**
     * @notice Xử lý SWIFT Inbound ngoại tệ → Quy đổi FX → Trừ Gas Fee → Mint AXQ.
     *
     * Được gọi bởi Oracle Relayer (swift-chain-bridge) sau khi:
     *   1. swift-gateway xác nhận nhận điện MT103/pacs.008 inbound.
     *   2. FX Oracle lấy tỷ giá thực từ SBV / Vietcombank / Chainlink Feed.
     *
     * @param uetr              UUID v4 UETR của điện SWIFT
     * @param originalCurrency  Ký hiệu ngoại tệ gốc ("USD", "EUR", "JPY", ...)
     * @param originalAmount    Số tiền ngoại tệ (đơn vị: full unit, không chia decimals)
     * @param fxRate            Tỷ giá quy đổi sang VND (ví dụ: 25450 cho USD/VND)
     * @param beneficiary       Địa chỉ EVM ví nhận AXQ token
     * @param baseGasFeeAxvn    Phí gas cơ bản mạng lưới (đơn vị: AXQ wei = 1e18)
     *                          Nếu = 0 → dùng defaultBaseGasFeeAxvn
     */
    function settleInboundSwiftWithFX(
        string  calldata uetr,
        string  calldata originalCurrency,
        uint256          originalAmount,
        uint256          fxRate,
        address          beneficiary,
        uint256          baseGasFeeAxvn
    ) external onlyRelayer {
        require(beneficiary   != address(0), "AXQ: zero beneficiary");
        require(originalAmount > 0,          "AXQ: zero amount");
        require(fxRate         > 0,          "AXQ: zero fx rate");

        bytes32 uetrHash = keccak256(abi.encodePacked(uetr));
        require(swiftRecords[uetrHash].status == TxStatus.NONE, "AXQ: UETR already processed");

        // 1. Tính Gross AXQ = originalAmount × fxRate × 1e18
        //    (AXQ có 18 decimals, fxRate là integer, originalAmount là full unit ngoại tệ)
        uint256 grossAxvn = originalAmount * fxRate * 1e18;

        // 2. Tính phí Bridge (basis points) + Gas cơ bản
        uint256 effectiveGasBase = baseGasFeeAxvn == 0 ? defaultBaseGasFeeAxvn : baseGasFeeAxvn;
        uint256 percentFee       = (grossAxvn * bridgeFeeBps) / 10_000;
        uint256 totalFee         = effectiveGasBase + percentFee;

        require(grossAxvn > totalFee, "AXQ: Amount too small to cover gas fee");

        uint256 netAxvn = grossAxvn - totalFee;

        // 3. Ghi record
        swiftRecords[uetrHash] = SwiftRecord({
            uetrHash:         uetrHash,
            originalCurrency: originalCurrency,
            originalAmount:   originalAmount,
            fxRate:           fxRate,
            grossAxvnAmount:  grossAxvn,
            gasFeeAxvn:       totalFee,
            netAxvnAmount:    netAxvn,
            beneficiary:      beneficiary,
            status:           TxStatus.SETTLED,
            settledAt:        block.timestamp
        });

        totalAxvnMinted  += netAxvn;
        totalFeeCollected += totalFee;

        // 4. Mint AXQ: Net amount cho beneficiary, fee về Treasury Vault
        vnkrToken.mint(beneficiary, netAxvn);
        vnkrToken.mint(treasuryVault, totalFee);

        emit SwiftInboundConverted(
            uetrHash,
            beneficiary,
            originalCurrency,
            originalAmount,
            fxRate,
            grossAxvn,
            netAxvn,
            totalFee
        );
    }

    // ─── OUTBOUND V2: Burn AXQ → SWIFT Fiat Ngoại Tệ ───────────────────────

    /**
     * @notice Người dùng burn AXQ để yêu cầu chuyển tiền SWIFT bằng ngoại tệ.
     *         Relayer sẽ tính toán lại fxRate và bắn điện MT103.
     *
     * @param uetr              UETR do client tạo (UUID v4)
     * @param receiverBic       BIC ngân hàng nhận tiền
     * @param targetCurrency    Tiền tệ nhận: "USD", "EUR", "JPY", ...
     * @param vnkrAmountToBurn  Số AXQ muốn burn (đơn vị: wei = 1e18)
     * @param estimatedFiatAmt  Ước tính fiat nhận (Relayer sẽ confirm lại)
     */
    function requestOutboundSwiftV2(
        string  calldata uetr,
        string  calldata receiverBic,
        string  calldata targetCurrency,
        uint256          vnkrAmountToBurn,
        uint256          estimatedFiatAmt
    ) external {
        require(vnkrAmountToBurn > 0,         "AXQ: zero burn amount");
        require(bytes(receiverBic).length >= 8, "AXQ: invalid BIC");

        bytes32 uetrHash = keccak256(abi.encodePacked(uetr));
        require(swiftRecords[uetrHash].status == TxStatus.NONE, "AXQ: duplicate UETR");

        // Burn AXQ từ msg.sender (yêu cầu approve trước)
        vnkrToken.burnFrom(msg.sender, vnkrAmountToBurn);

        swiftRecords[uetrHash] = SwiftRecord({
            uetrHash:         uetrHash,
            originalCurrency: targetCurrency,
            originalAmount:   estimatedFiatAmt,
            fxRate:           0,        // Relayer sẽ fill sau khi confirm FX
            grossAxvnAmount:  vnkrAmountToBurn,
            gasFeeAxvn:       0,
            netAxvnAmount:    vnkrAmountToBurn,
            beneficiary:      msg.sender,
            status:           TxStatus.PENDING,
            settledAt:        0
        });

        emit SwiftOutboundRequestedV2(
            uetrHash,
            msg.sender,
            receiverBic,
            targetCurrency,
            vnkrAmountToBurn,
            estimatedFiatAmt
        );
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    /// Tính toán AXQ net trước khi settle (preview)
    function previewInboundConversion(
        uint256 originalAmount,
        uint256 fxRate,
        uint256 baseGasFeeAxvn
    ) external view returns (
        uint256 grossAxvn,
        uint256 gasFee,
        uint256 netAxvn
    ) {
        uint256 effectiveBase = baseGasFeeAxvn == 0 ? defaultBaseGasFeeAxvn : baseGasFeeAxvn;
        grossAxvn = originalAmount * fxRate * 1e18;
        gasFee    = effectiveBase + (grossAxvn * bridgeFeeBps) / 10_000;
        netAxvn   = grossAxvn > gasFee ? grossAxvn - gasFee : 0;
    }

    function getRecord(string calldata uetr) external view returns (SwiftRecord memory) {
        return swiftRecords[keccak256(abi.encodePacked(uetr))];
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setBridgeFee(uint256 newBps) external onlyOwner {
        require(newBps <= 500, "AXQ: max 5%");
        emit BridgeFeeUpdated(bridgeFeeBps, newBps);
        bridgeFeeBps = newBps;
    }

    function setDefaultGasFee(uint256 newFee) external onlyOwner {
        emit DefaultGasFeeUpdated(defaultBaseGasFeeAxvn, newFee);
        defaultBaseGasFeeAxvn = newFee;
    }

    function setTreasuryVault(address newVault) external onlyOwner {
        require(newVault != address(0), "AXQ: zero address");
        emit TreasuryVaultUpdated(treasuryVault, newVault);
        treasuryVault = newVault;
    }

    function proposeRelayer(address newRelayer) external onlyOwner {
        require(newRelayer != address(0), "AXQ: zero address");
        pendingRelayer = newRelayer;
    }

    function acceptRelayer() external {
        require(msg.sender == pendingRelayer, "AXQ: not pending relayer");
        emit RelayerChanged(oracleRelayer, pendingRelayer);
        oracleRelayer  = pendingRelayer;
        pendingRelayer = address(0);
    }
}
