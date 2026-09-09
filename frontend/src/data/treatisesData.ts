export interface AncientTreatise {
  id: string;
  name: string;
  author: string;
  century: string;
  description: string;
  organologicalCategories: {
    sanskrit: string;
    english: string;
    description: string;
    examples: string;
  }[];
  keyQuotations: {
    sloka: string;
    translation: string;
    context: string;
  }[];
}

export const ANCIENT_TREATISES: AncientTreatise[] = [
  {
    id: 'natya-shastra',
    name: 'Natya Shastra (नाट्यशास्त्र)',
    author: 'Bharata Muni',
    century: 'c. 200 BCE – 200 CE',
    description: 'The foundational Sanskrit encyclopedic treatise on performing arts, dramaturgy, musicology, and instrument classification (Vadya Vinyasa) that laid the groundwork for Indian organology.',
    organologicalCategories: [
      {
        sanskrit: 'तत वाद्य (Tata Vadya)',
        english: 'Chordophones (Stringed Instruments)',
        description: 'Instruments producing sound by the vibration of stretched strings over a resonator, such as Chitra Vina, Vipanchi Vina, and Yazh.',
        examples: 'Yazh, Pinaka Veena, Rudra Veena, Saraswati Veena'
      },
      {
        sanskrit: 'सुषिर वाद्य (Sushira Vadya)',
        english: 'Aerophones (Wind Instruments)',
        description: 'Instruments utilizing air columns excited by breath, reed, or fipple, such as Venu (bamboo flutes) and Shankha.',
        examples: 'Algoza, Shankha, Bansuri, Shehnai'
      },
      {
        sanskrit: 'अवनद्ध वाद्य (Avanaddha Vadya)',
        english: 'Membranophones (Drums)',
        description: 'Instruments with stretched animal skins over hollow wood or clay vessels, producing tuned percussive resonances.',
        examples: 'Pakhawaj, Mridangam, Mardala, Damaru'
      },
      {
        sanskrit: 'घन वाद्य (Ghana Vadya)',
        english: 'Idiophones (Solid Resonators)',
        description: 'Instruments sounding by the resonance of solid resonant materials (metal, porcelain, bronze) without tension.',
        examples: 'Jal Tarang, Manjira, Ghatam, Kansya Tala'
      }
    ],
    keyQuotations: [
      {
        sloka: 'ततं चैवावनद्धं च घनं सुषिरमेव च। चतुर्विधं तु विज्ञेयं वाद्यं लक्षणसंयुतम्॥',
        translation: 'Musical instruments are known to be of fourfold classification: Tata (stringed), Avanaddha (percussion/covered), Ghana (solid/idiophones), and Sushira (wind).',
        context: 'Natya Shastra, Chapter 28 (Classification of Musical Instruments)'
      }
    ]
  },
  {
    id: 'sangita-ratnakara',
    name: 'Sangita Ratnakara (सङ्गीतरत्नाकर)',
    author: 'Sharngadeva',
    century: '13th Century CE (Yadava Dynasty)',
    description: 'The definitive medieval musicological text describing theoretical systems, Raga scales, microtones (22 Shrutis), and detailed acoustic descriptions of medieval veenas including Pinaki and Kinnari.',
    organologicalCategories: [
      {
        sanskrit: 'नाद-ब्रह्म (Nada Brahma)',
        english: 'Sacred Acoustic Science',
        description: 'The philosophy of sound as cosmic creation, categorizing Anahata (unstruck pure sound) and Ahata (struck acoustic sound).',
        examples: 'Acoustic physics of Jivari buzz and resonant air columns'
      }
    ],
    keyQuotations: [
      {
        sloka: 'गीतेन प्रीयते देवः सर्वज्ञः शशिशेखरः। गोपीपतिर्यदूक्तोऽयं वेणुनादविमोहितः॥',
        translation: 'Lord Shiva the moon-crested is pleased by celestial music, and Krishna the lord of Gopikas enchanted the universe through the sacred flute.',
        context: 'Sangita Ratnakara, Sloka 1.15'
      }
    ]
  },
  {
    id: 'silappadikaram',
    name: 'Silappadikaram (சிலப்பதிகாரம்)',
    author: 'Ilango Adigal',
    century: 'c. 2nd – 5th Century CE (Sangam Era)',
    description: 'The grand Tamil epic poem chronicling the courtly culture of ancient Poompuhar and Madurai, containing precise organological descriptions of ancient Yazh harps and 103 ancient Tamil Panns.',
    organologicalCategories: [
      {
        sanskrit: 'பண் முறைமை (Pan System)',
        english: 'Ancient Tamil Modal Acoustic Architecture',
        description: '7-note scales (Kural, Thuttam, Kaikkilai, Uzhai, Ili, Vilari, Tharam) corresponding to natural microtones on silk string harps.',
        examples: 'Vil Yazh (bow harp), Peri Yazh (21-string harp), Makara Yazh'
      }
    ],
    keyQuotations: [
      {
        sloka: 'ஏழும் ஏழும் உடனுறை வாழ்க்கைப் பண்ணமை நல்யாழ்...',
        translation: 'The melodious harp whose twice-seven silk strings sing the pure concordant notes of nature.',
        context: 'Silappadikaram, Kanal Vari'
      }
    ]
  }
];
