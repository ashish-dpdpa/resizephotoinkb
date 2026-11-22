---
title: "Photo Size Explained: KB vs Pixels vs Centimetres vs DPI"
description: "Exam notices mix KB, pixels, cm and DPI in one line. What each one means, how to turn 3.5 × 4.5 cm into pixels, and which number the upload portal actually checks."
date: "2026-11-18"
category: "Photo guides"
tags: ["dpi", "pixels", "photo size", "3.5x4.5 cm"]
---

Here's a line you'll find, give or take, in a lot of exam notices: *photograph 3.5 cm × 4.5 cm, 200 × 230 pixels, 20 to 50 KB, 200 DPI.* Four different units in one sentence. They're related, but they're not the same thing, and mixing them up is behind most of the upload errors students run into.

Let's take them one at a time.

## KB is how heavy the file is

KB (kilobytes) is the amount of storage the file takes up. It has nothing directly to do with how big the picture looks.

That's why the same photo can be 18 KB or 90 KB depending on how much it's compressed and how much detail is in it. A photo against a plain white wall will always come out smaller than the same photo against a bookshelf.

One small trap: some portals count 1 KB as 1024 bytes and some as 1000. If you aim a little inside the range, say 25 to 48 KB for a 20 to 50 KB limit, you never have to think about it.

## Pixels are how big the picture is

Pixels are the tiny dots the image is made of. "200 × 230" means 200 dots wide and 230 tall, and width always comes first.

When a portal says "invalid dimensions", this is the number it's unhappy with. Strict portals want the exact numbers, so 201 × 230 can fail where 200 × 230 passes.

## Centimetres and DPI are about printing

A digital photo doesn't have a size in centimetres until you decide how many pixels go into each inch. That's all DPI (dots per inch) means. The conversion is:

**pixels = cm ÷ 2.54 × DPI**

So the familiar 3.5 × 4.5 cm passport size works out like this:

| DPI | Width (3.5 cm) | Height (4.5 cm) |
|---|---|---|
| 100 | 138 px | 177 px |
| 150 | 207 px | 266 px |
| 200 | 276 px | 354 px |
| 300 | 413 px | 531 px |

If your notice only gives centimetres, look for a DPI nearby and use the formula. If there's no DPI either, 200 is a sensible default for exam photos. It keeps the file small and still prints clearly at passport size.

## Which number does the portal really check?

| Unit | What it measures | Checked by the portal? |
|---|---|---|
| KB | File size | Almost always |
| Pixels | Width and height | Often |
| cm | Printed size | Rarely on its own |
| DPI | Pixels per inch | Sometimes |

KB and pixels are what cause rejections. Centimetres and DPI mostly decide how the photo looks when it's printed on your admit card.

## Why does my photo say 72 DPI?

Every JPG stores a DPI value inside it, and most phones write 72 no matter how big the photo is. A few portals, PAN card forms in particular, read that value and complain. Our [photo resizer](/tools/photo-resizer) and [DPI converter](/tools/dpi-converter) write the DPI your form asks for, like 200, straight into the file.

## The short version

When you read a notice, ask yourself in this order:

1. Does it give pixels? Use them exactly.
2. Only centimetres? Convert with the formula, using the stated DPI or 200.
3. Nothing at all? Keep a passport shape, roughly 4:5, and just stay inside the KB range.
4. In every case, respect both the minimum and the maximum KB.

If you'd rather not do the maths, the [resize in cm](/tools/resize-image-in-cm) tool takes centimetres and DPI directly, and the [pixel to cm converter](/tools/pixel-to-cm) shows the numbers both ways.

A few conversions people search for a lot: 3.5 × 4.5 cm is about 276 × 354 px at 200 DPI, or 413 × 531 px at 300 DPI. A 2 × 2 inch photo is 600 × 600 px at 300 DPI.
