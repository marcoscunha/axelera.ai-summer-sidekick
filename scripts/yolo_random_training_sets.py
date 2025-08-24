import os
import shutil
import random

BASE_SRC_PATH = "datasets/label-studio-exported/project-4-at-2025-08-21-14-34-f9b97a6f"
BASE_DST_PATH = "datasets/training/yolo_finetuning"

SRC_DIR = f"{BASE_SRC_PATH}/grouped_labels/"
DST_DIR = f"{BASE_DST_PATH}"

SPLITS = {
    "train": 0.8,
    "val": 0.1,
    "test": 0.1
}

random.seed(42)

os.makedirs(DST_DIR, exist_ok=True)
os.makedirs(f"{DST_DIR}/test", exist_ok=True)
os.makedirs(f"{DST_DIR}/test/images", exist_ok=True)
os.makedirs(f"{DST_DIR}/test/labels", exist_ok=True)
os.makedirs(f"{DST_DIR}/train", exist_ok=True)
os.makedirs(f"{DST_DIR}/train/images", exist_ok=True)
os.makedirs(f"{DST_DIR}/train/labels", exist_ok=True)
os.makedirs(f"{DST_DIR}/val", exist_ok=True)
os.makedirs(f"{DST_DIR}/val/images", exist_ok=True)
os.makedirs(f"{DST_DIR}/val/labels", exist_ok=True)

images = [
    i
    for i in os.listdir(f"{SRC_DIR}/images")
    if i.lower().endswith(".jpg")
]

random.shuffle(images)
n = len(images)
n_train = int(n * SPLITS["train"])
n_val = int(n * SPLITS["val"])
n_test = n - n_train - n_val

group_indices = {
    "train": (0, n_train),
    "val": (n_train, n_train + n_val),
    "test": (n_train + n_val, n)
}


for group, (start, end) in group_indices.items():

    group_folder = os.path.join(f"{DST_DIR}", group)

    for img_name in images[start:end]:

        src_img = os.path.join(f"{SRC_DIR}/images", img_name)
        src_labels = os.path.join(f"{SRC_DIR}/labels", img_name.replace(".jpg", ".txt"))

        dst_img = os.path.join(f"{group_folder}/images/", img_name)
        dst_labels = os.path.join(f"{group_folder}/labels/", img_name.replace(".jpg", ".txt"))

        shutil.copy2(src_img, dst_img)
        shutil.copy2(src_labels, dst_labels)

    print(f"{group}: {end - start} images and labels copied.")

print("Done.")
