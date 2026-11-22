---
title: "Photo Size Explained: KB vs Pixels vs Centimetres vs DPI"
description: "Exam notices mix KB, pixels, cm and DPI. Learn what each one means, how to convert 3.5 × 4.5 cm to pixels, and which number the upload portal actually checks."
date: "2026-11-18"
category: "Photo guides"
tags: ["dpi", "pixels", "photo size", "3.5x4.5 cm"]
---

Exam notifications describe photos in four different ways, often in the same sentence: "3.5 cm × 4.5 cm, 200 × 230 pixels, 20–50 KB, 200 DPI". They are related, but they are not the same thing. Mixing them up is the most common reason students struggle with uploads.

## The four units in one table

| Unit | What it measures | Example | Checked by the portal? |
|---|---|---|---|
| **KB** (kilobytes) | How big the file is on disk | 20–50 KB | Almost always |
| **Pixels** | How many dots wide and tall the image is | 200 × 230 px | Often |
| **Centimetres / inches** | The printed size | 3.5 × 4.5 cm | Rarely (it depends on DPI) |
| **DPI** | Dots per inch when printed | 200 DPI | Rarely |

The portal can read the file size and pixel dimensions directly, so those are the two numbers that cause "invalid file" errors. Centimetres and DPI matter mainly for how the photo prints on your admit card.

## KB: file size

KB measures storage, not picture size. Two images with exactly the same pixels can have very different KB values depending on how much detail they contain and how strongly they are compressed. That is why the same photo can be 18 KB or 90 KB.

1 KB = 1024 bytes. Some portals count 1 KB as 1000 bytes. To be safe, aim a little inside the range — for a 20–50 KB limit, target about 25–48 KB.

## Pixels: dimensions

Pixels are the dots that make up the image. "200 × 230" means 200 pixels wide and 230 tall. Always write width first.

If the portal says "invalid dimensions", it is checking pixels. Use exactly the numbers in the notice; 201 × 230 can fail a strict check.

## Centimetres and DPI: print size

A digital image has no physical size until you decide how many pixels go in each inch. That is what DPI (dots per inch) means. The formula is:

**pixels = (cm ÷ 2.54) × DPI**

So a 3.5 cm × 4.5 cm photo at different DPI values is:

| DPI | Width (3.5 cm) | Height (4.5 cm) |
|---|---|---|
| 100 | 138 px | 177 px |
| 150 | 207 px | 266 px |
| 200 | 276 px | 354 px |
| 300 | 413 px | 531 px |

If a notice gives only centimetres, check whether it also mentions a DPI. If it does, use the formula. If it does not, 200 DPI is a reasonable choice for exam photos — it keeps the file small and still prints clearly at passport size.

## Why does the DPI in my file not match?

Every JPG stores a DPI value in its header, but most phones write 72 DPI regardless of the pixel size. A few portals read this value. Our [photo resizer](/tools/photo-resizer) writes the DPI from the exam preset (for example 200 DPI for IBPS) into the file header so it matches.

## Putting it together

When you read a notice:

1. **Pixels given?** Use them exactly.
2. **Only cm given?** Convert with the formula above (use the DPI if stated, otherwise 200).
3. **Nothing given?** Keep a passport shape (about 4:5) and stay within the KB range.
4. **Always** stay within both the minimum and maximum KB.

The [photo resizer](/tools/photo-resizer) and [signature resizer](/tools/signature-resizer) handle the pixel size and KB range together, so you do not have to calculate anything once you have the numbers.

## Quick answers

**What is 3.5 × 4.5 cm in pixels?** About 276 × 354 px at 200 DPI, or 413 × 531 px at 300 DPI.

**What is 2 × 2 inch in pixels?** 600 × 600 px at 300 DPI (common for visa photos).

**Does a bigger KB mean better quality?** Usually, for the same pixel size — but only up to a point. A well-compressed 40 KB photo can look identical to a 400 KB one at exam-photo dimensions.
