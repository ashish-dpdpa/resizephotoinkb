import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact Us",
  description: `Contact the ${siteConfig.name} team to report an outdated exam requirement, suggest a new tool or ask a question.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <LegalPage title="Contact Us" path="/contact">
      <p>We read every message. Write to us if you want to:</p>
      <ul>
        <li>Report an exam requirement that has changed in a new notification</li>
        <li>Request a preset for an exam we do not cover yet</li>
        <li>Report a problem with one of the tools (please mention your phone or browser)</li>
        <li>Ask about advertising or partnerships</li>
      </ul>
      <p>
        Email: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
      <p>We usually reply within two working days. Please do not send us your photos or personal documents.</p>
    </LegalPage>
  );
}
