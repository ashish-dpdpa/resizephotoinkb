import Link from "next/link";
import ImageTool from "@/components/ImageTool";
import ToolPage from "@/components/ToolPage";
import { pageMetadata } from "@/lib/seo";
import { presetsFor, STANDARD_SIGNATURE } from "@/lib/presets";

const path = "/tools/signature-resizer";
const title = "Signature Resizer for Online Forms";

export const metadata = pageMetadata({
  title: "Signature Resizer: Resize Signature to 10–20 KB, 140×60 px",
  description:
    "Resize a scanned or photographed signature for SSC, IBPS, RRB, UP Police and NEET forms. Removes the grey paper background and hits the exact KB range.",
  path,
});

export default function SignatureResizerPage() {
  return (
    <ToolPage
      title={title}
      path={path}
      intro="Photograph your signature on white paper, pick your exam, and get a clean, sharp JPG at the right pixel size and KB range, including forms that need a minimum of 30 KB."
      tool={<ImageTool presets={[STANDARD_SIGNATURE, ...presetsFor(["signature", "thumb", "declaration"])]} fileBaseName="signature" />}
      steps={[
        "Sign on plain white paper with a black (or blue) pen. Sign the way you normally do, not in capital letters.",
        "Take a photo of the signature in good light, holding the phone straight above the paper.",
        "Keep Standard size (140 × 60 px, 10–20 KB) or choose your exam preset, then upload the photo.",
        "Use Zoom and Move so the signature fills the frame. Increase the background removal strength until the paper turns pure white.",
        "Download the JPG once the result shows “within limit”.",
      ]}
      faqs={[
        {
          q: "Why is my signature rejected for being too small in KB?",
          a: "Some forms, like RRB NTPC and UP Police, set a minimum of 30 KB. A small black-and-white image compresses to only a few KB. Our tool pads the file to the minimum without changing the image.",
        },
        {
          q: "Will cleaning the background change my signature?",
          a: "It only turns light pixels (the paper) white and keeps the dark ink strokes. If thin strokes disappear, lower the removal strength.",
        },
        {
          q: "Can I make my signature on the phone instead?",
          a: "Yes, use our signature maker to draw it with your finger. Some exams require a signature on paper, so check your notification.",
        },
      ]}
    >
      <h2>Tips for a signature that gets accepted first time</h2>
      <ul>
        <li>Use a fresh pen with dark ink; faint ballpoint lines can vanish when the image is compressed.</li>
        <li>Avoid shadows from your hand or phone. Shoot near a window in daylight.</li>
        <li>Leave a small white margin around the signature so it is not cut off.</li>
        <li>Use the same signature in the exam hall and on every document.</li>
      </ul>
      <p>
        No paper handy? Try the <Link href="/tools/signature-maker">online signature maker</Link>.
      </p>
    </ToolPage>
  );
}
