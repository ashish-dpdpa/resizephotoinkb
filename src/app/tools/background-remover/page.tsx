import Link from "next/link";
import BackgroundRemover from "@/components/BackgroundRemover";
import ToolPage from "@/components/ToolPage";
import { pageMetadata } from "@/lib/seo";

const path = "/tools/background-remover";

export const metadata = pageMetadata({
  title: "Remove Background from Photo: Transparent PNG, Free",
  description:
    "Remove the background from your photo for free and download a transparent PNG, or add a plain white or coloured background. Runs on your device, so your photo is never uploaded.",
  path,
});

export default function BackgroundRemoverPage() {
  return (
    <ToolPage
      title="Photo Background Remover"
      path={path}
      kicker="Photo maker"
      intro="Remove the background from a photo and download it as a transparent PNG: a selfie or passport photo, a product shot, a logo or a coin on a plain background. If you need one, you can also add a plain white or coloured background. Everything runs on your own device, so the photo never leaves it."
      tool={<BackgroundRemover />}
      steps={[
        "Choose, drop or paste a photo. For a portrait, face the camera with your head and shoulders in the frame.",
        "The subject is detected and the background removed automatically: a plain background by its colour, a person with the portrait AI, anything else with the object AI. The first AI run takes longer because the model downloads.",
        "If part of the subject is missing, open “Not quite right? Adjust the cut-out” and pick what's in the photo. On a plain background, raise Colour tolerance to remove shadows, or lower it if the edges of your subject disappear.",
        "You get a transparent background by default. Optionally pick a plain colour instead: white for exam forms, or another colour if your form or visa asks for it.",
        "Download the transparent PNG. For an exam form, choose White, download the JPG and open it in the photo resizer to set the exact size and KB.",
      ]}
      faqs={[
        {
          q: "Is my photo uploaded anywhere?",
          a: "No. Plain backgrounds are removed directly in your browser. For other photos your browser downloads an AI model once and runs it on your own device. The photo isn't sent to us or anyone else.",
        },
        {
          q: "Which background colour do exam forms want?",
          a: "The exam notices we track ask for a plain white or light background, so white is the safe choice. Light blue is mostly for some visa and ID photos; use it only if your form says so.",
        },
        {
          q: "Does it work on products, logos and objects?",
          a: "Yes. On a plain background (a product on white, a logo, a coin), auto-detect spots it and removes that colour exactly, with clean edges. Objects on a busy background are found by the object AI. If the guess is wrong, choose what's in the photo under Adjust. For a scanned signature, use the signature resizer, which turns the paper pure white.",
        },
        {
          q: "The middle of my logo or letters still has background in it. How do I fix that?",
          a: "Open Adjust and tick “Also remove it inside the subject”. It removes the background colour everywhere, including gaps inside letters and shapes. Leave it off if the subject itself contains that colour.",
        },
        {
          q: "Why does my hair look cut off at the edges?",
          a: "Hair against a busy background is the hardest part. Open Adjust and move Edge softness towards Soft, and if you can, retake the photo against a plain wall with even light.",
        },
        {
          q: "Why can't the JPG be transparent?",
          a: "The JPG format doesn't support transparency, so a transparent result is saved on white. Use the PNG download if you need a see-through background.",
        },
      ]}
    >
      <h2>Background rules on exam forms</h2>
      <p>
        The exam notices we track ask for a recent colour photo on a plain white or light background. A patterned wall, a door or a room behind you is a common reason photos get rejected (see{" "}
        <Link href="/guides/why-exam-form-photos-get-rejected">why exam form photos get rejected</Link>). Removing the
        background fixes that, but it doesn&rsquo;t fix shadows on your face, a tilted head or an old photo, so start
        with a clear, well-lit picture.
      </p>
      <h2>Related</h2>
      <p>
        <Link href="/tools/photo-resizer">Photo resizer</Link> · <Link href="/tools/passport-size-photo-maker">Passport size photo maker</Link> ·{" "}
        <Link href="/tools/photo-with-name-and-date">Photo with name and date</Link> · <Link href="/tools/signature-resizer">Signature resizer</Link>
      </p>
    </ToolPage>
  );
}
