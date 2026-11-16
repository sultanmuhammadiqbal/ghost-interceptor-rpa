#!/usr/bin/env python3
"""
GHOST // INTERCEPTOR [SYS.02] — Python Autonomous Vision-Guided Web Operator
Set-of-Mark (SoM) RPA Engine & Deterministic Voice-Over Hard-Guard Validator.

Rules enforced:
1. Single Product Isolation: Audits strictly 1 target product URL per session.
   Zero cross-product comparison or hallucinated external references.
2. Voice-Over Hard-Guard: Maximum 22 words AND maximum 145 characters.
"""

import json
import math
import re
import sys
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Tuple


MAX_VO_WORDS = 22
MAX_VO_CHARS = 145

BANNED_COMPARISON_TERMS = [
    "dibandingkan",
    "compared to",
    "produk lain",
    "other products",
    "kompetitor",
    "competitor",
    "alternatif",
    "versus",
    "lebih murah dari",
    "lebih mahal dari",
]


@dataclass
class VoiceOverCompliance:
    script: str
    words: int
    max_words: int
    chars: int
    max_chars: int
    single_product_verified: bool
    passed: bool
    metric_label: str


def enforce_voice_over_hard_guard(
    raw_script: str,
    product_name: str,
    active_variants: int,
    total_variants: int,
    min_price: str,
    cart_ok: bool,
) -> VoiceOverCompliance:
    """
    Deterministically validates and enforces the <= 22 words and <= 145 chars
    hard-guard constraint, as well as single-product isolation.
    """
    cleaned = re.sub(r"\s+", " ", raw_script).strip()

    # Check single product isolation (strip any banned comparison clauses)
    lower_check = cleaned.lower()
    single_product_ok = not any(term in lower_check for term in BANNED_COMPARISON_TERMS)
    if not single_product_ok:
        # Fallback to strict single-product deterministic template
        cart_tag = "Cart normal." if cart_ok else "Cart gagal."
        short_name = " ".join(product_name.split()[:3])
        cleaned = (
            f"Audit {short_name} selesai. {active_variants} dari {total_variants} "
            f"ukuran tersedia mulai {min_price}. {cart_tag}"
        )
        single_product_ok = True

    words_list = [w for w in cleaned.split(" ") if w]
    if len(words_list) > MAX_VO_WORDS:
        words_list = words_list[:MAX_VO_WORDS]
        cleaned = " ".join(words_list)
        if not cleaned.endswith("."):
            cleaned = cleaned.rstrip(",;:") + "."

    if len(cleaned) > MAX_VO_CHARS:
        truncated = cleaned[: MAX_VO_CHARS - 1].rsplit(" ", 1)[0]
        cleaned = truncated.rstrip(".,;:") + "."

    final_words = len([w for w in cleaned.split(" ") if w])
    final_chars = len(cleaned)
    passed = (
        final_words <= MAX_VO_WORDS
        and final_chars <= MAX_VO_CHARS
        and single_product_ok
    )

    metric_label = f"{final_words:02d}/{MAX_VO_WORDS} WORDS // {final_chars:03d}/{MAX_VO_CHARS} CHARS"

    return VoiceOverCompliance(
        script=cleaned,
        words=final_words,
        max_words=MAX_VO_WORDS,
        chars=final_chars,
        max_chars=MAX_VO_CHARS,
        single_product_verified=single_product_ok,
        passed=passed,
        metric_label=metric_label,
    )


def compute_cubic_bezier_path(
    start: Tuple[int, int],
    end: Tuple[int, int],
    steps: int = 24,
) -> List[Dict[str, int]]:
    """
    Generates human-like cubic Bezier trajectory points between two screen coordinates.
    """
    x0, y0 = start
    x3, y3 = end
    dx = x3 - x0
    dy = y3 - y0

    # Tactical human-like arc control points
    cx1 = x0 + dx * 0.28 - dy * 0.14
    cy1 = y0 + dy * 0.12 + abs(dx) * 0.08
    cx2 = x0 + dx * 0.76 + dy * 0.08
    cy2 = y0 + dy * 0.88 - abs(dx) * 0.05

    points: List[Dict[str, int]] = []
    for i in range(steps + 1):
        t = i / steps
        # Ease-in-out cubic timing
        u = 1 - t
        bx = (
            (u**3) * x0
            + 3 * (u**2) * t * cx1
            + 3 * u * (t**2) * cx2
            + (t**3) * x3
        )
        by = (
            (u**3) * y0
            + 3 * (u**2) * t * cy1
            + 3 * u * (t**2) * cy2
            + (t**3) * y3
        )
        points.append({"x": round(bx), "y": round(by)})
    return points


if __name__ == "__main__":
    sample = enforce_voice_over_hard_guard(
        raw_script="Audit Arcteryx Alpha SV selesai. 4 dari 5 varian ukuran tersedia mulai Rp12.450.000. Tombol keranjang terverifikasi aktif.",
        product_name="ARC'TERYX ALPHA SV SHELL",
        active_variants=4,
        total_variants=5,
        min_price="Rp12.450.000",
        cart_ok=True,
    )
    print(json.dumps(asdict(sample), indent=2))
