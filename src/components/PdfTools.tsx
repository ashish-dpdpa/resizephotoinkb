"use client";

import { useRef, useState } from "react";
import { encodeCanvas, formatKB, loadImage } from "@/lib/image";
import { A4, imagePageSize, mergePdfs, pagesToPdf, renderPdf, type PdfResult } from "@/lib/pdf";

/* ---------------- shared bits ---------------- */

function Drop({
  accept,
  multiple,
  label,
  hint,
  onFiles,
}: {
  accept: string;
  multiple?: boolean;
  label: string;
  hint: string;
  onFiles: (f: File[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFiles([...e.dataTransfer.files]); }}
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
        over ? "border-pen bg-pen-50" : "border-line-2 bg-paper/60"
      }`}
    >
      <p className="font-display text-xl font-bold text-ink">{label}</p>
      <button type="button" onClick={() => ref.current?.click()} className="btn btn-ink mt-4">
        Choose {multiple ? "files" : "file"}
      </button>
      <p className="mt-3 font-mono text-[0.7rem] text-ink-3">{hint}</p>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          onFiles([...(e.target.files ?? [])]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function TargetPicker({ value, onChange, options }: { value: number; onChange: (v: number) => void; options: number[] }) {
  return (
    <div>
      <p className="label">Target size</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {options.map((kb) => (
          <button key={kb} type="button" aria-pressed={value === kb} onClick={() => onChange(kb)} className="chip !py-1 !text-xs">
            {kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`}
          </button>
        ))}
        <button type="button" aria-pressed={value === 0} onClick={() => onChange(0)} className="chip !py-1 !text-xs">No limit</button>
        <label className="flex items-center gap-2 text-xs text-ink-3">
          or
          <input type="number" min={10} value={value || ""} placeholder="KB" onChange={(e) => onChange(+e.target.value)} className="field !w-24 !py-1.5 !text-sm" />
          KB
        </label>
      </div>
    </div>
  );
}

function PdfResultBox({ result, name, maxKB, extra }: { result: PdfResult; name: string; maxKB?: number; extra?: string }) {
  const ok = !maxKB || result.bytes <= maxKB * 1024;
  return (
    <div className="mt-6 rounded-xl border border-line bg-paper/60 p-5" aria-live="polite">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Your PDF</p>
          <p className={`font-display text-4xl font-extrabold tabular-nums ${ok ? "text-ink" : "text-stamp"}`}>
            {(result.bytes / 1024).toFixed(1)}
            <span className="ml-1 text-lg text-ink-3">KB</span>
          </p>
          {extra && <p className="mt-1 font-mono text-xs text-ink-3">{extra}</p>}
          {result.warning && <p className="mt-2 text-sm text-stamp">{result.warning}</p>}
        </div>
        <div className="flex items-center gap-3">
          {ok && maxKB ? <span className="stamp stamp-ok animate-stamp">Under {maxKB >= 1024 ? `${maxKB / 1024} MB` : `${maxKB} KB`}</span> : null}
          <a href={result.url} download={name} className="btn btn-pen">Download PDF</a>
        </div>
      </div>
    </div>
  );
}

function FileList({ files, onMove, onRemove }: { files: { name: string; size: number }[]; onMove: (i: number, d: -1 | 1) => void; onRemove: (i: number) => void }) {
  if (!files.length) return null;
  return (
    <ol className="mt-4 divide-y divide-dashed divide-line-2 rounded-xl border border-line bg-card">
      {files.map((f, i) => (
        <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-4 py-2.5 text-sm">
          <span className="font-mono text-xs text-stamp">{String(i + 1).padStart(2, "0")}</span>
          <span className="min-w-0 flex-1 truncate font-semibold text-ink">{f.name}</span>
          <span className="font-mono text-xs text-ink-3">{formatKB(f.size)}</span>
          <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => onMove(i, -1)} className="chip !px-2 !py-0.5 disabled:opacity-30">↑</button>
          <button type="button" aria-label="Move down" disabled={i === files.length - 1} onClick={() => onMove(i, 1)} className="chip !px-2 !py-0.5 disabled:opacity-30">↓</button>
          <button type="button" aria-label="Remove" onClick={() => onRemove(i)} className="chip !px-2 !py-0.5">✕</button>
        </li>
      ))}
    </ol>
  );
}

function move<T>(arr: T[], i: number, d: -1 | 1) {
  const a = [...arr];
  const j = i + d;
  if (j < 0 || j >= a.length) return a;
  [a[i], a[j]] = [a[j], a[i]];
  return a;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="card p-4 sm:p-6">{children}</div>;
}

function useBusy() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message || "Something went wrong with this file.");
    } finally {
      setBusy(null);
    }
  };
  return { busy, error, run };
}

/* ---------------- image → PDF ---------------- */

export function ImageToPdf({ defaultMaxKB = 0 }: { defaultMaxKB?: number }) {
  const [files, setFiles] = useState<File[]>([]);
  const [maxKB, setMaxKB] = useState(defaultMaxKB);
  const [layout, setLayout] = useState<"a4" | "fit">("a4");
  const [result, setResult] = useState<PdfResult | null>(null);
  const { busy, error, run } = useBusy();

  const add = (fs: File[]) => {
    setFiles((old) => [...old, ...fs.filter((f) => f.type.startsWith("image/"))]);
    setResult(null);
  };

  const create = () =>
    run("Creating PDF…", async () => {
      const pages = [];
      for (const f of files) {
        const img = await loadImage(f);
        const s = Math.min(1, 2400 / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * s);
        c.height = Math.round(img.naturalHeight * s);
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        pages.push(layout === "a4" ? { canvas: c, size: A4, margin: 24 } : { canvas: c, size: imagePageSize(c, 150), margin: 0 });
      }
      const r = await pagesToPdf(pages, maxKB || undefined);
      setResult((old) => {
        if (old) URL.revokeObjectURL(old.url);
        return r;
      });
    });

  return (
    <Shell>
      <Drop accept="image/*" multiple label="Add photos or scanned pages" hint="JPG · PNG · WebP · one page per image" onFiles={add} />
      <FileList
        files={files}
        onMove={(i, d) => { setFiles((f) => move(f, i, d)); setResult(null); }}
        onRemove={(i) => { setFiles((f) => f.filter((_, j) => j !== i)); setResult(null); }}
      />
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <TargetPicker value={maxKB} onChange={(v) => { setMaxKB(v); setResult(null); }} options={[100, 200, 300, 500, 1024]} />
        <div>
          <p className="label">Page</p>
          <div className="mt-2 flex gap-2">
            <button type="button" aria-pressed={layout === "a4"} onClick={() => { setLayout("a4"); setResult(null); }} className="chip !py-1 !text-xs">A4</button>
            <button type="button" aria-pressed={layout === "fit"} onClick={() => { setLayout("fit"); setResult(null); }} className="chip !py-1 !text-xs">Same as image</button>
          </div>
        </div>
      </div>
      <button type="button" disabled={!files.length || !!busy} onClick={create} className="btn btn-pen mt-6 w-full py-4 text-base">
        {busy ?? `Create PDF${files.length ? ` · ${files.length} page${files.length > 1 ? "s" : ""}` : ""}`}
      </button>
      {error && <p className="mt-4 rounded-lg bg-stamp-50 p-3 text-sm text-stamp" role="alert">{error}</p>}
      {result && <PdfResultBox result={result} name="images.pdf" maxKB={maxKB || undefined} extra={`${files.length} page${files.length > 1 ? "s" : ""} · image quality ${Math.round(result.quality * 100)}%`} />}
    </Shell>
  );
}

/* ---------------- compress PDF ---------------- */

export function CompressPdf({ defaultMaxKB = 200 }: { defaultMaxKB?: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [maxKB, setMaxKB] = useState(defaultMaxKB);
  const [result, setResult] = useState<PdfResult | null>(null);
  const [progress, setProgress] = useState("");
  const { busy, error, run } = useBusy();

  const compress = () =>
    run("Compressing…", async () => {
      if (!file) return;
      if (maxKB && file.size <= maxKB * 1024) {
        const blob = new Blob([await file.arrayBuffer()], { type: "application/pdf" });
        setResult({ blob, url: URL.createObjectURL(blob), bytes: blob.size, quality: 1, scale: 1, warning: "This PDF is already under the target, so it was left unchanged." });
        return;
      }
      const pages = await renderPdf(file, 150, (d, t) => setProgress(`Reading page ${d} of ${t}`));
      let tries = 0;
      const r = await pagesToPdf(pages.map((p) => ({ canvas: p.canvas, size: p.size })), maxKB || undefined, () => setProgress(`Optimising (pass ${++tries})`));
      setProgress("");
      setResult((old) => {
        if (old) URL.revokeObjectURL(old.url);
        return r;
      });
    });

  return (
    <Shell>
      {!file ? (
        <Drop accept="application/pdf" label="Add your PDF" hint="One PDF · processed on your device" onFiles={(f) => { const p = f.find((x) => x.type === "application/pdf" || x.name.toLowerCase().endsWith(".pdf")); if (p) { setFile(p); setResult(null); } }} />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3">
          <span className="min-w-0 truncate font-semibold text-ink">{file.name}</span>
          <span className="font-mono text-xs text-ink-3">Original: {formatKB(file.size)}</span>
          <button type="button" onClick={() => { setFile(null); setResult(null); }} className="text-sm font-semibold text-ink-2 underline">Change</button>
        </div>
      )}
      <div className="mt-6">
        <TargetPicker value={maxKB} onChange={(v) => { setMaxKB(v); setResult(null); }} options={[50, 100, 200, 300, 500, 1024]} />
      </div>
      <button type="button" disabled={!file || !!busy} onClick={compress} className="btn btn-pen mt-6 w-full py-4 text-base">
        {busy ? progress || busy : "Compress PDF"}
      </button>
      {error && <p className="mt-4 rounded-lg bg-stamp-50 p-3 text-sm text-stamp" role="alert">{error}</p>}
      {result && file && (
        <PdfResultBox
          result={result}
          name={file.name.replace(/\.pdf$/i, "") + "-compressed.pdf"}
          maxKB={maxKB || undefined}
          extra={`Was ${formatKB(file.size)} · ${Math.max(0, Math.round((1 - result.bytes / file.size) * 100))}% smaller`}
        />
      )}
      <p className="mt-4 text-xs text-ink-3">Pages are saved as images to reach small sizes, so text in the new PDF can’t be selected. It stays readable.</p>
    </Shell>
  );
}

/* ---------------- PDF → JPG ---------------- */

export function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState(150);
  const [maxKB, setMaxKB] = useState(0);
  const [pages, setPages] = useState<{ url: string; bytes: number; w: number; h: number }[]>([]);
  const { busy, error, run } = useBusy();

  const convert = () =>
    run("Converting…", async () => {
      if (!file) return;
      pages.forEach((p) => URL.revokeObjectURL(p.url));
      const rendered = await renderPdf(file, dpi);
      const out = [];
      for (const p of rendered) {
        const r = await encodeCanvas(p.canvas, { minKB: 0, maxKB: maxKB || 100000, dpi });
        out.push({ url: r.url, bytes: r.bytes, w: r.width, h: r.height });
      }
      setPages(out);
    });

  const base = file?.name.replace(/\.pdf$/i, "") ?? "page";

  return (
    <Shell>
      {!file ? (
        <Drop accept="application/pdf" label="Add your PDF" hint="Each page becomes a JPG" onFiles={(f) => { const p = f.find((x) => x.name.toLowerCase().endsWith(".pdf")); if (p) { setFile(p); setPages([]); } }} />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3">
          <span className="min-w-0 truncate font-semibold text-ink">{file.name}</span>
          <span className="font-mono text-xs text-ink-3">{formatKB(file.size)}</span>
          <button type="button" onClick={() => { setFile(null); setPages([]); }} className="text-sm font-semibold text-ink-2 underline">Change</button>
        </div>
      )}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="label">Resolution</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[100, 150, 200, 300].map((d) => (
              <button key={d} type="button" aria-pressed={dpi === d} onClick={() => setDpi(d)} className="chip !py-1 !text-xs">{d} DPI</button>
            ))}
          </div>
        </div>
        <TargetPicker value={maxKB} onChange={setMaxKB} options={[100, 200, 500]} />
      </div>
      <button type="button" disabled={!file || !!busy} onClick={convert} className="btn btn-pen mt-6 w-full py-4 text-base">
        {busy ?? "Convert to JPG"}
      </button>
      {error && <p className="mt-4 rounded-lg bg-stamp-50 p-3 text-sm text-stamp" role="alert">{error}</p>}
      {pages.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {pages.map((p, i) => (
            <li key={p.url} className="rounded-xl border border-line bg-card p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Page ${i + 1}`} className="aspect-[3/4] w-full rounded border border-line object-contain" />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-ink-3">Page {i + 1} · {formatKB(p.bytes)}</span>
                <a href={p.url} download={`${base}-page-${i + 1}.jpg`} className="chip !py-1 !text-xs">Download</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

/* ---------------- merge PDF ---------------- */

export function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<PdfResult | null>(null);
  const { busy, error, run } = useBusy();
  const merge = () =>
    run("Merging…", async () => {
      const r = await mergePdfs(files);
      setResult((old) => {
        if (old) URL.revokeObjectURL(old.url);
        return r;
      });
    });
  return (
    <Shell>
      <Drop accept="application/pdf" multiple label="Add the PDFs to join" hint="Put them in order with ↑ ↓" onFiles={(fs) => { setFiles((o) => [...o, ...fs.filter((f) => f.name.toLowerCase().endsWith(".pdf"))]); setResult(null); }} />
      <FileList
        files={files}
        onMove={(i, d) => { setFiles((f) => move(f, i, d)); setResult(null); }}
        onRemove={(i) => { setFiles((f) => f.filter((_, j) => j !== i)); setResult(null); }}
      />
      <button type="button" disabled={files.length < 2 || !!busy} onClick={merge} className="btn btn-pen mt-6 w-full py-4 text-base">
        {busy ?? (files.length < 2 ? "Add at least 2 PDFs" : `Merge ${files.length} PDFs`)}
      </button>
      {error && <p className="mt-4 rounded-lg bg-stamp-50 p-3 text-sm text-stamp" role="alert">{error}</p>}
      {result && <PdfResultBox result={result} name="merged.pdf" extra="Need it smaller? Run it through Compress PDF." />}
    </Shell>
  );
}
