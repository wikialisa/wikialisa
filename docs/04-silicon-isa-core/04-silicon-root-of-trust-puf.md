# 🛡️ PHẦN CỨNG GỐC TIN CẬY VÀ VÂN TAY SILICON (SILICON ROOT-OF-TRUST & PUF)
### *Physical Unclonable Functions (PUF), On-Chip Key Vault & Anti-Tamper Mechanisms*

---

## 1. NGUY CƠ BỊ ĐÁNH CẮP KHÓA VÀ HẠN CHẾ CỦA BỘ NHỚ LƯU TRỮ

Trong tài liệu [`DOCS.MD`](../../DOCS.MD), khóa riêng tư của ví `wallet.dat` được lưu trên ổ đĩa máy chủ và bảo vệ bằng mật khẩu AES-256. Mặc dù chuẩn AES-256 về mặt toán học là an toàn, việc lưu trữ khóa dưới dạng tĩnh (Static Storage on Disk/Flash) luôn tiềm ẩn các nguy cơ:
- Trích xuất dữ liệu qua chip Flash ROM hoặc bus bộ nhớ SPI.
- Lực lượng tấn công có thể tháo rời ổ cứng để tấn công bẻ khóa ngoại tuyến (Offline Brute-Force).

Để đưa an ninh của AXQ lên tầm **Định chế Tài chính Quốc tế (Institutional-Grade)**, vi xử lý AXQ-1 áp dụng nguyên lý:
> **"Không lưu trữ khóa bí mật ở bất kỳ đâu — Khóa riêng tư chỉ tồn tại trong các định luật vật lý lượng tử của chính con chip khi nó đang hoạt động."**

---

## 2. NGUYÊN LÝ HOẠT ĐỘNG CỦA SRAM PUF (PHYSICALLY UNCLONABLE FUNCTION)

```
                 NGUYÊN LÝ VÂN TAY VẬT LÝ SILICON (SRAM PUF)
   Quá trình sản xuất bán dẫn (Biến thiên vi mô ở cấp độ phân tử ngẫu nhiên)
                                  │
                                  ▼
      +-------------------------------------------------------+
      | MẢNG SRAM PUF 4096 TẾ BÀO (Uninitialized Power-Up)    |
      |   - Tế bào 0: Điện áp ngưỡng cao hơn -> Luôn bật lên 1|
      |   - Tế bào 1: Điện áp ngưỡng thấp hơn -> Luôn bật lên 0|
      |   - Tế bào 2: Cân bằng điện áp        -> Luôn bật lên 1|
      |   ... (Mỗi con chip sản xuất ra đều có một mẫu duy nhất)|
      +---------------------------+---------------------------+
                                  │
                                  ▼
      [ Bộ Sửa lỗi Kỹ thuật số: Fuzzy Extractor & Helper Data ]
                                  │
                                  ▼
      [ Khóa Gốc Bất biến 256-bit (Root Cryptographic Key) ]
                                  │
                                  ▼
      [ AXQ Silicon Key Vault (Chỉ dùng nội bộ cho lệnh Ký số) ]
```

### Ưu điểm vượt trội của PUF:
1. **Không thể sao chép vật lý (Unclonable):** Ngay cả nhà máy đúc chip (TSMC hay Intel) với cùng dây chuyền và bản vẽ bán dẫn cũng không thể tạo ra con chip thứ hai có cùng mẫu SRAM PUF.
2. **Khóa biến mất hoàn toàn khi mất điện:** Khi máy chủ tắt nguồn, khóa bí mật không còn tồn tại ở bất kỳ dạng vật lý nào (Zero Remanence).

---

## 3. BUỒNG KHÓA RIÊNG TƯ TRÊN SILICON (AXQ SILICON KEY VAULT)

Khóa riêng tư sau khi được tái tạo từ PUF được lưu trữ bên trong một buồng thanh ghi phần cứng cô lập (**Hardware Key Vault**):
- **Không có đường đọc ra bus:** Các bus dữ liệu của CPU, DMA, JTAG gỡ lỗi đều bị ngắt kết nối vật lý với Key Vault.
- **Thực thi chữ ký một chiều:** CPU chỉ có thể gửi thông điệp giao dịch (Transaction Hash) vào buồng Vault; mạch logic bên trong buồng sẽ tự động lấy khóa bí mật để tính toán chữ ký Secp256k1 và chỉ trả ra chữ ký công khai $(R, S)$.
- Không một dòng lệnh mã độc hay lỗ hổng phần mềm nào có thể đọc ngược được giá trị của Private Key.

---

## 4. HỆ THỐNG PHÒNG THỦ CAN THIỆP VẬT LÝ (ANTI-TAMPER SHIELDS)

Vi xử lý AXQ-1 được bao bọc bởi các lớp bảo vệ vật lý đa tầng:

```
+---------------------------------------------------------------+
| ACTIVE METAL SHIELD (Lưới kim loại bảo vệ trên bề mặt die chip)|
| - Phát hiện mũi khoan vi mô hoặc tia laser bóc tách lớp oxide  |
+---------------------------------------------------------------+
| SENSORS ĐIỆN ÁP & XUNG NHỊP (Glitch & Undervoltage Detectors) |
| - Phát hiện việc cố tình giảm điện áp đột ngột để gây lỗi tính|
+---------------------------------------------------------------+
| SENSORS NHIỆT ĐỘ & ÁNH SÁNG (Thermal & Photodiode Sensors)    |
| - Phát hiện việc mở nắp chip phơi sáng dưới kính hiển vi quang |
+---------------------------------------------------------------+
```

### Cơ chế phản ứng tự vệ tức thì:
Khi bất kỳ cảm biến nào bị kích hoạt, mạch an ninh phần cứng độc lập sẽ phóng điện tích làm ngắn mạch và **xóa sạch toàn bộ dữ liệu Helper Data trong 10 pico-giây**, biến phiến silicon thành một khối vật chất trung tính vĩnh viễn không thể khôi phục lại tài sản.

