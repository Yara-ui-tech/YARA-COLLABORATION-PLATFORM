import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_KIDS_VIDEOS, DEFAULT_KIDS_SONGS, 
  DEFAULT_KIDS_FLASHCARDS, DEFAULT_KIDS_CHALLENGES,
  KidsVideo, KidsSong, KidsFlashcard, KidsChallenge,
  getKidsContentByType
} from '../services/yaraKidsService';
import { 
  Sparkles, Play, Pause, Music, Video, BookOpen, Trophy, 
  Star, Volume2, RotateCcw, CheckCircle2, Award, Heart, HelpCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function YaraKids() {
  const [activeTab, setActiveTab] = useState<'videos' | 'songs' | 'flashcards' | 'challenges'>('videos');
  
  // Star Rewards state for kids
  const [stars, setStars] = useState(25);

  // Dynamic Content arrays initialized with defaults
  const [videos, setVideos] = useState<KidsVideo[]>(DEFAULT_KIDS_VIDEOS);
  const [songs, setSongs] = useState<KidsSong[]>(DEFAULT_KIDS_SONGS);
  const [flashcards, setFlashcards] = useState<KidsFlashcard[]>(DEFAULT_KIDS_FLASHCARDS);
  const [challenges, setChallenges] = useState<KidsChallenge[]>(DEFAULT_KIDS_CHALLENGES);

  useEffect(() => {
    async function loadData() {
      const [v, s, f, c] = await Promise.all([
        getKidsContentByType('video'),
        getKidsContentByType('song'),
        getKidsContentByType('flashcard'),
        getKidsContentByType('challenge')
      ]);
      if (v?.length) setVideos(v);
      if (s?.length) setSongs(s);
      if (f?.length) setFlashcards(f);
      if (c?.length) setChallenges(c);
    }
    loadData();
  }, []);

  // Video modal state
  const [activeVideo, setActiveVideo] = useState<KidsVideo | null>(null);

  // Song Player state
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Challenge State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [solvedChallenges, setSolvedChallenges] = useState<Record<string, boolean>>({});

  // Flashcard Flip State
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  const togglePlaySong = (song: KidsSong) => {
    if (playingSongId === song.id) {
      audioRef.current?.pause();
      setPlayingSongId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = song.audio_url;
        audioRef.current.play();
      }
      setPlayingSongId(song.id);
    }
  };

  const handleSelectOption = (chalId: string, optionIdx: number, correctIdx: number, starsReward: number) => {
    if (solvedChallenges[chalId]) return;
    
    setSelectedAnswers(prev => ({ ...prev, [chalId]: optionIdx }));
    
    if (optionIdx === correctIdx) {
      setSolvedChallenges(prev => ({ ...prev, [chalId]: true }));
      setStars(prev => prev + starsReward);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} onEnded={() => setPlayingSongId(null)} />

      {/* Playful Header Banner */}
      <div className="relative rounded-[3rem] bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600 p-8 md:p-12 text-white overflow-hidden shadow-2xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white font-black text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
              <span>YARA Junior Explorers (Ages 3–8)</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md">
              Welcome to YARA Kids STEM Portal! 🚀
            </h1>
            <p className="text-white/90 text-sm md:text-base font-semibold max-w-xl">
              Watch fun animated videos, sing along to STEM rhymes, flip picture cards, and earn shiny stars by solving mini hero challenges!
            </p>
          </div>

          {/* Stars Counter Pill */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 text-slate-900 shadow-xl flex items-center space-x-4 border-4 border-amber-300 shrink-0 transform hover:scale-105 transition-all">
            <div className="w-14 h-14 bg-amber-400 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Star className="w-8 h-8 fill-current text-amber-100 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Your Star Collection</p>
              <p className="text-3xl font-black text-amber-500">{stars} Stars ⭐</p>
            </div>
          </div>
        </div>
      </div>

      {/* Colorful Category Navigation Pills */}
      <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center space-x-2.5 transition-all shadow-md ${activeTab === 'videos' ? 'bg-indigo-600 text-white scale-105 shadow-indigo-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <Video className="w-5 h-5 text-amber-400" />
          <span>Animated Videos (3)</span>
        </button>

        <button
          onClick={() => setActiveTab('songs')}
          className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center space-x-2.5 transition-all shadow-md ${activeTab === 'songs' ? 'bg-pink-600 text-white scale-105 shadow-pink-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <Music className="w-5 h-5 text-pink-300" />
          <span>Songs &amp; Rhymes (3)</span>
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center space-x-2.5 transition-all shadow-md ${activeTab === 'flashcards' ? 'bg-emerald-600 text-white scale-105 shadow-emerald-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <BookOpen className="w-5 h-5 text-emerald-300" />
          <span>Picture Cards (4)</span>
        </button>

        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center space-x-2.5 transition-all shadow-md ${activeTab === 'challenges' ? 'bg-amber-500 text-white scale-105 shadow-amber-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <Trophy className="w-5 h-5 text-amber-200" />
          <span>Kids Challenges (2)</span>
        </button>
      </div>

      {/* TAB 1: ANIMATED VIDEOS */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border-2 border-slate-100 hover:shadow-2xl transition-all group flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-900">
                <img
                  src={vid.thumbnail_url}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-all flex items-center justify-center">
                  <button
                    onClick={() => setActiveVideo(vid)}
                    className="w-16 h-16 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-all"
                  >
                    <Play className="w-8 h-8 fill-current ml-1 text-slate-900" />
                  </button>
                </div>
                <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                  {vid.age_group}
                </span>
              </div>

              <div className="p-6 space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">{vid.category}</span>
                <h3 className="text-lg font-black text-slate-900 leading-snug">{vid.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{vid.description}</p>
                <button
                  onClick={() => setActiveVideo(vid)}
                  className="w-full mt-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-black py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Video</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: AUDIO SONGS & RHYMES */}
      {activeTab === 'songs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {songs.map((song) => {
            const isPlaying = playingSongId === song.id;
            return (
              <div
                key={song.id}
                className={`p-6 rounded-[2.5rem] bg-white border-4 transition-all shadow-md flex flex-col justify-between ${isPlaying ? 'border-pink-500 shadow-pink-100 scale-102' : 'border-slate-100 hover:border-pink-200'}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center font-bold">
                      <Music className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                      ⏱️ {song.duration}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-pink-600 tracking-widest">{song.category}</span>
                    <h3 className="text-xl font-black text-slate-900">{song.title}</h3>
                  </div>

                  {song.lyrics && (
                    <div className="p-4 bg-pink-50/60 rounded-2xl border border-pink-100 text-slate-700 text-xs italic font-medium leading-relaxed">
                      "{song.lyrics}"
                    </div>
                  )}
                </div>

                <button
                  onClick={() => togglePlaySong(song)}
                  className={`w-full mt-6 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${isPlaying ? 'bg-pink-600 text-white animate-pulse' : 'bg-slate-900 text-white hover:bg-pink-600'}`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'Playing Song...' : 'Play STEM Rhyme'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: PICTURE FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashcards.map((card) => {
            const isFlipped = flippedCardId === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setFlippedCardId(isFlipped ? null : card.id)}
                className="cursor-pointer bg-white rounded-[2.5rem] p-6 border-4 border-emerald-100 hover:border-emerald-400 transition-all shadow-lg hover:shadow-xl flex flex-col justify-between min-h-[340px] text-center relative group"
              >
                {!isFlipped ? (
                  <div className="space-y-4 flex flex-col items-center justify-center flex-1">
                    <img
                      src={card.image_url}
                      alt={card.word}
                      className="w-32 h-32 rounded-3xl object-cover shadow-md group-hover:scale-105 transition-all"
                    />
                    <h3 className="text-2xl font-black text-slate-900">{card.word}</h3>
                    <p className="text-slate-500 text-xs font-semibold">{card.definition}</p>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                      Tap card to see Fun Fact! 💡
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4 flex flex-col items-center justify-center flex-1 bg-emerald-50/50 p-4 rounded-3xl">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-black text-emerald-900">Did You Know?</h4>
                    <p className="text-slate-700 text-xs font-medium leading-relaxed">{card.fun_fact}</p>
                    <span className="text-[10px] font-bold text-slate-400">Tap to flip back</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: KIDS CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {challenges.map((chal) => {
            const isSolved = solvedChallenges[chal.id];
            const selectedOpt = selectedAnswers[chal.id];

            return (
              <div
                key={chal.id}
                className={`bg-white rounded-[2.5rem] p-8 border-4 transition-all shadow-xl space-y-6 ${isSolved ? 'border-emerald-400 bg-emerald-50/30' : 'border-amber-200'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider">
                    Hero Challenge • +{chal.reward_stars} Stars ⭐
                  </span>
                  {isSolved && (
                    <span className="px-3.5 py-1 bg-emerald-500 text-white rounded-full text-xs font-black flex items-center gap-1.5 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> Solved!
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">{chal.title}</h3>
                  <p className="text-slate-600 text-sm font-semibold">{chal.question}</p>
                </div>

                {/* Options list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {chal.options.map((opt, idx) => {
                    const isSelected = selectedOpt === idx;
                    const isCorrect = idx === chal.correct_option;

                    let btnStyle = "bg-slate-50 border-2 border-slate-200 text-slate-800 hover:border-amber-400";
                    if (isSelected) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-500 border-emerald-500 text-white font-black shadow-lg";
                      } else {
                        btnStyle = "bg-red-500 border-red-500 text-white font-black";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(chal.id, idx, chal.correct_option, chal.reward_stars)}
                        disabled={isSolved}
                        className={`p-4 rounded-2xl text-xs font-bold transition-all ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIDEO PLAYBACK MODAL */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-slate-800"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-video w-full">
                <iframe
                  src={activeVideo.video_url}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-6 bg-slate-900 text-white space-y-2">
                <h3 className="text-xl font-bold text-white">{activeVideo.title}</h3>
                <p className="text-slate-400 text-xs">{activeVideo.description}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
