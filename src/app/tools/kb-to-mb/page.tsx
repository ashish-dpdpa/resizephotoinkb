import Link from "next/link";
import ToolPage from "@/components/ToolPage";
import { SizeConverter } from "@/components/UnitConverter";
import { pageMetadata } from "@/lib/seo";

const path = "/tools/kb-to-mb";

export const metadata = pageMetadata({
  title: "KB to MB Converter (and MB to KB): 1024 or 1000",
  description: "Convert KB to MB, MB to KB and bytes in both 1024 and 1000 based units. Check whether your file fits a form's 50 KB, 200 KB or 1 MB upload limit.",
  path,
});

export default function KbToMbPage() {
  return (
    <ToolPage
      title="KB to MB Converter"
      path={path}
      kicker="Converter"
      intro="Forms state limits in KB or MB, while your phone may show file size in a different unit. Type a size in any box to convert it."
      tool={<SizeConverter />}
      steps={[
        "Choose whether 1 KB means 1024 bytes (Windows, most portals) or 1000 bytes (some phones and Macs).",
        "Type a size in bytes, KB, MB or GB.",
        "Read the other units instantly.",
        "If your file is too big, compress it with one of the compress tools.",
      ]}
      faqs={[
        { q: "How many KB is 1 MB?", a: "1024 KB in binary units, which Windows and most portals use. Some phones and Macs use 1000 KB." },
        { q: "Is 2 MB under a 500 KB limit?", a: "No. 2 MB is about 2048 KB, four times the limit. Compress it to under 500 KB first." },
        { q: "Why does my phone show a different size from the portal?", a: "Phones often count 1 KB as 1000 bytes while portals count 1024. Stay a few KB inside the limit to be safe." },
      ]}
    >
      <h2>Common upload limits</h2>
      <table>
        <thead>
          <tr><th>Limit</th><th>Bytes (1024)</th><th>MB</th></tr>
        </thead>
        <tbody>
          {[20, 50, 100, 200, 500, 1024, 2048].map((kb) => (
            <tr key={kb}>
              <td>{kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`}</td>
              <td>{(kb * 1024).toLocaleString("en-IN")}</td>
              <td>{(kb / 1024).toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        File too large? <Link href="/tools/compress-image-to-50kb">Compress to 50 KB</Link>,{" "}
        <Link href="/tools/compress-image-to-100kb">100 KB</Link> or <Link href="/tools/compress-image-to-200kb">200 KB</Link>.
      </p>
    </ToolPage>
  );
}
