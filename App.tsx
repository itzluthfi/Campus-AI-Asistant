import React, { useState, useEffect } from 'react';
import DatabaseView from './components/DatabaseView';
import ChatInterface from './components/ChatInterface';
import AccountsView from './components/AccountsView';
import { generateMockDatabase } from './utils/dataGenerator';
import { MockDatabase, UserSession } from './types';
import { getSession, clearSession } from './utils/storage';
import { initializePublicSDK } from './services/publicSDK';

function App() {
  const [activeTab, setActiveTab] = useState<'database' | 'chat' | 'accounts'>('chat');
  const [database, setDatabase] = useState<MockDatabase | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);

  // 1. Initialize Data & Restore Session
  useEffect(() => {
    // Generate DB
    const data = generateMockDatabase();
    setDatabase(data);

    // Initialize Public API (SDK) for external access
    initializePublicSDK(data);

    // Restore Session
    const savedUser = getSession();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    clearSession();
  };

  if (!database) return <div className="flex h-screen items-center justify-center bg-gray-100 text-gray-600 animate-pulse">Initializing System L...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-100 overflow-hidden">
      
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg">L</div>
            <h1 className="text-xl font-bold tracking-tight text-white">AI Asisten Kampus</h1>
          </div>
          <p className="text-xs text-slate-400">
            {user ? `Halo, ${user.name.split(' ')[0]}` : 'Mode Tamu'}
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'chat' 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span>Chat dengan L</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'database' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            <span>Data & API Docs</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'accounts' 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>Akun Test</span>
          </button>
        </nav>

        {/* Status Panel */}
        <div className="p-4 bg-slate-800 text-xs text-slate-400 border-t border-slate-700">
           {user ? (
             <div className="space-y-2">
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                 <span className="font-bold text-green-400">Online</span>
               </div>
               <p className="uppercase tracking-wide opacity-70 text-[10px]">{user.role}</p>
               <p className="font-mono bg-slate-900 p-1 rounded text-center">{user.identifier}</p>
               
               <button 
                onClick={handleLogout}
                className="w-full mt-2 bg-red-500/20 text-red-400 py-1 rounded hover:bg-red-500 hover:text-white transition"
               >
                 Logout
               </button>
             </div>
           ) : (
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
               <span className="font-bold text-yellow-400">Offline (Guest)</span>
             </div>
           )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {activeTab === 'database' ? (
          <DatabaseView data={database} user={user} />
        ) : activeTab === 'accounts' ? (
          <AccountsView data={database} />
        ) : (
          <ChatInterface 
            database={database} 
            user={user} 
            setUser={setUser} 
          />
        )}
      </main>
    </div>
  );
}

export default App;