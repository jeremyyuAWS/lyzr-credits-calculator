import React, { useState } from 'react';
import Calculator from './components/Calculator';
import InfoModal from './components/InfoModal';
import AdminPanel from './components/AdminPanel';
import { CreditCard, GitFork, Lock } from 'lucide-react';

function App() {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'admin'>('calculator');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CreditCard className="mr-3 h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Lyzr Credits Calculator</h1>
                <p className="text-indigo-200">Estimate credit usage and costs for your AI workloads</p>
              </div>
            </div>
            <div className="hidden sm:flex">
              <a 
                href="https://github.com/lyzr-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-white hover:text-indigo-200 transition-colors duration-200"
              >
                <GitFork size={18} className="mr-1" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`py-4 px-2 font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'calculator' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Calculator
            </button>
            
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-4 px-2 font-medium border-b-2 transition-colors duration-200 flex items-center ${
                activeTab === 'admin' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Lock size={16} className="mr-1" />
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'calculator' ? (
          <Calculator onOpenInfo={() => setIsInfoModalOpen(true)} />
        ) : (
          <div className="calculator-container">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Administrator Panel</h2>
            </div>
            <p className="mb-6 text-gray-600">
              This panel provides access to the Lyzr API integration for verifying credit calculations and syncing with the Lyzr platform.
              The API key is stored in Netlify environment variables.
            </p>
            <Calculator 
              onOpenInfo={() => setIsInfoModalOpen(true)} 
              adminMode={true}
              renderSummary={(props) => <AdminPanel {...props} />}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Lyzr AI. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors duration-200">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <InfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
      />
    </div>
  );
}

export default App;