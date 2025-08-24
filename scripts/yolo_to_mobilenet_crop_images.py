import cv2
import os
import json

# BASE_PATH = "datasets/pet_maintenance/project-4-at-2025-08-19-16-19-242b2b08"
BASE_PATH = "datasets/label-studio-exported/project-4-at-2025-08-21-14-34-f9b97a6f"
NOTES_PATH = f"{BASE_PATH}/notes.json"

# Paths
images_path = f"{BASE_PATH}/images/"
labels_path = f"{BASE_PATH}/labels/"
output_path = f"{BASE_PATH}/cropped/"


# Load class names from notes.json
with open(NOTES_PATH, "r") as f:
    notes = json.load(f)
class_map = {cat["id"]: cat["name"] for cat in notes["categories"]}

os.makedirs(output_path, exist_ok=True)


for filename in os.listdir(images_path):
    if filename.endswith(".jpg") or filename.endswith(".png"):
        image_path = os.path.join(images_path, filename)
        label_path = os.path.join(labels_path, filename.replace(".jpg", ".txt").replace(".png", ".txt"))

        print(f"Processing image: {filename}")
        image = cv2.imread(image_path)
        h, w, _ = image.shape

        with open(label_path, "r") as f:
            lines = f.readlines()
            print(f"  Found {len(lines)} objects in label file.")
            for i, line in enumerate(lines):
                cls, x_center, y_center, bw, bh = map(float, line.split())
                x_center, y_center, bw, bh = x_center * w, y_center * h, bw * w, bh * h

                x1 = int(x_center - bw/2)
                y1 = int(y_center - bh/2)
                x2 = int(x_center + bw/2)
                y2 = int(y_center + bh/2)

                cropped = image[y1:y2, x1:x2]
                class_name = class_map.get(int(cls), f"class_{int(cls)}")
                class_folder = os.path.join(output_path, class_name)
                os.makedirs(class_folder, exist_ok=True)
                out_name = f"{os.path.splitext(filename)[0]}_{i}.jpg"
                out_path = os.path.join(class_folder, out_name)
                cv2.imwrite(out_path, cropped)
                print(f"    Cropped object {i+1}: saved to {out_path}")