# Ghost Interceptor Design Direction

## Identity & Purpose
Ghost Interceptor is an Operational Ad-Spend Protector & Batch E-Commerce Inventory Auditor for performance marketers and warehouse QA teams on `1366x668` and wider screens.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 1

## Color Palette & Verified Contrast
- Canvas Background: `#0D0D0D` (reduces glare during continuous QA inspection on 1366x668 monitors)
- Surface Background: `#141414` (separates product cards, batch master table, variant matrix, and log panels from the main canvas)
- Primary Text: `#F5F5F5` (17.83:1 on `#0D0D0D`, 16.90:1 on `#141414`, WCAG AAA)
- Secondary Text: `#A3A3A3` (7.70:1 on `#0D0D0D`, 7.30:1 on `#141414`, WCAG AAA)
- Component Borders: `#666666` for interactive controls (3.38:1 on `#0D0D0D`, passes WCAG 1.4.11 non-text contrast) and `#262626` for structural section dividers
- Primary Action Accent: `#FF5C00` with `#0D0D0D` label text (6.28:1 contrast, reserved for primary audit triggers, active mode tabs, focus rings, and active Set-of-Mark badges)
- Semantic Ad-Spend Verdict Palette (3 Core Status Colors):
  1. `SCALE / AMAN DIIKLANKAN`: `#4ADE80` (11.15:1 on `#0D0D0D` and `#0D0D0D` on `#4ADE80`, WCAG AAA)
  2. `PERINGATAN: STOK KRITIS`: `#FACC15` (12.69:1 on `#0D0D0D` and `#0D0D0D` on `#FACC15`, WCAG AAA)
  3. `PAUSE ADS SEKARANG! (BAHAYA BONCOS)`: `#F87171` (7.03:1 on `#0D0D0D` and `#0D0D0D` on `#F87171`, WCAG AAA)

## Typography & Hierarchy
- Primary UI Font: `Plus Jakarta Sans` and `Inter` (chosen for clear Indonesian and English legibility at 14px to 26px on 1366x668 screens)
- Data & Numeric Font: `JetBrains Mono` (used only for Rupiah prices, size codes, Golden Size ratios, SKU identifiers, and Set-of-Mark badges `#1` to `#N`)
- Minimum Size Standard:
  - Body copy, batch master table rows, variant matrix rows, and real-time audit log entries: `14px` to `15px` (`text-sm` / `text-[15px]`) with `line-height: 1.5`
  - Badges and metadata labels: minimum `12px` (`text-xs`), never smaller
  - Product Title (`<h1>`): `22px` to `26px` (`text-xl` / `text-2xl`), `font-bold`, rendered in full without truncation
  - Product Price: `24px` to `28px` (`text-2xl` / `text-3xl`), `font-bold`

## Layout & One-Line Decisions (R-31)
- Color reason: `#0D0D0D` canvas with `#F5F5F5` and `#A3A3A3` text guarantees >7:1 AAA contrast while reserving `#4ADE80`, `#FACC15`, and `#F87171` strictly for verified Ad-Spend Protection verdicts (`SCALE`, `WARNING`, `PAUSE ADS`).
- Layout reason: Dual-mode top bar (Single Deep Audit vs Batch Category Sweeper) feeds into an executive batch summary table and a 60%/40% 2-column deep product inspector so marketers can sweep a catalog, export CSVs, and inspect individual SKU sizes without losing context.
- Typography reason: Sans-serif (`Plus Jakarta Sans` / `Inter`) handles full product titles, business reasons, and audit logs cleanly at >=14px, while `JetBrains Mono` aligns numeric prices, Golden Size percentages, and fractional shoe sizes.
- Spacing reason: Compact 16px to 24px structural padding fits `1366x668` viewports while keeping all interactive buttons at a minimum `44x44px` touch and click target.
- Component structure reason: Real product photo, Golden Size Ad-Spend Verdict card, Set-of-Mark size buttons (`#1`..`#N`), and CSV export bar directly serve performance marketing and warehouse restock workflows.
