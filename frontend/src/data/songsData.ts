import { SongChart } from '../types';

export const HERITAGE_SONGS: SongChart[] = [
  {
    id: 'dheem-ta-dare-dani',
    title: 'Dheem Ta Dare Dani (Tarana Theme)',
    ragaOrOrigin: 'Classical Drut Tarana / Raga Bhupali & Shankarabharanam',
    description: 'High-energy classical Indian Tarana composition with rhythmic syllables and fast melodic cascades.',
    era: 'Classical Heritage Composition',
    bpm: 120,
    duration: 45,
    difficulty: 'Intermediate',
    notes: [
      // Phrase 1: Sthayi - Dheem Ta Da-re Da-ni (0.0s - 10.5s)
      { pitch: 'C4', sargam: 'Dheem', time: 1.0, duration: 0.45, lane: 0 },
      { pitch: 'D4', sargam: 'Ta', time: 1.5, duration: 0.45, lane: 1 },
      { pitch: 'E4', sargam: 'Da-re', time: 2.0, duration: 0.45, lane: 2 },
      { pitch: 'G4', sargam: 'Da-ni', time: 2.5, duration: 0.75, lane: 3 },
      { pitch: 'E4', sargam: 'Ta', time: 3.5, duration: 0.45, lane: 2 },
      { pitch: 'D4', sargam: 'Na', time: 4.0, duration: 0.45, lane: 1 },
      { pitch: 'C4', sargam: 'Dheem', time: 4.5, duration: 0.95, lane: 0 },

      { pitch: 'C4', sargam: 'Dheem', time: 6.0, duration: 0.45, lane: 0 },
      { pitch: 'D4', sargam: 'Ta', time: 6.5, duration: 0.45, lane: 1 },
      { pitch: 'E4', sargam: 'Da-re', time: 7.0, duration: 0.45, lane: 2 },
      { pitch: 'G4', sargam: 'Da-ni', time: 7.5, duration: 0.75, lane: 3 },
      { pitch: 'A4', sargam: 'Tom', time: 8.5, duration: 0.45, lane: 3 },
      { pitch: 'G4', sargam: 'Ta', time: 9.0, duration: 0.45, lane: 2 },
      { pitch: 'E4', sargam: 'Na', time: 9.5, duration: 0.95, lane: 1 },

      // Phrase 2: Antara - Ta-na-na De-re-na Upper Octave (11.0s - 20.5s)
      { pitch: 'E4', sargam: 'Ta', time: 11.0, duration: 0.45, lane: 1 },
      { pitch: 'G4', sargam: 'Na', time: 11.5, duration: 0.45, lane: 2 },
      { pitch: 'A4', sargam: 'Na', time: 12.0, duration: 0.45, lane: 3 },
      { pitch: 'C5', sargam: 'De-re', time: 12.5, duration: 0.75, lane: 3 },
      { pitch: 'A4', sargam: 'Na', time: 13.5, duration: 0.45, lane: 2 },
      { pitch: 'G4', sargam: 'Tom', time: 14.0, duration: 0.45, lane: 1 },
      { pitch: 'E4', sargam: 'Ta', time: 14.5, duration: 0.95, lane: 0 },

      { pitch: 'G4', sargam: 'Dheem', time: 16.0, duration: 0.45, lane: 2 },
      { pitch: 'A4', sargam: 'Ta', time: 16.5, duration: 0.45, lane: 3 },
      { pitch: 'C5', sargam: 'Da-re', time: 17.0, duration: 0.45, lane: 3 },
      { pitch: 'D5', sargam: 'Da-ni', time: 17.5, duration: 0.75, lane: 3 },
      { pitch: 'C5', sargam: 'Ta', time: 18.5, duration: 0.45, lane: 2 },
      { pitch: 'A4', sargam: 'Na', time: 19.0, duration: 0.45, lane: 1 },
      { pitch: 'G4', sargam: 'Dheem', time: 19.5, duration: 0.95, lane: 0 },

      // Phrase 3: Drut Taan Cascade - Fast flowing 8th notes (21.0s - 31.0s)
      { pitch: 'C4', sargam: 'Ta', time: 21.0, duration: 0.35, lane: 0 },
      { pitch: 'D4', sargam: 'Re', time: 21.5, duration: 0.35, lane: 1 },
      { pitch: 'E4', sargam: 'Da', time: 22.0, duration: 0.35, lane: 2 },
      { pitch: 'G4', sargam: 'Ni', time: 22.5, duration: 0.35, lane: 3 },
      { pitch: 'A4', sargam: 'Ta', time: 23.0, duration: 0.35, lane: 3 },
      { pitch: 'C5', sargam: 'Na', time: 23.5, duration: 0.45, lane: 3 },
      { pitch: 'A4', sargam: 'De', time: 24.0, duration: 0.35, lane: 2 },
      { pitch: 'G4', sargam: 'Re', time: 24.5, duration: 0.35, lane: 1 },
      { pitch: 'E4', sargam: 'Na', time: 25.0, duration: 0.35, lane: 0 },
      { pitch: 'D4', sargam: 'Tom', time: 25.5, duration: 0.35, lane: 1 },
      { pitch: 'C4', sargam: 'Dheem', time: 26.0, duration: 0.95, lane: 0 },

      { pitch: 'E4', sargam: 'O-dani', time: 27.5, duration: 0.35, lane: 1 },
      { pitch: 'G4', sargam: 'Ta-re', time: 28.0, duration: 0.35, lane: 2 },
      { pitch: 'A4', sargam: 'Da-ni', time: 28.5, duration: 0.35, lane: 3 },
      { pitch: 'C5', sargam: 'Tom', time: 29.0, duration: 0.35, lane: 3 },
      { pitch: 'A4', sargam: 'Ta-na', time: 29.5, duration: 0.35, lane: 2 },
      { pitch: 'G4', sargam: 'De-re', time: 30.0, duration: 0.85, lane: 1 },

      // Phrase 4: Jhala Accelerando (31.5s - 38.0s)
      { pitch: 'C4', sargam: 'Jha', time: 31.5, duration: 0.25, lane: 0 },
      { pitch: 'E4', sargam: 'La', time: 32.0, duration: 0.25, lane: 1 },
      { pitch: 'G4', sargam: 'Jha', time: 32.5, duration: 0.25, lane: 2 },
      { pitch: 'C5', sargam: 'La', time: 33.0, duration: 0.35, lane: 3 },
      { pitch: 'A4', sargam: 'Ta', time: 33.5, duration: 0.25, lane: 2 },
      { pitch: 'G4', sargam: 'Na', time: 34.0, duration: 0.25, lane: 1 },
      { pitch: 'E4', sargam: 'Dheem', time: 34.5, duration: 0.45, lane: 0 },
      { pitch: 'D4', sargam: 'Tom', time: 35.0, duration: 0.25, lane: 1 },
      { pitch: 'C4', sargam: 'Ta', time: 35.5, duration: 0.25, lane: 0 },
      { pitch: 'E4', sargam: 'Na', time: 36.0, duration: 0.25, lane: 1 },
      { pitch: 'G4', sargam: 'De', time: 36.5, duration: 0.25, lane: 2 },
      { pitch: 'C5', sargam: 'Re', time: 37.0, duration: 0.75, lane: 3 },

      // Phrase 5: Grand Tihai Triple Cadence (38.5s - 44.0s)
      { pitch: 'E4', sargam: 'Dheem (1)', time: 38.5, duration: 0.45, lane: 1 },
      { pitch: 'G4', sargam: 'Ta', time: 39.0, duration: 0.35, lane: 2 },
      { pitch: 'C5', sargam: 'DANI!', time: 39.5, duration: 0.45, lane: 3 },

      { pitch: 'E4', sargam: 'Dheem (2)', time: 40.5, duration: 0.45, lane: 1 },
      { pitch: 'G4', sargam: 'Ta', time: 41.0, duration: 0.35, lane: 2 },
      { pitch: 'C5', sargam: 'DANI!', time: 41.5, duration: 0.45, lane: 3 },

      { pitch: 'E4', sargam: 'Dheem (3)', time: 42.5, duration: 0.45, lane: 1 },
      { pitch: 'G4', sargam: 'Ta', time: 43.0, duration: 0.45, lane: 2 },
      { pitch: 'C5', sargam: 'DHEEM (SAM)!', time: 43.5, duration: 1.8, lane: 3 }
    ]
  },
  {
    id: 'vande-mataram',
    title: 'Vande Mataram (Classical Raga Desh)',
    ragaOrOrigin: 'Raga Desh / Bankim Chandra Chattopadhyay',
    description: 'Iconic national melody invoking reverence and patriotism, immortalized in classical Desh.',
    era: '19th Century Classical Revival',
    bpm: 100,
    duration: 42,
    difficulty: 'Beginner',
    notes: [
      // Verse 1: Vande Mataram (0.0s - 10.0s)
      { pitch: 'E4', sargam: 'Van-', time: 1.0, duration: 0.55, lane: 1 },
      { pitch: 'G4', sargam: 'de', time: 1.8, duration: 0.55, lane: 2 },
      { pitch: 'G4', sargam: 'Ma-', time: 2.6, duration: 0.55, lane: 2 },
      { pitch: 'A4', sargam: 'ta-', time: 3.4, duration: 0.85, lane: 3 },
      { pitch: 'G4', sargam: 'ram', time: 4.4, duration: 1.4, lane: 2 },

      { pitch: 'E4', sargam: 'Van-', time: 6.4, duration: 0.55, lane: 1 },
      { pitch: 'G4', sargam: 'de', time: 7.2, duration: 0.55, lane: 2 },
      { pitch: 'A4', sargam: 'Ma-', time: 8.0, duration: 0.55, lane: 3 },
      { pitch: 'C5', sargam: 'ta-', time: 8.8, duration: 0.85, lane: 3 },
      { pitch: 'B4', sargam: 'ram', time: 9.8, duration: 1.2, lane: 2 },

      // Verse 2: Sujalam Sufalam Malayaja Sheetalam (11.5s - 22.0s)
      { pitch: 'A4', sargam: 'Su-', time: 11.5, duration: 0.55, lane: 2 },
      { pitch: 'G4', sargam: 'ja-', time: 12.2, duration: 0.55, lane: 1 },
      { pitch: 'A4', sargam: 'lam', time: 12.9, duration: 0.75, lane: 2 },
      { pitch: 'C5', sargam: 'Su-', time: 13.8, duration: 0.55, lane: 3 },
      { pitch: 'B4', sargam: 'pha-', time: 14.5, duration: 0.55, lane: 2 },
      { pitch: 'A4', sargam: 'lam', time: 15.2, duration: 0.85, lane: 1 },
      { pitch: 'G4', sargam: 'Ma-', time: 16.2, duration: 1.2, lane: 0 },

      { pitch: 'E4', sargam: 'la-', time: 18.0, duration: 0.55, lane: 1 },
      { pitch: 'F4', sargam: 'ya-', time: 18.7, duration: 0.55, lane: 2 },
      { pitch: 'G4', sargam: 'ja', time: 19.4, duration: 0.75, lane: 3 },
      { pitch: 'E4', sargam: 'Shee-', time: 20.3, duration: 0.55, lane: 1 },
      { pitch: 'D4', sargam: 'ta-', time: 21.0, duration: 0.55, lane: 0 },
      { pitch: 'C4', sargam: 'lam', time: 21.7, duration: 1.8, lane: 0 },

      // Verse 3: Shasya Shyamalam Mataram (24.0s - 32.0s)
      { pitch: 'E4', sargam: 'Shas-', time: 24.0, duration: 0.55, lane: 1 },
      { pitch: 'G4', sargam: 'ya', time: 24.7, duration: 0.55, lane: 2 },
      { pitch: 'G4', sargam: 'Shya-', time: 25.4, duration: 0.55, lane: 2 },
      { pitch: 'A4', sargam: 'ma-', time: 26.1, duration: 0.75, lane: 3 },
      { pitch: 'G4', sargam: 'lam', time: 27.0, duration: 1.2, lane: 2 },

      { pitch: 'C5', sargam: 'Ma-', time: 28.6, duration: 0.75, lane: 3 },
      { pitch: 'B4', sargam: 'ta-', time: 29.5, duration: 0.75, lane: 2 },
      { pitch: 'A4', sargam: 'ram', time: 30.4, duration: 1.6, lane: 1 },

      // Verse 4: Shubhrajyotsna Grand Finale (32.5s - 41.5s)
      { pitch: 'G4', sargam: 'Shubh-', time: 32.5, duration: 0.55, lane: 2 },
      { pitch: 'A4', sargam: 'ra', time: 33.2, duration: 0.55, lane: 3 },
      { pitch: 'C5', sargam: 'Jyots-', time: 33.9, duration: 0.75, lane: 3 },
      { pitch: 'D5', sargam: 'na', time: 34.8, duration: 0.95, lane: 3 },
      { pitch: 'C5', sargam: 'Pul-', time: 36.0, duration: 0.55, lane: 2 },
      { pitch: 'A4', sargam: 'ki-', time: 36.7, duration: 0.55, lane: 1 },
      { pitch: 'G4', sargam: 'ta', time: 37.4, duration: 0.75, lane: 0 },
      { pitch: 'E4', sargam: 'Van-', time: 38.5, duration: 0.65, lane: 1 },
      { pitch: 'D4', sargam: 'de', time: 39.3, duration: 0.65, lane: 0 },
      { pitch: 'C4', sargam: 'MATARAM!', time: 40.1, duration: 2.2, lane: 0 }
    ]
  },
  {
    id: 'raghupati-raghav',
    title: 'Raghupati Raghav Raja Ram',
    ragaOrOrigin: 'Traditional Bhajan (Mishra Gara)',
    description: 'Universal devotional melody revered for simplicity, rhythmic peace, and spiritual tranquility.',
    era: 'Classical Tradition',
    bpm: 110,
    duration: 40,
    difficulty: 'Beginner',
    notes: [
      // Sthayi Phrase 1 (0.0s - 9.0s)
      { pitch: 'C4', sargam: 'Raghu-', time: 1.0, duration: 0.45, lane: 0 },
      { pitch: 'C4', sargam: 'pati', time: 1.6, duration: 0.45, lane: 0 },
      { pitch: 'D4', sargam: 'Raghav', time: 2.2, duration: 0.45, lane: 1 },
      { pitch: 'E4', sargam: 'Raja', time: 2.8, duration: 0.55, lane: 2 },
      { pitch: 'G4', sargam: 'Ram', time: 3.5, duration: 0.85, lane: 3 },
      { pitch: 'E4', sargam: 'Patita', time: 4.6, duration: 0.55, lane: 2 },
      { pitch: 'D4', sargam: 'Pavan', time: 5.3, duration: 0.75, lane: 1 },
      { pitch: 'C4', sargam: 'Sitaram', time: 6.3, duration: 1.5, lane: 0 },

      // Sthayi Phrase 2 (8.5s - 17.0s)
      { pitch: 'E4', sargam: 'Sita-', time: 8.5, duration: 0.45, lane: 1 },
      { pitch: 'G4', sargam: 'ram', time: 9.1, duration: 0.45, lane: 2 },
      { pitch: 'A4', sargam: 'Sita-', time: 9.7, duration: 0.55, lane: 3 },
      { pitch: 'G4', sargam: 'ram', time: 10.4, duration: 0.85, lane: 2 },
      { pitch: 'E4', sargam: 'Bhaj', time: 11.5, duration: 0.45, lane: 1 },
      { pitch: 'D4', sargam: 'Pyare', time: 12.1, duration: 0.55, lane: 0 },
      { pitch: 'C4', sargam: 'Tu Sitaram', time: 12.9, duration: 1.5, lane: 0 },

      // Antara: Ishwar Allah Tero Naam (15.0s - 25.0s)
      { pitch: 'E4', sargam: 'Ishwar', time: 15.0, duration: 0.45, lane: 1 },
      { pitch: 'G4', sargam: 'Allah', time: 15.6, duration: 0.45, lane: 2 },
      { pitch: 'A4', sargam: 'Tero', time: 16.2, duration: 0.55, lane: 3 },
      { pitch: 'C5', sargam: 'Naam', time: 16.9, duration: 0.95, lane: 3 },
      { pitch: 'A4', sargam: 'Sabko', time: 18.1, duration: 0.55, lane: 2 },
      { pitch: 'G4', sargam: 'Sanmati', time: 18.8, duration: 0.55, lane: 1 },
      { pitch: 'E4', sargam: 'De', time: 19.5, duration: 0.45, lane: 0 },
      { pitch: 'D4', sargam: 'Bhagwan', time: 20.1, duration: 1.4, lane: 1 },

      // Antara Repeat with Octave (22.5s - 31.0s)
      { pitch: 'G4', sargam: 'Sabko', time: 22.5, duration: 0.45, lane: 2 },
      { pitch: 'A4', sargam: 'Sanmati', time: 23.1, duration: 0.45, lane: 3 },
      { pitch: 'C5', sargam: 'De', time: 23.7, duration: 0.55, lane: 3 },
      { pitch: 'D5', sargam: 'Bhagwan', time: 24.4, duration: 0.95, lane: 3 },
      { pitch: 'C5', sargam: 'Ishwar', time: 25.6, duration: 0.55, lane: 2 },
      { pitch: 'A4', sargam: 'Allah', time: 26.3, duration: 0.55, lane: 1 },
      { pitch: 'G4', sargam: 'Tero', time: 27.0, duration: 0.45, lane: 0 },
      { pitch: 'E4', sargam: 'Naam', time: 27.6, duration: 1.4, lane: 1 },

      // Grand Finale Climax (30.0s - 39.0s)
      { pitch: 'C4', sargam: 'Raghu-', time: 30.0, duration: 0.45, lane: 0 },
      { pitch: 'C4', sargam: 'pati', time: 30.6, duration: 0.45, lane: 0 },
      { pitch: 'D4', sargam: 'Raghav', time: 31.2, duration: 0.45, lane: 1 },
      { pitch: 'E4', sargam: 'Raja', time: 31.8, duration: 0.55, lane: 2 },
      { pitch: 'G4', sargam: 'Ram', time: 32.5, duration: 0.75, lane: 3 },
      { pitch: 'A4', sargam: 'Patita', time: 33.5, duration: 0.45, lane: 3 },
      { pitch: 'G4', sargam: 'Pavan', time: 34.1, duration: 0.45, lane: 2 },
      { pitch: 'E4', sargam: 'Sita-', time: 34.7, duration: 0.45, lane: 1 },
      { pitch: 'D4', sargam: 'ram', time: 35.3, duration: 0.55, lane: 0 },
      { pitch: 'C4', sargam: 'RAM!', time: 36.1, duration: 2.2, lane: 0 }
    ]
  },
  {
    id: 'bhupali',
    title: 'Raga Bhupali (Classical Bandish & Taan)',
    ragaOrOrigin: 'Raga Bhupali / Mohanam (Audav Raga)',
    description: 'Ancient uplifting pentatonic melody embodying peace, meditative sweetness, and intricate taans.',
    era: 'Classical Antiquity',
    bpm: 120,
    duration: 45,
    difficulty: 'Intermediate',
    notes: [
      // Arohana Alaap (0.0s - 9.0s)
      { pitch: 'C4', sargam: 'Sa', time: 1.0, duration: 0.65, lane: 0 },
      { pitch: 'D4', sargam: 'Re', time: 2.0, duration: 0.65, lane: 1 },
      { pitch: 'E4', sargam: 'Ga', time: 3.0, duration: 0.85, lane: 2 },
      { pitch: 'G4', sargam: 'Pa', time: 4.2, duration: 0.65, lane: 3 },
      { pitch: 'A4', sargam: 'Dha', time: 5.2, duration: 0.65, lane: 2 },
      { pitch: 'C5', sargam: 'Tar Sa', time: 6.2, duration: 1.5, lane: 3 },

      // Avarohana Alaap (8.5s - 16.0s)
      { pitch: 'C5', sargam: 'Tar Sa', time: 8.5, duration: 0.65, lane: 3 },
      { pitch: 'A4', sargam: 'Dha', time: 9.5, duration: 0.65, lane: 2 },
      { pitch: 'G4', sargam: 'Pa', time: 10.5, duration: 0.65, lane: 3 },
      { pitch: 'E4', sargam: 'Ga', time: 11.5, duration: 0.75, lane: 1 },
      { pitch: 'D4', sargam: 'Re', time: 12.6, duration: 0.65, lane: 0 },
      { pitch: 'C4', sargam: 'Sa', time: 13.6, duration: 1.8, lane: 0 },

      // Bandish Theme (16.0s - 25.0s)
      { pitch: 'E4', sargam: 'E-', time: 16.0, duration: 0.45, lane: 1 },
      { pitch: 'G4', sargam: 'ri', time: 16.6, duration: 0.45, lane: 2 },
      { pitch: 'G4', sargam: 'Aa-', time: 17.2, duration: 0.55, lane: 2 },
      { pitch: 'A4', sargam: 'li', time: 17.9, duration: 0.75, lane: 3 },
      { pitch: 'G4', sargam: 'Pi-', time: 18.9, duration: 0.45, lane: 2 },
      { pitch: 'E4', sargam: 'ya', time: 19.5, duration: 0.45, lane: 1 },
      { pitch: 'D4', sargam: 'Bi-', time: 20.1, duration: 0.55, lane: 0 },
      { pitch: 'C4', sargam: 'na', time: 20.8, duration: 1.5, lane: 0 },

      // Fast Sapat Taans (23.0s - 34.0s)
      { pitch: 'C4', sargam: 'Sa', time: 23.0, duration: 0.28, lane: 0 },
      { pitch: 'D4', sargam: 'Re', time: 23.4, duration: 0.28, lane: 1 },
      { pitch: 'E4', sargam: 'Ga', time: 23.8, duration: 0.28, lane: 2 },
      { pitch: 'G4', sargam: 'Pa', time: 24.2, duration: 0.28, lane: 3 },
      { pitch: 'A4', sargam: 'Dha', time: 24.6, duration: 0.28, lane: 3 },
      { pitch: 'C5', sargam: 'Sa\'', time: 25.0, duration: 0.45, lane: 3 },
      { pitch: 'A4', sargam: 'Dha', time: 25.6, duration: 0.28, lane: 2 },
      { pitch: 'G4', sargam: 'Pa', time: 26.0, duration: 0.28, lane: 1 },
      { pitch: 'E4', sargam: 'Ga', time: 26.4, duration: 0.28, lane: 0 },
      { pitch: 'D4', sargam: 'Re', time: 26.8, duration: 0.28, lane: 1 },
      { pitch: 'C4', sargam: 'Sa', time: 27.2, duration: 0.85, lane: 0 },

      { pitch: 'E4', sargam: 'Ga', time: 28.5, duration: 0.28, lane: 1 },
      { pitch: 'G4', sargam: 'Pa', time: 28.9, duration: 0.28, lane: 2 },
      { pitch: 'A4', sargam: 'Dha', time: 29.3, duration: 0.28, lane: 3 },
      { pitch: 'C5', sargam: 'Sa\'', time: 29.7, duration: 0.35, lane: 3 },
      { pitch: 'D5', sargam: 'Re\'', time: 30.2, duration: 0.45, lane: 3 },
      { pitch: 'C5', sargam: 'Sa\'', time: 30.8, duration: 0.28, lane: 2 },
      { pitch: 'A4', sargam: 'Dha', time: 31.2, duration: 0.28, lane: 1 },
      { pitch: 'G4', sargam: 'Pa', time: 31.6, duration: 0.85, lane: 0 },

      // Jhala & Tihai Finale (33.0s - 43.5s)
      { pitch: 'C4', sargam: 'Sa (1)', time: 33.5, duration: 0.35, lane: 0 },
      { pitch: 'E4', sargam: 'Ga', time: 34.0, duration: 0.35, lane: 1 },
      { pitch: 'G4', sargam: 'Pa', time: 34.5, duration: 0.35, lane: 2 },
      { pitch: 'C5', sargam: 'SA!', time: 35.0, duration: 0.55, lane: 3 },

      { pitch: 'C4', sargam: 'Sa (2)', time: 36.5, duration: 0.35, lane: 0 },
      { pitch: 'E4', sargam: 'Ga', time: 37.0, duration: 0.35, lane: 1 },
      { pitch: 'G4', sargam: 'Pa', time: 37.5, duration: 0.35, lane: 2 },
      { pitch: 'C5', sargam: 'SA!', time: 38.0, duration: 0.55, lane: 3 },

      { pitch: 'C4', sargam: 'Sa (3)', time: 39.5, duration: 0.35, lane: 0 },
      { pitch: 'E4', sargam: 'Ga', time: 40.0, duration: 0.35, lane: 1 },
      { pitch: 'G4', sargam: 'Pa', time: 40.5, duration: 0.35, lane: 2 },
      { pitch: 'C5', sargam: 'MOHANAM (SAM)!', time: 41.2, duration: 2.5, lane: 3 }
    ]
  },
  {
    id: 'ode-to-joy-fusion',
    title: 'Ode to Joy (Heritage Timbre Fusion)',
    ragaOrOrigin: 'Beethoven in Bilawal / Shankarabharanam Scale',
    description: 'Universal melody played in ancient Indian classical timbre with full orchestral structure.',
    era: 'Universal Classic',
    bpm: 120,
    duration: 38,
    difficulty: 'Intermediate',
    notes: [
      // Theme A (0.0s - 8.5s)
      { pitch: 'E4', sargam: 'Ga', time: 1.0, duration: 0.45, lane: 2 },
      { pitch: 'E4', sargam: 'Ga', time: 1.5, duration: 0.45, lane: 2 },
      { pitch: 'F4', sargam: 'Ma', time: 2.0, duration: 0.45, lane: 3 },
      { pitch: 'G4', sargam: 'Pa', time: 2.5, duration: 0.45, lane: 3 },
      { pitch: 'G4', sargam: 'Pa', time: 3.0, duration: 0.45, lane: 3 },
      { pitch: 'F4', sargam: 'Ma', time: 3.5, duration: 0.45, lane: 2 },
      { pitch: 'E4', sargam: 'Ga', time: 4.0, duration: 0.45, lane: 1 },
      { pitch: 'D4', sargam: 'Re', time: 4.5, duration: 0.45, lane: 0 },
      { pitch: 'C4', sargam: 'Sa', time: 5.0, duration: 0.45, lane: 0 },
      { pitch: 'C4', sargam: 'Sa', time: 5.5, duration: 0.45, lane: 0 },
      { pitch: 'D4', sargam: 'Re', time: 6.0, duration: 0.45, lane: 1 },
      { pitch: 'E4', sargam: 'Ga', time: 6.5, duration: 0.65, lane: 2 },
      { pitch: 'E4', sargam: 'Ga', time: 7.3, duration: 0.45, lane: 1 },
      { pitch: 'D4', sargam: 'Re', time: 7.9, duration: 0.95, lane: 0 },

      // Theme A Repeat (9.0s - 17.0s)
      { pitch: 'E4', sargam: 'Ga', time: 9.5, duration: 0.45, lane: 2 },
      { pitch: 'E4', sargam: 'Ga', time: 10.0, duration: 0.45, lane: 2 },
      { pitch: 'F4', sargam: 'Ma', time: 10.5, duration: 0.45, lane: 3 },
      { pitch: 'G4', sargam: 'Pa', time: 11.0, duration: 0.45, lane: 3 },
      { pitch: 'G4', sargam: 'Pa', time: 11.5, duration: 0.45, lane: 3 },
      { pitch: 'F4', sargam: 'Ma', time: 12.0, duration: 0.45, lane: 2 },
      { pitch: 'E4', sargam: 'Ga', time: 12.5, duration: 0.45, lane: 1 },
      { pitch: 'D4', sargam: 'Re', time: 13.0, duration: 0.45, lane: 0 },
      { pitch: 'C4', sargam: 'Sa', time: 13.5, duration: 0.45, lane: 0 },
      { pitch: 'C4', sargam: 'Sa', time: 14.0, duration: 0.45, lane: 0 },
      { pitch: 'D4', sargam: 'Re', time: 14.5, duration: 0.45, lane: 1 },
      { pitch: 'E4', sargam: 'Ga', time: 15.0, duration: 0.65, lane: 2 },
      { pitch: 'D4', sargam: 'Re', time: 15.8, duration: 0.45, lane: 1 },
      { pitch: 'C4', sargam: 'Sa', time: 16.4, duration: 1.2, lane: 0 },

      // Theme B Bridge (18.0s - 26.5s)
      { pitch: 'D4', sargam: 'Re', time: 18.0, duration: 0.45, lane: 1 },
      { pitch: 'D4', sargam: 'Re', time: 18.5, duration: 0.45, lane: 1 },
      { pitch: 'E4', sargam: 'Ga', time: 19.0, duration: 0.45, lane: 2 },
      { pitch: 'C4', sargam: 'Sa', time: 19.5, duration: 0.45, lane: 0 },
      { pitch: 'D4', sargam: 'Re', time: 20.0, duration: 0.45, lane: 1 },
      { pitch: 'E4', sargam: 'Ga', time: 20.5, duration: 0.35, lane: 2 },
      { pitch: 'F4', sargam: 'Ma', time: 20.9, duration: 0.35, lane: 3 },
      { pitch: 'E4', sargam: 'Ga', time: 21.3, duration: 0.45, lane: 2 },
      { pitch: 'C4', sargam: 'Sa', time: 21.8, duration: 0.45, lane: 0 },
      { pitch: 'D4', sargam: 'Re', time: 22.3, duration: 0.45, lane: 1 },
      { pitch: 'E4', sargam: 'Ga', time: 22.8, duration: 0.35, lane: 2 },
      { pitch: 'F4', sargam: 'Ma', time: 23.2, duration: 0.35, lane: 3 },
      { pitch: 'E4', sargam: 'Ga', time: 23.6, duration: 0.45, lane: 2 },
      { pitch: 'D4', sargam: 'Re', time: 24.1, duration: 0.45, lane: 1 },
      { pitch: 'C4', sargam: 'Sa', time: 24.6, duration: 0.45, lane: 0 },
      { pitch: 'D4', sargam: 'Re', time: 25.1, duration: 0.45, lane: 1 },
      { pitch: 'G3', sargam: 'Pa (Low)', time: 25.6, duration: 1.2, lane: 0 },

      // Theme A Grand Recapitulation (27.5s - 36.5s)
      { pitch: 'E4', sargam: 'Ga', time: 27.5, duration: 0.45, lane: 2 },
      { pitch: 'E4', sargam: 'Ga', time: 28.0, duration: 0.45, lane: 2 },
      { pitch: 'F4', sargam: 'Ma', time: 28.5, duration: 0.45, lane: 3 },
      { pitch: 'G4', sargam: 'Pa', time: 29.0, duration: 0.45, lane: 3 },
      { pitch: 'G4', sargam: 'Pa', time: 29.5, duration: 0.45, lane: 3 },
      { pitch: 'F4', sargam: 'Ma', time: 30.0, duration: 0.45, lane: 2 },
      { pitch: 'E4', sargam: 'Ga', time: 30.5, duration: 0.45, lane: 1 },
      { pitch: 'D4', sargam: 'Re', time: 31.0, duration: 0.45, lane: 0 },
      { pitch: 'C4', sargam: 'Sa', time: 31.5, duration: 0.45, lane: 0 },
      { pitch: 'C4', sargam: 'Sa', time: 32.0, duration: 0.45, lane: 0 },
      { pitch: 'D4', sargam: 'Re', time: 32.5, duration: 0.45, lane: 1 },
      { pitch: 'E4', sargam: 'Ga', time: 33.0, duration: 0.65, lane: 2 },
      { pitch: 'D4', sargam: 'Re', time: 33.8, duration: 0.55, lane: 1 },
      { pitch: 'C4', sargam: 'ANANDA (JOY)!', time: 34.6, duration: 2.2, lane: 0 }
    ]
  }
];
