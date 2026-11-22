"use client";

import { useState } from "react";

const PER_INCH = { cm: 2.54, mm: 25.4, in: 1 } as const;
type Len = keyof typeof PER_INCH;

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

function Field({ label, value, onChange, suffix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="relative mt-1">
        <input type="number" inputMode="decimal" step="any" min={0} value={value} onChange={(e) => onChange(e.target.value)} className="field pr-12" />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-3">{suffix}</span>}
      </div>
    </label>
  );
}

/** Pixels ⇄ cm / mm / inch at a chosen DPI. Whichever side you type in is kept exactly as typed. */
export function PixelConverter() {
  const [dpi, setDpi] = useState("200");
  const [unit, setUnit] = useState<Len>("cm");
  const [side, setSide] = useState<"px" | "len">("px");
  const [w, setW] = useState("200");
  const [h, setH] = useState("230");
  const d = parseFloat(dpi) || 0;
  const pxToLen = (p: string) => (d > 0 && p !== "" && !Number.isNaN(parseFloat(p)) ? String(round((parseFloat(p) / d) * PER_INCH[unit])) : "");
  const lenToPx = (v: string) => (d > 0 && v !== "" && !Number.isNaN(parseFloat(v)) ? String(Math.round((parseFloat(v) / PER_INCH[unit]) * d)) : "");
  const pxW = side === "px" ? w : lenToPx(w);
  const pxH = side === "px" ? h : lenToPx(h);
  const lenW = side === "len" ? w : pxToLen(w);
  const lenH = side === "len" ? h : pxToLen(h);
  const edit = (s: "px" | "len", which: "w" | "h", v: string) => {
    if (s !== side) {
      setSide(s);
      // carry the other dimension over to the new side
      if (which === "w") setH(s === "px" ? pxH : lenH);
      else setW(s === "px" ? pxW : lenW);
    }
    if (which === "w") setW(v);
    else setH(v);
  };
  const u = unit === "in" ? "inch" : unit;

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Unit">
        <span className="label mr-1">Convert to</span>
        {(Object.keys(PER_INCH) as Len[]).map((x) => (
          <button key={x} type="button" aria-pressed={unit === x} onClick={() => { if (side === "len") { setW(pxW); setH(pxH); setSide("px"); } setUnit(x); }} className="chip !py-1 !text-xs">
            {x === "in" ? "inch" : x}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto_1fr_1fr]">
        <Field label="Width" value={pxW} onChange={(v) => edit("px", "w", v)} suffix="px" />
        <Field label="Height" value={pxH} onChange={(v) => edit("px", "h", v)} suffix="px" />
        <span aria-hidden="true" className="hidden self-end pb-3 text-center font-mono text-ink-3 sm:block">⇄</span>
        <Field label="Width" value={lenW} onChange={(v) => edit("len", "w", v)} suffix={u} />
        <Field label="Height" value={lenH} onChange={(v) => edit("len", "h", v)} suffix={u} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_3fr]">
        <Field label="DPI (dots per inch)" value={dpi} onChange={setDpi} />
        <div className="flex flex-wrap items-end gap-2">
          {[72, 96, 150, 200, 300].map((v) => (
            <button key={v} type="button" aria-pressed={dpi === String(v)} onClick={() => setDpi(String(v))} className="chip !py-1 !text-xs">
              {v} DPI
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 rounded-xl bg-paper-2/70 p-4 font-mono text-sm text-ink-2" aria-live="polite">
        {pxW || "?"} × {pxH || "?"} px at {dpi || "?"} DPI = <strong className="text-ink">{lenW || "?"} × {lenH || "?"} {u}</strong>
      </p>
    </div>
  );
}

const BYTES = { B: 0, KB: 1, MB: 2, GB: 3 } as const;
type Size = keyof typeof BYTES;

/** Bytes ⇄ KB ⇄ MB ⇄ GB in binary (1024) or decimal (1000) units. */
export function SizeConverter() {
  const [base, setBase] = useState<1024 | 1000>(1024);
  const [src, setSrc] = useState<{ unit: Size; text: string }>({ unit: "KB", text: "50" });
  const n = parseFloat(src.text);
  const bytes = Number.isNaN(n) ? NaN : n * base ** BYTES[src.unit];
  const val = (u: Size) => {
    if (u === src.unit) return src.text;
    if (Number.isNaN(bytes)) return "";
    return u === "B" ? String(Math.round(bytes)) : String(round(bytes / base ** BYTES[u], 4));
  };
  return (
    <div className="card p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Base">
        <span className="label mr-1">1 KB =</span>
        <button type="button" aria-pressed={base === 1024} onClick={() => setBase(1024)} className="chip !py-1 !text-xs">1024 bytes</button>
        <button type="button" aria-pressed={base === 1000} onClick={() => setBase(1000)} className="chip !py-1 !text-xs">1000 bytes</button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(Object.keys(BYTES) as Size[]).map((u) => (
          <Field key={u} label={u === "B" ? "Bytes" : u} value={val(u)} onChange={(v) => setSrc({ unit: u, text: v })} suffix={u} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {[10, 20, 50, 100, 200, 500].map((kb) => (
          <button key={kb} type="button" onClick={() => setSrc({ unit: "KB", text: String(kb) })} className="chip !py-1 !text-xs">{kb} KB</button>
        ))}
        <button type="button" onClick={() => setSrc({ unit: "MB", text: "1" })} className="chip !py-1 !text-xs">1 MB</button>
      </div>
      <p className="mt-5 rounded-xl bg-paper-2/70 p-4 font-mono text-sm text-ink-2" aria-live="polite">
        {src.text || "?"} {src.unit} = <strong className="text-ink">{val(src.unit === "MB" ? "KB" : "MB")} {src.unit === "MB" ? "KB" : "MB"}</strong> = {val("B")} bytes
      </p>
    </div>
  );
}
