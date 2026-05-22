import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, ArrowRight, Trash2, Clock } from 'lucide-react';

export default function History() {
  const [historyData, setHistoryData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('crystallm_user'));
      const token = userData?.token;

      const res = await fetch('http://localhost:5000/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.status === 'success') setHistoryData(result.data);
    } catch (error) { console.error("Failed to fetch history", error); }
  };

  const handleLoadHistory = (item) => navigate('/result', { state: { cifData: item.cifData, formula: item.formula, targetEnergy: item.targetEnergy, spaceGroup: item.spaceGroup } });

  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if (!id) return;
    try {
      const userData = JSON.parse(localStorage.getItem('crystallm_user'));
      const token = userData?.token;

      const res = await fetch(`http://localhost:5000/api/history/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') setHistoryData(prev => prev.filter(item => item._id !== id));
    } catch (error) { console.error("Network error deletion", error); }
  };

  // --- NEW: THE MISSING DELETE ALL FUNCTION ---
  const handleDeleteAll = async () => {
    if (!window.confirm("WARNING: Are you sure you want to permanently delete ALL your generated records?")) return;
    
    try {
      const userData = JSON.parse(localStorage.getItem('crystallm_user'));
      const token = userData?.token;

      const res = await fetch(`http://localhost:5000/api/history/all`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setHistoryData([]); // Instantly clears the screen!
      }
    } catch (error) { console.error("Network error deleting all", error); }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Timestamp Unavailable";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center px-6 pt-10 pb-24 transition-colors duration-500">
      <div className="w-full max-w-5xl">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-black/10 dark:border-white/10 pb-8">
          <div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-black dark:text-white mb-3 ml-1">
              Archive
            </h2>
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
              Generation History Log
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* THE MISSING DELETE ALL BUTTON IS HERE */}
            {historyData.length > 0 && (
              <button 
                onClick={handleDeleteAll}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
              >
                <Trash2 size={14} /> Delete All
              </button>
            )}

            <div className="flex items-center gap-2 text-red-600 bg-red-100 border border-red-200 dark:text-red-500 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-2 rounded-full">
              <Archive size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">{historyData.length} Records</span>
            </div>
          </div>

        </div>

        <div className="space-y-4">
          {historyData.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center border border-black/5 dark:border-white/5 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02]">
              <Archive size={48} className="text-gray-400 dark:text-gray-600 mb-4" strokeWidth={1} />
              <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">The archive is currently empty.</p>
              <button onClick={() => navigate('/generate')} className="mt-6 text-red-600 dark:text-red-400 hover:text-black dark:hover:text-white font-mono text-xs uppercase tracking-widest transition-colors">
                Initiate a new sequence &rarr;
              </button>
            </div>
          ) : (
            historyData.map((item, idx) => (
              <div 
                key={item._id || idx} 
                onClick={() => handleLoadHistory(item)} 
                className="group relative flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-red-500/30 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all cursor-pointer overflow-hidden shadow-sm"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 dark:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex flex-col gap-2 mb-4 md:mb-0 md:w-1/3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-black dark:text-white tracking-tight">
                      {item.formula || 'Novel Generation'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[10px] uppercase tracking-wider">
                    <Clock size={12} />
                    {formatDateTime(item.createdAt || item.date)}
                  </div>
                </div>

                <div className="flex items-center gap-6 md:w-1/3 text-sm font-mono border-l border-black/10 dark:border-white/5 pl-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500">Energy</span>
                    <span className="text-gray-800 dark:text-gray-300">{item.targetEnergy || 'Auto'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500">Space Group</span>
                    <span className="text-gray-800 dark:text-gray-300">{item.spaceGroup || 'Auto'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0 justify-end md:w-1/3">
                  <button 
                    onClick={(e) => handleDelete(e, item._id || item.id)}
                    className="p-3 rounded-xl border border-black/10 dark:border-white/5 text-gray-500 hover:text-red-600 hover:bg-red-100 hover:border-red-200 dark:hover:text-red-400 dark:hover:bg-red-500/10 dark:hover:border-red-500/20 transition-all"
                    title="Delete Record"
                  >
                    <Trash2 size={16} />
                  </button>

                  <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white font-bold text-xs uppercase tracking-widest group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white dark:group-hover:bg-red-600 dark:group-hover:border-red-500 transition-all">
                    View
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}