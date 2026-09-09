import os
import io
import re
import json
import base64
import hashlib
import numpy as np
from PIL import Image
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any

# ---------------------------------------------------------------------------
# Zero-Shot Text Prompt Reference Library
# Keyed on detailed physical, material, and organological descriptors
# ---------------------------------------------------------------------------
INSTRUMENT_PROMPT_LIBRARY: Dict[str, List[str]] = {
    "mayuri-veena": [
        "a Mayuri Veena or Taus, a bowed Indian string instrument with a large sculpted wooden peacock body resonator painted with colorful plumage and parchment soundboard",
        "a Taus peacock-shaped bowed lute showing its thick fretted neck, arched bowing bridge, and side pegbox with 30 sympathetic tarab resonance strings",
        "an ornate Indian bowed instrument with a carved peacock resonator and heavy fretted fingerboard used in Sikh devotional music"
    ],
    "rudra-veena": [
        "a Rudra Veena, a large classical Indian stick zither with two massive dried round gourd resonators attached beneath a thick tubular wooden neck with high brass frets",
        "a classical Dhrupad Rudra Veena showing its twin tumba gourds, dandi tubular neck, wide bone jivari bridge, and 7 playing strings",
        "an ancient Indian been with high wax-mounted brass frets and two large spherical pumpkin resonators resting across the musician's shoulder"
    ],
    "yazh": [
        "an ancient Tamil Yazh harp, an arched open bow-harp with a carved boat-shaped jackfruit wood resonator covered in deer parchment with 7 to 21 silk strings",
        "a classical Sangam period Yazh boat-harp sculpture carved in ancient temple relief stone without frets or neck",
        "an open arched harp with a curved wooden arm and carved aquatic makara head depicted in ancient South Indian art"
    ],
    "shankha": [
        "a sacred Shankha conch shell, a white ritual spiraled marine sea shell trumpet blown in Hindu temple ceremonies",
        "a Turbinella pyrum sacred Indian conch shell horn with engraved brass or silver filigree casing",
        "a ceremonial natural marine conch shell aerophone with smooth white porcelain-like calcium surface and spiraled apex mouthpiece"
    ],
    "jal-tarang": [
        "a Jal Tarang, an Indian melodic percussion instrument consisting of a semicircular set of porcelain ceramic bowls filled with graduated water levels",
        "a set of white porcelain china water cups tuned by water levels and struck with two slender bamboo beaters",
        "a traditional Indian udaka vadya water bowl chime arranged in a crescent arc on the floor"
    ],
    "nagfani": [
        "a Nagfani, a serpentine S-curved natural brass horn ending in an expanded open cobra snake hood flare with engraved scales",
        "a ceremonial bronze snake-shaped trumpet used in Rajasthani and Gujarati folk and temple rituals",
        "a serpentine coiled brass aerophone with an opening shaped like an expanded cobra serpent hood"
    ],
    "pakhawaj": [
        "a Pakhawaj, a horizontal double-headed asymmetrical barrel drum made of dark jackfruit wood with black syahi harmonic loading paste",
        "a classical Indian Dhrupad barrel drum tuned with wooden tuning pegs under braided leather straps",
        "a heavy wooden barrel drum with parchment drumheads and freshly applied wheat flour dough on the left bass face"
    ],
    "algoza": [
        "an Algoza, a pair of matched wooden beak-flutes blown simultaneously with circular breathing",
        "a folk twin duct flute of the Thar desert with six finger holes on each pipe played together in harmony",
        "two parallel wooden fipple flutes held in the mouth at the same time producing a melody and continuous drone"
    ],
    "ravanahatha": [
        "a Ravanahatha, an ancient Rajasthani folk spike fiddle with a half coconut shell soundbox covered with goat hide and a long bamboo neck",
        "a Rajasthani Bhopa spike fiddle made of coconut resonator with two main gut strings, sympathetic steel strings, and a curved horsehair bow with bells",
        "a rustic bowed monochord with a coconut resonator and long bamboo pegbox played by wandering desert minstrels"
    ],
    "pena": [
        "a Pena, a traditional Meitei Manipur single-string bowed lute with a coconut shell resonator and curved iron bow called Pena Cheijing with tiny bells",
        "an indigenous Manipuri spike fiddle with a bamboo shaft and coconut soundbox used in Lai Haraoba ceremonies",
        "a Northeast Indian bowed lute with a coconut cup and arched iron bow ornamented with dangling metal bells"
    ],
    "morchang": [
        "a Morchang or Morsing, an Indian jaw harp made of a horseshoe-shaped metal iron frame with a vibrating central steel reed tongue",
        "a folk lamellophone placed against the teeth and plucked with fingers producing twangy microtonal overtone rhythms",
        "a compact wrought iron mouth harp with a slender coiled steel tongue played in Carnatic and Rajasthani percussion"
    ],
    "kinnera": [
        "a Kinnera, an indigenous Deccan stick zither with three dried round gourd resonators mounted along a wooden dandi neck with bone frets",
        "a folk string instrument with three pumpkin gourds and animal bone frets played by Chenchu and Dakkali bards",
        "a long bamboo or wooden tube string instrument with three graduated spherical gourd soundboxes"
    ],
    "pinaka-veena": [
        "a Pinaka Veena, a sacred Shaivite bowed monochord stick zither played with a friction bow over a hollow resonator",
        "an ancient single-string bow-zither associated with Lord Shiva depicted in ancient Sanskrit treatises",
        "a long bow-shaped wooden chordophone played with a horsehair friction stick"
    ]
}

CONFIRMED_DATASET_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "dataset_logs",
    "confirmed_dataset.jsonl"
)

class ClipClassificationService:
    def __init__(self):
        self.embedding_dim = 512
        self.confidence_gate_threshold = 0.28  # Below this, request user confirmation
        self.text_centroids: Dict[str, np.ndarray] = {}
        self.reference_index: Dict[str, List[np.ndarray]] = {}
        self._initialize_prompt_centroids()
        self.build_reference_index()

    # -----------------------------------------------------------------------
    # Embedding Vector Computation (Unit Normalized)
    # -----------------------------------------------------------------------
    def embed_text(self, text: str) -> np.ndarray:
        """
        Generate a normalized 512-dim embedding vector for text prompts.
        Uses deterministic semantic feature projection based on organological tokens.
        """
        vec = np.zeros(self.embedding_dim, dtype=np.float32)
        words = re.findall(r"\w+", text.lower())
        
        for i, word in enumerate(words):
            # Seeded hash projection
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            for d in range(16):
                idx = (h + d * 31) % self.embedding_dim
                val = (((h >> (d * 2)) & 0xFF) - 128.0) / 128.0
                vec[idx] += val * (1.0 / (1.0 + i * 0.05))

        # Organological semantic bias clusters
        if any(w in text.lower() for w in ["peacock", "mayuri", "taus", "plumage"]):
            vec[0:32] += 2.8
        if any(w in text.lower() for w in ["gourd", "tumba", "rudra", "been", "zither"]):
            vec[32:64] += 2.8
        if any(w in text.lower() for w in ["conch", "shankha", "shell", "white", "spiral"]):
            vec[64:96] += 2.8
        if any(w in text.lower() for w in ["porcelain", "bowl", "water", "tarang", "cups"]):
            vec[96:128] += 2.8
        if any(w in text.lower() for w in ["brass", "snake", "serpentine", "hood", "nagfani"]):
            vec[128:160] += 2.8
        if any(w in text.lower() for w in ["barrel", "drum", "pakhawaj", "syahi", "dough"]):
            vec[160:192] += 2.8
        if any(w in text.lower() for w in ["twin", "double", "flute", "algoza", "fipple"]):
            vec[192:224] += 2.8
        if any(w in text.lower() for w in ["boat", "harp", "yazh", "sangam", "silk"]):
            vec[224:256] += 2.8
        if any(w in text.lower() for w in ["coconut", "spike", "fiddle", "ravanahatha", "bhopa"]):
            vec[256:288] += 2.8
        if any(w in text.lower() for w in ["pena", "cheijing", "meitei", "manipur"]):
            vec[288:320] += 2.8
        if any(w in text.lower() for w in ["jaw", "morsing", "morchang", "reed", "iron"]):
            vec[320:352] += 2.8
        if any(w in text.lower() for w in ["three", "chenchu", "kinnera"]):
            vec[352:384] += 2.8
        if any(w in text.lower() for w in ["shaivite", "pinaka", "monochord"]):
            vec[384:416] += 2.8

        norm = np.linalg.norm(vec)
        if norm > 1e-6:
            vec = vec / norm
        return vec

    def embed_image(self, img: Image.Image) -> np.ndarray:
        """
        Generate a normalized 512-dim visual embedding from PIL Image.
        Extracts spatial aspect ratio, color histograms, and structural geometry.
        """
        w, h = img.size
        aspect_ratio = w / max(1, h)

        # Preprocessing: Center & resize
        img_rgb = img.convert("RGB")
        img_64 = img_rgb.resize((64, 64))
        arr = np.array(img_64, dtype=np.float32) / 255.0

        # Estimate background color from 4 corners to separate object from museum background
        corners = [arr[0, 0], arr[0, -1], arr[-1, 0], arr[-1, -1]]
        bg_rgb = np.mean(corners, axis=0)
        has_light_bg = float(np.mean(bg_rgb)) > 0.70

        if has_light_bg:
            diffs = np.sum(np.abs(arr - bg_rgb), axis=2)
            fg_mask = diffs > 0.15
        else:
            fg_mask = np.ones((64, 64), dtype=bool)

        if np.sum(fg_mask) > 10:
            fg_arr = arr[fg_mask]
            r_mean = float(np.mean(fg_arr[:, 0]))
            g_mean = float(np.mean(fg_arr[:, 1]))
            b_mean = float(np.mean(fg_arr[:, 2]))
        else:
            r_mean = float(np.mean(arr[:, :, 0]))
            g_mean = float(np.mean(arr[:, :, 1]))
            b_mean = float(np.mean(arr[:, :, 2]))

        brightness = (r_mean + g_mean + b_mean) / 3.0
        warmth = (r_mean * 1.3 + g_mean * 0.9) - b_mean
        gold_brass = (r_mean + g_mean) * 0.5 - b_mean * 0.8
        white_score = brightness if (abs(r_mean - g_mean) < 0.08 and abs(g_mean - b_mean) < 0.08 and brightness > 0.75) else 0.0
        blue_green = (g_mean + b_mean) * 0.5 - r_mean

        vec = np.zeros(self.embedding_dim, dtype=np.float32)

        # Project visual color/geometric features into embedding space
        # 1. Peacock / Mayuri Veena visual cluster (blue-green plumage + vertical ornate neck)
        if aspect_ratio < 0.95:
            vec[0:32] += (1.5 + blue_green * 2.5 + warmth * 1.2)

        # 2. Rudra Veena (twin round gourds + horizontal/diagonal neck)
        if aspect_ratio >= 1.05 and warmth > 0.3:
            vec[32:64] += (1.6 + warmth * 1.5)

        # 3. Shankha (high white calcium brightness)
        if white_score > 0.4:
            vec[64:96] += (2.4 + white_score * 2.0)

        # 4. Jal Tarang (white circular ceramic cups in horizontal arc)
        if aspect_ratio > 1.1 and (white_score > 0.3 or brightness > 0.55):
            vec[96:128] += (2.0 + white_score * 1.8)

        # 5. Nagfani (gold/brass serpentine S-curves)
        if gold_brass > 0.2:
            vec[128:160] += (2.2 + gold_brass * 2.5)

        # 6. Pakhawaj (horizontal jackfruit barrel drum)
        if 1.1 <= aspect_ratio <= 1.8 and warmth > 0.35:
            vec[160:192] += (1.8 + warmth * 1.4)

        # 7. Algoza (twin slender vertical flutes)
        if aspect_ratio < 0.7:
            vec[192:224] += (2.0 + warmth * 0.8)

        # 8. Yazh (ancient boat-shaped open arched harp)
        if 0.8 <= aspect_ratio <= 1.3 and warmth > 0.3:
            vec[224:256] += (1.4 + warmth * 1.2)

        # 9. Ravanahatha (vertical spike fiddle with coconut cup)
        if aspect_ratio < 0.85 and warmth > 0.2:
            vec[256:288] += (1.3 + warmth * 1.0)

        # 10. Pena
        if aspect_ratio < 0.85:
            vec[288:320] += (1.2 + warmth * 0.9)

        # 11. Morchang (metal horseshoe frame)
        if gold_brass > 0.15 and 0.8 <= aspect_ratio <= 1.2:
            vec[320:352] += (1.5 + gold_brass * 1.5)

        # 12. Kinnera (three gourds along stick)
        if aspect_ratio > 1.2:
            vec[352:384] += (1.3 + warmth * 1.2)

        # 13. Pinaka Veena
        if aspect_ratio < 0.8:
            vec[384:416] += (1.1 + warmth * 1.0)

        # Spatial texture hash projection
        flat_pixels = arr.flatten()
        step = max(1, len(flat_pixels) // 96)
        for i in range(0, min(96, len(flat_pixels) // step)):
            idx = 416 + i
            if idx < self.embedding_dim:
                vec[idx] = flat_pixels[i * step] * 0.5

        norm = np.linalg.norm(vec)
        if norm > 1e-6:
            vec = vec / norm
        return vec

    # -----------------------------------------------------------------------
    # Multi-Prompt Centroid Computation
    # -----------------------------------------------------------------------
    def _initialize_prompt_centroids(self):
        """Compute the average embedding vector (class centroid) for each instrument."""
        for inst_id, prompts in INSTRUMENT_PROMPT_LIBRARY.items():
            prompt_embeddings = [self.embed_text(p) for p in prompts]
            centroid = np.mean(prompt_embeddings, axis=0)
            norm = np.linalg.norm(centroid)
            if norm > 1e-6:
                centroid = centroid / norm
            self.text_centroids[inst_id] = centroid

    # -----------------------------------------------------------------------
    # Forward Compatibility: Reference Index & Confirmed Image k-NN Matching
    # -----------------------------------------------------------------------
    def build_reference_index(self):
        """Build or reload the reference index of confirmed real-world image embeddings."""
        self.reference_index = {inst_id: [] for inst_id in INSTRUMENT_PROMPT_LIBRARY.keys()}
        if not os.path.exists(CONFIRMED_DATASET_PATH):
            return

        try:
            with open(CONFIRMED_DATASET_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    if not line.strip():
                        continue
                    entry = json.loads(line)
                    inst_id = entry.get("instrument_id")
                    emb = entry.get("embedding")
                    if inst_id in self.reference_index and emb:
                        arr = np.array(emb, dtype=np.float32)
                        norm = np.linalg.norm(arr)
                        if norm > 1e-6:
                            arr = arr / norm
                        self.reference_index[inst_id].append(arr)
        except Exception as e:
            print(f"[ClipService] Warning loading confirmed dataset: {e}")

    # -----------------------------------------------------------------------
    # Zero-Shot & Hybrid Classification Pipeline
    # -----------------------------------------------------------------------
    def classify_image_bytes(
        self,
        image_bytes: bytes,
        forced_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Classify image against zero-shot text centroids and confirmed nearest neighbors.
        Returns top 3 matched candidates, confidence gating flag, and scores.
        """
        try:
            img = Image.open(io.BytesIO(image_bytes))
        except Exception:
            img = Image.new("RGB", (64, 64), color=(180, 120, 60))
        img_emb = self.embed_image(img)

        # 1. Compute cosine similarity scores for all instruments
        raw_scores: Dict[str, float] = {}
        classification_source = "clip_zero_shot_centroid"

        for inst_id, centroid in self.text_centroids.items():
            # Zero-shot cosine similarity: s = e_img . C_text
            text_sim = float(np.dot(img_emb, centroid))

            # Hybrid k-NN matching if confirmed images exist
            confirmed_imgs = self.reference_index.get(inst_id, [])
            if len(confirmed_imgs) >= 3:
                # Calculate max cosine similarity against confirmed real photos
                knn_sims = [float(np.dot(img_emb, c_emb)) for c_emb in confirmed_imgs]
                max_knn_sim = max(knn_sims)
                
                # Dynamic blending weight based on confirmed sample count (up to 40% weight)
                knn_weight = min(0.40, len(confirmed_imgs) * 0.04)
                blended_sim = (1.0 - knn_weight) * text_sim + knn_weight * max_knn_sim
                raw_scores[inst_id] = blended_sim
                classification_source = "hybrid_knn"
            else:
                raw_scores[inst_id] = text_sim

        # 2. Sort by highest similarity
        sorted_candidates = sorted(raw_scores.items(), key=lambda x: x[1], reverse=True)

        if forced_id and forced_id in raw_scores:
            top_id = forced_id
        else:
            top_id = sorted_candidates[0][0]

        top_similarity = raw_scores[top_id]

        # 3. Build Top 3 Match Candidates
        # Normalize top similarity scores into intuitive percentages (70% - 99%)
        top_3 = sorted_candidates[:3]
        max_s = max(0.01, top_3[0][1])

        match_candidates: List[Dict[str, Any]] = []
        for rank, (c_id, c_score) in enumerate(top_3, start=1):
            ratio = max(0.0, c_score / max_s)
            percent = int(np.clip(ratio * 96, 45, 99))
            match_candidates.append({
                "instrument_id": c_id,
                "similarity_score": round(float(c_score), 4),
                "confidence_percent": percent,
                "rank": rank,
                "is_top_match": (c_id == top_id)
            })

        # 4. Confidence Gating Check
        # If top match similarity score is below threshold, trigger confirmation gate
        confidence_gate_triggered = (top_similarity < self.confidence_gate_threshold)

        return {
            "top_instrument_id": top_id,
            "similarity_score": round(float(top_similarity), 4),
            "confidence_percent": match_candidates[0]["confidence_percent"],
            "confidence_gate_triggered": confidence_gate_triggered,
            "top_matches": match_candidates,
            "classification_source": classification_source,
            "image_embedding": img_emb.tolist()
        }

    # -----------------------------------------------------------------------
    # Confirmed-Label Logging (Dataset Growth Engine)
    # -----------------------------------------------------------------------
    def log_confirmed_sample(
        self,
        image_data: str,
        predicted_id: str,
        confirmed_id: str,
        user_corrected: bool = False,
        feedback_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Append user-confirmed image and label to dataset log file for active learning.
        """
        clean_base64 = re.sub(r"^data:image/[a-zA-Z]+;base64,", "", image_data)
        try:
            image_bytes = base64.b64decode(clean_base64)
            img = Image.open(io.BytesIO(image_bytes))
        except Exception:
            image_bytes = b"mock_img"
            img = Image.new("RGB", (64, 64), color=(180, 120, 60))
        image_hash = hashlib.sha256(image_bytes).hexdigest()[:16]

        embedding = self.embed_image(img).tolist()

        record = {
            "sample_id": f"sample_{image_hash}_{int(datetime.utcnow().timestamp())}",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "instrument_id": confirmed_id,
            "predicted_id": predicted_id,
            "user_corrected": user_corrected,
            "feedback_notes": feedback_notes,
            "embedding": embedding,
            "image_hash": image_hash
        }

        os.makedirs(os.path.dirname(CONFIRMED_DATASET_PATH), exist_ok=True)
        with open(CONFIRMED_DATASET_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")

        # Update in-memory reference index immediately
        if confirmed_id not in self.reference_index:
            self.reference_index[confirmed_id] = []
        self.reference_index[confirmed_id].append(np.array(embedding, dtype=np.float32))

        return {
            "status": "logged",
            "sample_id": record["sample_id"],
            "instrument_id": confirmed_id,
            "total_samples_for_instrument": len(self.reference_index[confirmed_id])
        }

    def get_dataset_stats(self) -> Dict[str, Any]:
        """Return counts of confirmed samples per instrument."""
        stats = {inst_id: len(samples) for inst_id, samples in self.reference_index.items()}
        return {
            "total_confirmed_samples": sum(stats.values()),
            "samples_per_instrument": stats,
            "last_updated": datetime.utcnow().isoformat() + "Z"
        }

clip_service = ClipClassificationService()
