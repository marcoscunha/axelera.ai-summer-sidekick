import subprocess

MODEL_DIR = "notebooks/"
# List of .onnx files to copy
onnx_files = [
    "yolo11m_bowl_fountain_finetune.onnx",
    "yolo11n_bowl_fountain_finetune.onnx",
    "mobilenetv2_bowl_level_classifier.onnx",
    "mobilenetv2_fountain_level_classifier.onnx",
    "mobilenetv2_plant_health_classifier.onnx"
    ]

user = "aetina"
ip_address = "192.168.1.111"
target_path = "/media/sdcard/axelera/devel/voyager-sdk/customers/models/"

cmd = [
    "scp",
    *[f"{MODEL_DIR}/{file}" for file in onnx_files],
    f"{user}@{ip_address}:{target_path}"
]
print(f"Copying {onnx_files} to {user}@{ip_address}:{target_path}")
subprocess.run(cmd, check=True)