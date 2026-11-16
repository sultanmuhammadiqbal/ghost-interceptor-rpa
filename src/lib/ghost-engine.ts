export const DEFAULT_TARGET_URL =
  "https://senikersku.com/product/adidas-adizero-adios-9-satisfy-brown-charcoal/";

export const DEFAULT_CATEGORY_URL =
  "https://senikersku.com/product-category/footwear/";

export const MAX_VO_WORDS = 22;
export const MAX_VO_CHARS = 145;

export type PlatformType =
  | "WOOCOMMERCE"
  | "SHOPIFY"
  | "807GARAGE_API"
  | "SCHEMA_ORG"
  | "GENERIC_DOM";

export type AdVerdictCode = "SCALE" | "WARNING" | "PAUSE_ADS";

export type QuadrantCode =
  | "KUADRAN_1"
  | "KUADRAN_2"
  | "KUADRAN_3"
  | "KUADRAN_4";

export interface VariantAuditRow {
  somId: string;
  sizeLabel: string;
  attributeValue: string;
  skuCode: string;
  exactPrice: string;
  numericPrice: number | null;
  inStock: boolean;
  stockStatus: "TERSEDIA" | "HABIS" | "TIDAK TERDETEKSI";
  stockDetail: string;
  stockQuantity: number | null;
  isGoldenSize: boolean;
  domSelector: string;
}

export interface AdSpendProtectionMetrics {
  sizeCategoryLabel: string;
  goldenSizesTotal: number;
  goldenSizesAvailable: number;
  goldenAvailableList: string[];
  goldenMissingList: string[];
  goldenSizeRatioPct: number;
  totalInventoryUnits: number | null;
  singleUnitVariantSizes: string[];
  verdictCode: AdVerdictCode;
  verdictBadge:
    | "SCALE / AMAN DIIKLANKAN"
    | "PERINGATAN: STOK KRITIS"
    | "PAUSE ADS SEKARANG! (BAHAYA BONCOS)";
  verdictReason: string;
  wasteRiskNote: string;
  customLabel0: "SCALE_READY" | "LOW_STOCK_WATCH" | "PAUSE_ADS_BONCOS_RISK";
}

export interface CompetitorStoreResult {
  competitorId:
    | "807GARAGE"
    | "KICKAVENUE"
    | "ATMOS_ID"
    | "FOOTLOCKER_ID"
    | "JDSPORTS_ID"
    | "ZALORA_ID";
  competitorName: string;
  domain: string;
  status: "DITEMUKAN" | "TIDAK_DITEMUKAN";
  matchedTitle: string;
  priceDisplay: string;
  numericPrice: number | null;
  priceDiffFromOurs: number | null;
  productUrl: string;
  runningSizes: string[];
  hasGoldenSizesInStock: boolean;
  note: string;
}

export interface QuadrantDecision {
  quadrantId: QuadrantCode;
  badgeLabel:
    | "KUADRAN 1: FALSE BONCOS (TURUNKAN BID / PAUSE PMAX)"
    | "KUADRAN 2: KALAH HARGA DI UKURAN SAMA (BUTUH VOUCHER / ADJUST HARGA)"
    | "KUADRAN 3: MENANG STOK UKURAN (PERTAHANKAN / GAS IKLAN!)"
    | "KUADRAN 4: BOM WAKTU / TIME-BOMB (SIAPKAN PENURUNAN BUDGET)";
  bossReason: string;
  channelActionPlan: string;
  lowestCompetitorName: string;
  lowestCompetitorPriceDisplay: string;
  lowestCompetitorUrl: string;
  lowestCompetitorRunningSizes: string[];
}

export interface AuditLogEntry {
  id: string;
  stepIndex: number;
  timestamp: string;
  category: "DOM" | "HARGA" | "VARIAN" | "IKLAN" | "KOMPETITOR" | "CTA" | "AUDIO";
  message: string;
}

export interface VoiceOverBrief {
  script: string;
  words: number;
  maxWords: 22;
  chars: number;
  maxChars: 145;
  singleProductLocked: boolean;
  passedHardGuard: boolean;
  metricDisplay: string;
}

export interface InterceptProductTarget {
  url: string;
  domain: string;
  platformDetected: PlatformType;
  productTitle: string;
  brand: string;
  productSku: string;
  categoryName: string;
  basePriceDisplay: string;
  numericBasePrice: number | null;
  imageUrl: string;
  imageAlt: string;
  ctaLabel: string;
  ctaSelector: string;
  ctaAvailable: boolean;
  totalVariants: number;
  availableVariantsCount: number;
  availableSizeLabels: string[];
  missingSizeLabels: string[];
  variants: VariantAuditRow[];
  adProtection: AdSpendProtectionMetrics;
  competitors?: CompetitorStoreResult[];
  quadrantDecision?: QuadrantDecision;
  auditLogs: AuditLogEntry[];
  voiceOver: VoiceOverBrief;
}

export interface AdCampaignRowInput {
  id: string;
  productName: string;
  channel: string;
  adSpend: number;
  gmv: number;
  roas: number;
  clicks: number;
  conversions: number;
  productUrl?: string;
}

export interface TriageAuditedRow extends AdCampaignRowInput {
  auditStatus: "PENDING" | "AUDITING" | "DONE" | "ERROR";
  scrapedTarget: InterceptProductTarget | null;
  competitors: CompetitorStoreResult[];
  quadrant: QuadrantDecision | null;
  stockSource: "SENIKERSKU_LIVE_DOM" | "UPLOADED_STOCK_FILE" | "BELUM_DIAUDIT";
}

export const SAMPLE_SENIKERSKU_AD_REPORT_CSV = [
  "Nama Produk,Channel Iklan,Biaya Iklan,Omzet Penjualan,ROAS,Klik,Konversi,URL Produk",
  "Adidas Adizero Adios 9 Satisfy Brown Charcoal,Shopee Ads + Google PMax,920000,3700000,4.02,640,1,https://senikersku.com/product/adidas-adizero-adios-9-satisfy-brown-charcoal/",
  "Adidas Adizero Evo SL Yellow Royal Blue,Shopee Ads + Search,680000,5400000,7.94,510,2,https://senikersku.com/product/adidas-adizero-evo-sl-yellow-royal-blue/",
  "Nike Vomero Premium Gridiron Black,TikTok Shop Ads + PMax,540000,7600000,14.07,420,2,https://senikersku.com/product/nike-vomero-premium-gridiron-black/",
  "Salomon XT-6 Gore-Tex Paloma Maroon Banner,Shopee Ads,450000,3850000,8.56,310,1,https://senikersku.com/product/salomon-xt-6-gore-tex-paloma-maroon-banner/",
  "Adidas Samba Mule Off White Brown Womens,Google PMax,290000,5200000,17.93,280,3,https://senikersku.com/product/adidas-samba-mule-off-white-brown-womens/",
].join("\n");

export function decodeHtmlEntities(input: string): string {
  if (!input) return "";
  return input
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}

export function stripHtmlTags(input: string): string {
  if (!input) return "";
  return decodeHtmlEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function parseNumericPrice(val: unknown): number | null {
  if (typeof val === "number" && Number.isFinite(val) && val > 0) {
    return Math.round(val);
  }
  const raw = String(val ?? "").trim();
  if (!raw) return null;
  // Strip trailing .00 or ,00 decimal cents before extracting digits.
  const withoutCents = raw.replace(/[,.]00(\D|$)/g, "$1");
  const digits = withoutCents.replace(/[^\d]/g, "");
  if (!digits) return null;
  const parsed = parseInt(digits, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function formatIdrPrice(val: unknown): string {
  const num = parseNumericPrice(val);
  if (num === null) return "TIDAK TERDETEKSI";
  return "Rp" + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getTimeStamp(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function toTitleCaseWords(text: string): string {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Determines whether a size label falls into the Golden Size range:
 * - Footwear: EU 39 to 43 (including fractional sizes like 39 1/3, 40 2/3, 41 1/3, 42 2/3, 43 1/3, 43.5)
 *   or equivalent US 6.5 - 9.5 / UK 6 - 9 when explicitly prefixed.
 * - Apparel: M, L, XL (Medium, Large, X-Large).
 */
export function detectGoldenSizeStatus(sizeLabel: string): {
  isGolden: boolean;
  kind: "FOOTWEAR" | "APPAREL" | "OTHER";
} {
  const cleaned = sizeLabel.trim().toUpperCase();
  if (!cleaned) return { isGolden: false, kind: "OTHER" };

  if (
    /^(?:SIZE\s+|SZ\s+)?(XXS|XS|S|M|L|XL|XXL|2XL|3XL|SMALL|MEDIUM|LARGE|X-LARGE)$/i.test(
      cleaned
    )
  ) {
    const isGoldenApparel =
      /^(?:SIZE\s+|SZ\s+)?(M|L|XL|MEDIUM|LARGE|X-LARGE)$/i.test(cleaned);
    return { isGolden: isGoldenApparel, kind: "APPAREL" };
  }

  const fracMatch = cleaned.match(/(\d{1,2})\s+(\d)\/(\d)/);
  if (fracMatch) {
    const whole = parseInt(fracMatch[1], 10);
    const num = parseInt(fracMatch[2], 10);
    const den = parseInt(fracMatch[3], 10);
    const val = whole + (den > 0 ? num / den : 0);
    if (val >= 35 && val <= 50) {
      return {
        isGolden: val >= 39 && val <= 43.7,
        kind: "FOOTWEAR",
      };
    }
  }

  const decMatch = cleaned.match(/(\d{1,2}(?:[.,]\d)?)/);
  if (decMatch) {
    const val = parseFloat(decMatch[1].replace(",", "."));
    if (val >= 34 && val <= 50) {
      return {
        isGolden: val >= 39 && val <= 43.7,
        kind: "FOOTWEAR",
      };
    }
    if (/\bUS\b/.test(cleaned) && val >= 4 && val <= 15) {
      return {
        isGolden: val >= 6.5 && val <= 9.5,
        kind: "FOOTWEAR",
      };
    }
    if (/\bUK\b/.test(cleaned) && val >= 3 && val <= 14) {
      return {
        isGolden: val >= 6 && val <= 9,
        kind: "FOOTWEAR",
      };
    }
  }

  return { isGolden: false, kind: "OTHER" };
}

export function computeAdSpendProtection(
  variants: VariantAuditRow[],
  ctaAvailable: boolean
): AdSpendProtectionMetrics {
  const footwearCount = variants.filter(
    (v) => detectGoldenSizeStatus(v.sizeLabel).kind === "FOOTWEAR"
  ).length;
  const apparelCount = variants.filter(
    (v) => detectGoldenSizeStatus(v.sizeLabel).kind === "APPAREL"
  ).length;

  let sizeCategoryLabel = "VARIAN UMUM";
  if (footwearCount > 0) {
    sizeCategoryLabel = "SEPATU (GOLDEN SIZE EU 39-43)";
  } else if (apparelCount > 0) {
    sizeCategoryLabel = "PAKAIAN (GOLDEN SIZE M-XL)";
  }

  const explicitGoldenVariants = variants.filter((v) => v.isGoldenSize);
  const targetPool =
    explicitGoldenVariants.length > 0 ? explicitGoldenVariants : variants;

  const goldenSizesTotal = targetPool.length;
  const goldenAvailableVariants = targetPool.filter((v) => v.inStock);
  const goldenMissingVariants = targetPool.filter((v) => !v.inStock);

  const goldenSizesAvailable = goldenAvailableVariants.length;
  const goldenAvailableList = goldenAvailableVariants.map((v) => v.sizeLabel);
  const goldenMissingList = goldenMissingVariants.map((v) => v.sizeLabel);

  const goldenSizeRatioPct =
    goldenSizesTotal > 0
      ? Math.round((goldenSizesAvailable / goldenSizesTotal) * 100)
      : ctaAvailable
      ? 100
      : 0;

  const knownQuantities = variants
    .filter((v) => v.inStock && typeof v.stockQuantity === "number")
    .map((v) => v.stockQuantity as number);

  const totalInventoryUnits =
    knownQuantities.length > 0
      ? knownQuantities.reduce((acc, q) => acc + q, 0)
      : null;

  const singleUnitVariantSizes = variants
    .filter((v) => v.inStock && v.stockQuantity === 1)
    .map((v) => v.sizeLabel);

  const inStockCount = variants.filter((v) => v.inStock).length;
  const avgUnitsPerAvailableSize =
    totalInventoryUnits !== null && inStockCount > 0
      ? totalInventoryUnits / inStockCount
      : null;

  let verdictCode: AdVerdictCode = "SCALE";
  let verdictBadge: AdSpendProtectionMetrics["verdictBadge"] =
    "SCALE / AMAN DIIKLANKAN";
  let verdictReason = "";
  let wasteRiskNote = "";
  let customLabel0: AdSpendProtectionMetrics["customLabel0"] = "SCALE_READY";

  if (!ctaAvailable || inStockCount === 0 || goldenSizeRatioPct < 25) {
    verdictCode = "PAUSE_ADS";
    verdictBadge = "PAUSE ADS SEKARANG! (BAHAYA BONCOS)";
    customLabel0 = "PAUSE_ADS_BONCOS_RISK";

    if (!ctaAvailable || inStockCount === 0) {
      verdictReason =
        "Seluruh ukuran habis atau tombol keranjang tidak aktif. Iklan aktif pada URL ini akan membuang 100% biaya klik tanpa konversi.";
      wasteRiskNote =
        "Risiko Pemborosan Iklan: 100% trafik iklan berbayar tidak dapat melakukan pembelian.";
    } else {
      const missingStr =
        goldenMissingList.length > 0
          ? goldenMissingList.join(", ")
          : "ukuran utama";
      const availStr =
        goldenAvailableList.length > 0
          ? goldenAvailableList.join(", ")
          : "ukuran ekstrem";
      const unitInfo =
        totalInventoryUnits !== null
          ? ` (total sisa ${totalInventoryUnits} unit)`
          : "";
      verdictReason = `Hanya ${goldenSizesAvailable} dari ${goldenSizesTotal} Golden Size (${goldenSizeRatioPct}%) yang tersedia (${availStr})${unitInfo}. Ukuran populer (${missingStr}) sudah habis.`;
      wasteRiskNote = `Risiko Boncos: Sekitar ${
        100 - goldenSizeRatioPct
      }% calon pembeli di rentang ukuran utama (39-43) akan batal membeli karena ukuran mereka habis.`;
    }
  } else if (
    goldenSizeRatioPct < 50 ||
    (avgUnitsPerAvailableSize !== null && avgUnitsPerAvailableSize <= 1)
  ) {
    verdictCode = "WARNING";
    verdictBadge = "PERINGATAN: STOK KRITIS";
    customLabel0 = "LOW_STOCK_WATCH";

    if (avgUnitsPerAvailableSize !== null && avgUnitsPerAvailableSize <= 1) {
      verdictReason = `Rasio Golden Size ${goldenSizeRatioPct}% (${goldenSizesAvailable}/${goldenSizesTotal}), namun rata-rata sisa stok hanya 1 pasang per ukuran tersedia (total ${totalInventoryUnits} unit).`;
      wasteRiskNote =
        "Tindakan Disarankan: Turunkan bid iklan atau siapkan aturan auto-pause begitu 1 pasang terakhir terjual.";
    } else {
      verdictReason = `Ketersediaan Golden Size berada di level kritis ${goldenSizeRatioPct}% (${goldenSizesAvailable} dari ${goldenSizesTotal} ukuran utama: ${goldenAvailableList.join(
        ", "
      )}).`;
      wasteRiskNote = `Risiko Konversi Turun: ${
        100 - goldenSizeRatioPct
      }% ukuran utama (${goldenMissingList.join(
        ", "
      )}) sudah habis. Pantau ROAS harian dengan ketat.`;
    }
  } else {
    verdictCode = "SCALE";
    verdictBadge = "SCALE / AMAN DIIKLANKAN";
    customLabel0 = "SCALE_READY";
    const unitNote =
      totalInventoryUnits !== null
        ? ` dengan kedalaman stok ${totalInventoryUnits} unit`
        : "";
    verdictReason = `Rasio Golden Size sehat di ${goldenSizeRatioPct}% (${goldenSizesAvailable} dari ${goldenSizesTotal} ukuran utama tersedia: ${goldenAvailableList.join(
      ", "
    )})${unitNote} dan tombol keranjang aktif.`;
    wasteRiskNote =
      "Status Budget Iklan: Aman untuk menjalankan kampanye Shopee Ads, TikTok Ads & Google PMax.";
  }

  return {
    sizeCategoryLabel,
    goldenSizesTotal,
    goldenSizesAvailable,
    goldenAvailableList,
    goldenMissingList,
    goldenSizeRatioPct,
    totalInventoryUnits,
    singleUnitVariantSizes,
    verdictCode,
    verdictBadge,
    verdictReason,
    wasteRiskNote,
    customLabel0,
  };
}

/**
 * Computes the 4-Quadrant Executive Decision by marrying:
 * 1) Ad ROAS (vs targetRoas, default 15.0)
 * 2) Senikersku Golden Size Stock (EU 39-43)
 * 3) Competitor Live Prices & Running Sizes (807Garage, Kick Avenue, Atmos, etc.)
 */
export function computeFourQuadrantDecision(params: {
  ourPrice: number | null;
  ourAvailableSizes: string[];
  adProtection: AdSpendProtectionMetrics;
  competitors: CompetitorStoreResult[];
  roas?: number | null;
  targetRoas?: number;
}): QuadrantDecision {
  const {
    ourPrice,
    ourAvailableSizes,
    adProtection,
    competitors,
    roas = null,
    targetRoas = 15.0,
  } = params;

  const foundCompetitors = competitors.filter(
    (c) => c.status === "DITEMUKAN" && c.numericPrice !== null
  );
  foundCompetitors.sort(
    (a, b) => (a.numericPrice ?? Infinity) - (b.numericPrice ?? Infinity)
  );

  const lowestComp = foundCompetitors[0] || null;
  const lowestCompetitorName = lowestComp
    ? lowestComp.competitorName
    : "Tidak Ditemukan di Kompetitor";
  const lowestCompetitorPriceDisplay = lowestComp
    ? lowestComp.priceDisplay
    : "TIDAK DITEMUKAN";
  const lowestCompetitorUrl = lowestComp ? lowestComp.productUrl : "";
  const lowestCompetitorRunningSizes = lowestComp
    ? lowestComp.runningSizes
    : [];

  const isGoldenCriticalOrEmpty =
    adProtection.goldenSizesAvailable <= 1 ||
    adProtection.goldenSizeRatioPct < 25 ||
    ourAvailableSizes.length === 0;

  const isLowRoas = roas !== null ? roas < targetRoas : true;

  // Check if a competitor is cheaper AND has Golden Sizes in stock
  const cheaperCompWithGolden = foundCompetitors.find(
    (c) =>
      ourPrice !== null &&
      c.numericPrice !== null &&
      c.numericPrice < ourPrice &&
      (c.hasGoldenSizesInStock || c.runningSizes.length >= 2)
  );

  // KUADRAN 4: High ROAS (>= targetRoas) BUT Golden Size stock just ran out or only 1 unit/size left
  if (
    roas !== null &&
    roas >= targetRoas &&
    (isGoldenCriticalOrEmpty ||
      adProtection.goldenSizeRatioPct < 40 ||
      (adProtection.totalInventoryUnits !== null &&
        adProtection.totalInventoryUnits <= 2))
  ) {
    const availText =
      ourAvailableSizes.length > 0
        ? ourAvailableSizes.join(", ")
        : "habis total";
    return {
      quadrantId: "KUADRAN_4",
      badgeLabel:
        "KUADRAN 4: BOM WAKTU / TIME-BOMB (SIAPKAN PENURUNAN BUDGET)",
      bossReason: `ROAS minggu ini masih tinggi (${roas.toFixed(
        2
      )}x), namun ukuran utama (39-43) baru saja menipis/habis (tersisa ukuran: ${availText}, Golden Ratio ${
        adProtection.goldenSizeRatioPct
      }%). Segera turunkan budget hari ini sebelum besok berubah menjadi boncos.`,
      channelActionPlan:
        "Shopee/TikTok Ads: Turunkan budget harian 50% mulai sore ini. Google PMax: Kecualikan SKU ini dari grup aset prioritas.",
      lowestCompetitorName,
      lowestCompetitorPriceDisplay,
      lowestCompetitorUrl,
      lowestCompetitorRunningSizes,
    };
  }

  // KUADRAN 1: FALSE BONCOS (ROAS < 15 AND Golden Size is out of stock or <= 1 size left)
  if (isLowRoas && isGoldenCriticalOrEmpty) {
    const availText =
      ourAvailableSizes.length > 0
        ? `hanya tersisa ukuran ${ourAvailableSizes.join(", ")}`
        : "seluruh ukuran habis";
    return {
      quadrantId: "KUADRAN_1",
      badgeLabel: "KUADRAN 1: FALSE BONCOS (TURUNKAN BID / PAUSE PMAX)",
      bossReason: `Iklan boncos${
        roas !== null ? ` (ROAS ${roas.toFixed(2)}x < ${targetRoas}x)` : ""
      } bukan karena salah setting iklan, tetapi ukuran kaki mayoritas pembeli (39-43) sudah habis (${availText}, Golden Size ${
        adProtection.goldenSizeRatioPct
      }%). Turunkan bid ke minimum di Shopee dan alihkan budget Google Search/PMax ke produk lain.`,
      channelActionPlan:
        "Shopee/TikTok Ads: Turunkan bid CPC ke minimum / matikan auto-boost. Google Search & PMax: Pause listing item ID ini sekarang.",
      lowestCompetitorName,
      lowestCompetitorPriceDisplay,
      lowestCompetitorUrl,
      lowestCompetitorRunningSizes,
    };
  }

  // KUADRAN 2: KALAH HARGA DI UKURAN SAMA (Golden Size kita aman, tapi kompetitor lebih murah di ukuran yang sama)
  if (cheaperCompWithGolden && ourPrice !== null && cheaperCompWithGolden.numericPrice !== null) {
    const diff = ourPrice - cheaperCompWithGolden.numericPrice;
    const diffStr = formatIdrPrice(diff);
    return {
      quadrantId: "KUADRAN_2",
      badgeLabel:
        "KUADRAN 2: KALAH HARGA DI UKURAN SAMA (BUTUH VOUCHER / ADJUST HARGA)",
      bossReason: `Stok ukuran kita aman (${
        adProtection.goldenSizeRatioPct
      }% Golden Size ready: ${adProtection.goldenAvailableList.join(
        ", "
      )}), namun kompetitor (${
        cheaperCompWithGolden.competitorName
      }) menjual lebih murah ${diffStr} (${
        cheaperCompWithGolden.priceDisplay
      } vs ${formatIdrPrice(
        ourPrice
      )}) dengan ukuran masih tersedia. Jangan paksakan bakar iklan sebelum memberi voucher diskon.`,
      channelActionPlan: `Pasang Voucher Toko / Flash Sale minimal ${diffStr} di Shopee & TikTok, atau tahan kenaikan bid sampai harga kompetitif.`,
      lowestCompetitorName: cheaperCompWithGolden.competitorName,
      lowestCompetitorPriceDisplay: cheaperCompWithGolden.priceDisplay,
      lowestCompetitorUrl: cheaperCompWithGolden.productUrl,
      lowestCompetitorRunningSizes: cheaperCompWithGolden.runningSizes,
    };
  }

  // KUADRAN 3: MENANG STOK UKURAN (Kita punya Golden Size lengkap, kompetitor kosong atau lebih mahal)
  return {
    quadrantId: "KUADRAN_3",
    badgeLabel: "KUADRAN 3: MENANG STOK UKURAN (PERTAHANKAN / GAS IKLAN!)",
    bossReason: `Kita memegang stok ukuran populer (${
      adProtection.goldenAvailableList.length > 0
        ? adProtection.goldenAvailableList.join(", ")
        : ourAvailableSizes.join(", ")
    }, Golden Ratio ${
      adProtection.goldenSizeRatioPct
    }%) sementara kompetitor kehabisan ukuran utama atau menjual lebih mahal (${lowestCompetitorName}: ${lowestCompetitorPriceDisplay}). Pertahankan dan gas iklan Shopee, TikTok & Google Search dengan menonjolkan ukuran yang ready.`,
    channelActionPlan:
      "Shopee/TikTok Ads: Pertahankan bid di kata kunci utama & tampilkan badge Ready Stock. Google Search/PMax: Jadikan produk unggulan (Hero SKU).",
    lowestCompetitorName,
    lowestCompetitorPriceDisplay,
    lowestCompetitorUrl,
    lowestCompetitorRunningSizes,
  };
}

export function enforceVoiceOverHardGuard(
  rawCandidate: string,
  context: {
    productTitle: string;
    basePriceDisplay: string;
    availableSizes: string[];
    totalVariants: number;
    goldenSizeRatioPct: number;
    verdictCode: AdVerdictCode;
  }
): VoiceOverBrief {
  let text = rawCandidate
    .replace(/[\u2014\u2013]/g, ",")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    text = buildRealAudioBriefText(context);
  }

  let wordsArr = text.split(" ").filter(Boolean);
  if (wordsArr.length > MAX_VO_WORDS) {
    wordsArr = wordsArr.slice(0, MAX_VO_WORDS);
    text = wordsArr.join(" ").replace(/[,;:]$/, "") + ".";
  }

  if (text.length > MAX_VO_CHARS) {
    const sliced = text.slice(0, MAX_VO_CHARS - 1);
    const lastSpace = sliced.lastIndexOf(" ");
    text =
      (lastSpace > 20 ? sliced.slice(0, lastSpace) : sliced).replace(
        /[.,;:]$/,
        ""
      ) + ".";
  }

  const finalWords = text.split(" ").filter(Boolean).length;
  const finalChars = text.length;
  const passedHardGuard =
    finalWords <= MAX_VO_WORDS && finalChars <= MAX_VO_CHARS;

  return {
    script: text,
    words: finalWords,
    maxWords: MAX_VO_WORDS,
    chars: finalChars,
    maxChars: MAX_VO_CHARS,
    singleProductLocked: true,
    passedHardGuard,
    metricDisplay: `${finalWords}/${MAX_VO_WORDS} KATA · ${finalChars}/${MAX_VO_CHARS} KARAKTER`,
  };
}

export function buildRealAudioBriefText(context: {
  productTitle: string;
  basePriceDisplay: string;
  availableSizes: string[];
  totalVariants: number;
  goldenSizeRatioPct: number;
  verdictCode: AdVerdictCode;
}): string {
  const {
    productTitle,
    basePriceDisplay,
    availableSizes,
    totalVariants,
    goldenSizeRatioPct,
    verdictCode,
  } = context;

  if (productTitle === "TIDAK TERDETEKSI") {
    return "Data produk tidak terdeteksi pada halaman ini. Periksa kembali struktur DOM URL target.";
  }

  const shortTitle = toTitleCaseWords(
    productTitle.split(/\s+/).slice(0, 4).join(" ")
  );
  const pricePart =
    basePriceDisplay !== "TIDAK TERDETEKSI"
      ? basePriceDisplay
      : "tanpa harga";

  const verdictShort =
    verdictCode === "PAUSE_ADS"
      ? "Verdict: Pause Ads sekarang."
      : verdictCode === "WARNING"
      ? "Verdict: Stok kritis."
      : "Verdict: Aman diiklankan.";

  if (totalVariants === 0) {
    return `${shortTitle} ${pricePart}. Tanpa varian ukuran. ${verdictShort}`;
  }

  if (availableSizes.length === 0) {
    return `${shortTitle} ${pricePart}. Seluruh ${totalVariants} ukuran habis. ${verdictShort}`;
  }

  if (availableSizes.length === 1) {
    return `${shortTitle} ${pricePart}. Hanya ukuran ${availableSizes[0]} tersedia, Golden Size ${goldenSizeRatioPct}%. ${verdictShort}`;
  }

  return `${shortTitle} ${pricePart}. ${availableSizes.length} dari ${totalVariants} ukuran tersedia, Golden Size ${goldenSizeRatioPct}%. ${verdictShort}`;
}

interface WooVariationRaw {
  variation_id?: number | string;
  sku?: string | number;
  display_price?: number | string;
  display_regular_price?: number | string;
  price_html?: string;
  is_in_stock?: boolean;
  is_purchasable?: boolean;
  availability_html?: string;
  max_qty?: number | string;
  attributes?: Record<string, string>;
  image?: {
    full_src?: string;
    url?: string;
    src?: string;
    alt?: string;
  };
}

export interface ShopifyProductJsonRaw {
  id?: number | string;
  title?: string;
  vendor?: string;
  product_type?: string;
  featured_image?: string;
  images?: string[];
  variants?: Array<{
    id?: number | string;
    title?: string;
    option1?: string;
    sku?: string;
    price?: number | string;
    available?: boolean;
    inventory_quantity?: number;
  }>;
}

function parseStockQuantityFromText(
  availText: string,
  maxQty: unknown
): number | null {
  const match =
    availText.match(/(\d+)\s+in\s+stock/i) || availText.match(/sisa\s+(\d+)/i);
  if (match?.[1]) {
    const q = parseInt(match[1], 10);
    if (Number.isFinite(q) && q >= 0) return q;
  }
  if (typeof maxQty === "number" && Number.isFinite(maxQty) && maxQty > 0) {
    return maxQty;
  }
  if (typeof maxQty === "string" && /^\d+$/.test(maxQty.trim())) {
    const q = parseInt(maxQty.trim(), 10);
    if (Number.isFinite(q) && q > 0) return q;
  }
  return null;
}

export function parseProductHtmlDom(
  html: string,
  sourceUrl: string,
  externalShopifyJson?: ShopifyProductJsonRaw | null
): InterceptProductTarget {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(sourceUrl);
  } catch {
    parsedUrl = new URL(DEFAULT_TARGET_URL);
  }

  const domain = parsedUrl.hostname.replace(/^www\./i, "").toUpperCase();
  const ts = getTimeStamp();
  const auditLogs: AuditLogEntry[] = [];
  const pushLog = (
    category: AuditLogEntry["category"],
    message: string
  ): void => {
    auditLogs.push({
      id: `audit-${auditLogs.length + 1}`,
      stepIndex: auditLogs.length + 1,
      timestamp: ts,
      category,
      message,
    });
  };

  // 1. Parse JSON-LD Product / ProductGroup / BreadcrumbList blocks
  const ldMatches = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ];

  const ldState: {
    product: Record<string, unknown> | null;
    breadcrumbs: string[];
  } = {
    product: null,
    breadcrumbs: [],
  };

  const scanLdNode = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(scanLdNode);
      return;
    }
    const obj = node as Record<string, unknown>;
    const rawType = obj["@type"];
    const types = Array.isArray(rawType) ? rawType : [rawType];
    if (
      (types.includes("Product") || types.includes("ProductGroup")) &&
      !ldState.product
    ) {
      ldState.product = obj;
    }
    if (
      types.includes("BreadcrumbList") &&
      Array.isArray(obj.itemListElement)
    ) {
      ldState.breadcrumbs = obj.itemListElement
        .map((item: unknown) => {
          if (!item || typeof item !== "object") return "";
          const el = item as Record<string, unknown>;
          const inner = el.item as Record<string, unknown> | undefined;
          return String(inner?.name || el.name || "").trim();
        })
        .filter(Boolean);
    }
    if (obj["@graph"]) {
      scanLdNode(obj["@graph"]);
    }
  };

  for (const match of ldMatches) {
    try {
      const parsed = JSON.parse(match[1].trim());
      scanLdNode(parsed);
    } catch {
      // Ignore malformed JSON-LD blocks on third-party plugins.
    }
  }

  const ldProduct = ldState.product;
  const ldBreadcrumbs = ldState.breadcrumbs;

  // 2. Detect embedded Shopify Product JSON if not already supplied
  let shopifyProduct: ShopifyProductJsonRaw | null =
    externalShopifyJson || null;

  if (!shopifyProduct) {
    const shopifyJsonMatches = [
      ...html.matchAll(
        /<script[^>]*type=["']application\/json["'][^>]*(?:id=["']ProductJson-[^"']*["']|data-product-json)[^>]*>([\s\S]*?)<\/script>/gi
      ),
    ];
    for (const m of shopifyJsonMatches) {
      try {
        const parsed = JSON.parse(m[1].trim());
        if (parsed && Array.isArray(parsed.variants)) {
          shopifyProduct = parsed as ShopifyProductJsonRaw;
          break;
        }
      } catch {
        // Ignore non-product JSON script tags.
      }
    }
  }

  // 3. Extract WooCommerce data-product_variations JSON when present
  let wcVariations: WooVariationRaw[] = [];
  const varAttrMatch =
    html.match(/data-product_variations=["']([^"']+)["']/i) ||
    html.match(/data-product_variations='([^']+)'/i);

  if (varAttrMatch?.[1] && varAttrMatch[1] !== "false") {
    try {
      const decodedJson = decodeHtmlEntities(varAttrMatch[1]);
      const parsedVars = JSON.parse(decodedJson);
      if (Array.isArray(parsedVars)) {
        wcVariations = parsedVars;
      }
    } catch {
      wcVariations = [];
    }
  }

  const isWooCommerceDom =
    wcVariations.length > 0 ||
    /woocommerce|variable-items-wrapper|single_add_to_cart_button/i.test(html);
  const isShopifyDom =
    Boolean(shopifyProduct) || /cdn\.shopify\.com|Shopify\.theme/i.test(html);

  const platformDetected: PlatformType = isWooCommerceDom
    ? "WOOCOMMERCE"
    : isShopifyDom
    ? "SHOPIFY"
    : ldProduct
    ? "SCHEMA_ORG"
    : "GENERIC_DOM";

  // 4. Extract Full Product Title without truncation
  const h1ProductMatch =
    html.match(
      /<h1[^>]*class=["'][^"']*(?:product_title|entry-title|product-title|product__title)[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i
    ) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

  const ogTitleMatch =
    html.match(
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i
    ) ||
    html.match(
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i
    );

  let rawTitle = "";
  if (h1ProductMatch?.[1]) {
    rawTitle = stripHtmlTags(h1ProductMatch[1]);
  } else if (shopifyProduct?.title) {
    rawTitle = String(shopifyProduct.title).trim();
  } else if (ldProduct && typeof ldProduct.name === "string") {
    rawTitle = decodeHtmlEntities(ldProduct.name).trim();
  } else if (ogTitleMatch?.[1]) {
    rawTitle = decodeHtmlEntities(ogTitleMatch[1])
      .replace(/\s*\|\s*[^|]+$/, "")
      .trim();
  }

  const productTitle = rawTitle ? rawTitle.toUpperCase() : "TIDAK TERDETEKSI";
  pushLog(
    "DOM",
    productTitle !== "TIDAK TERDETEKSI"
      ? `[${platformDetected}] Judul produk terdeteksi pada <h1>: "${productTitle}".`
      : "Judul produk tidak ditemukan pada elemen <h1> maupun metadata halaman."
  );

  // 5. Extract Product SKU, Brand, and Category
  const dataProductIdMatch = html.match(/data-product_id=["'](\d+)["']/i);
  const skuDomMatch = html.match(
    /<span[^>]*class=["'][^"']*sku[^"']*["'][^>]*>([\s\S]*?)<\/span>/i
  );
  const rawDomSku = skuDomMatch ? stripHtmlTags(skuDomMatch[1]) : "";
  const cleanedDomSku =
    rawDomSku && !/^sku:?$/i.test(rawDomSku.trim()) ? rawDomSku.trim() : "";

  const rawSku =
    cleanedDomSku ||
    (ldProduct?.sku ? String(ldProduct.sku) : "") ||
    (shopifyProduct?.id ? String(shopifyProduct.id) : "") ||
    (dataProductIdMatch ? dataProductIdMatch[1] : "");
  const productSku = rawSku ? rawSku.trim() : "TIDAK TERDETEKSI";

  let brand = "TIDAK TERDETEKSI";
  if (shopifyProduct?.vendor) {
    brand = String(shopifyProduct.vendor).trim().toUpperCase();
  } else if (ldProduct?.brand) {
    const b = ldProduct.brand;
    if (typeof b === "string") {
      brand = b.toUpperCase();
    } else if (Array.isArray(b) && b[0] && typeof b[0] === "object") {
      brand = String(
        (b[0] as Record<string, unknown>).name || ""
      ).toUpperCase();
    } else if (typeof b === "object" && b !== null) {
      brand = String((b as Record<string, unknown>).name || "").toUpperCase();
    }
  }
  if (!brand || brand === "TIDAK TERDETEKSI") {
    const brandMeta = html.match(
      /<meta[^>]*property=["'](?:product:brand|og:brand)["'][^>]*content=["']([^"']+)["']/i
    );
    if (brandMeta?.[1]) {
      brand = decodeHtmlEntities(brandMeta[1]).trim().toUpperCase();
    }
  }

  const filteredCrumbs = ldBreadcrumbs.filter(
    (c) => c.toLowerCase() !== "home" && c.toUpperCase() !== productTitle
  );
  const categoryName =
    filteredCrumbs.length > 0
      ? filteredCrumbs.join(" / ")
      : shopifyProduct?.product_type
      ? String(shopifyProduct.product_type)
      : "TIDAK TERDETEKSI";

  // 6. Extract Main Product Price
  let numericBasePrice: number | null = null;

  const summaryPriceMatch =
    html.match(/<p[^>]*class=["'][^"']*price[^"']*["'][^>]*>([\s\S]*?)<\/p>/i) ||
    html.match(
      /<span[^>]*class=["'][^"']*woocommerce-Price-amount[^"']*["'][^>]*>([\s\S]*?)<\/span>/i
    );

  if (summaryPriceMatch) {
    const bdiMatch =
      summaryPriceMatch[0].match(
        /woocommerce-Price-amount[\s\S]*?<\/bdi>/i
      ) || summaryPriceMatch;
    numericBasePrice = parseNumericPrice(stripHtmlTags(bdiMatch[0]));
  }

  if (numericBasePrice === null && wcVariations[0]?.display_price) {
    numericBasePrice = parseNumericPrice(wcVariations[0].display_price);
  }

  if (numericBasePrice === null && shopifyProduct?.variants?.[0]?.price) {
    const rawShopPrice = shopifyProduct.variants[0].price;
    const numShop =
      typeof rawShopPrice === "number"
        ? Math.round(rawShopPrice / 100)
        : parseNumericPrice(rawShopPrice);
    if (numShop !== null) numericBasePrice = numShop;
  }

  if (numericBasePrice === null) {
    const metaPriceMatch =
      html.match(
        /<meta[^>]*property=["'](?:product|og):price:amount["'][^>]*content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]*content=["']([^"']+)["'][^>]*property=["'](?:product|og):price:amount["']/i
      );
    if (metaPriceMatch?.[1]) {
      numericBasePrice = parseNumericPrice(metaPriceMatch[1]);
    }
  }

  if (numericBasePrice === null && ldProduct?.offers) {
    const offersNode = ldProduct.offers as Record<string, unknown> | unknown[];
    const offersList = Array.isArray(offersNode)
      ? offersNode
      : Array.isArray((offersNode as Record<string, unknown>)?.offers)
      ? ((offersNode as Record<string, unknown>).offers as unknown[])
      : [offersNode];
    for (const offer of offersList) {
      if (offer && typeof offer === "object") {
        const o = offer as Record<string, unknown>;
        const candidate = o.price ?? o.lowPrice ?? o.highPrice;
        const parsed = parseNumericPrice(candidate);
        if (parsed !== null) {
          numericBasePrice = parsed;
          break;
        }
      }
    }
  }

  const basePriceDisplay =
    numericBasePrice !== null
      ? formatIdrPrice(numericBasePrice)
      : "TIDAK TERDETEKSI";

  pushLog(
    "HARGA",
    basePriceDisplay !== "TIDAK TERDETEKSI"
      ? `Harga asli produk diekstrak dari DOM: ${basePriceDisplay}.`
      : "Harga produk tidak ditemukan pada elemen DOM halaman."
  );

  // 7. Extract Main Product Photo URL
  let imageUrl = "";
  let imageAlt = rawTitle || "Foto produk";

  if (wcVariations[0]?.image?.full_src || wcVariations[0]?.image?.url) {
    imageUrl = String(
      wcVariations[0].image.full_src || wcVariations[0].image.url || ""
    );
    if (wcVariations[0].image.alt) {
      imageAlt = decodeHtmlEntities(wcVariations[0].image.alt);
    }
  }

  if (!imageUrl && shopifyProduct) {
    const shopImg =
      shopifyProduct.featured_image || shopifyProduct.images?.[0] || "";
    if (shopImg) {
      imageUrl = shopImg.startsWith("//") ? `https:${shopImg}` : shopImg;
    }
  }

  if (!imageUrl && ldProduct?.image) {
    const imgNode = ldProduct.image;
    if (typeof imgNode === "string") {
      imageUrl = imgNode;
    } else if (Array.isArray(imgNode) && imgNode.length > 0) {
      const first = imgNode[0];
      imageUrl =
        typeof first === "string"
          ? first
          : String((first as Record<string, unknown>)?.url || "");
    } else if (typeof imgNode === "object" && imgNode !== null) {
      const imgObj = imgNode as Record<string, unknown>;
      imageUrl = String(imgObj.url || imgObj.contentUrl || "");
    }
  }

  if (!imageUrl) {
    const ogImgMatch =
      html.match(
        /<meta[^>]*property=["']og:image:secure_url["'][^>]*content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i
      );
    if (ogImgMatch?.[1]) {
      imageUrl = decodeHtmlEntities(ogImgMatch[1]).trim();
    }
  }

  if (!imageUrl) {
    const galleryMatch = html.match(
      /<div[^>]*class=["'][^"']*woocommerce-product-gallery__image[^"']*["'][^>]*>[\s\S]*?<img[^>]+(?:data-large_image|data-src|src)=["']([^"']+)["']/i
    );
    if (galleryMatch?.[1]) {
      imageUrl = decodeHtmlEntities(galleryMatch[1]).trim();
    }
  }

  if (
    imageUrl &&
    parsedUrl.protocol === "https:" &&
    imageUrl.startsWith("http://")
  ) {
    try {
      const imgParsed = new URL(imageUrl);
      if (imgParsed.hostname === parsedUrl.hostname) {
        imgParsed.protocol = "https:";
        imageUrl = imgParsed.toString();
      }
    } catch {
      // Keep original URL if parsing fails.
    }
  }

  // 8. Universal Variant Extraction (WooCommerce -> Shopify -> Schema.org -> Generic DOM)
  const variationByAttrValue = new Map<string, WooVariationRaw>();
  for (const v of wcVariations) {
    if (v && typeof v.attributes === "object" && v.attributes !== null) {
      for (const attrVal of Object.values(v.attributes)) {
        if (attrVal) {
          variationByAttrValue.set(String(attrVal).trim().toLowerCase(), v);
        }
      }
    }
  }

  const variants: VariantAuditRow[] = [];

  // Strategy A: WooCommerce / Swatch <li class="...variable-item...">
  const swatchMatches = [
    ...html.matchAll(
      /<li[^>]*class=["']([^"']*variable-item[^"']*)["'][^>]*>([\s\S]*?)<\/li>/gi
    ),
  ];

  if (swatchMatches.length > 0) {
    swatchMatches.forEach((m, idx) => {
      const fullTag = m[0];
      const classAttr = m[1] || "";
      const innerHtml = m[2] || "";

      const valMatch = fullTag.match(/data-value=["']([^"']+)["']/i);
      const titleMatch =
        fullTag.match(/data-title=["']([^"']+)["']/i) ||
        fullTag.match(/data-wvstooltip=["']([^"']+)["']/i) ||
        fullTag.match(/title=["']([^"']+)["']/i);

      const attributeValue = valMatch
        ? decodeHtmlEntities(valMatch[1]).trim()
        : "";
      const sizeLabel = (
        titleMatch
          ? decodeHtmlEntities(titleMatch[1]).trim()
          : stripHtmlTags(innerHtml)
      ).trim();

      if (!sizeLabel) return;

      const hasDisabledDomState =
        /\b(disabled|out-of-stock|oos|crossed-out)\b/i.test(classAttr) ||
        /aria-disabled=["']true["']/i.test(fullTag) ||
        /\bdisabled\b/i.test(fullTag);

      const matchedVar =
        variationByAttrValue.get(attributeValue.toLowerCase()) ||
        variationByAttrValue.get(sizeLabel.toLowerCase());

      let inStock = false;
      let numericVarPrice = numericBasePrice;
      let exactPrice = basePriceDisplay;
      let skuCode = "TIDAK TERDETEKSI";
      let stockDetail = "Habis / Disabled";
      let stockQuantity: number | null = null;

      if (wcVariations.length > 0) {
        if (matchedVar) {
          inStock = Boolean(
            matchedVar.is_in_stock !== false &&
              matchedVar.is_purchasable !== false &&
              !hasDisabledDomState
          );
          const parsedVarPrice = parseNumericPrice(
            matchedVar.display_price ?? matchedVar.display_regular_price
          );
          if (parsedVarPrice !== null) {
            numericVarPrice = parsedVarPrice;
            exactPrice = formatIdrPrice(parsedVarPrice);
          }
          if (matchedVar.sku) {
            skuCode = String(matchedVar.sku).trim();
          } else if (productSku !== "TIDAK TERDETEKSI") {
            skuCode = productSku;
          }
          const availClean = stripHtmlTags(matchedVar.availability_html || "");
          stockQuantity = parseStockQuantityFromText(
            availClean,
            matchedVar.max_qty
          );
          stockDetail =
            availClean ||
            (stockQuantity !== null
              ? `${stockQuantity} in stock`
              : inStock
              ? "Tersedia"
              : "Habis / Disabled");
        } else {
          inStock = false;
          stockDetail = "Habis / Tidak Tersedia";
        }
      } else {
        inStock = !hasDisabledDomState;
        stockDetail = inStock ? "Tersedia" : "Habis / Disabled";
        if (productSku !== "TIDAK TERDETEKSI") {
          skuCode = productSku;
        }
      }

      const { isGolden } = detectGoldenSizeStatus(sizeLabel);

      variants.push({
        somId: `#${idx + 1}`,
        sizeLabel,
        attributeValue: attributeValue || sizeLabel,
        skuCode,
        exactPrice,
        numericPrice: numericVarPrice,
        inStock,
        stockStatus: inStock ? "TERSEDIA" : "HABIS",
        stockDetail,
        stockQuantity: inStock ? stockQuantity : 0,
        isGoldenSize: isGolden,
        domSelector: `li.variable-item[data-value="${
          attributeValue || sizeLabel
        }"]`,
      });
    });
  }

  // Strategy B: Shopify Storefront Variants JSON
  if (variants.length === 0 && shopifyProduct?.variants?.length) {
    shopifyProduct.variants.forEach((sv, idx) => {
      const sizeLabel = String(
        sv.option1 || sv.title || `Varian ${idx + 1}`
      ).trim();
      const inStock = Boolean(sv.available);
      const rawVarPrice =
        typeof sv.price === "number"
          ? Math.round(sv.price / 100)
          : parseNumericPrice(sv.price);
      const numericVarPrice = rawVarPrice ?? numericBasePrice;
      const exactPrice =
        numericVarPrice !== null
          ? formatIdrPrice(numericVarPrice)
          : basePriceDisplay;
      const qty =
        typeof sv.inventory_quantity === "number" && sv.inventory_quantity >= 0
          ? sv.inventory_quantity
          : null;
      const { isGolden } = detectGoldenSizeStatus(sizeLabel);

      variants.push({
        somId: `#${idx + 1}`,
        sizeLabel,
        attributeValue: sizeLabel,
        skuCode: sv.sku ? String(sv.sku) : String(sv.id || productSku),
        exactPrice,
        numericPrice: numericVarPrice,
        inStock,
        stockStatus: inStock ? "TERSEDIA" : "HABIS",
        stockDetail:
          qty !== null ? `${qty} in stock` : inStock ? "Tersedia" : "Habis",
        stockQuantity: inStock ? qty : 0,
        isGoldenSize: isGolden,
        domSelector: `shopify-variant[data-variant-id="${sv.id || idx + 1}"]`,
      });
    });
  }

  // Strategy C: Schema.org Multi-Offer / hasVariant in JSON-LD
  if (variants.length === 0 && ldProduct) {
    const rawHasVariant = Array.isArray(ldProduct.hasVariant)
      ? (ldProduct.hasVariant as Array<Record<string, unknown>>)
      : [];
    const offersNode = ldProduct.offers as Record<string, unknown> | unknown[];
    const rawOffers = Array.isArray(offersNode)
      ? (offersNode as Array<Record<string, unknown>>)
      : Array.isArray((offersNode as Record<string, unknown>)?.offers)
      ? ((offersNode as Record<string, unknown>).offers as Array<
          Record<string, unknown>
        >)
      : [];

    if (rawHasVariant.length > 0) {
      rawHasVariant.forEach((hv, idx) => {
        const sizeVal = String(hv.size || hv.name || "").trim();
        if (!sizeVal) return;
        const hvOffer = (
          Array.isArray(hv.offers) ? hv.offers[0] : hv.offers
        ) as Record<string, unknown> | undefined;
        const availStr = String(hvOffer?.availability || "");
        const inStock =
          /InStock/i.test(availStr) && !/OutOfStock|SoldOut/i.test(availStr);
        const varPrice = parseNumericPrice(hvOffer?.price) ?? numericBasePrice;
        const { isGolden } = detectGoldenSizeStatus(sizeVal);

        variants.push({
          somId: `#${idx + 1}`,
          sizeLabel: sizeVal,
          attributeValue: sizeVal,
          skuCode: String(hv.sku || hvOffer?.sku || productSku),
          exactPrice:
            varPrice !== null ? formatIdrPrice(varPrice) : basePriceDisplay,
          numericPrice: varPrice,
          inStock,
          stockStatus: inStock ? "TERSEDIA" : "HABIS",
          stockDetail: inStock ? "InStock (Schema.org)" : "OutOfStock",
          stockQuantity: null,
          isGoldenSize: isGolden,
          domSelector: `schema-variant[sku="${hv.sku || idx + 1}"]`,
        });
      });
    } else if (rawOffers.length > 1) {
      rawOffers.forEach((off, idx) => {
        const sizeVal = String(
          off.name || off.sku || `Opsi ${idx + 1}`
        ).trim();
        const availStr = String(off.availability || "");
        const inStock =
          /InStock/i.test(availStr) && !/OutOfStock|SoldOut/i.test(availStr);
        const varPrice = parseNumericPrice(off.price) ?? numericBasePrice;
        const { isGolden } = detectGoldenSizeStatus(sizeVal);

        variants.push({
          somId: `#${idx + 1}`,
          sizeLabel: sizeVal,
          attributeValue: sizeVal,
          skuCode: String(off.sku || productSku),
          exactPrice:
            varPrice !== null ? formatIdrPrice(varPrice) : basePriceDisplay,
          numericPrice: varPrice,
          inStock,
          stockStatus: inStock ? "TERSEDIA" : "HABIS",
          stockDetail: inStock ? "InStock (Schema.org)" : "OutOfStock",
          stockQuantity: null,
          isGoldenSize: isGolden,
          domSelector: `schema-offer[index="${idx + 1}"]`,
        });
      });
    }
  }

  // Strategy D: Generic HTML <select> options
  if (variants.length === 0) {
    const selectMatch = html.match(
      /<select[^>]*name=["'](?:attribute_|options\[)[^"']+["'][^>]*>([\s\S]*?)<\/select>/i
    );
    if (selectMatch?.[1]) {
      const optionMatches = [
        ...selectMatch[1].matchAll(/<option([^>]*)>([\s\S]*?)<\/option>/gi),
      ];
      let counter = 0;
      for (const opt of optionMatches) {
        const attrs = opt[1] || "";
        const label = stripHtmlTags(opt[2] || "");
        const valMatch = attrs.match(/value=["']([^"']*)["']/i);
        const val = valMatch ? decodeHtmlEntities(valMatch[1]).trim() : "";
        if (!val || /choose an option|pilih opsi/i.test(label)) continue;

        counter += 1;
        const isDisabledOpt = /\bdisabled\b/i.test(attrs);
        const matchedVar =
          variationByAttrValue.get(val.toLowerCase()) ||
          variationByAttrValue.get(label.toLowerCase());

        let inStock = !isDisabledOpt;
        let numericVarPrice = numericBasePrice;
        let exactPrice = basePriceDisplay;
        let skuCode = productSku;
        let stockDetail = inStock ? "Tersedia" : "Habis / Disabled";
        let stockQuantity: number | null = null;

        if (wcVariations.length > 0) {
          if (matchedVar) {
            inStock = Boolean(
              matchedVar.is_in_stock !== false &&
                matchedVar.is_purchasable !== false &&
                !isDisabledOpt
            );
            const parsedVarPrice = parseNumericPrice(
              matchedVar.display_price ?? matchedVar.display_regular_price
            );
            if (parsedVarPrice !== null) {
              numericVarPrice = parsedVarPrice;
              exactPrice = formatIdrPrice(parsedVarPrice);
            }
            if (matchedVar.sku) skuCode = String(matchedVar.sku).trim();
            const availClean = stripHtmlTags(
              matchedVar.availability_html || ""
            );
            stockQuantity = parseStockQuantityFromText(
              availClean,
              matchedVar.max_qty
            );
            stockDetail = availClean || (inStock ? "Tersedia" : "Habis");
          } else {
            inStock = false;
            stockDetail = "Habis / Tidak Tersedia";
          }
        }

        const { isGolden } = detectGoldenSizeStatus(label);

        variants.push({
          somId: `#${counter}`,
          sizeLabel: label,
          attributeValue: val,
          skuCode,
          exactPrice,
          numericPrice: numericVarPrice,
          inStock,
          stockStatus: inStock ? "TERSEDIA" : "HABIS",
          stockDetail,
          stockQuantity: inStock ? stockQuantity : 0,
          isGoldenSize: isGolden,
          domSelector: `select option[value="${val}"]`,
        });
      }
    }
  }

  const availableSizeLabels = variants
    .filter((v) => v.inStock)
    .map((v) => v.sizeLabel);
  const missingSizeLabels = variants
    .filter((v) => !v.inStock)
    .map((v) => v.sizeLabel);

  if (variants.length > 0) {
    pushLog(
      "VARIAN",
      `Diekstrak ${variants.length} varian ukuran asli (${variants
        .map((v) => v.sizeLabel)
        .join(", ")}).`
    );
    pushLog(
      "VARIAN",
      availableSizeLabels.length > 0
        ? `Status ketersediaan nyata: ${availableSizeLabels.length} dari ${
            variants.length
          } ukuran TERSEDIA (${availableSizeLabels.join(", ")}), sedangkan ${
            missingSizeLabels.length
          } ukuran HABIS.`
        : `Status ketersediaan nyata: 0 dari ${variants.length} ukuran tersedia (semua HABIS).`
    );
  } else {
    pushLog(
      "VARIAN",
      "Tidak ditemukan elemen variasi ukuran pada DOM halaman ini."
    );
  }

  // 9. Extract CTA Button
  const ctaMatch =
    html.match(
      /<button[^>]*class=["'][^"']*single_add_to_cart_button[^"']*["'][^>]*>([\s\S]*?)<\/button>/i
    ) ||
    html.match(
      /<button[^>]*name=["']add(?:-to-cart)?["'][^>]*>([\s\S]*?)<\/button>/i
    ) ||
    html.match(
      /<button[^>]*type=["']submit["'][^>]*class=["'][^"']*(?:add-to-cart|buy-now|btn-cart|product-form__submit)[^"']*["'][^>]*>([\s\S]*?)<\/button>/i
    );

  const rawCtaText = ctaMatch ? stripHtmlTags(ctaMatch[1]) : "";
  const ctaLabel = rawCtaText ? rawCtaText.toUpperCase() : "TIDAK TERDETEKSI";
  const ctaAvailable =
    ctaLabel !== "TIDAK TERDETEKSI" &&
    !/sold\s*out|habis|unavailable/i.test(ctaLabel) &&
    (variants.length > 0 ? availableSizeLabels.length > 0 : true);

  pushLog(
    "CTA",
    ctaLabel !== "TIDAK TERDETEKSI"
      ? `Tombol aksi utama terdeteksi: "${ctaLabel}" (${
          ctaAvailable
            ? "AKTIF untuk ukuran tersedia"
            : "NONAKTIF karena stok habis"
        }).`
      : "Tombol aksi keranjang tidak terdeteksi pada halaman."
  );

  // 10. Compute Golden Size & Ad-Spend Protection Verdict
  const adProtection = computeAdSpendProtection(variants, ctaAvailable);

  pushLog(
    "IKLAN",
    `Verdict Iklan [${adProtection.verdictBadge}]: Rasio Golden Size ${adProtection.goldenSizeRatioPct}% (${adProtection.goldenSizesAvailable}/${adProtection.goldenSizesTotal}). ${adProtection.verdictReason}`
  );

  // 11. Build and validate Voice Over Brief from 100% real scraped data
  const candidateVo = buildRealAudioBriefText({
    productTitle,
    basePriceDisplay,
    availableSizes: availableSizeLabels,
    totalVariants: variants.length,
    goldenSizeRatioPct: adProtection.goldenSizeRatioPct,
    verdictCode: adProtection.verdictCode,
  });

  const voiceOver = enforceVoiceOverHardGuard(candidateVo, {
    productTitle,
    basePriceDisplay,
    availableSizes: availableSizeLabels,
    totalVariants: variants.length,
    goldenSizeRatioPct: adProtection.goldenSizeRatioPct,
    verdictCode: adProtection.verdictCode,
  });

  pushLog(
    "AUDIO",
    `Ringkasan suara dibuat (${voiceOver.metricDisplay}): "${voiceOver.script}"`
  );

  return {
    url: parsedUrl.toString(),
    domain,
    platformDetected,
    productTitle,
    brand,
    productSku,
    categoryName,
    basePriceDisplay,
    numericBasePrice,
    imageUrl,
    imageAlt,
    ctaLabel,
    ctaSelector: "button.single_add_to_cart_button",
    ctaAvailable,
    totalVariants: variants.length,
    availableVariantsCount: availableSizeLabels.length,
    availableSizeLabels,
    missingSizeLabels,
    variants,
    adProtection,
    auditLogs,
    voiceOver,
  };
}

/**
 * Parses 807Garage v1 product detail JSON into our standard InterceptProductTarget structure.
 */
export function parse807GarageDetailJson(
  detailData: Record<string, unknown>,
  sourceUrl: string
): InterceptProductTarget {
  const ts = getTimeStamp();
  const auditLogs: AuditLogEntry[] = [];
  const pushLog = (
    category: AuditLogEntry["category"],
    message: string
  ): void => {
    auditLogs.push({
      id: `audit-${auditLogs.length + 1}`,
      stepIndex: auditLogs.length + 1,
      timestamp: ts,
      category,
      message,
    });
  };

  const rawTitle = String(detailData.name || detailData.meta_title || "").trim();
  const productTitle = rawTitle ? rawTitle.toUpperCase() : "TIDAK TERDETEKSI";
  const productSku = String(detailData.sku || detailData.id || "TIDAK TERDETEKSI").toUpperCase();

  const brandsArr = Array.isArray(detailData.brands)
    ? (detailData.brands as Array<Record<string, unknown>>)
    : [];
  const brand = brandsArr[0]?.name
    ? String(brandsArr[0].name).toUpperCase()
    : "807GARAGE";

  const numericBasePrice = parseNumericPrice(
    detailData.price ?? detailData.min_price
  );
  const basePriceDisplay =
    numericBasePrice !== null
      ? formatIdrPrice(numericBasePrice)
      : "TIDAK TERDETEKSI";

  const imagesArr = Array.isArray(detailData.images)
    ? (detailData.images as string[])
    : [];
  const imageUrl = imagesArr[0] ? String(imagesArr[0]) : "";

  const listVars = Array.isArray(detailData.list_variant)
    ? (detailData.list_variant as Array<Record<string, unknown>>)
    : [];

  const variants: VariantAuditRow[] = listVars.map((lv, idx) => {
    const sizeLabel = String(lv.size || lv.name || `Opsi ${idx + 1}`).trim();
    const varPrice = parseNumericPrice(lv.price) ?? numericBasePrice;
    const totalStock =
      typeof detailData.stock === "number" ? detailData.stock : 1;
    const inStock =
      lv.status === "published" && totalStock > 0;
    const { isGolden } = detectGoldenSizeStatus(sizeLabel);

    return {
      somId: `#${idx + 1}`,
      sizeLabel,
      attributeValue: sizeLabel,
      skuCode: String(lv.id || productSku),
      exactPrice:
        varPrice !== null ? formatIdrPrice(varPrice) : basePriceDisplay,
      numericPrice: varPrice,
      inStock,
      stockStatus: inStock ? "TERSEDIA" : "HABIS",
      stockDetail: inStock ? "Tersedia (807Garage API)" : "Habis",
      stockQuantity: null,
      isGoldenSize: isGolden,
      domSelector: `div.variant-size[data-size="${sizeLabel}"]`,
    };
  });

  const availableSizeLabels = variants
    .filter((v) => v.inStock)
    .map((v) => v.sizeLabel);
  const missingSizeLabels = variants
    .filter((v) => !v.inStock)
    .map((v) => v.sizeLabel);
  const ctaAvailable = availableSizeLabels.length > 0;
  const adProtection = computeAdSpendProtection(variants, ctaAvailable);

  pushLog("DOM", `[807GARAGE_API] Produk ditemukan: "${productTitle}".`);
  pushLog("HARGA", `Harga produk 807Garage: ${basePriceDisplay}.`);
  pushLog(
    "VARIAN",
    `Ukuran tersedia: ${
      availableSizeLabels.length > 0
        ? availableSizeLabels.join(", ")
        : "Habis"
    }.`
  );

  const candidateVo = buildRealAudioBriefText({
    productTitle,
    basePriceDisplay,
    availableSizes: availableSizeLabels,
    totalVariants: variants.length,
    goldenSizeRatioPct: adProtection.goldenSizeRatioPct,
    verdictCode: adProtection.verdictCode,
  });

  const voiceOver = enforceVoiceOverHardGuard(candidateVo, {
    productTitle,
    basePriceDisplay,
    availableSizes: availableSizeLabels,
    totalVariants: variants.length,
    goldenSizeRatioPct: adProtection.goldenSizeRatioPct,
    verdictCode: adProtection.verdictCode,
  });

  return {
    url: sourceUrl,
    domain: "807GARAGE.COM",
    platformDetected: "807GARAGE_API",
    productTitle,
    brand,
    productSku,
    categoryName: "Sneakers / 807Garage",
    basePriceDisplay,
    numericBasePrice,
    imageUrl,
    imageAlt: rawTitle,
    ctaLabel: "BELI SEKARANG",
    ctaSelector: "button.btn-buy-807",
    ctaAvailable,
    totalVariants: variants.length,
    availableVariantsCount: availableSizeLabels.length,
    availableSizeLabels,
    missingSizeLabels,
    variants,
    adProtection,
    auditLogs,
    voiceOver,
  };
}

export function extractProductUrlsFromListingHtml(
  html: string,
  baseUrl: string
): string[] {
  let parsedBase: URL;
  try {
    parsedBase = new URL(baseUrl);
  } catch {
    parsedBase = new URL(DEFAULT_CATEGORY_URL);
  }

  const found = new Set<string>();

  const normalizeCandidate = (rawHref: string): string | null => {
    try {
      const decoded = decodeHtmlEntities(rawHref).trim();
      if (
        !decoded ||
        decoded.startsWith("#") ||
        decoded.startsWith("javascript:")
      ) {
        return null;
      }
      const resolved = new URL(decoded, parsedBase.origin);
      if (resolved.hostname !== parsedBase.hostname) return null;
      resolved.hash = "";
      if (resolved.searchParams.has("add-to-cart")) return null;
      resolved.search = "";

      const path = resolved.pathname.toLowerCase();
      const isProductPath =
        /^\/product\/[^/]+\/?$/i.test(path) ||
        /^\/(?:collections\/[^/]+\/)?products\/[^/]+\/?$/i.test(path) ||
        /^\/(?:id|en)\/product(?:s)?\/[^/]+\/?$/i.test(path);

      if (!isProductPath) return null;
      if (
        /\/(product-category|product-tag|cart|checkout|my-account|page)\//i.test(
          path
        )
      ) {
        return null;
      }
      return resolved.toString();
    } catch {
      return null;
    }
  };

  const locMatches = [
    ...html.matchAll(/<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/gi),
  ];
  for (const m of locMatches) {
    const normalized = normalizeCandidate(m[1]);
    if (normalized) found.add(normalized);
  }

  const hrefMatches = [...html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)];
  for (const m of hrefMatches) {
    const normalized = normalizeCandidate(m[1]);
    if (normalized) found.add(normalized);
  }

  return Array.from(found);
}

/**
 * Parses CSV or TSV text from Shopee Ads, TikTok Ads, or Google PMax reports.
 */
export function parseAdReportCsvOrText(rawText: string): AdCampaignRowInput[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes("\t")
    ? "\t"
    : lines[0].includes(";") && !lines[0].includes(",")
    ? ";"
    : ",";

  const splitRow = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = splitRow(lines[0]).map((h) => h.toLowerCase());
  const findCol = (patterns: RegExp[]): number =>
    headers.findIndex((h) => patterns.some((p) => p.test(h)));

  const nameIdx = findCol([
    /nama\s*produk/,
    /product\s*name/,
    /nama\s*iklan/,
    /item\s*name/,
    /judul/,
    /^produk$/,
  ]);
  const channelIdx = findCol([/channel/, /platform/, /sumber/, /campaign/]);
  const spendIdx = findCol([
    /biaya/,
    /ad\s*spend/,
    /^spend$/,
    /^cost$/,
    /pengeluaran/,
  ]);
  const gmvIdx = findCol([
    /omzet/,
    /gmv/,
    /penjualan/,
    /conversion\s*value/,
    /revenue/,
  ]);
  const roasIdx = findCol([/roas/, /efektivitas/, /roi/]);
  const clicksIdx = findCol([/klik/, /click/]);
  const convIdx = findCol([/konversi/, /conversion/, /order/, /terjual/]);
  const urlIdx = findCol([/url/, /link/, /tautan/]);

  const rows: AdCampaignRowInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitRow(lines[i]);
    const productName = (cols[nameIdx >= 0 ? nameIdx : 0] || "").trim();
    if (!productName) continue;

    const channel =
      (channelIdx >= 0 ? cols[channelIdx] : "") || "Shopee / PMax Ads";
    const adSpend = parseNumericPrice(spendIdx >= 0 ? cols[spendIdx] : 0) ?? 0;
    const gmv = parseNumericPrice(gmvIdx >= 0 ? cols[gmvIdx] : 0) ?? 0;

    let roas = 0;
    if (roasIdx >= 0 && cols[roasIdx]) {
      const parsedRoas = parseFloat(
        cols[roasIdx].replace(/[^0-9.,]/g, "").replace(",", ".")
      );
      if (Number.isFinite(parsedRoas)) roas = parsedRoas;
    }
    if (!roas && adSpend > 0) {
      roas = Number((gmv / adSpend).toFixed(2));
    }

    const clicks =
      parseInt((clicksIdx >= 0 ? cols[clicksIdx] : "0").replace(/\D/g, ""), 10) ||
      0;
    const conversions =
      parseInt((convIdx >= 0 ? cols[convIdx] : "0").replace(/\D/g, ""), 10) || 0;
    const productUrl =
      urlIdx >= 0 && cols[urlIdx]?.startsWith("http")
        ? cols[urlIdx].trim()
        : undefined;

    rows.push({
      id: `ad-row-${i}-${productName.slice(0, 12).replace(/\s+/g, "-")}`,
      productName,
      channel,
      adSpend,
      gmv,
      roas,
      clicks,
      conversions,
      productUrl,
    });
  }

  return rows;
}

/**
 * Parses an optional Shopee/Warehouse Stock Variant CSV or JSON file (Dropzone 2)
 * Map keys are lowercase product names -> array of { sizeLabel, stockQty, price }.
 */
export function parseUploadedStockVariants(
  rawText: string
): Map<string, Array<{ sizeLabel: string; stockQty: number; price?: number }>> {
  const map = new Map<
    string,
    Array<{ sizeLabel: string; stockQty: number; price?: number }>
  >();
  const trimmed = rawText.trim();
  if (!trimmed) return map;

  try {
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      const parsed = JSON.parse(trimmed);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of arr) {
        const pName = String(
          item.productName || item.nama_produk || item.name || ""
        )
          .trim()
          .toLowerCase();
        const sizeLabel = String(
          item.size || item.ukuran || item.variasi || ""
        ).trim();
        const stockQty = Number(item.stock ?? item.stok ?? 0);
        if (!pName || !sizeLabel) continue;
        const list = map.get(pName) || [];
        list.push({
          sizeLabel,
          stockQty: Number.isFinite(stockQty) ? stockQty : 0,
          price: parseNumericPrice(item.price ?? item.harga) ?? undefined,
        });
        map.set(pName, list);
      }
      return map;
    }
  } catch {
    // Fallback to CSV parsing below
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return map;

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = headers.findIndex((h) => /produk|name|item/i.test(h));
  const sizeIdx = headers.findIndex((h) => /ukuran|size|variasi/i.test(h));
  const stockIdx = headers.findIndex((h) => /stok|stock|qty|jumlah/i.test(h));
  const priceIdx = headers.findIndex((h) => /harga|price/i.test(h));

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const pName = (cols[nameIdx >= 0 ? nameIdx : 0] || "").toLowerCase();
    const sizeLabel = cols[sizeIdx >= 0 ? sizeIdx : 1] || "";
    const stockQty =
      parseInt((cols[stockIdx >= 0 ? stockIdx : 2] || "0").replace(/\D/g, ""), 10) ||
      0;
    const price =
      priceIdx >= 0 ? parseNumericPrice(cols[priceIdx]) ?? undefined : undefined;

    if (!pName || !sizeLabel) continue;
    const list = map.get(pName) || [];
    list.push({ sizeLabel, stockQty, price });
    map.set(pName, list);
  }

  return map;
}

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? "")
    .replace(/\r?\n/g, " ")
    .trim();
  if (/[",]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildActionableAdFeedCsv(
  items: InterceptProductTarget[]
): string {
  const headers = [
    "url",
    "domain",
    "platform",
    "product_name",
    "brand",
    "sku",
    "price",
    "total_sizes",
    "available_sizes_count",
    "available_sizes_list",
    "missing_sizes_list",
    "golden_sizes_total",
    "golden_sizes_available",
    "golden_size_ratio_pct",
    "total_inventory_units",
    "cta_status",
    "ad_action_verdict",
    "custom_label_0",
    "verdict_reason",
  ];

  const rows = items.map((item) => [
    item.url,
    item.domain,
    item.platformDetected,
    item.productTitle,
    item.brand,
    item.productSku,
    item.basePriceDisplay,
    item.totalVariants,
    item.availableVariantsCount,
    item.availableSizeLabels.join(" | ") || "NONE",
    item.missingSizeLabels.join(" | ") || "NONE",
    item.adProtection.goldenSizesTotal,
    item.adProtection.goldenSizesAvailable,
    `${item.adProtection.goldenSizeRatioPct}%`,
    item.adProtection.totalInventoryUnits ?? "N/A",
    item.ctaAvailable ? "ACTIVE" : "DISABLED",
    item.adProtection.verdictCode,
    item.adProtection.customLabel0,
    item.adProtection.verdictReason,
  ]);

  return [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((r) => r.map(escapeCsvCell).join(",")),
  ].join("\n");
}

export function buildRestockDeadSizeCsv(
  items: InterceptProductTarget[]
): string {
  const headers = [
    "product_url",
    "product_name",
    "brand",
    "size_label",
    "is_golden_size",
    "variant_sku",
    "exact_price",
    "stock_status",
    "stock_detail",
    "warehouse_action",
  ];

  const rows: Array<unknown[]> = [];

  for (const item of items) {
    for (const v of item.variants) {
      const isCriticalSingleUnit = v.inStock && v.stockQuantity === 1;
      if (!v.inStock || isCriticalSingleUnit) {
        const warehouseAction = !v.inStock
          ? v.isGoldenSize
            ? "PRIORITY_RESTOCK_GOLDEN_SIZE"
            : "RESTOCK_DEAD_SIZE"
          : "LAST_PAIR_ALERT_1_UNIT";

        rows.push([
          item.url,
          item.productTitle,
          item.brand,
          v.sizeLabel,
          v.isGoldenSize ? "YES (GOLDEN_SIZE)" : "NO",
          v.skuCode,
          v.exactPrice,
          v.stockStatus,
          v.stockDetail,
          warehouseAction,
        ]);
      }
    }
  }

  return [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((r) => r.map(escapeCsvCell).join(",")),
  ].join("\n");
}

/**
 * Builds the Executive Boss & Multi-Channel Action Plan CSV from Tab 2 Triage Rows.
 */
export function buildExecutiveBossTriageCsv(
  rows: TriageAuditedRow[]
): string {
  const headers = [
    "Nama Produk",
    "Channel Iklan",
    "Biaya Iklan",
    "Omzet",
    "ROAS",
    "Harga Senikersku",
    "Ukuran Ready Senikersku",
    "Rasio Golden Size (%)",
    "Harga Kompetitor Terendah (807Garage/KickAve/Atmos/dll)",
    "Ukuran Ready Kompetitor",
    "Kuadran Status",
    "Alasan Laporan ke Bos",
    "Rekomendasi Tindakan (Shopee/TikTok/Google Search-PMax)",
    "URL Bukti Senikersku",
    "URL Bukti Kompetitor",
  ];

  const csvRows = rows.map((r) => {
    const t = r.scrapedTarget;
    const q = r.quadrant;
    return [
      r.productName,
      r.channel,
      formatIdrPrice(r.adSpend),
      formatIdrPrice(r.gmv),
      `${r.roas.toFixed(2)}x`,
      t ? t.basePriceDisplay : "TIDAK TERDETEKSI",
      t && t.availableSizeLabels.length > 0
        ? t.availableSizeLabels.join(" | ")
        : "HABIS",
      t ? `${t.adProtection.goldenSizeRatioPct}%` : "0%",
      q
        ? `${q.lowestCompetitorName}: ${q.lowestCompetitorPriceDisplay}`
        : "Tidak Ditemukan",
      q && q.lowestCompetitorRunningSizes.length > 0
        ? q.lowestCompetitorRunningSizes.join(" | ")
        : "Tidak Ditemukan / Kosong",
      q ? q.badgeLabel : "BELUM DIAUDIT",
      q ? q.bossReason : "",
      q ? q.channelActionPlan : "",
      t ? t.url : r.productUrl || "",
      q ? q.lowestCompetitorUrl : "",
    ];
  });

  return [
    headers.map(escapeCsvCell).join(","),
    ...csvRows.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\n");
}
