# ==============================================================================
# WIKIALISA GITHUB ROADMAP AUTOMATOR (PowerShell)
# ==============================================================================
# Tự động hóa đăng nhập, tạo Project Roadmap và nạp toàn bộ 24 đầu việc
# lên https://github.com/wikialisa/wikialisa/projects
# ==============================================================================

param(
    [string]$Token = "",
    [string]$Owner = "wikialisa",
    [string]$Repo = "wikialisa"
)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   WIKIALISA GITHUB ROADMAP CREATOR & SYNCHRONIZER (v2.0)        " -ForegroundColor White
Write-Host "   Target: https://github.com/$Owner/$Repo/projects              " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Kiểm tra Token hoặc Đăng nhập
if ($Token -ne "") {
    Write-Host "[*] Đang cấu hình xác thực GitHub với Token được cung cấp..." -ForegroundColor Cyan
    $env:GH_TOKEN = $Token
}

# Kiểm tra trạng thái gh auth
$authCheck = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[!] Cảnh báo: GitHub CLI chưa được xác thực hoặc Token đã hết hạn." -ForegroundColor Red
    Write-Host "    Vui lòng thực hiện một trong các cách sau:" -ForegroundColor Yellow
    Write-Host "    1. Chạy lệnh: gh auth login --hostname github.com -p https -w" -ForegroundColor White
    Write-Host "    2. Hoặc chạy: .\scripts\create_github_roadmap.ps1 -Token 'ghp_your_token'" -ForegroundColor White
    Write-Host "-----------------------------------------------------------------" -ForegroundColor DarkGray
    exit 1
}

Write-Host "[✔] Đã xác thực thành công với GitHub!" -ForegroundColor Green

# 2. Tạo GitHub Project mới
Write-Host "`n[*] Đang khởi tạo GitHub Project Board trên tổ chức '$Owner'..." -ForegroundColor Cyan
$projectTitle = "Wikialisa Core OS & AXQ Silicon Architecture Roadmap"

$createResult = gh project create --owner $Owner --title $projectTitle --format json 2>&1
if ($LASTEXITCODE -eq 0) {
    $projJson = $createResult | ConvertFrom-Json
    $projNumber = $projJson.number
    $projUrl = $projJson.url
    Write-Host "[✔] Khởi tạo Project thành công!" -ForegroundColor Green
    Write-Host "    Project URL: $projUrl" -ForegroundColor Yellow
} else {
    Write-Host "[*] Project có thể đã tồn tại hoặc đang tra cứu Project hiện có..." -ForegroundColor Yellow
    $projList = gh project list --owner $Owner --format json | ConvertFrom-Json
    $targetProj = $projList.projects | Where-Object { $_.title -like "*Wikialisa*" } | Select-Object -First 1
    if ($targetProj) {
        $projNumber = $targetProj.number
        $projUrl = $targetProj.url
        Write-Host "[✔] Đã kết nối với Project: $projUrl (Số: $projNumber)" -ForegroundColor Green
    } else {
        Write-Host "[!] Lỗi khi tạo Project: $createResult" -ForegroundColor Red
        exit 1
    }
}

# 3. Danh sách 24 đầu việc trọng tâm từ ROADMAP.md
$tasks = @(
    # Phase 1
    "P1: Thiết lập Không gian Chủ quyền /wikialisa và gắn kết /wikialisa/mnt/w",
    "P1: Xây dựng Bộ công cụ axq CLI v2.0 (bin/axq, axq.ps1, axq.cmd)",
    "P1: Phát triển Chat AI CLI Tương tác Đa vai trò (bin/axq-chat.py)",
    "P1: Chuẩn hóa quyền tác giả và loại bỏ tài khoản cá nhân trong Git tree",
    # Phase 2
    "P2: Biên dịch Module Hạt nhân C /drivers/crypto/axq trên Kernel 6.6+ LTS",
    "P2: Đăng ký Character Device /dev/axq và các System Call chuyên biệt",
    "P2: Áp dụng phân tách đặc quyền Zero-Trust Capabilities (etc/capabilities.conf)",
    "P2: Thiết lập vùng nhớ khóa Ring 0 Keyring bảo vệ RAM",
    # Phase 3
    "P3: Kiểm định Mạch Bán dẫn RTL Verilator (sha256_round_stage.sv)",
    "P3: Phát triển Testbench C++ Chu kỳ chính xác mô phỏng PoK 64-stage",
    "P3: Thiết kế Khối tạo số ngẫu nhiên thực TRNG dựa trên Thermal Jitter",
    "P3: Tổng hợp Bitstream FPGA cho card Xilinx Alveo PCIe (300 MH/s)",
    # Phase 4
    "P4: Xây dựng Tier 1 Web Control Center (Rust daemon + React SPA)",
    "P4: Phát triển Tier 2 AXQ Studio Desktop (Rust + Tauri v2)",
    "P4: Xây dựng Tier 3 Wikialisa-Shell (Wayland Compositor native)",
    "P4: Kiểm định và bảo đảm 100% UI tuân thủ chuẩn WCAG 2.2 AA",
    # Phase 5
    "P5: Tích hợp Submodule infra/runner-images (Mẫu máy chủ VM tự lưu trữ)",
    "P5: Tích hợp Submodule plugins/accessibility-agents (Vệ binh Trợ năng)",
    "P5: Thiết lập Pipeline CI/CD GitHub Actions kiểm thử tự động",
    "P5: Đóng gói Bộ cài đặt ISO Bootable Kép UEFI/BIOS (< 30MB)",
    # Phase 6
    "P6: Tích hợp chuẩn thông điệp tài chính liên ngân hàng ISO 20022",
    "P6: Thiết lập cơ chế Tokenomics phân bổ phí (70% Validator, 20% LP, 5% Hub, 5% Treasury)",
    "P6: Kết nối Cổng thanh toán địa phương tại các Regional Hubs (APAC, EMEA, Americas)",
    "P6: Kích hoạt cơ chế Đốt giảm phát Token định kỳ từ doanh thu phí"
)

Write-Host "`n[*] Đang nạp 24 thẻ nhiệm vụ lên GitHub Projects Board..." -ForegroundColor Cyan
$count = 0
foreach ($t in $tasks) {
    $count++
    Write-Host "  [$count/24] Đang thêm: $t..." -ForegroundColor DarkGray
    gh project item-create $projNumber --owner $Owner --title $t | Out-Null
}

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host " [✔] HOÀN TẤT ĐỒNG BỘ ROADMAP LÊN GITHUB PROJECTS!" -ForegroundColor Green
Write-Host "     Truy cập bảng dự án tại: $projUrl" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Green

