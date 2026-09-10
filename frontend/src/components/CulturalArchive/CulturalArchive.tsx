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
  Landmark,
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
      (inst.museums && inst.museums.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()))) ||
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
    <div className="space-y-6 sm:space-y-8">
      {/* Archive Header */}
      <div className="bg-[#12141a]/90 border border-white/10 rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold mb-2">
              <Library className="w-3.5 h-3.5" />
              <span>Digital Heritage Museum &amp; Repository</span>
            </div>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-white">
              National Archive of Historical Indian Instruments
            </h2>
            <p className="text-xs sm:text-sm text-[#9da4b0] mt-1 max-w-2xl leading-relaxed">
              Explore the four classical Natya Shastra instrument families (Tata, Sushira, Avanaddha, Ghana) 
              spanning over 3,000 years of civilizational musicology.
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-2xl font-mono font-bold text-white">
              {filteredInstruments.length} / {instruments.length}
            </span>
            <span className="block text-[10px] uppercase font-bold text-[#646c7c]">
              Archived Instruments
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="bg-[#12141a]/90 border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-[#646c7c] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, Sanskrit term, region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0b0e] text-white placeholder-[#646c7c] pl-10 pr-4 py-2.5 rounded-xl text-xs border border-white/10 focus:border-white outline-none"
            />
          </div>

          {/* Family Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#0a0b0e] text-white px-3 py-2.5 rounded-xl text-xs border border-white/10 focus:border-white outline-none cursor-pointer"
            >
              {INSTRUMENT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#0a0b0e] text-white">
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
              className="w-full bg-[#0a0b0e] text-white px-3 py-2.5 rounded-xl text-xs border border-white/10 focus:border-white outline-none cursor-pointer"
            >
              {HISTORICAL_ERAS.map((era) => (
                <option key={era.id} value={era.id} className="bg-[#0a0b0e] text-white">
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
              className="w-full bg-[#0a0b0e] text-white px-3 py-2.5 rounded-xl text-xs border border-white/10 focus:border-white outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0a0b0e] text-white">All Status</option>
              <option value="extinct" className="bg-[#0a0b0e] text-white">Extinct</option>
              <option value="rare" className="bg-[#0a0b0e] text-white">Rare</option>
              <option value="living" className="bg-[#0a0b0e] text-white">Living</option>
            </select>
          </div>

        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredInstruments.map((inst) => (
          <div
            key={inst.id}
            className="group bg-[#12141a]/90 border border-white/10 hover:border-white/30 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
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
                  inst.status === 'rare' ? 'bg-amber-500/80 text-black font-extrabold shadow-sm' :
                  'bg-emerald-500/80 text-white shadow-sm'
                }`}>
                  {inst.status}
                </span>

                {/* Quick Audition Play Button Overlay */}
                <button
                  onClick={() => handleAudition(inst)}
                  title="Audition Sound"
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-[#0a0b0e]/90 text-white border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-md touch-manipulation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Instrument Meta Details */}
              <div className="p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-[#646c7c]">
                  <span>{inst.categoryLabel.split('(')[0]}</span>
                  <span className="font-mono">{inst.century}</span>
                </div>

                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-white transition-colors">
                    {inst.name}
                  </h3>
                  <p className="font-serif text-xs text-[#9da4b0] italic">
                    {inst.sanskritName}
                  </p>
                </div>

                <p className="text-xs text-[#9da4b0] line-clamp-2 leading-relaxed">
                  {inst.shortDescription}
                </p>

                {/* Present Museums */}
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400/90 font-bold uppercase tracking-wider">
                    <Landmark className="w-3.5 h-3.5 shrink-0" />
                    <span>Present in Museums</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {inst.museums && inst.museums.length > 0 ? (
                      inst.museums.map((museum, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center text-[10.5px] leading-snug px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#d6d9e0] hover:text-white hover:bg-white/10 transition-colors"
                        >
                          {museum}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-[#646c7c] italic">National Heritage Archives</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-3.5 sm:p-4 bg-white/5 border-t border-white/5 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectInstrument(inst);
                  onNavigate('knowledge');
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all touch-manipulation"
              >
                <BookOpen className="w-3.5 h-3.5 text-white" />
                <span>Dossier</span>
              </button>

              <button
                onClick={() => {
                  onSelectInstrument(inst);
                  onNavigate('studio');
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all shadow-sm touch-manipulation"
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
