import React, { useState } from 'react';
import { 
  Building2, School, Users, Cpu, MapPin, ChevronRight, 
  ArrowLeft, Landmark, BookOpen, Layers, CheckCircle2, UserPlus, 
  Globe, Shield, Sparkles, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ZIMBABWE_PROVINCES, ProvinceHierarchy, DistrictHierarchy } from '../../constants/zimbabweHierarchy';
import { Chapter } from '../../types/chapters';
import { cn } from '../../lib/utils';

interface Props {
  chapters: Chapter[];
  onRequestJoin: (chapterId?: string, institutionName?: string, provinceName?: string) => void;
  onViewChapterDetails: (chapter: Chapter) => void;
}

export default function ZimbabweChapterHierarchy({ chapters, onRequestJoin, onViewChapterDetails }: Props) {
  const [selectedProvince, setSelectedProvince] = useState<ProvinceHierarchy | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictHierarchy | null>(null);

  // Match live chapter record for a given institution name or code
  const findMatchingChapter = (name: string, code?: string) => {
    return chapters.find(c => 
      (code && c.code === code) ||
      c.name.toLowerCase().includes(name.toLowerCase()) ||
      c.institution_or_community.toLowerCase().includes(name.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      {/* Zimbabwe National Country Banner with Official Flag 🇿🇼 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 p-6 sm:p-8 text-white border border-emerald-500/30 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Zimbabwe Flag Icon / Emblem */}
            <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shadow-lg border-2 border-amber-400 shrink-0 relative bg-black flex items-center justify-center">
              <svg viewBox="0 0 600 300" className="w-full h-full object-cover">
                {/* 7 Horizontal Stripes: Green, Yellow, Red, Black, Red, Yellow, Green */}
                <rect y="0" width="600" height="42.85" fill="#006400" />
                <rect y="42.85" width="600" height="42.85" fill="#FFD700" />
                <rect y="85.7" width="600" height="42.85" fill="#D40000" />
                <rect y="128.55" width="600" height="42.85" fill="#000000" />
                <rect y="171.4" width="600" height="42.85" fill="#D40000" />
                <rect y="214.25" width="600" height="42.85" fill="#FFD700" />
                <rect y="257.1" width="600" height="42.85" fill="#006400" />
                {/* White Chevron */}
                <polygon points="0,0 212,150 0,300" fill="#FFFFFF" stroke="#000000" strokeWidth="6" />
                {/* Red Star */}
                <polygon points="70,110 80,140 110,140 85,160 95,190 70,170 45,190 55,160 30,140 60,140" fill="#D40000" />
                {/* Great Zimbabwe Bird Silhouette */}
                <circle cx="70" cy="148" r="14" fill="#FFD700" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  Republic of Zimbabwe • Pan-African Anchor
                </span>
                <span className="text-xs text-slate-300">10 Provinces • 59 Districts</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                YARA Zimbabwe Chapter Network
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                Hierarchical decentralization: From provincial university lead institutions down to districts, polytechnics, high schools, primary STEM clubs, and rural innovation hubs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onRequestJoin()}
              className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 flex items-center gap-2 transition shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Apply to Join a Chapter</span>
            </button>
          </div>
        </div>

        {/* Breadcrumb Hierarchy Trail */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 flex-wrap text-xs font-bold text-slate-300">
          <button 
            onClick={() => { setSelectedProvince(null); setSelectedDistrict(null); }}
            className={cn("flex items-center gap-1 hover:text-amber-400 transition", !selectedProvince && "text-amber-400")}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Zimbabwe (All Provinces)</span>
          </button>

          {selectedProvince && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-500" />
              <button
                onClick={() => setSelectedDistrict(null)}
                className={cn("hover:text-amber-400 transition", !selectedDistrict && "text-amber-400")}
              >
                {selectedProvince.name}
              </button>
            </>
          )}

          {selectedDistrict && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-500" />
              <span className="text-amber-400">{selectedDistrict.name}</span>
            </>
          )}
        </div>
      </div>

      {/* VIEW LEVEL 1: ALL 10 PROVINCES */}
      {!selectedProvince && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-lg">Select a Province in Zimbabwe</h3>
              <p className="text-xs text-slate-500">Each province is coordinated by an accredited Provincial Lead University.</p>
            </div>
            <span className="text-xs font-bold text-slate-500">10 Administrative Provinces</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ZIMBABWE_PROVINCES.map(prov => {
              const liveProvChapters = chapters.filter(c => c.province.toLowerCase() === prov.name.toLowerCase());
              const totalMembers = liveProvChapters.reduce((sum, c) => sum + (c.total_members_count || 0), 0);

              return (
                <div
                  key={prov.id}
                  onClick={() => setSelectedProvince(prov)}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-black">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {prov.districts.length} Districts
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition">
                        {prov.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Provincial Capital: <strong>{prov.capital}</strong>
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <Landmark className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{prov.leadUniversity}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Assigned Provincial Lead University ({prov.leadChapterCode})
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">
                      {liveProvChapters.length} Live Chapters • {totalMembers}+ Innovators
                    </span>
                    <span className="text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW LEVEL 2: DISTRICTS WITHIN SELECTED PROVINCE */}
      {selectedProvince && !selectedDistrict && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <button 
                onClick={() => setSelectedProvince(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All 10 Provinces</span>
              </button>
              <h3 className="font-black text-slate-900 text-lg">
                Districts in {selectedProvince.name} Province
              </h3>
              <p className="text-xs text-slate-500">
                Provincial Lead: <strong>{selectedProvince.leadUniversity}</strong> ({selectedProvince.leadChapterCode})
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">{selectedProvince.districts.length} Districts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {selectedProvince.districts.map(dist => (
              <div
                key={dist.id}
                onClick={() => setSelectedDistrict(dist)}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black">
                      <Compass className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700">
                      {dist.institutions.length} Institutions & Hubs
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition">
                      {dist.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Contains schools, tertiary colleges, polytechnics, and youth technology hubs.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">View Chapters in District</span>
                  <span className="text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Enter</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW LEVEL 3: INSTITUTIONS & COMMUNITIES IN SELECTED DISTRICT */}
      {selectedProvince && selectedDistrict && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <button 
                onClick={() => setSelectedDistrict(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Districts in {selectedProvince.name}</span>
              </button>
              <h3 className="font-black text-slate-900 text-lg">
                Institutions & Community Chapters: {selectedDistrict.name}
              </h3>
              <p className="text-xs text-slate-500">
                Province: {selectedProvince.name} • Provincial Lead: {selectedProvince.leadUniversity}
              </p>
            </div>

            <button
              onClick={() => onRequestJoin(undefined, undefined, selectedProvince.name)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Apply for a Chapter in this District</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDistrict.institutions.map((inst, idx) => {
              const matchedChapter = findMatchingChapter(inst.name, inst.chapterCode);
              const typeIcon = 
                inst.type === 'university' ? <Landmark className="w-4 h-4 text-amber-600" /> :
                inst.type === 'polytechnic' ? <Cpu className="w-4 h-4 text-purple-600" /> :
                inst.type === 'high_school' ? <School className="w-4 h-4 text-blue-600" /> :
                inst.type === 'primary_school' ? <BookOpen className="w-4 h-4 text-emerald-600" /> :
                <Users className="w-4 h-4 text-indigo-600" />;

              const typeBadgeColor =
                inst.type === 'university' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                inst.type === 'polytechnic' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                inst.type === 'high_school' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                inst.type === 'primary_school' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                'bg-indigo-50 text-indigo-800 border-indigo-200';

              return (
                <div 
                  key={idx}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          {typeIcon}
                        </div>
                        <div>
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border", typeBadgeColor)}>
                            {inst.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      {inst.chapterCode && (
                        <span className="font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                          {inst.chapterCode}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-black text-slate-900 text-base">{inst.name}</h4>
                      <p className="text-xs text-indigo-600 font-bold mt-0.5">{inst.chapterName}</p>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{selectedDistrict.name}, {selectedProvince.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-emerald-500" />
                        <span>Status: Chartered & Open for Membership</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {matchedChapter ? (
                      <button
                        onClick={() => onViewChapterDetails(matchedChapter)}
                        className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
                      >
                        View Full Chapter Profile
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Chapter Profile Active</span>
                    )}

                    <button
                      onClick={() => onRequestJoin(matchedChapter?.id, inst.name, selectedProvince.name)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Request to Join</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
