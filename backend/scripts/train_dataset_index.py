#!/usr/bin/env python3
"""
Train/Index Reference Dataset for Echoes of India Image Classification.
Reads instrument image folders from backend/app/data/dataset/,
computes image embedding representations, and indexes them into the active learning dataset.
"""

import os
import io
import json
import glob
from pathlib import Path
from PIL import Image

# Setup paths
BASE_DIR = Path(__file__).parent.parent
DATASET_DIR = BASE_DIR / "app" / "data" / "dataset"
DATA_LOGS_DIR = BASE_DIR / "app" / "data" / "dataset_logs"
LOG_FILE = DATA_LOGS_DIR / "confirmed_dataset.jsonl"
CENTROIDS_FILE = BASE_DIR / "app" / "data" / "dataset_centroids.json"

# Folder to instrument_id mapping
FOLDER_MAP = {
    "rudraveena": "rudra-veena",
    "rudra_veena": "rudra-veena",
    "rudra-veena": "rudra-veena",
    "yazh": "yazh",
    "ravanantha": "ravanahatha",
    "ravanahatha": "ravanahatha",
    "dilruba": "mayuri-veena",
    "mayuri-veena": "mayuri-veena",
    "taus": "mayuri-veena",
    "vedic_lute": "pinaka-veena",
    "pinaka-veena": "pinaka-veena",
    "jya": "yazh",
    "shankha": "shankha",
    "jal-tarang": "jal-tarang",
    "jaltarang": "jal-tarang",
    "nagfani": "nagfani",
    "pakhawaj": "pakhawaj",
    "algoza": "algoza",
    "pena": "pena",
    "morchang": "morchang",
    "kinnera": "kinnera"
}

from app.services.clip_service import clip_service

def index_all_dataset_images():
    print(f"Scanning dataset directory: {DATASET_DIR}")
    if not DATASET_DIR.exists():
        print("Dataset directory not found.")
        return

    DATA_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    
    total_indexed = 0
    per_instrument_counts = {}

    for folder in DATASET_DIR.iterdir():
        if not folder.is_dir() or folder.name.startswith("."):
            continue

        folder_key = folder.name.lower().replace(" ", "_").replace("-", "")
        # Find matching instrument ID
        inst_id = None
        for k, v in FOLDER_MAP.items():
            if k.replace("-", "").replace("_", "") == folder_key:
                inst_id = v
                break

        if not inst_id:
            inst_id = folder.name.lower()

        print(f"--> Indexing category: '{folder.name}' -> mapped to instrument '{inst_id}'")
        
        image_extensions = ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.avif", "*.JPG", "*.JPEG", "*.PNG")
        files = []
        for ext in image_extensions:
            files.extend(folder.glob(ext))

        inst_count = 0
        for img_path in files:
            try:
                with open(img_path, "rb") as img_file:
                    img_bytes = img_file.read()
                    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
                    
                    emb = clip_service.embed_image(img).tolist()
                    
                    record = {
                        "sample_id": f"ref_{inst_id}_{img_path.stem}",
                        "instrument_id": inst_id,
                        "file_name": img_path.name,
                        "embedding": emb,
                        "source": "curated_dataset_training"
                    }
                    
                    with open(LOG_FILE, "a", encoding="utf-8") as out:
                        out.write(json.dumps(record) + "\n")
                    
                    inst_count += 1
                    total_indexed += 1
            except Exception as e:
                print(f"    Skipping {img_path.name}: {e}")

        per_instrument_counts[inst_id] = per_instrument_counts.get(inst_id, 0) + inst_count
        print(f"    Indexed {inst_count} images for {inst_id}.")

    # Reload in-memory service index
    clip_service.build_reference_index()

    print("\n==========================================")
    print(f"TRAINING / INDEXING COMPLETE!")
    print(f"Total Reference Images Indexed: {total_indexed}")
    print("Breakdown per instrument:")
    for inst, count in per_instrument_counts.items():
        print(f"  - {inst}: {count} reference samples")
    print("==========================================\n")

if __name__ == "__main__":
    index_all_dataset_images()
