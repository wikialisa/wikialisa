# 🔮 BẢO MẬT KHÁNG LƯỢNG TỬ PHẦN CỨNG (POST-QUANTUM CRYPTOGRAPHY)
### *Hardware Acceleration for NIST PQC Standards: ML-KEM (Kyber) & ML-DSA (Dilithium)*

---

## 1. MỐI ĐE DỌA CỦA MÁY TÍNH LƯỢNG TỬ ĐỐI VỚI BLOCKCHAIN

Trong [`DOCS.MD`](../../DOCS.MD), mạng lưới AXQ Chain và Bitcoin Core dựa trên thuật toán đường cong Elliptic (ECDSA Secp256k1).
- Khi máy tính lượng tử đạt quy mô hàng ngàn qubit vật lý (sử dụng thuật toán **Shor**), toàn bộ khóa riêng tư có thể bị đảo ngược từ khóa công khai chỉ trong vài phút.
- Đối với một hạ tầng phần cứng có vòng đời phục vụ định chế hàng thập kỷ, việc chuẩn bị sẵn năng lực **Kháng lượng tử (Post-Quantum Readiness)** trên phiến silicon là yêu cầu sinh tử.

---

## 2. TÍCH HỢP CÁC CHUẨN MẬT MÃ KHÁNG LƯỢNG TỬ NIST VÀO SILICON

Vi xử lý **AXQ-1 Gen 2** tích hợp sẵn bộ vi gia tốc phần cứng cho hai thuật toán mật mã mạng tinh thể (Lattice-Based Cryptography) chính thức được NIST chuẩn hóa:

1. **ML-KEM (CRYSTALS-Kyber):** Cơ chế đóng gói khóa kháng lượng tử (Key Encapsulation Mechanism) để mã hóa đường truyền P2P và các kênh liên lạc giữa các node.
2. **ML-DSA (CRYSTALS-Dilithium):** Thuật toán chữ ký số kháng lượng tử dùng để ký các khối và giao dịch tài chính AXQ.

```
+-------------------------------------------------------------+
| AXQ POST-QUANTUM HARDWARE CO-PROCESSOR                      |
|                                                             |
|  [ NTT / INTT Engine (Number Theoretic Transform) ]         |
|  - Nhân đa thức bậc 256/512 trong trường hữu hạn q=8380417   |
|  - Đường ống 8 tầng, hoàn thành phép biến đổi trong 128 ns  |
|                                                             |
|  [ Gaussian & Uniform Sampler (Hardware Keccak PRNG) ]      |
|  - Lấy mẫu hệ số đa thức phân phối ngẫu nhiên liên tục      |
|                                                             |
|  [ Hybrid Dual-Signer Unit ]                                |
|  - Ký đồng thời: Secp256k1 (Cổ điển) + Dilithium (Lượng tử)  |
+-------------------------------------------------------------+
```

---

## 3. CƠ CHẾ KÝ LAI GHÉP KÉP (HYBRID DUAL-SIGNATURE SCHEME)

Để đảm bảo khả năng tương thích ngược với hệ sinh thái ví Web3 hiện tại nhưng vẫn kháng lượng tử 100%, AXQ-V cung cấp lệnh hợp ngữ phần cứng `axq.sign.hybrid`:

```
               QUY TRÌNH KÝ LAI GHÉP TRÊN PHẦN CỨNG
                         [ Giao dịch AXQ ]
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       [ Secp256k1 Engine ]            [ Dilithium Engine ]
                 │                               │
                 ▼                               ▼
       Chữ ký Cổ điển (64B)            Chữ ký Lượng tử (2.4KB)
                 └───────────────┬───────────────┘
                                 │
                                 ▼
         [ Chữ ký Lai ghép Hợp nhất: An toàn Tuyệt đối ]
```

### Lợi ích của Kiến trúc Lai ghép:
- Nếu một trong hai thuật toán bị phát hiện có điểm yếu toán học trong tương lai, tài sản của người dùng vẫn được bảo vệ nguyên vẹn bởi thuật toán còn lại.
- Bộ giải mã NTT trên chip giúp xác minh chữ ký Dilithium chỉ mất **1.8 micro-giây** (nhanh gấp 200 lần so với thư viện phần mềm C/Rust chạy trên CPU x86 thông thường).

