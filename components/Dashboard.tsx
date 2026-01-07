import React from 'react';
import { UserProfile, Subject } from '../types';
import { SUBJECTS_LIST } from '../constants';
import { Play, TrendingUp, Target, BarChart2, BookOpen, Zap, Award, Coins, Mic, FileText } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  onNavigate: (view: string, data?: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner & Stats */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
             <h1 className="text-2xl font-bold">Welcome, {user.name} 👋</h1>
             <p className="text-indigo-100 text-sm opacity-90">Level {user.level} Scholar • {user.streak} Day Streak</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
             <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
               <Award className="text-yellow-400" size={18} />
               <span className="font-bold">{user.xp} XP</span>
             </div>
             <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
               <Coins className="text-yellow-400" size={18} />
               <span className="font-bold">{user.coins}</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
           <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
             <div className="text-2xl font-bold">{user.questionsSolved}</div>
             <div className="text-xs text-indigo-200">Questions Solved</div>
           </div>
           <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
             <div className="text-2xl font-bold">{user.completedTests}</div>
             <div className="text-xs text-indigo-200">Tests Taken</div>
           </div>
           <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
             <div className="text-2xl font-bold">{user.targetScore}%</div>
             <div className="text-xs text-indigo-200">Target Score</div>
           </div>
           <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
             <div className="text-2xl font-bold">85%</div>
             <div className="text-xs text-indigo-200">Avg Accuracy</div>
           </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button 
          onClick={() => onNavigate('QUIZ_SETUP', { subject: Subject.ECONOMICS })}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center space-y-2 group"
        >
          <div className="bg-green-100 p-3 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <Play size={24} fill="currentColor" />
          </div>
          <span className="font-semibold text-gray-700 text-sm md:text-base">Quick Practice</span>
        </button>

        <button 
          onClick={() => onNavigate('EXAM_HUB')}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center space-y-2 group"
        >
          <div className="bg-purple-100 p-3 rounded-full text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <FileText size={24} />
          </div>
          <span className="font-semibold text-gray-700 text-sm md:text-base">Exam Hub</span>
        </button>

        <button 
          onClick={() => onNavigate('BATTLE_LOBBY')}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center space-y-2 group"
        >
          <div className="bg-orange-100 p-3 rounded-full text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <Zap size={24} />
          </div>
          <span className="font-semibold text-gray-700 text-sm md:text-base">Battle Arena</span>
        </button>

        <button 
          onClick={() => onNavigate('TEACHER_EXPLAINER')}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center space-y-2 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10">AI</div>
          <div className="bg-pink-100 p-3 rounded-full text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
            <Mic size={24} />
          </div>
          <span className="font-semibold text-gray-700 text-sm md:text-base text-center">Teacher</span>
        </button>

        <button 
          onClick={() => onNavigate('ANALYTICS')}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center space-y-2 group"
        >
          <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <TrendingUp size={24} />
          </div>
          <span className="font-semibold text-gray-700 text-sm md:text-base">Analytics</span>
        </button>

        <button className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center space-y-2 group">
          <div className="bg-gray-100 p-3 rounded-full text-gray-600 group-hover:bg-gray-600 group-hover:text-white transition-colors">
            <BookOpen size={24} />
          </div>
          <span className="font-semibold text-gray-700 text-sm md:text-base">Syllabus</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="flex items-center justify-between mt-8 mb-4">
         <h2 className="text-xl font-bold text-gray-800">Study by Subject</h2>
         <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">2025-26 Syllabus</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUBJECTS_LIST.map((subj) => (
          <div key={subj.id} className="bg-white rounded-xl p-5 border border-gray-100 hover:border-indigo-500 cursor-pointer transition-all group"
               onClick={() => onNavigate('CHAPTER_SELECT', { subject: subj.id })}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BarChart2 size={20} />
              </div>
              <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Click to Open</span>
            </div>
            <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600">{subj.name}</h3>
            <p className="text-gray-500 text-sm mt-1">Updated for 2026 Board Exam</p>
          </div>
        ))}
      </div>

      {/* Gemini Insight Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white mt-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Target size={100} />
        </div>
        <div className="relative z-10">
          <h3 className="flex items-center gap-2 font-bold text-lg text-indigo-300 mb-2">
            <Zap size={18} /> AI Study Insight
          </h3>
          <p className="text-gray-300 max-w-xl">
            Based on your recent OCM tests, you're struggling with "Principles of Management". 
            We recommend taking a chapter test to boost your confidence before the mock exam.
          </p>
          <button 
            onClick={() => onNavigate('QUIZ_SETUP', { subject: Subject.OCM, topic: 'Principles of Management' })}
            className="mt-4 px-4 py-2 bg-white text-gray-900 text-sm font-bold rounded-lg hover:bg-gray-100"
          >
            Practice This Topic
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;