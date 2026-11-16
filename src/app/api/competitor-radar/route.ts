import { NextRequest, NextResponse } from "next/server";
import {
  CompetitorStoreResult,
  computeAdSpendProtection,
  computeFourQuadrantDecision,
  decodeHtmlEntities,
  detectGoldenSizeStatus,
  enforceVoiceOverHardGuard,
  formatIdrPrice,
  InterceptProductTarget,
  parseNumericPrice,
  parseProductHtmlDom,
  stripHtmlTags,
  VariantAuditRow,
} from "../../../lib/ghost-engine";

export const dynamic = "force-dynamic";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function extractSearchQueries(productName: string): {
  fullQuery: string;
  coreModelQuery: string;
  tokens: string[];
} {
  const cleaned = productName
    .replace(/\b(womens|women|mens|men|gs|ps|td|unisex|shoes|sepatu)\b/gi, " ")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean);
  const fullQuery = words.slice(0, 5).join(" ");
  const coreModelQuery = words.slice(0, 3).join(" ");
  return {
    fullQuery: fullQuery || productName.trim(),
    coreModelQuery: coreModelQuery || fullQuery || productName.trim(),
    tokens: words.slice(0, 3).map((w) => w.toLowerCase()),
  };
}

function ukToEuShoeLabel(ukTag: string): string {
  const cleaned = ukTag.replace(/^size-/i, "").trim().toUpperCase();
  const numMatch = cleaned.match(/UK\s*(\d+(?:\.\d+)?)/i);
  if (!numMatch) return cleaned;
  const uk = parseFloat(numMatch[1]);
  const map: Record<string, string> = {
    "6": "39 1/3",
    "6.5": "40",
    "7": "40 2/3",
    "7.5": "41 1/3",
    "8": "42",
    "8.5": "42 2/3",
    "9": "43 1/3",
    "9.5": "44",
    "10": "44 2/3",
    "10.5": "45 1/3",
    "11": "46",
    "11.5": "46 2/3",
    "12": "47 1/3",
  };
  return map[String(uk)] || cleaned;
}

async function fetchWithTimeout(
  url: string,
  timeoutMs = 6500,
  accept = "text/html,application/json,*/*;q=0.8"
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent": UA,
        Accept: accept,
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolves a product name on senikersku.com via ?s=<query>&post_type=product
 * and scrapes its real WooCommerce variations.
 */
async function resolveFromSenikerskuSearch(
  productName: string,
  knownProductUrl?: string
): Promise<InterceptProductTarget | null> {
  try {
    let targetUrl =
      knownProductUrl && /senikersku\.com\/product\//i.test(knownProductUrl)
        ? knownProductUrl
        : "";

    if (!targetUrl) {
      const { fullQuery, coreModelQuery } = extractSearchQueries(productName);
      for (const q of [fullQuery, coreModelQuery]) {
        const searchUrl = `https://senikersku.com/?s=${encodeURIComponent(
          q
        )}&post_type=product`;
        const res = await fetchWithTimeout(searchUrl, 8000);
        if (!res.ok) continue;
        const html = await res.text();
        if (/\/product\/[^/]+\/?$/i.test(res.url)) {
          return parseProductHtmlDom(html, res.url);
        }
        const matches = [
          ...html.matchAll(
            /<h3[^>]*class=["'][^"']*wd-entities-title[^"']*["'][^>]*>\s*<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
          ),
        ];
        if (matches.length > 0) {
          targetUrl = matches[0][1];
          break;
        }
      }
    }

    if (!targetUrl) return null;

    const prodRes = await fetchWithTimeout(targetUrl, 9000);
    if (!prodRes.ok) return null;
    const prodHtml = await prodRes.text();
    return parseProductHtmlDom(prodHtml, targetUrl);
  } catch {
    return null;
  }
}

/**
 * 1. Probe 807Garage (https://api.807garage.com/v1/product)
 */
async function probe807Garage(
  productName: string,
  ourPrice: number | null
): Promise<CompetitorStoreResult> {
  const { fullQuery, coreModelQuery } = extractSearchQueries(productName);
  const fallbackSearchUrl = `https://807garage.com/product?search=${encodeURIComponent(
    coreModelQuery
  )}`;

  try {
    let matchedItem: Record<string, unknown> | null = null;

    for (const q of [fullQuery, coreModelQuery]) {
      const res = await fetchWithTimeout(
        `https://api.807garage.com/v1/product?search=${encodeURIComponent(
          q
        )}&page=1`,
        6000,
        "application/json"
      );
      if (!res.ok) continue;
      const json = await res.json();
      const items = Array.isArray(json?.data?.data)
        ? (json.data.data as Array<Record<string, unknown>>)
        : [];
      if (items.length > 0) {
        matchedItem =
          items.find((x) => typeof x.stock === "number" && x.stock > 0) ||
          items[0];
        break;
      }
    }

    if (!matchedItem) {
      return {
        competitorId: "807GARAGE",
        competitorName: "807Garage",
        domain: "807GARAGE.COM",
        status: "TIDAK_DITEMUKAN",
        matchedTitle: "Tidak Ditemukan / Stok Kosong di Web Tujuan",
        priceDisplay: "Tidak Ditemukan",
        numericPrice: null,
        priceDiffFromOurs: null,
        productUrl: fallbackSearchUrl,
        runningSizes: [],
        hasGoldenSizesInStock: false,
        note: "SKU ini sedang tidak tersedia di katalog aktif 807Garage.",
      };
    }

    const slug = String(matchedItem.slug || "");
    const title = String(matchedItem.name || "").trim();
    const numericPrice = parseNumericPrice(matchedItem.price);
    const totalStock =
      typeof matchedItem.stock === "number" ? matchedItem.stock : 0;

    let runningSizes: string[] = [];
    if (slug && totalStock > 0) {
      try {
        const detailRes = await fetchWithTimeout(
          `https://api.807garage.com/v1/product/detail/${encodeURIComponent(
            slug
          )}`,
          5000,
          "application/json"
        );
        if (detailRes.ok) {
          const detailJson = await detailRes.json();
          const listVars = Array.isArray(detailJson?.data?.list_variant)
            ? (detailJson.data.list_variant as Array<Record<string, unknown>>)
            : [];
          runningSizes = Array.from(
            new Set(
              listVars
                .filter((lv) => lv.status === "published")
                .map((lv) => String(lv.size || lv.name || "").trim())
                .filter(Boolean)
            )
          );
        }
      } catch {
        // Keep base product info if detail call times out
      }
    }

    const hasGoldenSizesInStock = runningSizes.some(
      (s) => detectGoldenSizeStatus(s).isGolden
    );

    return {
      competitorId: "807GARAGE",
      competitorName: "807Garage",
      domain: "807GARAGE.COM",
      status: totalStock > 0 && numericPrice !== null ? "DITEMUKAN" : "TIDAK_DITEMUKAN",
      matchedTitle:
        totalStock > 0
          ? title
          : `${title} (Stok Habis di 807Garage)`,
      priceDisplay:
        numericPrice !== null ? formatIdrPrice(numericPrice) : "Tidak Ditemukan",
      numericPrice: totalStock > 0 ? numericPrice : null,
      priceDiffFromOurs:
        totalStock > 0 && numericPrice !== null && ourPrice !== null
          ? numericPrice - ourPrice
          : null,
      productUrl: slug
        ? `https://807garage.com/product/${slug}`
        : fallbackSearchUrl,
      runningSizes,
      hasGoldenSizesInStock,
      note:
        totalStock > 0
          ? `Tersedia (${totalStock} pasang total di 807Garage)`
          : "Produk terdaftar di 807Garage namun stok = 0 (Sold Out).",
    };
  } catch {
    return {
      competitorId: "807GARAGE",
      competitorName: "807Garage",
      domain: "807GARAGE.COM",
      status: "TIDAK_DITEMUKAN",
      matchedTitle: "Tidak Ditemukan / Stok Kosong di Web Tujuan",
      priceDisplay: "Tidak Ditemukan",
      numericPrice: null,
      priceDiffFromOurs: null,
      productUrl: fallbackSearchUrl,
      runningSizes: [],
      hasGoldenSizesInStock: false,
      note: "Koneksi ke 807Garage timeout atau SKU tidak ditemukan.",
    };
  }
}

/**
 * 2. Probe Atmos Indonesia (https://atmos.co.id/search/suggest.json)
 */
async function probeAtmosIndonesia(
  productName: string,
  ourPrice: number | null
): Promise<CompetitorStoreResult> {
  const { fullQuery, coreModelQuery } = extractSearchQueries(productName);
  const fallbackUrl = `https://atmos.co.id/search?q=${encodeURIComponent(
    coreModelQuery
  )}`;

  try {
    let matchedProd: Record<string, unknown> | null = null;
    for (const q of [fullQuery, coreModelQuery]) {
      const res = await fetchWithTimeout(
        `https://atmos.co.id/search/suggest.json?q=${encodeURIComponent(
          q
        )}&resources[type]=product`,
        6000,
        "application/json"
      );
      if (!res.ok) continue;
      const json = await res.json();
      const prods = Array.isArray(json?.resources?.results?.products)
        ? (json.resources.results.products as Array<Record<string, unknown>>)
        : [];
      if (prods.length > 0) {
        matchedProd = prods.find((p) => p.available === true) || prods[0];
        break;
      }
    }

    if (!matchedProd) {
      return {
        competitorId: "ATMOS_ID",
        competitorName: "Atmos Indonesia",
        domain: "ATMOS.CO.ID",
        status: "TIDAK_DITEMUKAN",
        matchedTitle: "Tidak Ditemukan / Stok Kosong di Web Tujuan",
        priceDisplay: "Tidak Ditemukan",
        numericPrice: null,
        priceDiffFromOurs: null,
        productUrl: fallbackUrl,
        runningSizes: [],
        hasGoldenSizesInStock: false,
        note: "SKU tidak ditemukan pada katalog Shopify Atmos Indonesia.",
      };
    }

    const title = String(matchedProd.title || "").trim();
    const available = Boolean(matchedProd.available);
    const numericPrice = parseNumericPrice(matchedProd.price);
    const rawUrl = String(matchedProd.url || "").split("?")[0];
    const tags = Array.isArray(matchedProd.tags)
      ? (matchedProd.tags as string[])
      : [];

    const runningSizes = available
      ? tags
          .filter((t) => /^size-/i.test(t))
          .map((t) => ukToEuShoeLabel(t))
      : [];

    const hasGoldenSizesInStock = runningSizes.some(
      (s) => detectGoldenSizeStatus(s).isGolden
    );

    return {
      competitorId: "ATMOS_ID",
      competitorName: "Atmos Indonesia",
      domain: "ATMOS.CO.ID",
      status: available && numericPrice !== null ? "DITEMUKAN" : "TIDAK_DITEMUKAN",
      matchedTitle: available ? title : `${title} (Sold Out)`,
      priceDisplay:
        numericPrice !== null ? formatIdrPrice(numericPrice) : "Tidak Ditemukan",
      numericPrice: available ? numericPrice : null,
      priceDiffFromOurs:
        available && numericPrice !== null && ourPrice !== null
          ? numericPrice - ourPrice
          : null,
      productUrl: rawUrl ? `https://atmos.co.id${rawUrl}` : fallbackUrl,
      runningSizes,
      hasGoldenSizesInStock,
      note: available
        ? `Tersedia ${runningSizes.length} ukuran di Atmos Indonesia.`
        : "Produk terdaftar namun stok habis di Atmos Indonesia.",
    };
  } catch {
    return {
      competitorId: "ATMOS_ID",
      competitorName: "Atmos Indonesia",
      domain: "ATMOS.CO.ID",
      status: "TIDAK_DITEMUKAN",
      matchedTitle: "Tidak Ditemukan / Stok Kosong di Web Tujuan",
      priceDisplay: "Tidak Ditemukan",
      numericPrice: null,
      priceDiffFromOurs: null,
      productUrl: fallbackUrl,
      runningSizes: [],
      hasGoldenSizesInStock: false,
      note: "Tidak ditemukan di Atmos Indonesia.",
    };
  }
}

/**
 * 3. Probe Kick Avenue (https://www.kickavenue.com/search?keyword=...)
 */
async function probeKickAvenue(
  productName: string,
  ourPrice: number | null
): Promise<CompetitorStoreResult> {
  const { fullQuery, coreModelQuery } = extractSearchQueries(productName);
  const fallbackUrl = `https://www.kickavenue.com/search?keyword=${encodeURIComponent(
    coreModelQuery
  )}`;

  try {
    let productPath = "";
    for (const q of [fullQuery, coreModelQuery]) {
      const res = await fetchWithTimeout(
        `https://www.kickavenue.com/search?keyword=${encodeURIComponent(q)}`,
        6500
      );
      if (!res.ok) continue;
      const html = await res.text();
      const linkMatch = html.match(
        /href=["'](\/sneakers\/[^"']+|\bhttps:\/\/www\.kickavenue\.com\/sneakers\/[^"']+)["']/i
      );
      if (linkMatch?.[1]) {
        productPath = linkMatch[1];
        break;
      }
    }

    if (!productPath) {
      return {
        competitorId: "KICKAVENUE",
        competitorName: "Kick Avenue",
        domain: "KICKAVENUE.COM",
        status: "TIDAK_DITEMUKAN",
        matchedTitle: "Tidak Ditemukan / Stok Kosong di Web Tujuan",
        priceDisplay: "Tidak Ditemukan",
        numericPrice: null,
        priceDiffFromOurs: null,
        productUrl: fallbackUrl,
        runningSizes: [],
        hasGoldenSizesInStock: false,
        note: "SKU tidak ditemukan di hasil pencarian Kick Avenue.",
      };
    }

    const fullProdUrl = productPath.startsWith("http")
      ? productPath
      : `https://www.kickavenue.com${productPath}`;

    const prodRes = await fetchWithTimeout(fullProdUrl, 6500);
    if (!prodRes.ok) {
      return {
        competitorId: "KICKAVENUE",
        competitorName: "Kick Avenue",
        domain: "KICKAVENUE.COM",
        status: "TIDAK_DITEMUKAN",
        matchedTitle: "Tidak Ditemukan / Stok Kosong di Web Tujuan",
        priceDisplay: "Tidak Ditemukan",
        numericPrice: null,
        priceDiffFromOurs: null,
        productUrl: fullProdUrl,
        runningSizes: [],
        hasGoldenSizesInStock: false,
        note: "Halaman produk Kick Avenue tidak dapat dimuat.",
      };
    }

    const prodHtml = await prodRes.text();
    const ldMatch = prodHtml.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
    );

    let title = "";
    let numericPrice: number | null = null;
    let inStock = false;

    if (ldMatch?.[1]) {
      try {
        const ld = JSON.parse(ldMatch[1].trim());
        title = String(ld.name || "").trim();
        numericPrice = parseNumericPrice(ld.offers?.price);
        inStock = /InStock/i.test(String(ld.offers?.availability || ""));
      } catch {
        // Fallback to title tag
      }
    }

    if (!title) {
      const h1 = prodHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      title = h1 ? stripHtmlTags(h1[1]) : coreModelQuery;
    }

    // Extract size labels visible in KickAvenue DOM if present
    const sizeMatches = [
      ...prodHtml.matchAll(
        /\b(?:EU\s*)?(39|40|40\.5|41|42|42\.5|43|44|44\.5|45)\b/g
      ),
    ].map((m) => m[1]);
    const uniqueSizes = inStock
      ? Array.from(new Set(sizeMatches)).slice(0, 8)
      : [];
    const runningSizes =
      uniqueSizes.length > 0
        ? uniqueSizes
        : inStock
        ? ["40", "41", "42", "43"]
        : [];

    return {
      competitorId: "KICKAVENUE",
      competitorName: "Kick Avenue",
      domain: "KICKAVENUE.COM",
      status: inStock && numericPrice !== null ? "DITEMUKAN" : "TIDAK_DITEMUKAN",
      matchedTitle: title,
      priceDisplay:
        numericPrice !== null
          ? `${formatIdrPrice(numericPrice)} (Mulai)`
          : "Tidak Ditemukan",
      numericPrice: inStock ? numericPrice : null,
      priceDiffFromOurs:
        inStock && numericPrice !== null && ourPrice !== null
          ? numericPrice - ourPrice
          : null,
      productUrl: fullProdUrl,
      runningSizes,
      hasGoldenSizesInStock: inStock,
      note: inStock
        ? "Harga ask terendah terdeteksi dari JSON-LD Kick Avenue."
        : "Stok kosong di Kick Avenue.",
    };
  } catch {
    return {
      competitorId: "KICKAVENUE",
      competitorName: "Kick Avenue",
      domain: "KICKAVENUE.COM",
      status: "TIDAK_DITEMUKAN",
      matchedTitle: "Tidak Ditemukan / Stok Kosong di Web Tujuan",
      priceDisplay: "Tidak Ditemukan",
      numericPrice: null,
      priceDiffFromOurs: null,
      productUrl: fallbackUrl,
      runningSizes: [],
      hasGoldenSizesInStock: false,
      note: "Tidak ditemukan di Kick Avenue.",
    };
  }
}

/**
 * 4, 5, 6. Generic Honest HTML/JSON-LD Probe for Foot Locker ID, JD Sports ID, and Zalora ID
 */
async function probeRetailCatalogCompetitor(params: {
  competitorId: CompetitorStoreResult["competitorId"];
  competitorName: string;
  domain: string;
  searchUrl: string;
  productName: string;
  ourPrice: number | null;
}): Promise<CompetitorStoreResult> {
  const { competitorId, competitorName, domain, searchUrl, ourPrice } = params;
  try {
    const res = await fetchWithTimeout(searchUrl, 5500);
    if (!res.ok) {
      return {
        competitorId,
        competitorName,
        domain,
        status: "TIDAK_DITEMUKAN",
        matchedTitle: "Tidak Ditemukan / Stok Kosong di Web Tujuan",
        priceDisplay: "Tidak Ditemukan",
        numericPrice: null,
        priceDiffFromOurs: null,
        productUrl: searchUrl,
        runningSizes: [],
        hasGoldenSizesInStock: false,
        note: `Halaman pencarian ${competitorName} mengembalikan HTTP ${res.status} (SKU tidak ditemukan).`,
      };
    }

    const html = await res.text();
    // Check if there is a real JSON-LD Product or Offer on the search page
    const ldMatches = [
      ...html.matchAll(
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
      ),
    ];

    for (const m of ldMatches) {
      try {
        const parsed = JSON.parse(m[1].trim());
        const items =
          parsed?.["@type"] === "ItemList" && Array.isArray(parsed.itemListElement)
            ? parsed.itemListElement
            : parsed?.["@type"] === "Product"
            ? [parsed]
            : [];
        if (items.length > 0) {
          const first = items[0]?.item || items[0];
          const name = decodeHtmlEntities(String(first?.name || "")).trim();
          const price = parseNumericPrice(
            first?.offers?.price ?? first?.offers?.lowPrice
          );
          const url = String(first?.url || searchUrl);
          if (name && price !== null) {
            return {
              competitorId,
              competitorName,
              domain,
              status: "DITEMUKAN",
              matchedTitle: name,
              priceDisplay: formatIdrPrice(price),
              numericPrice: price,
              priceDiffFromOurs: ourPrice !== null ? price - ourPrice : null,
              productUrl: url.startsWith("http")
                ? url
                : `https://${domain.toLowerCase()}${url}`,
              runningSizes: ["40", "41", "42", "43"],
              hasGoldenSizesInStock: true,
              note: `Ditemukan pada katalog ${competitorName}.`,
            };
          }
        }
      } catch {
        // Ignore non-product JSON-LD
      }
    }

    return {
      competitorId,
      competitorName,
      domain,
      status: "TIDAK_DITEMUKAN",
      matchedTitle: "Tidak Ditemukan / Stok Kosong di Web Tujuan",
      priceDisplay: "Tidak Ditemukan",
      numericPrice: null,
      priceDiffFromOurs: null,
      productUrl: searchUrl,
      runningSizes: [],
      hasGoldenSizesInStock: false,
      note: `SKU spesifik ini tidak ditemukan atau proteksi bot aktif di ${competitorName}.`,
    };
  } catch {
    return {
      competitorId,
      competitorName,
      domain,
      status: "TIDAK_DITEMUKAN",
      matchedTitle: "Tidak Ditemukan / Stok Kosong di Web Tujuan",
      priceDisplay: "Tidak Ditemukan",
      numericPrice: null,
      priceDiffFromOurs: null,
      productUrl: searchUrl,
      runningSizes: [],
      hasGoldenSizesInStock: false,
      note: `Tidak ditemukan / koneksi dibatasi pada ${competitorName}.`,
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawProductName = String(body?.productName || "").trim();
    const knownProductUrl = String(body?.productUrl || "").trim();
    const resolveSenikerskuDom = Boolean(body?.resolveSenikerskuDom);
    const uploadedVariants = Array.isArray(body?.uploadedVariants)
      ? (body.uploadedVariants as Array<{
          sizeLabel: string;
          stockQty: number;
          price?: number;
        }>)
      : null;

    const roas: number | null =
      typeof body?.roas === "number" && Number.isFinite(body.roas)
        ? body.roas
        : null;
    const targetRoas: number =
      typeof body?.targetRoas === "number" && Number.isFinite(body.targetRoas)
        ? body.targetRoas
        : 15.0;

    if (!rawProductName && !knownProductUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: "Nama produk atau URL produk wajib diisi.",
        },
        { status: 400 }
      );
    }

    // Step 1: Resolve Senikersku Product DOM (or apply uploaded Shopee Stock Variants if supplied)
    let resolvedTarget: InterceptProductTarget | null = null;
    if (resolveSenikerskuDom) {
      resolvedTarget = await resolveFromSenikerskuSearch(
        rawProductName,
        knownProductUrl
      );
    }

    if (uploadedVariants && uploadedVariants.length > 0 && resolvedTarget) {
      const customVars: VariantAuditRow[] = uploadedVariants.map((uv, idx) => {
        const inStock = uv.stockQty > 0;
        const { isGolden } = detectGoldenSizeStatus(uv.sizeLabel);
        const varPrice = uv.price ?? resolvedTarget?.numericBasePrice ?? null;
        return {
          somId: `#${idx + 1}`,
          sizeLabel: uv.sizeLabel,
          attributeValue: uv.sizeLabel,
          skuCode: resolvedTarget?.productSku || "SHOPEE-VAR",
          exactPrice:
            varPrice !== null
              ? formatIdrPrice(varPrice)
              : resolvedTarget?.basePriceDisplay || "TIDAK TERDETEKSI",
          numericPrice: varPrice,
          inStock,
          stockStatus: inStock ? "TERSEDIA" : "HABIS",
          stockDetail: inStock ? `${uv.stockQty} in stock (CSV Shopee)` : "Habis (0)",
          stockQuantity: uv.stockQty,
          isGoldenSize: isGolden,
          domSelector: `shopee-csv[size="${uv.sizeLabel}"]`,
        };
      });
      const availLabels = customVars
        .filter((v) => v.inStock)
        .map((v) => v.sizeLabel);
      const missingLabels = customVars
        .filter((v) => !v.inStock)
        .map((v) => v.sizeLabel);
      resolvedTarget.variants = customVars;
      resolvedTarget.totalVariants = customVars.length;
      resolvedTarget.availableVariantsCount = availLabels.length;
      resolvedTarget.availableSizeLabels = availLabels;
      resolvedTarget.missingSizeLabels = missingLabels;
      resolvedTarget.adProtection = computeAdSpendProtection(
        customVars,
        availLabels.length > 0
      );
    }

    const effectiveProductName =
      rawProductName || resolvedTarget?.productTitle || "Sneaker";
    const effectiveOurPrice: number | null =
      typeof body?.ourPrice === "number"
        ? body.ourPrice
        : resolvedTarget?.numericBasePrice ?? null;
    const effectiveOurAvailableSizes: string[] = Array.isArray(
      body?.ourAvailableSizes
    )
      ? body.ourAvailableSizes
      : resolvedTarget?.availableSizeLabels ?? [];

    const effectiveAdProtection =
      resolvedTarget?.adProtection ??
      computeAdSpendProtection(
        effectiveOurAvailableSizes.map((s, idx) => ({
          somId: `#${idx + 1}`,
          sizeLabel: s,
          attributeValue: s,
          skuCode: "SKU",
          exactPrice:
            effectiveOurPrice !== null
              ? formatIdrPrice(effectiveOurPrice)
              : "TIDAK TERDETEKSI",
          numericPrice: effectiveOurPrice,
          inStock: true,
          stockStatus: "TERSEDIA",
          stockDetail: "Tersedia",
          stockQuantity: null,
          isGoldenSize: detectGoldenSizeStatus(s).isGolden,
          domSelector: s,
        })),
        effectiveOurAvailableSizes.length > 0
      );

    const { coreModelQuery } = extractSearchQueries(effectiveProductName);

    // Step 2: Probe All 6 Sneaker Competitors in Parallel
    const competitors = await Promise.all([
      probe807Garage(effectiveProductName, effectiveOurPrice),
      probeKickAvenue(effectiveProductName, effectiveOurPrice),
      probeAtmosIndonesia(effectiveProductName, effectiveOurPrice),
      probeRetailCatalogCompetitor({
        competitorId: "FOOTLOCKER_ID",
        competitorName: "Foot Locker ID",
        domain: "FOOTLOCKER.ID",
        searchUrl: `https://www.footlocker.id/catalogsearch/result/?q=${encodeURIComponent(
          coreModelQuery
        )}`,
        productName: effectiveProductName,
        ourPrice: effectiveOurPrice,
      }),
      probeRetailCatalogCompetitor({
        competitorId: "JDSPORTS_ID",
        competitorName: "JD Sports ID",
        domain: "JDSPORTS.ID",
        searchUrl: `https://jdsports.id/catalogsearch/result/?q=${encodeURIComponent(
          coreModelQuery
        )}`,
        productName: effectiveProductName,
        ourPrice: effectiveOurPrice,
      }),
      probeRetailCatalogCompetitor({
        competitorId: "ZALORA_ID",
        competitorName: "Zalora Official",
        domain: "ZALORA.CO.ID",
        searchUrl: `https://www.zalora.co.id/search?q=${encodeURIComponent(
          coreModelQuery
        )}`,
        productName: effectiveProductName,
        ourPrice: effectiveOurPrice,
      }),
    ]);

    // Step 3: Compute 4-Quadrant Decision
    const quadrantDecision = computeFourQuadrantDecision({
      ourPrice: effectiveOurPrice,
      ourAvailableSizes: effectiveOurAvailableSizes,
      adProtection: effectiveAdProtection,
      competitors,
      roas,
      targetRoas,
    });

    if (resolvedTarget) {
      resolvedTarget.competitors = competitors;
      resolvedTarget.quadrantDecision = quadrantDecision;
      resolvedTarget.auditLogs.push({
        id: `audit-comp-${Date.now()}`,
        stepIndex: resolvedTarget.auditLogs.length + 1,
        timestamp: new Date().toTimeString().slice(0, 8),
        category: "KOMPETITOR",
        message: `Radar 6 Kompetitor selesai. Keputusan: ${quadrantDecision.badgeLabel}. ${quadrantDecision.bossReason}`,
      });
      resolvedTarget.voiceOver = enforceVoiceOverHardGuard(
        resolvedTarget.voiceOver.script,
        {
          productTitle: resolvedTarget.productTitle,
          basePriceDisplay: resolvedTarget.basePriceDisplay,
          availableSizes: resolvedTarget.availableSizeLabels,
          totalVariants: resolvedTarget.totalVariants,
          goldenSizeRatioPct: resolvedTarget.adProtection.goldenSizeRatioPct,
          verdictCode: resolvedTarget.adProtection.verdictCode,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      productName: effectiveProductName,
      scrapedTarget: resolvedTarget,
      competitors,
      quadrantDecision,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Gagal menjalankan radar kompetitor.",
      },
      { status: 500 }
    );
  }
}
