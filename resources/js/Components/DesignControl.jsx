import React, { useState } from "react";
import { useDesignConfig } from "./DesignConfigProvider.jsx";
import SecondaryButton from "@/Components/SecondaryButton";

const presets = {
  "modern-sky": {
    theme: { hue: "sky", intensity: 700, bg: "white" },
    layout: { density: "normal", cardRadius: "2xl", gap: 6 },
    typography: { font: "inter", baseSize: 15, headingWeight: 800 },
    components: { buttonStyle: "solid", badgeTone: "sky", skeleton: false },
  },
  "compact-slate": {
    theme: { hue: "slate", intensity: 700, bg: "white" },
    layout: { density: "compact", cardRadius: "xl", gap: 4 },
    typography: { font: "figtree", baseSize: 14, headingWeight: 800 },
    components: { buttonStyle: "outline", badgeTone: "slate", skeleton: true },
  },
};

export default function DesignControl() {
  const { setConfig } = useDesignConfig();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const apply = () => {
    setError("");
    let next;
    try {
      const trimmed = (text || "").trim();
      if (trimmed.startsWith("preset:")) {
        const key = trimmed.split(":")[1]?.trim();
        next = presets[key] || presets["modern-sky"];
      } else {
        next = JSON.parse(trimmed);
      }
      // validation
      if (!next || typeof next !== "object") {
        throw new Error("Format tidak valid");
      }
      if (next.layout?.cardRadius && !["md", "xl", "2xl"].includes(next.layout.cardRadius)) {
        next.layout.cardRadius = "2xl";
      }
      if (next.typography?.baseSize && (next.typography.baseSize < 12 || next.typography.baseSize > 18)) {
        next.typography.baseSize = 15;
      }
      setConfig((prev) => ({ ...prev, ...next }));
    } catch (e) {
      setError(e?.message || "Gagal mem-parsing konfigurasi");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <div className="text-sm font-semibold text-slate-900">Kontrol Desain (1 Input)</div>
        <div className="mt-1 text-xs text-slate-600">
          Masukkan JSON konfigurasi atau gunakan preset: <span className="font-semibold">preset: modern-sky</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800 text-sm">{error}</div>
        ) : null}
        <textarea
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='{"theme":{"hue":"sky","intensity":700},"layout":{"cardRadius":"2xl"}}'
          aria-label="Masukan konfigurasi desain"
        />
        <div className="flex justify-end">
          <SecondaryButton onClick={apply} className="rounded-2xl">Terapkan</SecondaryButton>
        </div>
      </div>
    </div>
  );
}

