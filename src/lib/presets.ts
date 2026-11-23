import type { Preset } from "@/components/ImageTool";
import { exams, type DocKind } from "./exams";

/**
 * Exam-neutral starting sizes for the general tools, shown as the first chip and
 * selected by default. They are the most common sizes across the exams we cover
 * (SSC / IBPS style).
 */
export const STANDARD_PHOTO: Preset = { id: "standard-photo", label: "Standard size", width: 200, height: 230, minKB: 20, maxKB: 50 };
export const STANDARD_SIGNATURE: Preset = { id: "standard-signature", label: "Standard size", width: 140, height: 60, minKB: 10, maxKB: 20, signature: true };

/** Build ImageTool presets from exam data, optionally limited to certain document kinds. */
export function presetsFor(kinds?: DocKind[]): Preset[] {
  const out: Preset[] = [];
  for (const exam of exams) {
    for (const d of exam.docs) {
      if (kinds && !kinds.includes(d.kind)) continue;
      out.push({
        id: `${exam.slug}-${d.kind}`,
        label: `${exam.name} ${d.label.split(" (")[0].toLowerCase()}`,
        width: d.width,
        height: d.height,
        minKB: d.minKB,
        maxKB: d.maxKB,
        dpi: d.dpi,
        signature: d.kind === "signature" || d.kind === "thumb" || d.kind === "declaration",
      });
    }
  }
  return out;
}

export function examPresets(slug: string): Preset[] {
  const exam = exams.find((e) => e.slug === slug);
  if (!exam) return [];
  return exam.docs.map((d) => ({
    id: `${exam.slug}-${d.kind}`,
    label: d.label,
    width: d.width,
    height: d.height,
    minKB: d.minKB,
    maxKB: d.maxKB,
    dpi: d.dpi,
    signature: d.kind === "signature" || d.kind === "thumb" || d.kind === "declaration",
  }));
}
