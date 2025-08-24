import subprocess

MODEL_DIR = "notebooks/"
# List of .onnx files to copy
onnx_files = [
    "yolo11m_bowl_fountain_finetune.onnx",
    "yolo11n_bowl_fountain_finetune.onnx",
    "mobilenetv2_bowl_level_classifier.onnx",
]

user = "aetina"
ip_address = "192.168.1.111"
target_path = "/media/sdcard/axelera/devel/voyager-sdk/customers/models/"

for file in onnx_files:
    cmd = [
        "scp",
        f"{MODEL_DIR}/{file}",
        f"{user}@{ip_address}:{target_path}"
    ]
    print(f"Copying {file} to {user}@{ip_address}:{target_path}")
    subprocess.run(cmd, check=True)