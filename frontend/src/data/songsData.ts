import { SongChart } from '../types';

export const HERITAGE_SONGS: SongChart[] = [
  {
    id: 'dheem-ta-dare-dani',
    title: 'Dheem Ta Dare Dani (Tarana Theme)',
    ragaOrOrigin: 'Classical Drut Tarana / Raga Bhupali & Shankarabharanam',
    description: 'High-energy classical Indian Tarana composition with rhythmic syllables and fast melodic cascades.',
    era: 'Classical Heritage Composition',
    bpm: 130,
    duration: 38,
    difficulty: 'Intermediate',
    notes: [
      // Phrase 1: Dheem Ta Da-re Da-ni (Introductory Tarana Motif)
      { pitch: 'C4', sargam: 'Dheem', time: 1.0, duration: 0.6, lane: 0 },
      { pitch: 'D4', sargam: 'Ta', time: 1.8, duration: 0.5, lane: 1 },
      { pitch: 'E4', sargam: 'Da-re', time: 2.5, duration: 0.6, lane: 2 },
      { pitch: 'G4', sargam: 'Da-ni', time: 3.3, duration: 0.8, lane: 3 },
      { pitch: 'E4', sargam: 'Ta', time: 4.3, duration: 0.5, lane: 2 },
      { pitch: 'D4', sargam: 'Na', time: 5.0, duration: 0.5, lane: 1 },
      { pitch: 'C4', sargam: 'Dheem', time: 5.7, duration: 1.2, lane: 0 },

      // Phrase 2: Ta-na-na De-re-na (Melodic Cascade)
      { pitch: 'E4', sargam: 'Ta', time: 7.4, duration: 0.5, lane: 1 },
      { pitch: 'G4', sargam: 'Na', time: 8.0, duration: 0.5, lane: 2 },
      { pitch: 'A4', sargam: 'Na', time: 8.6, duration: 0.6, lane: 3 },
      { pitch: 'C5', sargam: 'De-re', time: 9.3, duration: 0.8, lane: 3 },
      { pitch: 'A4', sargam: 'Na', time: 10.3, duration: 0.5, lane: 2 },
      { pitch: 'G4', sargam: 'Tom', time: 11.0, duration: 0.8, lane: 1 },
      { pitch: 'E4', sargam: 'Ta', time: 12.0, duration: 1.2, lane: 0 },

      // Phrase 3: Dheem Ta Da-re Da-ni (High Octave Antara)
      { pitch: 'G4', sargam: 'Dheem', time: 13.8, duration: 0.5, lane: 2 },
      { pitch: 'A4', sargam: 'Ta', time: 14.5, duration: 0.5, lane: 3 },
      { pitch: 'C5', sargam: 'Da-re', time: 15.2, duration: 0.7, lane: 3 },
      { pitch: 'D5', sargam: 'Da-ni', time: 16.1, duration: 0.9, lane: 3 },
      { pitch: 'C5', sargam: 'Ta', time: 17.2, duration: 0.5, lane: 2 },
      { pitch: 'A4', sargam: 'Na', time: 17.9, duration: 0.5, lane: 1 },
      { pitch: 'G4', sargam: 'Na', time: 18.6, duration: 0.6, lane: 0 },
      { pitch: 'E4', sargam: 'De-re', time: 19.4, duration: 0.8, lane: 1 },
      { pitch: 'C4', sargam: 'Dheem', time: 20.4, duration: 1.5, lane: 0 },

      // Phrase 4: Fast Drut Cascade (Ta-re-da-ni Tana)
      { pitch: 'C4', sargam: 'Ta', time: 22.5, duration: 0.4, lane: 0 },
      { pitch: 'D4', sargam: 'Re', time: 23.0, duration: 0.4, lane: 1 },
      { pitch: 'E4', sargam: 'Da', time: 23.5, duration: 0.4, lane: 2 },
      { pitch: 'G4', sargam: 'Ni', time: 24.0, duration: 0.5, lane: 3 },
      { pitch: 'A4', sargam: 'Ta', time: 24.7, duration: 0.4, lane: 2 },
      { pitch: 'C5', sargam: 'Na', time: 25.3, duration: 0.6, lane: 3 },
      { pitch: 'A4', sargam: 'De', time: 26.1, duration: 0.4, lane: 2 },
      { pitch: 'G4', sargam: 'Re', time: 26.7, duration: 0.4, lane: 1 },
      { pitch: 'E4', sargam: 'Na', time: 27.3, duration: 0.5, lane: 0 },
      { pitch: 'D4', sargam: 'Tom', time: 28.0, duration: 0.6, lane: 1 },
      { pitch: 'C4', sargam: 'Dheem', time: 28.8, duration: 2.2, lane: 0 },

      // Phrase 5: Grand Tihai Cadence (Final 3 Climax Hits)
      { pitch: 'E4', sargam: 'Dheem (1)', time: 31.5, duration: 0.6, lane: 1 },
      { pitch: 'G4', sargam: 'Dheem (2)', time: 32.5, duration: 0.6, lane: 2 },
      { pitch: 'C5', sargam: 'DHEEM (3)!', time: 33.6, duration: 2.5, lane: 3 }
    ]
  },
  {
    id: 'vande-mataram',
    title: 'Vande Mataram Melody',
    ragaOrOrigin: 'Raga Desh (Bankim Chandra Chattopadhyay)',
    description: 'Iconic national melody invoking reverence and patriotism, immortalized in classical Desh.',
    era: '19th Century Classical Revival',
    bpm: 110,
    duration: 36,
    difficulty: 'Beginner',
    notes: [
      { pitch: 'E4', sargam: 'Van-', time: 1.0, duration: 0.8, lane: 1 },
      { pitch: 'G4', sargam: 'de', time: 2.0, duration: 0.8, lane: 2 },
      { pitch: 'G4', sargam: 'Ma-', time: 3.0, duration: 0.8, lane: 2 },
      { pitch: 'A4', sargam: 'ta-', time: 4.0, duration: 1.2, lane: 3 },
      { pitch: 'G4', sargam: 'ram', time: 5.5, duration: 2.0, lane: 2 },
      
      { pitch: 'E4', sargam: 'Van-', time: 8.0, duration: 0.8, lane: 1 },
      { pitch: 'G4', sargam: 'de', time: 9.0, duration: 0.8, lane: 2 },
      { pitch: 'A4', sargam: 'Ma-', time: 10.0, duration: 0.8, lane: 3 },
      { pitch: 'C5', sargam: 'ta-', time: 11.0, duration: 1.2, lane: 3 },
      { pitch: 'B4', sargam: 'ram', time: 12.5, duration: 0.8, lane: 2 },
      { pitch: 'A4', sargam: 'Su-', time: 13.5, duration: 1.5, lane: 1 },
      
      { pitch: 'G4', sargam: 'ja-', time: 15.5, duration: 0.6, lane: 2 },
      { pitch: 'A4', sargam: 'lam', time: 16.3, duration: 0.6, lane: 3 },
      { pitch: 'C5', sargam: 'Su-', time: 17.1, duration: 1.0, lane: 3 },
      { pitch: 'B4', sargam: 'pha-', time: 18.3, duration: 0.6, lane: 2 },
      { pitch: 'A4', sargam: 'lam', time: 19.1, duration: 0.6, lane: 1 },
      { pitch: 'G4', sargam: 'Ma-', time: 20.0, duration: 1.5, lane: 0 },
      
      { pitch: 'E4', sargam: 'la-', time: 22.0, duration: 0.6, lane: 1 },
      { pitch: 'F4', sargam: 'ya-', time: 22.8, duration: 0.6, lane: 2 },
      { pitch: 'G4', sargam: 'ja', time: 23.6, duration: 0.8, lane: 3 },
      { pitch: 'E4', sargam: 'Shee-', time: 24.6, duration: 0.6, lane: 1 },
      { pitch: 'D4', sargam: 'ta-', time: 25.4, duration: 0.8, lane: 0 },
      { pitch: 'C4', sargam: 'lam', time: 26.5, duration: 2.5, lane: 0 }
    ]
  },
  {
    id: 'raghupati-raghav',
    title: 'Raghupati Raghav Raja Ram',
    ragaOrOrigin: 'Traditional Bhajan (Mishra Gara)',
    description: 'Universal devotional melody revered for simplicity and spiritual tranquility.',
    era: 'Classical Tradition',
    bpm: 115,
    duration: 30,
    difficulty: 'Beginner',
    notes: [
      { pitch: 'C4', sargam: 'Raghu-', time: 1.0, duration: 0.6, lane: 0 },
      { pitch: 'C4', sargam: 'pati', time: 1.8, duration: 0.6, lane: 0 },
      { pitch: 'D4', sargam: 'Raghav', time: 2.6, duration: 0.6, lane: 1 },
      { pitch: 'E4', sargam: 'Raja', time: 3.4, duration: 0.8, lane: 2 },
      { pitch: 'G4', sargam: 'Ram', time: 4.4, duration: 1.0, lane: 3 },
      { pitch: 'E4', sargam: 'Patita', time: 5.6, duration: 0.8, lane: 2 },
      { pitch: 'D4', sargam: 'Pavan', time: 6.6, duration: 1.2, lane: 1 },
      { pitch: 'C4', sargam: 'Sitaram', time: 8.0, duration: 1.5, lane: 0 },
      
      { pitch: 'E4', sargam: 'Ishwar', time: 10.0, duration: 0.6, lane: 1 },
      { pitch: 'G4', sargam: 'Allah', time: 10.8, duration: 0.6, lane: 2 },
      { pitch: 'A4', sargam: 'Tero', time: 11.6, duration: 0.8, lane: 3 },
      { pitch: 'C5', sargam: 'Naam', time: 12.6, duration: 1.2, lane: 3 },
      { pitch: 'A4', sargam: 'Sabko', time: 14.0, duration: 0.8, lane: 2 },
      { pitch: 'G4', sargam: 'Sanmati', time: 15.0, duration: 1.5, lane: 1 },
      
      { pitch: 'G4', sargam: 'De', time: 17.0, duration: 0.6, lane: 2 },
      { pitch: 'E4', sargam: 'Bhag-', time: 17.8, duration: 0.6, lane: 1 },
      { pitch: 'D4', sargam: 'wan', time: 18.6, duration: 0.6, lane: 0 },
      { pitch: 'C4', sargam: 'Raghu-', time: 19.4, duration: 1.0, lane: 0 },
      { pitch: 'D4', sargam: 'pati', time: 20.6, duration: 0.8, lane: 1 },
      { pitch: 'E4', sargam: 'Raja', time: 21.6, duration: 0.8, lane: 2 },
      { pitch: 'C4', sargam: 'Ram', time: 22.6, duration: 2.0, lane: 0 }
    ]
  },
  {
    id: 'bhupali',
    title: 'Raga Bhupali Theme',
    ragaOrOrigin: 'Raga Bhupali / Mohanam (Audav Raga)',
    description: 'Ancient uplifting pentatonic melody embodying peace and serenity.',
    era: 'Classical Antiquity',
    bpm: 100,
    duration: 32,
    difficulty: 'Beginner',
    notes: [
      { pitch: 'C4', sargam: 'Sa', time: 1.0, duration: 0.8, lane: 0 },
      { pitch: 'D4', sargam: 'Re', time: 2.0, duration: 0.8, lane: 1 },
      { pitch: 'E4', sargam: 'Ga', time: 3.0, duration: 1.2, lane: 2 },
      { pitch: 'G4', sargam: 'Pa', time: 4.5, duration: 0.8, lane: 3 },
      { pitch: 'A4', sargam: 'Dha', time: 5.5, duration: 0.8, lane: 2 },
      { pitch: 'C5', sargam: 'Tar Sa', time: 6.5, duration: 1.5, lane: 3 },
      { pitch: 'A4', sargam: 'Dha', time: 8.5, duration: 0.8, lane: 2 },
      { pitch: 'G4', sargam: 'Pa', time: 9.5, duration: 0.8, lane: 3 },
      { pitch: 'E4', sargam: 'Ga', time: 10.5, duration: 1.0, lane: 1 },
      { pitch: 'D4', sargam: 'Re', time: 12.0, duration: 0.8, lane: 0 },
      { pitch: 'C4', sargam: 'Sa', time: 13.0, duration: 2.0, lane: 0 }
    ]
  },
  {
    id: 'ode-to-joy-fusion',
    title: 'Ode to Joy (Heritage Timbre)',
    ragaOrOrigin: 'Beethoven in Bilawal Scale',
    description: 'Universal melody played in ancient Indian classical timbre.',
    era: 'Universal Classic',
    bpm: 120,
    duration: 30,
    difficulty: 'Intermediate',
    notes: [
      { pitch: 'E4', sargam: 'Ga', time: 1.0, duration: 0.5, lane: 2 },
      { pitch: 'E4', sargam: 'Ga', time: 1.6, duration: 0.5, lane: 2 },
      { pitch: 'F4', sargam: 'Ma', time: 2.2, duration: 0.5, lane: 3 },
      { pitch: 'G4', sargam: 'Pa', time: 2.8, duration: 0.5, lane: 3 },
      { pitch: 'G4', sargam: 'Pa', time: 3.4, duration: 0.5, lane: 3 },
      { pitch: 'F4', sargam: 'Ma', time: 4.0, duration: 0.5, lane: 2 },
      { pitch: 'E4', sargam: 'Ga', time: 4.6, duration: 0.5, lane: 1 },
      { pitch: 'D4', sargam: 'Re', time: 5.2, duration: 0.5, lane: 0 },
      { pitch: 'C4', sargam: 'Sa', time: 5.8, duration: 0.5, lane: 0 },
      { pitch: 'C4', sargam: 'Sa', time: 6.4, duration: 0.5, lane: 0 },
      { pitch: 'D4', sargam: 'Re', time: 7.0, duration: 0.5, lane: 1 },
      { pitch: 'E4', sargam: 'Ga', time: 7.6, duration: 0.8, lane: 2 },
      { pitch: 'E4', sargam: 'Ga', time: 8.6, duration: 0.6, lane: 1 },
      { pitch: 'D4', sargam: 'Re', time: 9.4, duration: 1.2, lane: 0 }
    ]
  }
];
