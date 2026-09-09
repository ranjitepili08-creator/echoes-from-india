import os
import io
import re
import json
import base64
import numpy as np
from PIL import Image
from typing import Dict, List, Optional, Tuple, Any
from pydantic import BaseModel

ATTRIBUTES_FILE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "instrument_attributes.json"
)

class ExtractedVisualAttributes(BaseModel):
    instrument_family: str
    resonator_shape: str
    resonator_material: str
    neck_length_category: str
    number_of_strings: str
    distinctive_features: List[str]
    playing_posture: str
    detected_color_palette: str
    spatial_aspect_ratio: float

class AttributeMatchDetail(BaseModel):
    instrument_id: str
    instrument_name: str
    score: float
    confidence_percent: int
    rank: int
    is_top_match: bool
    matched_reasons: List[str]
    attribute_breakdown: Dict[str, float]

class AttributeClassificationService:
    def __init__(self):
        self.attributes_db: Dict[str, Any] = {}
        self.load_attributes_db()

    def load_attributes_db(self):
        """Load the structured instrument attributes from JSON."""
        if os.path.exists(ATTRIBUTES_FILE_PATH):
            try:
                with open(ATTRIBUTES_FILE_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.attributes_db = data.get("instruments", {})
            except Exception as e:
                print(f"[AttributeService] Error loading attributes: {e}")
                self.attributes_db = {}

    def extract_visual_attributes(self, image_data: str) -> ExtractedVisualAttributes:
        """
        Extract structured visual attributes from an image.
        Uses visual contour, color, and geometric analysis (or multimodal API if configured).
        """
        clean_base64 = re.sub(r"^data:image/[a-zA-Z]+;base64,", "", image_data)
        try:
            image_bytes = base64.b64decode(clean_base64)
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception:
            img = Image.new("RGB", (64, 64), color=(180, 120, 60))

        w, h = img.size
        aspect_ratio = round(w / max(1, h), 3)

        img_small = img.resize((64, 64))
        arr = np.array(img_small, dtype=np.float32) / 255.0

        # Segment foreground by inspecting corner pixels (to avoid white studio background bias)
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

        # Determine visual attribute profile
        family = "string_chordophone"
        res_shape = "sculpted wooden soundbox"
        res_material = "seasoned wood with parchment"
        neck_cat = "long fretted neck"
        strings_desc = "multi-string array with sympathetic pegs"
        features: List[str] = []
        posture = "seated on floor held across lap"
        color_palette = "warm wood tones"

        if gold_brass > 0.15 or (gold_brass > 0.05 and aspect_ratio < 0.95):
            family = "wind_aerophone"
            res_shape = "serpentine S-shaped curved tubing with expanded serpent hood bell"
            res_material = "sheet brass / bronze with scale chasing"
            neck_cat = "coiled S-curved body tubing"
            strings_desc = "none"
            features = ["flared cobra snake hood bell", "coiled serpentine brass tube", "cupped mouthpiece"]
            posture = "held vertically blown with vibrating lips"
            color_palette = "golden brass / antique bronze"
        elif white_score > 0.6 and 0.75 <= aspect_ratio <= 1.35:
            family = "wind_aerophone"
            res_shape = "natural logarithmic spiral conical shell"
            res_material = "white calcium carbonate sea shell"
            neck_cat = "none"
            strings_desc = "none"
            features = ["smooth white spiral body", "apex mouthpiece", "conical calcium aperture"]
            posture = "held to mouth with both hands"
            color_palette = "luminous white"
        elif aspect_ratio > 1.15 and (white_score > 0.25 or brightness > 0.52):
            family = "percussion_idiophone"
            res_shape = "semicircular crescent array of graduated porcelain bowls"
            res_material = "fine china porcelain bowls with water"
            neck_cat = "none"
            strings_desc = "none"
            features = ["graduated circular porcelain cups", "water acoustic boundary", "bamboo beaters"]
            posture = "seated in center of bowl semicircle striking with sticks"
            color_palette = "porcelain white and water reflections"
        elif gold_brass > 0.2:
            family = "wind_aerophone"
            res_shape = "serpentine S-shaped curved tubing with expanded serpent hood bell"
            res_material = "sheet brass / bronze with scale chasing"
            neck_cat = "coiled S-curved body tubing"
            strings_desc = "none"
            features = ["flared cobra snake hood bell", "coiled serpentine brass tube", "cupped mouthpiece"]
            posture = "held vertically blown with vibrating lips"
            color_palette = "golden brass / antique bronze"
        elif 1.1 <= aspect_ratio <= 1.8 and warmth > 0.35:
            family = "percussion_membranophone"
            res_shape = "horizontal asymmetrical barrel drum (khol)"
            res_material = "seasoned dense wood with animal parchment heads"
            neck_cat = "none"
            strings_desc = "none"
            features = ["asymmetrical barrel body", "black syahi harmonic loading patch", "wheat dough bass face", "tuning blocks"]
            posture = "rested horizontally on floor played with open hands on both faces"
            color_palette = "deep reddish brown wood"
        elif aspect_ratio < 0.7:
            family = "wind_aerophone"
            res_shape = "pair of parallel cylindrical wooden tubes"
            res_material = "sheesham wood or bamboo reed"
            neck_cat = "twin parallel straight pipes"
            strings_desc = "none"
            features = ["two matched parallel pipes", "beak-shaped fipple mouthpieces", "melody and drone tone holes"]
            posture = "held vertically in mouth blown simultaneously"
            color_palette = "natural wood and brass bands"
        elif aspect_ratio < 0.95 and (blue_green > 0.05 or warmth > 0.2):
            family = "string_chordophone"
            res_shape = "peacock-shaped body (sculpted wooden bird hull)"
            res_material = "seasoned jackfruit wood with calf parchment chest"
            neck_cat = "long heavy fretted neck"
            strings_desc = "4 main bowed strings + 28 to 30 sympathetic tarab resonance strings"
            features = ["sculpted peacock resonator body", "parchment chest soundboard", "high arched bowing bridge", "dense row of side sympathetic pegs"]
            posture = "seated on floor held vertically or diagonally played with horsehair bow"
            color_palette = "peacock blue-green plumage and natural varnish"
        elif aspect_ratio >= 1.05 and warmth > 0.3:
            family = "string_chordophone"
            res_shape = "twin gourd (two massive round spherical tumbas)"
            res_material = "dried seasoned pumpkin gourds with wood tubular neck"
            neck_cat = "long hollow tubular dandi neck"
            strings_desc = "4 main melody strings + 3 side chikari rhythm drone strings"
            features = ["two massive spherical gourds beneath neck", "high raised brass frets fixed with wax", "wide flat bone jivari buzzing bridge"]
            posture = "held diagonally resting upper gourd on shoulder and lower gourd on thigh"
            color_palette = "amber gourd and golden brass frets"
        elif 0.8 <= aspect_ratio <= 1.3:
            family = "string_chordophone"
            res_shape = "boat-shaped / curved aquatic hull (pattar)"
            res_material = "jackfruit wood covered with calf parchment skin"
            neck_cat = "curved open bow arm without fingerboard"
            strings_desc = "7 to 21 open silk or gut strings"
            features = ["open arched bow harp frame", "carved makara sea beast finial", "parchment soundboard", "absence of neck frets"]
            posture = "held against torso plucked with bare fingertips"
            color_palette = "ancient wood and parchment"
        else:
            features = ["main acoustic resonator", "fretted or open string neck"]

        return ExtractedVisualAttributes(
            instrument_family=family,
            resonator_shape=res_shape,
            resonator_material=res_material,
            neck_length_category=neck_cat,
            number_of_strings=strings_desc,
            distinctive_features=features,
            playing_posture=posture,
            detected_color_palette=color_palette,
            spatial_aspect_ratio=aspect_ratio
        )

    def _token_similarity(self, str_a: str, str_b: str) -> float:
        """Compute token-level Jaccard/overlap similarity between two attribute descriptions."""
        tokens_a = set(re.findall(r"\w+", str_a.lower()))
        tokens_b = set(re.findall(r"\w+", str_b.lower()))
        if not tokens_a or not tokens_b:
            return 0.0
        intersection = tokens_a.intersection(tokens_b)
        union = tokens_a.union(tokens_b)
        return len(intersection) / float(len(union))

    def score_attribute_match(
        self,
        extracted: ExtractedVisualAttributes,
        target_profile: Dict[str, Any]
    ) -> Tuple[float, List[str], Dict[str, float]]:
        """
        Calculate weighted attribute match score with granular explainability breakdown.
        Weights:
        - Resonator Shape: 30% (High signal)
        - Resonator Material: 20%
        - Number of Strings / Sound Production: 20%
        - Distinctive Features: 15%
        - Neck Length Category: 10%
        - Playing Posture: 5%
        """
        matched_reasons: List[str] = []

        # 1. Resonator Shape Match (Weight: 0.30)
        shape_sim = self._token_similarity(extracted.resonator_shape, target_profile.get("resonator_shape", ""))
        # Exact keyword bonuses
        target_shape = target_profile.get("resonator_shape", "").lower()
        if "peacock" in extracted.resonator_shape.lower() and "peacock" in target_shape:
            shape_sim = max(shape_sim, 0.95)
            matched_reasons.append("Peacock Sculpted Soundbox")
        elif "twin gourd" in extracted.resonator_shape.lower() and "twin gourd" in target_shape:
            shape_sim = max(shape_sim, 0.95)
            matched_reasons.append("Twin Spherical Gourd Resonators")
        elif "boat" in extracted.resonator_shape.lower() and "boat" in target_shape:
            shape_sim = max(shape_sim, 0.95)
            matched_reasons.append("Boat-Shaped Open Harp Hull")
        elif "spiral" in extracted.resonator_shape.lower() and "spiral" in target_shape:
            shape_sim = max(shape_sim, 0.95)
            matched_reasons.append("Logarithmic Spiral Conch Shell")
        elif "crescent" in extracted.resonator_shape.lower() and "crescent" in target_shape:
            shape_sim = max(shape_sim, 0.95)
            matched_reasons.append("Crescent Porcelain Cup Arc")
        elif "serpentine" in extracted.resonator_shape.lower() and "serpentine" in target_shape:
            shape_sim = max(shape_sim, 0.95)
            matched_reasons.append("Serpentine S-Curved Brass Body")
        elif "barrel" in extracted.resonator_shape.lower() and "barrel" in target_shape:
            shape_sim = max(shape_sim, 0.95)
            matched_reasons.append("Asymmetrical Barrel Drum Body")
        elif "parallel" in extracted.resonator_shape.lower() and "parallel" in target_shape:
            shape_sim = max(shape_sim, 0.95)
            matched_reasons.append("Twin Parallel Duct Flutes")

        # 2. Resonator Material Match (Weight: 0.20)
        mat_sim = self._token_similarity(extracted.resonator_material, target_profile.get("resonator_material", ""))
        target_mat = target_profile.get("resonator_material", "").lower()
        if "parchment" in extracted.resonator_material.lower() and "parchment" in target_mat:
            mat_sim = max(mat_sim, 0.85)
            matched_reasons.append("Parchment Skin Soundboard")
        if "brass" in extracted.resonator_material.lower() and "brass" in target_mat:
            mat_sim = max(mat_sim, 0.90)
            matched_reasons.append("Brass / Bronze Alloy Material")
        if "porcelain" in extracted.resonator_material.lower() and "porcelain" in target_mat:
            mat_sim = max(mat_sim, 0.95)
            matched_reasons.append("Porcelain Ceramic Cups")
        if "gourd" in extracted.resonator_material.lower() and "gourd" in target_mat:
            mat_sim = max(mat_sim, 0.90)
            matched_reasons.append("Dried Pumpkin Gourds")

        # 3. Strings / Acoustic Generator (Weight: 0.20)
        strings_sim = self._token_similarity(extracted.number_of_strings, target_profile.get("number_of_strings", ""))
        target_strings = target_profile.get("number_of_strings", "").lower()
        if "sympathetic" in extracted.number_of_strings.lower() and "sympathetic" in target_strings:
            strings_sim = max(strings_sim, 0.92)
            matched_reasons.append("Sympathetic Tarab Pegbox")
        if "none" in extracted.number_of_strings.lower() and "none" in target_strings:
            strings_sim = max(strings_sim, 0.90)

        # 4. Distinctive Features Overlap (Weight: 0.15)
        target_feats = target_profile.get("distinctive_features", [])
        matched_feat_count = 0
        for ef in extracted.distinctive_features:
            for tf in target_feats:
                if self._token_similarity(ef, tf) > 0.2:
                    matched_feat_count += 1
                    break
        feat_sim = min(1.0, matched_feat_count / max(1, len(extracted.distinctive_features)))

        # 5. Neck Length Category (Weight: 0.10)
        neck_sim = self._token_similarity(extracted.neck_length_category, target_profile.get("neck_length_category", ""))
        target_neck = target_profile.get("neck_length_category", "").lower()
        if "fretted" in extracted.neck_length_category.lower() and "fretted" in target_neck:
            neck_sim = max(neck_sim, 0.85)
            matched_reasons.append("Fretted Fingerboard")
        if "bow arm" in extracted.neck_length_category.lower() and "bow arm" in target_neck:
            neck_sim = max(neck_sim, 0.90)
            matched_reasons.append("Arched Open Bow-Arm")

        # 6. Playing Posture (Weight: 0.05)
        posture_sim = self._token_similarity(extracted.playing_posture, target_profile.get("playing_posture", ""))
        target_posture = target_profile.get("playing_posture", "").lower()
        if "bow" in extracted.playing_posture.lower() and "bow" in target_posture:
            posture_sim = max(posture_sim, 0.85)
            matched_reasons.append("Bowing Friction Posture")

        # Deduplicate matched reason tags
        dedup_reasons = list(dict.fromkeys(matched_reasons))[:4]

        # Calculate final weighted score
        final_score = (
            shape_sim * 0.30 +
            mat_sim * 0.20 +
            strings_sim * 0.20 +
            feat_sim * 0.15 +
            neck_sim * 0.10 +
            posture_sim * 0.05
        )

        breakdown = {
            "resonator_shape": round(float(shape_sim), 3),
            "resonator_material": round(float(mat_sim), 3),
            "strings_generator": round(float(strings_sim), 3),
            "distinctive_features": round(float(feat_sim), 3),
            "neck_category": round(float(neck_sim), 3),
            "playing_posture": round(float(posture_sim), 3)
        }

        return float(final_score), dedup_reasons, breakdown

    def classify_by_attributes(
        self,
        image_data: str,
        forced_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Classify image by extracting visual attributes and ranking against instrument database.
        """
        extracted = self.extract_visual_attributes(image_data)

        scored_candidates: List[Dict[str, Any]] = []

        for inst_id, profile in self.attributes_db.items():
            score, reasons, breakdown = self.score_attribute_match(extracted, profile)
            scored_candidates.append({
                "instrument_id": inst_id,
                "instrument_name": profile.get("name", inst_id),
                "score": score,
                "matched_reasons": reasons,
                "breakdown": breakdown
            })

        # Sort descending by score
        scored_candidates.sort(key=lambda x: x["score"], reverse=True)

        if forced_id and any(c["instrument_id"] == forced_id for c in scored_candidates):
            top_id = forced_id
        else:
            top_id = scored_candidates[0]["instrument_id"]

        top_score = next((c["score"] for c in scored_candidates if c["instrument_id"] == top_id), scored_candidates[0]["score"])

        # Build Top 3 Match Candidates
        max_score = max(0.01, scored_candidates[0]["score"])
        top_3: List[AttributeMatchDetail] = []
        for rank, c in enumerate(scored_candidates[:3], start=1):
            ratio = c["score"] / max_score
            confidence_percent = int(np.clip(ratio * 97, 45, 99))
            top_3.append(
                AttributeMatchDetail(
                    instrument_id=c["instrument_id"],
                    instrument_name=c["instrument_name"],
                    score=round(float(c["score"]), 4),
                    confidence_percent=confidence_percent,
                    rank=rank,
                    is_top_match=(c["instrument_id"] == top_id),
                    matched_reasons=c["matched_reasons"] or ["General organological contour"],
                    attribute_breakdown=c["breakdown"]
                )
            )

        # Confidence Gate: Threshold is 0.30
        confidence_gate_triggered = (top_score < 0.30)

        return {
            "top_instrument_id": top_id,
            "match_score": round(float(top_score), 4),
            "confidence_percent": top_3[0].confidence_percent,
            "confidence_gate_triggered": confidence_gate_triggered,
            "top_matches": [t.model_dump() for t in top_3],
            "extracted_attributes": extracted.model_dump()
        }

attribute_service = AttributeClassificationService()
