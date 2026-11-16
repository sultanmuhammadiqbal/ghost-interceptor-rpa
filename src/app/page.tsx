"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import LiveInterceptorViewport from "../components/LiveInterceptorViewport";
import RightTelemetryColumn from "../components/RightTelemetryColumn";
import {
  AuditLogEntry,
  buildActionableAdFeedCsv,
  buildExecutiveBossTriageCsv,
  buildRestockDeadSizeCsv,
  DEFAULT_TARGET_URL,
  formatIdrPrice,
  InterceptProductTarget,
  parseAdReportCsvOrText,
  parseUploadedStockVariants,
  QuadrantCode,
  SAMPLE_SENIKERSKU_AD_REPORT_CSV,
  TriageAuditedRow,
} from "../lib/ghost-engine";

function getTimeStamp(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function triggerCsvDownload(filename: string, csvContent: string): void {
  if (typeof window === "undefined") return;
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getQuadrantBadgeClass(q?: QuadrantCode): string {
  if (q === "KUADRAN_1") return "bg-[#F87171] text-[#0D0D0D]";
  if (q === "KUADRAN_2") return "bg-[#FF5C00] text-[#0D0D0D]";
  if (q === "KUADRAN_4") return "bg-[#FACC15] text-[#0D0D0D]";
  return "bg-[#4ADE80] text-[#0D0D0D]";
}

export default function GhostInterceptorPage() {
  // Top Bar 2 Working Mode Tabs: Tab 1 (SINGLE) vs Tab 2 (TRIAGE)
  const [activeTab, setActiveTab] = useState<"SINGLE" | "TRIAGE">("SINGLE");
  const [urlInput, setUrlInput] = useState<string>(DEFAULT_TARGET_URL);

  // Tab 2: Dual-Dropzone & ROAS Triage States
  const [adReportText, setAdReportText] = useState<string>(
    SAMPLE_SENIKERSKU_AD_REPORT_CSV
  );
  const [stockOverrideText, setStockOverrideText] = useState<string>("");
  const [targetRoas, setTargetRoas] = useState<number>(15.0);
  const [triageFilter, setTriageFilter] = useState<
    "ALL" | "ROAS_BONCOS" | "GOLDEN_CRITICAL"
  >("ALL");
  const [triageRows, setTriageRows] = useState<TriageAuditedRow[]>([]);
  const [isTriageRunning, setIsTriageRunning] = useState<boolean>(false);
  const [triageProgress, setTriageProgress] = useState<{
    done: number;
    total: number;
    note: string;
  }>({ done: 0, total: 0, note: "" });

  // Master Audited Products List (for CSV exports)
  const [auditedProducts, setAuditedProducts] = useState<
    InterceptProductTarget[]
  >([]);

  // Currently Inspected Product in 2-Column Workspace
  const [target, setTarget] = useState<InterceptProductTarget | null>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCheckingCompetitors, setIsCheckingCompetitors] =
    useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ctaProbed, setCtaProbed] = useState<boolean>(false);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const stepCounterRef = useRef<number>(0);
  const inspectorRef = useRef<HTMLDivElement | null>(null);

  const upsertAuditedProduct = useCallback((item: InterceptProductTarget) => {
    setAuditedProducts((prev) => {
      const existingIdx = prev.findIndex(
        (p) => p.url.toLowerCase() === item.url.toLowerCase()
      );
      if (existingIdx >= 0) {
        const clone = [...prev];
        clone[existingIdx] = item;
        return clone;
      }
      return [item, ...prev];
    });
  }, []);

  const appendLog = useCallback(
    (category: AuditLogEntry["category"], message: string) => {
      stepCounterRef.current += 1;
      const entry: AuditLogEntry = {
        id: `log-${Date.now()}-${stepCounterRef.current}`,
        stepIndex: stepCounterRef.current,
        timestamp: getTimeStamp(),
        category,
        message,
      };
      setLogs((prev) => [...prev, entry]);
    },
    []
  );

  const stopVoiceOver = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const playVoiceOverText = useCallback((scriptText: string) => {
    if (typeof window === "undefined" || !scriptText) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scriptText);
      utterance.lang = "id-ID";
      utterance.rate = 1.02;
      utterance.pitch = 0.96;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const loadProductIntoInspector = useCallback(
    (item: InterceptProductTarget, autoSpeak = false) => {
      setTarget(item);
      setUrlInput(item.url);
      setErrorMessage(null);
      setCtaProbed(false);
      const firstAvail = item.variants.findIndex((v) => v.inStock);
      setSelectedVariantIdx(firstAvail >= 0 ? firstAvail : 0);
      stepCounterRef.current = item.auditLogs.length;
      setLogs(item.auditLogs);
      if (autoSpeak && item.voiceOver?.script) {
        playVoiceOverText(item.voiceOver.script);
      }
    },
    [playVoiceOverText]
  );

  const runCompetitorRadarForTarget = useCallback(
    async (
      currentTarget: InterceptProductTarget,
      roasVal: number | null = null
    ) => {
      setIsCheckingCompetitors(true);
      try {
        const res = await fetch("/api/competitor-radar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: currentTarget.productTitle,
            productUrl: currentTarget.url,
            ourPrice: currentTarget.numericBasePrice,
            ourAvailableSizes: currentTarget.availableSizeLabels,
            roas: roasVal,
            targetRoas,
            resolveSenikerskuDom: false,
          }),
        });
        const data = await res.json();
        if (res.ok && data?.ok) {
          const updated: InterceptProductTarget = {
            ...currentTarget,
            competitors: data.competitors,
            quadrantDecision: data.quadrantDecision,
          };
          setTarget(updated);
          upsertAuditedProduct(updated);
          appendLog(
            "KOMPETITOR",
            `Radar 6 Kompetitor selesai. Status: ${data.quadrantDecision.badgeLabel}. ${data.quadrantDecision.bossReason}`
          );
        }
      } catch {
        appendLog(
          "KOMPETITOR",
          "Gagal memindai sebagian kompetitor eksternal."
        );
      } finally {
        setIsCheckingCompetitors(false);
      }
    },
    [appendLog, targetRoas, upsertAuditedProduct]
  );

  const executeSingleAudit = useCallback(
    async (targetUrl: string, autoSpeak = false) => {
      const cleanedUrl = targetUrl.trim();
      if (!cleanedUrl) {
        setErrorMessage("Masukkan URL halaman produk terlebih dahulu.");
        setIsLoading(false);
        return;
      }

      stopVoiceOver();
      setIsLoading(true);
      setErrorMessage(null);
      setCtaProbed(false);

      try {
        const res = await fetch("/api/intercept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "AUDIT_PRODUCT",
            url: cleanedUrl,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data?.ok || !data?.target) {
          throw new Error(
            data?.error ||
              `Gagal mengaudit halaman (Status HTTP ${res.status}).`
          );
        }

        const scraped: InterceptProductTarget = data.target;
        upsertAuditedProduct(scraped);
        loadProductIntoInspector(scraped, autoSpeak);
        void runCompetitorRadarForTarget(scraped, null);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menghubungi endpoint /api/intercept.";
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [
      loadProductIntoInspector,
      runCompetitorRadarForTarget,
      stopVoiceOver,
      upsertAuditedProduct,
    ]
  );

  useEffect(() => {
    void executeSingleAudit(DEFAULT_TARGET_URL, false);
  }, [executeSingleAudit]);

  const handleSingleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void executeSingleAudit(urlInput, true);
  };

  // Tab 2: Run Full Triage Pipeline (Ad Report + Senikersku Live Stock / Uploaded Stock + 6 Competitors)
  const executeTriagePipeline = useCallback(
    async (rawAdCsv: string, rawStockCsv: string) => {
      const parsedCampaigns = parseAdReportCsvOrText(rawAdCsv);
      if (parsedCampaigns.length === 0) {
        setErrorMessage(
          "Format laporan iklan tidak dikenali atau kosong. Pastikan terdapat baris header dan minimal 1 baris produk."
        );
        return;
      }

      const uploadedStockMap = parseUploadedStockVariants(rawStockCsv);
      stopVoiceOver();
      setIsTriageRunning(true);
      setErrorMessage(null);

      const initialRows: TriageAuditedRow[] = parsedCampaigns.map((c) => ({
        ...c,
        auditStatus: "PENDING",
        scrapedTarget: null,
        competitors: [],
        quadrant: null,
        stockSource: "BELUM_DIAUDIT",
      }));
      setTriageRows(initialRows);

      for (let i = 0; i < initialRows.length; i++) {
        const row = initialRows[i];
        setTriageProgress({
          done: i,
          total: initialRows.length,
          note: `Membedah stok ukuran & 6 kompetitor (${i + 1}/${
            initialRows.length
          }): ${row.productName}...`,
        });

        setTriageRows((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, auditStatus: "AUDITING" } : item
          )
        );

        const customStock =
          uploadedStockMap.get(row.productName.toLowerCase()) || null;

        try {
          const res = await fetch("/api/competitor-radar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productName: row.productName,
              productUrl: row.productUrl,
              roas: row.roas,
              targetRoas,
              resolveSenikerskuDom: true,
              uploadedVariants: customStock,
            }),
          });
          const data = await res.json();
          if (res.ok && data?.ok) {
            const scrapedTarget: InterceptProductTarget | null =
              data.scrapedTarget || null;
            if (scrapedTarget) {
              upsertAuditedProduct(scrapedTarget);
              if (i === 0) {
                loadProductIntoInspector(scrapedTarget, false);
              }
            }
            setTriageRows((prev) =>
              prev.map((item, idx) =>
                idx === i
                  ? {
                      ...item,
                      auditStatus: "DONE",
                      scrapedTarget,
                      competitors: data.competitors || [],
                      quadrant: data.quadrantDecision || null,
                      stockSource: customStock
                        ? "UPLOADED_STOCK_FILE"
                        : "SENIKERSKU_LIVE_DOM",
                    }
                  : item
              )
            );
          } else {
            setTriageRows((prev) =>
              prev.map((item, idx) =>
                idx === i ? { ...item, auditStatus: "ERROR" } : item
              )
            );
          }
        } catch {
          setTriageRows((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, auditStatus: "ERROR" } : item
            )
          );
        }
      }

      setTriageProgress({
        done: initialRows.length,
        total: initialRows.length,
        note: `Selesai mengaudit ${initialRows.length} produk iklan beserta stok Golden Size & perbandingan 6 kompetitor.`,
      });
      setIsTriageRunning(false);
    },
    [loadProductIntoInspector, stopVoiceOver, targetRoas, upsertAuditedProduct]
  );

  const handleAdReportFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAdReportText(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleStockFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setStockOverrideText(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleSelectVariant = (index: number) => {
    if (!target || !target.variants[index]) return;
    setSelectedVariantIdx(index);
    setCtaProbed(false);
    const chosen = target.variants[index];
    appendLog(
      "VARIAN",
      `Memeriksa elemen [${chosen.somId}] ukuran ${chosen.sizeLabel}${
        chosen.isGoldenSize ? " (GOLDEN SIZE)" : ""
      }: Harga ${chosen.exactPrice}, status stok ${chosen.stockStatus} (${
        chosen.stockDetail
      }).`
    );
  };

  const handleProbeCta = () => {
    if (!target) return;
    const activeVariant =
      target.variants[selectedVariantIdx] ?? target.variants[0];
    if (activeVariant) {
      if (activeVariant.inStock) {
        setCtaProbed(true);
        appendLog(
          "CTA",
          `Verifikasi tombol "${target.ctaLabel}" pada ukuran ${activeVariant.sizeLabel} (SKU: ${activeVariant.skuCode}): AKTIF dan siap ditambahkan ke keranjang.`
        );
      } else {
        setCtaProbed(false);
        appendLog(
          "CTA",
          `Tombol "${target.ctaLabel}" terkunci pada ukuran ${activeVariant.sizeLabel} karena status stok HABIS.`
        );
      }
    } else {
      setCtaProbed(target.ctaAvailable);
      appendLog(
        "CTA",
        `Memeriksa tombol "${target.ctaLabel}": status ${
          target.ctaAvailable ? "AKTIF" : "NONAKTIF"
        }.`
      );
    }
  };

  const handleExportBossTriageCsv = () => {
    if (triageRows.length > 0) {
      const csv = buildExecutiveBossTriageCsv(triageRows);
      const dateStr = new Date().toISOString().slice(0, 10);
      triggerCsvDownload(`laporan-eksekutif-bos-action-plan-${dateStr}.csv`, csv);
      return;
    }
    if (target) {
      const singleRow: TriageAuditedRow = {
        id: "single-1",
        productName: target.productTitle,
        channel: "Inspeksi Tunggal",
        adSpend: 0,
        gmv: 0,
        roas: 0,
        clicks: 0,
        conversions: 0,
        productUrl: target.url,
        auditStatus: "DONE",
        scrapedTarget: target,
        competitors: target.competitors || [],
        quadrant: target.quadrantDecision || null,
        stockSource: "SENIKERSKU_LIVE_DOM",
      };
      const csv = buildExecutiveBossTriageCsv([singleRow]);
      const dateStr = new Date().toISOString().slice(0, 10);
      triggerCsvDownload(`laporan-eksekutif-bos-action-plan-${dateStr}.csv`, csv);
    }
  };

  const handleExportAdFeedCsv = () => {
    const list =
      auditedProducts.length > 0
        ? auditedProducts
        : target
        ? [target]
        : [];
    if (list.length === 0) return;
    const csv = buildActionableAdFeedCsv(list);
    const dateStr = new Date().toISOString().slice(0, 10);
    triggerCsvDownload(`actionable-ad-feed-${dateStr}.csv`, csv);
  };

  const handleExportRestockCsv = () => {
    const list =
      auditedProducts.length > 0
        ? auditedProducts
        : target
        ? [target]
        : [];
    if (list.length === 0) return;
    const csv = buildRestockDeadSizeCsv(list);
    const dateStr = new Date().toISOString().slice(0, 10);
    triggerCsvDownload(`restock-dead-size-report-${dateStr}.csv`, csv);
  };

  const filteredTriageRows = triageRows.filter((row) => {
    if (triageFilter === "ROAS_BONCOS") {
      return row.roas < targetRoas;
    }
    if (triageFilter === "GOLDEN_CRITICAL") {
      const pct = row.scrapedTarget?.adProtection.goldenSizeRatioPct ?? 0;
      return pct < 50;
    }
    return true;
  });

  const countQ1 = triageRows.filter(
    (r) => r.quadrant?.quadrantId === "KUADRAN_1"
  ).length;
  const countQ2 = triageRows.filter(
    (r) => r.quadrant?.quadrantId === "KUADRAN_2"
  ).length;
  const countQ3 = triageRows.filter(
    (r) => r.quadrant?.quadrantId === "KUADRAN_3"
  ).length;
  const countQ4 = triageRows.filter(
    (r) => r.quadrant?.quadrantId === "KUADRAN_4"
  ).length;

  return (
    <div className="min-h-screen w-full bg-[#0D0D0D] text-[#F5F5F5] flex flex-col">
      {/* TOP BAR: Clean App Name + 2 Working Mode Tabs + CSV Deliverable Exports */}
      <header className="border-b border-[#262626] bg-[#0D0D0D] px-4 lg:px-6 py-3.5 shrink-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 bg-[#FF5C00] shrink-0" />
              <span className="text-base lg:text-lg font-bold tracking-tight text-[#F5F5F5]">
                Ghost Interceptor
              </span>
            </div>

            {/* 2 Clean Working Mode Tabs */}
            <div
              role="tablist"
              aria-label="Mode Kerja Operasional"
              className="flex flex-wrap items-center bg-[#141414] border border-[#666666] p-0.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "SINGLE"}
                onClick={() => setActiveTab("SINGLE")}
                className={`min-h-[44px] px-4 py-2 text-sm font-bold transition-colors ${
                  activeTab === "SINGLE"
                    ? "bg-[#FF5C00] text-[#0D0D0D]"
                    : "bg-transparent text-[#F5F5F5] hover:text-[#FF5C00]"
                }`}
              >
                Tab 1: Inspeksi URL &amp; Kompetitor Tunggal
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "TRIAGE"}
                onClick={() => setActiveTab("TRIAGE")}
                className={`min-h-[44px] px-4 py-2 text-sm font-bold transition-colors ${
                  activeTab === "TRIAGE"
                    ? "bg-[#FF5C00] text-[#0D0D0D]"
                    : "bg-transparent text-[#F5F5F5] hover:text-[#FF5C00]"
                }`}
              >
                Tab 2: Triage Iklan Shopee / TikTok &amp; PMax (ROAS &lt; 15)
              </button>
            </div>
          </div>

          {/* Actionable Deliverables: CSV Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={triageRows.length === 0 && !target}
              onClick={handleExportBossTriageCsv}
              className="min-h-[44px] px-3.5 py-2 bg-[#FF5C00] text-[#0D0D0D] text-sm font-bold hover:bg-[#F5F5F5] disabled:bg-[#141414] disabled:text-[#A3A3A3] disabled:border border-[#666666] transition-colors"
            >
              Export Laporan Eksekutif Bos &amp; Action Plan (.CSV)
            </button>
            <button
              type="button"
              disabled={auditedProducts.length === 0 && !target}
              onClick={handleExportAdFeedCsv}
              className="min-h-[44px] px-3.5 py-2 bg-[#141414] border-2 border-[#4ADE80] text-sm font-bold text-[#F5F5F5] hover:bg-[#4ADE80] hover:text-[#0D0D0D] disabled:border-[#666666] disabled:text-[#A3A3A3] transition-colors"
            >
              Export Ad-Feed (.CSV)
            </button>
            <button
              type="button"
              disabled={auditedProducts.length === 0 && !target}
              onClick={handleExportRestockCsv}
              className="min-h-[44px] px-3.5 py-2 bg-[#141414] border border-[#666666] text-sm font-bold text-[#F5F5F5] hover:border-[#FACC15] hover:text-[#FACC15] disabled:text-[#A3A3A3] transition-colors"
            >
              Export Restock Report (.CSV)
            </button>
          </div>
        </div>

        {/* TAB 1 BAR: Single Product URL Input */}
        {activeTab === "SINGLE" && (
          <form
            onSubmit={handleSingleSubmit}
            className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-1"
          >
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
              <label
                htmlFor="target-url-input"
                className="text-sm font-semibold text-[#A3A3A3] shrink-0"
              >
                URL Produk
              </label>
              <input
                id="target-url-input"
                type="url"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://senikersku.com/product/adidas-adizero-adios-9-satisfy-brown-charcoal/"
                className="min-h-[44px] w-full bg-[#141414] border border-[#666666] focus:border-[#FF5C00] px-3.5 py-2 text-sm text-[#F5F5F5] placeholder-[#A3A3A3] font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isTriageRunning}
              className={`min-h-[44px] px-5 py-2.5 text-sm font-bold transition-colors shrink-0 ${
                isLoading
                  ? "bg-[#141414] text-[#FF5C00] border-2 border-[#FF5C00]"
                  : "bg-[#FF5C00] text-[#0D0D0D] hover:bg-[#F5F5F5] hover:text-[#0D0D0D] active:bg-[#A3A3A3]"
              }`}
            >
              {isLoading ? "Mengaudit Halaman..." : "Audit Halaman Produk"}
            </button>
          </form>
        )}

        {/* TAB 2 WORKSPACE: Dual-Dropzone (Rancangan A + C) + Filter & Triage Controls */}
        {activeTab === "TRIAGE" && (
          <div className="space-y-4 pt-2 border-t border-[#262626]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* DROPZONE 1: Laporan Iklan Shopee / TikTok / Google PMax */}
              <div className="lg:col-span-7 bg-[#141414] border border-[#262626] p-4 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="ad-report-textarea"
                      className="text-sm font-bold text-[#F5F5F5]"
                    >
                      Dropzone 1: Laporan Iklan (CSV / TSV Shopee Ads, TikTok
                      Ads, Google PMax)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAdReportText(SAMPLE_SENIKERSKU_AD_REPORT_CSV);
                        void executeTriagePipeline(
                          SAMPLE_SENIKERSKU_AD_REPORT_CSV,
                          stockOverrideText
                        );
                      }}
                      disabled={isTriageRunning}
                      className="min-h-[40px] px-3 py-1.5 bg-[#0D0D0D] border-2 border-[#4ADE80] text-xs font-mono font-bold text-[#4ADE80] hover:bg-[#4ADE80] hover:text-[#0D0D0D] transition-colors"
                    >
                      Muat Sampel Laporan Iklan Senikersku (Simulasi Senin Pagi)
                    </button>
                  </div>

                  <p className="text-sm text-[#A3A3A3]">
                    Unggah file CSV laporan iklan atau tempel baris data di bawah
                    (otomatis mengenali Nama Produk, Biaya, Omzet, ROAS, Klik,
                    dan Konversi).
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <label
                      htmlFor="ad-csv-file"
                      className="text-xs font-mono text-[#A3A3A3]"
                    >
                      Pilih File CSV Iklan:
                    </label>
                    <input
                      id="ad-csv-file"
                      type="file"
                      accept=".csv,.tsv,.txt"
                      onChange={handleAdReportFileUpload}
                      className="text-xs text-[#F5F5F5] font-mono"
                    />
                  </div>

                  <textarea
                    id="ad-report-textarea"
                    rows={4}
                    value={adReportText}
                    onChange={(e) => setAdReportText(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-[#666666] focus:border-[#FF5C00] p-2.5 text-sm font-mono text-[#F5F5F5] leading-relaxed"
                  />
                </div>
              </div>

              {/* DROPZONE 2 (Opsional): Laporan Stok Varian Shopee + Eksekusi Triage */}
              <div className="lg:col-span-5 bg-[#141414] border border-[#262626] p-4 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="stock-override-textarea"
                      className="text-sm font-bold text-[#F5F5F5]"
                    >
                      Dropzone 2 (Opsional): Stok Varian Shopee (CSV / JSON)
                    </label>
                    <span className="px-2 py-0.5 bg-[#0D0D0D] border border-[#4ADE80] font-mono text-xs text-[#4ADE80]">
                      Kosong = Auto-Scrape Senikersku.com
                    </span>
                  </div>

                  <p className="text-sm text-[#A3A3A3]">
                    Jika dikosongkan (Mode Otomatis Rancangan A), sistem otomatis
                    mencari nama produk di{" "}
                    <code className="font-mono text-[#F5F5F5]">
                      senikersku.com
                    </code>{" "}
                    dan membedah ukuran WooCommerce aslinya!
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <label
                      htmlFor="stock-csv-file"
                      className="text-xs font-mono text-[#A3A3A3]"
                    >
                      File Stok Opsional:
                    </label>
                    <input
                      id="stock-csv-file"
                      type="file"
                      accept=".csv,.json,.txt"
                      onChange={handleStockFileUpload}
                      className="text-xs text-[#F5F5F5] font-mono"
                    />
                  </div>

                  <textarea
                    id="stock-override-textarea"
                    rows={2}
                    value={stockOverrideText}
                    onChange={(e) => setStockOverrideText(e.target.value)}
                    placeholder="Biarkan kosong untuk menarik stok ukuran otomatis dari senikersku.com..."
                    className="w-full bg-[#0D0D0D] border border-[#666666] focus:border-[#FF5C00] p-2.5 text-sm font-mono text-[#F5F5F5] placeholder-[#A3A3A3]"
                  />
                </div>

                <button
                  type="button"
                  disabled={isTriageRunning}
                  onClick={() =>
                    void executeTriagePipeline(adReportText, stockOverrideText)
                  }
                  className="min-h-[44px] w-full px-4 py-2.5 bg-[#FF5C00] text-[#0D0D0D] text-sm font-bold hover:bg-[#F5F5F5] disabled:bg-[#0D0D0D] disabled:text-[#FF5C00] disabled:border border-[#FF5C00] transition-colors"
                >
                  {isTriageRunning
                    ? "Sedang Membedah Stok & 6 Kompetitor..."
                    : "Jalankan Triage ROAS, Stok Ukuran & Radar 6 Kompetitor"}
                </button>
              </div>
            </div>

            {/* Filter & Triage Control Bar */}
            <div className="bg-[#141414] border border-[#262626] p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-[#F5F5F5] mr-1">
                  Filter Triage:
                </span>
                <button
                  type="button"
                  onClick={() => setTriageFilter("ALL")}
                  className={`min-h-[40px] px-3 py-1.5 text-sm font-bold transition-colors ${
                    triageFilter === "ALL"
                      ? "bg-[#FF5C00] text-[#0D0D0D]"
                      : "bg-[#0D0D0D] border border-[#666666] text-[#F5F5F5]"
                  }`}
                >
                  Semua Produk ({triageRows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTriageFilter("ROAS_BONCOS")}
                  className={`min-h-[40px] px-3 py-1.5 text-sm font-bold transition-colors ${
                    triageFilter === "ROAS_BONCOS"
                      ? "bg-[#F87171] text-[#0D0D0D]"
                      : "bg-[#0D0D0D] border border-[#666666] text-[#F5F5F5]"
                  }`}
                >
                  Fokus ROAS &lt; {targetRoas} (Boncos)
                </button>
                <button
                  type="button"
                  onClick={() => setTriageFilter("GOLDEN_CRITICAL")}
                  className={`min-h-[40px] px-3 py-1.5 text-sm font-bold transition-colors ${
                    triageFilter === "GOLDEN_CRITICAL"
                      ? "bg-[#FACC15] text-[#0D0D0D]"
                      : "bg-[#0D0D0D] border border-[#666666] text-[#F5F5F5]"
                  }`}
                >
                  Stok Golden Size Kritis
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="target-roas-input"
                  className="text-sm font-semibold text-[#A3A3A3]"
                >
                  Target ROAS Minimum:
                </label>
                <input
                  id="target-roas-input"
                  type="number"
                  step="0.5"
                  min="1"
                  value={targetRoas}
                  onChange={(e) =>
                    setTargetRoas(parseFloat(e.target.value) || 15.0)
                  }
                  className="min-h-[40px] w-24 bg-[#0D0D0D] border border-[#666666] px-3 py-1.5 text-sm font-mono font-bold text-[#F5F5F5]"
                />
              </div>
            </div>

            {/* Progress & 4-Quadrant Summary Counters */}
            {(isTriageRunning || triageProgress.note || triageRows.length > 0) && (
              <div className="bg-[#141414] border border-[#262626] px-4 py-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-mono text-[#F5F5F5]">
                    {triageProgress.note}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold">
                    <span className="px-2.5 py-1 bg-[#F87171] text-[#0D0D0D]">
                      K1 FALSE BONCOS: {countQ1}
                    </span>
                    <span className="px-2.5 py-1 bg-[#FF5C00] text-[#0D0D0D]">
                      K2 KALAH HARGA: {countQ2}
                    </span>
                    <span className="px-2.5 py-1 bg-[#4ADE80] text-[#0D0D0D]">
                      K3 MENANG STOK: {countQ3}
                    </span>
                    <span className="px-2.5 py-1 bg-[#FACC15] text-[#0D0D0D]">
                      K4 BOM WAKTU: {countQ4}
                    </span>
                  </div>
                </div>
                {triageProgress.total > 0 && (
                  <div className="w-full h-2 bg-[#0D0D0D] border border-[#262626]">
                    <div
                      className="h-full bg-[#FF5C00] transition-all duration-200"
                      style={{
                        width: `${Math.round(
                          (triageProgress.done / triageProgress.total) * 100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* TAB 2 MASTER TRIAGE TABLE (4-Quadrant Decision Matrix) */}
      {activeTab === "TRIAGE" && (
        <section
          aria-label="Tabel Matriks Keputusan 4 Kuadran Triage Iklan"
          className="border-b border-[#262626] bg-[#141414] px-4 lg:px-6 py-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-base font-bold text-[#F5F5F5]">
                Tabel Triage Iklan &amp; Matriks Keputusan 4 Kuadran (
                {filteredTriageRows.length} Produk)
              </h2>
              <p className="text-sm text-[#A3A3A3]">
                Mengawinkan ROAS Iklan, Stok Golden Size (39-43) di
                Senikersku.com, dan Harga/Ukuran 6 Kompetitor Acuan.
              </p>
            </div>
          </div>

          {filteredTriageRows.length === 0 ? (
            <div className="p-6 bg-[#0D0D0D] border border-[#666666] text-sm text-[#A3A3A3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                Belum ada baris laporan iklan yang diaudit. Klik tombol{" "}
                <strong className="text-[#F5F5F5]">
                  Muat Sampel Laporan Iklan Senikersku (Simulasi Senin Pagi)
                </strong>{" "}
                atau{" "}
                <strong className="text-[#F5F5F5]">
                  Jalankan Triage ROAS, Stok Ukuran &amp; Radar 6 Kompetitor
                </strong>{" "}
                di atas untuk memulai.
              </div>
              <button
                type="button"
                onClick={() =>
                  void executeTriagePipeline(adReportText, stockOverrideText)
                }
                className="min-h-[44px] px-4 py-2 bg-[#FF5C00] text-[#0D0D0D] text-sm font-bold shrink-0"
              >
                Mulai Triage Sekarang
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#262626] bg-[#0D0D0D]">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-[#141414] border-b border-[#262626] text-xs uppercase text-[#A3A3A3]">
                  <tr>
                    <th className="py-2.5 px-3 text-left font-semibold">
                      Produk &amp; Channel
                    </th>
                    <th className="py-2.5 px-3 text-left font-semibold">
                      Biaya / Omzet / ROAS
                    </th>
                    <th className="py-2.5 px-3 text-left font-semibold">
                      Stok Ukuran Senikersku (Golden 39-43)
                    </th>
                    <th className="py-2.5 px-3 text-left font-semibold">
                      Kompetitor Terendah &amp; Running Sizes
                    </th>
                    <th className="py-2.5 px-3 text-left font-semibold">
                      Keputusan 4 Kuadran &amp; Alasan ke Bos
                    </th>
                    <th className="py-2.5 px-3 text-right font-semibold">
                      Tindakan Detail
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {filteredTriageRows.map((row) => {
                    const t = row.scrapedTarget;
                    const q = row.quadrant;
                    const isBelowRoas = row.roas < targetRoas;
                    return (
                      <tr key={row.id} className="hover:bg-[#141414]/60">
                        <td className="py-3 px-3 max-w-[240px]">
                          <div className="font-bold text-[#F5F5F5] break-words">
                            {row.productName}
                          </div>
                          <div className="text-xs font-mono text-[#A3A3A3] mt-0.5">
                            {row.channel} · {row.clicks} Klik · {row.conversions}{" "}
                            Konversi
                          </div>
                          {t && (
                            <div className="text-xs font-mono text-[#4ADE80] mt-0.5">
                              Harga Kita: {t.basePriceDisplay}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono whitespace-nowrap">
                          <div
                            className={`text-base font-bold ${
                              isBelowRoas ? "text-[#F87171]" : "text-[#4ADE80]"
                            }`}
                          >
                            ROAS {row.roas.toFixed(2)}x{" "}
                            {isBelowRoas ? "(BONCOS)" : "(SEHAT)"}
                          </div>
                          <div className="text-xs text-[#A3A3A3] mt-0.5">
                            Biaya: {formatIdrPrice(row.adSpend)}
                          </div>
                          <div className="text-xs text-[#F5F5F5]">
                            Omzet: {formatIdrPrice(row.gmv)}
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono max-w-[220px]">
                          {row.auditStatus === "AUDITING" ? (
                            <span className="text-xs text-[#FF5C00]">
                              Menarik DOM Senikersku.com...
                            </span>
                          ) : t ? (
                            <div>
                              <div className="font-bold text-[#F5F5F5]">
                                Golden Ratio:{" "}
                                <span
                                  className={
                                    t.adProtection.goldenSizeRatioPct < 25
                                      ? "text-[#F87171]"
                                      : t.adProtection.goldenSizeRatioPct < 50
                                      ? "text-[#FACC15]"
                                      : "text-[#4ADE80]"
                                  }
                                >
                                  {t.adProtection.goldenSizeRatioPct}% (
                                  {t.adProtection.goldenSizesAvailable}/
                                  {t.adProtection.goldenSizesTotal})
                                </span>
                              </div>
                              <div className="text-xs text-[#A3A3A3] mt-0.5 break-words">
                                Ready ({t.availableVariantsCount}/
                                {t.totalVariants}):{" "}
                                <strong className="text-[#F5F5F5]">
                                  {t.availableSizeLabels.join(", ") || "HABIS"}
                                </strong>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-[#A3A3A3]">
                              Menunggu audit...
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono max-w-[230px]">
                          {q ? (
                            <div>
                              <div className="font-bold text-[#F5F5F5]">
                                {q.lowestCompetitorName}:{" "}
                                {q.lowestCompetitorPriceDisplay}
                              </div>
                              <div className="text-xs text-[#A3A3A3] mt-0.5 break-words">
                                Ukuran Ready:{" "}
                                {q.lowestCompetitorRunningSizes.length > 0
                                  ? q.lowestCompetitorRunningSizes.join(", ")
                                  : "Kosong / Tidak Ditemukan"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-[#A3A3A3]">
                              Memindai 6 kompetitor...
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 max-w-[380px]">
                          {q ? (
                            <div className="space-y-1.5">
                              <span
                                className={`inline-block px-2.5 py-1 font-mono text-xs font-bold ${getQuadrantBadgeClass(
                                  q.quadrantId
                                )}`}
                              >
                                {q.badgeLabel}
                              </span>
                              <p className="text-xs text-[#F5F5F5] leading-relaxed">
                                {q.bossReason}
                              </p>
                              <p className="text-xs font-semibold text-[#FACC15]">
                                Aksi: {q.channelActionPlan}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs font-mono text-[#A3A3A3]">
                              Menghitung kuadran...
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            disabled={!t}
                            onClick={() => {
                              if (!t) return;
                              const enriched: InterceptProductTarget = {
                                ...t,
                                competitors: row.competitors,
                                quadrantDecision: row.quadrant || undefined,
                              };
                              loadProductIntoInspector(enriched, false);
                              inspectorRef.current?.scrollIntoView({
                                behavior: "smooth",
                              });
                            }}
                            className="min-h-[44px] px-3.5 py-2 bg-[#141414] border-2 border-[#F5F5F5] text-xs font-bold text-[#F5F5F5] hover:border-[#FF5C00] hover:text-[#FF5C00] disabled:border-[#666666] disabled:text-[#A3A3A3] transition-colors"
                          >
                            Bedah Detail &amp; Ukuran
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* MAIN 2-COLUMN WORKSPACE: 60% LEFT // 40% RIGHT */}
      <main
        ref={inspectorRef}
        className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[#262626]"
      >
        {/* Left Column (60% Width on Desktop) */}
        <div className="w-full lg:w-[60%]">
          <LiveInterceptorViewport
            target={target}
            selectedVariantIdx={selectedVariantIdx}
            isLoading={isLoading}
            isCheckingCompetitors={isCheckingCompetitors}
            errorMessage={errorMessage}
            ctaProbed={ctaProbed}
            onSelectVariant={handleSelectVariant}
            onProbeCta={handleProbeCta}
            onRetryAudit={() => void executeSingleAudit(urlInput, false)}
            onRunCompetitorRadar={() =>
              target && void runCompetitorRadarForTarget(target, null)
            }
          />
        </div>

        {/* Right Column (40% Width on Desktop) */}
        <div className="w-full lg:w-[40%]">
          <RightTelemetryColumn
            logs={logs}
            variants={target?.variants ?? []}
            selectedVariantIdx={selectedVariantIdx}
            voiceOver={target?.voiceOver ?? null}
            isLoading={isLoading}
            isSpeaking={isSpeaking}
            onPlayVoiceOver={() =>
              target?.voiceOver && playVoiceOverText(target.voiceOver.script)
            }
            onStopVoiceOver={stopVoiceOver}
            onSelectVariant={handleSelectVariant}
          />
        </div>
      </main>

      {/* Clean Footer Landmark */}
      <footer className="border-t border-[#262626] bg-[#0D0D0D] px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#A3A3A3] shrink-0">
        <span>
          Multi-Channel Ad-Spend Triage (Shopee / TikTok / Google PMax) &amp;
          Radar 6 Kompetitor Sneaker Indonesia.
        </span>
        <span className="font-mono">
          Kontras Terverifikasi WCAG AAA (17.83:1, 12.69:1, 11.15:1, 7.03:1)
        </span>
      </footer>
    </div>
  );
}
