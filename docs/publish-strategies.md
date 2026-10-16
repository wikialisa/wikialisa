# Chiến Lược Đẩy Thư Viện Lên Tổ Chức `wikialisa`

> Ba mẫu sơ đồ CI/CD từ đơn giản → phức tạp, thiết kế để **mở rộng dễ dàng** khi monorepo lớn dần.

---

## Mẫu 1 — Tag-Triggered Publish (Hiện tại đang dùng)

> **Khi nào dùng:** Team nhỏ, release thủ công, ít packages.  
> **Mở rộng:** Thêm package mới chỉ cần khai báo vào `deploy/npm/scripts/publish-all.mjs`.

```mermaid
flowchart TD
    DEV["👨‍💻 Developer\npush code lên main"] --> TAG["🏷️ Tạo git tag\ngit tag v1.0.2 && git push origin v1.0.2"]
    TAG --> GH_TRIGGER["⚡ GitHub Actions\npublish-npm.yml\non: push tags: v*"]

    GH_TRIGGER --> INSTALL["pnpm install\n--frozen-lockfile"]
    INSTALL --> BUILD["turbo run build\n--filter='./packages/*'"]
    BUILD --> TEST["turbo run test\n--filter='./packages/*'"]
    TEST --> PUBLISH["node deploy/npm/scripts/publish-all.mjs"]

    PUBLISH --> NPMJS["📦 npmjs.com\n@wikialisa/core-sdk\n@wikialisa/types\n@wikialisa/ui-kit\n@wikialisa/config\n@wikialisa/merchant-sdk"]
    PUBLISH --> GH_PKG["🐙 GitHub Packages\nnpm.pkg.github.com\n@wikialisa/*"]

    style DEV fill:#e8f4fd,stroke:#3b82d4
    style TAG fill:#fff3cd,stroke:#f59e0b
    style GH_TRIGGER fill:#f0fdf4,stroke:#22c55e
    style NPMJS fill:#fef3c7,stroke:#d97706
    style GH_PKG fill:#ede9fe,stroke:#7c5cd8
```

### Cấu trúc thư mục mở rộng

```
packages/
├── core-sdk/          ← đã publish
├── merchant-sdk/      ← đã publish
├── types/             ← đã publish
├── config/            ← đã publish
├── ui-kit/            ← đã publish
├── swift-adapter/     ← thêm vào publish-all.mjs khi sẵn sàng
└── [package-mới]/     ← khai báo 1 dòng là xong
```

**Thêm package mới** — chỉ cần thêm 1 dòng vào [`deploy/npm/scripts/publish-all.mjs`](../deploy/npm/scripts/publish-all.mjs):

```js
const PUBLISHABLE = [
  "packages/core-sdk",
  "packages/merchant-sdk",
  "packages/swift-adapter",   // ← thêm vào đây
  // ...
];
```

---

## Mẫu 2 — Changeset Release Flow (Khuyến nghị — Scalable)

> **Khi nào dùng:** Nhiều contributor, cần changelog tự động, version độc lập cho từng package.  
> **Mở rộng:** Mỗi package tự quản version; GitHub Actions tự tạo PR "Version Packages" và publish.

```mermaid
flowchart TD
    DEV["👨‍💻 Developer\nthêm tính năng vào packages/core-sdk"] 
    --> CS_ADD["pnpm changeset add\n→ tạo file .changeset/abc123.md\n  mô tả: major/minor/patch"]
    CS_ADD --> PR["🔀 Mở Pull Request\nvào main"]
    PR --> CI["✅ CI checks\nturbo lint + test + typecheck"]
    CI --> MERGE["Merge vào main"]

    MERGE --> CS_ACTION{"⚡ changesets/action\nphát hiện .changeset/*.md?"}

    CS_ACTION -- "Có file changeset" --> VERSION_PR["📝 Tạo/Update PR\n'chore: version packages'\nbump version + cập nhật CHANGELOG.md"]
    VERSION_PR --> REVIEW["👀 Review & Merge\nVersion PR"]
    REVIEW --> PUBLISH_JOB["🚀 Job: Publish\npnpm build + test\nchangeset publish"]

    CS_ACTION -- "Không có file" --> SKIP["⏭️ Bỏ qua\nkhông làm gì"]

    PUBLISH_JOB --> NPMJS["📦 npmjs.com\n@wikialisa/* (chỉ package thay đổi)"]
    PUBLISH_JOB --> GIT_TAG["🏷️ Tự động tạo git tags\n@wikialisa/core-sdk@1.1.0\n@wikialisa/types@1.0.2"]

    style DEV fill:#e8f4fd,stroke:#3b82d4
    style CS_ADD fill:#fff3cd,stroke:#f59e0b
    style MERGE fill:#f0fdf4,stroke:#22c55e
    style CS_ACTION fill:#fef9c3,stroke:#ca8a04
    style VERSION_PR fill:#ede9fe,stroke:#7c5cd8
    style NPMJS fill:#fef3c7,stroke:#d97706
    style GIT_TAG fill:#dcfce7,stroke:#16a34a
```

### Workflow file — `.github/workflows/changeset-release.yml`

Đã có sẵn trong repo. Secrets cần thiết:

| Secret | Nơi set | Mô tả |
|---|---|---|
| `NPM_TOKEN` | `github.com/orgs/wikialisa/settings/secrets` | npmjs.com access token |
| `GITHUB_TOKEN` | Tự động có | Tạo PR + push tags |

**Thêm package mới** — không cần config gì thêm. Package nào có `"private": false` trong `package.json` sẽ tự được publish khi có changeset.

---

## Mẫu 3 — Matrix Publish với Per-Package Repo (Độc lập hoàn toàn)

> **Khi nào dùng:** Mỗi package có vòng đời, team owner, và CI riêng. Scale lên 20+ packages.  
> **Mở rộng:** Thêm package = thêm repo riêng vào org `wikialisa`, tự động detect qua matrix.

```mermaid
flowchart TD
    MONO["📁 Monorepo\nwikialisa/wikialisa\n(source of truth)"]

    MONO --> DETECT["🔍 turbo run build --dry\nDetect changed packages"]

    DETECT --> MATRIX["⚡ GitHub Actions Matrix\njobs: [core-sdk, merchant-sdk, types, ...]"]

    MATRIX --> JOB_A["Job: core-sdk\nbuild → test → publish"]
    MATRIX --> JOB_B["Job: merchant-sdk\nbuild → test → publish"]
    MATRIX --> JOB_C["Job: types\nbuild → test → publish"]
    MATRIX --> JOB_N["Job: [new-package]\nbuild → test → publish"]

    JOB_A --> NPM_A["📦 @wikialisa/core-sdk"]
    JOB_A --> REPO_A["🐙 wikialisa/core-sdk\n(mirror repo riêng)"]

    JOB_B --> NPM_B["📦 @wikialisa/merchant-sdk"]
    JOB_B --> REPO_B["🐙 wikialisa/merchant-sdk"]

    JOB_C --> NPM_C["📦 @wikialisa/types"]
    JOB_C --> REPO_C["🐙 wikialisa/types"]

    JOB_N --> NPM_N["📦 @wikialisa/[new]"]
    JOB_N --> REPO_N["🐙 wikialisa/[new]"]

    style MONO fill:#e8f4fd,stroke:#3b82d4
    style DETECT fill:#fff3cd,stroke:#f59e0b
    style MATRIX fill:#f0fdf4,stroke:#22c55e
    style JOB_A fill:#ede9fe,stroke:#7c5cd8
    style JOB_B fill:#ede9fe,stroke:#7c5cd8
    style JOB_C fill:#ede9fe,stroke:#7c5cd8
    style JOB_N fill:#fce7f3,stroke:#ec4899
    style NPM_N fill:#fce7f3,stroke:#ec4899
    style REPO_N fill:#fce7f3,stroke:#ec4899
```

### Workflow matrix — thêm package mới chỉ thêm 1 dòng

```yaml
# .github/workflows/publish-matrix.yml
jobs:
  publish:
    strategy:
      matrix:
        package:
          - { dir: packages/core-sdk,     name: "@wikialisa/core-sdk" }
          - { dir: packages/merchant-sdk,  name: "@wikialisa/merchant-sdk" }
          - { dir: packages/types,         name: "@wikialisa/types" }
          - { dir: packages/config,        name: "@wikialisa/config" }
          - { dir: packages/ui-kit,        name: "@wikialisa/ui-kit" }
          # ↓ Thêm package mới tại đây
          - { dir: packages/swift-adapter, name: "@wikialisa/swift-adapter" }
    steps:
      - name: Publish ${{ matrix.package.name }}
        run: npm publish ${{ matrix.package.dir }} --access public
```

---

## So sánh 3 mẫu

| Tiêu chí | Mẫu 1 (Tag) | Mẫu 2 (Changeset) | Mẫu 3 (Matrix) |
|---|:---:|:---:|:---:|
| Độ phức tạp setup | ⭐ Thấp | ⭐⭐ Trung bình | ⭐⭐⭐ Cao |
| Tự động changelog | ❌ | ✅ | ✅ (tùy cấu hình) |
| Version độc lập từng package | ❌ Cùng tag | ✅ | ✅ |
| Phù hợp khi | < 5 packages | 5–20 packages | 20+ packages |
| CI time | Nhanh | Trung bình | Song song, nhanh nhất |
| Thêm package mới | Sửa 1 file | Không cần sửa | Thêm 1 dòng matrix |
| **Trạng thái** | ✅ Đang dùng | 🔧 Đã có workflow | 📋 Kế hoạch |

---

## Lộ trình đề xuất

```
Hiện tại          → 3 tháng           → 6 tháng+
Mẫu 1 (Tag)       → Mẫu 2 (Changeset) → Mẫu 3 (Matrix)
manual release       auto changelog       per-package CI
5 packages           5–10 packages        10–20+ packages
```

> **Hành động tiếp theo:**  
> 1. Chạy `pnpm changeset add` sau mỗi PR có thay đổi package  
> 2. Set secret `NPM_TOKEN` tại `github.com/orgs/wikialisa/settings/secrets/actions`  
> 3. Workflow `changeset-release.yml` sẽ tự xử lý phần còn lại
