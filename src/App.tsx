import { useState } from 'react';
import Dashboard from './components/Dashboard';
import RecordForm from './components/RecordForm';
import RecordsTable from './components/RecordsTable';
import { LayoutDashboard, Plus, Table } from 'lucide-react';

type View = 'dashboard' | 'add' | 'records';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRecordSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Team Effort Tracker</h1>
                <p className="text-xs text-gray-500">Monitor AI tool usage and productivity</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('add')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'add'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Record
              </button>
              <button
                onClick={() => setCurrentView('records')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'records'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Table className="w-4 h-4" />
                All Records
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && <Dashboard key={refreshKey} />}
        {currentView === 'add' && <RecordForm onSuccess={handleRecordSuccess} />}
        {currentView === 'records' && <RecordsTable key={refreshKey} />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Team Effort Tracking System - Helping teams monitor productivity and AI tool effectiveness
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
