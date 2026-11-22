export interface ToolLink {
  href: string;
  title: string;
  description: string;
}

export const compressSizes = [10, 20, 30, 50, 100, 200] as const;

export const tools: ToolLink[] = [
  {
    href: "/tools/photo-resizer",
    title: "Photo resizer for exam forms",
    description: "Resize and crop a photo to exact pixels and a KB range, with presets for major exams.",
  },
  {
    href: "/tools/signature-resizer",
    title: "Signature resizer",
    description: "Clean the background of a signature photo and export it at the size your form needs.",
  },
  {
    href: "/tools/signature-maker",
    title: "Online signature maker",
    description: "Draw your signature with a finger or mouse and download it as a form-ready JPG.",
  },
  ...compressSizes.map((kb) => ({
    href: `/tools/compress-image-to-${kb}kb`,
    title: `Compress image to ${kb} KB`,
    description: `Reduce a JPG or PNG to under ${kb} KB while keeping it as sharp as possible.`,
  })),
  {
    href: "/tools/age-calculator",
    title: "Exam age calculator",
    description: "Work out your exact age on an exam's cut-off date, with category relaxation.",
  },
];
