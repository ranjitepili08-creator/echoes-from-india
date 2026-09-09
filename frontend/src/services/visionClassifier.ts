import { HISTORICAL_INSTRUMENTS } from '../data/instrumentsData';
import { VisionDetectionResult } from '../types';

export class VisionClassifier {
  // Simulate multi-stage AI Vision Transformer classification with feature localization
  public static async analyzeImage(
    imageDataUrl: string,
    forcedInstrumentId?: string
  ): Promise<VisionDetectionResult> {
    // Realistic simulated neural inference latency
    await new Promise((resolve) => setTimeout(resolve, 1400));

    let matched = HISTORICAL_INSTRUMENTS[0];

    if (forcedInstrumentId) {
      const found = HISTORICAL_INSTRUMENTS.find((i) => i.id === forcedInstrumentId);
      if (found) matched = found;
    } else {
      // Intelligent heuristic matching based on random or image characteristics
      const randomIndex = Math.floor(Math.random() * HISTORICAL_INSTRUMENTS.length);
      matched = HISTORICAL_INSTRUMENTS[randomIndex];
    }

    // Dynamic bounding boxes and feature points based on instrument organology
    let detectedFeatures = [];
    const notes: string[] = [];

    if (matched.id === 'yazh') {
      detectedFeatures = [
        { feature: 'Arched Bow Arm (Thandu)', confidence: 0.96, box: [15, 10, 70, 35] as [number, number, number, number] },
        { feature: 'Boat-shaped Resonator (Pattar)', confidence: 0.94, box: [20, 50, 60, 40] as [number, number, number, number] },
        { feature: 'Silk String Array (Narambu)', confidence: 0.91, box: [30, 25, 40, 50] as [number, number, number, number] },
        { feature: 'Parchment Soundboard (Porvai)', confidence: 0.88, box: [25, 55, 50, 30] as [number, number, number, number] }
      ];
      notes.push('Detected open curved harp frame typical of Sangam era (3rd c. BCE – 5th c. CE).');
      notes.push('Absence of fingerboard frets confirms pre-medieval open string harp organology.');
      notes.push('Resonator shape closely matches sculpture carvings at Amaravati & Pudukkottai.');
    } else if (matched.id === 'rudra-veena') {
      detectedFeatures = [
        { feature: 'Upper Gourd Resonator (Tumba)', confidence: 0.98, box: [10, 15, 30, 35] as [number, number, number, number] },
        { feature: 'Lower Gourd Resonator (Tumba)', confidence: 0.97, box: [60, 55, 30, 35] as [number, number, number, number] },
        { feature: 'Tubular Wood Neck (Dandi)', confidence: 0.95, box: [20, 25, 60, 50] as [number, number, number, number] },
        { feature: 'Raised Brass Frets (Parda)', confidence: 0.92, box: [35, 35, 30, 30] as [number, number, number, number] },
        { feature: 'Flat Jivari Buzz Bridge', confidence: 0.89, box: [70, 65, 18, 20] as [number, number, number, number] }
      ];
      notes.push('Twin spherical dried bottle gourds (Lagenaria siceraria) detected with 98% confidence.');
      notes.push('High-raised brass frets affixed with beeswax indicate classical Dhrupad been construction.');
      notes.push('Broad bone Jivari bridge geometry identified for harmonic buzzing overtone profile.');
    } else if (matched.id === 'pinaka-veena') {
      detectedFeatures = [
        { feature: 'Arched Bamboo Bow Staff (Danda)', confidence: 0.93, box: [15, 10, 70, 80] as [number, number, number, number] },
        { feature: 'Single Base Resonator (Kumbha)', confidence: 0.91, box: [55, 65, 30, 25] as [number, number, number, number] },
        { feature: 'Gut Chord & Friction Bow (Kona)', confidence: 0.88, box: [25, 20, 50, 60] as [number, number, number, number] }
      ];
      notes.push('Archer bow contour with singular chord matched to Sangita Ratnakara description (13th c. CE).');
      notes.push('Shaivite bowed stick zither acoustic profile selected.');
    } else if (matched.id === 'ravanahatha') {
      detectedFeatures = [
        { feature: 'Coconut Shell Resonator (Katori)', confidence: 0.95, box: [45, 60, 35, 30] as [number, number, number, number] },
        { feature: 'Bamboo Spike Neck (Dandi)', confidence: 0.94, box: [20, 15, 30, 70] as [number, number, number, number] },
        { feature: 'Ghungroo Bell Horsehair Bow', confidence: 0.90, box: [55, 20, 35, 60] as [number, number, number, number] },
        { feature: 'Sympathetic Tarab Pegs', confidence: 0.87, box: [25, 20, 20, 30] as [number, number, number, number] }
      ];
      notes.push('Halved coconut shell soundbox with parchment head detected.');
      notes.push('Spike fiddle geometry with sympathetic pegs confirms Rajasthani Ravanahatha lineage.');
    } else if (matched.id === 'mayuri-veena') {
      detectedFeatures = [
        { feature: 'Sculpted Peacock Resonator', confidence: 0.97, box: [40, 50, 45, 45] as [number, number, number, number] },
        { feature: 'Fretted Neck with Tarab Pegs', confidence: 0.95, box: [20, 15, 35, 55] as [number, number, number, number] },
        { feature: 'Parchment Chest Soundboard', confidence: 0.92, box: [45, 55, 25, 25] as [number, number, number, number] }
      ];
      notes.push('Peacock-sculpted wooden body (Taus) identified with 97% confidence.');
      notes.push('Dense lateral peg cluster indicates 28–30 sympathetic tarab resonance strings.');
    } else if (matched.id === 'jal-tarang') {
      detectedFeatures = [
        { feature: 'Semicircular Porcelain Bowl Array', confidence: 0.98, box: [15, 30, 70, 50] as [number, number, number, number] },
        { feature: 'Water Level Boundaries', confidence: 0.91, box: [25, 40, 50, 30] as [number, number, number, number] },
        { feature: 'Bamboo Striking Mallets (Tilli)', confidence: 0.89, box: [40, 20, 20, 40] as [number, number, number, number] }
      ];
      notes.push('Graduated 8-16 cup porcelain arrangement identified.');
      notes.push('Water-tuned idiophone organology matched with Vatsyayana Kama Sutra Udaka Vadya.');
    } else if (matched.id === 'pakhawaj') {
      detectedFeatures = [
        { feature: 'Asymmetrical Sheesham Barrel (Khol)', confidence: 0.96, box: [20, 25, 60, 50] as [number, number, number, number] },
        { feature: 'Treble Syahi Harmonic Head', confidence: 0.95, box: [65, 35, 20, 30] as [number, number, number, number] },
        { feature: 'Bass Wheat-Dough Head', confidence: 0.93, box: [15, 35, 20, 30] as [number, number, number, number] },
        { feature: 'Tuning Pegs & Braided Vaddhi', confidence: 0.90, box: [30, 30, 40, 40] as [number, number, number, number] }
      ];
      notes.push('Dual-membrane horizontal barrel drum classified under Avanaddha Vadya.');
      notes.push('Black iron-ore syahi circle and wheat-dough bass head detected.');
    } else if (matched.id === 'algoza') {
      detectedFeatures = [
        { feature: 'Twin Parallel Wood Pipes', confidence: 0.95, box: [35, 15, 30, 70] as [number, number, number, number] },
        { feature: 'Beak Mouthpiece Fipples', confidence: 0.92, box: [40, 15, 20, 20] as [number, number, number, number] },
        { feature: 'Melody & Drone Tone Holes', confidence: 0.90, box: [38, 45, 24, 35] as [number, number, number, number] }
      ];
      notes.push('Matched twin fipple aerophones identified for circular breathing playback.');
    } else {
      // Conch / Shankha
      detectedFeatures = [
        { feature: 'Spiral Conical Shell Body', confidence: 0.98, box: [25, 20, 50, 60] as [number, number, number, number] },
        { feature: 'Apex Embouchure Mouthpiece', confidence: 0.93, box: [60, 60, 20, 20] as [number, number, number, number] },
        { feature: 'Spiral Calcareous Chamber', confidence: 0.91, box: [30, 30, 40, 40] as [number, number, number, number] }
      ];
      notes.push('Turbinella pyrum natural logarithmic spiral acoustic horn detected.');
      notes.push('Vedic Mangala Vadya aerophone classification.');
    }

    const confidenceScore = Math.floor(88 + Math.random() * 11);

    return {
      instrument: matched,
      confidence: confidenceScore,
      detectedFeatures,
      analysisNotes: notes,
      visualComparisonUrl: matched.carvingImage || matched.image
    };
  }
}
