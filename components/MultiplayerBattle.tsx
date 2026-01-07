import React, { useState, useEffect, useRef } from 'react';
import { Subject, Question, TestResult } from '../types';
import { generateQuestions } from '../services/geminiService';
import { Zap, Trophy, Users, Star, Gift, Crown, BrainCircuit, CheckCircle2, Lock } from 'lucide-react';
import { RANDOM_OPPONENT_NAMES } from '../constants';

interface MultiplayerBattleProps {
  subject: Subject;
  onExit: () => void;
  onComplete: (result: TestResult, earnedXp: number, earnedCoins: number) => void;
}

const MultiplayerBattle: React.FC<MultiplayerBattleProps> = ({ subject, onExit, onComplete }) => {
  const [status, setStatus] = useState<'MATCHMAKING' | 'PLAYING' | 'FINISHED'>('MATCHMAKING');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  
  const [myAnswer, setMyAnswer] = useState<number | null>(null);
  const [oppAnswer, setOppAnswer] = useState<number | null>(null); // The actual answer index
  const [oppHasAnswered, setOppHasAnswered] = useState(false); // Visual indicator only

  const [opponentName, setOpponentName] = useState("Unknown");
  const [matchmakingStep, setMatchmakingStep] = useState(0); 
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize
  useEffect(() => {
    const init = async () => {
      // Step 1: Connecting
      await new Promise(r => setTimeout(r, 1500));
      setMatchmakingStep(1); 
      
      const qsPromise = generateQuestions(subject, undefined, 5);
      
      await new Promise(r => setTimeout(r, 1500));
      const randomName = RANDOM_OPPONENT_NAMES[Math.floor(Math.random() * RANDOM_OPPONENT_NAMES.length)];
      setOpponentName(randomName);
      setMatchmakingStep(2); 
      
      const qs = await qsPromise;
      setQuestions(qs);
      
      await new Promise(r => setTimeout(r, 1000));
      setStatus('PLAYING');
    };
    init();
  }, [subject]);

  // Game Loop
  useEffect(() => {
    if (status !== 'PLAYING') return;

    // Reset for new question
    setTimeLeft(15);
    setMyAnswer(null);
    setOppAnswer(null);
    setOppHasAnswered(false);

    // Opponent Logic (Simulated AI)
    const oppResponseTime = Math.random() * 8000 + 2000; // 2s to 10s
    const oppAccuracy = 0.65; 
    const oppWillBeCorrect = Math.random() < oppAccuracy;

    const oppTimeout = setTimeout(() => {
      if (status === 'PLAYING') {
          setOppHasAnswered(true); // Show "Opponent Answered"
          const q = questions[currentQIdx];
          if (q) {
            const ans = oppWillBeCorrect ? q.correctAnswerIndex : (q.correctAnswerIndex + 1) % 4;
            setOppAnswer(ans);
          }
      }
    }, oppResponseTime);

    // Countdown
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleRoundEnd();
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(oppTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQIdx, status]);

  const handleRoundEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Calculate Scores at End of Round
    const q = questions[currentQIdx];
    
    // My Score
    if (myAnswer === q.correctAnswerIndex) {
      setMyScore(s => s + 10);
    }

    // Opponent Score
    if (oppAnswer === q.correctAnswerIndex) {
       setOppScore(s => s + 10);
    }
    
    // Wait and go next
    if (currentQIdx < questions.length - 1) {
      setTimeout(() => {
        setCurrentQIdx(prev => prev + 1);
      }, 2000); // 2 seconds to see results
    } else {
      setTimeout(() => setStatus('FINISHED'), 2000);
    }
  };

  const handleAnswer = (idx: number) => {
    if (myAnswer !== null || timeLeft === 0) return;
    setMyAnswer(idx);
    // Note: We do NOT trigger round end immediately. We wait for timer.
  };

  if (status === 'MATCHMAKING') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-indigo-900 text-white rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        
        <div className="z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="animate-spin absolute inset-0 rounded-full border-4 border-t-indigo-400 border-indigo-800 h-24 w-24"></div>
             {matchmakingStep === 0 && <Users size={48} className="absolute top-6 left-6 text-indigo-200" />}
             {matchmakingStep === 1 && <BrainCircuit size={48} className="absolute top-6 left-6 text-pink-400 animate-pulse" />}
             {matchmakingStep === 2 && <Users size={48} className="absolute top-6 left-6 text-green-400" />}
          </div>

          <h2 className="text-3xl font-bold mb-3 tracking-tight">
            {matchmakingStep === 0 && "Searching for players..."}
            {matchmakingStep === 1 && "Connecting Gemini AI..."}
            {matchmakingStep === 2 && "Match Found!"}
          </h2>
          
          <p className="text-indigo-300 font-medium">
             {matchmakingStep === 0 && "Scanning Maharashtra 12th Commerce servers"}
             {matchmakingStep === 1 && "Calibrating difficulty for 2025-26 Syllabus"}
             {matchmakingStep === 2 && `Playing against ${opponentName}`}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'FINISHED') {
     const won = myScore > oppScore;
     const xpEarned = won ? 150 : 50;
     const coinsEarned = won ? 50 : 10;
     const isDraw = myScore === oppScore;

     return (
       <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-900 to-indigo-800 text-white rounded-xl p-8 text-center relative overflow-hidden">
         {won && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent animate-pulse"></div>}

         <div className="z-10 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl max-w-sm w-full">
            {won ? (
              <div className="mb-6 relative inline-block">
                <Crown size={80} className="text-yellow-400 drop-shadow-lg" />
                <div className="absolute -top-2 -right-2 text-yellow-200 animate-bounce">
                  <Star size={30} fill="currentColor" />
                </div>
              </div>
            ) : (
              <Zap size={80} className="text-gray-400 mb-6 mx-auto" />
            )}
            
            <h2 className="text-4xl font-black mb-2 tracking-tight">
              {won ? 'VICTORY!' : isDraw ? 'DRAW' : 'DEFEAT'}
            </h2>
            <p className="text-xl text-indigo-200 mb-8 font-mono">{myScore} vs {oppScore}</p>

            <div className="flex gap-4 justify-center mb-8">
               <div className="bg-indigo-600/50 p-4 rounded-xl flex flex-col items-center min-w-[100px]">
                 <Star className="text-yellow-400 mb-2" size={24} fill="currentColor" />
                 <span className="font-bold text-xl">+{xpEarned} XP</span>
               </div>
               <div className="bg-indigo-600/50 p-4 rounded-xl flex flex-col items-center min-w-[100px]">
                 <Gift className="text-pink-400 mb-2" size={24} />
                 <span className="font-bold text-xl">+{coinsEarned}</span>
               </div>
            </div>

            <button 
              onClick={() => onComplete({
                 date: new Date().toISOString(),
                 subject: subject,
                 score: Math.round((myScore / (questions.length * 10)) * questions.length),
                 totalQuestions: questions.length,
                 accuracy: (myScore > 0 ? 100 : 0),
                 timeTaken: 0
              }, xpEarned, coinsEarned)}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Claim Rewards
            </button>
         </div>
       </div>
     )
  }

  const currentQ = questions[currentQIdx];
  const roundOver = timeLeft === 0;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white rounded-xl overflow-hidden">
      {/* HUD */}
      <div className="flex justify-between items-center p-6 bg-slate-800 border-b border-slate-700">
        <div className="flex flex-col items-start w-1/3">
          <span className="text-xs text-slate-400 uppercase font-bold flex items-center gap-1"><Users size={12}/> You</span>
          <span className="text-3xl font-black text-indigo-400 tracking-tighter">{myScore}</span>
        </div>
        <div className="flex flex-col items-center w-1/3">
           <div className={`text-4xl font-black font-mono ${timeLeft <= 5 ? 'text-red-500 animate-ping' : 'text-white'}`}>
             {timeLeft}
           </div>
        </div>
        <div className="flex flex-col items-end w-1/3">
          <span className="text-xs text-slate-400 uppercase font-bold flex items-center gap-1 text-right">{opponentName} <Users size={12}/></span>
          <div className="flex items-center gap-2">
             {oppHasAnswered && !roundOver && (
                 <span className="bg-pink-600 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">LOCKED IN</span>
             )}
             <span className="text-3xl font-black text-pink-500 tracking-tighter">{oppScore}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-800 h-1.5">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 transition-all duration-500" 
          style={{ width: `${((currentQIdx) / questions.length) * 100}%` }}
        />
      </div>

      {/* Game Area */}
      <div className="flex-1 p-6 flex flex-col justify-center max-w-3xl mx-auto w-full">
        <h3 className="text-xl md:text-2xl font-bold text-center mb-8 leading-relaxed text-slate-100">
          {currentQ?.text}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ?.options.map((opt, idx) => {
            const isSelected = myAnswer === idx;
            const isCorrect = idx === currentQ.correctAnswerIndex;
            
            // Logic for showing Opponent's move
            // Only show opponent move if Round is Over
            const showOpponentMove = roundOver && oppAnswer === idx;
            
            let bgClass = "bg-slate-800 hover:bg-slate-700 border-slate-700";
            
            if (roundOver) {
                if (isCorrect) bgClass = "bg-green-900/50 border-green-500";
                else if (isSelected) bgClass = "bg-red-900/50 border-red-500"; // Wrong selection
                else bgClass = "bg-slate-800 opacity-50";
            } else {
                if (isSelected) bgClass = "bg-indigo-600 border-indigo-400 ring-2 ring-indigo-400/50";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={myAnswer !== null || roundOver}
                className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${bgClass}`}
              >
                <div className="relative z-10 flex justify-between items-start gap-2">
                  <span className={`font-medium text-lg ${isSelected || (roundOver && isCorrect) ? 'text-white' : 'text-slate-300'}`}>{opt}</span>
                  
                  {/* Opponent Badge - Only Revealed at End */}
                  {showOpponentMove && (
                      <span className="text-[10px] uppercase font-bold bg-pink-500 text-white px-2 py-1 rounded-full absolute -top-2 -right-2 shadow-sm z-20">
                          {opponentName}
                      </span>
                  )}

                  {/* Locked Badge (Optional, mostly implied by UI) */}
                  {oppHasAnswered && !roundOver && (
                      // We don't show WHICH one they picked, just that they picked ONE.
                      // But we can't put this badge on a specific button without revealing it.
                      // So we keep it in the HUD.
                      <></>
                  )}
                </div>
                
                {/* Decoration */}
                <div className={`absolute bottom-0 right-0 p-2 opacity-10 text-6xl font-black ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Feed */}
      <div className="p-3 text-center text-xs text-slate-500 bg-slate-900/50 backdrop-blur-sm border-t border-slate-800">
        {roundOver ? (
             <span className="text-yellow-400 font-bold">Round Over! Next question coming...</span>
        ) : (
             <span>Waiting for answers...</span>
        )}
      </div>
    </div>
  );
};

export default MultiplayerBattle;