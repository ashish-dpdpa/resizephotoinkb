import Link from "next/link";
import JoinPhotoSignature from "@/components/JoinPhotoSignature";
import ToolPage from "@/components/ToolPage";
import { pageMetadata } from "@/lib/seo";

const path = "/tools/join-photo-and-signature";

export const metadata = pageMetadata({
  title: "Join Photo and Signature Online — Merge Into One JPG",
  description: "Merge your photo and signature into a single JPG, one above the other or side by side, at the KB size your form needs. Free, private, works on phones.",
  path,
});

export default function JoinPage() {
  return (
    <ToolPage
      title="Join Photo and Signature"
      path={path}
      kicker="Photo maker"
      intro="Some application forms — including several India Post GDS, scholarship and state forms — ask for the photo and signature together in one image. Add both and download a single JPG."
      tool={<JoinPhotoSignature />}
      steps={[
        "Add your photo.",
        "Add a photo of your signature on white paper.",
        "Choose photo above signature or side by side, and the KB range.",
        "Download the joined JPG.",
      ]}
      faqs={[
        { q: "How do I merge a photo and signature into one image?", a: "Add both images above. The tool places the signature under (or beside) the photo, cleans the paper background and saves one JPG." },
        { q: "What size should the joined image be?", a: "Follow your notification. If none is given, about 350 px wide and 20–100 KB works for most portals." },
        { q: "Can I use a signature drawn on the phone?", a: "Yes — make it with the signature maker first and add that file here." },
      ]}
    >
      <h2>Related</h2>
      <p>
        Prepare each part first if needed: <Link href="/tools/photo-resizer">photo resizer</Link> ·{" "}
        <Link href="/tools/signature-resizer">signature resizer</Link> · <Link href="/tools/signature-maker">signature maker</Link>
      </p>
    </ToolPage>
  );
}
