import React, { useState, useEffect } from 'react';
import { ViewState, Campaign } from './types';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { CreateCampaign } from './components/CreateCampaign';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('buyside_campaigns');
    if (saved) {
      try {
        setCampaigns(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse campaigns", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('buyside_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const handleCreateCampaign = (newCampaign: Campaign) => {
    setCampaigns(prev => [newCampaign, ...prev]);
    setView('DASHBOARD');
  };

  if (view === 'LOGIN') {
    return <Login onLogin={() => setView('DASHBOARD')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
             <span className="text-white font-bold">B</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Buyside</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setView('DASHBOARD')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'DASHBOARD' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Campaigns
          </button>
          
          <button 
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
             <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Analytics
          </button>

          <button 
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
             <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
           <div className="flex items-center">
             <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">U</div>
             <div className="ml-3">
               <p className="text-sm font-medium text-gray-700">Demo User</p>
               <p className="text-xs text-gray-500">Admin</p>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        <header className="mb-8 flex justify-between items-center md:hidden">
           <div className="font-bold text-xl text-gray-800">Buyside</div>
           <button onClick={() => setView('DASHBOARD')} className="text-gray-600">
             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
           </button>
        </header>

        {view === 'DASHBOARD' && (
          <Dashboard 
            campaigns={campaigns} 
            onCreateNew={() => setView('CREATE')} 
          />
        )}
        
        {view === 'CREATE' && (
          <CreateCampaign 
            onSave={handleCreateCampaign} 
            onCancel={() => setView('DASHBOARD')} 
          />
        )}
      </main>
    </div>
  );
};

export default App;