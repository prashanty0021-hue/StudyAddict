import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import QuizInterface from './components/QuizInterface';
import MultiplayerBattle from './components/MultiplayerBattle';
import Analytics from './components/Analytics';
import ChapterSelection from './components/ChapterSelection';
import TeacherExplainer from './components/TeacherExplainer';
import ExamHub from './components/ExamHub';
import SyllabusReader from './components/SyllabusReader';
import { ViewState, UserProfile, QuizConfig, TestResult, Subject } from './types';
import { INITIAL_USER_PROFILE } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('ONBOARDING');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [activeQuizConfig, setActiveQuizConfig] = useState<QuizConfig | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // State for AI Teacher Pre-fill
  const [teacherConfig, setTeacherConfig] = useState<{subject: Subject, topic: string} | null>(null);

  // Enhanced Onboarding Handler with Duplicate Check
  const handleOnboardingComplete = (name: string, target: number) => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setErrorMessage("Name must be at least 2 characters.");
      return;
    }

    // Get existing users
    const existingUsersJSON = localStorage.getItem('commerce_pro_users');
    const existingUsers: string[] = existingUsersJSON ? JSON.parse(existingUsersJSON) : [];

    // Check collision (Case insensitive for better UX)
    const nameExists = existingUsers.some(u => u.toLowerCase() === trimmedName.toLowerCase());

    if (nameExists) {
      setErrorMessage(`The username "${trimmedName}" is already taken. Please choose another.`);
      return;
    }

    // Register new user
    const updatedUsers = [...existingUsers, trimmedName];
    localStorage.setItem('commerce_pro_users', JSON.stringify(updatedUsers));

    setUser({ ...user, name: trimmedName, targetScore: target, onboardingComplete: true });
    setErrorMessage('');
    setView('DASHBOARD');
  };

  const handleUpdateUser = (updates: Partial<UserProfile>) => {
      setUser(prev => ({ ...prev, ...updates }));
  };

  const handleNavigate = (targetView: ViewState, data?: any) => {
    if (targetView === 'CHAPTER_SELECT') {
      setSelectedSubject(data.subject);
      setView('CHAPTER_SELECT');
    } 
    else if (targetView === 'QUIZ_SETUP') {
      // Direct jump (e.g. from quick practice)
      const config: QuizConfig = {
        subject: data?.subject || Subject.ECONOMICS,
        topic: data?.topic,
        mode: 'PRACTICE',
        questionCount: 10,
        timeLimit: 600 // 10 mins
      };
      setActiveQuizConfig(config);
      setView('QUIZ_ACTIVE');
    } 
    else if (targetView === 'BATTLE_LOBBY') {
        setView('BATTLE_ACTIVE');
    } 
    else {
      // Clear teacher config if navigating elsewhere manually
      if(targetView !== 'TEACHER_EXPLAINER') setTeacherConfig(null);
      setView(targetView);
    }
  };

  const handleTopicSelect = (topic: string) => {
    if (!selectedSubject) return;
    
    // Logic: If topic is empty string, it means "Full Syllabus"
    const config: QuizConfig = {
      subject: selectedSubject,
      topic: topic || undefined,
      mode: 'PRACTICE',
      questionCount: 15,
      timeLimit: 900
    };
    setActiveQuizConfig(config);
    setView('QUIZ_ACTIVE');
  };

  const handleExamSelect = (config: QuizConfig) => {
      setActiveQuizConfig(config);
      setView('QUIZ_ACTIVE');
  };

  const handleQuizComplete = (result: TestResult, earnedXp = 50, earnedCoins = 10) => {
    setTestResults([...testResults, result]);
    setUser(prev => ({
        ...prev,
        questionsSolved: prev.questionsSolved + result.totalQuestions,
        completedTests: prev.completedTests + 1,
        xp: prev.xp + earnedXp,
        coins: prev.coins + earnedCoins,
        level: Math.floor((prev.xp + earnedXp) / 1000) + 1 // Simple level formula
    }));
    
    if (result.score === undefined) {
      // It's a battle result handled differently in UI but same state update logic
       setView('DASHBOARD');
    } else {
       setView('ANALYTICS');
    }
  };

  // Onboarding View Component (Inline for simplicity within App file constraints)
  if (view === 'ONBOARDING') {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Commerce<span className="text-indigo-600">Pro</span></h1>
            <p className="text-gray-500">12th Standard HSC Prep (2025-26)</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleOnboardingComplete(formData.get('name') as string, Number(formData.get('target')));
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Username</label>
              <input 
                name="name" 
                required 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Unique Student ID" 
                onChange={() => setErrorMessage('')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Percentage (%)</label>
              <input name="target" type="number" min="35" max="100" defaultValue="90" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                {errorMessage}
              </div>
            )}

            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
              Start Learning
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout activeView={view} onNavigate={handleNavigate}>
      {view === 'DASHBOARD' && (
        <Dashboard user={user} onNavigate={handleNavigate} />
      )}
      
      {view === 'CHAPTER_SELECT' && selectedSubject && (
        <ChapterSelection 
          subject={selectedSubject} 
          onSelectTopic={handleTopicSelect}
          onBack={() => setView('DASHBOARD')} 
        />
      )}
      
      {view === 'TEACHER_EXPLAINER' && (
        <TeacherExplainer 
          onBack={() => setView('DASHBOARD')}
          initialSubject={teacherConfig?.subject}
          initialTopic={teacherConfig?.topic}
        />
      )}
      
      {view === 'EXAM_HUB' && (
        <ExamHub 
            onSelectExam={handleExamSelect}
            onBack={() => setView('DASHBOARD')}
        />
      )}
      
      {view === 'SYLLABUS_READER' && (
        <SyllabusReader 
          onBack={() => setView('DASHBOARD')}
          onPractice={(subject, topic) => {
              const config: QuizConfig = {
                  subject: subject,
                  topic: topic,
                  mode: 'PRACTICE',
                  questionCount: 10,
                  timeLimit: 600
              };
              setActiveQuizConfig(config);
              setView('QUIZ_ACTIVE');
          }}
          onWatchVideo={(subject, topic) => {
              setTeacherConfig({ subject, topic });
              setView('TEACHER_EXPLAINER');
          }}
        />
      )}

      {view === 'QUIZ_ACTIVE' && activeQuizConfig && (
        <QuizInterface 
          config={activeQuizConfig} 
          user={user}
          onUpdateUser={handleUpdateUser}
          onComplete={(res) => handleQuizComplete(res, 100, 25)} // Higher reward for full exams
          onExit={() => setView('DASHBOARD')}
        />
      )}

      {view === 'BATTLE_ACTIVE' && (
        <MultiplayerBattle 
          subject={Subject.ECONOMICS} // Hardcoded for demo usually, but could be selectable
          onExit={() => setView('DASHBOARD')}
          onComplete={handleQuizComplete}
        />
      )}

      {view === 'ANALYTICS' && (
        <Analytics results={testResults} onBack={() => setView('DASHBOARD')} />
      )}
      
      {view === 'BOOKMARKS' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>Bookmarks feature coming soon!</p>
              <button onClick={() => setView('DASHBOARD')} className="mt-4 text-indigo-600 font-medium">Go Home</button>
          </div>
      )}
      
      {view === 'PROFILE' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>Profile Settings coming soon!</p>
              <button onClick={() => setView('DASHBOARD')} className="mt-4 text-indigo-600 font-medium">Go Home</button>
          </div>
      )}
    </Layout>
  );
};

export default App;