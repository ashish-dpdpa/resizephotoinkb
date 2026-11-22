import Link from "next/link";
import ImageTool from "@/components/ImageTool";
import ToolPage from "@/components/ToolPage";
import { pageMetadata } from "@/lib/seo";

const path = "/tools/passport-size-photo-maker";

export const metadata = pageMetadata({
  title: "Passport Size Photo Maker Online: White Background",
  description: "Make a 3.5 × 4.5 cm passport size photo with a white background on your phone, then download it or a 4×6 print sheet. Free, nothing uploaded.",
  path,
});

const presets = [
  { id: "in-passport", label: "India 3.5 × 4.5 cm", width: 413, height: 531, minKB: 10, maxKB: 250, dpi: 300 },
  { id: "exam", label: "Exam forms (200 DPI)", width: 276, height: 354, minKB: 20, maxKB: 50, dpi: 200 },
  { id: "2x2", label: "2 × 2 inch", width: 600, height: 600, minKB: 10, maxKB: 240, dpi: 300 },
];

export default function PassportPhotoPage() {
  return (
    <ToolPage
      title="Passport Size Photo Maker"
      path={path}
      kicker="Photo maker"
      intro="Take a photo against any wall, turn the background white on your device, crop it to passport size, and download a single photo for forms or a 4×6 sheet to print at a photo shop."
      tool={<ImageTool presets={presets} printSheet captionMode={false} fileBaseName="passport-photo" />}
      steps={[
        "Choose the size. 3.5 × 4.5 cm is the Indian passport size.",
        "Add a front-facing photo taken in good light.",
        "Turn on White background, then drag and zoom so your face fills about 70–80% of the height.",
        "Download the photo, or the 4×6 inch print sheet with several copies.",
      ]}
      faqs={[
        { q: "What is passport size photo size in India?", a: "3.5 cm wide × 4.5 cm tall. At 300 DPI that is 413 × 531 pixels." },
        { q: "How many passport photos fit on a 4×6 print?", a: "Eight at 3.5 × 4.5 cm. Most photo shops print a 4×6 for a few rupees." },
        { q: "Is the white background done online?", a: "It runs on your device. The first time, the page downloads a small AI model; your photo itself is never uploaded." },
        { q: "Can I use this for an Indian passport application?", a: "Passport Seva has its own detailed photo rules. Check them before you apply; this tool is mainly for exam and job forms." },
      ]}
    >
      <h2>Tips for a good passport photo</h2>
      <ul>
        <li>Face the camera straight, eyes open, mouth closed, both ears visible.</li>
        <li>Light from the front: sit facing a window. Avoid shadows on the face.</li>
        <li>Remove caps and dark glasses. Keep hair away from the face.</li>
      </ul>
      <p>
        Need name and date printed under the photo? Use <Link href="/tools/photo-with-name-and-date">photo with name and date</Link>. Need an
        exam size? Pick your exam on the <Link href="/exams">exams page</Link>.
      </p>
    </ToolPage>
  );
}
