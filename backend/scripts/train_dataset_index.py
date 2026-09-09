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
import numpy as np
from pathlib import Path
from PIL import Image

# Setup paths
# Setup paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "app" / "data"
DATASET_DIR = DATA_DIR / "dataset"
DATA_LOGS_DIR = DATA_DIR / "dataset_logs"
LOG_FILE = DATA_LOGS_DIR / "confirmed_dataset.jsonl"
CENTROIDS_FILE = DATA_DIR / "dataset_centroids.json"

# Folder to instrument_id mapping
FOLDER_MAP = {
    "rudraveena": "rudra-veena",
    "rudra_veena": "rudra-veena",
    "rudra-veena": "rudra-veena",
    "rudra veena": "rudra-veena",
    "yazh": "yazh",
    "jya": "yazh",
    "ravanantha": "ravanahatha",
    "ravanahatha": "ravanahatha",
    "dilruba": "mayuri-veena",
    "mayuri-veena": "mayuri-veena",
    "mayuriveena": "mayuri-veena",
    "mayuri veena": "mayuri-veena",
    "taus": "mayuri-veena",
    "vedic_lute": "pinaka-veena",
    "vediclute": "pinaka-veena",
    "vedic lute": "pinaka-veena",
    "pinaka-veena": "pinaka-veena",
    "pinakaveena": "pinaka-veena",
    "pinaka veena": "pinaka-veena",
    "shankha": "shankha",
    "jal-tarang": "jal-tarang",
    "jaltarang": "jal-tarang",
    "jal tarang": "jal-tarang",
    "nagfani": "nagfani",
    "pakhawaj": "pakhawaj",
    "algoza": "algoza",
    "pena": "pena",
    "morchang": "morchang",
    "kinnera": "kinnera",
    "kinnarivina": "kinnera",
    "kinnari vina": "kinnera",
    "kinnari_vina": "kinnera",
    "ejuk tapung": "ejuk-tapung",
    "ejuk_tapung": "ejuk-tapung",
    "ejuktapung": "ejuk-tapung"
}

from app.services.clip_service import clip_service
import zipfile

def extract_zips_if_present():
    """Extracts any .zip files placed in app/data or subfolders."""
    for zip_path in DATA_DIR.glob("**/*.zip"):
        if "__MACOSX" in str(zip_path):
            continue
        print(f"📦 Extracting zip archive: {zip_path.name} into {DATASET_DIR}...")
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(DATASET_DIR)
            print(f"✅ Extracted {zip_path.name} successfully.")
        except Exception as e:
            print(f"⚠️ Failed to extract {zip_path.name}: {e}")

def resolve_instrument_id(folder_name: str) -> str:
    cleaned = folder_name.lower().strip().replace("-", "").replace("_", "").replace(" ", "")
    for k, v in FOLDER_MAP.items():
        k_clean = k.lower().replace("-", "").replace("_", "").replace(" ", "")
        if k_clean == cleaned or k_clean in cleaned or cleaned in k_clean:
            return v
    return folder_name.lower().replace(" ", "-")

def index_all_dataset_images():
    extract_zips_if_present()
    DATA_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Reset log file cleanly for re-indexing
    if LOG_FILE.exists():
        LOG_FILE.unlink()

    # Search in both dataset and dataset1 or any data directory
    candidate_dirs = [d for d in DATA_DIR.iterdir() if d.is_dir() and "dataset" in d.name.lower()]
    if not candidate_dirs:
        candidate_dirs = [DATASET_DIR]

    total_indexed = 0
    per_instrument_counts = {}
    seen_files = set()

    image_extensions = ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.avif", "*.JPG", "*.JPEG", "*.PNG")

    for cand_dir in candidate_dirs:
        for folder in cand_dir.glob("**/*"):
            if not folder.is_dir() or "__MACOSX" in str(folder) or folder.name.startswith("."):
                continue

            # Check if this folder directly contains image files
            files = []
            for ext in image_extensions:
                files.extend(folder.glob(ext))

            if not files:
                continue

            inst_id = resolve_instrument_id(folder.name)
            print(f"--> Indexing category folder: '{folder.name}' -> mapped to instrument '{inst_id}' ({len(files)} files)")

            inst_count = 0
            for img_path in files:
                resolved_path = str(img_path.resolve())
                if img_path.name.startswith(".") or resolved_path in seen_files:
                    continue
                seen_files.add(resolved_path)

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

    # Reload in-memory service index
    clip_service.build_reference_index()

    # Compute and save centroid vectors for frontend & offline use
    centroids = {}
    for inst_id, emb_list in clip_service.reference_index.items():
        if emb_list:
            stacked = np.array(emb_list, dtype=np.float32)
            mean_vec = np.mean(stacked, axis=0)
            norm = np.linalg.norm(mean_vec)
            if norm > 1e-6:
                mean_vec = mean_vec / norm
            centroids[inst_id] = mean_vec.tolist()

    with open(CENTROIDS_FILE, "w", encoding="utf-8") as f:
        json.dump(centroids, f, indent=2)
    print(f"💾 Exported learned centroid vectors to {CENTROIDS_FILE}")

    print("\n==========================================")
    print(f"🎉 TRAINING & INDEXING COMPLETE!")
    print(f"Total Unique Reference Images Indexed: {total_indexed}")
    print("Breakdown per instrument:")
    for inst, count in sorted(per_instrument_counts.items()):
        print(f"  • {inst}: {count} reference samples")
    print("==========================================\n")

if __name__ == "__main__":
    index_all_dataset_images()

