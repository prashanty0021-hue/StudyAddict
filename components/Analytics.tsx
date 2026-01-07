import React, { useEffect, useState } from 'react';
import { TestResult, AIInsight, Subject } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { generateDeepAnalytics } from '../services/geminiService';
import { Sparkles, Brain, Clock, Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface AnalyticsProps {
  results: TestResult[];
  onBack: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ results, onBack }) => {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getInsight = async () => {
      if (results.length > 0) {
        setLoading(true);
        const data = await generateDeepAnalytics(results);
        setInsight(data);
        setLoading(false);
      }
    };
    getInsight();
  }, [results]);

  // --- Data Prep for Charts ---

  // Helper for Abbreviations
  const getAbbreviation = (subjectName: string) => {
    switch (subjectName) {
      case Subject.ECONOMICS: return 'Eco';
      case Subject.OCM: return 'OCM';
      case Subject.SP: return 'SP';
      case Subject.BK_ACC: return 'BK';
      case Subject.ENGLISH: return 'Eng';
      case Subject.MARATHI: return 'Mar';
      default: return subjectName.substring(0, 3);
    }
  };

  // 1. Subject Accuracy (Bar Chart)
  const subjectPerformance = results.reduce((acc, curr) => {
    if (!acc[curr.subject]) acc[curr.subject] = { name: curr.subject, score: 0, count: 0 };
    acc[curr.subject].score += curr.accuracy;
    acc[curr.subject].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const barData = Object.values(subjectPerformance).map((item: any) => ({
    name: getAbbreviation(item.name), // Use Abbreviation
    full: item.name,
    accuracy: Math.round(item.score / item.count),
  }));

  // 2. Trend (Line Chart) - Last 10 Tests Only
  const lineData = results
    .slice(Math.max(results.length - 10, 0)) // Take last 10
    .map((r, i) => ({
      name: `T${i + 1}`,
      score: Math.round(r.accuracy)
    }));

  // 3. Topic Strength
  const radarData = barData.map(b => ({
    subject: b.name,
    A: b.accuracy,
    fullMark: 100
  }));

  if (results.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-xl">
              <div className="bg-indigo-50 p-6 rounded-full mb-4">
                  <BarChart size={48} className="text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">No Data Available</h2>
              <p className="text-gray-500 max-w-sm mt-2">Take at least one test in the Exam Hub or Quick Practice to unlock deep analytics.</p>
              <button onClick={onBack} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Go Back</button>
          </div>
      )
  }

  return (
    <div className="bg-gray-50 min-h-full rounded-xl flex flex-col">
       {/* Header */}
       <div className="bg-white p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10 shadow-sm">
         <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Brain className="text-indigo-600" /> Performance Intelligence
            </h2>
            <p className="text-gray-500 text-sm">Deep analysis of your last {results.length} tests</p>
         </div>
         <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg">Close</button>
       </div>

       <div className="flex-1 overflow-y-auto p-6 space-y-6">
           
           {/* Top Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* Projected Score */}
               <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                   <div className="relative z-10">
                       <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Projected Board Score</p>
                       <div className="text-5xl font-black tracking-tighter">
                           {insight ? `${insight.projectedBoardScore}%` : <span className="animate-pulse">--%</span>}
                       </div>
                       <p className="text-xs text-indigo-200 mt-2 opacity-80">Based on weighted accuracy & consistency</p>
                   </div>
                   <Target className="absolute bottom-[-10px] right-[-10px] text-white opacity-10" size={100} />
               </div>

               {/* Time Management */}
               <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                   <div>
                       <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Time Efficiency</p>
                       <div className={`text-2xl font-bold ${insight?.timeManagement === 'Good' ? 'text-green-600' : 'text-orange-500'}`}>
                           {insight ? insight.timeManagement : 'Calculating...'}
                       </div>
                   </div>
                   <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                       <Clock size={16} /> 
                       <span>Avg Time per Q: <b>45s</b></span> 
                   </div>
               </div>

               {/* Weakest Link */}
               <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                   <div>
                       <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Focus Area</p>
                       <div className="text-lg font-bold text-red-600 line-clamp-2">
                           {insight ? insight.weakTopics[0] || "None" : 'Analyzing...'}
                       </div>
                   </div>
                   <div className="mt-4 flex items-center gap-2 text-xs text-red-500">
                       <AlertTriangle size={16} /> 
                       <span>Needs Revision</span> 
                   </div>
               </div>
           </div>

           {/* AI Insight Text */}
           <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex gap-4 shadow-sm">
               <div className="bg-white p-3 rounded-full h-fit shadow-sm text-indigo-600">
                   <Sparkles size={24} />
               </div>
               <div className="flex-1">
                   <h3 className="font-bold text-indigo-900 mb-2">AI Study Recommendation</h3>
                   {loading ? (
                       <div className="h-4 bg-indigo-200 rounded animate-pulse w-3/4"></div>
                   ) : (
                       <p className="text-indigo-800 text-sm leading-relaxed">
                           {insight?.recommendation || "Take more tests to get personalized advice."}
                       </p>
                   )}
               </div>
           </div>

           {/* Charts Section */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart: Balance */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2"><Target size={18}/> Subject Mastery</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" width={40} tick={{fontSize: 12, fontWeight: 'bold'}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="accuracy" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fill: '#666' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Line Chart: Trend */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2"><TrendingUp size={18}/> Last 10 Tests Trend</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 10}} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
           </div>

           {/* Strong vs Weak List */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                   <h3 className="font-bold text-green-700 mb-4">Top Strong Topics</h3>
                   <ul className="space-y-2">
                       {insight?.strongTopics.slice(0, 3).map((topic, i) => (
                           <li key={i} className="flex items-center justify-between p-2 bg-green-50 rounded text-sm text-green-800 font-medium">
                               {topic} <span className="text-green-600">90%+</span>
                           </li>
                       )) || <p className="text-gray-400 text-sm">No data yet</p>}
                   </ul>
               </div>
               <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                   <h3 className="font-bold text-red-700 mb-4">Topics to Improve</h3>
                   <ul className="space-y-2">
                       {insight?.weakTopics.slice(0, 3).map((topic, i) => (
                           <li key={i} className="flex items-center justify-between p-2 bg-red-50 rounded text-sm text-red-800 font-medium">
                               {topic} <span className="text-red-600">&lt;60%</span>
                           </li>
                       )) || <p className="text-gray-400 text-sm">No data yet</p>}
                   </ul>
               </div>
           </div>

       </div>
    </div>
  );
};

export default Analytics;