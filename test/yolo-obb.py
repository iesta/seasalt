#!/usr/bin/env python3
"""
YOLO-OBB card counter using yolov8n-obb.pt (oriented bounding boxes).
Output: test/tests-yolo.csv
"""

import os, csv, json, time
from pathlib import Path
from ultralytics import YOLO

TEST_DIR = Path(__file__).parent.resolve()
CSV_PATH = TEST_DIR / "tests-yolo.csv"
MODEL_NAME = "yolov8n-obb.pt"
CONF_THRESHOLD = 0.05

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}

def main():
    images = sorted([f for f in os.listdir(TEST_DIR) if Path(f).suffix.lower() in IMAGE_EXTS])
    if not images:
        print("❌ No images")
        return

    print(f"\n🧪 YOLO-OBB Card Counter")
    print(f"   Model: {MODEL_NAME}")
    print(f"   Threshold: {CONF_THRESHOLD}")
    print(f"   Images: {len(images)}\n")

    print("Loading model...")
    t0 = time.time()
    model = YOLO(MODEL_NAME)
    print(f"   Loaded in {time.time()-t0:.1f}s\n")

    with open(CSV_PATH, "w", newline="") as f:
        csv.writer(f).writerow(["image", "card_count_yolo_obb", "detections_raw"])

    for i, img_name in enumerate(images, 1):
        img_path = TEST_DIR / img_name
        print(f"[{i}/{len(images)}] 📸 {img_name}")

        t0 = time.time()
        results = model.predict(str(img_path), conf=CONF_THRESHOLD, verbose=False)
        elapsed = time.time() - t0

        dets = results[0]
        boxes = dets.obb if dets.obb is not None else dets.boxes
        count = len(boxes) if boxes is not None else 0

        det_list = []
        if count > 0:
            for box in boxes:
                cls = int(box.cls[0]) if box.cls is not None else -1
                conf = float(box.conf[0]) if box.conf is not None else 0
                cls_name = dets.names[cls] if cls >= 0 else "?"
                xyxy = [round(float(v)) for v in box.xyxy[0].tolist()] if hasattr(box, 'xyxy') and box.xyxy is not None else []
                print(f"   → {cls_name} {conf:.3f} {xyxy}")
                det_list.append({"cls": cls_name, "conf": round(conf, 3), "xyxy": xyxy})

        print(f"   Count: {count} cards in {elapsed:.1f}s")
        with open(CSV_PATH, "a", newline="") as f:
            csv.writer(f).writerow([img_name, count, json.dumps(det_list, ensure_ascii=False)])

    print(f"\n✅ {CSV_PATH}")

if __name__ == "__main__":
    main()