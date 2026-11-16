"use client";

import React from "react";
import {
  AdVerdictCode,
  InterceptProductTarget,
  QuadrantCode,
  VariantAuditRow,
} from "../lib/ghost-engine";

interface LiveInterceptorViewportProps {
  target: InterceptProductTarget | null;
  selectedVariantIdx: number;
  isLoading: boolean;
  isCheckingCompetitors: boolean;
  errorMessage: string | null;
  ctaProbed: boolean;
  onSelectVariant: (index: number) => void;
  onProbeCta: () => void;
  onRetryAudit: () => void;
  onRunCompetitorRadar: () => void;
}

function getVerdictStyle(code: AdVerdictCode): {
  badgeBg: string;
  borderColor: string;
  barColor: string;
  textColor: string;
} {
  if (code === "PAUSE_ADS") {
    return {
      badgeBg: "bg-[#F87171] text-[#0D0D0D]",
      borderColor: "border-[#F87171]",
      barColor: "bg-[#F87171]",
      textColor: "text-[#F87171]",
    };
  }
  if (code === "WARNING") {
    return {
      badgeBg: "bg-[#FACC15] text-[#0D0D0D]",
      borderColor: "border-[#FACC15]",
      barColor: "bg-[#FACC15]",
      textColor: "text-[#FACC15]",
    };
  }
  return {
    badgeBg: "bg-[#4ADE80] text-[#0D0D0D]",
    borderColor: "border-[#4ADE80]",
    barColor: "bg-[#4ADE80]",
    textColor: "text-[#4ADE80]",
  };
}

function getQuadrantStyle(q: QuadrantCode): {
  badgeBg: string;
  borderColor: string;
  textColor: string;
} {
  if (q === "KUADRAN_1") {
    return {
      badgeBg: "bg-[#F87171] text-[#0D0D0D]",
      borderColor: "border-[#F87171]",
      textColor: "text-[#F87171]",
    };
  }
  if (q === "KUADRAN_2") {
    return {
      badgeBg: "bg-[#FF5C00] text-[#0D0D0D]",
      borderColor: "border-[#FF5C00]",
      textColor: "text-[#FF5C00]",
    };
  }
  if (q === "KUADRAN_4") {
    return {
      badgeBg: "bg-[#FACC15] text-[#0D0D0D]",
      borderColor: "border-[#FACC15]",
      textColor: "text-[#FACC15]",
    };
  }
  return {
    badgeBg: "bg-[#4ADE80] text-[#0D0D0D]",
    borderColor: "border-[#4ADE80]",
    textColor: "text-[#4ADE80]",
  };
}

export default function LiveInterceptorViewport({
  target,
  selectedVariantIdx,
  isLoading,
  isCheckingCompetitors,
  errorMessage,
  ctaProbed,
  onSelectVariant,
  onProbeCta,
  onRetryAudit,
  onRunCompetitorRadar,
}: LiveInterceptorViewportProps) {
  if (isLoading && !target) {
    return (
      <section
        aria-label="Visual Produk dan Peta Elemen"
        aria-busy="true"
        className="w-full h-full bg-[#0D0D0D] p-5 lg:p-6 flex flex-col justify-center items-center"
      >
        <div className="max-w-md w-full border border-[#666666] bg-[#141414] p-6 text-left">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#FF5C00] mb-2">
            MEMPROSES HTML DOM NYATA
          </div>
          <h1 className="text-xl font-bold text-[#F5F5F5] mb-2">
            Mengambil data langsung dari halaman produk...
          </h1>
          <p className="text-sm text-[#A3A3A3] leading-relaxed">
            Sistem sedang mengunduh dokumen HTML asli, membaca tag judul{" "}
            <code className="font-mono text-[#F5F5F5]">&lt;h1&gt;</code>, elemen
            harga, foto produk, variasi ukuran, serta menghitung rasio Golden
            Size.
          </p>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section
        aria-label="Status Gagal Audit Halaman"
        role="alert"
        className="w-full h-full bg-[#0D0D0D] p-5 lg:p-6 flex flex-col justify-center items-center"
      >
        <div className="max-w-lg w-full border-2 border-[#F87171] bg-[#141414] p-6">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#F87171] mb-2">
            GAGAL MENGAMBIL DOM HALAMAN
          </div>
          <h1 className="text-xl font-bold text-[#F5F5F5] mb-2">
            Halaman produk tidak dapat diakses
          </h1>
          <p className="text-sm text-[#F5F5F5] leading-relaxed mb-3">
            {errorMessage}
          </p>
          <p className="text-sm text-[#A3A3A3] leading-relaxed mb-5">
            Sesuai kebijakan kejujuran data, sistem tidak membuat harga atau
            stok karangan. Pastikan URL produk aktif dan dapat diakses.
          </p>
          <button
            type="button"
            onClick={onRetryAudit}
            className="min-h-[44px] px-5 py-2.5 bg-[#FF5C00] text-[#0D0D0D] font-sans text-sm font-bold hover:bg-[#F5F5F5] active:bg-[#A3A3A3] transition-colors"
          >
            Coba Audit Ulang
          </button>
        </div>
      </section>
    );
  }

  if (!target) {
    return (
      <section
        aria-label="Status Kosong Visual Produk"
        className="w-full h-full bg-[#0D0D0D] p-5 lg:p-6 flex flex-col justify-center items-center"
      >
        <div className="max-w-md w-full border border-[#666666] bg-[#141414] p-6">
          <h1 className="text-xl font-bold text-[#F5F5F5] mb-2">
            Belum ada halaman produk yang diaudit
          </h1>
          <p className="text-sm text-[#A3A3A3] leading-relaxed mb-4">
            Masukkan URL halaman produk e-commerce pada kolom di atas lalu tekan
            tombol Audit Halaman Produk untuk membedah struktur DOM aslinya.
          </p>
          <button
            type="button"
            onClick={onRetryAudit}
            className="min-h-[44px] px-5 py-2.5 bg-[#FF5C00] text-[#0D0D0D] font-sans text-sm font-bold hover:bg-[#F5F5F5] active:bg-[#A3A3A3] transition-colors"
          >
            Audit Halaman Produk Sekarang
          </button>
        </div>
      </section>
    );
  }

  const activeVariant: VariantAuditRow | undefined =
    target.variants[selectedVariantIdx] ?? target.variants[0];

  const displayedPrice =
    activeVariant && activeVariant.exactPrice !== "TIDAK TERDETEKSI"
      ? activeVariant.exactPrice
      : target.basePriceDisplay;

  const ctaSomNumber = `#${target.variants.length + 1}`;
  const isSelectedInStock = activeVariant
    ? activeVariant.inStock
    : target.ctaAvailable;

  const { adProtection, competitors, quadrantDecision } = target;
  const verdictStyle = getVerdictStyle(adProtection.verdictCode);
  const quadStyle = quadrantDecision
    ? getQuadrantStyle(quadrantDecision.quadrantId)
    : null;

  return (
    <section
      aria-label="Visual Produk dan Peta Elemen Nyata"
      className="w-full h-full bg-[#0D0D0D] p-4 lg:p-6 overflow-y-auto flex flex-col gap-5"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262626] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-block w-2.5 h-2.5 bg-[#4ADE80]" />
          <span className="text-sm font-semibold text-[#F5F5F5]">
            Visual Produk, Kelayakan Iklan &amp; Peta Elemen DOM Asli
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#A3A3A3]">
          <span>
            Platform:{" "}
            <strong className="font-mono text-[#F5F5F5]">
              {target.platformDetected}
            </strong>
          </span>
          <span>
            Domain:{" "}
            <strong className="font-mono text-[#F5F5F5]">
              {target.domain}
            </strong>
          </span>
          {isLoading && (
            <span className="font-mono text-xs text-[#FF5C00]">
              (Memperbarui DOM...)
            </span>
          )}
        </div>
      </div>

      {/* AD-SPEND PROTECTION & GOLDEN SIZE VERDICT BANNER */}
      <div
        className={`bg-[#141414] border-2 ${verdictStyle.borderColor} p-4 lg:p-5 flex flex-col gap-3`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-[#A3A3A3]">
              KEPUTUSAN PROTEKSI BUDGET IKLAN:
            </span>
            <span
              className={`px-3 py-1 font-mono text-xs font-bold uppercase ${verdictStyle.badgeBg}`}
            >
              {adProtection.verdictBadge}
            </span>
          </div>
          <span className="px-2.5 py-1 bg-[#0D0D0D] border border-[#666666] font-mono text-xs text-[#F5F5F5]">
            custom_label_0: {adProtection.customLabel0}
          </span>
        </div>

        {/* Golden Size Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0D0D0D] border border-[#262626] p-3.5">
          <div>
            <div className="text-xs text-[#A3A3A3]">
              Rasio {adProtection.sizeCategoryLabel}
            </div>
            <div
              className={`text-xl font-mono font-bold mt-0.5 ${verdictStyle.textColor}`}
            >
              {adProtection.goldenSizeRatioPct}% (
              {adProtection.goldenSizesAvailable}/
              {adProtection.goldenSizesTotal} Ukuran Utama)
            </div>
            <div className="w-full h-2 bg-[#141414] border border-[#262626] mt-2">
              <div
                className={`h-full ${verdictStyle.barColor}`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, adProtection.goldenSizeRatioPct)
                  )}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-[#A3A3A3]">
              Golden Size Tersedia vs Habis
            </div>
            <div className="text-sm font-mono font-bold text-[#F5F5F5] mt-1">
              Ready:{" "}
              <span className="text-[#4ADE80]">
                {adProtection.goldenAvailableList.length > 0
                  ? adProtection.goldenAvailableList.join(", ")
                  : "TIDAK ADA"}
              </span>
            </div>
            <div className="text-xs font-mono text-[#A3A3A3] mt-1">
              Habis:{" "}
              {adProtection.goldenMissingList.length > 0
                ? adProtection.goldenMissingList.join(", ")
                : "Tidak ada"}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#A3A3A3]">
              Kedalaman Stok Fisik (Inventory Depth)
            </div>
            <div className="text-xl font-mono font-bold text-[#F5F5F5] mt-0.5">
              {adProtection.totalInventoryUnits !== null
                ? `${adProtection.totalInventoryUnits} Unit Tersisa`
                : `${target.availableVariantsCount} Varian Aktif`}
            </div>
            <div className="text-xs text-[#A3A3A3] mt-1">
              {adProtection.singleUnitVariantSizes.length > 0
                ? `Rawan Habis (1 unit): Ukuran ${adProtection.singleUnitVariantSizes.join(
                    ", "
                  )}`
                : "Berdasarkan data kuantitas DOM halaman"}
            </div>
          </div>
        </div>

        {/* Business Reason & Waste Risk Note */}
        <div className="space-y-1 text-sm leading-relaxed">
          <p className="text-[#F5F5F5] font-medium">
            {adProtection.verdictReason}
          </p>
          <p className={`font-medium ${verdictStyle.textColor}`}>
            {adProtection.wasteRiskNote}
          </p>
        </div>
      </div>

      {/* Product Card: Real Scraped Product Photo + Primary Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-[#141414] border border-[#262626] p-4 lg:p-5">
        {/* Product Image Column */}
        <div className="md:col-span-5 flex flex-col">
          <div className="relative w-full aspect-square bg-[#0D0D0D] border border-[#262626] flex items-center justify-center overflow-hidden">
            {target.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={target.imageUrl}
                alt={target.imageAlt || target.productTitle}
                width={600}
                height={600}
                fetchPriority="high"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="p-4 text-center">
                <p className="font-mono text-sm font-semibold text-[#A3A3A3]">
                  FOTO PRODUK TIDAK TERDETEKSI
                </p>
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[#A3A3A3]">
            <span>Sumber: og:image / Galeri Utama</span>
            <a
              href={target.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5F5F5] underline hover:text-[#FF5C00]"
            >
              Buka Halaman Asli
            </a>
          </div>
        </div>

        {/* Primary Product Metadata Column */}
        <div className="md:col-span-7 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            {/* Brand & Category Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-[#0D0D0D] border border-[#666666] text-xs font-semibold text-[#F5F5F5]">
                Merek: {target.brand}
              </span>
              {target.categoryName !== "TIDAK TERDETEKSI" && (
                <span className="px-2.5 py-1 bg-[#0D0D0D] border border-[#262626] text-xs text-[#A3A3A3]">
                  Kategori: {target.categoryName}
                </span>
              )}
              <span className="px-2.5 py-1 bg-[#0D0D0D] border border-[#262626] font-mono text-xs text-[#A3A3A3]">
                ID/SKU:{" "}
                {activeVariant?.skuCode &&
                activeVariant.skuCode !== "TIDAK TERDETEKSI"
                  ? activeVariant.skuCode
                  : target.productSku}
              </span>
            </div>

            {/* Full Untruncated Product Title (22px - 26px, font-bold) */}
            <h1 className="text-xl lg:text-2xl font-bold text-[#F5F5F5] leading-snug break-words">
              {target.productTitle}
            </h1>

            {/* Real Extracted Price Block (24px - 28px, font-bold) */}
            <div className="p-3.5 bg-[#0D0D0D] border border-[#262626] flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-[#A3A3A3] uppercase">
                  Harga Produk Asli{" "}
                  {activeVariant ? `(Ukuran ${activeVariant.sizeLabel})` : ""}
                </div>
                <div className="text-2xl lg:text-3xl font-mono font-bold text-[#F5F5F5] mt-1">
                  {displayedPrice}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-medium text-[#A3A3A3] uppercase">
                  Total Ketersediaan Ukuran
                </div>
                <div className="text-sm font-mono font-bold mt-1 text-[#4ADE80]">
                  {target.availableVariantsCount} dari {target.totalVariants}{" "}
                  Ukuran Tersedia
                </div>
              </div>
            </div>
          </div>

          {/* Selected Size Status Detail Box */}
          {activeVariant && (
            <div className="p-3.5 bg-[#0D0D0D] border border-[#262626] flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-[#F5F5F5] flex items-center gap-2">
                <span>
                  Ukuran Dipilih:{" "}
                  <strong className="font-mono font-bold">
                    [{activeVariant.somId}] {activeVariant.sizeLabel}
                  </strong>
                </span>
                {activeVariant.isGoldenSize && (
                  <span className="px-2 py-0.5 bg-[#141414] border border-[#FACC15] font-mono text-xs font-semibold text-[#FACC15]">
                    GOLDEN SIZE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 font-mono text-xs font-bold ${
                    activeVariant.inStock
                      ? "bg-[#4ADE80] text-[#0D0D0D]"
                      : "bg-[#141414] text-[#A3A3A3] border border-[#666666]"
                  }`}
                >
                  {activeVariant.inStock
                    ? `TERSEDIA (${activeVariant.stockDetail})`
                    : "HABIS / DISABLED"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle Card: Real Scraped Size Variant Grid with Set-of-Mark Badges (#1 .. #N) */}
      <div className="bg-[#141414] border border-[#262626] p-4 lg:p-5 flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#F5F5F5]">
              Peta Elemen Tombol Ukuran Asli (Set-of-Mark #1 s/d #
              {target.variants.length})
            </h2>
            <p className="text-sm text-[#A3A3A3]">
              Ukuran berlabel <strong className="text-[#FACC15]">GOLDEN</strong>{" "}
              adalah rentang ukuran utama (EU 39-43 / M-XL) penentu kelayakan
              iklan.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#4ADE80] font-semibold">
              <span className="inline-block w-2.5 h-2.5 bg-[#4ADE80]" />
              TERSEDIA ({target.availableVariantsCount})
            </span>
            <span className="flex items-center gap-1.5 text-[#A3A3A3]">
              <span className="inline-block w-2.5 h-2.5 border border-[#666666] bg-[#0D0D0D]" />
              HABIS ({target.totalVariants - target.availableVariantsCount})
            </span>
          </div>
        </div>

        {target.variants.length === 0 ? (
          <div className="p-4 bg-[#0D0D0D] border border-[#666666] text-sm text-[#A3A3A3]">
            TIDAK TERDETEKSI: Halaman produk ini tidak memiliki daftar tombol
            atau pilihan variasi ukuran pada struktur DOM-nya.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2.5">
            {target.variants.map((variant, idx) => {
              const isSelected = idx === selectedVariantIdx;
              return (
                <button
                  key={variant.somId}
                  type="button"
                  onClick={() => onSelectVariant(idx)}
                  aria-pressed={isSelected}
                  className={`min-h-[64px] p-2.5 text-left flex flex-col justify-between transition-colors ${
                    isSelected
                      ? "border-2 border-[#FF5C00] bg-[#0D0D0D] text-[#F5F5F5]"
                      : variant.inStock
                      ? "border-2 border-[#4ADE80] bg-[#0D0D0D] text-[#F5F5F5] hover:border-[#FF5C00]"
                      : "border border-[#666666] bg-[#0D0D0D] text-[#A3A3A3] hover:border-[#F5F5F5]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span
                      className={`px-1.5 py-0.5 font-mono text-xs font-bold leading-none ${
                        isSelected
                          ? "bg-[#FF5C00] text-[#0D0D0D]"
                          : variant.inStock
                          ? "bg-[#4ADE80] text-[#0D0D0D]"
                          : "bg-[#141414] text-[#A3A3A3] border border-[#666666]"
                      }`}
                    >
                      {variant.somId}
                    </span>
                    <span
                      className={`font-mono text-xs font-semibold ${
                        variant.inStock ? "text-[#4ADE80]" : "text-[#A3A3A3]"
                      }`}
                    >
                      {variant.inStock ? "READY" : "HABIS"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between gap-1">
                    <span
                      className={`font-mono text-base font-bold ${
                        variant.inStock
                          ? "text-[#F5F5F5]"
                          : "line-through decoration-2 text-[#A3A3A3]"
                      }`}
                    >
                      {variant.sizeLabel}
                    </span>
                    {variant.isGoldenSize && (
                      <span className="font-mono text-xs font-semibold text-[#FACC15]">
                        GOLDEN
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPETITOR RADAR & 4-QUADRANT BOSS VERDICT PANEL */}
      <div className="bg-[#141414] border border-[#262626] p-4 lg:p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#F5F5F5]">
              Radar 6 Kompetitor Sneaker Indonesia &amp; Keputusan 4 Kuadran
            </h2>
            <p className="text-sm text-[#A3A3A3]">
              Membandingkan harga dan ukuran tersedia (Running Sizes) terhadap
              807Garage, Kick Avenue, Atmos ID, Foot Locker ID, JD Sports ID,
              dan Zalora.
            </p>
          </div>
          <button
            type="button"
            disabled={isCheckingCompetitors}
            onClick={onRunCompetitorRadar}
            className={`min-h-[44px] px-4 py-2 text-sm font-bold transition-colors shrink-0 ${
              isCheckingCompetitors
                ? "bg-[#0D0D0D] text-[#FF5C00] border-2 border-[#FF5C00]"
                : "bg-[#FF5C00] text-[#0D0D0D] hover:bg-[#F5F5F5]"
            }`}
          >
            {isCheckingCompetitors
              ? "Memindai 6 Kompetitor..."
              : competitors && competitors.length > 0
              ? "Segarkan Radar 6 Kompetitor"
              : "Cek Harga & Ukuran di 6 Kompetitor"}
          </button>
        </div>

        {/* 4-Quadrant Decision Box when loaded */}
        {quadrantDecision && quadStyle && (
          <div
            className={`bg-[#0D0D0D] border-2 ${quadStyle.borderColor} p-4 space-y-2`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`px-3 py-1 font-mono text-xs font-bold ${quadStyle.badgeBg}`}
              >
                {quadrantDecision.badgeLabel}
              </span>
              <span className="font-mono text-xs text-[#A3A3A3]">
                Kompetitor Terendah: {quadrantDecision.lowestCompetitorName} (
                {quadrantDecision.lowestCompetitorPriceDisplay})
              </span>
            </div>
            <p className="text-sm text-[#F5F5F5] font-medium leading-relaxed">
              <strong>Alasan Laporan ke Bos:</strong>{" "}
              {quadrantDecision.bossReason}
            </p>
            <p className={`text-sm font-semibold ${quadStyle.textColor}`}>
              <strong>Rekomendasi Tindakan:</strong>{" "}
              {quadrantDecision.channelActionPlan}
            </p>
          </div>
        )}

        {/* 6 Competitor Stores Table */}
        {competitors && competitors.length > 0 ? (
          <div className="overflow-x-auto border border-[#262626] bg-[#0D0D0D]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#141414] border-b border-[#262626] text-xs uppercase text-[#A3A3A3]">
                <tr>
                  <th className="py-2.5 px-3 text-left font-semibold">
                    Toko Kompetitor
                  </th>
                  <th className="py-2.5 px-3 text-left font-semibold">
                    Produk Cocok / Status
                  </th>
                  <th className="py-2.5 px-3 text-left font-semibold">
                    Harga Kompetitor
                  </th>
                  <th className="py-2.5 px-3 text-left font-semibold">
                    Ukuran Ready (Running Sizes)
                  </th>
                  <th className="py-2.5 px-3 text-right font-semibold">
                    Bukti Link
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {competitors.map((comp) => (
                  <tr key={comp.competitorId} className="hover:bg-[#141414]/60">
                    <td className="py-2.5 px-3 font-bold text-[#F5F5F5] whitespace-nowrap">
                      <div>{comp.competitorName}</div>
                      <div className="font-mono text-xs text-[#A3A3A3]">
                        {comp.domain}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#F5F5F5] max-w-[240px]">
                      <div className="font-medium break-words">
                        {comp.matchedTitle}
                      </div>
                      <div className="text-xs text-[#A3A3A3] mt-0.5">
                        {comp.note}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold whitespace-nowrap">
                      {comp.status === "DITEMUKAN" ? (
                        <div>
                          <span className="text-[#F5F5F5]">
                            {comp.priceDisplay}
                          </span>
                          {comp.priceDiffFromOurs !== null && (
                            <div
                              className={`text-xs ${
                                comp.priceDiffFromOurs < 0
                                  ? "text-[#F87171]"
                                  : "text-[#4ADE80]"
                              }`}
                            >
                              {comp.priceDiffFromOurs < 0
                                ? `Lebih murah Rp${Math.abs(
                                    comp.priceDiffFromOurs
                                  )
                                    .toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
                                : comp.priceDiffFromOurs > 0
                                ? `Lebih mahal Rp${comp.priceDiffFromOurs
                                    .toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
                                : "Harga sama"}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#A3A3A3]">Tidak Ditemukan</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-[#F5F5F5]">
                      {comp.runningSizes.length > 0 ? (
                        <span className="text-[#4ADE80] font-semibold">
                          {comp.runningSizes.join(", ")}
                        </span>
                      ) : (
                        <span className="text-[#A3A3A3]">
                          Stok Kosong / Tidak Ditemukan
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <a
                        href={comp.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[#F5F5F5] underline hover:text-[#FF5C00]"
                      >
                        Buka Web
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-3.5 bg-[#0D0D0D] border border-[#262626] text-sm text-[#A3A3A3]">
            Klik tombol{" "}
            <strong className="text-[#F5F5F5]">
              Cek Harga &amp; Ukuran di 6 Kompetitor
            </strong>{" "}
            untuk menarik perbandingan harga dan ukuran dari 807Garage, Kick
            Avenue, Atmos Indonesia, Foot Locker ID, JD Sports ID, dan Zalora.
          </div>
        )}
      </div>

      {/* Bottom Card: Primary CTA Button Status */}
      <div className="bg-[#141414] border border-[#262626] p-4 lg:p-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#F5F5F5]">
            Status Tombol Aksi Utama (CTA Keranjang)
          </h2>
          <span className="font-mono text-xs text-[#A3A3A3]">
            Elemen DOM: {target.ctaSelector}
          </span>
        </div>

        <button
          type="button"
          onClick={onProbeCta}
          className={`min-h-[52px] w-full px-4 py-3 border-2 flex flex-wrap items-center justify-between gap-3 text-left transition-colors ${
            isSelectedInStock
              ? "border-[#4ADE80] bg-[#0D0D0D] text-[#F5F5F5] hover:border-[#FF5C00]"
              : "border-[#666666] bg-[#0D0D0D] text-[#A3A3A3]"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`px-2 py-1 font-mono text-xs font-bold ${
                isSelectedInStock
                  ? "bg-[#FF5C00] text-[#0D0D0D]"
                  : "bg-[#141414] text-[#A3A3A3] border border-[#666666]"
              }`}
            >
              {ctaSomNumber}
            </span>
            <span className="font-mono text-base font-bold uppercase text-[#F5F5F5]">
              {target.ctaLabel}
            </span>
            {activeVariant && (
              <span className="text-sm text-[#A3A3A3]">
                (Ukuran {activeVariant.sizeLabel})
              </span>
            )}
          </div>

          <span
            className={`px-2.5 py-1 font-mono text-xs font-bold ${
              isSelectedInStock
                ? "bg-[#4ADE80] text-[#0D0D0D]"
                : "bg-[#141414] text-[#A3A3A3] border border-[#666666]"
            }`}
          >
            {isSelectedInStock
              ? ctaProbed
                ? "TERVERIFIKASI AKTIF (SIAP TAMBAH KE KERANJANG)"
                : "AKTIF (TERSEDIA)"
              : "DISABLED / OUT OF STOCK"}
          </span>
        </button>
      </div>
    </section>
  );
}
