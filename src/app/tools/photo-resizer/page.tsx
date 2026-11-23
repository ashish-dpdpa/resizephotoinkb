import Link from "next/link";
import ImageTool from "@/components/ImageTool";
import ToolPage from "@/components/ToolPage";
import { pageMetadata } from "@/lib/seo";
import { presetsFor, STANDARD_PHOTO } from "@/lib/presets";
import { exams } from "@/lib/exams";

const path = "/tools/photo-resizer";
const title = "Photo Resizer for Exam Forms";

export const metadata = pageMetadata({
  title: "Photo Resizer for Exam Forms: Resize to Exact KB & Pixels",
  description:
    "Resize your passport photo to the exact pixel size and KB range for UPSC, IBPS, NEET and other exam forms. Crop, zoom and download a JPG. Free and private.",
  path,
});

export default function PhotoResizerPage() {
  // Opens on a general size; exam presets follow for anyone who knows their exam.
  const presets = [STANDARD_PHOTO, ...presetsFor(["photo", "postcard"])];
  return (
    <ToolPage
      title={title}
      path={path}
      intro="It starts on the most common exam size (200 × 230 px, 20–50 KB). Pick your exam if it's listed, choose a photo from your phone or computer, and download a JPG that matches the required width, height and file size. Your photo never leaves your device."
      tool={<ImageTool presets={presets} fileBaseName="photo" />}
      steps={[
        "Keep Standard size, select your exam from the presets, or tap Edit and type the pixel size and KB range from your notification.",
        "Tap the upload box and pick a clear, recent photo with a plain light background.",
        "Use Zoom and the Move sliders so your face is centred and fills most of the frame.",
        "Check that the result says “within limit”, then tap Download JPG and upload that file to the form.",
      ]}
      faqs={[
        {
          q: "Is my photo uploaded to your server?",
          a: "No. The resizing and compression run inside your browser using your device. Nothing is sent to us.",
        },
        {
          q: "Why does the form reject my photo even though it looks fine?",
          a: "Forms check the file size in KB and sometimes the pixel size. A photo can look perfect but be 60 KB when the limit is 50 KB. This tool targets both values at once.",
        },
        {
          q: "What if my exam is not in the list?",
          a: "Choose Custom size and enter the width, height and KB range from your notification. You can also find guides for more exams in our guides.",
        },
        {
          q: "Can I use a photo taken on my phone?",
          a: "Yes. Stand in front of a plain light wall in daylight, hold the phone at eye level and keep your face straight. Then resize it here.",
        },
      ]}
    >
      <h2>Exam photo sizes at a glance</h2>
      <p>These are the presets built into the tool. Open an exam page for the full rules and the official source.</p>
      <ul>
        {exams.map((e) => {
          const photo = e.docs.find((d) => d.kind === "photo");
          return (
            <li key={e.slug}>
              <Link href={`/exams/${e.slug}`}>{e.name}</Link>:{" "}
              {e.livePhoto
                ? "photo is captured live during the application, so only the signature is uploaded."
                : photo
                  ? `${photo.minKB}–${photo.maxKB} KB, preset ${photo.width} × ${photo.height} px.`
                  : "see exam page."}
            </li>
          );
        })}
      </ul>
      <p>
        Need to shrink a photo without changing its pixel size? Use the{" "}
        <Link href="/tools/compress-image-to-50kb">compress image to 50 KB</Link> tool instead.
      </p>
    </ToolPage>
  );
}
