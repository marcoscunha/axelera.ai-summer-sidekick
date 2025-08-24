import os
import shutil


# Configure paths
labels_path = "notebooks/datasets/coco/coco/labels"
images_path = "notebooks/datasets/coco/coco/images"
subfolders = {
    "train2017": {
        "max_per_class": 900
    },
    "val2017": {
        "max_per_class": 100
    }
}

# Output path
dst_path = "notebooks/datasets/coco/coco_subset/"
dst_images_path = f"{dst_path}/images"
dst_labels_path = f"{dst_path}/labels"

# Specify the classes to filter (class_name: class_id)
filter_classes = {
    "cat": {
        "id": 15,
        "count": 0
    },
    "potted_plant": {
        "id": 58,
        "count": 0
    },
}

filter_classes_ids = {v["id"]: k for k, v in filter_classes.items()}

for folder, settings in subfolders.items():
    filter_classes = {k: {"id": v["id"], "count": 0} for k, v in filter_classes.items()}

    os.makedirs(f"{dst_images_path}/{folder}", exist_ok=True)
    os.makedirs(f"{dst_labels_path}/{folder}", exist_ok=True)

    label_filenames = os.listdir(f"{labels_path}/{folder}")

    for filename in label_filenames:

        if filename.endswith(".txt") is False:
            continue

        label_path = f"{labels_path}/{folder}/{filename}"

        with open(f"{label_path}", "r") as f:
            lines = f.readlines()

        # Find in the first column if any of the filter_classes are present
        filtered_lines = [line
                          for line in lines
                          if int(line.split()[0]) in filter_classes_ids]

        if len(filtered_lines) == 0:
            continue

        # Increment the count for each class found
        for line in filtered_lines:
            class_id = int(line.split()[0])
            if class_id in filter_classes_ids:
                filter_classes[filter_classes_ids[class_id]]["count"] += 1

        # If the number of filtered classes is above a threshold (400), skip the file
        if all([class_info["count"] > settings["max_per_class"] for class_info in filter_classes.values()]):
            print("Reached max count for all classes. Stopping.")
            break

        for class_info in filter_classes.values():
            if class_info["count"] > settings["max_per_class"]:
                print(f"Skipping {filename} as class {class_info} exceeded max count.")
                continue

        # Copy the image and label file to the destination folder
        shutil.copy2(f"{labels_path}/{folder}/{filename}", f"{dst_labels_path}/{folder}/{filename}")

        image_filename = filename.replace(".txt", ".jpg")
        shutil.copy2(f"{images_path}/{folder}/{image_filename}", f"{dst_images_path}/{folder}/{image_filename}")

        print(f"Copied {filename} and {image_filename} to subset.")





