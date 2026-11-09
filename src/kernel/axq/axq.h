/* SPDX-License-Identifier: GPL-2.0 */
#ifndef _LINUX_CRYPTO_AXQ_H
#define _LINUX_CRYPTO_AXQ_H

#include <linux/types.h>
#include <linux/ioctl.h>

#define AXQ_DEV_NAME       "axq"
#define AXQ_CLASS_NAME     "axq_crypto"
#define AXQ_DRIVER_VERSION "1.0.0-silicon"

/* Định nghĩa IOCTL Magic Number */
#define AXQ_IOCTL_MAGIC    'A'

/* Cấu trúc yêu cầu khai thác khối Proof-of-Kernel (PoK) */
struct axq_mine_request {
    char target_prefix[16];     /* Tiền tố yêu cầu, ví dụ: "0000" */
    __u32 target_zeros;         /* Số bit hoặc ký tự 0 yêu cầu */
    __u64 start_nonce;          /* Nonce xuất phát */
    __u64 winning_nonce;        /* Nonce chiến thắng (kết quả trả về) */
    char winning_hash[65];      /* Chuỗi mã băm Hex kết quả (64 chars + null) */
    __u64 iterations_done;      /* Tổng số chu kỳ đã thử nghiệm */
    __u64 cpu_cycles_spent;     /* Số chu kỳ CPU đã tiêu tốn (RDTSC) */
};

/* Cấu trúc trạng thái phần cứng và entropy */
struct axq_status_info {
    __u32 hardware_detected;    /* 0: CPU Only, 1: FPGA PCIe, 2: Silicon AXQ-V */
    __u64 total_blocks_mined;   /* Số khối đã đào thành công */
    __u64 current_hashrate;     /* Tốc độ băm hiện tại (H/s) */
    __u32 thermal_status;       /* Nhiệt độ cảm biến (đơn vị: 0.1 C) */
    __u8  puf_vault_active;     /* 1 nếu buồng khóa PUF đang hoạt động */
};

/* Các lệnh IOCTL */
#define AXQ_IOCTL_MINE_BLOCK   _IOWR(AXQ_IOCTL_MAGIC, 1, struct axq_mine_request)
#define AXQ_IOCTL_GET_STATUS   _IOR(AXQ_IOCTL_MAGIC, 2, struct axq_status_info)
#define AXQ_IOCTL_RESET_STATS  _IO(AXQ_IOCTL_MAGIC, 3)

/* Nguyên mẫu hàm PoK cấp nhân */
int axq_execute_pok_mining(struct axq_mine_request *req);
void axq_get_hardware_status(struct axq_status_info *info);

#endif /* _LINUX_CRYPTO_AXQ_H */

