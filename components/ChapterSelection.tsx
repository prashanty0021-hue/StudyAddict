import React from 'react';
import { Subject } from '../types';
import { MOCK_TOPICS } from '../constants';
import { ArrowLeft, BookOpen, ChevronRight, PlayCircle } from 'lucide-react';

interface ChapterSelectionProps {
  subject: Subject;
  onSelectTopic: (topic: string) => void;
  onBack: () => void;
}

const ChapterSelection: React.FC<ChapterSelectionProps> = ({ subject, onSelectTopic, onBack }) => {
  const topics = MOCK_TOPICS[subject] || [];

  return (
    <div className="flex flex-col h-full bg-gray-50 max-w-4xl mx-auto rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="bg-indigo-700 p-6 text-white flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold">{subject}</h2>
          <p className="text-indigo-200 text-sm">Select a chapter to start practicing</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-3">
           <button 
             onClick={() => onSelectTopic('')}
             className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-between group"
           >
             <div className="flex items-center gap-3">
               <div className="bg-white/20 p-2 rounded-lg">
                 <PlayCircle size={24} />
               </div>
               <div className="text-left">
                 <h3 className="font-bold text-lg">Full Syllabus Mock Test</h3>
                 <p className="text-xs text-indigo-100 opacity-90">Mix of questions from all chapters</p>
               </div>
             </div>
             <ChevronRight className="transform group-hover:translate-x-1 transition-transform" />
           </button>

           <div className="my-4 border-t border-gray-200 relative">
              <span className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 bg-gray-50 px-2 text-xs text-gray-400 font-medium">OR SELECT CHAPTER</span>
           </div>

           {topics.map((topic, idx) => (
             <button
               key={idx}
               onClick={() => onSelectTopic(topic)}
               className="bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all flex items-center justify-between group"
             >
               <div className="flex items-center gap-3">
                 <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                   <BookOpen size={20} />
                 </div>
                 <div className="text-left">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Chapter {idx + 1}</span>
                    <h3 className="font-medium text-gray-800">{topic}</h3>
                 </div>
               </div>
               <ChevronRight className="text-gray-300 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-transform" />
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};

export default ChapterSelection;