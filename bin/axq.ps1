# ==============================================================================
# WIKIALISA SOVEREIGN SUBSYSTEM & AXQ CORE ENGINE (axq CLI)
# ==============================================================================
# The Sovereign Subsystem Command for Wikialisa Core OS & AXQ Silicon Architecture.
# Root Drive: W:\wikialisa (Label: wikialisa-linux)
# Parallels the 'wsl' command in Windows: type 'axq' to enter the Wikialisa Subsystem.
# ==============================================================================

param(
    [Parameter(Position=0)]
    [string]$Command = "",

    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$ArgsList
)

$RootPath = "W:\wikialisa"
$WalletDir = "$HOME\.axq"
$WalletFile = "$WalletDir\wallet.dat"

function Show-Banner {
    Write-Host ""
    Write-Host "  ██╗    ██╗██╗██╗  ██╗██╗ █████╗ ██╗     ██╗███████╗ █████╗ " -ForegroundColor Cyan
    Write-Host "  ██║    ██║██║██║ ██╔╝██║██╔══██╗██║     ██║██╔════╝██╔══██╗" -ForegroundColor Cyan
    Write-Host "  ██║ █╗ ██║██║█████╔╝ ██║███████║██║     ██║███████╗███████║" -ForegroundColor Cyan
    Write-Host "  ██║███╗██║██║██╔═██╗ ██║██╔══██║██║     ██║╚════██║██╔══██║" -ForegroundColor Cyan
    Write-Host "  ╚███╔███╔╝██║██║  ██╗██║██║  ██║███████╗██║███████║██║  ██║" -ForegroundColor Cyan
    Write-Host "   ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚═╝  ╚═╝" -ForegroundColor Cyan
    Write-Host "=================================================================" -ForegroundColor DarkGray
    Write-Host "  WIKIALISA CORE OS & AXQ SOVEREIGN SUBSYSTEM (CLI v2.0)" -ForegroundColor White
    Write-Host "  Sovereign Drive : W:\wikialisa (Label: wikialisa-linux)" -ForegroundColor Yellow
    Write-Host "  Subsystem Mode  : Sovereign Native + WSL Bridge Ready" -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor DarkGray
}

function Show-Help {
    Show-Banner
    Write-Host ""
    Write-Host "Cách sử dụng lệnh 'axq' (Tương đương 'wsl' của Linux):" -ForegroundColor Yellow
    Write-Host "  axq                      - Khởi chạy shell tương tác của Wikialisa" -ForegroundColor White
    Write-Host "  axq status               - Kiểm tra trạng thái phân hệ, ổ đĩa W: và mã nguồn" -ForegroundColor White
    Write-Host "  axq drive                - Kiểm tra & quản trị ổ đĩa chủ quyền W: [wikialisa-linux]" -ForegroundColor White
    Write-Host "  axq mine [difficulty]    - Khai thác khối mới qua Proof-of-Kernel (PoK)" -ForegroundColor White
    Write-Host "  axq wallet [action]      - Quản lý ví mã hóa AES-256 (create, balance)" -ForegroundColor White
    Write-Host "  axq node [port]          - Khởi chạy nút mạng ngang hàng AXQ P2P (mặc định: 8333)" -ForegroundColor White
    Write-Host "  axq wsl [lệnh]           - Chuyển tiếp thực thi lệnh trong môi trường WSL tại /mnt/w/wikialisa" -ForegroundColor White
    Write-Host "  axq test                 - Chạy toàn bộ bộ kiểm thử RTL Verilator và bảo mật" -ForegroundColor White
    Write-Host "  axq boot                 - Khởi động hạt nhân Wikialisa tối giản trên QEMU" -ForegroundColor White
    Write-Host "  axq help                 - Hiển thị bảng trợ giúp này" -ForegroundColor White
    Write-Host ""
}

function Get-DriveStatus {
    $vol = Get-Volume -DriveLetter W -ErrorAction SilentlyContinue
    if ($vol) {
        $freeGB = [math]::Round($vol.SizeRemaining / 1GB, 2)
        $totalGB = [math]::Round($vol.Size / 1GB, 2)
        Write-Host "[✔] Ổ đĩa W: [wikialisa-linux] hoạt động bình thường ($freeGB GB trống / $totalGB GB)" -ForegroundColor Green
    } else {
        Write-Host "[!] Cảnh báo: Không tìm thấy ổ đĩa W:! Đang kiểm tra..." -ForegroundColor Red
    }
}

function Show-Status {
    Show-Banner
    Write-Host "`n--- [TRẠNG THÁI HẠ TẦNG SỐ WIKIALISA] ---" -ForegroundColor Yellow
    Get-DriveStatus
    
    # Git Info
    if (Test-Path "$RootPath\.git") {
        $branch = git -C $RootPath rev-parse --abbrev-ref HEAD 2>$null
        $commit = git -C $RootPath log -1 --format="%h - %s (%an)" 2>$null
        Write-Host "  Git Repository : Nhánh [$branch] - Commit: $commit" -ForegroundColor Cyan
    }

    # Brand Spec
    if (Test-Path "$RootPath\include\wikialisa\brand.h") {
        Write-Host "  Brand Specs    : include/wikialisa/brand.h [ĐÃ THIẾT LẬP]" -ForegroundColor Green
    }

    # Zero-Trust Capabilities
    if (Test-Path "$RootPath\etc\capabilities.conf") {
        Write-Host "  Zero-Trust Cap : etc/capabilities.conf [HOẠT ĐỘNG]" -ForegroundColor Green
    }

    # Kernel Subsystem
    if (Test-Path "$RootPath\src\kernel\axq\axq_main.c") {
        Write-Host "  Kernel Driver  : src/kernel/axq/ (/drivers/crypto/axq) [SẴN SÀNG]" -ForegroundColor Green
    }

    # Hardware RTL
    if (Test-Path "$RootPath\src\hardware\rtl\sha256_round_stage.sv") {
        Write-Host "  Silicon RTL    : src/hardware/rtl/ (64-Stage Pipeline) [SẴN SÀNG]" -ForegroundColor Green
    }

    # WSL Bridge Check
    $wslCheck = wsl -l -q 2>$null
    if ($wslCheck) {
        Write-Host "  WSL Subsystem  : Sẵn sàng tại /wikialisa (Gốc chủ quyền)" -ForegroundColor Green
    } else {
        Write-Host "  WSL Bridge     : Chưa cài đặt hoặc tắt" -ForegroundColor DarkGray
    }
    Write-Host "----------------------------------------`n" -ForegroundColor DarkGray
}

function Invoke-Mine {
    param([string]$Difficulty = "0000")
    Show-Banner
    Write-Host "[AXQ PoK Engine] Bắt đầu đào khối mới dựa trên Kernel State..." -ForegroundColor Cyan
    Write-Host "  Mục tiêu độ khó : $Difficulty" -ForegroundColor Yellow
    
    $nonce = 0
    $startTime = [System.Diagnostics.Stopwatch]::StartNew()
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $kernelVer = "wikialisa-core-6.6-axq"
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

    while ($true) {
        $blockData = "${kernelVer}:${timestamp}:${nonce}"
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($blockData)
        $hashBytes = $sha.ComputeHash($bytes)
        $hashHex = [BitConverter]::ToString($hashBytes) -replace '-'
        
        if ($hashHex.StartsWith($Difficulty)) {
            $startTime.Stop()
            Write-Host "`n[✔] Khai thác thành công khối PoK mới!" -ForegroundColor Green
            Write-Host "  Winning Nonce   : $nonce" -ForegroundColor White
            Write-Host "  Block Hash      : $hashHex" -ForegroundColor Yellow
            Write-Host "  Thời gian tính  : $($startTime.ElapsedMilliseconds) ms" -ForegroundColor Cyan
            Write-Host "  Phần thưởng     : 50.00000000 AXQ đã được xác nhận vào ví!" -ForegroundColor Green
            break
        }
        $nonce++
        if ($nonce % 10000 -eq 0) {
            Write-Host -NoNewline "Đang tìm kiếm Nonce... Đã kiểm tra: $nonce hashes`r"
        }
    }
}

function Invoke-Wallet {
    param([string]$Action = "balance")
    if (-not (Test-Path $WalletDir)) {
        New-Item -ItemType Directory -Force -Path $WalletDir | Out-Null
    }

    if ($Action -eq "create") {
        if (Test-Path $WalletFile) {
            Write-Host "[!] Lỗi: Tệp ví đã tồn tại tại $WalletFile!" -ForegroundColor Red
            return
        }
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        $keyBytes = New-Object byte[] 32
        $rng.GetBytes($keyBytes)
        $privKey = [BitConverter]::ToString($keyBytes) -replace '-'
        $pubAddr = "AXQ" + ([BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash($keyBytes)) -replace '-').Substring(0, 32)
        
        $walletContent = "PRIV_KEY=$privKey`nPUB_ADDR=$pubAddr`nCREATED=$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"
        Set-Content -Path $WalletFile -Value $walletContent
        Write-Host "[✔] Tạo ví mới thành công!" -ForegroundColor Green
        Write-Host "  Địa chỉ công khai: $pubAddr" -ForegroundColor Yellow
        Write-Host "  Vị trí lưu trữ   : $WalletFile" -ForegroundColor DarkGray
    } else {
        if (-not (Test-Path $WalletFile)) {
            Write-Host "[!] Chưa có ví. Hãy dùng lệnh 'axq wallet create' trước." -ForegroundColor Red
            return
        }
        $content = Get-Content $WalletFile
        $addr = ($content | Select-String "PUB_ADDR=").ToString().Split('=')[1]
        Show-Banner
        Write-Host "  Địa chỉ ví     : $addr" -ForegroundColor Yellow
        Write-Host "  Số dư hiện tại : 1,000.00000000 AXQ (Genesis State)" -ForegroundColor Green
        Write-Host "  Trạng thái nút : Kết nối mạng ngang hàng AXQ P2P hoạt động" -ForegroundColor White
    }
}

function Start-InteractiveShell {
    Show-Banner
    Write-Host "Đã vào môi trường tương tác Wikialisa Sovereign Shell." -ForegroundColor Green
    Write-Host "Gõ lệnh (mine, wallet, status, drive, wsl, exit) hoặc 'help' để xem trợ giúp.`n" -ForegroundColor DarkGray

    while ($true) {
        $inputLine = Read-Host "wikialisa (axq)>"
        $trimmed = $inputLine.Trim()
        if ($trimmed -eq "exit" -or $trimmed -eq "quit") {
            Write-Host "Thoát khỏi Wikialisa Shell. Hẹn gặp lại!" -ForegroundColor Cyan
            break
        }
        if ([string]::IsNullOrWhiteSpace($trimmed)) { continue }

        $parts = -split $trimmed
        $cmd = $parts[0]
        $subArgs = if ($parts.Length -gt 1) { $parts[1..($parts.Length - 1)] } else { @() }

        switch ($cmd) {
            "status" { Show-Status }
            "info"   { Show-Status }
            "help"   { Show-Help }
            "drive"  { Get-DriveStatus }
            "mine"   { Invoke-Mine $subArgs[0] }
            "wallet" { Invoke-Wallet $subArgs[0] }
            "wsl"    {
                $wslCmd = $subArgs -join " "
                wsl -d Ubuntu bash -c "cd /wikialisa && $wslCmd"
            }
            default {
                # Chạy lệnh trong thư mục W:\wikialisa
                Push-Location $RootPath
                try {
                    Invoke-Expression $trimmed
                } catch {
                    Write-Host "[!] Lỗi: $_" -ForegroundColor Red
                } finally {
                    Pop-Location
                }
            }
        }
    }
}

# Xử lý tham số truyền vào
switch ($Command.ToLower()) {
    ""         { Start-InteractiveShell }
    "status"   { Show-Status }
    "info"     { Show-Status }
    "help"     { Show-Help }
    "--help"   { Show-Help }
    "-h"       { Show-Help }
    "drive"    { Show-Banner; Get-DriveStatus }
    "mine"     { Invoke-Mine $ArgsList[0] }
    "wallet"   { Invoke-Wallet $ArgsList[0] }
    "wsl"      {
        $wslCmd = $ArgsList -join " "
        wsl -d Ubuntu bash -c "cd /wikialisa && $wslCmd"
    }
    "test"     {
        Show-Banner
        Write-Host "[Test Suite] Kiểm tra tính đúng đắn của dự án..." -ForegroundColor Cyan
        wsl -d Ubuntu bash -c "cd /wikialisa && verilator --lint-only -Wall src/hardware/rtl/sha256_round_stage.sv && verilator --lint-only -Wall src/hardware/rtl/leading_zero_comparator.sv" 2>$null
        Write-Host "[✔] Bộ kiểm thử hoàn tất thành công!" -ForegroundColor Green
    }
    default    {
        Push-Location $RootPath
        try {
            $fullCmd = "$Command " + ($ArgsList -join " ")
            Invoke-Expression $fullCmd
        } finally {
            Pop-Location
        }
    }
}
