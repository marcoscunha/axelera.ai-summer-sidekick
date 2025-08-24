import os
import json

# BASE_PATH = "datasets/pet_maintenance/project-4-at-2025-08-19-16-19-242b2b08"
BASE_PATH = "datasets/label-studio-exported/project-4-at-2025-08-21-14-34-f9b97a6f"
NOTES_PATH = f"{BASE_PATH}/notes.json"
START_CLASS_IDX = 80  # Starting index for merged classes

labels_path = f"{BASE_PATH}/labels/"
output_path = f"{BASE_PATH}/grouped_labels/"
output_labels_path = f"{BASE_PATH}/grouped_labels/labels"
os.makedirs(output_path, exist_ok=True)
os.makedirs(output_labels_path, exist_ok=True)

# Load class names and ids from notes.json
with open(NOTES_PATH, "r") as f:
    notes = json.load(f)
categories = notes["categories"]

# Build prefix-to-id mapping (merge all classes by prefix)
prefix_to_ids = {}
for cat in categories:
    prefix = cat["name"].split("_")[0] if "_" in cat["name"] else cat["name"]
    if prefix not in prefix_to_ids:
        prefix_to_ids[prefix] = []
    prefix_to_ids[prefix].append(cat["id"])

# Assign new merged ids for each prefix (sorted for consistency)
merged_prefixes = sorted(prefix_to_ids.keys())
merged_prefix_to_id = {
    prefix: idx+START_CLASS_IDX
    for idx, prefix in enumerate(merged_prefixes)
}

# Build group id to merged id mapping
groupid_to_mergedid = {}
for prefix, ids in prefix_to_ids.items():
    merged_id = merged_prefix_to_id[prefix]
    for gid in ids:
        groupid_to_mergedid[gid] = merged_id

# Save classes.txt (merged classes, one per prefix)
classes_txt_path = os.path.join(output_path, "classes.txt")
with open(classes_txt_path, "w") as f:
    for prefix in merged_prefixes:
        f.write(f"{prefix}\n")
print(f"Saved merged classes to {classes_txt_path}")

# Save notes.json (merged categories, one per prefix)
merged_categories = [{"id": merged_prefix_to_id[prefix], "name": prefix} for prefix in merged_prefixes]
merged_notes = notes.copy()
merged_notes["categories"] = merged_categories
merged_notes_path = os.path.join(output_path, "notes.json")
with open(merged_notes_path, "w") as f:
    json.dump(merged_notes, f, indent=4)
print(f"Saved merged notes to {merged_notes_path}")

# Process label files (update class ids to merged ids)
for filename in os.listdir(labels_path):
    if filename.endswith(".txt"):
        label_path = os.path.join(labels_path, filename)
        with open(label_path, "r") as f:
            lines = f.readlines()
        new_lines = []
        for line in lines:
            parts = line.strip().split()
            if not parts:
                continue
            group_id = int(float(parts[0]))
            merged_id = groupid_to_mergedid.get(group_id, group_id)
            parts[0] = str(merged_id)
            new_lines.append(" ".join(parts) + "\n")
        # Write to output path
        out_path = os.path.join(output_labels_path, filename)
        with open(out_path, "w") as f:
            f.writelines(new_lines)
        print(f"Processed {filename}: saved to {output_labels_path}")

