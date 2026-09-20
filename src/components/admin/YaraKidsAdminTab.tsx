import React, { useState, useEffect } from 'react';
import { 
  getKidsContentByType, addKidsContentItem, deleteKidsContentItem,
  KidsVideo, KidsSong, KidsFlashcard, KidsChallenge 
} from '../../services/yaraKidsService';
import { 
  Sparkles, Plus, Trash2, Video, Music, BookOpen, Trophy, 
  Play, Volume2, Link as LinkIcon, Save, Loader2, Star, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function YaraKidsAdminTab() {
  const [activeTab, setActiveTab] = useState<'videos' | 'songs' | 'flashcards' | 'challenges'>('videos');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Content Arrays
  const [videos, setVideos] = useState<KidsVideo[]>([]);
  const [songs, setSongs] = useState<KidsSong[]>([]);
  const [flashcards, setFlashcards] = useState<KidsFlashcard[]>([]);
  const [challenges, setChallenges] = useState<KidsChallenge[]>([]);

  // Form Modals state
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState('General STEM');
  const [ageGroup, setAgeGroup] = useState('3-8 Years');
  const [lyrics, setLyrics] = useState('');
  const [duration, setDuration] = useState('2:30');
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [funFact, setFunFact] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Fun' | 'Super Hero'>('Fun');
  const [rewardStars, setRewardStars] = useState(10);
  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [correctOption, setCorrectOption] = useState(0);

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const [v, s, f, c] = await Promise.all([
        getKidsContentByType('video'),
        getKidsContentByType('song'),
        getKidsContentByType('flashcard'),
        getKidsContentByType('challenge')
      ]);
      setVideos(v);
      setSongs(s);
      setFlashcards(f);
      setChallenges(c);
    } catch (e) {
      console.error('Error loading kids admin content:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllContent();
  }, []);

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (activeTab === 'videos') {
        const item = {
          type: 'video',
          title: title.trim(),
          description: description.trim(),
          media_url: mediaUrl.trim(),
          thumbnail_url: thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
          category: category.trim(),
          age_group: ageGroup.trim()
        };
        const created = await addKidsContentItem(item);
        setVideos([created, ...videos]);
      } else if (activeTab === 'songs') {
        const item = {
          type: 'song',
          title: title.trim(),
          media_url: mediaUrl.trim(),
          lyrics: lyrics.trim(),
          duration: duration.trim(),
          category: category.trim()
        };
        const created = await addKidsContentItem(item);
        setSongs([created, ...songs]);
      } else if (activeTab === 'flashcards') {
        const item = {
          type: 'flashcard',
          title: word.trim() || title.trim(),
          word: word.trim() || title.trim(),
          definition: definition.trim(),
          thumbnail_url: thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
          fun_fact: funFact.trim(),
          category: category.trim()
        };
        const created = await addKidsContentItem(item);
        setFlashcards([created, ...flashcards]);
      } else if (activeTab === 'challenges') {
        const item = {
          type: 'challenge',
          title: title.trim(),
          description: description.trim(),
          difficulty,
          reward_stars: rewardStars,
          question: question.trim() || title.trim(),
          options: [option1.trim(), option2.trim(), option3.trim()].filter(Boolean),
          correct_option: correctOption
        };
        const created = await addKidsContentItem(item);
        setChallenges([created, ...challenges]);
      }

      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create kids content:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, type: 'video' | 'song' | 'flashcard' | 'challenge') => {
    if (!confirm('Are you sure you want to delete this kids content item?')) return;
    await deleteKidsContentItem(id);
    if (type === 'video') setVideos(videos.filter(i => i.id !== id));
    if (type === 'song') setSongs(songs.filter(i => i.id !== id));
    if (type === 'flashcard') setFlashcards(flashcards.filter(i => i.id !== id));
    if (type === 'challenge') setChallenges(challenges.filter(i => i.id !== id));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMediaUrl('');
    setThumbnailUrl('');
    setCategory('General STEM');
    setAgeGroup('3-8 Years');
    setLyrics('');
    setDuration('2:30');
    setWord('');
    setDefinition('');
    setFunFact('');
    setDifficulty('Fun');
    setRewardStars(10);
    setQuestion('');
    setOption1('');
    setOption2('');
    setOption3('');
    setCorrectOption(0);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-600 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>YARA Kids Content Manager</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Early Childhood STEM Portal Admin</h2>
          <p className="text-white/90 text-xs md:text-sm max-w-xl">
            Upload and manage educational videos, audio song links/rhymes, flashcard vocabulary, and hero quizzes for young children (ages 3–8).
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="bg-white text-slate-900 font-bold px-6 py-3.5 rounded-2xl shadow-xl hover:bg-amber-100 transition-all flex items-center space-x-2 shrink-0 text-xs uppercase tracking-wider"
        >
          <Plus className="w-4 h-4 text-amber-600" />
          <span>Add New Content</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${activeTab === 'videos' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Video className="w-4 h-4" />
          <span>Videos ({videos.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('songs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${activeTab === 'songs' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Music className="w-4 h-4" />
          <span>Audio Songs &amp; Rhymes ({songs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${activeTab === 'flashcards' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Picture Cards ({flashcards.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${activeTab === 'challenges' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Trophy className="w-4 h-4" />
          <span>Hero Challenges ({challenges.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading YARA Kids Content...</div>
      ) : (
        <div>
          {/* VIDEOS LIST */}
          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {videos.map((vid) => (
                <div key={vid.id} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 relative group">
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 relative">
                    <img src={vid.thumbnail_url} alt={vid.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{vid.age_group}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{vid.title}</h4>
                    <p className="text-slate-500 text-xs line-clamp-2">{vid.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">{vid.category}</span>
                    <button onClick={() => handleDelete(vid.id, 'video')} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SONGS LIST */}
          {activeTab === 'songs' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {songs.map((song) => (
                <div key={song.id} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-pink-600 uppercase bg-pink-50 px-2 py-0.5 rounded">{song.category}</span>
                      <span className="text-xs text-slate-400">⏱️ {song.duration}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{song.title}</h4>
                    {song.lyrics && <p className="text-slate-600 text-xs italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">"{song.lyrics}"</p>}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <a href={song.audio_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-pink-600 flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5" /> Audio Link
                    </a>
                    <button onClick={() => handleDelete(song.id, 'song')} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FLASHCARDS LIST */}
          {activeTab === 'flashcards' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {flashcards.map((card) => (
                <div key={card.id} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 text-center flex flex-col justify-between">
                  <img src={card.image_url} alt={card.word} className="w-24 h-24 mx-auto rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{card.word}</h4>
                    <p className="text-slate-500 text-xs">{card.definition}</p>
                    {card.fun_fact && <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-xl mt-2">💡 {card.fun_fact}</p>}
                  </div>
                  <button onClick={() => handleDelete(card.id, 'flashcard')} className="text-red-500 hover:text-red-700 p-1 self-end">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* CHALLENGES LIST */}
          {activeTab === 'challenges' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((chal) => (
                <div key={chal.id} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">+{chal.reward_stars} Stars ⭐</span>
                    <button onClick={() => handleDelete(chal.id, 'challenge')} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{chal.title}</h4>
                  <p className="text-slate-600 text-xs font-semibold">{chal.question}</p>
                  <div className="space-y-1">
                    {chal.options.map((opt, i) => (
                      <div key={i} className={`p-2 rounded-xl text-xs font-medium ${i === chal.correct_option ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'bg-slate-50 text-slate-700'}`}>
                        {opt} {i === chal.correct_option && '✓ (Correct)'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD CONTENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900 capitalize">Add New {activeTab} Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateContent} className="space-y-3">
              {activeTab === 'videos' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Video Title</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How Solar Rockets Work!" className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Description</label>
                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short fun description for kids..." className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Video Embed / Stream URL</label>
                    <input type="text" required value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Thumbnail Image URL</label>
                    <input type="text" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                </>
              )}

              {activeTab === 'songs' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Song Title</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Robot Alphabet Song 🤖" className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Direct Audio File / MP3 Link</label>
                    <input type="text" required value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://cdn.example.com/song.mp3" className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Song Lyrics / Rhyme Text</label>
                    <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} placeholder="1 2 3... dance with me!" className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                </>
              )}

              {activeTab === 'flashcards' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Word / Term</label>
                    <input type="text" required value={word} onChange={(e) => setWord(e.target.value)} placeholder="e.g. Battery 🔋" className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Simple Definition</label>
                    <textarea required value={definition} onChange={(e) => setDefinition(e.target.value)} placeholder="A small container that stores electrical energy..." className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Fun Fact</label>
                    <input type="text" value={funFact} onChange={(e) => setFunFact(e.target.value)} placeholder="Batteries were invented over 200 years ago!" className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Image URL</label>
                    <input type="text" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                </>
              )}

              {activeTab === 'challenges' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Challenge Title</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. What Powers a Robot?" className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Quiz Question</label>
                    <input type="text" required value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Which item gives energy to a robot?" className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Option 1</label>
                    <input type="text" required value={option1} onChange={(e) => setOption1(e.target.value)} placeholder="An Ice Cream Cone 🍦" className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Option 2</label>
                    <input type="text" required value={option2} onChange={(e) => setOption2(e.target.value)} placeholder="A Rechargeable Battery 🔋" className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Option 3</label>
                    <input type="text" value={option3} onChange={(e) => setOption3(e.target.value)} placeholder="A Wooden Stick 🪵" className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Correct Option Index (0, 1, or 2)</label>
                    <input type="number" min={0} max={2} value={correctOption} onChange={(e) => setCorrectOption(parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border rounded-xl p-3 text-xs" />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="w-1/3 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="w-2/3 bg-indigo-600 text-white font-bold py-3 rounded-xl text-xs shadow-lg">
                  {saving ? 'Saving Item...' : 'Save to Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
