# 🏛️ SỔ TAY THÀNH VIÊN & ĐỊNH CHẾ QUẢN TRỊ NỘI BỘ WIKIALISA
### *Wikialisa Core Member Handbook, Internal Security & Governance Specification*
> **"Danh Dự, Trách Nhiệm và Sự Toàn Vẹn Tuyệt Đối Trong Từng Dòng Lệnh"**  
> *Tài liệu định hướng và quy chuẩn bắt buộc dành riêng cho các thành viên chính thức, kỹ sư nòng cốt và người duy trì phân hệ (Maintainers) của hệ sinh thái Wikialisa Core OS & AXQ Silicon Architecture.*

---

## 📑 MỤC LỤC TỔNG QUAN

1. [Sứ Mệnh & Trách Nhiệm Thành Viên (Member Mission)](#1-sứ-mệnh--trách-nhiệm-thành-viên)
2. [Cơ Cấu Tổ Chức & Cấp Bậc Thành Viên (Membership Tiers)](#2-cơ-cấu-tổ-chức--cấp-bậc-thành-viên)
3. [Quy Chuẩn An Ninh Bắt Buộc (Mandatory Security Protocol)](#3-quy-chuẩn-an-ninh-bắt-buộc)
4. [Tam Giác Quản Trị Vận Hành: Pháp Lý - Thiết Kế - DevOps (Legal, Design & DevOps Triad)](#4-tam-giác-quản-trị-vận-hành-pháp-lý---thiết-kế---devops)
5. [Quy Trình Quản Trị Mã Nguồn & Bản Ghi ADR (Branching & ADR Process)](#5-quy-trình-quản-trị-mã-nguồn--bản-ghi-adr)
6. [Cơ Chế Biểu Quyết & Ra Quyết Định (Consensus Voting)](#6-cơ-chế-biểu-quyết--ra-quyết-định)
7. [Kênh Giao Tiếp Kỹ Thuật & Ứng Phó Khẩn Cấp (Communication & Incident Response)](#7-kênh-giao-tiếp-kỹ-thuật--ứng-phó-khẩn-cấp)
8. [Hệ Thống Đãi Ngộ & Ghi Nhận Công Trạng (Meritocracy & Incentives)](#8-hệ-thống-đãi-ngộ--ghi-nhận-công-trạng)

---

## 1. SỨ MỆNH & TRÁCH NHIỆM THÀNH VIÊN

Là một thành viên chính thức của **Wikialisa**, bạn không đơn thuần là một lập trình viên phần mềm, mà là **người bảo vệ hạ tầng số chủ quyền vĩnh cửu** cho nhân loại. Mỗi quyết định kỹ thuật của bạn:
- Tác động trực tiếp đến an ninh của các hệ thống máy chủ chính phủ, ngân hàng và doanh nghiệp.
- Định hình sự an toàn của hàng triệu giao dịch trên chuỗi khối AXQ Chain.
- Ảnh hưởng đến sự tin cậy của các vi mạch bán dẫn AXQ Silicon khi xuất xưởng từ nhà máy đúc chip (Foundry).

### Lời Thề Thành Viên Lõi (Core Member Pledge):
> *"Tôi cam kết giữ gìn tính toàn vẹn, độc lập và bảo mật tối đa của hệ thống Wikialisa; không thỏa hiệp với các lợi ích ngắn hạn; không đưa cửa sau (backdoors) hay mã độc vào hệ thống; và luôn đặt quyền tự chủ công nghệ của cộng đồng lên trên hết."*

---

## 2. CƠ CẤU TỔ CHỨC & CẤP BẬC THÀNH VIÊN

Hệ thống thành viên được phân cấp theo năng lực thực chứng (Meritocracy) và trách nhiệm an ninh:

```
                      [Sovereign Architect]
                     (Hội đồng Kiến trúc Sư Lõi)
                                ▲
                                │
                    [Core Subsystem Maintainers]
              (Trưởng Phân hệ: Kernel / RTL / Protocol / GUI)
                                ▲
                                │
                    [Active Members & Engineers]
                   (Thành viên Thường trực Dự án)
                                ▲
                                │
                     [Community Contributors]
                    (Cộng tác viên Đóng góp Mở)
```

| Cấp Bậc (Tier) | Danh Xưng | Quyền Hạn Kỹ Thuật | Tiêu Chí Bổ Nhiệm / Duy Trì |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Sovereign Architect** | - Quyền phê duyệt tối cao nhánh `main`.<br/>- Nắm giữ khóa Root GPG phát hành ISO.<br/>- Quyền phủ quyết các thay đổi Hiến pháp. | Được bầu chọn bởi Hội đồng sáng lập; cống hiến vượt bậc và trung thành tuyệt đối với sứ mệnh chủ quyền. |
| **Tier 2** | **Core Maintainer** | - Quyền merge PR vào phân hệ phụ trách.<br/>- Quản lý issue, roadmap của subsystem.<br/>- Ký duyệt các bản ghi kỹ thuật ADR. | Đã dẫn dắt thành công ít nhất 1 phân hệ cốt lõi (Kernel, RTL, Protocol, hoặc GUI) trong tối thiểu 6 tháng. |
| **Tier 3** | **Active Member** | - Quyền triage issue và review mã nguồn.<br/>- Được gắn nhãn thành viên tổ chức GitHub.<br/>- Tham gia các cuộc họp kỹ thuật kín. | Có tối thiểu 3 Pull Request giá trị cao được merge; vượt qua quy trình thẩm định bảo mật cá nhân. |
| **Tier 4** | **Community Contributor** | - Đóng góp mã nguồn qua Fork & PR.<br/>- Tham gia thảo luận trên diễn đàn mở. | Mọi cá nhân tuân thủ [`CONTRIBUTING.md`](CONTRIBUTING.md). |

---

## 3. QUY CHUẨN AN NINH BẮT BUỘC (MANDATORY SECURITY PROTOCOL)

Thành viên từ **Tier 3 trở lên** bắt buộc phải thiết lập môi trường làm việc theo tiêu chuẩn Zero-Trust:

### 3.1. Xác Thực Đa Yếu Tố Bằng Khóa Phần Cứng (Hardware 2FA)
- Tài khoản GitHub, email kỹ sư và máy chủ quản trị bắt buộc phải bật 2FA bằng thiết bị phần cứng vật lý (FIDO2 / WebAuthn như YubiKey hoặc Nitrokey).
- Cấm sử dụng SMS 2FA do nguy cơ tấn công SIM swap.

### 3.2. Chữ Ký Số GPG Cho Mọi Commit (Mandatory GPG Commit Signing)
Mọi commit đẩy lên repository chính thức bắt buộc phải có chữ ký số GPG hợp lệ (Verified Badge trên GitHub):
```bash
# Cấu hình khóa GPG cá nhân trong Git
git config --global user.signingkey <GPG_KEY_ID>
git config --global commit.gpgsign true
git config --global tag.gpgSign true

# Thực hiện commit với chữ ký số
git commit -S -m "feat(rtl): tích hợp mạch kiểm tra parity cho SHA-256"
```

### 3.3. Bảo Vệ Máy Trạm Làm Việc (Workstation Hardening)
- Toàn bộ ổ đĩa máy trạm phát triển phải được mã hóa toàn phần (Full Disk Encryption - LUKS trên Linux hoặc BitLocker trên Windows).
- Cấm lưu trữ khóa riêng tư ví, SSH private key hoặc API token dưới dạng tệp văn bản thô không mã hóa.
- Phải khóa màn hình ngay khi rời khỏi vị trí làm việc.

---

## 4. TAM GIÁC QUẢN TRỊ VẬN HÀNH: PHÁP LÝ - THIẾT KẾ - DEVOPS

Hệ sinh thái Wikialisa áp dụng mô hình phân định chi tiết về **Vai trò, Quyền hạn và Nghĩa vụ** giữa 3 trụ cột hợp tác: **Pháp lý & Tuân thủ (Legal)**, **Thiết kế (UI/UX & Design)**, và **Hạ tầng & Vận hành (DevOps/SRE)** nhằm bảo đảm tính chuyên nghiệp, an toàn tuyệt đối và chuẩn mực quốc tế:

### 4.1. Trụ Cột Pháp Lý & Tuân Thủ (Luật / Legal & Compliance)
- **Vai trò:**
  - Định hình khung pháp lý, đảm bảo toàn bộ hệ điều hành, giao thức tài chính AXQ Chain và cổng kết nối AXIOLEDGER tuân thủ đầy đủ các chuẩn mực quốc tế (FATF Travel Rule, ISO 20022, GDPR, ISO 27001 và các quy định về Fintech/Web3/Cryptocurrency).
  - Kiểm soát rủi ro pháp lý, bảo hộ sở hữu trí tuệ, bản quyền GPL-2.0, nhãn hiệu thương hiệu và quyền xuất khẩu phần cứng mật mã học.
- **Quyền hạn:**
  - **Quyền Phủ quyết (Veto Power):** Có quyền tạm dừng hoặc yêu cầu chỉnh sửa bất kỳ tính năng, luồng dữ liệu, hợp đồng thông minh hay chiến dịch phát hành nào có nguy cơ vi phạm pháp luật hoặc vi phạm giấy phép mở GPL-2.0.
  - **Quyền Truy vấn & Kiểm toán (Audit Power):** Yêu cầu đội ngũ DevOps/Dev/Design cung cấp tài liệu kỹ thuật, sơ đồ luồng dữ liệu (Data flow) và chính sách bảo vệ bộ nhớ để đánh giá mức độ tuân thủ.
  - **Quyền Duyệt Điều khoản & Quy chế:** Đại diện phê duyệt cuối cùng cho Điều khoản dịch vụ (ToS), Chính sách quyền riêng tư (Privacy Policy), Khung xác thực eKYC/AML và Hợp đồng định chế AXIOLEDGER.
- **Nghĩa vụ:**
  - Cập nhật kịp thời biến động luật pháp quốc tế để tham mưu cho Ban Kiến trúc và điều chỉnh quy trình vận hành.
  - Xây dựng chuẩn mực tuân thủ bắt buộc (Quy trình Travel Rule, báo cáo giao dịch bất thường STR, bảo vệ dữ liệu phi tập trung).
  - Bảo đảm nguyên tắc Riêng tư Mặc định (Privacy by Design) được tích hợp ngay từ khâu thiết kế vi mạch và giao thức.

### 4.2. Trụ Cột Thiết Kế (Thiết Kế / UI/UX & Product Design)
- **Vai trò:**
  - Nghiên cứu, định hình trải nghiệm người dùng (UX) và giao diện trực quan (UI) xuyên suốt: từ biểu tượng ASCII Heritage Art trên dòng lệnh `/init`, Web Control Center, ứng dụng máy trạm AXQ Studio (Rust/Tauri) đến bộ tổng hợp cửa sổ `Wikialisa-Shell` (Wayland).
  - Chuyển hóa các cấu trúc phần cứng, mật mã học phức tạp và yêu cầu pháp lý thành giao diện trực quan, rõ ràng, thân thiện với người dùng.
- **Quyền hạn:**
  - **Quyền Định hình Trải nghiệm (UX Ownership):** Quyết định luồng thao tác (User Journey), bố cục giao diện, hệ thống nhận diện thương hiệu (Design System) và các phần tử tương tác.
  - **Quyền Yêu cầu Chuẩn hóa:** Buộc đội ngũ Frontend tuân thủ đúng Design System, UI Kit, hiệu ứng và khoảng cách (pixel-perfect) đã phê duyệt.
  - **Quyền Thử nghiệm (A/B Testing & Research):** Chủ động phỏng vấn người dùng, chạy thử nghiệm các phiên bản giao diện để tối ưu hóa tính tiện dụng và độ an toàn thao tác.
- **Nghĩa vụ:**
  - Đảm bảo tính minh bạch trên giao diện, **tuyệt đối không sử dụng Dark Patterns** (các thiết kế đánh lừa người dùng trong phê duyệt giao dịch hay cấu hình nút).
  - Tích hợp đầy đủ và tự nhiên các điểm chạm pháp lý/xác thực (nút đồng ý điều khoản, hộp thoại cảnh báo sao lưu khóa riêng tư, luồng eKYC định chế).
  - Bàn giao tài liệu thiết kế (Figma, SVG, Design Tokens) đầy đủ, nhất quán để đội ngũ phát triển dễ dàng tích hợp.

### 4.3. Trụ Cột Hạ Tầng & Vận Hành (DevOps / Infrastructure & SRE)
- **Vai trò:**
  - Xây dựng, duy trì và tối ưu hóa hạ tầng máy chủ, cụm nút hạt giống (Seed Nodes), luồng tự động hóa phát hành (CI/CD Pipeline), kiểm định phần cứng RTL và bảo đảm tính sẵn sàng 24/7.
  - Thiết lập hàng rào bảo mật Zero-Trust (`nftables`, WireGuard, eBPF/XDP), giám sát hiệu năng và khắc phục sự cố hệ thống.
- **Quyền hạn:**
  - **Quyền Kiểm soát Môi trường (Environment Access Control):** Quản lý toàn bộ quyền truy cập vào máy chủ Production, Staging, CI/CD runners và danh mục tài nguyên phần cứng.
  - **Quyền Tự động hóa & Khóa Triển khai (Deployment Block):** Tự động chặn hoặc từ chối phát hành các bản build không đạt tiêu chuẩn (dung lượng `bzImage >= 8MB`, Verilator linting có cảnh báo, hoặc bài test QEMU thất bại).
  - **Quyền Cấu hình Hạ tầng & Toolchain:** Tự chủ lựa chọn công cụ triển khai, phiên bản trình biên dịch (GCC, Clang, Verilator) và phân bổ tài nguyên phù hợp.
- **Nghĩa vụ:**
  - Đảm bảo chỉ số cam kết chất lượng dịch vụ (SLA / Uptime >= 99.99%) cho các nút mạng công cộng và kế hoạch phục hồi sau thảm họa (Disaster Recovery).
  - Bảo mật hạ tầng: Mã hóa dữ liệu lưu trữ (Data at Rest via Btrfs/zstd/dm-crypt) và dữ liệu truyền tải (Data in Transit via WireGuard/TLS 1.3), quản lý khóa và bí mật an toàn (Secrets Management).
  - Duy trì nhật ký kiểm toán hệ thống (Audit Logs) phục vụ công tác truy vết và đáp ứng yêu cầu thanh tra của bộ phận Pháp lý.

---

### 4.4. Ma Trận Phối Hợp Trách Nhiệm RACI (Wikialisa RACI Matrix)

| Hoạt động / Sản phẩm bàn giao cốt lõi | Luật (Legal) | Thiết kế (Design) | DevOps & SRE |
| :--- | :---: | :---: | :---: |
| **Xác thực eKYC & Tuân thủ Travel Rule (AXIOLEDGER)** | **A** (Chủ trì & Phê duyệt) | **R** (Thiết kế luồng UI/UX) | **C** (Hỗ trợ hạ tầng lưu trữ bảo mật) |
| **Xây dựng Design System, Tokens & UI Kit** | **I** (Theo dõi tuân thủ ToS) | **A / R** (Chủ trì & Thực thi) | **C** (Hỗ trợ cấu hình Assets/CDN) |
| **Quy trình CI/CD, Kernel Build & Verilator Lint** | **I** (Theo dõi bản quyền) | **I** (Theo dõi) | **A / R** (Chủ trì & Thực thi tự động) |
| **Ứng phó Sự cố Lộ Dữ liệu / Tấn công Bảo mật** | **A** (Xử lý pháp lý & công bố) | **I** (Cập nhật banner cảnh báo) | **R** (Khoanh vùng & Khắc phục kỹ thuật) |
| **Kiểm định Bản quyền Giấy phép GPL-2.0 & Nhãn hiệu**| **A / R** (Thẩm định & Quyết định) | **I** (Tuân thủ Brand Guidelines) | **C** (Quét mã nguồn tự động) |
| **Thiết kế & Tích hợp Cảnh báo Sao lưu Khóa Riêng tư** | **C** (Rà soát pháp lý rủi ro) | **A / R** (Thiết kế cảnh báo trực quan) | **C** (Kiểm tra cơ chế xóa sạch RAM) |
| **Phát hành Bản Phân Phối ISO Kép Chính Thức** | **C** (Duyệt điều khoản đi kèm) | **C** (Duyệt banner & hình ảnh) | **A / R** (Đóng gói, Ký số & Phát hành) |

*Ghi chú: **R** (Responsible - Người trực tiếp thực hiện), **A** (Accountable - Người chịu trách nhiệm cao nhất/Phê duyệt), **C** (Consulted - Người được tham vấn chuyên môn), **I** (Informed - Người nhận thông tin).*

---

## 5. QUY TRÌNH QUẢN TRỊ MÃ NGUỒN & BẢN GHI ADR

### 5.1. Quy Ước Nhánh & Bảo Vệ Nhánh (Branch Protection)
- **Nhánh `main`:** Nhánh ổn định cao nhất, luôn sẵn sàng xuất bản ISO release.
  - Được bảo vệ tuyệt đối: Cấm `git push --force`, cấm commit trực tiếp.
  - Bắt buộc phải có **tối thiểu 2 phê duyệt độc lập (2-Person Rule)** từ Core Maintainers.
  - Bắt buộc vượt qua 100% bài kiểm tra CI/CD (Verilator Lint, Kernel build, QEMU Expect test).
- **Nhánh `release-*`:** Dành cho việc chuẩn bị phát hành các phiên bản lớn (ví dụ: `release-v1.0.0`).
- **Nhánh `feat/*` & `fix/*`:** Nhánh phát triển tính năng, phải được rebase cập nhật với `main` trước khi mở PR.

### 5.2. Bản Ghi Quyết Định Kiến Trúc (Architectural Decision Records - ADR)
Mọi thay đổi lớn tác động đến kiến trúc lõi (thay đổi cờ Kconfig, sửa đổi bảng mã lệnh AXQ-V ISA, thay đổi thuật toán PoK) bắt buộc phải tạo một tệp bản ghi ADR trong thư mục `docs/adr/` theo định dạng:
```text
docs/adr/
└── ADR-0001-chuyen-doi-pok-sang-hardware-entropy.md
```
Nội dung ADR bao gồm:
1. **Ngữ cảnh (Context):** Vấn đề kỹ thuật hiện tại là gì?
2. **Quyết định (Decision):** Đề xuất giải pháp và công nghệ lựa chọn.
3. **Hệ quả (Consequences):** Lợi ích, rủi ro, và tác động tương thích ngược.

---

## 6. CƠ CHẾ BIỂU QUYẾT & RA QUYẾT ĐỊNH (CONSENSUS VOTING)

Hệ sinh thái Wikialisa vận hành theo nguyên tắc đồng thuận kỹ thuật (Rough Consensus & Running Code):

1. **Biểu Quyết Thay Đổi Kiến Trúc Lớn:**
   - Cần tối thiểu **2/3 (67%)** số phiếu thuận của các Core Maintainers và không bị phủ quyết bởi Sovereign Architect.
   - Thời gian mở biểu quyết trên GitHub Discussion: tối thiểu 72 giờ.
2. **Xử Lý Sự Cố An Ninh Khẩn Cấp (Hotfix Fast-track):**
   - Trong trường hợp phát hiện lỗ hổng nghiêm trọng (Zero-day / Remote Code Execution):
     - Cho phép kích hoạt quy trình phê duyệt khẩn cấp với **2 chữ ký số độc lập** từ Core Maintainers phụ trách Security.
     - Sau khi vá nóng, phải công bố báo cáo hậu sự cố (Post-Mortem Analysis) trong vòng 48 giờ.

---

## 7. KÊNH GIAO TIẾP KỸ THUẬT & ỨNG PHÓ KHẨN CẤP

- **Kênh Thảo Luận Kỹ Thuật Công Khai:** GitHub Discussions và Issues cho các chủ đề mở.
- **Kênh Điều Phối Nội Bộ Mã Hóa Đầu-Cuối:** Sử dụng ứng dụng liên lạc phi tập trung mã hóa (Matrix Protocol / Signal) cho các trao đổi nội bộ ban kiến trúc.
- **Báo Cáo Lỗ Hổng Bảo Mật Tuyệt Mật:**
  - Tuyệt đối không mở Public Issue cho các lỗ hổng chưa có bản vá.
  - Gửi báo cáo mã hóa PGP về địa chỉ: `security@wikialisa.org`.

---

## 8. HỆ THỐNG ĐÃI NGỘ & GHI NHẬN CÔNG TRẠNG (MERITOCRACY)

Những đóng góp tận tụy của thành viên luôn được tôn vinh xứng đáng:

1. **Ghi Danh Lịch Sử Vĩnh Viễn:**
   - Tên và chữ ký GPG của thành viên được lưu vĩnh viễn trong tệp `AUTHORS.md` của mã nguồn và được ghi dấu vào **Khối Khởi Sinh (Genesis Block)** của mạng lưới AXQ Chain.
2. **Phân Bổ Quỹ Đóng Góp Hệ Sinh Thái ($AXQ Ecosystem Grants):**
   - Các thành viên duy trì phân hệ được nhận trợ cấp tài chính định kỳ từ quỹ phi tập trung AXQ Foundation.
3. **Quyền Biểu Quyết Trong Liên Bang DAO:**
   - Nắm giữ quyền biểu quyết quản trị hạ tầng (Governance Weight) trong tương lai khi mạng lưới tiến hóa lên Kỷ nguyên DAO toàn diện.

---
*Sổ tay này có hiệu lực kể từ ngày phê chuẩn và là kim chỉ nam danh dự cho mọi hành động của thành viên Wikialisa.*

