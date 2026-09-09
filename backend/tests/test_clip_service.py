import pytest
import numpy as np
from PIL import Image
from app.services.clip_service import clip_service, INSTRUMENT_PROMPT_LIBRARY

def test_embed_text_dimension():
    vec = clip_service.embed_text("a Rudra Veena with two large gourd resonators")
    assert isinstance(vec, np.ndarray)
    assert vec.shape == (512,)
    # Unit normalized
    norm = np.linalg.norm(vec)
    assert abs(norm - 1.0) < 1e-4

def test_embed_image_dimension():
    img = Image.new("RGB", (128, 128), color=(200, 100, 50))
    vec = clip_service.embed_image(img)
    assert isinstance(vec, np.ndarray)
    assert vec.shape == (512,)
    norm = np.linalg.norm(vec)
    assert abs(norm - 1.0) < 1e-4

def test_text_centroids_all_instruments():
    assert len(clip_service.text_centroids) == len(INSTRUMENT_PROMPT_LIBRARY)
    for inst_id, centroid in clip_service.text_centroids.items():
        assert centroid.shape == (512,)
        assert abs(np.linalg.norm(centroid) - 1.0) < 1e-4

def test_zero_shot_top_3_ranking():
    img = Image.new("RGB", (100, 100), color=(10, 150, 180)) # Blue-green peacock hue
    import io
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    res = clip_service.classify_image_bytes(buf.getvalue())
    assert "top_instrument_id" in res
    assert "top_matches" in res
    assert len(res["top_matches"]) == 3
    assert res["top_matches"][0]["rank"] == 1
    assert res["top_matches"][1]["rank"] == 2
    assert res["top_matches"][2]["rank"] == 3

def test_confirmed_dataset_logging_and_knn():
    img = Image.new("RGB", (64, 64), color=(220, 180, 50))
    import io, base64
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    b64 = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

    # Log confirmed sample
    res = clip_service.log_confirmed_sample(
        image_data=b64,
        predicted_id="yazh",
        confirmed_id="yazh",
        user_corrected=False
    )
    assert res["status"] == "logged"
    assert res["instrument_id"] == "yazh"

    stats = clip_service.get_dataset_stats()
    assert stats["total_confirmed_samples"] > 0
    assert stats["samples_per_instrument"]["yazh"] > 0
