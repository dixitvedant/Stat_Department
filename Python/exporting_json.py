import os
import json

def export_json(data, filename):
    OUTPUT_DIR = "outputs"               # Folder name
    os.makedirs(OUTPUT_DIR, exist_ok=True)  # Create folder if missing
    path = os.path.join(OUTPUT_DIR, filename)  # Full path
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f" JSON file created: {path}")