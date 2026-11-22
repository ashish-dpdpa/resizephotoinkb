"use client";

import { useEffect, useRef, useState } from "react";
import { formatKB, processImage, type ProcessResult } from "@/lib/image";

const sizes = [
  { id: "140x60", label: "140 × 60 px (IBPS, SBI)", w: 140, h: 60, min: 10, max: 20 },
  { id: "280x120", label: "280 × 120 px (RRB)", w: 280, h: 120, min: 30, max: 49 },
  { id: "240x80", label: "240 × 80 px (SSC)", w: 240, h: 80, min: 10, max: 20 },
  { id: "300x100", label: "300 × 100 px (NEET)", w: 300, h: 100, min: 4, max: 30 },
];

export default function SignatureMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#0b0b0b");
  const [thickness, setThickness] = useState(3);
  const [hasInk, setHasInk] = useState(false);
  const [sizeId, setSizeId] = useState(sizes[0].id);
  const [result, setResult] = useState<ProcessResult | null>(null);

  useEffect(() => {
    const c = canvasRef.current!;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = point(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    setHasInk(true);
  };
  const onUp = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.restore();
    setHasInk(false);
    setResult((old) => {
      if (old) URL.revokeObjectURL(old.url);
      return null;
    });
  };

  const exportSig = async () => {
    const s = sizes.find((x) => x.id === sizeId)!;
    const c = canvasRef.current!;
    const img = new Image();
    img.src = c.toDataURL("image/png");
    await img.decode();
    const r = await processImage(img, {
      width: s.w,
      height: s.h,
      minKB: s.min,
      maxKB: s.max,
      fit: "contain",
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      cleanSignature: false,
      threshold: 200,
      inkColor: "original",
      allowShrink: false,
    });
    setResult((old) => {
      if (old) URL.revokeObjectURL(old.url);
      return r;
    });
  };

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm">
          <span className="label block">Ink</span>
          <select value={color} onChange={(e) => setColor(e.target.value)} className="field">
            <option value="#0b0b0b">Black</option>
            <option value="#102a8c">Blue</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="label block">Pen thickness: {thickness}</span>
          <input type="range" min={1} max={8} value={thickness} onChange={(e) => setThickness(+e.target.value)} />
        </label>
        <button type="button" onClick={clear} className="btn btn-ghost">
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        aria-label="Signature drawing area"
        className="mt-4 h-48 w-full touch-none rounded-xl border-2 border-dashed border-line-2 bg-white sm:h-56"
      />
      <p className="mt-2 text-xs text-ink-3">Sign inside the box with your finger, stylus or mouse. Make it large; it will be scaled down.</p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="label block">Output size</span>
          <select value={sizeId} onChange={(e) => setSizeId(e.target.value)} className="field">
            {sizes.map((s) => (
              <option key={s.id} value={s.id}>{s.label}, {s.min}–{s.max} KB</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!hasInk}
          onClick={exportSig}
          className="btn btn-pen"
        >
          Create JPG
        </button>
      </div>

      {result && (
        <div className="mt-4 rounded-xl border border-line bg-paper/60 p-4" aria-live="polite">
          <p className="text-sm font-medium text-ok">
            {result.width} × {result.height} px · {formatKB(result.bytes)}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt="Your signature" className="mt-2 rounded border border-line" />
          <a
            href={result.url}
            download={`signature-${result.width}x${result.height}.jpg`}
            className="btn btn-pen mt-3"
          >
            Download JPG
          </a>
        </div>
      )}
    </div>
  );
}
