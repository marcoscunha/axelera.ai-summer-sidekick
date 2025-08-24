import os
import shutil
import random

BASE_PATH = "datasets/label-studio-exported/project-4-at-2025-08-21-14-34-f9b97a6f"
SRC_PATH = f"{BASE_PATH}/cropped/"
DST_PATH = f"{BASE_PATH}/splited/"
SPLITS = {"train": 0.8, "val": 0.1, "test": 0.1}

random.seed(42)

os.makedirs(DST_PATH, exist_ok=True)

groups = [d for d in os.listdir(SRC_PATH) if os.path.isdir(os.path.join(SRC_PATH, d))]
for group in groups:
    group_path = os.path.join(SRC_PATH, group)
    images = [f for f in os.listdir(group_path) if f.lower().endswith(".jpg")]
    random.shuffle(images)
    n = len(images)
    n_train = int(n * SPLITS["train"])
    n_val = int(n * SPLITS["val"])
    n_test = n - n_train - n_val
    split_indices = {
        "train": (0, n_train),
        "val": (n_train, n_train + n_val),
        "test": (n_train + n_val, n)
    }
    for split, (start, end) in split_indices.items():
        split_folder = os.path.join(DST_PATH, split, group)
        os.makedirs(split_folder, exist_ok=True)
        for img_name in images[start:end]:
            src_img = os.path.join(group_path, img_name)
            dst_img = os.path.join(split_folder, img_name)
            shutil.copy2(src_img, dst_img)
        print(f"{split}/{group}: {end - start} images copied.")
print("Done.")
