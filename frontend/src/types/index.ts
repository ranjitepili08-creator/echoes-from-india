export type InstrumentFamily = 'tata' | 'sushira' | 'avanaddha' | 'ghana';

export type ConservationStatus = 'extinct' | 'endangered' | 'rare' | 'living';

export type HistoricalPeriod = 
  | 'vedic' 
  | 'sangam' 
  | 'maurya_gupta' 
  | 'medieval' 
  | 'mughal' 
  | 'colonial_modern';

export interface MaterialComponent {
  name: string;
  description: string;
  acousticRole?: string;
}

export interface TreatiseCitation {
  treatise: string;
  chapter?: string;
  quote: string;
  translation: string;
}

export interface AcousticProfile {
  resonatorType: string;
  bodyResonanceFreq: number; // in Hz
  jawariBuzz: number; // 0 - 1 (intensity of jivari bridge buzzing)
  decayTime: number; // in seconds
  harmonicRichness: number; // 0 - 1
  sympatheticTarab: boolean;
  timbreType: 'plucked_wire' | 'plucked_silk' | 'bowed_folk' | 'percussive_ceramic' | 'percussive_membrane' | 'blown_reed' | 'conch_horn';
  frequencyRange: string;
  soundReconstructionNotes: string;
}

export interface NoteDefinition {
  sargam: string;
  western: string;
  frequency: number;
  keyboardKey: string;
}

export interface BolDefinition {
  name: string;
  westernEquivalent: string;
  key: string;
  description: string;
  pitch: number;
  decay: number;
  harmonicNoise: number;
  head: 'left_bass' | 'right_treble' | 'both';
}

export interface PlayInterfaceConfig {
  type: 'strings' | 'jaltarang' | 'pakhawaj' | 'wind';
  stringCount?: number;
  notes: NoteDefinition[];
  bols?: BolDefinition[];
  droneNotes?: NoteDefinition[];
  waterLevels?: number[]; // for Jal Tarang (0 to 100%)
}

export interface Instrument {
  id: string;
  name: string;
  sanskritName: string;
  regionalNames: string[];
  family: InstrumentFamily;
  categoryLabel: string;
  era: string;
  period: HistoricalPeriod;
  century: string;
  region: string;
  coordinates?: [number, number]; // approx Lat, Lng for map
  status: ConservationStatus;
  image: string;
  carvingImage?: string;
  shortDescription: string;
  historicalContext: string;
  constructionMaterials: MaterialComponent[];
  playingTechnique: string;
  culturalSignificance: string;
  treatiseCitations: TreatiseCitation[];
  acousticProfile: AcousticProfile;
  playInterface: PlayInterfaceConfig;
  detectionCues: {
    shapePattern: string;
    resonators: string;
    stringsOrPipes: string;
    bridgeType: string;
  };
}

export interface ExtractedVisualAttributes {
  instrument_family: string;
  resonator_shape: string;
  resonator_material: string;
  neck_length_category: string;
  number_of_strings: string;
  distinctive_features: string[];
  playing_posture: string;
  detected_color_palette?: string;
  spatial_aspect_ratio?: number;
}

export interface MatchCandidate {
  instrument_id: string;
  instrument_name: string;
  sanskrit_name: string;
  category_label: string;
  similarity_score: number;
  confidence_percent: number;
  rank: number;
  is_top_match: boolean;
  matched_reasons?: string[];
  attribute_breakdown?: Record<string, number>;
}

export interface VisionDetectionResult {
  instrument: Instrument;
  confidence: number;
  similarity_score?: number;
  confidence_gate_triggered?: boolean;
  top_matches?: MatchCandidate[];
  classification_source?: string;
  extracted_attributes?: ExtractedVisualAttributes;
  detectedFeatures: {
    feature: string;
    confidence: number;
    box?: [number, number, number, number]; // x, y, width, height (percentages)
  }[];
  analysisNotes: string[];
  visualComparisonUrl?: string;
}

export interface SongNote {
  pitch: string; // e.g. "C4", "D4", "E4", "G4", "A4"
  sargam: string; // e.g. "Sa", "Re", "Ga", "Pa", "Dha"
  time: number; // in seconds from start
  duration: number; // in seconds
  lane: number; // 0, 1, 2, 3 (for 4-lane rhythm game)
}

export interface SongChart {
  id: string;
  title: string;
  ragaOrOrigin: string;
  description: string;
  era: string;
  bpm: number;
  duration: number; // total length in sec
  notes: SongNote[];
  difficulty: 'Beginner' | 'Intermediate' | 'Virtuoso';
}
