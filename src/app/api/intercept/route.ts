import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_TARGET_URL,
  extractProductUrlsFromListingHtml,
  parse807GarageDetailJson,
  parseProductHtmlDom,
  ShopifyProductJsonRaw,
} from "../../../lib/ghost-engine";

export const dynamic = "force-dynamic";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode: string = String(body?.mode || "AUDIT_PRODUCT").toUpperCase();
    const rawUrl = String(body?.url || DEFAULT_TARGET_URL).trim();

    if (!rawUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: "URL tidak boleh kosong.",
        },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(
        /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
      );
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Format URL tidak valid. Masukkan URL lengkap dengan https://.",
        },
        { status: 400 }
      );
    }

    // Direct 807Garage product URL handler via api.807garage.com/v1/product/detail/<slug>
    if (
      mode === "AUDIT_PRODUCT" &&
      /807garage\.com$/i.test(parsedUrl.hostname) &&
      /^\/product\/([^/]+)/i.test(parsedUrl.pathname)
    ) {
      const slugMatch = parsedUrl.pathname.match(/^\/product\/([^/]+)/i);
      const slug = slugMatch?.[1] || "";
      if (slug && slug !== "detail") {
        try {
          const apiRes = await fetch(
            `https://api.807garage.com/v1/product/detail/${encodeURIComponent(
              slug
            )}`,
            {
              headers: {
                "User-Agent": BROWSER_HEADERS["User-Agent"],
                Accept: "application/json",
              },
              cache: "no-store",
            }
          );
          if (apiRes.ok) {
            const apiJson = await apiRes.json();
            if (apiJson?.data && typeof apiJson.data === "object") {
              const target = parse807GarageDetailJson(
                apiJson.data as Record<string, unknown>,
                parsedUrl.toString()
              );
              return NextResponse.json({
                ok: true,
                timestamp: new Date().toISOString(),
                target,
              });
            }
          }
        } catch {
          // Fallback to standard HTML fetch if API is unreachable
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(parsedUrl.toString(), {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      headers: BROWSER_HEADERS,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Halaman target mengembalikan status HTTP ${
            response.status
          } (${response.statusText || "Gagal"}).`,
        },
        { status: 502 }
      );
    }

    const html = await response.text();
    if (!html || html.trim().length < 50) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Respons HTML dari halaman target kosong atau tidak dapat dibaca.",
        },
        { status: 502 }
      );
    }

    // Mode 1: Category / Brand / Sitemap Auto-Crawler
    if (mode === "EXTRACT_CATEGORY_LINKS") {
      const productUrls = extractProductUrlsFromListingHtml(
        html,
        parsedUrl.toString()
      );
      return NextResponse.json({
        ok: true,
        timestamp: new Date().toISOString(),
        sourceUrl: parsedUrl.toString(),
        totalFound: productUrls.length,
        productUrls,
      });
    }

    // Mode 2: Single Product Deep DOM Audit (WooCommerce, Shopify, Schema.org, Generic DOM)
    let externalShopifyJson: ShopifyProductJsonRaw | null = null;
    if (
      /cdn\.shopify\.com|Shopify\.theme/i.test(html) &&
      /\/products\/[^/]+/i.test(parsedUrl.pathname)
    ) {
      try {
        const jsUrl = new URL(
          `${parsedUrl.pathname.replace(/\/$/, "")}.js`,
          parsedUrl.origin
        );
        const shopRes = await fetch(jsUrl.toString(), {
          headers: {
            "User-Agent": BROWSER_HEADERS["User-Agent"],
            Accept: "application/json",
          },
          cache: "no-store",
        });
        if (shopRes.ok) {
          const parsedShop = await shopRes.json();
          if (parsedShop && Array.isArray(parsedShop.variants)) {
            externalShopifyJson = parsedShop as ShopifyProductJsonRaw;
          }
        }
      } catch {
        // Proceed with standard HTML / JSON-LD extraction if .js endpoint is disabled.
      }
    }

    const target = parseProductHtmlDom(
      html,
      parsedUrl.toString(),
      externalShopifyJson
    );

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      target,
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Batas waktu koneksi (15 detik) habis saat menghubungi halaman target."
          : `Gagal mengambil halaman produk: ${err.message}`
        : "Terjadi kesalahan jaringan saat mengambil DOM halaman target.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 502 }
    );
  }
}
