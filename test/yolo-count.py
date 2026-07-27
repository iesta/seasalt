#!/usr/bin/env python3
"""
Card counter using OpenCV contour detection.
Finds rectangular contours with card-like aspect ratio.
"""

import os, csv, json, time
from pathlib import Path
import cv2
import numpy as np

TEST_DIR = Path(__file__).parent.resolve()
CSV_PATH = TEST_DIR / "tests-yolo.csv"
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}

MIN_AREA = 30000
CARD_ASPECT_MIN = 1.2
CARD_ASPECT_MAX = 2.0

def count_cards(img_path: Path) -> tuple[int, list[dict]]:
    img = cv2.imread(str(img_path))
    if img is None:
        return 0, []

    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 30, 100)

    # Dilate edges to connect nearby contours
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    dilated = cv2.dilate(edges, kernel, iterations=2)

    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    cards = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < MIN_AREA:
            continue

        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)

        if len(approx) == 4:
            x, y, bw, bh = cv2.boundingRect(approx)
            aspect = max(bw, bh) / min(bw, bh)
            if CARD_ASPECT_MIN <= aspect <= CARD_ASPECT_MAX:
                cards.append({
                    "bbox": [int(x), int(y), int(bw), int(bh)],
                    "aspect": round(aspect, 2),
                    "area": int(area),
                })

    # Remove overlapping detections (NMS)
    cards.sort(key=lambda c: c["area"], reverse=True)
    kept = []
    for c in cards:
        overlap = False
        for k in kept:
            cx1, cy1, cw, ch = c["bbox"]
            cx2, cy2 = cx1 + cw, cy1 + ch
            kx1, ky1, kw, kh = k["bbox"]
            kx2, ky2 = kx1 + kw, ky1 + kh
            ix1, iy1 = max(cx1, kx1), max(cy1, ky1)
            ix2, iy2 = min(cx2, kx2), min(cy2, ky2)
            if ix1 < ix2 and iy1 < iy2:
                inter = (ix2 - ix1) * (iy2 - iy1)
                union = cw * ch + kw * kh - inter
                if inter / union > 0.4:
                    overlap = True
                    break
        if not overlap:
            kept.append(c)

    return len(kept), kept


def main():
    images = sorted(
        [f for f in os.listdir(TEST_DIR) if Path(f).suffix.lower() in IMAGE_EXTS]
    )
    if not images:
        print("❌ No images in test/")
        return

    print(f"\n🧪 OpenCV Card Counter (contour detection)")
    print(f"   Aspect ratio: {CARD_ASPECT_MIN}–{CARD_ASPECT_MAX}")
    print(f"   Min area: {MIN_AREA}px")
    print(f"   Images: {len(images)}\n")

    with open(CSV_PATH, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["image", "card_count_opencv", "detections_raw"])

    for i, img_name in enumerate(images, 1):
        img_path = TEST_DIR / img_name
        print(f"[{i}/{len(images)}] 📸 {img_name}")

        t0 = time.time()
        count, dets = count_cards(img_path)
        elapsed = time.time() - t0

        for d in dets:
            x, y, bw, bh = d["bbox"]
            print(f"   → card at ({x},{y}) {bw}x{bh} aspect={d['aspect']}")

        print(f"   Count: {count} cards in {elapsed:.1f}s")

        det_raw = json.dumps(dets, ensure_ascii=False)
        with open(CSV_PATH, "a", newline="") as f:
            w = csv.writer(f)
            w.writerow([img_name, count, det_raw])

    print(f"\n✅ {CSV_PATH}")


if __name__ == "__main__":
    main()