import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description: `The terms that apply when you use the ${siteConfig.name} website and its free photo, signature and file tools for exam application forms.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" path="/terms" updated="22 November 2026">
      <p>By using {siteConfig.name} you agree to these terms. If you do not agree, please do not use the website.</p>
      <h2>Use of the tools</h2>
      <p>
        Our tools are free for personal use. You are responsible for the files you process and for checking that the
        result meets the requirements of the form you submit. Do not use the tools to create misleading or forged documents.
      </p>
      <h2>Accuracy of information</h2>
      <p>
        We try hard to keep exam requirements up to date, but exam bodies can change them at any time. The official
        notification always takes priority over anything on this website. See our <Link href="/disclaimer">disclaimer</Link>.
      </p>
      <h2>Intellectual property</h2>
      <p>The text, design and code of this website belong to {siteConfig.name}. You may link to our pages but may not copy our content in bulk.</p>
      <h2>No warranty</h2>
      <p>The website is provided &quot;as is&quot; without any warranty. We are not liable for any loss arising from rejected applications, missed deadlines or use of the tools.</p>
      <h2>Third-party links and ads</h2>
      <p>We link to official websites and show third-party advertisements. We are not responsible for the content of external sites.</p>
      <h2>Changes</h2>
      <p>We may update these terms. Continued use of the website after changes means you accept the new terms.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India.</p>
    </LegalPage>
  );
}
