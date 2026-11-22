import Link from "next/link";
import ImageTool from "@/components/ImageTool";
import ToolPage from "@/components/ToolPage";
import { pageMetadata } from "@/lib/seo";

const path = "/tools/photo-with-name-and-date";

export const metadata = pageMetadata({
  title: "Photo with Name and Date Online: UPSC, NEET, TNPSC",
  description: "Add your name and the date of photograph below your photo, at the right size and KB for UPSC, NEET, TNPSC and other forms. Free, nothing uploaded.",
  path,
});

const presets = [
  { id: "upsc", label: "UPSC (20–200 KB)", width: 400, height: 500, minKB: 20, maxKB: 200 },
  { id: "neet-pass", label: "NEET passport", width: 300, height: 400, minKB: 10, maxKB: 200 },
  { id: "neet-post", label: "NEET postcard 4×6", width: 400, height: 600, minKB: 10, maxKB: 200 },
  { id: "passport", label: "3.5 × 4.5 cm", width: 276, height: 354, minKB: 20, maxKB: 50, dpi: 200 },
];

export default function PhotoNameDatePage() {
  return (
    <ToolPage
      title="Photo with Name and Date"
      path={path}
      kicker="Photo maker"
      intro="UPSC, NEET, TNPSC and several state commissions ask for a recent photo with your name and the date it was taken printed below it. Add your photo, type your name, and download a ready JPG."
      tool={<ImageTool presets={presets} captionMode printSheet fileBaseName="photo-name-date" />}
      steps={[
        "Choose your exam size, or Custom size.",
        "Add a recent photo with a plain light background.",
        "Type your name; the date of the photo is filled in, so change it if the photo was taken earlier.",
        "Check the preview and download the JPG (or a print sheet).",
      ]}
      faqs={[
        { q: "Which date goes on the photo: date of birth or date of photo?", a: "The date the photograph was taken, not your date of birth. Use the day you clicked the photo." },
        { q: "Should the name be in capital letters?", a: "Most guidelines show the name in capitals. The tool converts it to capitals automatically." },
        { q: "Is name and date compulsory for NEET?", a: "Recent NEET bulletins ask for the name and date on the postcard-size photo; guidance on the passport photo has varied. Check the current bulletin." },
        { q: "How recent must the photo be for UPSC?", a: "UPSC asks for a photo taken within the last 10 days of starting the application, with your name and date printed on it." },
      ]}
    >
      <h2>Exams that ask for name and date</h2>
      <ul>
        <li><Link href="/exams/upsc-cse/photo-size">UPSC Civil Services</Link>: photo with name and date of photograph</li>
        <li><Link href="/exams/neet-ug/postcard-photo-size">NEET UG postcard photo</Link>: name and date at the bottom</li>
        <li>TNPSC and several state PSCs: check your notification for the exact format</li>
      </ul>
      <p>
        The strip is white with black text and takes about a fifth of the photo height, which matches the samples most notices show.
        Want a plain white background too? Switch on <strong>White background</strong> in the tool.
      </p>
    </ToolPage>
  );
}
