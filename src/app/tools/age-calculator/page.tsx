import Link from "next/link";
import AgeCalculator from "@/components/AgeCalculator";
import ToolPage from "@/components/ToolPage";
import { pageMetadata } from "@/lib/seo";

const path = "/tools/age-calculator";
const title = "Age Calculator for Government Exams";

export const metadata = pageMetadata({
  title: "Age Calculator for Government Exams — Age as on Cut-off Date",
  description:
    "Calculate your exact age on an exam's cut-off date and check eligibility with OBC, SC/ST and PwBD relaxation. Shows the allowed date-of-birth range.",
  path,
});

export default function AgeCalculatorPage() {
  return (
    <ToolPage
      title={title}
      path={path}
      intro="Government notifications fix your age “as on” a particular date. Enter your date of birth and that cut-off date to see your exact age, whether you are within the limit, and the date-of-birth range the notice allows."
      tool={<AgeCalculator />}
      steps={[
        "Enter your date of birth exactly as it appears on your 10th certificate.",
        "Enter the cut-off date from the notification — it is usually written as “age as on 01.08.2026” or similar.",
        "Type the minimum and maximum age for the post, and choose your category.",
        "Read your age and eligibility. The date-of-birth range is the easiest way to double-check against the notice.",
      ]}
      faqs={[
        {
          q: "Which date of birth should I use?",
          a: "Use the date of birth recorded in your matriculation (10th) certificate. Most recruitment bodies accept only that record.",
        },
        {
          q: "Are the relaxation years the same for every exam?",
          a: "No. The values in this calculator are the typical central government relaxations. State governments and some posts use different values — always check your notification.",
        },
        {
          q: "If my maximum age is 27, can I apply on the day I turn 28?",
          a: "Usually not. A maximum age of 27 means you must not have completed 28 years on the cut-off date. The calculator follows this rule and shows the exact range of birth dates allowed.",
        },
      ]}
    >
      <h2>How exam age limits work</h2>
      <p>
        When a notice says the age limit is 18–27 years as on 1 August, it means you must have turned 18 by that date
        and must not have turned 28. Relaxation is added to the upper limit only. Ex-servicemen and some departmental
        candidates get different relaxations that are calculated separately, so read that section of your notice.
      </p>
      <p>
        Next step: prepare your photo and signature with the <Link href="/tools/photo-resizer">photo resizer</Link>.
      </p>
    </ToolPage>
  );
}
