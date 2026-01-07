import React, { useState } from 'react';
import { Subject, QuizConfig } from '../types';
import { SUBJECTS_LIST } from '../constants';
import { FileText, Clock, Calendar, Sparkles, AlertCircle, Archive, ChevronDown, ChevronRight, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

interface ExamHubProps {
  onSelectExam: (config: QuizConfig) => void;
  onBack: () => void;
}

const ExamHub: React.FC<ExamHubProps> = ({ onSelectExam, onBack }) => {
  const [activeTab, setActiveTab] = useState<'RECOMMENDED' | 'ARCHIVE'>('ARCHIVE');
  const [expandedYear, setExpandedYear] = useState<string | null>('2024');

  const recommendedExams = [
    {
      title: "March 2024 Board Paper (Simulated)",
      subject: Subject.ECONOMICS,
      questions: 20,
      time: 20,
      tag: "Past Paper",
      color: "bg-amber-100 text-amber-800"
    },
    {
      title: "2026 Predicted Question Bank",
      subject: Subject.OCM,
      questions: 20,
      time: 20,
      tag: "AI Predicted",
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "Prelim 1 - College Level",
      subject: Subject.BK_ACC,
      questions: 15,
      time: 15,
      tag: "Mock Test",
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "HSC Topper's Challenge",
      subject: Subject.SP,
      questions: 25,
      time: 25,
      tag: "Hard Mode",
      color: "bg-red-100 text-red-800"
    }
  ];

  const PAST_YEARS = ['2025', '2024', '2023', '2022'];

  const handleStartPastPaper = (year: string, subject: Subject) => {
    onSelectExam({
        subject: subject,
        title: `March ${year} Board Paper - ${subject}`,
        mode: 'EXAM',
        questionCount: 40, // Keeping it substantial but manageable for AI generation
        timeLimit: 120 * 60 // 2 hours
    });
  };

  const toggleYear = (year: string) => {
      setExpandedYear(expandedYear === year ? null : year);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 max-w-5xl mx-auto rounded-xl shadow-sm overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-slate-900 p-8 text-white">
        <button onClick={onBack} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 transition-colors">
           ← Back to Dashboard
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                    <FileText className="text-indigo-400" size={32} /> Exam Hub
                </h2>
                <p className="text-slate-300 max-w-2xl">
                    Access real-time generated mock exams and past board papers. Powered by Gemini AI on the 2025-26 Maharashtra State Board syllabus.
                </p>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-slate-800 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('RECOMMENDED')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'RECOMMENDED' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Recommended
                </button>
                <button 
                    onClick={() => setActiveTab('ARCHIVE')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'ARCHIVE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Past Papers
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
         
         {activeTab === 'RECOMMENDED' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                {/* Featured Exam */}
                <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer transform transition-all hover:scale-[1.01]"
                     onClick={() => onSelectExam({
                        subject: Subject.ECONOMICS,
                        title: "Grand Mock Test 2026",
                        mode: 'EXAM',
                        questionCount: 30,
                        timeLimit: 1800 // 30 mins
                     })}
                >
                   <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform duration-700">
                       <Sparkles size={120} />
                   </div>
                   <div className="relative z-10">
                       <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">Recommended</span>
                       <h3 className="text-2xl font-bold mb-2">Grand Mock Test 2026</h3>
                       <p className="text-indigo-100 mb-6 max-w-md">A full-length comprehensive test covering the entire Economics syllabus with Board-level difficulty.</p>
                       
                       <div className="flex items-center gap-4 text-sm font-medium">
                           <span className="flex items-center gap-1"><Clock size={16} /> 30 Mins</span>
                           <span className="flex items-center gap-1"><FileText size={16} /> 30 Questions</span>
                       </div>
                   </div>
                </div>

                {/* List of Recommended Exams */}
                {recommendedExams.map((exam, idx) => (
                    <div key={idx} 
                         onClick={() => onSelectExam({
                            subject: exam.subject,
                            title: exam.title,
                            mode: 'EXAM',
                            questionCount: exam.questions,
                            timeLimit: exam.time * 60
                         })}
                         className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-48 group"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${exam.color}`}>
                                    {exam.tag}
                                </span>
                                <span className="text-gray-400 text-xs font-mono">{exam.subject}</span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
                        </div>
                        
                        <div className="flex items-center gap-4 text-gray-500 text-sm mt-4 border-t border-gray-100 pt-4">
                            <span className="flex items-center gap-1"><Clock size={14} /> {exam.time} mins</span>
                            <span className="flex items-center gap-1"><AlertCircle size={14} /> {exam.questions} Qs</span>
                        </div>
                    </div>
                ))}

                <div className="col-span-1 md:col-span-2 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                    <Calendar className="text-amber-600 shrink-0" size={20} />
                    <div>
                        <h4 className="font-bold text-amber-800 text-sm">Real-time Generation</h4>
                        <p className="text-amber-700 text-xs mt-1">
                            Every time you start a test, our AI generates a fresh set of questions based on your performance history and current syllabus weighting.
                        </p>
                    </div>
                </div>
             </div>
         )}

         {activeTab === 'ARCHIVE' && (
             <div className="space-y-4 animate-fade-in-up">
                 <div className="mb-6">
                     <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                         <Archive className="text-indigo-600" size={24} /> Board Paper Archive
                     </h3>
                     <p className="text-gray-500 text-sm">Solved papers from previous years (2022-2025)</p>
                 </div>

                 {PAST_YEARS.map((year) => (
                     <div key={year} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all">
                         <button 
                             onClick={() => toggleYear(year)}
                             className={`w-full flex items-center justify-between p-5 text-left font-bold transition-colors ${expandedYear === year ? 'bg-indigo-50 text-indigo-800' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
                         >
                             <div className="flex items-center gap-3">
                                 <GraduationCap size={20} className={expandedYear === year ? 'text-indigo-600' : 'text-gray-400'} />
                                 <span className="text-lg">March {year} Board Papers</span>
                                 {year === '2025' && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase">Latest</span>}
                             </div>
                             {expandedYear === year ? <ChevronDown size={20} /> : <ChevronRight size={20} className="text-gray-400" />}
                         </button>
                         
                         {expandedYear === year && (
                             <div className="p-5 bg-white border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                 {SUBJECTS_LIST.map((subj) => (
                                     <button
                                         key={subj.id}
                                         onClick={() => handleStartPastPaper(year, subj.id as Subject)}
                                         className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm group transition-all text-left"
                                     >
                                         <div>
                                             <div className="text-xs text-gray-400 font-bold uppercase mb-1">{year} Exam</div>
                                             <div className="font-bold text-gray-800 group-hover:text-indigo-700">{subj.name}</div>
                                             <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                 <Clock size={12} /> 2 Hours • 80 Marks
                                             </div>
                                         </div>
                                         <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center text-gray-300 group-hover:text-indigo-600 border border-transparent group-hover:border-indigo-100 transition-all">
                                             <ArrowRight size={16} />
                                         </div>
                                     </button>
                                 ))}
                             </div>
                         )}
                     </div>
                 ))}
                 
                 <div className="mt-8 text-center text-gray-400 text-xs p-4 border-t border-gray-100 border-dashed">
                    * Papers are reconstructed using AI based on historical patterns and syllabus topics.
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default ExamHub;
