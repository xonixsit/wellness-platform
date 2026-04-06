"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import HealerCard from "@/components/HealerCard";
import AISearchModal from "@/components/AISearchModal";
import type { Healer } from "@/types";

const ALL_SPECIALTIES = ["Anxiety", "Trauma", "Grief", "Burnout", "Divorce Recovery", "Depression", "Relationships", "Life Transitions", "Men's Issues", "Women's Issues"];
const ALL_MODALITIES = ["CBT", "EMDR", "Somatic Therapy", "Mindfulness", "Coaching", "IFS", "ACT", "Breathwork"];

interface HealersBrowserProps {
  initialHealers: Healer[];
}

export default function HealersBrowser({ initialHealers }: HealersBrowserProps) {
  const [search, setSearch] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return initialHealers.filter((h) => {
      const matchSearch = !search || 
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.title.toLowerCase().includes(search.toLowerCase()) ||
        h.bio.toLowerCase().includes(search.toLowerCase()) ||
        h.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase()));

      const matchSpecialties = selectedSpecialties.length === 0 ||
        selectedSpecialties.every((s) => h.specialties.includes(s));

      const matchModalities = selectedModalities.length === 0 ||
        selectedModalities.every((m) => h.modalities.includes(m));

      return matchSearch && matchSpecialties && matchModalities;
    });
  }, [initialHealers, search, selectedSpecialties, selectedModalities]);

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const clearFilters = () => { setSelectedSpecialties([]); setSelectedModalities([]); setSearch(""); };
  const hasFilters = search || selectedSpecialties.length > 0 || selectedModalities.length > 0;

  return (
    <>
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Browse Healers</h1>
            <p className="text-white/40">{initialHealers.length} verified practitioners ready to support you</p>
          </div>

          {/* Search + AI bar */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, specialty, or keyword..."
                className="w-full glass rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 border border-white/10 transition-colors text-sm"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "border-violet-500/50 text-violet-300" : ""}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Filters</span>
              {(selectedSpecialties.length + selectedModalities.length) > 0 && (
                <span className="ml-1.5 w-5 h-5 bg-violet-600 rounded-full text-xs flex items-center justify-center text-white">
                  {selectedSpecialties.length + selectedModalities.length}
                </span>
              )}
            </Button>
            <Button variant="gradient" onClick={() => setAiModalOpen(true)} className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </Button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="glass rounded-2xl p-5 mb-6 space-y-4">
              <div>
                <p className="text-xs text-white/50 font-medium mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_SPECIALTIES.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleFilter(selectedSpecialties, setSelectedSpecialties, s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selectedSpecialties.includes(s)
                          ? "bg-violet-600 border-violet-500 text-white"
                          : "bg-white/5 border-white/10 text-white/50 hover:border-violet-500/40"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/50 font-medium mb-2">Modalities</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_MODALITIES.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleFilter(selectedModalities, setSelectedModalities, m)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selectedModalities.includes(m)
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-white/5 border-white/10 text-white/50 hover:border-indigo-500/40"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active filters */}
          {hasFilters && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs text-white/40">{filtered.length} results</span>
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                <X className="w-3 h-3" /> Clear all
              </button>
            </div>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30 mb-4">No healers match your filters.</p>
              <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((healer, i) => (
                <div key={healer.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <HealerCard
                    healer={healer}
                    onAskAI={() => setAiModalOpen(true)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AISearchModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </>
  );
}
