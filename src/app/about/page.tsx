import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { exams } from "@/lib/exams";

export const metadata = pageMetadata({
  title: "About Us",
  description: `${siteConfig.name} is a small independent project that makes free, private tools for getting photos, signatures and documents accepted on Indian exam application forms.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <LegalPage title="About Us" path="/about">
      <p>
        {siteConfig.name} started with a very ordinary problem. You sit down to fill an exam form, everything goes fine
        until the upload step, and then the portal rejects your photo because it&apos;s 52 KB and the limit is 50. Or
        your signature is &quot;too small&quot;, which doesn&apos;t even sound like a real error. The notification is a
        40-page PDF, the rules aren&apos;t the same as last year, and half the resizer apps you find want you to upload
        your face to a server you know nothing about.
      </p>
      <p>
        So we built the tool we wanted: open it on any phone, pick your exam, and get a file that fits. That&apos;s
        still the whole idea.
      </p>

      <h2>What makes it different</h2>
      <p>
        <strong>Your files stay on your device.</strong> Resizing, compressing, cleaning a signature, building a PDF:
        all of it runs inside your browser. We never receive your photos or documents, so there&apos;s nothing for us to
        store or lose.
      </p>
      <p>
        <strong>It respects both ends of the limit.</strong> Most tools only get you under the maximum. A lot of forms
        also have a minimum, and a clean signature often comes out far below it. Ours handles both.
      </p>
      <p>
        <strong>Every exam page says where its numbers come from.</strong> We currently cover {exams.length} exams and
        documents. Each page names the notice the values come from, shows the date we last checked it, and links to the
        official website.
      </p>

      <h2>How we put the exam requirements together</h2>
      <p>
        We&apos;ll be straight about this. For each exam we collect the photo, signature and document rules from the
        latest notice as published or reported, and compare it with what the previous cycle asked for. Where different
        sources quote different numbers, and that happens more than you&apos;d expect, we say so on the page instead of
        quietly picking one. We test every preset against its limits in the tool before it goes live.
      </p>
      <p>
        What we can&apos;t promise is that a recruiting body won&apos;t change its rules next month. That&apos;s why
        every exam page tells you to confirm the numbers in the official notification before you submit, and why we
        keep a &quot;last checked&quot; date on each one.
      </p>

      <h2>Found a mistake?</h2>
      <p>
        If a notice has changed, a preset is off, or a tool misbehaves on your phone, please{" "}
        <Link href="/contact">write to us</Link>. Tell us the exam and what you saw, and we&apos;ll fix the page. These
        reports are the most useful thing anyone can send us.
      </p>

      <h2>Independence</h2>
      <p>
        {siteConfig.name} is independent. We aren&apos;t connected to SSC, UPSC, IBPS, SBI, the Railway Recruitment
        Boards, UPPRPB, NTA, CBSE or any other government or examination body. The site is free to use and is supported
        by advertising.
      </p>
    </LegalPage>
  );
}
