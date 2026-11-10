#!/usr/bin/env python3
# ==============================================================================
# WIKIALISA SOVEREIGN CHAT AI CLI (axq chat / axq ai)
# ==============================================================================
# Trình trò chuyện AI tương tác dòng lệnh đa tầng cho Wikialisa Core OS & AXQ Architecture.
# Hỗ trợ 7 vai trò tác nhân chuyên trách, động cơ tri thức lõi cục bộ (Local Knowledge),
# kết nối LLM cục bộ (Ollama SLM) và API Cloud (Gemini / OpenAI).
# ==============================================================================

import os
import sys
import json
import urllib.request
import urllib.error
import time

C_CYAN = "\033[1;36m"
C_GREEN = "\033[1;32m"
C_YELLOW = "\033[1;33m"
C_RED = "\033[1;31m"
C_MAGENTA = "\033[1;35m"
C_BLUE = "\033[1;34m"
C_BOLD = "\033[1m"
C_RESET = "\033[0m"

ROLES = {
    "sentinel": {
        "id": "role:kernel-sentinel",
        "name": "Giám Hộ Nhân & Bảo Mật Ring 0",
        "desc": "Rà soát mã nguồn C kernel, Kconfig hardening, tối giản bzImage < 8MB, SELinux, Zero-Trust Capabilities.",
        "icon": "🛡️",
    },
    "consensus": {
        "id": "role:consensus-governor",
        "name": "Điều Phối Đồng Thuận & Entropy",
        "desc": "Quản trị /dev/axq, thuật toán Proof-of-Kernel (PoK), thu thập entropy RDTSC/TRNG, điều chỉnh độ khó băm.",
        "icon": "⚡",
    },
    "network": {
        "id": "role:network-warden",
        "name": "Vệ Binh Mạng & Zero-Trust",
        "desc": "Tường lửa nftables, tối ưu WireGuard (MTU 1420), eBPF/XDP fastpath, QoS phân lớp cổng P2P 8333.",
        "icon": "🌐",
    },
    "silicon": {
        "id": "role:silicon-rtl",
        "name": "Kỹ Sư Bán Dẫn & Mạch Phần Cứng",
        "desc": "Thiết kế SystemVerilog RTL, pipeline SHA-256 64 giai đoạn, mô phỏng Verilator, tập lệnh vi xử lý RISC-V AXQ-V.",
        "icon": "💎",
    },
    "release": {
        "id": "role:release-orchestrator",
        "name": "Điều Phối Đóng Gói, Runner & CI/CD",
        "desc": "Quản lý hạ tầng infra/runner-images, biên dịch BusyBox tĩnh, đóng gói ISO bootable kép UEFI/BIOS (< 30MB).",
        "icon": "🚀",
    },
    "gui": {
        "id": "role:gui-architect",
        "name": "Kiến Trúc Sư Giao Diện Web & Desktop",
        "desc": "Web Control Center (Rust + React), AXQ Studio (Rust + Tauri v2), máy trạm Wayland (Wikialisa-Shell).",
        "icon": "🖥️",
    },
    "a11y": {
        "id": "role:accessibility-guardian",
        "name": "Vệ Binh Trợ Năng WCAG 2.2 AA",
        "desc": "Điều phối plugins/accessibility-agents, kiểm soát chất lượng tiếp cận WCAG 2.2 AA, Section 508, Plain-ASCII.",
        "icon": "♿",
    },
}

DEFAULT_ROLE = "sentinel"

SOVEREIGN_KNOWLEDGE = {
    "he_dieu_hanh": """Wikialisa Core OS là hệ điều hành máy chủ chủ quyền tối giản (Sovereign Minimal Server OS)
dựa trên nhân Linux LTS tinh gọn (bzImage < 8MB), loại bỏ toàn bộ GUI/Sound/Wireless thừa thãi.
Hệ điều hành tích hợp trực tiếp driver mật mã học /drivers/crypto/axq (/dev/axq) tại Ring 0.""",
    "axq_subsystem": """Lệnh 'axq' là bộ điều khiển tối thượng tương đương lệnh 'wsl' của Linux.
Gốc chủ quyền là /wikialisa, và ổ đĩa vật lý W: (wikialisa-linux) được gắn kết tại /wikialisa/mnt/w.
Các lệnh chính: axq status, axq mine, axq wallet, axq drive, axq a11y, axq runner, axq test, axq chat.""",
    "pok": """Proof-of-Kernel (PoK) là cơ chế đồng thuận kết hợp giữa trạng thái bộ nhớ hạt nhân (Ring 0 Kernel State)
với băm phần cứng SHA-256. Khối băm: SHA256(Kernel_Version + Timestamp + Nonce + Kernel_Entropy).
Phần thưởng khối khởi nguyên: 50 AXQ, thời gian sinh khối: 2.5 giây, cổng mạng P2P: 8333.""",
    "hardware": """Kiến trúc phần cứng AXQ tiến hóa qua 5 kỷ nguyên:
- L0: Script Userland (OpenSSL / Bash)
- L1: Driver Linux C (/dev/axq)
- L2: Bare-metal Rust Microkernel
- L3: FPGA IP Core (Pipeline SHA-256 64 giai đoạn trên UltraScale+)
- L4: Vi xử lý RISC-V AXQ-V SoC với nhân NPU AI Agent 4 TOPS
- L5: Chip Quang tử & Kháng lượng tử NIST PQC.""",
    "accessibility": """Phân hệ plugins/accessibility-agents thi hành chuẩn WCAG 2.2 AA và Section 508.
Bao gồm 6 routers (accessibility-lead, web-wizard, document-wizard...) và hơn 100 kỹ năng.
Đảm bảo mọi thành phần UI và tài liệu (Plain-ASCII) không có rào cản tiếp cận.""",
    "runner": """Phân hệ infra/runner-images cung cấp mẫu máy chủ runner tự lưu trữ (Ubuntu, Windows, macOS)
để tự động hóa quá trình build nhân Linux, chạy mô phỏng Verilator và đóng gói ISO độc lập.""",
}


def print_banner():
    banner = f"""{C_CYAN}
  ██╗    ██╗██╗██╗  ██╗██╗ █████╗ ██╗     ██╗███████╗ █████╗ 
  ██║    ██║██║██║ ██╔╝██║██╔══██╗██║     ██║██╔════╝██╔══██╗
  ██║ █╗ ██║██║█████╔╝ ██║███████║██║     ██║███████╗███████║
  ██║███╗██║██║██╔═██╗ ██║██╔══██║██║     ██║╚════██║██╔══██║
  ╚███╔███╔╝██║██║  ██╗██║██║  ██║███████╗██║███████║██║  ██║
   ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚═╝  ╚═╝
=================================================================
  WIKIALISA SOVEREIGN CHAT AI CLI (axq chat / axq ai v2.0)
  Gốc Chủ Quyền: /wikialisa | Ổ đĩa: /wikialisa/mnt/w
================================================================={C_RESET}"""
    print(banner)


def get_ai_response(prompt, role_key):
    role = ROLES.get(role_key, ROLES[DEFAULT_ROLE])
    role_id = role["id"]
    role_name = role["name"]
    role_desc = role["desc"]

    system_prompt = f"""Bạn là Tác nhân Trí tuệ Nhân tạo Chủ quyền của Wikialisa Core OS & AXQ Silicon Architecture.
Vai trò hiện tại: {role_id} ({role_name}).
Trách nhiệm vai trò: {role_desc}
Nguyên tắc hoạt động:
1. Tuân thủ tuyệt đối Hiến chương WIKIALISA_CORE_IDEA.md và phân quyền thương hiệu.
2. Trả lời chính xác kỹ thuật, súc tích, chuyên sâu về Linux Kernel Ring 0, Proof-of-Kernel, RTL SystemVerilog, WCAG 2.2 AA.
3. Luôn trung thực, không bịa đặt API ngoài Linux Upstream hay tài liệu của dự án.
Ngôn ngữ: Tiếng Việt chuẩn mực kỹ thuật (hoặc tiếng Anh nếu người dùng yêu cầu)."""

    # 1. Thử kết nối Ollama cục bộ nếu có
    ollama_host = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
    try:
        req_data = json.dumps({
            "model": "mistral",
            "prompt": f"{system_prompt}\n\nNgười dùng: {prompt}\n{role_name}:",
            "stream": False
        }).encode("utf-8")
        req = urllib.request.Request(f"{ollama_host}/api/generate", data=req_data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return f"[{C_GREEN}Ollama Local SLM{C_RESET}] " + data.get("response", "").strip()
    except Exception:
        pass

    # 2. Thử Gemini API nếu có GEMINI_API_KEY
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [
                    {"role": "user", "parts": [{"text": f"{system_prompt}\n\nCâu hỏi: {prompt}"}]}
                ]
            }
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return f"[{C_CYAN}Gemini Cloud AI{C_RESET}] " + text.strip()
        except Exception as e:
            pass

    # 3. Động cơ Tri thức Lõi Cục bộ Wikialisa (Built-in Knowledge Fallback)
    p_lower = prompt.lower()
    
    if any(k in p_lower for k in ["he dieu hanh", "os", "linux", "nhan", "kernel", "bzimage"]):
        return (f"[{C_YELLOW}Wikialisa Core Knowledge{C_RESET} | {role['icon']} {role_name}]\n\n"
                f"{SOVEREIGN_KNOWLEDGE['he_dieu_hanh']}\n\n"
                f"• Đường dẫn driver: src/kernel/axq/axq_main.c\n"
                f"• Thiết bị ký tự: /dev/axq (Major 0 Dynamic Allocation)\n"
                f"• Kiểm tra trạng thái: gõ lệnh `axq status`.")

    if any(k in p_lower for k in ["axq", "subsystem", "wsl", "lenh", "cli", "command"]):
        return (f"[{C_YELLOW}Wikialisa Core Knowledge{C_RESET} | {role['icon']} {role_name}]\n\n"
                f"{SOVEREIGN_KNOWLEDGE['axq_subsystem']}\n\n"
                f"• Lệnh tra cứu nhanh: `axq help`\n"
                f"• Gắn kết đĩa: /wikialisa/mnt/w đã tự phục hồi.")

    if any(k in p_lower for k in ["pok", "dao", "mine", "dong thuan", "consensus", "nonce", "vi", "wallet"]):
        return (f"[{C_YELLOW}Wikialisa Core Knowledge{C_RESET} | {role['icon']} {role_name}]\n\n"
                f"{SOVEREIGN_KNOWLEDGE['pok']}\n\n"
                f"• Để đào thử khối mới ngay bây giờ: gõ `axq mine 0000`\n"
                f"• Để kiểm tra số dư ví: gõ `axq wallet balance`.")

    if any(k in p_lower for k in ["phan cung", "hardware", "rtl", "verilator", "fpga", "risc-v", "axq-v"]):
        return (f"[{C_YELLOW}Wikialisa Core Knowledge{C_RESET} | {role['icon']} {role_name}]\n\n"
                f"{SOVEREIGN_KNOWLEDGE['hardware']}\n\n"
                f"• Mạch băm: src/hardware/rtl/sha256_round_stage.sv (64-stage pipeline)\n"
                f"• Chạy kiểm thử RTL: gõ lệnh `axq test`.")

    if any(k in p_lower for k in ["tro nang", "accessibility", "a11y", "wcag", "screen reader"]):
        return (f"[{C_YELLOW}Wikialisa Core Knowledge{C_RESET} | {role['icon']} {role_name}]\n\n"
                f"{SOVEREIGN_KNOWLEDGE['accessibility']}\n\n"
                f"• Phân hệ: plugins/accessibility-agents\n"
                f"• Kiểm định trợ năng: gõ `axq a11y audit`.")

    if any(k in p_lower for k in ["runner", "ci", "cd", "image", "packer", "iso"]):
        return (f"[{C_YELLOW}Wikialisa Core Knowledge{C_RESET} | {role['icon']} {role_name}]\n\n"
                f"{SOVEREIGN_KNOWLEDGE['runner']}\n\n"
                f"• Phân hệ: infra/runner-images\n"
                f"• Trạng thái runner: gõ `axq runner status`.")

    # Phản hồi mặc định theo vai trò
    return (f"[{C_YELLOW}Wikialisa Core Knowledge{C_RESET} | {role['icon']} {role_name}]\n\n"
            f"Tôi là {role_name} ({role_id}).\n"
            f"Trách nhiệm: {role_desc}\n\n"
            f"Bạn có thể hỏi tôi về:\n"
            f"• Cấu hình nhân Linux tối giản và driver /dev/axq\n"
            f"• Thuật toán Proof-of-Kernel và cơ chế đào khối\n"
            f"• Mạch phần cứng RTL Verilator và vi xử lý RISC-V AXQ-V\n"
            f"• Kiểm định trợ năng WCAG 2.2 AA (axq a11y)\n"
            f"• Hạ tầng CI/CD Runner (axq runner)\n"
            f"• Hoặc gõ `/help` để xem danh sách lệnh điều khiển chat.")


def show_chat_help():
    print(f"""
{C_YELLOW}DANH SÁCH LỆNH TRONG GIAO DIỆN CHAT AI:{C_RESET}
  {C_GREEN}/roles{C_RESET}               - Hiển thị danh sách 7 vai trò tác nhân chuyên trách
  {C_GREEN}/role <tên_vai_trò>{C_RESET}  - Chuyển đổi vai trò tác nhân (sentinel, consensus, network, silicon, release, gui, a11y)
  {C_GREEN}/status{C_RESET}              - Xem trạng thái hạ tầng số Wikialisa Core
  {C_GREEN}/mine [độ_khó]{C_RESET}       - Khởi động đào PoK thử nghiệm ngay trong chat
  {C_GREEN}/wallet{C_RESET}              - Tra cứu địa chỉ và số dư ví AXQ
  {C_GREEN}/a11y{C_RESET}                - Quét kiểm định tiêu chuẩn trợ năng WCAG 2.2 AA
  {C_GREEN}/clear{C_RESET}               - Xóa sạch màn hình dòng lệnh
  {C_GREEN}/exit{C_RESET} hoặc {C_GREEN}exit{C_RESET}     - Thoát khỏi giao diện Chat AI trở về terminal
""")


def list_roles():
    print(f"\n{C_YELLOW}--- MA TRẬN 7 VAI TRÒ TÁC NHÂN AI WIKIALISA ---{C_RESET}")
    for key, r in ROLES.items():
        print(f"  {r['icon']} {C_BOLD}{key}{C_RESET} [{C_CYAN}{r['id']}{C_RESET}]: {r['name']}")
        print(f"     └─ {r['desc']}")
    print()


def interactive_chat():
    print_banner()
    current_role = DEFAULT_ROLE
    role_info = ROLES[current_role]
    print(f"{C_GREEN}Đã kích hoạt Tác nhân AI Trực tuyến.{C_RESET}")
    print(f"Vai trò hiện tại: {role_info['icon']} {C_BOLD}{role_info['name']}{C_RESET} ({role_info['id']})")
    print(f"{C_DARKGRAY if 'C_DARKGRAY' in globals() else ''}Gõ câu hỏi tự nhiên hoặc lệnh `/help` để xem trợ giúp, `/role` để đổi vai trò, `/exit` để thoát.{C_RESET}\n")

    while True:
        try:
            prompt = input(f"{C_CYAN}wikialisa-ai ({current_role})>{C_RESET} ").strip()
        except (EOFError, KeyboardInterrupt):
            print(f"\n{C_YELLOW}Tạm biệt! Đã đóng phiên trò chuyện Wikialisa AI.{C_RESET}")
            break

        if not prompt:
            continue

        if prompt in ["exit", "quit", "/exit", "/quit"]:
            print(f"{C_YELLOW}Tạm biệt! Đã đóng phiên trò chuyện Wikialisa AI.{C_RESET}")
            break

        if prompt == "/help":
            show_chat_help()
            continue

        if prompt == "/roles":
            list_roles()
            continue

        if prompt.startswith("/role"):
            parts = prompt.split()
            if len(parts) > 1 and parts[1] in ROLES:
                current_role = parts[1]
                role_info = ROLES[current_role]
                print(f"{C_GREEN}[✔] Đã chuyển đổi sang vai trò: {role_info['icon']} {role_info['name']} ({role_info['id']}){C_RESET}\n")
            else:
                print(f"{C_RED}[!] Vai trò không hợp lệ. Gõ /roles để xem danh sách.{C_RESET}\n")
            continue

        if prompt == "/status":
            os.system("axq status")
            continue

        if prompt.startswith("/mine"):
            parts = prompt.split()
            diff = parts[1] if len(parts) > 1 else "0000"
            os.system(f"axq mine {diff}")
            continue

        if prompt == "/wallet":
            os.system("axq wallet balance")
            continue

        if prompt == "/a11y":
            os.system("axq a11y audit")
            continue

        if prompt == "/clear":
            os.system("cls" if os.name == "nt" else "clear")
            print_banner()
            continue

        # Xử lý truy vấn thông thường
        print(f"\n{C_MAGENTA}Đang suy luận...{C_RESET}")
        response = get_ai_response(prompt, current_role)
        print(f"\n{response}\n")


def main():
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        response = get_ai_response(query, DEFAULT_ROLE)
        print(response)
    else:
        interactive_chat()


if __name__ == "__main__":
    main()
