import Link from "next/link";
import SignatureMaker from "@/components/SignatureMaker";
import ToolPage from "@/components/ToolPage";
import { pageMetadata } from "@/lib/seo";

const path = "/tools/signature-maker";
const title = "Online Signature Maker";

export const metadata = pageMetadata({
  title: "Online Signature Maker — Draw & Download Signature JPG",
  description:
    "Draw your signature with your finger or mouse and download it as a JPG sized for online forms (140×60 px, 10–20 KB and more). Free, no sign-up.",
  path,
});

export default function SignatureMakerPage() {
  return (
    <ToolPage
      title={title}
      path={path}
      intro="Draw your signature on screen and download it as a clean JPG on a white background, already sized for common exam and job application forms."
      tool={<SignatureMaker />}
      steps={[
        "Choose black or blue ink and a pen thickness.",
        "Sign inside the box using your finger, a stylus or the mouse. Sign large and naturally.",
        "Pick the output size your form asks for and tap Create JPG.",
        "Download the file and upload it to the form.",
      ]}
      faqs={[
        {
          q: "Is a drawn signature accepted by government exam forms?",
          a: "Many exams ask for a signature made on white paper with a pen and then scanned. Check your notification. If it requires a paper signature, use our signature resizer instead.",
        },
        {
          q: "Does the tool save my signature?",
          a: "No. The drawing stays on your device and disappears when you close the page.",
        },
      ]}
    >
      <h2>When to use a drawn signature</h2>
      <p>
        A drawn signature is handy for private job portals, college forms, rental agreements or any form that only
        needs a clear image of your signature. For SSC, IBPS, UPSC and railway forms, a pen-on-paper signature
        photographed and cleaned with the <Link href="/tools/signature-resizer">signature resizer</Link> is the safest
        choice, because it matches the signature you will make in the exam hall.
      </p>
    </ToolPage>
  );
}
