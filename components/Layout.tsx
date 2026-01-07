import React from 'react';
import { Home, BarChart2, Zap, Settings, BookMarked, User, Mic, BookOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const navItems = [
    { id: 'DASHBOARD', icon: Home, label: 'Home' },
    { id: 'SYLLABUS_READER', icon: BookOpen, label: 'Textbooks' },
    { id: 'ANALYTICS', icon: BarChart2, label: 'Reports' },
    { id: 'BATTLE_LOBBY', icon: Zap, label: 'Battle' },
    { id: 'TEACHER_EXPLAINER', icon: Mic, label: 'AI Teacher' },
    { id: 'BOOKMARKS', icon: BookMarked, label: 'Saved' },
    { id: 'PROFILE', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="text-2xl font-black text-indigo-600 tracking-tight">Commerce<span className="text-gray-800">Pro</span></div>
          <div className="text-xs text-gray-400 mt-1">12th HSC Prep</div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${activeView === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-800">
            <Settings size={18} className="mr-3" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
           <div className="font-bold text-indigo-600 text-lg">CommercePro</div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden bg-white border-t border-gray-200 flex justify-around p-2">
          {navItems.slice(0, 5).map((item) => (
             <button
             key={item.id}
             onClick={() => onNavigate(item.id)}
             className={`flex flex-col items-center p-2 rounded-lg ${activeView === item.id ? 'text-indigo-600' : 'text-gray-400'}`}
           >
             <item.icon size={20} />
             <span className="text-[10px] mt-1">{item.label}</span>
           </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;