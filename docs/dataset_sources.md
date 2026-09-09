# Comprehensive Dataset Sources & Research Repositories

This document compiles the authoritative open-access research repositories, audio datasets, museum archives, and historical corpora used for **Echoes of India**.

---

## 1. 🖼️ Visual & Organological Image Datasets (For Computer Vision & Object Detection)

### A. Musical Instrument Museums Online (MIMO)
* **Description**: The world's largest open-access database of musical instruments in public collections, featuring thousands of high-resolution images, measurements, and Hornbostel-Sachs classifications of Indian instruments (Veenas, Sursringar, Mayuri Vina, Ravanahatha, Sarangi).
* **URL**: [https://mimo-international.com/MIMO/](https://mimo-international.com/MIMO/)
* **Direct Indian Collection Filter**: [MIMO India Search](https://mimo-international.com/MIMO/search.aspx?SC=DEFAULT&QUERY=India+musical+instrument)

### B. Indira Gandhi National Centre for the Arts (IGNCA) — Kalasampada Digital Archive
* **Description**: Premier Indian cultural repository hosting digitised photographs of musical instruments from the Sangeet Natak Akademi gallery, cave murals (Ajanta, Ellora, Bagh), and temple carvings (Khajuraho, Konark, Thanjavur, Chidambaram).
* **URL**: [http://ignca.gov.in/divisions-units/kalasampada/](http://ignca.gov.in/divisions-units/kalasampada/)
* **National Cultural Audio-Visual Archives (NCAVA)**: [https://ncava.ignca.gov.in/](https://ncava.ignca.gov.in/)

### C. Digital South Asia Library (DSAL) — University of Chicago & AIIS
* **Description**: Center for Art & Archaeology (American Institute of Indian Studies) photo archives containing thousands of documented Indian temple sculptures depicting historical musical instruments from 3rd c. BCE to 18th c. CE.
* **URL**: [https://dsal.uchicago.edu/images/aiis/](https://dsal.uchicago.edu/images/aiis/)

### D. Metropolitan Museum of Art (The Met) Open Access Collection
* **Description**: High-resolution CC0 images and detailed organological provenance for historical Indian chordophones (Rudra Veena, Mayuri Taus, Sarinda, Sitar ancestors).
* **URL**: [https://www.metmuseum.org/art/collection/search?q=Indian+musical+instruments](https://www.metmuseum.org/art/collection/search?q=Indian+musical+instruments)

---

## 2. 🎵 Audio & Acoustic Datasets (For Sound Modeling & Synthesis Reference)

### A. Saraga Dataset (CompMusic — MTG & IIT Madras)
* **Description**: The definitive open research audio corpus for Indian Art Music (Carnatic and Hindustani). Contains multi-track recordings with audio, time-aligned annotations, tonic, raga, and stroke-level metadata (Mridangam, Veena, Violin, Vocal).
* **Zenodo Repository (Carnatic)**: [https://zenodo.org/records/4301737](https://zenodo.org/records/4301737)
* **Zenodo Repository (Hindustani)**: [https://zenodo.org/records/4301744](https://zenodo.org/records/4301744)
* **CompMusic Project Portal**: [https://compmusic.upf.edu/datasets](https://compmusic.upf.edu/datasets)

### B. Indian Art Music Mridangam Stroke Dataset
* **Description**: 7,000+ isolated audio strokes of the 10 standard Mridangam / Pakhawaj strokes (Tha, The, Dhi, Thom, Nam, Chapu) recorded across different tonics, ideal for percussive bol physical modeling.
* **Zenodo Link**: [https://zenodo.org/records/166465](https://zenodo.org/records/166465)

### C. Smithsonian Folkways Recordings — UNESCO Traditional Music Collection
* **Description**: Historic, uncompressed archival field recordings of rare folk instruments across India (Rajasthani Ravanahatha, Punjabi Algoza, Baul Ektara, Kerala Panchavadyam).
* **URL**: [https://folkways.si.edu/search?query=india+instruments](https://folkways.si.edu/search?query=india+instruments)

### D. Freesound & Open Acoustic Soundfont Repositories
* **Description**: Creative Commons acoustic samples of open strings, tanpura drones, and gong/bell resonances.
* **URL**: [https://freesound.org/search/?q=veena+mridangam+jaltarang](https://freesound.org/search/?q=veena+mridangam+jaltarang)

---

## 3. 📜 Historical Treatises & Text Corpus (For RAG & Organological Knowledge)

### A. GRETIL (Göttingen Register of Electronic Texts in Indian Languages)
* **Description**: Complete machine-readable Sanskrit e-texts of ancient musicological treatises:
  - *Bharata Muni's Natya Shastra* (Chapters 28–34: Vadya Adhyaya)
  - *Sharngadeva's Sangita Ratnakara* (Vadyadhyaya)
  - *Matanga Muni's Brihaddeshi*
* **URL**: [http://gretil.sub.uni-goettingen.de/gretil.html](http://gretil.sub.uni-goettingen.de/gretil.html)

### B. Project Madurai (Open Tamil Heritage E-Text Repository)
* **Description**: Full verified e-texts of Tamil Sangam literature with organological descriptions of ancient Yazh harps:
  - *Silappadikaram* (Ilango Adigal - Arangetru Kadai & Kanal Vari)
  - *Pathupattu* (Malaipadukadam, Sirupanarruppadai)
  - *Thirukkural*
* **URL**: [https://www.projectmadurai.org/](https://www.projectmadurai.org/)

### C. Sangeet Natak Akademi Digital Library
* **Description**: Official monographs, audio-visual archives, and encyclopedic publications on endangered and rare folk and classical instruments of India.
* **URL**: [https://sangeetnatak.gov.in/](https://sangeetnatak.gov.in/)

---

## 4. 🔬 Acoustic Physical Modeling Parameters Summary

| Instrument | Reference Acoustic Dataset / Collection | Key Physical Modeling Variable |
|---|---|---|
| **Yazh (யாழ்)** | Silappadikaram Organology & MIMO Harps | Silk-string tension, gut impedance, Jackfruit wood damping |
| **Rudra Veena** | CompMusic Dhrupad Corpus & The Met Collection | Jivari buzzing bridge non-linear transfer curve, dual gourd formants (95 Hz) |
| **Pinaka Veena** | Sangita Ratnakara & Himalayan Folk Fiddles | Bowed friction noise generator, high cane staff tension |
| **Jal Tarang** | Kama Sutra (Udaka Vadya) & Sangeet Parijat | Porcelain vibrational modes ($f \propto \frac{1}{\sqrt{m_{\text{water}}}}$ fluid mass coupling) |
| **Pakhawaj** | IIT Madras Mridangam Dataset & Natya Shastra | Dual-head synthesis (moist wheat dough pitch-drop + iron-ore syahi harmonics) |
| **Algoza** | Smithsonian Folkways Thar Desert Collection | Dual-bore fipple jet turbulence & continuous circular breathing drone |
| **Shankha** | Vedic Chanting Audio Archives & Acoustics of Shells | Logarithmic spiral horn acoustic impedance transformation |
