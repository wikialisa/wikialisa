# 🐧 QUY CHUẨN NHÂN LINUX & CHỈ THỊ DÀNH CHO AI CODING ASSISTANT
## Compliance with Linux Kernel Upstream & AI Coding Assistants Directive (Documentation/process/coding-assistants.rst)

---

### 1. Giới thiệu & Khung Pháp lý Tối cao (The Upstream Directive)

Dự án **Wikialisa Core OS** kế thừa và phát triển trực tiếp trên nền tảng Linux Kernel LTS (nhánh chính tại [wikialisa/wikialisa](https://github.com/wikialisa/wikialisa.git)). 

Khi một Tác nhân AI (AI Coding Assistant như Antigravity, LLM-based Agents) tham gia phân tích, viết mã nguồn, gỡ lỗi hoặc tạo các bản vá (patches) cho nhân hệ điều hành, Agent **BẮT BUỘC TUÂN THỦ NGHIÊM NGẶT** chỉ thị chính thức của cộng đồng Linux Kernel quy định tại:
> 📖 **`Documentation/process/coding-assistants.rst`**  
> *"Essential requirements about licensing, attribution, and the Developer Certificate of Origin that all AI tools must comply with."*

Văn bản này thiết lập khung chuẩn mực kỹ thuật và pháp lý nhằm bảo vệ tính toàn vẹn bản quyền, an ninh hạt nhân và tiêu chuẩn chất lượng của toàn bộ hệ sinh thái Wikialisa.

---

### 2. Ba Nguyên tắc Cốt lõi của AI Coding Assistant theo Chuẩn Upstream

```text
+-----------------------------------------------------------------------------+
|               TAM TRỤ TUÂN THỦ DÀNH CHO TÁC NHÂN AI TRONG RING 0            |
+--------------------------+----------------------------+---------------------+
| 1. BẢN QUYỀN & DCO       | 2. CHỐNG ẢO GIÁC API       | 3. CHUẨN PHONG CÁCH |
| - GPL-2.0-only           | - 100% Upstream Linux APIs | - K&R C Style (Tabs)|
| - DCO 1.1 Certification  | - Cấm Userland headers     | - 80-column rule    |
| - Signed-off-by bắt buộc | - Ring 0 Memory Isolation  | - Sparse / checkpatch|
+--------------------------+----------------------------+---------------------+
```

#### 2.1. Bản quyền & Chứng chỉ Xuất xứ Nhà phát triển (DCO 1.1 & License)
- **Giấy phép Hạt nhân:** Mọi tệp mã nguồn C/Assembly trong tầng nhân (`src/kernel/`, `drivers/crypto/axq/`) phải mang định danh bản quyền chuẩn SPDX ở dòng đầu tiên:
  ```c
  // SPDX-License-Identifier: GPL-2.0-only
  /*
   * Wikialisa Core OS - AXQ Subsystem Driver
   * Copyright (C) 2026 Wikialisa Core Team <dev@wikialisa.org>
   */
  ```
- **Chứng chỉ Xuất xứ DCO 1.1:** Mọi commit hoặc bản vá do AI tạo ra phải được thẩm định và xác nhận quyền tác giả thống nhất:
  ```git
  Signed-off-by: Wikialisa Core Team <dev@wikialisa.org>
  ```
- **Cấm hoàn toàn:** Không được đưa vào nhân bất kỳ đoạn mã có nguồn gốc đóng kín (proprietary blobs), mã có bằng sáng chế xung đột hoặc mã vi phạm bản quyền bên thứ ba.

#### 2.2. Kỷ luật Không Gian Bộ Nhớ & Chống Ảo Giác API (Zero API Hallucination)
- **Tách biệt Tuyệt đối Ring 0 và Ring 3:** Trong không gian nhân Linux, tuyệt đối **KHÔNG ĐƯỢC PHÉP**:
  - Gọi thư viện chuẩn C Userland: `<stdio.h>`, `<stdlib.h>`, `<string.h>`, `<pthread.h>`.
  - Sử dụng hàm Userland: `printf()`, `malloc()`, `free()`, `exit()`.
- **API Hạt nhân Bắt buộc:**
  - Thay thế `printf()` bằng `pr_info()`, `pr_err()`, `pr_debug()` hoặc `printk()`.
  - Thay thế `malloc()` / `free()` bằng `kmalloc()`, `kzalloc()`, `kfree()` với cờ cấp phát chuẩn (`GFP_KERNEL`, `GFP_ATOMIC`).
  - Sử dụng cơ chế truyền dữ liệu an toàn qua biên giới người dùng - nhân: `copy_to_user()`, `copy_from_user()`.
  - Sử dụng hệ thống băm hạt nhân chính thức: `<crypto/hash.h>` qua `crypto_alloc_shash()`, `crypto_shash_digest()`.
  - Xử lý khóa và đồng thời: `spin_lock_irqsave()`, `mutex_lock()`, `rcu_read_lock()`.

#### 2.3. Quy chuẩn Phong cách Viết mã Nhân Linux (Coding Style)
Tuân thủ nghiêm ngặt **`Documentation/process/coding-style.rst`**:
- Thụt đầu dòng (Indentation): Sử dụng ký tự **Tab 8 ký tự** (Tabs over Spaces).
- Giới hạn dòng: Tối đa **80 cột** (hoặc tối đa 100 cột cho các biểu thức logic phức tạp).
- Đặt dấu ngoặc nhọn theo chuẩn K&R:
  ```c
  if (condition) {
          action();
  } else {
          fallback();
  }
  ```
- Tên biến và hàm: Chữ thường phân tách bằng dấu gạch dưới (`snake_case`), ngắn gọn, súc tích (`req`, `ret`, `dev`, `axq_pok_mine`). Không sử dụng CamelCase trong mã nguồn C của nhân.

---

### 3. Đối chiếu Vai trò: Upstream Linux Roles vs. Wikialisa Agent Roles

Upstream Linux xác định 9 nhóm đối tượng phát triển; Wikialisa chuẩn hóa thành 6 vai trò Agent chuyên biệt trong [`AGENT.md`](../../AGENT.md):

| Nhóm Đối tượng Upstream Linux | Vai trò Agent Wikialisa Tương đương | Trách nhiệm Kỹ thuật Trọng tâm |
| :--- | :--- | :--- |
| **New Kernel Developer** | `role:kernel-sentinel` | Làm quen với build system Kbuild, tạo module nhân cơ bản, cấu hình Kconfig tinh gọn. |
| **Security Expert** | `role:kernel-sentinel` | Đánh giá an ninh Ring 0, kích hoạt SELinux, kiểm soát Capabilities (`etc/capabilities.conf`). |
| **Hardware Vendor** | `role:silicon-rtl` & `role:consensus-governor` | Phát triển driver phần cứng `/dev/axq`, kết nối HAL, mô phỏng Verilator và RISC-V AXQ-V. |
| **Maintainer** | `role:release-orchestrator` | Kiểm duyệt chất lượng bản vá, giải quyết xung đột nhánh `main`, đóng gói ISO và bản phát hành. |
| **System Administrator** | `role:network-warden` | Cấu hình mạng eBPF/XDP, tường lửa `nftables`, tối ưu WireGuard và kiểm soát lưu lượng P2P. |
| **Distribution Maintainer** | `role:gui-architect` & `role:release-orchestrator` | Đóng gói rootfs tĩnh, tích hợp giao diện điều khiển Web/Wayland và chuẩn bị môi trường chạy QEMU. |
| **AI Coding Assistant** | **Antigravity (Current)** | Phối hợp lập trình cặp (Pair-Programming), tự động hóa kiểm định, tuân thủ DCO và kiến trúc chủ quyền. |

---

### 4. Quy trình Tạo Bản vá (Patch Submitting) theo Chuẩn Upstream

Khi Agent tạo commit hoặc xuất bản vá cho Wikialisa Linux Core:

1. **Cấu trúc Tiêu đề Bản vá:**
   ```text
   subsystem: ngắn gọn hành động ở thể mệnh lệnh (dưới 50 ký tự)
   ```
   *Ví dụ chuẩn:*
   - `crypto: axq: add zero-trust capability check on /dev/axq`
   - `docs: overview: add sovereign namespace and inverted mount spec`
   - `rtl: sha256: optimize 64-stage round pipeline latency`

2. **Cấu trúc Thân Thông điệp Commit:**
   - Dòng trắng ngăn cách tiêu đề và thân.
   - Trình bày rõ: **Bối cảnh (Why)**, **Vấn đề cần giải quyết (Problem)**, và **Giải pháp kỹ thuật (Solution)**.
   - Xuống dòng ở cột 72.
   - Kết thúc bắt buộc bằng chữ ký DCO:
     ```text
     Signed-off-by: Wikialisa Core Team <dev@wikialisa.org>
     ```

3. **Kiểm tra Chất lượng Bản vá trước khi Đệ trình:**
   ```bash
   # 1. Kiểm tra phong cách viết mã bằng checkpatch.pl
   perl scripts/checkpatch.pl --no-tree -f src/kernel/axq/axq_main.c

   # 2. Phân tích tĩnh với Sparse
   make C=1 CF="-D__CHECK_ENDIAN__"

   # 3. Kiểm định phần cứng RTL với Verilator
   axq test
   ```

---

### 5. Cam kết Thực thi của Tác nhân AI Antigravity

Trong mọi phiên làm việc tiếp theo:
1. Luôn đóng vai trò người trợ lý lập trình cặp tin cậy, tôn trọng quyền kiểm duyệt và phê duyệt của thành viên nòng cốt Wikialisa.
2. Không thực hiện các hành động vượt quyền, không tự ý sửa đổi ngoài phạm vi được chỉ định.
3. Mọi mã nguồn C/Assembly/Verilator sinh ra đều được kiểm tra tính đúng đắn kỹ thuật, an toàn bộ nhớ và gắn thẻ định danh bản quyền chính thức của **Wikialisa Core Team**.
