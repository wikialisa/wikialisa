---
name: wikialisa-smart-contract
description: Use when the user wants to write, review, or extend an Anchor/Rust smart contract program for the Wikialisa/AXQ ecosystem — covers PDA seeds, CpiContext patterns, events, errors, and account validation following the project's existing conventions.
---

# Wikialisa Smart Contract — Anchor/Rust Coding Standard

Khi skill này được kích hoạt, hãy tuân thủ **chặt chẽ** tất cả các quy tắc sau khi viết hoặc review bất kỳ Anchor program nào trong `programs/`.

---

## 1. Cấu trúc File Bắt buộc

Mỗi program phải có cấu trúc phân section rõ ràng theo thứ tự sau:

```rust
use anchor_lang::prelude::*;
// các use khác

declare_id!("...");   // Program ID thực — KHÔNG dùng placeholder 111...

/// ─── Program ──────────────────────────────────────────────────────────────
#[program]
pub mod <tên_module> {
    // instructions
}

// ─── Params ───────────────────────────────────────────────────────────────── (nếu cần)
// ─── Accounts ─────────────────────────────────────────────────────────────
// ─── State ────────────────────────────────────────────────────────────────
// ─── Events ───────────────────────────────────────────────────────────────
// ─── Errors ───────────────────────────────────────────────────────────────
```

---

## 2. PDA Seeds — Quy tắc Chuẩn Dự Án

**Pattern bắt buộc:** mọi PDA đều dùng string literal prefix + discriminator bytes.

```rust
// ✅ ĐÚNG — theo pattern dự án
seeds = [b"order_state", order_id.as_ref()]
seeds = [b"escrow_vault", order_id.as_ref()]
seeds = [b"governance_config"]
seeds = [b"whitelist", wallet.as_ref()]
seeds = [b"bridge_state"]

// ❌ SAI — không dùng PublicKey hoặc biến không deterministic làm seed
seeds = [authority.key().as_ref()]  // không rõ ràng
```

**Bump storage:** luôn lưu bump trong account state và dùng lại:

```rust
// Trong account struct:
pub bump: u8,

// Khi init:
entry.bump = ctx.bumps.account_name;

// Khi dùng signer PDA:
let seeds: &[&[u8]] = &[b"seed_prefix", id.as_ref(), &[state.bump]];
let signer = &[seeds];
CpiContext::new_with_signer(..., signer)
```

---

## 3. CpiContext — Token Transfer Pattern

**Inbound (user → vault):** dùng `CpiContext::new` với authority là user Signer.

```rust
let cpi_ctx = CpiContext::new(
    ctx.accounts.token_program.to_account_info(),
    Transfer {
        from:      ctx.accounts.user_ata.to_account_info(),
        to:        ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    },
);
token::transfer(cpi_ctx, amount)?;
```

**Outbound (vault → recipient):** dùng `CpiContext::new_with_signer` với PDA làm authority.

```rust
let seeds: &[&[u8]] = &[b"seed", id.as_ref(), &[state.bump]];
let signer = &[seeds];
let cpi_ctx = CpiContext::new_with_signer(
    ctx.accounts.token_program.to_account_info(),
    Transfer {
        from:      ctx.accounts.vault.to_account_info(),
        to:        ctx.accounts.recipient_ata.to_account_info(),
        authority: ctx.accounts.state_account.to_account_info(),
    },
    signer,
);
token::transfer(cpi_ctx, amount)?;
```

**Mint:** dùng `MintTo` với governance PDA làm authority.

```rust
let seeds: &[&[u8]] = &[b"governance_config", &[cfg.bump]];
let signer = &[seeds];
let cpi_ctx = CpiContext::new_with_signer(
    ctx.accounts.token_program.to_account_info(),
    MintTo {
        mint:      ctx.accounts.axvn_mint.to_account_info(),
        to:        ctx.accounts.recipient_ata.to_account_info(),
        authority: ctx.accounts.governance_config.to_account_info(),
    },
    signer,
);
token::mint_to(cpi_ctx, amount)?;
```

---

## 4. Account Constraints — Quy tắc Validation

```rust
// Authority check — luôn dùng constraint thay vì check thủ công trong body
#[account(mut, constraint = config.authority == signer.key())]
pub signer: Signer<'info>,

// Token account ownership check
#[account(mut, constraint = user_ata.owner == user.key())]
pub user_ata: Account<'info, TokenAccount>,

// Mint match check
#[account(mut, constraint = token_mint.key() == config.expected_mint)]
pub token_mint: Account<'info, Mint>,

// PDA với seeds + bump tường minh
#[account(seeds = [b"prefix", id.as_ref()], bump = state.bump)]
pub state: Account<'info, StateStruct>,
```

---

## 5. Events — Bắt buộc emit cho mọi state change

Mỗi instruction phải emit ít nhất 1 event để indexer bắt được:

```rust
#[event]
pub struct ActionDone {
    pub actor:  Pubkey,
    pub amount: u64,
    pub ref_id: [u8; 32],
}

// Trong instruction:
emit!(ActionDone { actor: ctx.accounts.user.key(), amount, ref_id });
```

---

## 6. Errors — Custom error với message rõ ràng

```rust
#[error_code]
pub enum ProgramError {
    #[msg("Order is not in OPEN status")]
    OrderNotOpen,
    #[msg("Max supply cap exceeded")]
    SupplyCapExceeded,
    #[msg("Recipient wallet is not whitelisted")]
    NotWhitelisted,
    #[msg("Amount is zero")]
    ZeroAmount,
}

// Dùng require! thay vì if/return Err
require!(state.status == Status::Open, ProgramError::OrderNotOpen);
require!(amount > 0, ProgramError::ZeroAmount);
```

---

## 7. Account Space Calculation — LEN constant

Mỗi account struct phải có `LEN` constant:

```rust
impl MyState {
    // discriminator(8) + Pubkey(32) + Option<Pubkey>(1+32) + u64(8) + u8(1)
    pub const LEN: usize = 8 + 32 + (1 + 32) + 8 + 1;
}
```

Tính theo: `8` (discriminator) + size từng field:
- `Pubkey` = 32
- `u64` = 8, `u32` = 4, `u16` = 2, `u8` = 1, `bool` = 1
- `[u8; N]` = N
- `Option<T>` = 1 + size(T)
- `String` = 4 + max_len

---

## 8. Checklist trước khi submit code

Trước khi đề xuất bất kỳ contract code nào, xác nhận tất cả:

- [ ] Program ID không phải placeholder `111...`
- [ ] Mọi PDA dùng string literal prefix chuẩn dự án
- [ ] Bump được lưu trong state và tái sử dụng (không recompute bằng `find_program_address`)
- [ ] Mọi CpiContext vault-out dùng `new_with_signer`
- [ ] Mọi constraint validation dùng `#[account(constraint = ...)]` không phải manual check
- [ ] Mọi instruction emit ít nhất 1 `#[event]`
- [ ] Mọi error dùng `#[error_code]` với message tiếng Anh rõ ràng
- [ ] `LEN` constant được tính chính xác
- [ ] Arithmetic dùng `checked_add/checked_sub` hoặc `saturating_*` cho supply tracking
- [ ] Không có `unwrap()` trong production code — dùng `?` operator hoặc `require!`

---

## 9. Tham chiếu các programs hiện có

Khi viết program mới, đọc và theo đúng pattern của:
- `programs/AXVN-p2p-escrow/src/lib.rs` — P2P escrow, vault pattern
- `programs/AXVN-mint-governance/src/lib.rs` — mint/burn, whitelist, supply cap
- `programs/AXVN-swift-bridge/evm/VNKRSwiftBridgeV2.sol` — EVM bridge pattern (nếu viết Solidity)
- `programs/AXVN-swift-bridge/solana/src/lib.rs` — Solana bridge pattern
