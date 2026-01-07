import React, { useState, useEffect, useCallback } from 'react';
import { Question, QuizConfig, TestResult, UserProfile } from '../types';
import { generateQuestions } from '../services/geminiService';
import { Timer, CheckCircle, XCircle, AlertCircle, ArrowRight, Flag, FileText, Lightbulb, Coins } from 'lucide-react';

interface QuizInterfaceProps {
  config: QuizConfig;
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onComplete: (result: TestResult) => void;
  onExit: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ config, user, onUpdateUser, onComplete, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // qIndex -> optionIndex
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [unlockedHints, setUnlockedHints] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch Questions
  useEffect(() => {
    const fetchQ = async () => {
      setLoading(true);
      // Pass the Exam Title as context if available (e.g. "March 2024 Paper")
      const data = await generateQuestions(config.subject, config.topic, config.questionCount, config.title);
      setQuestions(data);
      setLoading(false);
    };
    fetchQ();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer Logic
  useEffect(() => {
    if (!config.timeLimit || isSubmitted || loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.timeLimit, isSubmitted, loading]);

  const handleOptionSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentQuestionIdx]: optionIdx }));
  };

  const toggleReview = () => {
    if (isSubmitted) return;
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionIdx)) newSet.delete(currentQuestionIdx);
      else newSet.add(currentQuestionIdx);
      return newSet;
    });
  };

  const handleUnlockHint = () => {
    if (unlockedHints.has(currentQuestionIdx)) return;
    
    if (user.coins >= 10) {
       onUpdateUser({ coins: user.coins - 10 });
       setUnlockedHints(prev => new Set(prev).add(currentQuestionIdx));
    } else {
       alert("Not enough coins! You need 10 coins to unlock a hint.");
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    // We don't call onComplete immediately to allow review of answers in the UI
  };

  const handleFinishAnalysis = () => {
      let score = 0;
      let correctCount = 0;
      // Calculate breakdown
      const breakdown: Record<string, {correct: number, total: number}> = {};

      questions.forEach((q, idx) => {
        if (!breakdown[q.topic]) breakdown[q.topic] = { correct: 0, total: 0 };
        breakdown[q.topic].total += 1;

        if (answers[idx] === q.correctAnswerIndex) {
          score += 1; // Base 1 mark per question
          correctCount++;
          breakdown[q.topic].correct += 1;
        }
      });

      // Convert breakdown to array
      const topicBreakdown = Object.entries(breakdown).map(([k, v]) => ({
          topic: k,
          correct: v.correct,
          total: v.total
      }));

      const result: TestResult = {
        date: new Date().toISOString(),
        subject: config.subject,
        score: score,
        totalQuestions: questions.length,
        accuracy: (correctCount / questions.length) * 100,
        timeTaken: (config.timeLimit || 0) - timeLeft,
        topicBreakdown: topicBreakdown
      };
      
      onComplete(result);
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600 font-medium animate-pulse">
            {config.title ? `Generating "${config.title}"...` : "Preparing your exam paper..."}
        </p>
        <p className="text-xs text-gray-400">Fetching real-time patterns via Gemini</p>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx];

  if (!currentQ) return <div>Error loading quiz</div>;

  return (
    <div className="flex flex-col h-full bg-gray-50 max-w-4xl mx-auto rounded-xl shadow-sm overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-white p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800 line-clamp-1">{config.title || config.subject}</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {config.mode === 'EXAM' ? 'Full Exam Mode' : 'Practice Mode'}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                <Coins size={12} /> {user.coins}
            </span>
          </div>
        </div>
        
        {config.timeLimit && (
          <div className={`flex items-center space-x-2 font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-indigo-600'}`}>
            <Timer size={20} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Question Status Bar */}
        <div className="mb-6 flex flex-wrap gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIdx(idx)}
              className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors
                ${currentQuestionIdx === idx ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                ${isSubmitted 
                  ? (questions[idx].correctAnswerIndex === answers[idx] ? 'bg-green-100 text-green-700' : answers[idx] !== undefined ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400')
                  : (answers[idx] !== undefined ? 'bg-indigo-600 text-white' : markedForReview.has(idx) ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-white border border-gray-300 text-gray-500')
                }
              `}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Question {currentQuestionIdx + 1}</span>
            <div className="flex items-center space-x-2">
               {markedForReview.has(currentQuestionIdx) && !isSubmitted && (
                 <span className="flex items-center text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                   <Flag size={12} className="mr-1" /> Review Later
                 </span>
               )}
               <span className={`text-xs px-2 py-1 rounded-full ${currentQ.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : currentQ.difficulty === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                 {currentQ.difficulty}
               </span>
            </div>
          </div>

          <h3 className="text-xl font-medium text-gray-900 mb-6 leading-relaxed">
            {currentQ.text}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              let btnClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 flex justify-between items-center group ";
              
              if (isSubmitted) {
                if (idx === currentQ.correctAnswerIndex) {
                  btnClass += "bg-green-50 border-green-500 text-green-800";
                } else if (idx === answers[currentQuestionIdx] && idx !== currentQ.correctAnswerIndex) {
                  btnClass += "bg-red-50 border-red-500 text-red-800";
                } else {
                  btnClass += "bg-gray-50 border-gray-100 text-gray-400 opacity-60";
                }
              } else {
                if (answers[currentQuestionIdx] === idx) {
                  btnClass += "bg-indigo-50 border-indigo-600 text-indigo-900";
                } else {
                  btnClass += "bg-white border-gray-200 hover:border-indigo-200 hover:bg-gray-50 text-gray-700";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={isSubmitted}
                  className={btnClass}
                >
                  <span className="flex items-center">
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 text-sm font-medium
                      ${isSubmitted && idx === currentQ.correctAnswerIndex ? 'bg-green-500 border-green-500 text-white' : 
                        answers[currentQuestionIdx] === idx ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-400'}
                    `}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </span>
                  {isSubmitted && idx === currentQ.correctAnswerIndex && <CheckCircle size={20} className="text-green-600" />}
                  {isSubmitted && answers[currentQuestionIdx] === idx && idx !== currentQ.correctAnswerIndex && <XCircle size={20} className="text-red-600" />}
                </button>
              );
            })}
          </div>

          {/* Hint Section (Resource Utilization) */}
          {!isSubmitted && currentQ.hint && (
              <div className="mt-6">
                  {unlockedHints.has(currentQuestionIdx) ? (
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex items-start gap-2 text-yellow-800 text-sm animate-fade-in-up">
                          <Lightbulb size={18} className="shrink-0 mt-0.5" />
                          <div>
                              <span className="font-bold block text-xs uppercase opacity-70 mb-1">Hint</span>
                              {currentQ.hint}
                          </div>
                      </div>
                  ) : (
                      <button 
                        onClick={handleUnlockHint}
                        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-yellow-600 bg-gray-50 hover:bg-yellow-50 px-3 py-2 rounded-full border border-gray-200 hover:border-yellow-200 transition-all"
                      >
                          <Lightbulb size={14} />
                          <span>Unlock Hint</span>
                          <span className="bg-black/10 px-1.5 rounded text-[10px] flex items-center gap-1">
                              -10 <Coins size={8} />
                          </span>
                      </button>
                  )}
              </div>
          )}

          {/* Explanation View */}
          {isSubmitted && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2 text-blue-800 font-semibold">
                <AlertCircle size={18} />
                <span>Explanation</span>
              </div>
              <p className="text-blue-900 text-sm leading-relaxed">
                {currentQ.explanation}
              </p>
              <div className="mt-2 text-xs text-blue-500 font-mono">
                  Topic: {currentQ.topic}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-white p-4 border-t flex justify-between items-center">
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
            disabled={currentQuestionIdx === 0}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          {!isSubmitted && (
            <button
              onClick={toggleReview}
              className={`px-4 py-2 font-medium rounded-lg border transition-colors ${markedForReview.has(currentQuestionIdx) ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {markedForReview.has(currentQuestionIdx) ? 'Unmark Review' : 'Mark for Review'}
            </button>
          )}
        </div>

        <div className="flex space-x-3">
          {currentQuestionIdx < questions.length - 1 ? (
             <button
             onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
             className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center"
           >
             Next <ArrowRight size={16} className="ml-2" />
           </button>
          ) : (
            !isSubmitted ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-sm"
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={handleFinishAnalysis}
                className="px-6 py-2 bg-indigo-800 text-white font-bold rounded-lg hover:bg-indigo-900"
              >
                View Full Analysis
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;