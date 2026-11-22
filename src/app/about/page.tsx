import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About Us",
  description: `${siteConfig.name} builds free, private tools that help Indian students prepare photos, signatures and documents for government exam application forms.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <LegalPage title="About Us" path="/about">
      <p>
        {siteConfig.name} is a free website that helps students and job seekers in India prepare the images that
        online application forms ask for — photographs, signatures, thumb impressions and handwritten declarations
        — in the exact size, pixel dimensions and file format each exam requires.
      </p>
      <h2>Why we built this</h2>
      <p>
        Every form season, thousands of applications are delayed because a photo is 52 KB instead of 50 KB, or a
        signature is too small to be accepted. Exam notifications are long PDFs, the rules change from year to year,
        and many resizer apps upload your personal photo to unknown servers. We wanted a simple tool that works on
        any phone, explains the rules in plain language, and keeps your files private.
      </p>
      <h2>How our tools work</h2>
      <ul>
        <li>All processing happens inside your browser using your device. Your photos are never uploaded to us.</li>
        <li>Exam presets are taken from the latest official notifications and dated, so you know when they were last checked.</li>
        <li>Every exam page links to the official website so you can confirm the requirement yourself.</li>
      </ul>
      <h2>Our editorial standards</h2>
      <p>
        Our guides are written and reviewed by the {siteConfig.author.name}. We read the official notification for
        each exam, compare it with the previous year, and test the tools against the stated limits before publishing.
        When sources disagree we say so clearly instead of guessing. If you spot an error, please{" "}
        <Link href="/contact">tell us</Link> and we will correct it quickly.
      </p>
      <h2>Independence</h2>
      <p>
        {siteConfig.name} is an independent website. We are not connected to SSC, UPSC, IBPS, the Railway Recruitment
        Boards, UPPRPB, NTA or any other government organisation. Always follow the official notification for your exam.
      </p>
    </LegalPage>
  );
}
