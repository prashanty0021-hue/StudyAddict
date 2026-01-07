import React, { useState, useRef, useEffect } from 'react';
import { Subject, LectureSlide, SavedLesson, LessonType } from '../types';
import { MOCK_TOPICS, SUBJECTS_LIST, LANGUAGES } from '../constants';
import { generateTeacherScript, generatePodcastSegments, generateTeacherAudio } from '../services/geminiService';
import { Play, Square, Loader2, Sparkles, Volume2, ArrowLeft, Globe, Bookmark, Trash2, MonitorPlay, ChevronLeft, ChevronRight, Headphones, Video, SkipForward, Pause, BarChart, DollarSign, Factory, Users, Scale, Lightbulb, AlertOctagon } from 'lucide-react';

interface TeacherExplainerProps {
  onBack: () => void;
  initialSubject?: Subject;
  initialTopic?: string;
}

const TeacherExplainer: React.FC<TeacherExplainerProps> = ({ onBack, initialSubject, initialTopic }) => {
  const [activeTab, setActiveTab] = useState<'CREATE' | 'LIBRARY'>('CREATE');
  const [lessonType, setLessonType] = useState<LessonType>('VIDEO');
  
  const [subject, setSubject] = useState<Subject | ''>(initialSubject || '');
  const [topic, setTopic] = useState<string>(initialTopic || '');
  const [language, setLanguage] = useState<string>('English');
  
  // Content State
  const [slides, setSlides] = useState<LectureSlide[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'WRITING_SCRIPT' | 'READY'>('IDLE');
  const [audioStatus, setAudioStatus] = useState<'IDLE' | 'GENERATING' | 'PLAYING'>('IDLE');
  
  // Generation Timer
  const [generationTime, setGenerationTime] = useState(0);
  const genTimerRef = useRef<any>(null);
  
  // Player State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  
  // Visualizer / Progress
  const [audioProgress, setAudioProgress] = useState(0);
  const progressInterval = useRef<any>(null);
  
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  // Load Saved Lessons
  useEffect(() => {
    const saved = localStorage.getItem('commerce_pro_lessons');
    if (saved) {
      try {
        setSavedLessons(JSON.parse(saved));
      } catch (e) { console.error("Failed to load lessons", e); }
    }
  }, []);

  // Set initial state if props change
  useEffect(() => {
    if (initialSubject) setSubject(initialSubject);
    if (initialTopic) setTopic(initialTopic);
  }, [initialSubject, initialTopic]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
          audioContextRef.current.close().catch(console.error);
      }
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (genTimerRef.current) clearInterval(genTimerRef.current);
    };
  }, []);

  // PRE-FETCHING LOGIC
  useEffect(() => {
    if (status === 'READY' && slides.length > 0) {
        const nextIndex = currentSlideIndex + 1;
        if (nextIndex < slides.length) {
            const nextSlide = slides[nextIndex];
            if (!nextSlide.audioBase64) {
                const langConfig = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];
                generateTeacherAudio(nextSlide.narration, langConfig.voice).then(audio => {
                    if (audio) {
                        setSlides(prev => {
                            const newSlides = [...prev];
                            if(newSlides[nextIndex]) {
                                newSlides[nextIndex] = { ...newSlides[nextIndex], audioBase64: audio };
                            }
                            return newSlides;
                        });
                    }
                });
            }
        }
    }
  }, [currentSlideIndex, status, slides, language]);

  const saveLesson = (currentSlides: LectureSlide[]) => {
    if (!subject || !topic) return;
    const newLesson: SavedLesson = {
      id: Date.now().toString(),
      type: lessonType,
      subject: subject as Subject,
      topic,
      language,
      dateCreated: new Date().toISOString(),
      slides: currentSlides, // Saves text content only
    };
    
    const updated = [newLesson, ...savedLessons];
    setSavedLessons(updated);
    try {
        localStorage.setItem('commerce_pro_lessons', JSON.stringify(updated));
        alert(`${lessonType === 'VIDEO' ? 'Video' : 'Podcast'} saved to Library!`);
    } catch (e) {
        alert("Storage full! Could not save lesson. Try deleting old ones.");
    }
  };

  const deleteLesson = (id: string) => {
    const updated = savedLessons.filter(l => l.id !== id);
    setSavedLessons(updated);
    localStorage.setItem('commerce_pro_lessons', JSON.stringify(updated));
  };

  const loadLesson = (lesson: SavedLesson) => {
    stopAudio();
    setLessonType(lesson.type);
    setSubject(lesson.subject);
    setTopic(lesson.topic);
    setLanguage(lesson.language);
    setSlides(lesson.slides);
    setStatus('READY');
    setCurrentSlideIndex(0);
    setActiveTab('CREATE');
  };

  const handleGenerateScript = async () => {
    if (!subject || !topic) return;
    
    stopAudio();
    setSlides([]);
    
    setStatus('WRITING_SCRIPT');
    setGenerationTime(0);
    genTimerRef.current = setInterval(() => setGenerationTime(t => t + 1), 1000);
    
    let generatedSlides: LectureSlide[] = [];
    if (lessonType === 'VIDEO') {
        generatedSlides = await generateTeacherScript(subject, topic, language);
    } else {
        generatedSlides = await generatePodcastSegments(subject, topic, language);
    }
    
    clearInterval(genTimerRef.current);
    
    if (generatedSlides.length === 0) {
      setStatus('IDLE');
      alert("Failed to generate content. Please try again.");
      return;
    }

    setSlides(generatedSlides);
    setStatus('READY');
    setCurrentSlideIndex(0);
    
    setTimeout(() => playCurrentSlideAudio(generatedSlides, 0), 500);
  };

  const playCurrentSlideAudio = async (currentSlides = slides, index = currentSlideIndex) => {
    const slide = currentSlides[index];
    if (!slide) return;

    setAudioStatus('GENERATING');
    setAudioProgress(0);

    let audioData = slide.audioBase64;

    if (!audioData) {
        const langConfig = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];
        audioData = await generateTeacherAudio(slide.narration, langConfig.voice);
        
        if (audioData) {
            setSlides(prev => {
                const newSlides = [...prev];
                if(newSlides[index]) {
                    newSlides[index] = { ...newSlides[index], audioBase64: audioData };
                }
                return newSlides;
            });
        }
    }

    if (!audioData) {
        setAudioStatus('IDLE');
        return;
    }

    playAudioData(audioData, index);
  };

  const playAudioData = async (base64: string, playingIndex: number) => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }
    const ctx = audioContextRef.current;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    try {
      stopAudio(); 

      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const int16Data = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
      }
      
      const buffer = ctx.createBuffer(1, float32Data.length, 24000);
      buffer.copyToChannel(float32Data, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setAudioStatus('IDLE');
        if (progressInterval.current) clearInterval(progressInterval.current);
        setAudioProgress(100);

        if (autoPlay && playingIndex < slides.length - 1) {
            const nextIndex = playingIndex + 1;
            setCurrentSlideIndex(nextIndex);
            playCurrentSlideAudio(slides, nextIndex);
        }
      };
      
      source.start(0);
      sourceNodeRef.current = source;
      startTimeRef.current = ctx.currentTime;
      durationRef.current = buffer.duration;
      setAudioStatus('PLAYING');

      if (progressInterval.current) clearInterval(progressInterval.current);
      progressInterval.current = setInterval(() => {
          const elapsed = ctx.currentTime - startTimeRef.current;
          const pct = Math.min((elapsed / durationRef.current) * 100, 100);
          setAudioProgress(pct);
      }, 100);

    } catch (e) {
      console.error("Audio playback error", e);
      setAudioStatus('IDLE');
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.onended = null;
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (progressInterval.current) clearInterval(progressInterval.current);
    setAudioStatus('IDLE');
  };

  const handleNextSlide = () => {
      stopAudio();
      if (currentSlideIndex < slides.length - 1) {
          const next = currentSlideIndex + 1;
          setCurrentSlideIndex(next);
          if(autoPlay) playCurrentSlideAudio(slides, next);
      }
  };

  const handlePrevSlide = () => {
      stopAudio();
      if (currentSlideIndex > 0) {
          const prev = currentSlideIndex - 1;
          setCurrentSlideIndex(prev);
          if(autoPlay) playCurrentSlideAudio(slides, prev);
      }
  };

  const togglePlayPause = () => {
      if (audioStatus === 'PLAYING') {
          stopAudio();
      } else {
          playCurrentSlideAudio();
      }
  };

  // --- Dynamic Visual Helper ---
  const getVisualIcon = (cue: string) => {
      const size = 64;
      switch(cue?.toLowerCase()) {
          case 'chart': return <BarChart size={size} className="text-blue-400" />;
          case 'money': return <DollarSign size={size} className="text-green-400" />;
          case 'factory': return <Factory size={size} className="text-amber-400" />;
          case 'people': return <Users size={size} className="text-purple-400" />;
          case 'law': return <Scale size={size} className="text-red-400" />;
          case 'idea': return <Lightbulb size={size} className="text-yellow-400" />;
          case 'warning': return <AlertOctagon size={size} className="text-orange-500" />;
          default: return <Sparkles size={size} className="text-pink-400" />;
      }
  }

  return (
    <div className="flex flex-col h-full bg-white max-w-6xl mx-auto rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                 <ArrowLeft />
             </button>
             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                 AI Teacher <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Infotainment</span>
             </h2>
         </div>
         
         {/* Mode Switcher */}
         <div className="flex bg-gray-100 rounded-lg p-1">
             <button 
               onClick={() => { setLessonType('VIDEO'); setStatus('IDLE'); stopAudio(); }}
               className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${lessonType === 'VIDEO' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
             >
               <Video size={16} /> Video
             </button>
             <button 
               onClick={() => { setLessonType('PODCAST'); setStatus('IDLE'); stopAudio(); }}
               className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${lessonType === 'PODCAST' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
             >
               <Headphones size={16} /> Podcast
             </button>
         </div>

         <button 
           onClick={() => setActiveTab(activeTab === 'CREATE' ? 'LIBRARY' : 'CREATE')}
           className="text-sm font-medium text-gray-600 hover:text-indigo-600 underline"
         >
           {activeTab === 'CREATE' ? 'View Library' : 'Create New'}
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 flex flex-col gap-6">
         
         {activeTab === 'LIBRARY' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedLessons.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                  <Bookmark size={48} className="mb-2 opacity-20" />
                  <p>Your library is empty.</p>
                </div>
              )}
              {savedLessons.map(lesson => (
                <div key={lesson.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative">
                   <div className="absolute top-4 right-4 text-gray-300 group-hover:text-red-400 cursor-pointer" onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id); }}>
                       <Trash2 size={16} />
                   </div>
                   <div className="flex items-center gap-2 mb-3">
                     <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${lesson.type === 'VIDEO' ? 'bg-pink-50 text-pink-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {lesson.type}
                     </span>
                     <span className="text-xs text-gray-400">{lesson.subject}</span>
                   </div>
                   <h3 className="font-bold text-gray-800 line-clamp-2 h-12 mb-2 leading-tight">{lesson.topic}</h3>
                   <div className="text-xs text-gray-400 mb-4">{lesson.language} • {new Date(lesson.dateCreated).toLocaleDateString()}</div>
                   <button 
                     onClick={() => loadLesson(lesson)}
                     className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg text-sm font-bold transition-colors"
                   >
                     Resume
                   </button>
                </div>
              ))}
           </div>
         )}

         {activeTab === 'CREATE' && (
           <div className="flex flex-col lg:flex-row gap-6 h-full">
              {/* Settings Panel */}
              <div className="w-full lg:w-1/4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit">
                  <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Configuration</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Language</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name} ({l.voice})</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                      <select 
                        value={subject} 
                        onChange={(e) => { setSubject(e.target.value as Subject); setTopic(''); }}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">Select Subject</option>
                        {SUBJECTS_LIST.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    {subject && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chapter</label>
                            <select 
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">Select Chapter</option>
                                {MOCK_TOPICS[subject]?.map((t, i) => (
                                    <option key={i} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button 
                      disabled={!subject || !topic || status === 'WRITING_SCRIPT'}
                      onClick={handleGenerateScript}
                      className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 mt-4
                        ${!subject || !topic ? 'bg-gray-300 cursor-not-allowed' : lessonType === 'VIDEO' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-indigo-600 hover:bg-indigo-700'}
                      `}
                    >
                      {status === 'IDLE' || status === 'READY' ? (
                          <>Generate {lessonType === 'VIDEO' ? 'Video' : 'Deep Dive'}</>
                      ) : (
                          <><Loader2 size={18} className="animate-spin" /> Generating...</>
                      )}
                    </button>
                    
                    {status === 'READY' && (
                       <button 
                         onClick={() => saveLesson(slides)}
                         className="w-full py-2 border-2 border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                       >
                         <Bookmark size={16} /> Save to Library
                       </button>
                    )}
                  </div>
              </div>

              {/* Player Stage */}
              <div className="flex-1 flex flex-col">
                  {status === 'IDLE' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200 min-h-[400px]">
                        {lessonType === 'VIDEO' ? <MonitorPlay size={64} className="mb-4 text-pink-200" /> : <Headphones size={64} className="mb-4 text-indigo-200" />}
                        <p>Select a chapter for a {lessonType === 'VIDEO' ? 'Full Infotainment Video' : 'NotebookLM Style Podcast'}</p>
                    </div>
                  )}

                  {status === 'WRITING_SCRIPT' && (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl min-h-[400px]">
                        <div className="relative">
                          <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin ${lessonType === 'VIDEO' ? 'border-pink-500' : 'border-indigo-500'}`}></div>
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-gray-800">Compiling Full Chapter...</h3>
                        <p className="text-gray-500 text-sm mt-2 font-mono">
                            Time elapsed: {generationTime}s (Est: ~45-60s)
                        </p>
                        <p className="mt-8 text-xs text-gray-400 max-w-md text-center">
                            We are generating a comprehensive {lessonType === 'VIDEO' ? 'infotainment video' : 'deep-dive podcast'} covering the entire syllabus chapter. This might take a moment to ensure quality.
                        </p>
                    </div>
                  )}

                  {status === 'READY' && slides.length > 0 && (
                    <div className="flex flex-col h-full gap-4">
                       
                       {/* ============ PODCAST PLAYER UI ============ */}
                       {lessonType === 'PODCAST' && (
                         <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-xl overflow-hidden shadow-2xl flex flex-col text-white h-[500px] border border-white/10">
                            {/* Visualizer Area */}
                            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                               <div className="absolute top-4 left-4 flex items-center gap-2">
                                  <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs font-bold uppercase tracking-widest border border-indigo-500/30">NotebookLM Style</span>
                               </div>
                               
                               <div className="relative mb-8">
                                    <div className={`absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full ${audioStatus === 'PLAYING' ? 'animate-pulse' : ''}`}></div>
                                    <div className="relative z-10 w-48 h-48 rounded-full border-4 border-white/10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                         <Headphones size={64} className={`text-white transition-transform duration-700 ${audioStatus === 'PLAYING' ? 'scale-110' : 'scale-100'}`} />
                                    </div>
                                    {/* Progress Ring */}
                                    <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                                        <circle cx="50%" cy="50%" r="94" stroke="transparent" strokeWidth="4" fill="transparent" />
                                        <circle cx="50%" cy="50%" r="94" stroke="#6366f1" strokeWidth="4" fill="transparent" 
                                            strokeDasharray="590"
                                            strokeDashoffset={590 - (590 * audioProgress) / 100}
                                            className="transition-all duration-100 ease-linear"
                                        />
                                    </svg>
                               </div>

                               <h2 className="text-3xl font-bold text-center mb-2 px-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">{topic}</h2>
                               <p className="text-indigo-300 text-sm font-medium">Deep Dive • {subject}</p>
                            </div>

                            {/* Controls Bar */}
                            <div className="bg-black/40 backdrop-blur-md p-6 flex items-center justify-center gap-8 border-t border-white/10">
                                  <button onClick={handlePrevSlide} className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform">
                                    <ChevronLeft size={32} />
                                  </button>

                                  <button 
                                    onClick={togglePlayPause}
                                    disabled={audioStatus === 'GENERATING'}
                                    className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                  >
                                     {audioStatus === 'GENERATING' ? <Loader2 size={24} className="animate-spin" /> : 
                                      audioStatus === 'PLAYING' ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                                  </button>

                                  <button onClick={handleNextSlide} className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform">
                                    <ChevronRight size={32} />
                                  </button>
                            </div>
                         </div>
                       )}

                       {/* ============ INFOTAINMENT VIDEO UI ============ */}
                       {lessonType === 'VIDEO' && (
                         <div className="bg-black rounded-xl overflow-hidden aspect-video relative shadow-2xl flex flex-col group border-4 border-gray-900">
                            
                            {/* Dynamic Visual Stage */}
                            <div className="flex-1 relative overflow-hidden bg-slate-900">
                                {/* Animated Background */}
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-gray-900 to-black animate-pulse"></div>
                                
                                {/* Content Layout */}
                                <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
                                    <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-12">
                                        
                                        {/* Left: Text Content */}
                                        <div className="flex-1 space-y-6 text-left">
                                            <h2 className="text-4xl md:text-5xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg">
                                                {slides[currentSlideIndex].title}
                                            </h2>
                                            <div className="space-y-4">
                                                {slides[currentSlideIndex].content.map((point, i) => (
                                                    <div 
                                                      key={i} 
                                                      className="bg-white/10 backdrop-blur-sm border-l-4 border-pink-500 p-4 rounded-r-xl transform transition-all duration-500 hover:bg-white/20"
                                                      style={{ 
                                                          opacity: 0, 
                                                          animation: `slideIn 0.5s ease-out forwards ${i * 0.3}s` 
                                                      }}
                                                    >
                                                        <p className="text-xl md:text-2xl font-medium text-white shadow-black drop-shadow-md">{point}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right: Dynamic Visual Cue */}
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-indigo-500 rounded-full blur-[60px] opacity-30 animate-pulse"></div>
                                                <div className="relative bg-white/5 border border-white/10 p-12 rounded-3xl backdrop-blur-md shadow-2xl transform transition-transform hover:scale-105 duration-700">
                                                     {getVisualIcon(slides[currentSlideIndex].visualCue || 'idea')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Overlay (Top Right) */}
                            <div className="absolute top-6 right-6 flex flex-col items-end gap-1 pointer-events-none">
                                <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Chapter Progress</span>
                                <div className="flex gap-1">
                                    {slides.map((_, i) => (
                                        <div key={i} className={`h-1.5 w-4 rounded-full ${i <= currentSlideIndex ? 'bg-pink-500' : 'bg-white/20'}`}></div>
                                    ))}
                                </div>
                            </div>

                            {/* Control Bar */}
                            <div className="bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-12 absolute bottom-0 left-0 right-0 flex flex-col gap-3">
                               {/* Progress Line */}
                               <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden cursor-pointer group/progress">
                                   <div 
                                      className="h-full bg-pink-500 shadow-[0_0_10px_#ec4899] relative"
                                      style={{ width: `${audioProgress}%` }}
                                   >
                                       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
                                   </div>
                               </div>

                               <div className="flex items-center justify-between mt-2">
                                 <div className="flex items-center gap-4">
                                   <button 
                                     onClick={togglePlayPause}
                                     disabled={audioStatus === 'GENERATING'}
                                     className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                   >
                                      {audioStatus === 'GENERATING' ? <Loader2 size={18} className="animate-spin" /> : 
                                       audioStatus === 'PLAYING' ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                                   </button>
                                   
                                   <div className="text-white">
                                      <div className="font-bold text-sm">{slides[currentSlideIndex].title}</div>
                                      <div className="text-xs text-white/60">{subject} • Part {currentSlideIndex + 1}</div>
                                   </div>
                                 </div>

                                 <div className="flex items-center gap-2">
                                    <button onClick={handlePrevSlide} disabled={currentSlideIndex === 0} className="p-2 text-white/70 hover:text-white disabled:opacity-30 hover:bg-white/10 rounded-full transition-colors">
                                        <SkipForward size={20} className="rotate-180" />
                                    </button>
                                    <button onClick={handleNextSlide} disabled={currentSlideIndex === slides.length - 1} className="p-2 text-white/70 hover:text-white disabled:opacity-30 hover:bg-white/10 rounded-full transition-colors">
                                        <SkipForward size={20} />
                                    </button>
                                 </div>
                               </div>
                            </div>
                         </div>
                       )}

                       {/* Transcript Box */}
                       {lessonType === 'VIDEO' && (
                           <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 overflow-y-auto max-h-[150px] shadow-inner relative">
                              <span className="absolute top-2 right-2 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded uppercase tracking-wider">
                                  Transcript
                              </span>
                              <p className="text-gray-600 font-serif leading-relaxed text-sm pt-4">
                                {slides[currentSlideIndex].narration}
                              </p>
                           </div>
                       )}
                    </div>
                  )}
              </div>
           </div>
         )}
      </div>
      <style>{`
        @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TeacherExplainer;