// One page per (exam × document), e.g. /exams/ssc-cgl/signature-size.
// Shared guidance per document type lives here; exam-specific numbers come from exams.ts.

import { exams, type DocKind, type DocSpec, type Exam } from "./exams";
import { compressSizes } from "./tools";

export const docSlug: Record<DocKind, string> = {
  photo: "photo-size",
  signature: "signature-size",
  thumb: "thumb-impression-size",
  declaration: "handwritten-declaration-size",
  postcard: "postcard-photo-size",
};

export const docNoun: Record<DocKind, string> = {
  photo: "Photo",
  signature: "Signature",
  thumb: "Thumb Impression",
  declaration: "Handwritten Declaration",
  postcard: "Postcard Photo",
};

export const docGuide: Record<DocKind, { prepare: string[]; mistakes: string[] }> = {
  photo: {
    prepare: [
      "Stand in front of a plain white or light wall, facing a window in daylight.",
      "Hold the phone at eye level about an arm's length away and look straight at the lens.",
      "Remove caps and dark glasses; keep both ears visible and a neutral expression.",
      "Use the normal camera mode — no beauty filters or portrait blur.",
    ],
    mistakes: [
      "Face too small because the photo was resized without cropping.",
      "Patterned or dark background, or another person in the frame.",
      "Old photo that no longer looks like you.",
      "File just over the KB limit because it was saved again at high quality.",
    ],
  },
  postcard: {
    prepare: [
      "Use the same session as your passport photo so both match.",
      "Leave space at the bottom for your name and the date of the photograph.",
      "Keep a plain light background and even lighting on your face.",
    ],
    mistakes: [
      "Name and date missing from the bottom of the photo.",
      "Using a cropped passport photo stretched to postcard shape.",
      "Different photo from the passport-size one.",
    ],
  },
  signature: {
    prepare: [
      "Sign on plain white unruled paper with a dark black (or blue) pen.",
      "Sign naturally in running hand, a little larger than usual.",
      "Photograph it from directly above in daylight, with no shadow on the paper.",
      "In the tool, crop tightly and raise the background removal until the paper is pure white.",
    ],
    mistakes: [
      "Signature in CAPITAL letters — rejected by SSC and banking forms.",
      "Faint pen strokes that vanish after compression.",
      "Ruled notebook lines visible in the image.",
      "File below the minimum KB because a clean signature compresses very small.",
    ],
  },
  thumb: {
    prepare: [
      "Use a stamp pad with blue or black ink — not too much ink.",
      "Roll the thumb once gently on white paper; do not slide it.",
      "Photograph from directly above and use the clean-background option.",
    ],
    mistakes: [
      "Smudged impression where the ridges are not visible.",
      "Using the right thumb when the form asks for the left.",
      "Coloured or textured paper behind the impression.",
    ],
  },
  declaration: {
    prepare: [
      "Copy the exact declaration text from the notification — do not change any words.",
      "Write in English in running hand on white paper with a black pen.",
      "Photograph the whole text from directly above and clean the background in the tool.",
    ],
    mistakes: [
      "Declaration written in CAPITAL letters.",
      "Text typed or written by someone else.",
      "Text paraphrased or partly missing.",
      "Image cut off at the edges so words are missing.",
    ],
  },
};

export interface DocPage {
  exam: Exam;
  doc: DocSpec;
  slug: string; // docSlug value
  path: string;
}

export function allDocPages(): DocPage[] {
  return exams.flatMap((exam) =>
    exam.docs.map((doc) => ({
      exam,
      doc,
      slug: docSlug[doc.kind],
      path: `/exams/${exam.slug}/${docSlug[doc.kind]}`,
    })),
  );
}

export function getDocPage(examSlug: string, slug: string) {
  return allDocPages().find((p) => p.exam.slug === examSlug && p.slug === slug);
}

/** The smallest "compress image to X KB" page that covers this max size. */
export function compressSizeFor(maxKB: number): number | null {
  const fit = compressSizes.find((s) => s >= maxKB);
  return fit ?? null;
}

/** Document pages whose max KB is served by a given compress page. */
export function docPagesForCompressSize(kb: number) {
  return allDocPages().filter((p) => compressSizeFor(p.doc.maxKB) === kb);
}
