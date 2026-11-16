"use client";

import React, { useEffect, useRef } from "react";
import {
  AuditLogEntry,
  VariantAuditRow,
  VoiceOverBrief,
} from "../lib/ghost-engine";

interface RightTelemetryColumnProps {
  logs: AuditLogEntry[];
  variants: VariantAuditRow[];
  selectedVariantIdx: number;
  voiceOver: VoiceOverBrief | null;
  isLoading: boolean;
  isSpeaking: boolean;
  onPlayVoiceOver: () => void;
  onStopVoiceOver: () => void;
  onSelectVariant: (index: number) => void;
}

export default function RightTelemetryColumn({
  logs,
  variants,
  selectedVariantIdx,
  voiceOver,
  isLoading,
  isSpeaking,
  onPlayVoiceOver,
  onStopVoiceOver,
  onSelectVariant,
}: RightTelemetryColumnProps) {
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const availableCount = variants.filter((v) => v.inStock).length;

  return (
    <aside
      aria-label="Hasil Audit dan Ringkasan Suara"
      className="w-full h-full bg-[#141414] flex flex-col divide-y divide-[#262626] overflow-y-auto"
    >
      {/* SECTION 1: SIZE AVAILABILITY MATRIX TABLE */}
      <section
        aria-label="Tabel Matriks Ketersediaan Ukuran"
        className="flex flex-col shrink-0"
      >
        <div className="px-4 py-3 border-b border-[#262626] bg-[#0D0D0D] flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#F5F5F5]">
            Tabel Matriks Ketersediaan Ukuran
          </h2>
          <span className="font-mono text-xs font-semibold text-[#4ADE80]">
            {availableCount} Tersedia / {variants.length} Total Ukuran
          </span>
        </div>

        <div className="max-h-[260px] overflow-y-auto bg-[#141414]">
          {isLoading && variants.length === 0 ? (
            <div className="p-4 text-sm text-[#A3A3A3]">
              Memuat matriks ukuran dari DOM halaman produk...
            </div>
          ) : variants.length === 0 ? (
            <div className="p-4 text-sm text-[#A3A3A3]">
              TIDAK TERDETEKSI: Tidak ada variasi ukuran pada halaman ini.
            </div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-[#0D0D0D] border-b border-[#262626] text-xs uppercase text-[#A3A3A3]">
                <tr>
                  <th className="py-2.5 px-3 text-left font-semibold">
                    Tag &amp; Ukuran
                  </th>
                  <th className="py-2.5 px-3 text-left font-semibold">
                    Harga Asli
                  </th>
                  <th className="py-2.5 px-3 text-right font-semibold">
                    Status Stok
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {variants.map((row, idx) => {
                  const isSelected = idx === selectedVariantIdx;
                  return (
                    <tr
                      key={row.somId}
                      onClick={() => onSelectVariant(idx)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Pilih ukuran ${row.sizeLabel}, harga ${row.exactPrice}, status ${row.stockStatus}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectVariant(idx);
                        }
                      }}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-[#0D0D0D] text-[#F5F5F5]"
                          : "hover:bg-[#0D0D0D]/70 text-[#F5F5F5]"
                      }`}
                    >
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block mr-2 px-1.5 py-0.5 font-mono text-xs font-bold ${
                            isSelected
                              ? "bg-[#FF5C00] text-[#0D0D0D]"
                              : row.inStock
                              ? "bg-[#4ADE80] text-[#0D0D0D]"
                              : "bg-[#0D0D0D] text-[#A3A3A3] border border-[#666666]"
                          }`}
                        >
                          {row.somId}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            row.inStock
                              ? "text-[#F5F5F5]"
                              : "line-through text-[#A3A3A3]"
                          }`}
                        >
                          {row.sizeLabel}
                        </span>
                        {row.isGoldenSize && (
                          <span className="ml-2 px-1.5 py-0.5 bg-[#0D0D0D] border border-[#FACC15] font-mono text-xs font-semibold text-[#FACC15]">
                            GOLDEN
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#F5F5F5] whitespace-nowrap">
                        {row.exactPrice}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 font-mono text-xs font-bold ${
                            row.inStock
                              ? "bg-[#4ADE80] text-[#0D0D0D]"
                              : "bg-[#0D0D0D] text-[#A3A3A3] border border-[#666666]"
                          }`}
                        >
                          {row.stockStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* SECTION 2: REAL-TIME AUDIT LOG */}
      <section
        aria-label="Log Audit Real-Time"
        className="flex-1 min-h-[180px] flex flex-col overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-[#262626] bg-[#0D0D0D] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#F5F5F5]">
            Log Audit Fakta Halaman
          </h2>
          <span className="font-mono text-xs text-[#A3A3A3]">
            {logs.length} Catatan
          </span>
        </div>

        <div
          ref={logContainerRef}
          className="flex-1 p-4 overflow-y-auto space-y-2.5 bg-[#0D0D0D] text-sm leading-relaxed"
        >
          {logs.length === 0 ? (
            <div className="text-sm text-[#A3A3A3] py-2">
              {isLoading
                ? "Sedang mengekstrak fakta dari DOM halaman..."
                : "Belum ada catatan audit. Klik tombol Audit Halaman Produk di atas untuk memulai."}
            </div>
          ) : (
            logs.map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-[#141414] border border-[#262626] space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span
                    className={`px-2 py-0.5 font-bold ${
                      entry.category === "IKLAN"
                        ? "bg-[#FACC15] text-[#0D0D0D]"
                        : "bg-[#0D0D0D] border border-[#666666] text-[#F5F5F5]"
                    }`}
                  >
                    {entry.category}
                  </span>
                  <span className="text-[#A3A3A3]">{entry.timestamp}</span>
                </div>
                <p className="text-sm text-[#F5F5F5] leading-relaxed break-words">
                  {entry.message}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* SECTION 3: HONEST AUDIO BRIEF */}
      <section
        aria-label="Ringkasan Suara Hasil Audit"
        className="p-4 bg-[#0D0D0D] flex flex-col gap-3 shrink-0"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#F5F5F5]">
            Ringkasan Suara (Audio Brief)
          </h2>
          <span className="px-2 py-0.5 bg-[#141414] border border-[#666666] font-mono text-xs font-semibold text-[#4ADE80]">
            1 Produk Tunggal · Valid
          </span>
        </div>

        <div className="p-3.5 border border-[#666666] bg-[#141414] text-sm text-[#F5F5F5] leading-relaxed">
          {voiceOver ? (
            <p className="font-medium">&ldquo;{voiceOver.script}&rdquo;</p>
          ) : (
            <p className="text-[#A3A3A3]">
              Ringkasan suara akan dibuat otomatis setelah halaman produk selesai
              diaudit.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-[#A3A3A3]">
            <div>Batas: Maks 22 Kata &amp; 145 Karakter</div>
            <div className="text-sm font-bold text-[#F5F5F5] mt-0.5">
              {voiceOver ? voiceOver.metricDisplay : "0/22 KATA · 0/145 KARAKTER"}
            </div>
          </div>

          <button
            type="button"
            disabled={!voiceOver}
            onClick={isSpeaking ? onStopVoiceOver : onPlayVoiceOver}
            className={`min-h-[44px] px-4 py-2 font-sans text-sm font-bold transition-colors ${
              !voiceOver
                ? "bg-[#141414] text-[#A3A3A3] border border-[#666666]"
                : isSpeaking
                ? "bg-[#FF5C00] text-[#0D0D0D] border border-[#FF5C00]"
                : "bg-[#141414] text-[#F5F5F5] border-2 border-[#F5F5F5] hover:border-[#FF5C00] hover:text-[#FF5C00]"
            }`}
          >
            {isSpeaking ? "Hentikan Suara" : "Putar Ringkasan Suara"}
          </button>
        </div>
      </section>
    </aside>
  );
}
