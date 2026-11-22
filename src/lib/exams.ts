// Exam upload requirements.
//
// IMPORTANT: exam bodies change these rules between notifications. Every value
// below was compiled on the `lastChecked` date from the latest reported 2026
// notices and must be re-checked against the official notification before each
// form season. Update `lastChecked` whenever you verify an exam.

export type DocKind = "photo" | "signature" | "thumb" | "declaration" | "postcard";

export interface DocSpec {
  kind: DocKind;
  label: string;
  minKB: number;
  maxKB: number;
  width: number; // output width in px used by the preset
  height: number; // output height in px used by the preset
  dpi?: number;
  dimensionNote: string; // what the notice says about dimensions, in plain words
  tips: string[];
}

export interface Exam {
  slug: string;
  name: string; // short name, e.g. "SSC CGL"
  fullName: string;
  body: string; // conducting body
  category: "SSC" | "UPSC" | "Banking" | "Railway" | "Postal" | "Defence" | "State Police" | "State Exams" | "Medical" | "Entrance" | "Teaching" | "Certification" | "Documents";
  officialSite: string;
  noticeRef: string; // which notice the values come from
  lastChecked: string; // ISO date
  livePhoto: boolean; // photo captured live during the form instead of uploaded
  /** Document that should carry name + date of photograph (turns the caption option on). */
  captionDoc?: DocKind;
  intro: string;
  docs: DocSpec[];
  notes: string[];
  faqs: { q: string; a: string }[];
}

export const exams: Exam[] = [
  {
    slug: "ssc-cgl",
    name: "SSC CGL",
    fullName: "SSC Combined Graduate Level Examination",
    body: "Staff Selection Commission",
    category: "SSC",
    officialSite: "https://ssc.gov.in",
    noticeRef: "SSC CGL 2026 notice (as reported, May 2026)",
    lastChecked: "2026-11-22",
    livePhoto: true,
    intro:
      "SSC now captures your photograph live through the webcam or mobile camera while you fill the form, so you no longer upload a passport-size photo for CGL. The signature is still uploaded as a scanned JPG, and it must fall inside a narrow KB range, this is where most candidates get stuck.",
    docs: [
      {
        kind: "signature",
        label: "Signature",
        minKB: 10,
        maxKB: 20,
        width: 240,
        height: 80,
        dimensionNote: "About 6.0 cm × 2.0 cm (wide rectangle). Our preset exports 240 × 80 px.",
        tips: [
          "Sign on plain white paper with a black ink pen.",
          "Don't sign in capital letters. SSC rejects signatures written in block capitals.",
          "Crop tightly around the signature so it fills most of the frame.",
        ],
      },
    ],
    notes: [
      "The live photo is taken during the application. Sit facing a plain light wall, remove caps and spectacles, and make sure your face is evenly lit.",
      "The same signature must be used in the exam hall, so sign the way you normally do.",
      "Other SSC exams (CHSL, MTS, GD, CPO) use the same portal; check each notice because limits can differ.",
    ],
    faqs: [
      {
        q: "Do I need to upload a photo for SSC CGL 2026?",
        a: "According to the 2026 notice as reported, no. The photograph is captured live through your camera during the application. You only upload the signature.",
      },
      {
        q: "What is the SSC CGL signature size in KB?",
        a: "The reported limit is 10 KB to 20 KB in JPG/JPEG format. Use the resizer on this page with the SSC CGL preset to hit that range automatically.",
      },
      {
        q: "My signature file is only 6 KB. Will it be accepted?",
        a: "No. Files below the minimum are rejected too. Our tool raises the file size to the minimum without changing how the image looks.",
      },
    ],
  },
  {
    slug: "ssc-chsl",
    name: "SSC CHSL",
    fullName: "SSC Combined Higher Secondary (10+2) Level Examination",
    body: "Staff Selection Commission",
    category: "SSC",
    officialSite: "https://ssc.gov.in",
    noticeRef: "SSC CHSL 2026 notice (as reported, September 2026)",
    lastChecked: "2026-11-22",
    livePhoto: true,
    intro:
      "SSC CHSL is taken by 12th-pass candidates for LDC, JSA, Postal Assistant and DEO posts. Like CGL, the 2026 form captures your photo live through the camera, so the only image you prepare is your signature, and it has a tight 10–20 KB window.",
    docs: [
      {
        kind: "signature",
        label: "Signature",
        minKB: 10,
        maxKB: 20,
        width: 240,
        height: 80,
        dimensionNote: "About 6.0 cm × 2.0 cm. Our preset exports 240 × 80 px; some guides prefer 140 × 60 px, which also works if you set it as a custom size.",
        tips: [
          "Sign in running hand with a black pen on white paper. Capital-letter signatures are not accepted.",
          "Many CHSL applicants are first-time form fillers: crop the signature tightly so no paper edges or fingers show.",
        ],
      },
    ],
    notes: [
      "Older guides (written before the 2026 notice) mention a 3.5 × 4.5 cm photo with name and date. That rule does not apply when the photo is captured live.",
      "If you are also applying for SSC CGL, you can reuse the same signature file, since the limits are the same.",
      "Keep the device steady and your face well lit during live capture; see our live photo tips.",
    ],
    faqs: [
      {
        q: "What is the SSC CHSL 2026 signature size?",
        a: "Reported as 10–20 KB in JPG/JPEG, about 6 cm × 2 cm.",
      },
      {
        q: "Is a photo upload needed for SSC CHSL 2026?",
        a: "As reported from the 2026 notice, no. The photograph is captured live during the application.",
      },
      {
        q: "Can I use my SSC CGL signature for CHSL?",
        a: "Yes, as long as it is between 10 and 20 KB in JPG format and is your usual signature.",
      },
    ],
  },
  {
    slug: "ssc-mts",
    name: "SSC MTS",
    fullName: "SSC Multi-Tasking (Non-Technical) Staff and Havaldar Examination",
    body: "Staff Selection Commission",
    category: "SSC",
    officialSite: "https://ssc.gov.in",
    noticeRef: "SSC MTS notice (2025 notice as reported; recheck when the 2026 notice is published)",
    lastChecked: "2026-11-22",
    livePhoto: true,
    intro:
      "SSC MTS and Havaldar is open to 10th-pass candidates and attracts some of the largest application numbers of any SSC exam. The photo is captured live in the application, and the signature is uploaded as a small JPG.",
    docs: [
      {
        kind: "signature",
        label: "Signature",
        minKB: 10,
        maxKB: 20,
        width: 240,
        height: 80,
        dimensionNote: "About 6.0 cm × 2.0 cm as in other recent SSC notices. Our preset exports 240 × 80 px.",
        tips: [
          "Sign with a black pen on white unruled paper, the same way you will sign in the exam hall.",
          "If you apply from a cyber café, carry the signature file on your phone so it is not re-scanned in a hurry.",
        ],
      },
    ],
    notes: [
      "These values are based on the previous MTS notice. SSC has used the same signature rule across CGL, CHSL and MTS, but confirm it when the new notice is out.",
      "Havaldar candidates also go through PET/PST later; the photo captured now is used for identity checks at every stage.",
    ],
    faqs: [
      {
        q: "What is the SSC MTS signature size in KB?",
        a: "10–20 KB in JPG/JPEG format, as reported from the latest available MTS notice.",
      },
      {
        q: "Do I need a photo for SSC MTS?",
        a: "The photograph is captured live during the application, so you do not upload a photo file.",
      },
    ],
  },
  {
    slug: "ssc-gd",
    name: "SSC GD",
    fullName: "SSC Constable (GD) in CAPFs, SSF and Rifleman (GD) in Assam Rifles",
    body: "Staff Selection Commission",
    category: "SSC",
    officialSite: "https://ssc.gov.in",
    noticeRef: "SSC GD Constable 2026 notice (as reported, December 2025)",
    lastChecked: "2026-11-22",
    livePhoto: true,
    intro:
      "SSC GD Constable recruits for BSF, CISF, CRPF, ITBP, SSB, SSF and Assam Rifles. The 2026 notice captures the photograph live during the application, so you prepare only the signature. Many third-party sites still quote an old 20–50 KB photo rule, it does not apply to live capture.",
    docs: [
      {
        kind: "signature",
        label: "Signature",
        minKB: 10,
        maxKB: 20,
        width: 240,
        height: 80,
        dimensionNote: "Given in centimetres (about 6.0 cm × 2.0 cm), not a fixed pixel size. Our preset exports 240 × 80 px.",
        tips: [
          "Sign in running hand, not capitals, with a black pen.",
          "Use the same signature on the PET/PST and medical examination forms later.",
        ],
      },
    ],
    notes: [
      "Your face is matched against the live photo at the computer-based test, PET/PST and medical stages, so keep your appearance similar.",
      "Guides that ask for a 3.5 × 4.5 cm photo at 20–50 KB are based on older notices.",
    ],
    faqs: [
      {
        q: "What is the SSC GD signature size?",
        a: "10–20 KB in JPG/JPEG, as reported from the 2026 notice. The notice states dimensions in centimetres.",
      },
      {
        q: "Is the SSC GD photo 20–50 KB?",
        a: "Not in the 2026 cycle, as reported. The photo is captured live, so there is no photo file to resize.",
      },
    ],
  },
  {
    slug: "upsc-cse",
    captionDoc: "photo",
    name: "UPSC CSE",
    fullName: "UPSC Civil Services Examination",
    body: "Union Public Service Commission",
    category: "UPSC",
    officialSite: "https://upsconline.nic.in",
    noticeRef: "UPSC CSE 2026 notice and portal instructions (as reported, Feb 2026)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "UPSC asks for a recent photograph and a signature image on the one-time registration (OTR) and application portal. The photo range is generous, but UPSC is strict about photo recency, a clear face and the signature format (three signatures on one sheet).",
    docs: [
      {
        kind: "photo",
        label: "Photograph",
        minKB: 20,
        maxKB: 200,
        width: 400,
        height: 500,
        dimensionNote: "No fixed pixel size in the notice as reported. Our preset exports 400 × 500 px (4:5 ratio).",
        tips: [
          "The photo must be recent (taken within the last 10 days of starting the application) and your name and date of photograph should be printed on it.",
          "Face should cover about three-quarters of the photo, looking straight at the camera.",
          "Use a plain white or light background, no caps or dark glasses.",
        ],
      },
      {
        kind: "signature",
        label: "Signature (3 signatures on one sheet)",
        minKB: 20,
        maxKB: 100,
        width: 500,
        height: 350,
        dimensionNote: "350–500 px as reported. Our preset exports 500 × 350 px so three signatures fit one above the other.",
        tips: [
          "Sign three times, one below the other, on white paper with a black pen, then scan all three as one image.",
          "Keep the signatures inside the frame with a little white margin.",
        ],
      },
    ],
    notes: [
      "UPSC keeps the same photo for the whole recruitment, so use a good-quality one.",
      "Use the same photo for the admit card photo identity check; carry printed copies to the exam.",
    ],
    faqs: [
      {
        q: "What is the UPSC photo size in KB for 2026?",
        a: "Reported as 20 KB to 200 KB in JPG format. Some guides mention 300 KB; stay within 200 KB to be safe.",
      },
      {
        q: "Why does UPSC want three signatures?",
        a: "UPSC asks candidates to sign three times on one sheet so the commission can compare your signature consistency. Scan the sheet as a single JPG.",
      },
    ],
  },
  {
    slug: "ibps-po",
    name: "IBPS PO",
    fullName: "IBPS Probationary Officer / Management Trainee (CRP PO/MT)",
    body: "Institute of Banking Personnel Selection",
    category: "Banking",
    officialSite: "https://www.ibps.in",
    noticeRef: "IBPS CRP PO/MT-XVI notification (as reported, June 2026)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "IBPS forms ask for four separate images: photograph, signature, left thumb impression and a handwritten declaration. Each has its own pixel size and KB range, and the declaration is the one candidates most often get wrong.",
    docs: [
      {
        kind: "photo",
        label: "Photograph",
        minKB: 20,
        maxKB: 50,
        width: 200,
        height: 230,
        dpi: 200,
        dimensionNote: "200 × 230 px (preferred).",
        tips: ["Light background, face straight to the camera.", "Do not wear caps, hats or dark glasses."],
      },
      {
        kind: "signature",
        label: "Signature",
        minKB: 10,
        maxKB: 20,
        width: 140,
        height: 60,
        dpi: 200,
        dimensionNote: "140 × 60 px (preferred).",
        tips: ["Sign with a black pen on white paper.", "Signatures in capital letters are not accepted."],
      },
      {
        kind: "thumb",
        label: "Left thumb impression",
        minKB: 20,
        maxKB: 50,
        width: 240,
        height: 240,
        dpi: 200,
        dimensionNote: "240 × 240 px at 200 DPI (3 cm × 3 cm).",
        tips: ["Use black or blue ink on white paper.", "Press evenly so the ridges are clear, not smudged."],
      },
      {
        kind: "declaration",
        label: "Handwritten declaration",
        minKB: 50,
        maxKB: 100,
        width: 800,
        height: 400,
        dpi: 200,
        dimensionNote: "800 × 400 px at 200 DPI (10 cm × 5 cm).",
        tips: [
          "Write the declaration text from the notice in English, in your own handwriting.",
          "Do not write in capital letters.",
        ],
      },
    ],
    notes: [
      "IBPS Clerk, RRB PO/Clerk and SO forms use similar image rules; always check the notice of the exam you are applying to.",
      "Some sources list different thumb impression sizes; the 20–50 KB value is the one most widely reported.",
    ],
    faqs: [
      {
        q: "What is the IBPS PO photo size?",
        a: "20 KB to 50 KB in JPG, 200 × 230 pixels preferred, as reported from the 2026 notification.",
      },
      {
        q: "What should the IBPS handwritten declaration say?",
        a: "Copy the exact declaration text given in the official notification. Write it in English in your own handwriting, not in capital letters.",
      },
    ],
  },
  {
    slug: "ibps-clerk",
    name: "IBPS Clerk",
    fullName: "IBPS Customer Service Associate (CRP CSA)",
    body: "Institute of Banking Personnel Selection",
    category: "Banking",
    officialSite: "https://www.ibps.in",
    noticeRef: "IBPS CRP CSA-XVI notification (as reported, 2026)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "IBPS Clerk uses the same four-image upload as IBPS PO: photograph, signature, left thumb impression and handwritten declaration. Clerk applications are made state-wise, but the image rules are identical for every state.",
    docs: [
      {
        kind: "photo",
        label: "Photograph",
        minKB: 20,
        maxKB: 50,
        width: 200,
        height: 230,
        dpi: 200,
        dimensionNote: "200 × 230 px (preferred).",
        tips: ["Recent colour photo on a light background.", "No cap, hat or dark glasses; face clearly visible."],
      },
      {
        kind: "signature",
        label: "Signature",
        minKB: 10,
        maxKB: 20,
        width: 140,
        height: 60,
        dpi: 200,
        dimensionNote: "140 × 60 px (preferred).",
        tips: ["Black ink on unlined white paper.", "Signatures in CAPITAL letters are not accepted."],
      },
      {
        kind: "thumb",
        label: "Left thumb impression",
        minKB: 20,
        maxKB: 50,
        width: 240,
        height: 240,
        dpi: 200,
        dimensionNote: "240 × 240 px at 200 DPI (3 cm × 3 cm).",
        tips: ["Black or blue ink on white paper.", "Candidates without a left thumb follow the alternative given in the notice."],
      },
      {
        kind: "declaration",
        label: "Handwritten declaration",
        minKB: 50,
        maxKB: 100,
        width: 800,
        height: 400,
        dpi: 200,
        dimensionNote: "800 × 400 px at 200 DPI (10 cm × 5 cm).",
        tips: ["Copy the declaration text from the notice in English, in your own handwriting.", "Not in capital letters."],
      },
    ],
    notes: [
      "If you applied for IBPS PO this year, you can reuse the same photo, signature and thumb impression, because the limits match. Write a fresh declaration if the notice text differs.",
      "Your photograph is also checked against a photo captured at the exam venue.",
    ],
    faqs: [
      {
        q: "What is the IBPS Clerk photo size?",
        a: "20–50 KB in JPG, 200 × 230 px preferred, as reported from the CSA-XVI notification.",
      },
      {
        q: "What is the IBPS Clerk handwritten declaration size?",
        a: "50–100 KB in JPG, 800 × 400 px at 200 DPI.",
      },
    ],
  },
  {
    slug: "sbi-po",
    name: "SBI PO",
    fullName: "SBI Probationary Officers Recruitment",
    body: "State Bank of India",
    category: "Banking",
    officialSite: "https://sbi.co.in/web/careers",
    noticeRef: "SBI PO 2026 advertisement (as reported)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "SBI runs its own recruitment separately from IBPS, but the upload rules are very similar: photograph, signature, left thumb impression and a handwritten declaration. SBI is strict about the declaration text: it must be copied word for word in your own handwriting.",
    docs: [
      {
        kind: "photo",
        label: "Photograph",
        minKB: 20,
        maxKB: 50,
        width: 200,
        height: 230,
        dpi: 200,
        dimensionNote: "200 × 230 px (preferred).",
        tips: ["Light background, face straight, both ears visible.", "Avoid caps, dark glasses and filters."],
      },
      {
        kind: "signature",
        label: "Signature",
        minKB: 10,
        maxKB: 20,
        width: 140,
        height: 60,
        dpi: 200,
        dimensionNote: "140 × 60 px (preferred), black ink only.",
        tips: ["Black ink on white paper.", "The signature must be yours and not in capital letters."],
      },
      {
        kind: "thumb",
        label: "Left thumb impression",
        minKB: 20,
        maxKB: 50,
        width: 240,
        height: 240,
        dpi: 200,
        dimensionNote: "240 × 240 px at 200 DPI (3 cm × 3 cm).",
        tips: ["Black or blue ink on white paper, ridges clearly visible."],
      },
      {
        kind: "declaration",
        label: "Handwritten declaration",
        minKB: 50,
        maxKB: 100,
        width: 800,
        height: 400,
        dpi: 200,
        dimensionNote: "800 × 400 px at 200 DPI (10 cm × 5 cm), as reported for SBI recruitments.",
        tips: [
          "Copy the declaration exactly as printed in the SBI notice, filling in your name.",
          "Write in English with black ink. Declarations in CAPITAL LETTERS are rejected.",
        ],
      },
    ],
    notes: [
      "The declaration states that the photo, signature and thumb impression are yours, so all four uploads must belong to you.",
      "SBI PO has three stages (prelims, mains, interview/group exercise); the same photo is used on every admit card.",
    ],
    faqs: [
      {
        q: "What is the SBI PO signature size?",
        a: "10–20 KB in JPG/JPEG, 140 × 60 px preferred, in black ink.",
      },
      {
        q: "Can the SBI PO declaration be typed?",
        a: "No. It must be handwritten by the candidate in English, not in capital letters, and then scanned.",
      },
      {
        q: "Is SBI PO photo size the same as IBPS PO?",
        a: "Yes, as reported both use 20–50 KB and 200 × 230 px, so one photo file can work for both.",
      },
    ],
  },
  {
    slug: "sbi-clerk",
    name: "SBI Clerk",
    fullName: "SBI Junior Associates (Customer Support & Sales)",
    body: "State Bank of India",
    category: "Banking",
    officialSite: "https://sbi.co.in/web/careers",
    noticeRef: "SBI Junior Associate 2026 advertisement (as reported, August 2026)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "SBI Clerk (Junior Associate) applications are made for one state, and you must know that state's local language. The image uploads follow the standard SBI pattern of four files.",
    docs: [
      {
        kind: "photo",
        label: "Photograph",
        minKB: 20,
        maxKB: 50,
        width: 200,
        height: 230,
        dpi: 200,
        dimensionNote: "200 × 230 px (preferred).",
        tips: ["Recent photo on a light background.", "Face should fill most of the frame."],
      },
      {
        kind: "signature",
        label: "Signature",
        minKB: 10,
        maxKB: 20,
        width: 140,
        height: 60,
        dpi: 200,
        dimensionNote: "140 × 60 px (preferred).",
        tips: ["Black ink on white paper, running hand, not capitals."],
      },
      {
        kind: "thumb",
        label: "Left thumb impression",
        minKB: 20,
        maxKB: 50,
        width: 240,
        height: 240,
        dpi: 200,
        dimensionNote: "240 × 240 px at 200 DPI.",
        tips: ["Use a stamp pad lightly; do not slide the thumb."],
      },
      {
        kind: "declaration",
        label: "Handwritten declaration",
        minKB: 50,
        maxKB: 100,
        width: 800,
        height: 400,
        dpi: 200,
        dimensionNote: "800 × 400 px at 200 DPI.",
        tips: ["Copy the exact text from the SBI notice in English, in your own handwriting.", "No capital letters."],
      },
    ],
    notes: [
      "One tool site lists different sizes (240 × 320 px photo, 160 × 60 px signature); most sources and previous SBI notices use the values above.",
      "The local language test happens after the main exam, but your uploaded photo is used for identity checks throughout.",
    ],
    faqs: [
      {
        q: "What is the SBI Clerk photo size in KB?",
        a: "20–50 KB, 200 × 230 px preferred, JPG format.",
      },
      {
        q: "What is the SBI Clerk thumb impression size?",
        a: "20–50 KB, 240 × 240 px at 200 DPI.",
      },
    ],
  },
  {
    slug: "rrb-ntpc",
    name: "RRB NTPC",
    fullName: "Railway Recruitment Board Non-Technical Popular Categories",
    body: "Railway Recruitment Boards",
    category: "Railway",
    officialSite: "https://www.rrbapply.gov.in",
    noticeRef: "RRB NTPC CEN 06/2026 (as reported)",
    lastChecked: "2026-11-22",
    livePhoto: true,
    intro:
      "Railway forms now capture your photograph live during the application, so for NTPC the image you upload is the signature. Its minimum file size is unusually high for such a small image, which is why many signatures get rejected for being too small.",
    docs: [
      {
        kind: "signature",
        label: "Signature",
        minKB: 30,
        maxKB: 49,
        width: 280,
        height: 120,
        dpi: 100,
        dimensionNote: "Minimum 140 × 60 px, at least 100 DPI. Our preset exports 280 × 120 px.",
        tips: [
          "A small signature image is usually only 5–15 KB, below the 30 KB minimum. Our tool pads the file to the minimum without changing the image.",
          "Sign in black ink on plain white paper.",
        ],
      },
    ],
    notes: [
      "Older railway rules asked for a 20–50 KB photo; do not use those for the live photo capture.",
      "RRB Group D, ALP and Technician forms use the same portal but can have different limits.",
    ],
    faqs: [
      {
        q: "What is the RRB NTPC 2026 signature size?",
        a: "Reported as 30 KB to 49 KB in JPG/JPEG, minimum 140 × 60 px.",
      },
      {
        q: "How do I make a signature image bigger than 30 KB?",
        a: "Choose the RRB NTPC preset on this page. If the compressed image is below 30 KB, the tool adds hidden padding so the file meets the minimum while looking exactly the same.",
      },
    ],
  },
  {
    slug: "rrb-group-d",
    name: "RRB Group D",
    fullName: "Railway Recruitment Board Level-1 Posts (Group D)",
    body: "Railway Recruitment Boards",
    category: "Railway",
    officialSite: "https://www.rrbapply.gov.in",
    noticeRef: "RRB Group D (Level-1) instructions (as reported; sources conflict)",
    lastChecked: "2026-11-22",
    livePhoto: true,
    intro:
      "RRB Group D (Level-1) is one of the biggest recruitments in India, with lakhs of applicants. The railway application portal now captures the photograph live, and the signature must meet the same high minimum file size as other railway forms.",
    docs: [
      {
        kind: "signature",
        label: "Signature",
        minKB: 30,
        maxKB: 49,
        width: 280,
        height: 120,
        dpi: 100,
        dimensionNote: "Minimum 140 × 60 px as in other RRB forms. Our preset exports 280 × 120 px.",
        tips: [
          "Small signatures are usually 5–15 KB, below the 30 KB minimum. The tool pads the file so it's accepted.",
          "Sign in black ink on white paper.",
        ],
      },
    ],
    notes: [
      "Sources disagree for Group D: some list a photo upload of 50–100 KB or 30–70 KB, others say the photo is captured live. Read your CEN notice carefully; if it asks for a photo file, use the photo resizer with the size it gives.",
      "The same signature rules apply to RRB NTPC, so one file can be reused if both are open.",
    ],
    faqs: [
      {
        q: "What is the RRB Group D signature size?",
        a: "Most sources give 30–49 KB in JPG for the current railway portal. One older guide lists 10–20 KB, so confirm in your CEN notice.",
      },
      {
        q: "Do I upload a photo for RRB Group D?",
        a: "Recent railway forms capture the photo live. Some guides still list a photo upload, so follow the instructions on the application portal.",
      },
    ],
  },
  {
    slug: "up-police-constable",
    name: "UP Police Constable",
    fullName: "UP Police Constable Recruitment",
    body: "Uttar Pradesh Police Recruitment and Promotion Board (UPPRPB)",
    category: "State Police",
    officialSite: "https://uppbpb.gov.in",
    noticeRef: "UPPRPB notice PRPB-B-07/2025 (as reported, Dec 2025)",
    lastChecked: "2026-11-22",
    livePhoto: true,
    intro:
      "UPPRPB captures the candidate photograph live during form filling, so the signature is the only image you prepare yourself. Different websites quote very different signature limits, so double-check the notice before you submit.",
    docs: [
      {
        kind: "signature",
        label: "Signature",
        minKB: 30,
        maxKB: 50,
        width: 140,
        height: 60,
        dimensionNote: "50 mm × 20 mm or 140 × 60 px, as reported.",
        tips: [
          "Sign in black or blue ink on white paper.",
          "Because 140 × 60 px images are tiny, the tool pads the file to reach 30 KB.",
        ],
      },
    ],
    notes: [
      "Older UP Police forms used a 3.5 × 4.5 cm photo upload and a 5–20 KB signature. The current notice uses live photo capture.",
      "UP Police SI and Jail Warder forms may use different limits.",
    ],
    faqs: [
      {
        q: "What is the UP Police Constable signature size?",
        a: "Reported as 30–50 KB in JPG/JPEG at 140 × 60 px. Verify on uppbpb.gov.in before uploading.",
      },
    ],
  },
  {
    slug: "neet-ug",
    captionDoc: "postcard",
    name: "NEET UG",
    fullName: "National Eligibility cum Entrance Test (UG)",
    body: "National Testing Agency (NTA)",
    category: "Medical",
    officialSite: "https://neet.nta.nic.in",
    noticeRef: "NEET UG 2026 information bulletin (as reported)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "NEET asks for more images than most exams: a passport-size photo, a postcard-size photo, a signature and thumb impressions. The postcard photo must show your name and the date the photo was taken.",
    docs: [
      {
        kind: "photo",
        label: "Passport-size photo",
        minKB: 10,
        maxKB: 200,
        width: 300,
        height: 400,
        dimensionNote: "Passport size, 10–200 KB. Our preset exports 300 × 400 px.",
        tips: [
          "White background, face covering about 80% of the frame, ears visible.",
          "The photo must be taken on or after 1 January of the exam year.",
        ],
      },
      {
        kind: "postcard",
        label: "Postcard-size photo (4 × 6 in)",
        minKB: 10,
        maxKB: 200,
        width: 400,
        height: 600,
        dimensionNote: "4 × 6 inch postcard size. Our preset exports 400 × 600 px.",
        tips: ["Your name and the date of the photograph must be printed at the bottom."],
      },
      {
        kind: "signature",
        label: "Signature",
        minKB: 4,
        maxKB: 30,
        width: 300,
        height: 100,
        dimensionNote: "No fixed pixel size reported. Our preset exports 300 × 100 px.",
        tips: ["Sign with a black ink pen on white paper."],
      },
      {
        kind: "thumb",
        label: "Left & right thumb impressions",
        minKB: 10,
        maxKB: 200,
        width: 300,
        height: 300,
        dimensionNote: "No fixed pixel size reported. Our preset exports 300 × 300 px.",
        tips: ["Take both thumb impressions in blue or black ink on white paper."],
      },
    ],
    notes: [
      "Some sources quote 10–50 KB or 10–100 KB for the NEET signature. 4–30 KB is the most widely reported range.",
      "Keep printed copies of the same photo; you will need them on exam day.",
    ],
    faqs: [
      {
        q: "What is the NEET 2026 photo size?",
        a: "Both the passport and postcard photos are reported as 10 KB to 200 KB in JPG.",
      },
      {
        q: "What must be written on the NEET postcard photo?",
        a: "Your name and the date the photograph was taken, printed at the bottom of the photo.",
      },
    ],
  },
  {
    slug: "ctet",
    name: "CTET",
    fullName: "Central Teacher Eligibility Test",
    body: "Central Board of Secondary Education (CBSE)",
    category: "Teaching",
    officialSite: "https://ctet.nic.in",
    noticeRef: "CTET 2026 information bulletin (as reported)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "CTET is required to teach Classes 1–8 in central government schools such as KVS and NVS. The form asks for a scanned photograph and signature with dimensions given in centimetres, which many candidates find confusing. Our presets convert them to pixels for you.",
    docs: [
      {
        kind: "photo",
        label: "Photograph",
        minKB: 10,
        maxKB: 100,
        width: 413,
        height: 531,
        dimensionNote: "3.5 cm × 4.5 cm. Our preset exports 413 × 531 px (300 DPI).",
        tips: ["Recent colour photo, light background, face covering most of the frame.", "Do not use a selfie with a tilted angle."],
      },
      {
        kind: "signature",
        label: "Signature",
        minKB: 3,
        maxKB: 30,
        width: 413,
        height: 177,
        dimensionNote: "3.5 cm × 1.5 cm. Our preset exports 413 × 177 px (300 DPI).",
        tips: ["Sign with a black or blue pen on white paper.", "Keep the signature inside the frame with a small white margin."],
      },
    ],
    notes: [
      "Some bulletins have allowed photos up to 200 KB; 10–100 KB is within every reported limit, so it is the safe target.",
      "CTET is held twice a year in some years. Re-check the bulletin for each session.",
    ],
    faqs: [
      {
        q: "What is the CTET photo size?",
        a: "3.5 cm × 4.5 cm (about 413 × 531 px at 300 DPI), 10–100 KB in JPG, as reported.",
      },
      {
        q: "What is the CTET signature size?",
        a: "3.5 cm × 1.5 cm (about 413 × 177 px at 300 DPI), 3–30 KB in JPG.",
      },
    ],
  },
  {
    slug: "ibps-rrb",
    name: "IBPS RRB",
    fullName: "IBPS RRB Officer Scale-I & Office Assistant (CRP RRBs)",
    body: "Institute of Banking Personnel Selection",
    category: "Banking",
    officialSite: "https://www.ibps.in",
    noticeRef: "IBPS CRP RRBs-XV notification (as reported, September 2026)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "IBPS RRB recruits Office Assistants (multipurpose) and Officers for Regional Rural Banks across India. The upload rules are the same four-image set as other IBPS exams, and many candidates apply to RRB, PO and Clerk in the same year, one set of files can serve all three if the limits match.",
    docs: [
      { kind: "photo", label: "Photograph", minKB: 20, maxKB: 50, width: 200, height: 230, dpi: 200, dimensionNote: "200 × 230 px (preferred).", tips: ["Recent colour photo, light background.", "Face straight to the camera, no cap or dark glasses."] },
      { kind: "signature", label: "Signature", minKB: 10, maxKB: 20, width: 140, height: 60, dpi: 200, dimensionNote: "140 × 60 px (preferred).", tips: ["Black ink on white paper.", "Not in capital letters."] },
      { kind: "thumb", label: "Left thumb impression", minKB: 20, maxKB: 50, width: 240, height: 240, dpi: 200, dimensionNote: "240 × 240 px at 200 DPI (3 cm × 3 cm).", tips: ["Blue or black ink on white paper, ridges clearly visible."] },
      { kind: "declaration", label: "Handwritten declaration", minKB: 50, maxKB: 100, width: 800, height: 400, dpi: 200, dimensionNote: "800 × 400 px at 200 DPI (10 cm × 5 cm).", tips: ["Copy the declaration text from the notice in English, in your own handwriting.", "Not in capital letters."] },
    ],
    notes: [
      "Office Assistant candidates need proficiency in the local language of the state they apply for; this does not change the image rules.",
      "If you applied for IBPS PO or Clerk this year, the photo, signature and thumb files can be reused.",
    ],
    faqs: [
      { q: "What is the IBPS RRB photo size?", a: "20–50 KB in JPG, 200 × 230 px preferred, as reported from the CRP RRBs-XV notification." },
      { q: "Is the IBPS RRB declaration the same as IBPS PO?", a: "The size is the same (50–100 KB, 800 × 400 px). Copy the exact text printed in the RRB notification." },
    ],
  },
  {
    slug: "india-post-gds",
    name: "India Post GDS",
    fullName: "India Post Gramin Dak Sevak (BPM / ABPM / Dak Sevak)",
    body: "Department of Posts",
    category: "Postal",
    officialSite: "https://indiapostgdsonline.gov.in",
    noticeRef: "India Post GDS online engagement schedule 2026, Annexure II (as reported)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "GDS recruitment is merit-based on 10th marks, so there is no exam, but the online application must have an acceptable photo and signature. The portal's annexure gives only maximum sizes, and guides quote different pixel sizes, so the safest approach is a clear photo kept under 50 KB and a signature under 20 KB.",
    docs: [
      { kind: "photo", label: "Photograph", minKB: 10, maxKB: 50, width: 320, height: 400, dimensionNote: "Maximum 50 KB as reported; no fixed pixel size. Our preset exports 320 × 400 px.", tips: ["Recent colour photo on a light background.", "Face clearly visible, no cap or dark glasses."] },
      { kind: "signature", label: "Signature", minKB: 5, maxKB: 20, width: 300, height: 120, dimensionNote: "Maximum 20 KB as reported. Our preset exports 300 × 120 px (wide, 5:2).", tips: ["Sign in black or blue ink on white paper.", "Crop close to the signature with a thin white margin."] },
    ],
    notes: [
      "Some later guides quote 30–100 KB for the photo and 20–100 KB for the signature. Follow the limit shown on the GDS portal’s upload screen when you apply.",
      "Many GDS-related searches ask about joining the photo and signature into one image; the GDS portal takes them as separate files, but our join tool is there if a form asks for one.",
    ],
    faqs: [
      { q: "What is the India Post GDS photo size?", a: "Up to 50 KB in JPG as given in the portal annexure (as reported). Keep it a clear, recent colour photo." },
      { q: "What is the GDS signature size?", a: "Up to 20 KB in JPG. A wide crop around 300 × 120 px works well." },
      { q: "Is there an exam for GDS?", a: "No. Selection is based on 10th class marks, but your application can be rejected for a wrong or unclear photo." },
    ],
  },
  {
    slug: "agniveer-army",
    name: "Agniveer (Army)",
    fullName: "Indian Army Agniveer Common Entrance Exam",
    body: "Indian Army",
    category: "Defence",
    officialSite: "https://joinindianarmy.nic.in",
    noticeRef: "Indian Army Agniveer CEE 2026 notification (as reported; sources differ)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "The Agniveer online application on the Join Indian Army portal asks for a recent passport photo and signature. Different guides quote different limits, but the most widely reported values are a 20–50 KB photo and a 10–20 KB signature on a white background.",
    docs: [
      { kind: "photo", label: "Photograph", minKB: 20, maxKB: 50, width: 413, height: 531, dpi: 300, dimensionNote: "Passport size (3.5 × 4.5 cm). Our preset exports 413 × 531 px at 300 DPI.", tips: ["Recent colour photo with a white background.", "Face clearly visible, no cap, short neat hair is expected at the rally anyway."] },
      { kind: "signature", label: "Signature", minKB: 10, maxKB: 20, width: 413, height: 177, dpi: 300, dimensionNote: "About 3.5 × 1.5 cm. Our preset exports 413 × 177 px.", tips: ["Sign on plain white paper with a dark pen."] },
    ],
    notes: [
      "One guide lists much lower limits (photo 10–20 KB, signature 5–10 KB). If the portal rejects your file, change the KB range in the tool to match the message.",
      "Carry printed copies of the same photo to the recruitment rally and document verification.",
    ],
    faqs: [
      { q: "What is the Agniveer photo size?", a: "Most guides report 20–50 KB in JPG with a white background (as reported for the 2026 CEE)." },
      { q: "What is the Agniveer signature size?", a: "Most guides report 10–20 KB in JPG." },
    ],
  },
  {
    slug: "upsssc-pet",
    name: "UPSSSC PET",
    fullName: "UPSSSC Preliminary Eligibility Test",
    body: "Uttar Pradesh Subordinate Services Selection Commission",
    category: "State Exams",
    officialSite: "https://upsssc.gov.in",
    noticeRef: "UPSSSC PET notice (as reported by third-party guides)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "PET is the gateway exam for most Group C posts in Uttar Pradesh, and its score is used for later UPSSSC recruitments, so lakhs of candidates fill this form. The notice gives the photo and signature in centimetres, which this page converts to pixels for you.",
    docs: [
      { kind: "photo", label: "Photograph", minKB: 20, maxKB: 50, width: 276, height: 354, dpi: 200, dimensionNote: "3.5 × 4.5 cm. Our preset exports 276 × 354 px at 200 DPI.", tips: ["White or light plain background.", "Recent colour photo, face covering most of the frame."] },
      { kind: "signature", label: "Signature", minKB: 5, maxKB: 20, width: 276, height: 118, dpi: 200, dimensionNote: "3.5 × 1.5 cm. Our preset exports 276 × 118 px at 200 DPI.", tips: ["Black ink on white paper.", "Keep the whole signature inside the frame."] },
    ],
    notes: [
      "We could not find the official PET notice text for these values. Confirm them on upsssc.gov.in before submitting.",
      "Use the same photo you will carry on exam day; the admit card is matched against it.",
    ],
    faqs: [
      { q: "What is the UPSSSC PET photo size?", a: "3.5 × 4.5 cm, up to 50 KB in JPG, as reported." },
      { q: "What is the UPSSSC PET signature size?", a: "3.5 × 1.5 cm, up to 20 KB in JPG, as reported." },
    ],
  },
  {
    slug: "tnpsc-group-4",
    captionDoc: "photo",
    name: "TNPSC Group 4",
    fullName: "TNPSC Combined Civil Services Examination – IV (Group 4)",
    body: "Tamil Nadu Public Service Commission",
    category: "State Exams",
    officialSite: "https://www.tnpsc.gov.in",
    noticeRef: "TNPSC Group 4 notification 2026 (as reported)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "TNPSC uses a One Time Registration (OTR) where your photo and signature are stored and reused for every application. Several guides say the photo should show your name and the date it was taken, and this page lets you add both.",
    docs: [
      { kind: "photo", label: "Photograph", minKB: 20, maxKB: 50, width: 276, height: 354, dpi: 200, dimensionNote: "3.5 × 4.5 cm. Guides give different pixel sizes; our preset exports 276 × 354 px at 200 DPI.", tips: ["Name and date of photograph printed at the bottom, as many guides advise.", "Light plain background."] },
      { kind: "signature", label: "Signature", minKB: 10, maxKB: 20, width: 200, height: 80, dimensionNote: "Pixel sizes vary between guides (200 × 80 to 200 × 100 px). Our preset exports 200 × 80 px.", tips: ["Black or blue ink on unruled white paper."] },
    ],
    notes: [
      "The photo and signature you upload in OTR are used for future TNPSC exams too, so use a good, recent photo.",
      "Older guides list GIF or very small pixel sizes; current guides use JPG with the limits above.",
    ],
    faqs: [
      { q: "What is the TNPSC photo size?", a: "20–50 KB in JPG, as reported for Group 4 2026." },
      { q: "Does the TNPSC photo need name and date?", a: "Several guides say yes. Switch on “Name & date under photo” in the tool above to add them." },
      { q: "What is the TNPSC signature size?", a: "10–20 KB in JPG." },
    ],
  },
  {
    slug: "bihar-police-constable",
    name: "Bihar Police",
    fullName: "CSBC Bihar Police Constable Recruitment",
    body: "Central Selection Board of Constable (CSBC), Bihar",
    category: "State Police",
    officialSite: "https://csbc-bih.bihar.gov.in",
    noticeRef: "CSBC advertisements 01/2025 and 02/2026 (as reported)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "CSBC Bihar forms set a narrow 15–25 KB window for the photo and the signature, and ask for your signature twice, once in English and once in Hindi. Both signatures follow the same size rule.",
    docs: [
      { kind: "photo", label: "Photograph", minKB: 15, maxKB: 25, width: 276, height: 354, dpi: 200, dimensionNote: "No pixel size in the notice as reported. Our preset exports 3.5 × 4.5 cm (276 × 354 px at 200 DPI).", tips: ["Recent colour photo on a light background."] },
      { kind: "signature", label: "Signature (English and Hindi)", minKB: 15, maxKB: 25, width: 276, height: 118, dpi: 200, dimensionNote: "15–25 KB each. Our preset exports 3.5 × 1.5 cm (276 × 118 px).", tips: ["Make two files: one signature in English, one in Hindi.", "Black ink on white paper."] },
    ],
    notes: [
      "Because the minimum is 15 KB, small signature files are often rejected as too small. The tool pads them to the minimum automatically.",
      "Some sites list wider limits (20–200 KB). Follow the advertisement for your post.",
    ],
    faqs: [
      { q: "What is the Bihar Police photo size?", a: "15–25 KB in JPG, as reported from recent CSBC advertisements." },
      { q: "Why two signatures?", a: "CSBC asks for your signature in English and in Hindi. Prepare both with the same 15–25 KB limit." },
    ],
  },
  {
    slug: "jee-main",
    name: "JEE Main",
    fullName: "Joint Entrance Examination (Main)",
    body: "National Testing Agency (NTA)",
    category: "Entrance",
    officialSite: "https://jeemain.nta.nic.in",
    noticeRef: "JEE Main 2026 information bulletin (as reported)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "JEE Main has generous file limits, but NTA is strict about the photo itself: it must be recent, in colour, with a clear face, and it is checked against you at the centre. Photo mismatch notices are common, so prepare it carefully.",
    docs: [
      { kind: "photo", label: "Photograph", minKB: 10, maxKB: 200, width: 413, height: 531, dpi: 300, dimensionNote: "Passport size (3.5 × 4.5 cm). Our preset exports 413 × 531 px at 300 DPI.", tips: ["Recent colour photo, white background, 80% face coverage, ears visible.", "No caps, dark glasses or filters."] },
      { kind: "signature", label: "Signature", minKB: 10, maxKB: 100, width: 413, height: 177, dpi: 300, dimensionNote: "No fixed pixel size reported. Our preset exports 3.5 × 1.5 cm (413 × 177 px).", tips: ["Sign on white paper with a black pen, in running hand."] },
    ],
    notes: [
      "Some older guides give a 300 KB photo limit or a 4–30 KB signature limit; the 2026 values most widely reported are 10–200 KB and 10–100 KB.",
      "If you get a photo mismatch notice, upload a clear new photo through the correction window.",
    ],
    faqs: [
      { q: "What is the JEE Main photo size?", a: "10–200 KB in JPG, as reported for 2026." },
      { q: "What is the JEE Main signature size?", a: "10–100 KB in JPG, as reported." },
    ],
  },
  {
    slug: "cuet-ug",
    name: "CUET UG",
    fullName: "Common University Entrance Test (UG)",
    body: "National Testing Agency (NTA)",
    category: "Entrance",
    officialSite: "https://cuet.nta.nic.in",
    noticeRef: "CUET UG 2026 information bulletin (as reported)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "CUET UG is the admission test for central universities, and its photo rules follow the usual NTA pattern. Every year some candidates receive photo-mismatch notices, so use a clear, recent photo with a plain background.",
    docs: [
      { kind: "photo", label: "Photograph", minKB: 10, maxKB: 200, width: 413, height: 531, dpi: 300, dimensionNote: "No pixel size in the bulletin as reported. Our preset exports 3.5 × 4.5 cm (413 × 531 px at 300 DPI).", tips: ["Recent colour photo, light background, face clearly visible."] },
      { kind: "signature", label: "Signature", minKB: 10, maxKB: 50, width: 300, height: 120, dimensionNote: "No fixed pixel size reported. Our preset exports 300 × 120 px.", tips: ["Black ink on white paper."] },
    ],
    notes: [
      "Older guides quote 4–30 KB for the signature; the 2026 bulletin is reported to use 10–50 KB.",
      "Keep printed copies of the same photo for the exam day.",
    ],
    faqs: [
      { q: "What is the CUET UG photo size?", a: "10–200 KB in JPG, as reported for 2026." },
      { q: "What is the CUET UG signature size?", a: "10–50 KB in JPG, as reported for 2026." },
    ],
  },
  {
    slug: "nielit-ccc",
    name: "NIELIT CCC",
    fullName: "NIELIT Course on Computer Concepts (CCC)",
    body: "National Institute of Electronics & Information Technology",
    category: "Certification",
    officialSite: "https://student.nielit.gov.in",
    noticeRef: "NIELIT CCC examination guideline (as reported)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "The CCC certificate is required for many UP and central government jobs. NIELIT gives small, exact pixel sizes for the photo, and it cancels applications where the wrong photo is uploaded in the photo box.",
    docs: [
      { kind: "photo", label: "Photograph", minKB: 5, maxKB: 50, width: 132, height: 170, dpi: 96, dimensionNote: "3.5 × 4.5 cm, 132 × 170 px, 96–300 DPI.", tips: ["White background, recent colour photo (NIELIT says not older than six months).", "Upload it in the photo field, not the signature field."] },
      { kind: "signature", label: "Signature", minKB: 5, maxKB: 20, width: 140, height: 60, dpi: 96, dimensionNote: "5–20 KB, 96–200 DPI. Our preset exports 140 × 60 px.", tips: ["Black or blue ink on white paper."] },
    ],
    notes: [
      "NIELIT has cancelled applications where the photograph was uploaded in the wrong place, so check the preview before you pay.",
      "The signature limit is inferred from the guideline layout; confirm it on the application form.",
    ],
    faqs: [
      { q: "What is the CCC photo size?", a: "5–50 KB in JPG, 132 × 170 px (3.5 × 4.5 cm), as given in the NIELIT guideline." },
      { q: "What is the CCC signature size?", a: "5–20 KB in JPG." },
    ],
  },
  {
    slug: "pan-card",
    name: "PAN Card",
    fullName: "PAN application (Protean/NSDL and UTIITSL)",
    body: "Income Tax Department (via Protean and UTIITSL)",
    category: "Documents",
    officialSite: "https://www.onlineservices.nsdl.com",
    noticeRef: "Protean (NSDL) and UTIITSL upload instructions (as reported; sources differ)",
    lastChecked: "2026-11-22",
    livePhoto: false,
    intro:
      "New PAN and PAN correction forms ask for a scanned photo and signature in centimetres at 200 DPI. Phone cropping apps often change the DPI, which is why uploads fail. This tool writes 200 DPI into the file.",
    docs: [
      { kind: "photo", label: "Photograph", minKB: 5, maxKB: 50, width: 197, height: 276, dpi: 200, dimensionNote: "2.5 × 3.5 cm at 200 DPI = 197 × 276 px.", tips: ["White background, colour photo, face clearly visible."] },
      { kind: "signature", label: "Signature", minKB: 5, maxKB: 50, width: 354, height: 157, dpi: 200, dimensionNote: "4.5 × 2 cm at 200 DPI = 354 × 157 px.", tips: ["Sign on white paper with a dark pen, inside the box area."] },
    ],
    notes: [
      "UTIITSL and some guides quote different pixel sizes (for example 213 × 213 px photo or 400 × 200 px signature). Use the size shown on the portal you are applying through.",
      "Both photo and signature must be JPG and under the KB limit, with 200 DPI.",
    ],
    faqs: [
      { q: "What is the PAN card photo size?", a: "2.5 × 3.5 cm at 200 DPI (197 × 276 px), under 50 KB, for Protean/NSDL as reported." },
      { q: "What is the PAN card signature size?", a: "4.5 × 2 cm at 200 DPI (354 × 157 px), under 50 KB." },
      { q: "Why does the PAN site say invalid DPI?", a: "Many apps save images at 72 DPI. This tool writes 200 DPI into the JPG." },
    ],
  },
];

export function getExam(slug: string) {
  return exams.find((e) => e.slug === slug);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
