import os
import json

def export_json(data, filename):
    """
    Export Python object to JSON file inside 'outputs' folder.
    Uses:
        - os.makedirs (from os lib) to create folder if it doesn't exist
        - json.dump (from json lib) to write JSON data
    """
    OUTPUT_DIR = "outputs"               # Folder name
    os.makedirs(OUTPUT_DIR, exist_ok=True)  # Create folder if missing
    path = os.path.join(OUTPUT_DIR, filename)  # Full path
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ JSON file created: {path}")