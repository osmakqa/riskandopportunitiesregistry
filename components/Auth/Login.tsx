
import React, { useState } from 'react';
import { BookOpen, FileText, Video } from 'lucide-react';
import { AppHeader } from '../Layout/AppHeader';
import { WorkflowModal } from '../Modals/WorkflowModal';
import { UserManualModal } from '../Modals/UserManualModal';
import { SECTIONS, IQA_USERS, CREDENTIALS } from '../../lib/constants';

export const Login = ({ onLogin }: { onLogin: (section: string) => void }) => {
  const [section, setSection] = useState(SECTIONS[0]);
  const [iqaUser, setIqaUser] = useState(IQA_USERS[0]);
  const [isIQA, setIsIQA] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = isIQA ? iqaUser : section;
    const correctPassword = CREDENTIALS[targetUser] || CREDENTIALS['DEFAULT'];

    if (password.toLowerCase() === correctPassword.toLowerCase()) {
      onLogin(targetUser);
    } else {
      setError('Invalid password. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F0FFF4] flex items-center justify-center p-4">
      {showWorkflow && <WorkflowModal onClose={() => setShowWorkflow(false)} />}
      {showManual && <UserManualModal onClose={() => setShowWorkflow(false)} />}
      
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <AppHeader title="OSPITAL NG MAKATI" subtitle="Risk & Opportunities Registry System" />
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
            <button type="button" onClick={() => { setIsIQA(false); setError(''); }} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${!isIQA ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Process Owner</button>
            <button type="button" onClick={() => { setIsIQA(true); setError(''); }} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${isIQA ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>IQA</button>
          </div>

          {!isIQA ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Section</label>
              <select 
                value={section} 
                onChange={(e) => setSection(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-osmak-500 focus:border-transparent outline-none transition text-sm bg-white text-gray-900"
              >
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select IQA</label>
              <select 
                value={iqaUser} 
                onChange={(e) => setIqaUser(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-osmak-500 focus:border-transparent outline-none transition text-sm bg-white text-gray-900"
              >
                {IQA_USERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-osmak-500 outline-none bg-white text-gray-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
            {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
          </div>
          <div className="space-y-4">
            <button type="submit" className="w-full bg-osmak-green hover:bg-osmak-green-dark text-white font-semibold py-3 rounded-lg transition shadow-md">
              Login
            </button>
            <div className="space-y-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowWorkflow(true)}
                  className="w-full text-osmak-green text-sm font-medium hover:underline flex items-center justify-center gap-2"
                >
                  <BookOpen size={16} /> View System Workflow
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowManual(true)}
                  className="w-full text-osmak-green text-sm font-medium hover:underline flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> View User Manual
                </button>
                 <a 
                  href="https://drive.google.com/file/d/1m3TXXwC7nV7lp2JNLgB9cxAbXsosaOLA/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full text-osmak-green text-sm font-medium hover:underline flex items-center justify-center gap-2"
                >
                  <Video size={16} /> Watch Orientation Video
                </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
