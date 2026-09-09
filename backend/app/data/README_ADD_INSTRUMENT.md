# How to Add a New Instrument to Echoes of India

Thanks to the **Attribute-Based Vision Classification Architecture**, you can add brand-new or newly discovered historical Indian instruments to the AI Vision Recognition System **without any model retraining or embedding regeneration**.

---

## 📋 Step-by-Step Guide

### Step 1: Add Instrument Metadata to `instruments.json`
Add the standard historical, acoustic, and play interface definitions to `backend/app/data/instruments.json`:
```json
{
  "id": "new-instrument-id",
  "name": "New Instrument Name",
  "sanskritName": "संस्कृत नाम",
  "family": "tata",
  "categoryLabel": "Tata Vadya (Chordophone)",
  "century": "12th Century CE",
  "region": "Northern India",
  "status": "rare",
  "image": "https://images.example.com/instrument.jpg",
  "acousticProfile": { ... },
  "playInterface": { ... }
}
```

### Step 2: Add Organological Attributes to `instrument_attributes.json`
In `backend/app/data/instrument_attributes.json`, add an entry keyed by your `id`:
```json
"new-instrument-id": {
  "id": "new-instrument-id",
  "name": "New Instrument Name",
  "instrument_family": "string_chordophone",
  "sound_production": "bowed_or_plucked",
  "resonator_shape": "describe geometric shape (e.g. spherical gourd, boat-shaped hull, pear-shaped body)",
  "resonator_material": "materials used (e.g. jackfruit wood, dried gourd, parchment, brass)",
  "neck_length_category": "long fretted neck | short stem | curved bow arm | none",
  "number_of_strings": "number and type of strings (e.g. 4 main melody strings + 12 sympathetic pegs)",
  "bridge_type": "wide buzzing jivari bridge | high arched bowing bridge | none",
  "distinctive_features": [
    "carved animal finial",
    "raised brass frets",
    "sympathetic tarab pegs"
  ],
  "playing_posture": "held vertically on lap | rested horizontally on floor | blown with lips"
}
```

### Step 3: (Optional) Add Reference Images to `reference_images.json`
Add 1–3 public-domain reference photos from Wikimedia Commons or Open Access museum archives to `backend/app/data/reference_images.json`.

---

## ⚡ How the Classifier Evaluates Your New Instrument
1. When an image is scanned, the Vision-LLM extractor detects visible attributes (resonator geometry, materials, strings, frets, posture).
2. The weighted attribute matcher computes token similarity against `instrument_attributes.json` with high priority on **Resonator Shape (30%)**, **Materials (20%)**, and **Strings/Parchment (20%)**.
3. Your new instrument will immediately appear in the **Top 3 Candidate Matches** with explainability reason badges!
