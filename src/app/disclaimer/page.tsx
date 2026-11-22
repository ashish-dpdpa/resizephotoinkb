import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Disclaimer",
  description: `${siteConfig.name} is an independent website and is not affiliated with any government body. Always check the official notification.`,
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" path="/disclaimer" updated="22 November 2026">
      <p>
        {siteConfig.name} is an independent informational website. We are <strong>not</strong> affiliated with,
        endorsed by or connected to the Staff Selection Commission, Union Public Service Commission, IBPS, the Railway
        Recruitment Boards, UPPRPB, the National Testing Agency or any other government or examination body. Exam
        names are used only to describe which requirements a tool or guide relates to.
      </p>
      <p>
        Photo, signature and document requirements are compiled from official notifications and dated on each page.
        They can change without notice. <strong>Always confirm the requirement in the official notification or on the
        official website before submitting your application.</strong>
      </p>
      <p>
        We are not responsible for rejected applications, missed deadlines or any other loss resulting from the use of
        information or tools on this website.
      </p>
    </LegalPage>
  );
}
