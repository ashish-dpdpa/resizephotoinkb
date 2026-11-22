import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${siteConfig.name} handles your data, cookies and advertising. Images you process are never uploaded.`,
  path: "/privacy-policy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" path="/privacy-policy" updated="22 November 2026">
      <p>
        This policy explains what information {siteConfig.name} ({siteConfig.url}) collects, how it is used and the
        choices you have. By using this website you agree to this policy.
      </p>

      <h2>Files you process with our tools</h2>
      <p>
        Photos, signatures and other files you open in our tools are processed entirely inside your web browser on
        your own device. They are not uploaded to our servers, we cannot see them, and we do not store them. When you
        close the page, the files are gone from the tool.
      </p>

      <h2>Information collected automatically</h2>
      <p>
        Like most websites, our hosting provider may record standard log information such as your IP address, browser
        type, pages visited and the time of the visit. We use this only to keep the site secure and working.
      </p>

      <h2>Cookies and advertising</h2>
      <p>
        We use Google AdSense to show advertisements. Google and its partners use cookies to serve ads based on your
        previous visits to this and other websites. Google&apos;s use of advertising cookies enables it and its
        partners to serve ads to you based on your visits to this site and/or other sites on the Internet.
      </p>
      <ul>
        <li>
          You can opt out of personalised advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" rel="nofollow noopener" target="_blank">Google Ads Settings</a>.
        </li>
        <li>
          You can also opt out of some third-party vendors&apos; use of cookies for personalised advertising at{" "}
          <a href="https://www.aboutads.info/choices/" rel="nofollow noopener" target="_blank">www.aboutads.info</a>.
        </li>
        <li>
          Learn how Google uses information from sites that use its services at{" "}
          <a href="https://policies.google.com/technologies/partner-sites" rel="nofollow noopener" target="_blank">
            policies.google.com/technologies/partner-sites
          </a>.
        </li>
      </ul>
      <p>We may also use privacy-friendly analytics to understand which pages are useful. You can block or delete cookies in your browser settings at any time.</p>

      <h2>Children</h2>
      <p>This website is meant for students preparing applications and is not directed at children under 13. We do not knowingly collect personal information from children.</p>

      <h2>Your rights</h2>
      <p>
        Because we do not ask you to create an account or submit personal details, we generally hold no personal data
        about you. If you email us, we keep your message only as long as needed to reply. You can ask us to delete it at
        any time.
      </p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy from time to time. The date at the top shows when it was last changed.</p>

      <h2>Contact</h2>
      <p>
        Questions about this policy: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </LegalPage>
  );
}
