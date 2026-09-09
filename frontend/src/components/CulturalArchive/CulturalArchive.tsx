import React, { useState, useEffect } from 'react';
import { 
  Library, 
  Search, 
  Filter, 
  Sparkles, 
  BookOpen, 
  Music, 
  Gamepad2, 
  Volume2, 
  PlusCircle, 
  MapPin, 
  Calendar,
  Layers,
  X
} from 'lucide-react';
import { 
  HISTORICAL_INSTRUMENTS, 
  INSTRUMENT_CATEGORIES, 
  HISTORICAL_ERAS 
} from '../../data/instrumentsData';
import { Instrument } from '../../types';
import { ActiveTab } from '../Navbar';
import { soundEngine } from '../../services/soundEngine';

interface CulturalArchiveProps {
  onSelectInstrument: (inst: Instrument) => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const CulturalArchive: React.FC<CulturalArchiveProps> = ({
  onSelectInstrument,
  onNavigate,
}) => {
  const [instruments, setInstruments] = useState<Instrument[]>(HISTORICAL_INSTRUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEra, setSelectedEra] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [previewInstrument, setPreviewInstrument] = useState<Instrument | null>(null);

  // Filter instruments based on user search and filters
  const filteredInstruments = instruments.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.sanskritName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || inst.family === selectedCategory;
    const matchesEra = selectedEra === 'all' || inst.period === selectedEra;
    const matchesStatus = selectedStatus === 'all' || inst.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesEra && matchesStatus;
  });

  const handleAudition = (inst: Instrument) => {
    const notes = inst.playInterface.notes;
    if (notes && notes.length > 0) {
      notes.slice(0, 4).forEach((n, idx) => {
        setTimeout(() => {
          soundEngine.playNote(n.frequency, inst, 1.0, 0.9);
        }, idx * 220);
      });
    } else if (inst.playInterface.bols) {
      inst.playInterface.bols.slice(0, 3).forEach((b, idx) => {
        setTimeout(() => {
          soundEngine.playBol(b.name, b.pitch, b.decay, b.head);
        }, idx * 250);
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Archive Header */}
      <div className="bg-indigoHeritage-900/60 border border-saffron-500/20 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/10 text-saffron-300 text-xs font-semibold mb-2">
              <Library className="w-3.5 h-3.5" />
              <span>Digital Heritage Museum & Repository</span>
            </div>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-parchment-100">
              National Archive of Historical Indian Instruments
            </h2>
            <p className="text-xs sm:text-sm text-parchment-300 mt-1 max-w-2xl">
              Explore the four classical Natya Shastra instrument families (Tata, Sushira, Avanaddha, Ghana) 
              spanning over 3,000 years of civilizational musicology.
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-mono font-bold text-saffron-300">
              {filteredInstruments.length} / {instruments.length}
            </span>
            <span className="block text-[10px] uppercase font-bold text-parchment-400">
              Archived Instruments
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="bg-indigoHeritage-900/40 border border-white/10 rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-parchment-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, Sanskrit term, region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-indigoHeritage-950/80 text-parchment-100 placeholder-parchment-500 pl-10 pr-4 py-2 rounded-xl text-xs border border-white/10 focus:border-saffron-500 outline-none"
            />
          </div>

          {/* Family Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-indigoHeritage-950/80 text-parchment-200 px-3 py-2 rounded-xl text-xs border border-white/10 focus:border-saffron-500 outline-none cursor-pointer"
            >
              {INSTRUMENT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Historical Era Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedEra}
              onChange={(e) => setSelectedEra(e.target.value)}
              className="w-full bg-indigoHeritage-950/80 text-parchment-200 px-3 py-2 rounded-xl text-xs border border-white/10 focus:border-saffron-500 outline-none cursor-pointer"
            >
              {HISTORICAL_ERAS.map((era) => (
                <option key={era.id} value={era.id}>
                  {era.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-indigoHeritage-950/80 text-parchment-200 px-3 py-2 rounded-xl text-xs border border-white/10 focus:border-saffron-500 outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="extinct">Extinct</option>
              <option value="rare">Rare</option>
              <option value="living">Living</option>
            </select>
          </div>

        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstruments.map((inst) => (
          <div
            key={inst.id}
            className="group bg-indigoHeritage-900/60 border border-white/10 hover:border-saffron-500/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
          >
            <div>
              {/* Image & Status Badge */}
              <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                <img
                  src={inst.image}
                  alt={inst.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Status Badge */}
                <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full backdrop-blur-md ${
                  inst.status === 'extinct' ? 'bg-red-500/80 text-white shadow-sm shadow-red-500/50' :
                  inst.status === 'rare' ? 'bg-amber-500/80 text-indigoHeritage-950 font-extrabold shadow-sm' :
                  'bg-emerald-500/80 text-white shadow-sm'
                }`}>
                  {inst.status}
                </span>

                {/* Quick Audition Play Button Overlay */}
                <button
                  onClick={() => handleAudition(inst)}
                  title="Audition Sound"
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-indigoHeritage-950/90 text-saffron-300 border border-saffron-500/40 flex items-center justify-center hover:bg-saffron-500 hover:text-indigoHeritage-950 transition-all shadow-md"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Instrument Meta Details */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-parchment-400">
                  <span>{inst.categoryLabel.split('(')[0]}</span>
                  <span className="font-mono">{inst.century}</span>
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-parchment-100 group-hover:text-saffron-300 transition-colors">
                    {inst.name}
                  </h3>
                  <p className="font-serif text-xs text-saffron-300/90 italic">
                    {inst.sanskritName}
                  </p>
                </div>

                <p className="text-xs text-parchment-300 line-clamp-2 leading-relaxed">
                  {inst.shortDescription}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-parchment-400 pt-1">
                  <MapPin className="w-3 h-3 text-terracotta-400" />
                  <span>{inst.region}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-white/5 border-t border-white/5 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectInstrument(inst);
                  onNavigate('knowledge');
                }}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-parchment-200 text-xs font-semibold transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-saffron-300" />
                <span>Dossier</span>
              </button>

              <button
                onClick={() => {
                  onSelectInstrument(inst);
                  onNavigate('studio');
                }}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-saffron-500 text-indigoHeritage-950 text-xs font-bold hover:bg-saffron-400 transition-all shadow-sm"
              >
                <Music className="w-3.5 h-3.5" />
                <span>Play Live</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
