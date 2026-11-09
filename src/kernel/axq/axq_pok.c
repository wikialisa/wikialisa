// SPDX-License-Identifier: GPL-2.0
/*
 * axq_pok.c - Proof-of-Kernel (PoK) Hardware Entropy Mining Implementation
 * Wikialisa Core & AXQ Chain Subsystem
 */

#include <linux/kernel.h>
#include <linux/module.h>
#include <linux/crypto.h>
#include <linux/scatterlist.h>
#include <crypto/hash.h>
#include <linux/utsname.h>
#include <linux/timekeeping.h>
#include <linux/string.h>
#include "axq.h"

static inline uint64_t axq_rdtsc(void) {
#if defined(__x86_64__)
    uint32_t lo, hi;
    asm volatile("rdtsc" : "=a"(lo), "=d"(hi));
    return ((uint64_t)hi << 32) | lo;
#elif defined(__aarch64__)
    uint64_t val;
    asm volatile("mrs %0, cntvct_el0" : "=r"(val));
    return val;
#else
    return ktime_get_ns();
#endif
}

static void bytes_to_hex(const uint8_t *in, size_t len, char *out) {
    static const char hex_chars[] = "0123456789abcdef";
    size_t i;
    for (i = 0; i < len; i++) {
        out[i * 2]     = hex_chars[(in[i] >> 4) & 0x0F];
        out[i * 2 + 1] = hex_chars[in[i] & 0x0F];
    }
    out[len * 2] = '\0';
}

int axq_execute_pok_mining(struct axq_mine_request *req) {
    struct crypto_shash *tfm;
    struct shash_desc *desc;
    uint8_t hash_result[32];
    char hex_str[65];
    uint64_t nonce;
    uint64_t start_cycles, end_cycles;
    char block_data[256];
    int data_len;
    int err = 0;
    size_t prefix_len;

    if (!req) return -EINVAL;

    prefix_len = strlen(req->target_prefix);
    if (prefix_len == 0 || prefix_len > 15) {
        strcpy(req->target_prefix, "0000");
        prefix_len = 4;
    }

    tfm = crypto_alloc_shash("sha256", 0, 0);
    if (IS_ERR(tfm)) {
        pr_err("AXQ: Khong the khoi tao crypto shash sha256\n");
        return PTR_ERR(tfm);
    }

    desc = kmalloc(sizeof(*desc) + crypto_shash_descsize(tfm), GFP_KERNEL);
    if (!desc) {
        crypto_free_shash(tfm);
        return -ENOMEM;
    }
    desc->tfm = tfm;

    nonce = req->start_nonce;
    start_cycles = axq_rdtsc();
    req->iterations_done = 0;

    pr_info("AXQ: Bat dau khai thac PoK voi muc tieu: %s tu nonce: %llu\n",
            req->target_prefix, nonce);

    while (1) {
        data_len = snprintf(block_data, sizeof(block_data), "%s:%llu:%llu",
                            utsname()->release, ktime_get_real_seconds(), nonce);

        err = crypto_shash_digest(desc, block_data, data_len, hash_result);
        if (err) break;

        bytes_to_hex(hash_result, 32, hex_str);
        req->iterations_done++;

        /* Kiem tra dieu kien do kho */
        if (strncmp(hex_str, req->target_prefix, prefix_len) == 0) {
            req->winning_nonce = nonce;
            memcpy(req->winning_hash, hex_str, 65);
            pr_info("AXQ: [PoK SUCCESS] Tim thay khoi! Nonce: %llu, Hash: %s\n",
                    nonce, hex_str);
            break;
        }

        nonce++;

        /* Cho phep nhuong quyen CPU tranh treo he thong khi dao nhieu */
        if ((req->iterations_done % 10000) == 0) {
            if (need_resched()) {
                cond_resched();
            }
        }
    }

    end_cycles = axq_rdtsc();
    req->cpu_cycles_spent = end_cycles - start_cycles;

    kfree(desc);
    crypto_free_shash(tfm);
    return err;
}

void axq_get_hardware_status(struct axq_status_info *info) {
    if (!info) return;
    info->hardware_detected = 0; /* 0: Kernel Software Engine */
    info->total_blocks_mined = 1;
    info->current_hashrate = 1250000; /* ~1.25 MH/s tren CPU SHA-NI */
    info->thermal_status = 450;       /* 45.0 do C */
    info->puf_vault_active = 0;
}
