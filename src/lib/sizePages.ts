// Data for every size-based landing page under /tools/<slug>:
//   "max"       → compress image to X KB
//   "range"     → resize to between X and Y KB (photo or signature)
//   "dimension" → resize to a physical size such as 3.5 × 4.5 cm
// Each entry carries its own copy so pages are not interchangeable.

export type Subject = "photo" | "signature" | "image";

interface Base {
  slug: string;
  title: string; // H1 and tool name
  metaTitle: string; // ≤ ~60 chars, keyword first
  description: string;
  intro: string;
  uses: string[];
  note: string;
  faqs: { q: string; a: string }[];
}

export interface MaxPage extends Base {
  kind: "max";
  kb: number;
  minKB: number; // typical minimum to suggest
}
export interface RangePage extends Base {
  kind: "range";
  subject: Subject;
  minKB: number;
  maxKB: number;
}
export interface DimensionPage extends Base {
  kind: "dimension";
  subject: Subject;
  widthCm: number;
  heightCm: number;
  dpi: number;
  minKB: number;
  maxKB: number;
}
export type SizePage = MaxPage | RangePage | DimensionPage;

const px = (cm: number, dpi: number) => Math.round((cm / 2.54) * dpi);

function maxPage(kb: number, uses: string[], note: string, minKB: number): MaxPage {
  return {
    kind: "max",
    kb,
    minKB,
    slug: `compress-image-to-${kb}kb`,
    title: `Compress Image to ${kb} KB`,
    metaTitle: `Compress Image to ${kb} KB Online: JPG, PNG to ${kb}KB`,
    description: `Reduce any photo or signature to under ${kb} KB in seconds, without uploading it. Keeps it sharp by resizing pixels before lowering quality.`,
    intro: `Choose a JPG, PNG or WebP image and get a JPG under ${kb} KB with the best quality that fits. The image is processed on your device and never uploaded.`,
    uses,
    note,
    faqs: [
      {
        q: `How do I reduce a photo to ${kb} KB without losing quality?`,
        a: `Every compression removes some detail. This tool keeps JPEG quality at 50% or higher and reduces the pixel size instead when it has to, so the result stays sharp rather than blocky.`,
      },
      {
        q: "Does this change the width and height of my image?",
        a: `Only if needed to get under ${kb} KB. To set an exact pixel or cm size, use the photo resizer instead.`,
      },
      {
        q: "Can I compress a PDF here?",
        a: "This tool works with images. If your form asks for a PDF, compress the image first and then convert it to PDF.",
      },
    ],
  };
}

export const maxPages: MaxPage[] = [
  maxPage(10, ["Signatures for older state PSC and university forms", "Thumb impressions with a 10 KB cap", "Very small profile pictures"], "10 KB is extremely small. A colour photo will be reduced to a few hundred pixels wide. Signatures on white paper compress much better than photos.", 4),
  maxPage(15, ["Signature uploads with a 15 KB cap on state portals", "Scholarship portals that limit photos to 15 KB", "Small ID photos for coaching registrations"], "15 KB fits a passport photo of about 200 × 230 px with good quality, or almost any clean signature.", 5),
  maxPage(20, ["Signatures for SSC, IBPS and SBI forms (10–20 KB)", "Photos for some state recruitment and scholarship portals", "Small ID photos for college admission forms"], "A 200 × 230 px passport photo usually fits under 20 KB with good quality. Larger photos are scaled down automatically.", 10),
  maxPage(30, ["NEET signature (4–30 KB)", "CTET signature (3–30 KB)", "PAN card style photos with a 30 KB cap"], "30 KB is a comfortable size for a passport photo up to about 300 × 400 px.", 10),
  maxPage(40, ["Portals that cap photos at 40 KB", "Thumb impressions and signatures with a 40 KB limit", "Hall-ticket and ID card photo uploads"], "40 KB leaves room for a clear passport photo around 350 × 450 px.", 10),
  maxPage(50, ["IBPS and SBI photos (20–50 KB)", "Thumb impressions for banking forms", "Most state government job portals"], "50 KB is the most common upper limit in Indian exam forms. If your form also has a minimum like 20 KB, set it in the Min box.", 20),
  maxPage(100, ["UPSC signature sheet (20–100 KB)", "IBPS and SBI handwritten declaration (50–100 KB)", "CTET photo (10–100 KB)"], "At 100 KB most phone photos only need light compression, and the original pixel size is often kept.", 20),
  maxPage(200, ["UPSC photo (20–200 KB)", "NEET passport and postcard photos (10–200 KB)", "Passport Seva and visa portal photos"], "200 KB keeps most phone photos sharp. The tool keeps your original pixel size unless the file cannot fit.", 10),
  maxPage(500, ["Scanned certificates saved as JPG", "Job portals and resumes with a 500 KB image limit", "College admission document uploads"], "500 KB is generous: most phone photos need only a small quality reduction and keep their full resolution.", 0),
];

export const rangePages: RangePage[] = [
  {
    kind: "range",
    subject: "signature",
    minKB: 10,
    maxKB: 20,
    slug: "signature-resize-10-to-20-kb",
    title: "Resize Signature to 10–20 KB",
    metaTitle: "Signature Resize 10 to 20 KB: Free Online Converter",
    description: "Convert your signature to a JPG between 10 KB and 20 KB for SSC, IBPS, SBI and other forms. Cleans the paper background and never uploads your file.",
    intro: "The 10–20 KB window is the most common signature rule in Indian exam forms. Upload a photo of your signature and get a clean JPG that lands inside it: not too big and not too small.",
    uses: ["SSC CGL, CHSL, MTS and GD signature", "IBPS PO and Clerk signature", "SBI PO and Clerk signature"],
    note: "A clean signature often compresses to only 4–8 KB, which forms reject as too small. The tool pads the file to reach 10 KB without changing how it looks.",
    faqs: [
      { q: "How do I make my signature between 10 and 20 KB?", a: "Upload a clear photo of your signature on white paper. The tool compresses it under 20 KB and, if it falls below 10 KB, raises it to the minimum with invisible padding." },
      { q: "What pixel size should a 10–20 KB signature be?", a: "IBPS and SBI prefer 140 × 60 px; SSC describes about 6 × 2 cm. Open your exam page for a preset with the exact size." },
      { q: "Why does the form say my signature is too small?", a: "Because the file is under 10 KB. Black ink on white paper compresses very well, so small signatures often fall below the minimum." },
    ],
  },
  {
    kind: "range",
    subject: "photo",
    minKB: 20,
    maxKB: 50,
    slug: "resize-photo-20kb-to-50kb",
    title: "Resize Photo to 20–50 KB",
    metaTitle: "Resize Photo 20 KB to 50 KB Online: Free Converter",
    description: "Convert a photo to a JPG between 20 KB and 50 KB for IBPS, SBI and state exam forms. Keeps it sharp, sets the minimum too, and never uploads it.",
    intro: "Banking and many state recruitment forms want the photo between 20 KB and 50 KB. Upload any phone photo and download a JPG that fits that window.",
    uses: ["IBPS PO and Clerk photo", "SBI PO and Clerk photo", "Left thumb impression for banking forms"],
    note: "For banking forms also set the pixel size to 200 × 230 px. The IBPS and SBI exam pages have that preset ready.",
    faqs: [
      { q: "How do I convert a photo to 20–50 KB?", a: "Upload it above. The tool finds the best quality under 50 KB and makes sure the file is at least 20 KB." },
      { q: "My photo is 3 MB. Will it still work?", a: "Yes. Large phone photos are reduced in pixel size first so the result stays clear at 20–50 KB." },
      { q: "Is 20–50 KB the same as 20 to 50 kb in pixels?", a: "No. KB is file size, pixels are dimensions. Many forms ask for both. For IBPS and SBI that is 200 × 230 px and 20–50 KB." },
    ],
  },
  {
    kind: "range",
    subject: "signature",
    minKB: 30,
    maxKB: 50,
    slug: "signature-resize-30-to-50-kb",
    title: "Resize Signature to 30–50 KB",
    metaTitle: "Signature Resize 30 to 50 KB: Railway & UP Police",
    description: "Make a signature JPG between 30 KB and 50 KB for RRB NTPC, RRB Group D and UP Police forms. Pads small files to the minimum without changing the image.",
    intro: "Railway and UP Police forms set an unusually high minimum of 30 KB for the signature. A normal signature image is far smaller, so it gets rejected. This tool fixes both ends.",
    uses: ["RRB NTPC signature (30–49 KB)", "RRB Group D signature", "UP Police Constable signature (30–50 KB)"],
    note: "For railway forms set the maximum to 49 KB rather than 50, because the reported limit is 30–49 KB.",
    faqs: [
      { q: "How can a small signature be 30 KB?", a: "The tool adds invisible padding inside the JPG file so its size reaches 30 KB. The picture itself is unchanged and portals read it normally." },
      { q: "Is this safe to upload?", a: "Yes. The padding is a standard JPEG comment block that image viewers and portals ignore." },
    ],
  },
  {
    kind: "range",
    subject: "signature",
    minKB: 10,
    maxKB: 50,
    slug: "signature-resize-10-to-50-kb",
    title: "Resize Signature to 10–50 KB",
    metaTitle: "Signature Resize 10 to 50 KB: Free Online Tool",
    description: "Convert a signature to a JPG between 10 KB and 50 KB for state PSC, university and job portals. Cleans the background; nothing is uploaded.",
    intro: "Many state portals and university forms accept a signature anywhere from 10 KB to 50 KB. Upload a photo of your signature and get a clean JPG in that range.",
    uses: ["State PSC application forms", "University and college admission portals", "Job portals with a 10–50 KB signature rule"],
    note: "A wider range means you can keep more detail: the tool aims for the best quality under 50 KB.",
    faqs: [
      { q: "Which exams use a 10–50 KB signature?", a: "Several state commissions and university portals. Always check your notification; for SSC and banking the limit is 10–20 KB." },
      { q: "Should I sign in black or blue?", a: "Use what the notice asks for. Black ink on white paper gives the cleanest result." },
    ],
  },
  {
    kind: "range",
    subject: "image",
    minKB: 50,
    maxKB: 100,
    slug: "resize-image-50kb-to-100kb",
    title: "Resize Image to 50–100 KB",
    metaTitle: "Resize Image 50 KB to 100 KB Online: Free",
    description: "Convert any image to a JPG between 50 KB and 100 KB, handy for handwritten declarations, documents and larger photos. Runs in your browser.",
    intro: "The 50–100 KB range is used for handwritten declarations in banking forms and for document photos on many portals. Upload your image and download a JPG inside the range.",
    uses: ["IBPS and SBI handwritten declaration", "Scanned certificates saved as JPG", "Photos for portals with a 50 KB minimum"],
    note: "For the banking declaration also set 800 × 400 px. The IBPS and SBI declaration pages have that preset.",
    faqs: [
      { q: "How do I increase an image to 50 KB?", a: "If the compressed image is below 50 KB, the tool pads the file to the minimum. It does not stretch or blur the picture." },
      { q: "Can I use this for a scanned document?", a: "Yes, as long as the form accepts JPG. Turn on 'Clean paper background' in the photo resizer for crisp handwriting." },
    ],
  },
];

export const dimensionPages: DimensionPage[] = [
  {
    kind: "dimension",
    subject: "photo",
    widthCm: 3.5,
    heightCm: 4.5,
    dpi: 200,
    minKB: 20,
    maxKB: 50,
    slug: "resize-photo-3-5-x-4-5-cm",
    title: "Resize Photo to 3.5 × 4.5 cm",
    metaTitle: "Resize Photo to 3.5 x 4.5 cm Online (Passport Size)",
    description: "Resize a photo to 3.5 × 4.5 cm passport size for exam and government forms. Set DPI and KB, crop your face, and download a JPG. Free and private.",
    intro: "3.5 × 4.5 cm is the standard Indian passport-photo size used in many exam notifications. Choose your photo, position your face, and download a JPG at the right physical size and KB range.",
    uses: ["Exam forms that state 3.5 × 4.5 cm", "CTET photo", "Older SSC and state forms that ask for passport size"],
    note: `At 200 DPI, 3.5 × 4.5 cm is ${px(3.5, 200)} × ${px(4.5, 200)} px; at 300 DPI it is ${px(3.5, 300)} × ${px(4.5, 300)} px. Change the DPI in the tool and the pixels update automatically.`,
    faqs: [
      { q: "What is 3.5 × 4.5 cm in pixels?", a: `${px(3.5, 200)} × ${px(4.5, 200)} px at 200 DPI, or ${px(3.5, 300)} × ${px(4.5, 300)} px at 300 DPI.` },
      { q: "Which DPI should I use?", a: "Use the DPI your notice gives. If none is given, 200 DPI keeps the file small and prints clearly at passport size." },
      { q: "Is 3.5 × 4.5 cm the same as passport size?", a: "Yes, in India passport-size photos are 3.5 cm wide and 4.5 cm tall." },
    ],
  },
  {
    kind: "dimension",
    subject: "signature",
    widthCm: 6,
    heightCm: 2,
    dpi: 200,
    minKB: 10,
    maxKB: 20,
    slug: "resize-signature-6-x-2-cm",
    title: "Resize Signature to 6 × 2 cm",
    metaTitle: "Resize Signature to 6 cm x 2 cm Online (10–20 KB)",
    description: "Resize a signature to 6 × 2 cm for SSC and other forms that give the size in centimetres. Cleans the paper, sets 10–20 KB, never uploads your file.",
    intro: "SSC and several other notices describe the signature as about 6 cm wide and 2 cm tall instead of giving pixels. This tool converts that to pixels for you and hits the KB range.",
    uses: ["SSC CGL, CHSL, MTS and GD signature", "Forms that describe the signature as 6 × 2 cm", "Notices that give size in cm instead of pixels"],
    note: `At 200 DPI, 6 × 2 cm is ${px(6, 200)} × ${px(2, 200)} px. If your notice says 4 × 2 cm or 3.5 × 1.5 cm, just type that in the Width and Height boxes.`,
    faqs: [
      { q: "What is 6 × 2 cm in pixels?", a: `${px(6, 200)} × ${px(2, 200)} px at 200 DPI, or ${px(6, 300)} × ${px(2, 300)} px at 300 DPI.` },
      { q: "Does the portal check centimetres?", a: "Portals read pixels and file size. Centimetres only matter together with DPI, which this tool writes into the file." },
    ],
  },
];

export const allSizePages: SizePage[] = [...maxPages, ...rangePages, ...dimensionPages];

export function getSizePage(slug: string) {
  return allSizePages.find((p) => p.slug === slug);
}

export { px as cmToPx };
