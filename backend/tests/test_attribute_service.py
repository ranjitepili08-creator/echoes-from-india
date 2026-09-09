import pytest
import json
from pathlib import Path
from app.services.attribute_service import (
    attribute_service,
    ExtractedVisualAttributes,
    AttributeClassificationService
)

DATA_DIR = Path(__file__).parent.parent / "app" / "data"

def test_instrument_attributes_json_schema():
    """Verify all 13 instruments have complete and valid attribute profiles."""
    attributes_file = DATA_DIR / "instrument_attributes.json"
    assert attributes_file.exists(), "instrument_attributes.json must exist"
    
    with open(attributes_file, "r") as f:
        data = json.load(f)
        
    assert "instruments" in data
    instruments = data["instruments"]
    assert len(instruments) == 13, f"Expected 13 instruments, got {len(instruments)}"
    
    required_keys = [
        "id", "name", "instrument_family", "resonator_shape", "resonator_material",
        "neck_length_category", "number_of_strings", "distinctive_features",
        "playing_posture"
    ]
    
    for inst_id, inst in instruments.items():
        for key in required_keys:
            assert key in inst, f"Missing key '{key}' in instrument {inst_id}"
        assert isinstance(inst["distinctive_features"], list)
        assert len(inst["distinctive_features"]) >= 3

def test_score_attribute_match_taus_vs_ravanahatha():
    """Verify that a peacock lute (Taus) correctly scores higher than Ravanahatha when peacock features are present."""
    taus_profile = attribute_service.attributes_db["mayuri-veena"]
    ravanahatha_profile = attribute_service.attributes_db["ravanahatha"]
    
    # Mock extracted attributes for Taus
    taus_extracted = ExtractedVisualAttributes(
        instrument_family="string_chordophone",
        resonator_shape="peacock-shaped body (sculpted wooden bird hull)",
        resonator_material="seasoned jackfruit wood with calf parchment chest",
        neck_length_category="long heavy fretted neck",
        number_of_strings="4 main bowed strings + 28 to 30 sympathetic tarab resonance strings",
        distinctive_features=["sculpted peacock head neck", "parchment covered soundbox", "dense row of sympathetic pegs"],
        playing_posture="seated on floor held vertically, played with a heavy horsehair bow",
        detected_color_palette="peacock blue-green",
        spatial_aspect_ratio=0.85
    )
    
    taus_score, taus_reasons, taus_breakdown = attribute_service.score_attribute_match(taus_extracted, taus_profile)
    rav_score, rav_reasons, rav_breakdown = attribute_service.score_attribute_match(taus_extracted, ravanahatha_profile)
    
    assert taus_score > rav_score, f"Taus score ({taus_score}) should exceed Ravanahatha score ({rav_score})"
    assert taus_score > 0.80
    assert any("peacock" in r.lower() for r in taus_reasons)

def test_score_attribute_match_rudra_veena():
    """Verify that twin gourd zither correctly matches Rudra Veena."""
    rudra_profile = attribute_service.attributes_db["rudra-veena"]
    
    rudra_extracted = ExtractedVisualAttributes(
        instrument_family="string_chordophone",
        resonator_shape="twin gourd (two massive round spherical tumbas)",
        resonator_material="dried seasoned round pumpkin bottle gourds",
        neck_length_category="long hollow tubular dandi neck",
        number_of_strings="4 main melody strings + 3 side chikari rhythm drone strings",
        distinctive_features=["two massive spherical gourds", "high raised brass frets with wax", "wide flat jivari bridge"],
        playing_posture="seated cross-legged held diagonally with upper gourd on shoulder",
        detected_color_palette="amber gourd",
        spatial_aspect_ratio=1.1
    )
    
    score, reasons, breakdown = attribute_service.score_attribute_match(rudra_extracted, rudra_profile)
    assert score >= 0.85
    assert any("twin" in r.lower() or "gourd" in r.lower() for r in reasons)

def test_classify_by_attributes_ranking():
    """Test full ranking and explainability generation."""
    # Mock a base64 white shell image
    from PIL import Image
    import io
    import base64
    
    img = Image.new("RGB", (64, 64), color=(250, 250, 250))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    img_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    result = attribute_service.classify_by_attributes(img_b64)
    
    assert "top_instrument_id" in result
    assert "top_matches" in result
    assert len(result["top_matches"]) == 3
    assert result["top_matches"][0]["rank"] == 1
    assert result["top_matches"][0]["is_top_match"] is True
    assert "extracted_attributes" in result
    assert len(result["extracted_attributes"]["distinctive_features"]) > 0
