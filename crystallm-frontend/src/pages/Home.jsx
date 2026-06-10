// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Zap, RotateCcw, ArrowRight } from 'lucide-react';

// export default function Home() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     formula: '',
//     targetEnergy: '',
//     spaceGroup: ''
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleClear = () => {
//     setFormData({ formula: '', targetEnergy: '', spaceGroup: '' });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Navigates to the Result page and passes the form data to trigger generation
//     navigate('/result', { state: { isNewGeneration: true, formData } });
//   };

//   // Slightly scaled up input styling: py-5 instead of py-4, text-base instead of text-sm
//   const inputClass = "w-full bg-white/[0.02] border border-white/10 rounded-xl px-6 py-5 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.04] transition-all font-mono text-base";
  
//   // Slightly scaled up label styling: text-xs instead of text-[10px]
//   const labelClass = "block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2";

//   return (
//     <div className="min-h-[80vh] flex items-center justify-center px-6">
//       <div className="w-full max-w-4xl">
        
//         {/* ========================================= */}
//         {/* HEADER SECTION                            */}
//         {/* ========================================= */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
//           <div>
//             <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-4">
//               Configuration
//             </h2>
//             <p className="text-gray-500 font-mono text-sm uppercase tracking-widest ml-1">
//               Advanced Inverse Design Protocol
//             </p>
//           </div>
//           <button
//             onClick={handleClear}
//             className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors pb-0"
//           >
//             <RotateCcw size={16} /> Clear Parameters
//           </button>
//         </div>

//         {/* ========================================= */}
//         {/* FORM SECTION                              */}
//         {/* ========================================= */}
//         <form onSubmit={handleSubmit} className="space-y-12">
          
//           {/* Chemical Formula (Full Width) */}
//           <div>
//             <label className={labelClass}>
//               <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block"></span>
//               Chemical Composition
//             </label>
//             <input
//               type="text"
//               name="formula"
//               value={formData.formula}
//               onChange={handleChange}
//               placeholder="e.g., Au2O3"
//               className={inputClass}
//               autoComplete="off"
//             />
//           </div>

//           {/* Target Energy & Space Group (Split Grid) */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//             <div>
//               <label className={labelClass}>
//                 <span className="w-1.5 h-1.5 rounded-full bg-gray-600 inline-block"></span>
//                 Target Formation Energy <span className="lowercase text-gray-600 font-mono tracking-normal ml-1">(eV/atom)</span>
//               </label>
//               <input
//                 type="text"
//                 name="targetEnergy"
//                 value={formData.targetEnergy}
//                 onChange={handleChange}
//                 placeholder="e.g., -2.0"
//                 className={inputClass}
//                 autoComplete="off"
//               />
//             </div>
            
//             <div>
//               <label className={labelClass}>
//                 <span className="w-1.5 h-1.5 rounded-full bg-gray-600 inline-block"></span>
//                 Space Group Symmetry
//               </label>
//               <input
//                 type="text"
//                 name="spaceGroup"
//                 value={formData.spaceGroup}
//                 onChange={handleChange}
//                 placeholder="e.g., Fm-3m"
//                 className={inputClass}
//                 autoComplete="off"
//               />
//             </div>
//           </div>

//           {/* ========================================= */}
//           {/* SUBMIT AREA                               */}
//           {/* ========================================= */}
//           <div className="pt-10 border-t border-white/10 flex flex-col-reverse md:flex-row items-center justify-between gap-8 mt-4">
//             <p className="text-sm text-gray-500 max-w-md font-medium leading-relaxed">
//               The engine strictly adheres to defined physiochemical constraints. Unspecified parameters will be autonomously optimized by the generative model.
//             </p>
//             {/* Slightly scaled up button: text-lg instead of text-base */}
//             <button
//               type="submit"
//               className="px-10 py-4 rounded-full font-bold text-lg bg-white text-black hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-3 group whitespace-nowrap shadow-[0_0_30px_rgba(255,255,255,0.1)]"
//             >
//               <Zap size={20} className="text-violet-600" />
//               Initialize Sequence
//               <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
//             </button>
//           </div>

//         </form>
//       </div>
//     </div>
//   );
// }
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, RotateCcw, ArrowRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  // Added 'z' to state initialization
  const [formData, setFormData] = useState({ formula: '', targetEnergy: '', spaceGroup: '', z: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  // Added 'z' to clear handler
  const handleClear = () => setFormData({ formula: '', targetEnergy: '', spaceGroup: '', z: '' });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/result', { state: { isNewGeneration: true, formData } });
  };

  const inputClass = "w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl px-6 py-5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-black/[0.05] dark:focus:bg-white/[0.04] transition-all font-mono text-base shadow-inner";
  const labelClass = "block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 transition-colors duration-500">
      <div className="w-full max-w-4xl">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-black dark:text-white mb-4 ml-1">
              Configuration
            </h2>
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest ml-1">
              Advanced Inverse Design Protocol
            </p>
          </div>
          <button onClick={handleClear} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors pb-0">
            <RotateCcw size={16} /> Clear Parameters
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div>
            <label className={labelClass}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500 inline-block"></span>
              Chemical Composition
            </label>
            <input type="text" name="formula" value={formData.formula} onChange={handleChange} placeholder="e.g., Au2O3" className={inputClass} autoComplete="off" />
          </div>

          {/* Changed grid to 3 columns to fit Z */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <label className={labelClass}>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 inline-block"></span>
                Target Formation Energy <span className="lowercase font-mono tracking-normal ml-1">(eV/atom)</span>
              </label>
              <input type="text" name="targetEnergy" value={formData.targetEnergy} onChange={handleChange} placeholder="e.g., -2.0" className={inputClass} autoComplete="off" />
            </div>
            
            <div>
              <label className={labelClass}>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 inline-block"></span>
                Space Group Symmetry
              </label>
              <input type="text" name="spaceGroup" value={formData.spaceGroup} onChange={handleChange} placeholder="e.g., Fm-3m" className={inputClass} autoComplete="off" />
            </div>

            {/* New Z Input */}
            <div>
              <label className={labelClass}>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 inline-block"></span>
                Formula Units <span className="lowercase font-mono tracking-normal ml-1">(Z)</span>
              </label>
              <input type="text" name="z" value={formData.z} onChange={handleChange} placeholder="e.g., 4" className={inputClass} autoComplete="off" />
            </div>
          </div>

          <div className="pt-10 border-t border-black/10 dark:border-white/10 flex flex-col-reverse md:flex-row items-center justify-between gap-8 mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md font-medium leading-relaxed">
              The engine strictly adheres to defined physiochemical constraints. Unspecified parameters will be autonomously optimized by the generative model.
            </p>
            <button type="submit" className="px-10 py-4 rounded-full font-bold text-lg bg-black text-white hover:bg-red-600 dark:bg-white dark:text-black dark:hover:bg-red-600 dark:hover:text-white active:scale-95 transition-all flex items-center justify-center gap-3 group whitespace-nowrap shadow-xl dark:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <Zap size={20} className="text-white group-hover:text-white dark:text-red-600 dark:group-hover:text-white transition-colors" />
              Initialize Sequence
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}