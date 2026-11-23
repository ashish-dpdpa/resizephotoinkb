// Format-pair landing pages ("HEIC to JPG", "WebP to PNG", …) served by /tools/[slug].
// They all use the same ImageConverter, opened on the right output format.

import type { OutFormat } from "./convert";

export interface ConvertPage {
  slug: string;
  from: "HEIC" | "WebP" | "PNG" | "JPG";
  to: OutFormat;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  /** Why people need this conversion: shown under the tool. */
  why: string[];
  faqs: { q: string; a: string }[];
}

const privacyFaq = {
  q: "Are my images uploaded?",
  a: "No. The conversion runs in your browser on your own device, so the images never reach our servers. Location and camera details stored inside the original file are removed from the converted copy.",
};

export const convertPages: ConvertPage[] = [
  {
    slug: "heic-to-jpg",
    from: "HEIC",
    to: "jpg",
    title: "HEIC to JPG Converter",
    metaTitle: "HEIC to JPG Converter: iPhone Photos to JPG, Free",
    description: "Convert iPhone HEIC photos to JPG in your browser. Batch convert, set a KB limit for exam forms, and download as a ZIP. Nothing is uploaded.",
    intro:
      "iPhones save photos as HEIC, but exam portals and most websites only accept JPG. Add your HEIC photos and download them as JPG, one by one or all together.",
    why: [
      "Since iOS 11, the iPhone camera saves photos in HEIC (High Efficiency) format by default. It takes up about half the space of JPG, but Windows often can't open it without an extra codec, and form portals that ask for “JPG/JPEG” reject it.",
      "If you upload straight from Safari on the iPhone, iOS sometimes converts the photo to JPG for you. Photos copied to a computer, sent by email, or saved from Google Drive or iCloud usually stay as HEIC, and that's where this tool helps.",
      "To stop the iPhone making HEIC files at all, go to Settings → Camera → Formats and choose Most Compatible. New photos will then be JPG.",
    ],
    faqs: [
      { q: "How do I convert HEIC to JPG on Windows?", a: "Open this page in Chrome or Edge, add the HEIC files and download the JPGs. You don't need to install the HEIF extension from the Microsoft Store." },
      { q: "Does converting HEIC to JPG lose quality?", a: "At 90–100% quality the difference isn't visible. JPG files are usually larger than the HEIC original, because HEIC compresses better." },
      { q: "Can I make the JPG small enough for an exam form?", a: "Type a size in Max size (for example 50 KB) and the tool lowers the quality (and, if needed, the pixel size) until it fits. For exact pixels too, open the JPG in the photo resizer afterwards." },
      privacyFaq,
    ],
  },
  {
    slug: "heic-to-png",
    from: "HEIC",
    to: "png",
    title: "HEIC to PNG Converter",
    metaTitle: "HEIC to PNG Converter: Lossless, Free, No Upload",
    description: "Convert iPhone HEIC photos to lossless PNG in your browser. Batch convert and download as a ZIP. Your photos are never uploaded.",
    intro: "Turn iPhone HEIC photos into PNG files that open everywhere and keep every pixel. Useful when you'll edit the image further.",
    why: [
      "PNG is lossless, so nothing is thrown away when you save, and the image doesn't get worse each time it's edited and saved again. That makes it a good choice before cropping, adding text or retouching.",
      "The catch is size: a 12 MP phone photo as PNG is often 10–20 MB. For uploading to a form, convert HEIC to JPG instead.",
    ],
    faqs: [
      { q: "Should I choose PNG or JPG for my HEIC photos?", a: "JPG for uploading and sharing: much smaller, accepted everywhere. PNG only if you'll keep editing the image and want no quality loss along the way." },
      { q: "Why is the PNG so much bigger than the HEIC?", a: "HEIC uses modern lossy compression. PNG stores every pixel exactly, which takes far more space for photos." },
      privacyFaq,
    ],
  },
  {
    slug: "webp-to-jpg",
    from: "WebP",
    to: "jpg",
    title: "WebP to JPG Converter",
    metaTitle: "WebP to JPG Converter: Free, Batch, No Upload",
    description: "Convert WebP images to JPG in your browser, with an optional KB limit for forms. Batch convert and download as a ZIP. Nothing is uploaded.",
    intro: "Images saved from websites and WhatsApp Web are often WebP, which many forms and older apps don't accept. Convert them to JPG here.",
    why: [
      "WebP is Google's image format. Websites use it because it loads faster, so when you right-click and save an image it often arrives as .webp. WhatsApp stickers are WebP too.",
      "Government and exam portals usually list JPG/JPEG only, and some older photo editors and printers can't open WebP. Converting to JPG fixes both.",
    ],
    faqs: [
      { q: "What happens to transparent areas?", a: "JPG can't be transparent, so transparent parts become white. If you need to keep transparency, convert WebP to PNG instead." },
      { q: "Does WebP to JPG reduce quality?", a: "Very slightly, because JPG is also lossy. At the default 90% quality you won't see a difference." },
      { q: "Can I convert animated WebP?", a: "Only the first frame is converted. JPG can't hold animation." },
      privacyFaq,
    ],
  },
  {
    slug: "webp-to-png",
    from: "WebP",
    to: "png",
    title: "WebP to PNG Converter",
    metaTitle: "WebP to PNG Converter: Keep Transparency, Free",
    description: "Convert WebP images and stickers to PNG with transparency kept. Batch convert in your browser and download as a ZIP. Nothing is uploaded.",
    intro: "Convert WebP images to PNG, keeping transparent backgrounds intact. Handy for WhatsApp stickers, logos and icons saved from websites.",
    why: [
      "PNG and WebP can both be transparent, so a sticker or logo keeps its see-through background when converted to PNG. PNG also opens in practically every app, including older editors that don't know WebP.",
    ],
    faqs: [
      { q: "Will the transparent background stay?", a: "Yes. Transparent areas in the WebP stay transparent in the PNG." },
      { q: "Why is the PNG larger than the WebP?", a: "PNG is lossless and less efficient than WebP, so the same image takes more space. The picture itself doesn't change." },
      privacyFaq,
    ],
  },
  {
    slug: "png-to-jpg",
    from: "PNG",
    to: "jpg",
    title: "PNG to JPG Converter",
    metaTitle: "PNG to JPG Converter: Smaller Files, KB Limit, Free",
    description: "Convert PNG screenshots and scans to JPG in your browser, with an optional KB limit for forms. Batch convert and download as a ZIP. Nothing is uploaded.",
    intro: "Screenshots and many scanned documents are PNG, which is large and often rejected by forms that want JPG. Convert them to compact JPGs here.",
    why: [
      "For photos and scans, JPG is usually 5–10 times smaller than PNG at a quality you can't tell apart, which matters when a portal limits uploads to 50, 100 or 200 KB.",
      "Phone screenshots, documents exported from some scanner apps and images copied from the web are often PNG. If the form says JPG/JPEG, convert first and then upload.",
    ],
    faqs: [
      { q: "What happens to transparent parts of the PNG?", a: "They become white, because JPG has no transparency." },
      { q: "How do I get the JPG under a KB limit?", a: "Enter the limit in Max size. The tool picks the highest quality that fits, and if the image is still too big it reduces the pixel size until it fits." },
      { q: "Is JPG good for text and line drawings?", a: "JPG can blur sharp edges slightly. Keep quality at 90% or more for documents with small text." },
      privacyFaq,
    ],
  },
  {
    slug: "jpg-to-png",
    from: "JPG",
    to: "png",
    title: "JPG to PNG Converter",
    metaTitle: "JPG to PNG Converter: Free, Batch, No Upload",
    description: "Convert JPG images to PNG in your browser. Batch convert and download as a ZIP. Your images are never uploaded.",
    intro: "Convert JPG images to PNG when a site or app asks for PNG, or before editing so the image doesn't lose quality each time you save it.",
    why: [
      "PNG is lossless: editing and re-saving a PNG doesn't add new blur or blocky artefacts the way re-saving a JPG does. Some websites, design tools and templates also ask specifically for PNG.",
      "Converting won't improve a JPG's existing quality, and it won't make the background transparent. For a transparent background, use the background remover.",
    ],
    faqs: [
      { q: "Why is my PNG bigger than the JPG?", a: "PNG stores every pixel exactly, while JPG compresses photos heavily. A larger file is normal and doesn't mean better quality." },
      { q: "Can I get a transparent background?", a: "Not by converting. Use the background remover, which removes the background and saves a transparent PNG." },
      privacyFaq,
    ],
  },
  {
    slug: "jpg-to-webp",
    from: "JPG",
    to: "webp",
    title: "JPG to WebP Converter",
    metaTitle: "JPG to WebP Converter: Smaller Images, Free",
    description: "Convert JPG images to WebP to make them smaller for websites. Set quality or a KB limit, batch convert and download as a ZIP. Nothing is uploaded.",
    intro: "Make images smaller for your website or blog by converting JPG to WebP. Set the quality or a maximum size, then download.",
    why: [
      "Google's WebP documentation reports lossy WebP files are 25–34% smaller than JPG at the same visual quality. Smaller images load faster, which helps page speed and Core Web Vitals.",
      "Don't use WebP for exam or government forms. They usually accept JPG only.",
    ],
    faqs: [
      { q: "Which browsers can create WebP?", a: "Chrome, Edge and Firefox. Safari can open WebP but may not be able to create it; if so, the tool tells you." },
      { q: "What quality should I use?", a: "80–85% is a good balance for websites. Check the size shown next to each file and adjust." },
      privacyFaq,
    ],
  },
  {
    slug: "png-to-webp",
    from: "PNG",
    to: "webp",
    title: "PNG to WebP Converter",
    metaTitle: "PNG to WebP Converter: Smaller, Keeps Transparency",
    description: "Convert PNG images to WebP with transparency kept. Much smaller files for websites. Batch convert in your browser and download as a ZIP.",
    intro: "Convert PNG images, including ones with transparent backgrounds, to WebP files that are usually much smaller.",
    why: [
      "WebP supports transparency like PNG but compresses far better, so logos, screenshots and graphics often shrink a lot, which makes pages faster.",
    ],
    faqs: [
      { q: "Is transparency kept?", a: "Yes. Transparent areas stay transparent in the WebP." },
      { q: "Which browsers can create WebP?", a: "Chrome, Edge and Firefox. If your browser can't, the tool says so; switch browser or choose PNG or JPG." },
      privacyFaq,
    ],
  },
];

export function getConvertPage(slug: string) {
  return convertPages.find((p) => p.slug === slug);
}
