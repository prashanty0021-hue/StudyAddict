import React, { useState } from 'react';
import { Subject, TextbookChapter } from '../types';
import { MOCK_TOPICS, SUBJECTS_LIST } from '../constants';
import { generateTextbookContent } from '../services/geminiService';
import { BookOpen, ArrowLeft, ChevronRight, Loader2, List, Play, MonitorPlay } from 'lucide-react';

interface SyllabusReaderProps {
  onBack: () => void;
  onPractice: (subject: Subject, topic: string) => void;
  onWatchVideo: (subject: Subject, topic: string) => void;
}

const SyllabusReader: React.FC<SyllabusReaderProps> = ({ onBack, onPractice, onWatchVideo }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [chapterContent, setChapterContent] = useState<TextbookChapter | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setLoading(true);
    setChapterContent(null);

    if (selectedSubject) {
        // Simple Session Caching
        const cacheKey = `syllabus_cache_${selectedSubject}_${topic}`;
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
            setChapterContent(JSON.parse(cached));
            setLoading(false);
        } else {
            // Fetch fresh
            const content = await generateTextbookContent(selectedSubject, topic);
            setChapterContent(content);
            // Save to session cache
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify(content));
            } catch (e) { console.warn("Session storage full"); }
            setLoading(false);
        }
    }
  };

  const handleSubjectSelect = (subj: Subject) => {
      setSelectedSubject(subj);
      setSelectedTopic(null);
      setChapterContent(null);
  }

  return (
    <div className="flex flex-col h-full bg-amber-50/50 max-w-5xl mx-auto rounded-xl shadow-lg overflow-hidden border border-amber-100">
      
      {/* Header */}
      <div className="bg-amber-900 p-4 text-amber-50 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full">
                <ArrowLeft />
            </button>
            <h2 className="text-xl font-serif font-bold tracking-wide flex items-center gap-2">
                <BookOpen size={20} className="text-amber-200" /> Syllabus Reader
            </h2>
        </div>
        <div className="text-xs text-amber-300 font-mono hidden md:block">
            Maharashtra Board 2025-26 Edition
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar: Subject & Chapter List */}
        <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col ${selectedTopic ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Subject Selector */}
            <div className="p-4 border-b border-gray-100 bg-gray-50">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Select Subject</label>
               <div className="flex overflow-x-auto gap-2 pb-2 md:grid md:grid-cols-2 md:gap-2 md:pb-0">
                   {SUBJECTS_LIST.map(s => (
                       <button
                         key={s.id}
                         onClick={() => handleSubjectSelect(s.id as Subject)}
                         className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedSubject === s.id ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300'}`}
                       >
                           {s.name}
                       </button>
                   ))}
               </div>
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto p-2">
                {!selectedSubject ? (
                    <div className="text-center p-8 text-gray-400 text-sm">
                        Select a subject to view chapters.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {MOCK_TOPICS[selectedSubject].map((t, i) => (
                            <button
                              key={i}
                              onClick={() => handleTopicSelect(t)}
                              className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex items-center justify-between group
                                ${selectedTopic === t ? 'bg-amber-50 text-amber-900 font-medium' : 'hover:bg-gray-50 text-gray-700'}
                              `}
                            >
                                <span className="line-clamp-2">{t}</span>
                                <ChevronRight size={14} className={`text-gray-300 ${selectedTopic === t ? 'text-amber-500' : 'group-hover:text-gray-500'}`} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 bg-white overflow-y-auto relative ${!selectedTopic ? 'hidden md:block' : 'block'}`}>
            
            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center">
                    <Loader2 size={40} className="text-amber-600 animate-spin mb-4" />
                    <p className="text-amber-800 font-serif text-lg animate-pulse">Fetching textbook content...</p>
                </div>
            )}

            {/* Empty State */}
            {!selectedTopic && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 p-8">
                    <BookOpen size={64} className="mb-4 opacity-20" />
                    <p className="text-lg">Select a chapter to begin reading.</p>
                </div>
            )}

            {/* Content Display */}
            {selectedTopic && chapterContent && !loading && (
                <div className="max-w-3xl mx-auto p-8 md:p-12 pb-24">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                        <button 
                            onClick={() => setSelectedTopic(null)}
                            className="md:hidden text-amber-700 flex items-center gap-1 text-sm font-bold"
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        
                        <div className="flex gap-2">
                            {/* Watch Video Button */}
                            <button 
                                onClick={() => selectedSubject && onWatchVideo(selectedSubject, selectedTopic)}
                                className="bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-pink-700 shadow-lg transition-transform hover:scale-105"
                            >
                                <MonitorPlay size={16} fill="currentColor" /> Watch Video Class
                            </button>
                            
                            {/* Practice Button */}
                            <button 
                                onClick={() => selectedSubject && onPractice(selectedSubject, selectedTopic)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg transition-transform hover:scale-105"
                            >
                                <Play size={16} fill="currentColor" /> Practice Questions
                            </button>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2 leading-tight">
                        {chapterContent.title}
                    </h1>
                    <div className="h-1 w-20 bg-amber-500 mb-8"></div>

                    <div className="space-y-8">
                        {chapterContent.sections.map((section, idx) => (
                            <div key={idx} className="prose prose-amber max-w-none">
                                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="text-amber-500 font-serif italic">§</span> {section.heading}
                                </h3>
                                <p className="text-gray-700 leading-relaxed text-lg font-serif">
                                    {section.body}
                                </p>
                            </div>
                        ))}
                    </div>

                    {chapterContent.keyTerms.length > 0 && (
                        <div className="mt-12 p-6 bg-amber-50 rounded-xl border border-amber-100">
                            <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <List size={18} /> Key Terms
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {chapterContent.keyTerms.map((term, i) => (
                                    <span key={i} className="px-3 py-1 bg-white text-amber-800 text-sm border border-amber-200 rounded-full">
                                        {term}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusReader;