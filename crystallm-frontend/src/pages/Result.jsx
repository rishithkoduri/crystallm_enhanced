// import React, { useEffect, useState, useRef } from 'react';
// import { useLocation, Link } from 'react-router-dom';
// import { Box, BrainCircuit, DatabaseZap, TerminalSquare, ListTree, Download, Clipboard, Check, AlertTriangle } from 'lucide-react';

// export default function Result() {
//   const location = useLocation();
//   const hasFetched = useRef(false);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [cifData, setCifData] = useState(null);
//   const [exactPrompt, setExactPrompt] = useState(null);
//   const [extractedFeatures, setExtractedFeatures] = useState([]);
//   const [copied, setCopied] = useState(false);
  
//   // ✅ FIX: Added the missing error state!
//   const [error, setError] = useState(null);
//   // --- THEME TRACKER ---
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   useEffect(() => {
//     // Check initial theme
//     setIsDarkMode(document.documentElement.classList.contains('dark'));
    
//     // Watch for clicks on the light/dark mode button
//     const observer = new MutationObserver(() => {
//       setIsDarkMode(document.documentElement.classList.contains('dark'));
//     });
//     observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
//     return () => observer.disconnect();
//   }, []);
//   // ---------------------
//   useEffect(() => {
//     const state = location.state;
//     if (!state) return;
//     if (state.isNewGeneration && state.formData && !hasFetched.current) {
//         hasFetched.current = true;
//         generateCrystal(state.formData);
//     } else if (state.cifData) {
//         const cleanedCIF = formatCIF(state.cifData);
//         setCifData(cleanedCIF);
//         setExactPrompt(getExactPrompt(state.formula, state.targetEnergy, state.spaceGroup));
//         extractFeatures(cleanedCIF);
//     }
//   }, [location.state]);

//   const formatCIF = (raw) => {
//     if (!raw) return "";
//     let s = raw;
//     s = s.replace(/\s*(loop_)\s*/gi, '\n\n$1\n');
//     s = s.replace(/([^\n])\s+(_[a-zA-Z0-9_]+)/g, '$1\n$2');
//     s = s.replace(/(_[a-zA-Z0-9_]+)(['"])/g, '$1 $2');
//     const tagsToBreak = ['_symmetry_space_group', '_cell_length', '_cell_angle', '_chemical_formula', '_cell_volume', '_cell_formula_units', '_symmetry_Int_Tables_number'];
//     tagsToBreak.forEach(tag => {
//         const reg = new RegExp(`(${tag})`, 'g');
//         s = s.replace(reg, '\n$1');
//     });
//     s = s.replace(/(\d\.)\s+/g, '$1'); 
//     let prev;
//     do { prev = s; s = s.replace(/(\.\d+)\s+(\d{2,})(?!\.)/g, '$1$2'); } while (s !== prev);
//     return s.trim().replace(/\n{3,}/g, '\n\n'); 
//   };

//   const handleCopy = () => { navigator.clipboard.writeText(cifData); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  
//   const handleDownload = () => {
//     const element = document.createElement("a");
//     const file = new Blob([cifData], {type: 'text/plain'});
//     element.href = URL.createObjectURL(file);
//     element.download = "crystal_structure.cif"; // Changed to .cif for standard crystal files
//     document.body.appendChild(element); element.click();
//   };

//   const getExactPrompt = (formula, energy, spaceGroup) => `[CONTEXT]\n- The material ${formula || "structure"} is stable.\n\n[TASK]\nGenerate a valid CIF structure.\n\n[CIF START]`;

//   const extractFeatures = (text) => {
//     const keys = ['_cell_length_a', '_cell_length_b', '_cell_length_c', '_cell_angle_alpha', '_cell_angle_beta', '_cell_angle_gamma', '_cell_volume', '_chemical_formula_sum'];
//     const found = [];
//     keys.forEach(key => {
//       const idx = text.indexOf(key);
//       if (idx !== -1) {
//         const val = text.slice(idx + key.length).trim().split(/[\n]/)[0].replace(/['"]/g, '').trim();
//         if (val) found.push({ key, value: val });
//       }
//     });
//     setExtractedFeatures(found);
//   };

//   const render3DModel = (cifText) => {
//     if (!cifText) return null;
    
//     const safeCif = encodeURIComponent(cifText);
    
//     const htmlContent = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <script src="https://3Dmol.org/build/3Dmol-min.js"></script>
//             <style> 
//                 /* Lock the body to a beautiful deep space gray */
//                 body { margin: 0; padding: 0; overflow: hidden; background-color: #050505; } 
//             </style>
//         </head>
//         <body>
//             <div id="viewer" style="width: 100vw; height: 100vh; position: relative;"></div>
//             <script>
//                 let cif = decodeURIComponent("${safeCif}");
//                 let viewer = $3Dmol.createViewer("viewer", { backgroundColor: "#050505" });
                
//                 viewer.addModel(cif, "cif");
                
//                 viewer.setStyle({}, { 
//                     sphere: { colorscheme: "Jmol", scale: 0.35 }, 
//                     stick: { colorscheme: "Jmol", radius: 0.12 }
//                 });
                
//                 // Lock the bounding box to pure white so it always pops
//                 viewer.addUnitCell({ box: { color: "white", hidden: false } });
                
//                 viewer.zoomTo();
//                 viewer.render();
//             </script>
//         </body>
//         </html>
//     `;

//     return (
//         <iframe 
//             style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0, zIndex: 10 }} 
//             srcDoc={htmlContent}
//             title="3D Crystal Viewer"
//         />
//     );
//   };

//   const generateCrystal = async (formData) => {
//     setIsGenerating(true);
//     setError(null); // No longer crashes!
    
//     try {
//         // 1. Get the user's JWT token from localStorage
//         const storedUser = JSON.parse(localStorage.getItem('crystallm_user'));
//         const token = storedUser?.token;

//         if (!token) {
//             setError("Authentication error. Please log in again.");
//             setIsGenerating(false);
//             return;
//         }

//         // 2. Call your LOCAL Node.js backend
//         const response = await fetch(`http://localhost:5000/api/generate`, {
//             method: 'POST',
//             headers: { 
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}` 
//             },
//             body: JSON.stringify({
//                 formula: formData.formula,
//                 targetEnergy: formData.targetEnergy,
//                 spaceGroup: formData.spaceGroup
//             })
//         });

//         const data = await response.json();
        
//         if (response.ok && data.status === 'success') {
//             const cleaned = formatCIF(data.cifData);
//             setCifData(cleaned);
//             setExactPrompt(getExactPrompt(formData.formula, formData.targetEnergy, formData.spaceGroup));
//             extractFeatures(cleaned);
//         } else {
//             setError(data.message || data.detail || "Generation failed due to physical instability.");
//         }
//     } catch (err) {
//         setError("Network error. Could not connect to the Node.js server.");
//     } finally {
//         setIsGenerating(false);
//     }
//   };

//   if (!cifData && !isGenerating) {
//     return (
//         <div className="h-[75vh] flex items-center justify-center transition-colors duration-500">
//             <div className="flex flex-col items-center gap-6 text-center max-w-lg">
//                 <BrainCircuit size={48} className="text-black/20 dark:text-white/20 mb-2" strokeWidth={1} />
//                 <h3 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter opacity-90">Result Viewer Clear</h3>
                
//                 {/* ✅ Added Error Display block so you can see if the backend failed */}
//                 {error && (
//                     <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 text-sm my-2 text-left w-full">
//                         <AlertTriangle size={18} className="shrink-0" />
//                         <span>{error}</span>
//                     </div>
//                 )}

//                 <p className="text-sm text-gray-500 font-mono uppercase tracking-widest leading-relaxed mt-2">
//                     Standby mode active.<br/> Return to <Link to="/generate" className="text-red-600 dark:text-red-500 hover:text-black dark:hover:text-white transition-colors border-b border-red-500/30 hover:border-black dark:hover:border-white pb-0.5">Configuration</Link> to initiate sequence.
//                 </p>
//             </div>
//         </div>
//     );
//   }

//   if (isGenerating) {
//     return (
//         <div className="h-[75vh] flex flex-col items-center justify-center gap-8 transition-colors duration-500">
//             <div className="w-24 h-24 rounded-full border-[4px] border-dashed border-red-600 dark:border-red-500 animate-[spin_3s_linear_infinite]"></div>
//             <h2 className="text-3xl font-bold text-gray-600 dark:text-gray-400 tracking-tight">Computing Atomic Lattice...</h2>
//         </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-[750px] w-full pb-10 px-6 transition-colors duration-500">
//         <div className="flex flex-col gap-5 h-full">
//             <div className="flex-[1.5] rounded-3xl bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-3xl border border-black/10 dark:border-white/10 shadow-xl dark:shadow-2xl flex items-center justify-center relative overflow-hidden min-h-[380px]">
//                 {/* Notice the z-20 added here so the badge stays above the 3D model */}
//                 <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md flex items-center gap-2 z-20">
//                     <Box size={14}/> 3D Unit Cell Viewer
//                 </div>
                
//                 {/* 🚨 THE 3D VIEWER LOGIC 🚨 */}
//                 {cifData ? render3DModel(cifData) : (
//                     <div className="text-center p-5 z-10">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-500 mx-auto mb-4"></div>
//                         <p className="font-bold text-xl mb-2 text-black dark:text-white">Processing Geometry...</p>
//                     </div>
//                 )}
//                 {/* ------------------------- */}

//             </div>
//             <div className="flex-[1] rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-3xl border border-black/10 dark:border-white/10 p-5 shadow-xl flex flex-col">
//                 <div className="text-red-600 dark:text-red-500 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
//                    <TerminalSquare size={14}/> Exact Prompt
//                 </div>
//                 <div className="flex-1 bg-white dark:bg-black/40 text-gray-800 dark:text-gray-300 p-4 rounded-xl text-sm font-mono whitespace-pre-wrap border border-black/5 dark:border-white/5 overflow-auto custom-scrollbar shadow-inner leading-relaxed">
//                     {exactPrompt}
//                 </div>
//             </div>
//         </div>

//         <div className="flex flex-col gap-5 h-full">
//             <div className="flex-none rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-3xl border border-black/10 dark:border-white/10 p-5 shadow-xl flex flex-col overflow-hidden">
//                 <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 pb-3 border-b border-black/10 dark:border-white/5">
//                    <ListTree size={16} className="text-red-600 dark:text-red-500"/> CIF Analytics
//                 </div>
//                 <div className="grid grid-cols-2 gap-3 font-mono text-sm">
//                     {extractedFeatures.map((feat, i) => (
//                     <div key={i} className="bg-white dark:bg-white/[0.02] p-3.5 rounded-xl border border-black/5 dark:border-white/5 break-all shadow-sm group hover:border-red-500/30 transition-all">
//                         <span className="text-red-600 dark:text-red-500 font-bold block mb-1 text-[10px] uppercase tracking-wider opacity-80">{feat.key}</span>
//                         <div className="text-black dark:text-white font-bold">{feat.value}</div>
//                     </div>
//                     ))}
//                 </div>
//             </div>

//             <div className="flex-1 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-3xl border border-black/10 dark:border-white/10 p-5 shadow-xl flex flex-col overflow-hidden min-h-[350px]">
//                 <div className="flex justify-between items-center mb-3 border-b border-black/10 dark:border-white/5 pb-3">
//                     <div className="text-red-600 dark:text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
//                        <DatabaseZap size={14}/> Generated Raw CIF
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-all text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">
//                             {copied ? <Check size={12} className="text-green-600 dark:text-green-400"/> : <Clipboard size={12}/>}
//                             {copied ? 'Copied' : 'Copy'}
//                         </button>
//                         <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-600/20 border border-red-200 dark:border-red-500/30 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-600/30 transition-all">
//                             <Download size={12}/> Download .cif
//                         </button>
//                     </div>
//                 </div>
//                 <div className="flex-1 bg-white dark:bg-black/60 text-gray-800 dark:text-gray-300 p-5 rounded-xl border border-black/5 dark:border-white/5 text-sm font-mono overflow-auto custom-scrollbar whitespace-pre-wrap shadow-inner leading-relaxed tracking-normal">
//                   {cifData}
//                 </div>
//             </div>
//         </div>
//     </div>
//   );
// }
// import React, { useEffect, useState, useRef } from 'react';
// import { useLocation, Link } from 'react-router-dom';
// import { Box, BrainCircuit, DatabaseZap, TerminalSquare, ListTree, Download, Clipboard, Check, AlertTriangle } from 'lucide-react';

// export default function Result() {
//   const location = useLocation();
//   const hasFetched = useRef(false);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [cifData, setCifData] = useState(null);
//   const [exactPrompt, setExactPrompt] = useState(null);
//   const [extractedFeatures, setExtractedFeatures] = useState([]);
//   const [copied, setCopied] = useState(false);
//   const [error, setError] = useState(null);

//   // --- 1. THE THEME TRACKER ---
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   useEffect(() => {
//     // Check initial theme on load
//     setIsDarkMode(document.documentElement.classList.contains('dark'));
    
//     // Watch for clicks on your Light/Dark mode toggle button
//     const observer = new MutationObserver(() => {
//       setIsDarkMode(document.documentElement.classList.contains('dark'));
//     });
    
//     observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
//     return () => observer.disconnect();
//   }, []);
//   // ----------------------------

//   useEffect(() => {
//     const state = location.state;
//     if (!state) return;
    
//     if (state.isNewGeneration && state.formData && !hasFetched.current) {
//         hasFetched.current = true;
        
//         // 🚨 THE AMNESIA FIX: Wipe the router state immediately!
//         // If the browser times out and auto-refreshes, it won't remember the form data.
//         window.history.replaceState({}, document.title);
        
//         generateCrystal(state.formData);
//     } else if (state.cifData) {
//         const cleanedCIF = formatCIF(state.cifData);
//         setCifData(cleanedCIF);
//         setExactPrompt(getExactPrompt(state.formula, state.targetEnergy, state.spaceGroup));
//         extractFeatures(cleanedCIF);
//     }
//   }, [location.state]);

//   const formatCIF = (raw) => {
//     if (!raw) return "";
//     let s = raw;
//     s = s.replace(/\s*(loop_)\s*/gi, '\n\n$1\n');
//     s = s.replace(/([^\n])\s+(_[a-zA-Z0-9_]+)/g, '$1\n$2');
//     s = s.replace(/(_[a-zA-Z0-9_]+)(['"])/g, '$1 $2');
//     const tagsToBreak = ['_symmetry_space_group', '_cell_length', '_cell_angle', '_chemical_formula', '_cell_volume', '_cell_formula_units', '_symmetry_Int_Tables_number'];
//     tagsToBreak.forEach(tag => {
//         const reg = new RegExp(`(${tag})`, 'g');
//         s = s.replace(reg, '\n$1');
//     });
//     s = s.replace(/(\d\.)\s+/g, '$1'); 
//     let prev;
//     do { prev = s; s = s.replace(/(\.\d+)\s+(\d{2,})(?!\.)/g, '$1$2'); } while (s !== prev);
//     return s.trim().replace(/\n{3,}/g, '\n\n'); 
//   };

//   const handleCopy = () => { navigator.clipboard.writeText(cifData); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  
//   const handleDownload = () => {
//     const element = document.createElement("a");
//     const file = new Blob([cifData], {type: 'text/plain'});
//     element.href = URL.createObjectURL(file);
//     element.download = "crystal_structure.cif";
//     document.body.appendChild(element); element.click();
//   };

//   const getExactPrompt = (formula, energy, spaceGroup) => `[CONTEXT]\n- The material ${formula || "structure"} is stable.\n\n[TASK]\nGenerate a valid CIF structure.\n\n[CIF START]`;

//   const extractFeatures = (text) => {
//     const keys = ['_cell_length_a', '_cell_length_b', '_cell_length_c', '_cell_angle_alpha', '_cell_angle_beta', '_cell_angle_gamma', '_cell_volume', '_chemical_formula_sum'];
//     const found = [];
//     keys.forEach(key => {
//       const idx = text.indexOf(key);
//       if (idx !== -1) {
//         const val = text.slice(idx + key.length).trim().split(/[\n]/)[0].replace(/['"]/g, '').trim();
//         if (val) found.push({ key, value: val });
//       }
//     });
//     setExtractedFeatures(found);
//   };

//   // --- 2. THE DYNAMIC 3D VIEWER ---
//   // --- PERMANENT LIGHT-MODE VIEWER ---
//   const render3DModel = (cifText) => {
//     if (!cifText) return null;
    
//     const safeCif = encodeURIComponent(cifText);
    
//     const htmlContent = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <script src="https://3Dmol.org/build/3Dmol-min.js"></script>
//             <style> 
//                 /* Lock background to pure white */
//                 body { margin: 0; padding: 0; overflow: hidden; background-color: #ffffff; } 
//             </style>
//         </head>
//         <body>
//             <div id="viewer" style="width: 100vw; height: 100vh; position: relative;"></div>
//             <script>
//                 let cif = decodeURIComponent("${safeCif}");
//                 let viewer = $3Dmol.createViewer("viewer", { backgroundColor: "#ffffff" });
                
//                 viewer.addModel(cif, "cif");
                
//                 viewer.setStyle({}, { 
//                     sphere: { colorscheme: "Jmol", scale: 0.35 }, 
//                     stick: { colorscheme: "Jmol", radius: 0.12 }
//                 });
                
//                 // Lock the bounding box to black so it contrasts with the white background
//                 viewer.addUnitCell({ box: { color: "black", hidden: false } });
                
//                 viewer.zoomTo();
//                 viewer.render();
//             </script>
//         </body>
//         </html>
//     `;

//     return (
//         <iframe 
//             style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0, zIndex: 10 }} 
//             srcDoc={htmlContent}
//             title="3D Crystal Viewer"
//         />
//     );
//   };
//   // --------------------------------

//   const generateCrystal = async (formData) => {
//     setIsGenerating(true);
//     setError(null);
    
//     try {
//         const storedUser = JSON.parse(localStorage.getItem('crystallm_user'));
//         const token = storedUser?.token;

//         if (!token) {
//             setError("Authentication error. Please log in again.");
//             setIsGenerating(false);
//             return;
//         }

//         const response = await fetch(`http://localhost:5000/api/generate`, {
//             method: 'POST',
//             headers: { 
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}` 
//             },
//             body: JSON.stringify({
//                 formula: formData.formula,
//                 targetEnergy: formData.targetEnergy,
//                 spaceGroup: formData.spaceGroup
//             })
//         });

//         const data = await response.json();
        
//         if (response.ok && data.status === 'success') {
//             const cleaned = formatCIF(data.cifData);
//             setCifData(cleaned);
//             setExactPrompt(getExactPrompt(formData.formula, formData.targetEnergy, formData.spaceGroup));
//             extractFeatures(cleaned);
//         } else {
//             setError(data.message || data.detail || "Generation failed due to physical instability.");
//         }
//     } catch (err) {
//         setError("Network error. Could not connect to the Node.js server.");
//     } finally {
//         setIsGenerating(false);
//     }
//   };

//   if (!cifData && !isGenerating) {
//     return (
//         <div className="h-[75vh] flex items-center justify-center transition-colors duration-500">
//             <div className="flex flex-col items-center gap-6 text-center max-w-lg">
//                 <BrainCircuit size={48} className="text-black/20 dark:text-white/20 mb-2" strokeWidth={1} />
//                 <h3 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter opacity-90">Result Viewer Clear</h3>
                
//                 {error && (
//                     <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 text-sm my-2 text-left w-full">
//                         <AlertTriangle size={18} className="shrink-0" />
//                         <span>{error}</span>
//                     </div>
//                 )}

//                 <p className="text-sm text-gray-500 font-mono uppercase tracking-widest leading-relaxed mt-2">
//                     Standby mode active.<br/> Return to <Link to="/generate" className="text-red-600 dark:text-red-500 hover:text-black dark:hover:text-white transition-colors border-b border-red-500/30 hover:border-black dark:hover:border-white pb-0.5">Configuration</Link> to initiate sequence.
//                 </p>
//             </div>
//         </div>
//     );
//   }

//   if (isGenerating) {
//     return (
//         <div className="h-[75vh] flex flex-col items-center justify-center gap-8 transition-colors duration-500">
//             <div className="w-24 h-24 rounded-full border-[4px] border-dashed border-red-600 dark:border-red-500 animate-[spin_3s_linear_infinite]"></div>
//             <h2 className="text-3xl font-bold text-gray-600 dark:text-gray-400 tracking-tight">Computing Atomic Lattice...</h2>
//         </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-[750px] w-full pb-10 px-6 transition-colors duration-500">
//         <div className="flex flex-col gap-5 h-full">
//             <div className="flex-[1.5] rounded-3xl bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-3xl border border-black/10 dark:border-white/10 shadow-xl dark:shadow-2xl flex items-center justify-center relative overflow-hidden min-h-[380px]">
//                 <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md flex items-center gap-2 z-20">
//                     <Box size={14}/> 3D Unit Cell Viewer
//                 </div>
                
//                 {/* --- 3. PASS THE THEME INTO THE RENDERER --- */}
//                 {cifData ? render3DModel(cifData) : (
//                     <div className="text-center p-5 z-10">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-500 mx-auto mb-4"></div>
//                         <p className="font-bold text-xl mb-2 text-black dark:text-white">Processing Geometry...</p>
//                     </div>
//                 )}
//                 {/* ------------------------------------------- */}

//             </div>
//             <div className="flex-[1] rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-3xl border border-black/10 dark:border-white/10 p-5 shadow-xl flex flex-col">
//                 <div className="text-red-600 dark:text-red-500 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
//                    <TerminalSquare size={14}/> Exact Prompt
//                 </div>
//                 <div className="flex-1 bg-white dark:bg-black/40 text-gray-800 dark:text-gray-300 p-4 rounded-xl text-sm font-mono whitespace-pre-wrap border border-black/5 dark:border-white/5 overflow-auto custom-scrollbar shadow-inner leading-relaxed">
//                     {exactPrompt}
//                 </div>
//             </div>
//         </div>

//         <div className="flex flex-col gap-5 h-full">
//             <div className="flex-none rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-3xl border border-black/10 dark:border-white/10 p-5 shadow-xl flex flex-col overflow-hidden">
//                 <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 pb-3 border-b border-black/10 dark:border-white/5">
//                    <ListTree size={16} className="text-red-600 dark:text-red-500"/> CIF Analytics
//                 </div>
//                 <div className="grid grid-cols-2 gap-3 font-mono text-sm">
//                     {extractedFeatures.map((feat, i) => (
//                     <div key={i} className="bg-white dark:bg-white/[0.02] p-3.5 rounded-xl border border-black/5 dark:border-white/5 break-all shadow-sm group hover:border-red-500/30 transition-all">
//                         <span className="text-red-600 dark:text-red-500 font-bold block mb-1 text-[10px] uppercase tracking-wider opacity-80">{feat.key}</span>
//                         <div className="text-black dark:text-white font-bold">{feat.value}</div>
//                     </div>
//                     ))}
//                 </div>
//             </div>

//             <div className="flex-1 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-3xl border border-black/10 dark:border-white/10 p-5 shadow-xl flex flex-col overflow-hidden min-h-[350px]">
//                 <div className="flex justify-between items-center mb-3 border-b border-black/10 dark:border-white/5 pb-3">
//                     <div className="text-red-600 dark:text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
//                        <DatabaseZap size={14}/> Generated Raw CIF
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-all text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">
//                             {copied ? <Check size={12} className="text-green-600 dark:text-green-400"/> : <Clipboard size={12}/>}
//                             {copied ? 'Copied' : 'Copy'}
//                         </button>
//                         <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-600/20 border border-red-200 dark:border-red-500/30 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-600/30 transition-all">
//                             <Download size={12}/> Download .cif
//                         </button>
//                     </div>
//                 </div>
//                 <div className="flex-1 bg-white dark:bg-black/60 text-gray-800 dark:text-gray-300 p-5 rounded-xl border border-black/5 dark:border-white/5 text-sm font-mono overflow-auto custom-scrollbar whitespace-pre-wrap shadow-inner leading-relaxed tracking-normal">
//                   {cifData}
//                 </div>
//             </div>
//         </div>
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Box, BrainCircuit, DatabaseZap, TerminalSquare, ListTree, Download, Clipboard, Check, AlertTriangle, Upload } from 'lucide-react';

export default function Result() {
  const location = useLocation();
  const hasFetched = useRef(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cifData, setCifData] = useState(null);
  const [exactPrompt, setExactPrompt] = useState(null);
  const [extractedFeatures, setExtractedFeatures] = useState([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const state = location.state;
    if (!state) return;
    
    // Wipe history to prevent double-fires on refresh
    window.history.replaceState({}, document.title);

    if (state.isNewGeneration && state.formData && !hasFetched.current) {
        hasFetched.current = true;
        generateCrystal(state.formData);
    } else if (state.cifData) {
        const cleanedCIF = formatCIF(state.cifData);
        setCifData(cleanedCIF);
        setExactPrompt(getExactPrompt(state.formula, state.targetEnergy, state.spaceGroup));
        extractFeatures(cleanedCIF);
    }
  }, [location.state]);

  const formatCIF = (raw) => {
    if (!raw) return "";
    let s = raw;
    s = s.replace(/\s*(loop_)\s*/gi, '\n\n$1\n');
    s = s.replace(/([^\n])\s+(_[a-zA-Z0-9_]+)/g, '$1\n$2');
    s = s.replace(/(_[a-zA-Z0-9_]+)(['"])/g, '$1 $2');
    const tagsToBreak = ['_symmetry_space_group', '_cell_length', '_cell_angle', '_chemical_formula', '_cell_volume', '_cell_formula_units', '_symmetry_Int_Tables_number'];
    tagsToBreak.forEach(tag => {
        const reg = new RegExp(`(${tag})`, 'g');
        s = s.replace(reg, '\n$1');
    });
    s = s.replace(/(\d\.)\s+/g, '$1'); 
    let prev;
    do { prev = s; s = s.replace(/(\.\d+)\s+(\d{2,})(?!\.)/g, '$1$2'); } while (s !== prev);
    return s.trim().replace(/\n{3,}/g, '\n\n'); 
  };

  const handleCopy = () => { navigator.clipboard.writeText(cifData); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([cifData], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "crystal_structure.cif";
    document.body.appendChild(element); element.click();
  };

  const getExactPrompt = (formula, energy, spaceGroup) => `[CONTEXT]\n- The material ${formula || "structure"} is stable.\n\n[TASK]\nGenerate a valid CIF structure.\n\n[CIF START]`;

  const extractFeatures = (text) => {
    const keys = ['_cell_length_a', '_cell_length_b', '_cell_length_c', '_cell_angle_alpha', '_cell_angle_beta', '_cell_angle_gamma', '_cell_volume', '_chemical_formula_sum'];
    const found = [];
    keys.forEach(key => {
      const idx = text.indexOf(key);
      if (idx !== -1) {
        const val = text.slice(idx + key.length).trim().split(/[\n]/)[0].replace(/['"]/g, '').trim();
        if (val) found.push({ key, value: val });
      }
    });
    setExtractedFeatures(found);
  };

  // --- NEW: Handle Local CIF Uploads ---
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const cleaned = formatCIF(text);
        setCifData(cleaned);
        setExactPrompt(`[LOCAL IMPORT]\nFile: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\n\nThis structure was imported manually and bypassing the live generation engine.`);
        extractFeatures(cleaned);
    };
    reader.readAsText(file);
  };
  // -------------------------------------

  const render3DModel = (cifText) => {
    if (!cifText) return null;
    const safeCif = encodeURIComponent(cifText);
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://3Dmol.org/build/3Dmol-min.js"></script>
            <style> 
                body { margin: 0; padding: 0; overflow: hidden; background-color: #ffffff; font-family: ui-sans-serif, system-ui, sans-serif; }
                .legend { position: absolute; bottom: 20px; right: 20px; display: flex; gap: 4px; z-index: 100; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 6px; overflow: hidden; }
                .legend-item { padding: 8px 18px; font-weight: 800; font-size: 14px; text-align: center; min-width: 30px; border-radius: 4px;}
                
                .controls { position: absolute; top: 20px; right: 20px; display: flex; gap: 8px; z-index: 100; }
                .control-btn { 
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; 
                    padding: 8px 16px; font-weight: 600; font-size: 13px; color: #334155;
                    cursor: pointer; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                    transition: all 0.2s; display: flex; align-items: center; gap: 6px;
                }
                .control-btn:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
                .control-btn:active { transform: translateY(0px); box-shadow: none; }
            </style>
        </head>
        <body>
            <div id="viewer" style="width: 100vw; height: 100vh; position: absolute; top: 0; left: 0;"></div>
            
            <div class="controls">
                <button id="btn-reset" class="control-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Reset View
                </button>
                <button id="btn-download" class="control-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download PNG
                </button>
            </div>

            <div class="legend" id="dynamic-legend"></div>
            
            <script>
                let cif = decodeURIComponent("${safeCif}");
                let viewer = $3Dmol.createViewer("viewer", { backgroundColor: "#ffffff", antialias: true, preserveDrawingBuffer: true });
                
                let model = viewer.addModel(cif, "cif");
                let atoms = model.selectedAtoms({});
                
                let elementColors = {};
                let uniqueElements = [];
                
                atoms.forEach(a => {
                    if (!elementColors[a.elem]) {
                        uniqueElements.push(a.elem);
                        let colorInt = ($3Dmol.elementColors.Jmol && $3Dmol.elementColors.Jmol[a.elem]) || 0x888888;
                        elementColors[a.elem] = '#' + ("000000" + colorInt.toString(16)).slice(-6);
                    }
                });
                
                viewer.setStyle({}, { 
                    sphere: { colorscheme: "Jmol", scale: 0.35 } 
                });

                const bondRadius = 0.09; 

                atoms.forEach((atom1, i) => {
                    atoms.forEach((atom2, j) => {
                        if (i < j) {
                            let dx = atom1.x - atom2.x;
                            let dy = atom1.y - atom2.y;
                            let dz = atom1.z - atom2.z;
                            let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                            
                            let maxDist = (atom1.elem === atom2.elem) ? 2.4 : 3.9;
                            
                            if (dist > 0.1 && dist < maxDist) {
                                let midX = (atom1.x + atom2.x) / 2;
                                let midY = (atom1.y + atom2.y) / 2;
                                let midZ = (atom1.z + atom2.z) / 2;
                                
                                viewer.addCylinder({
                                    start: {x: atom1.x, y: atom1.y, z: atom1.z},
                                    end: {x: midX, y: midY, z: midZ},
                                    radius: bondRadius,
                                    color: elementColors[atom1.elem] 
                                });
                                
                                viewer.addCylinder({
                                    start: {x: midX, y: midY, z: midZ},
                                    end: {x: atom2.x, y: atom2.y, z: atom2.z},
                                    radius: bondRadius,
                                    color: elementColors[atom2.elem] 
                                });
                            }
                        }
                    });
                });
                
                viewer.addUnitCell({ box: { color: "#333333", hidden: false } });
                
                document.getElementById('viewer').addEventListener('wheel', (e) => {
                    e.stopPropagation(); e.preventDefault();
                    const sensitivity = 1.05; 
                    const factor = e.deltaY > 0 ? (1 / sensitivity) : sensitivity; 
                    viewer.zoom(factor);
                }, { capture: true, passive: false });
                
                // --- THE TRUE RESET FIX ---
                // 1. Calculate the perfect initial framing
                viewer.center(); 
                viewer.zoomTo(); 
                viewer.zoom(0.7); 
                viewer.render();
                
                // 2. Take a snapshot of this perfect camera state!
                const defaultView = viewer.getView();
                
                // 3. When the button is clicked, snap back to the snapshot (fixes rotation AND zoom!)
                document.getElementById('btn-reset').addEventListener('click', () => {
                    viewer.setView(defaultView);
                    viewer.render();
                });
                
                document.getElementById('btn-download').addEventListener('click', () => {
                    viewer.render(); 
                    let imgData = viewer.pngURI();
                    let link = document.createElement('a');
                    link.download = 'AI_Crystal_Structure.png';
                    link.href = imgData;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });

                let legendContainer = document.getElementById('dynamic-legend');
                if (legendContainer) {
                    legendContainer.innerHTML = ''; 
                    uniqueElements.forEach(el => {
                        let div = document.createElement('div');
                        div.className = 'legend-item';
                        div.style.backgroundColor = elementColors[el];
                        div.style.color = '#ffffff';
                        div.style.textShadow = '0px 1px 2px rgba(0,0,0,0.6)';
                        div.innerText = el;
                        legendContainer.appendChild(div);
                    });
                }
            </script>
        </body>
        </html>
    `;
    
    return (
        <iframe style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0, zIndex: 10 }} srcDoc={htmlContent} title="3D Crystal Viewer" />
    );
  };

  const generateCrystal = async (formData) => {
    setIsGenerating(true);
    setError(null);
    try {
        const storedUser = JSON.parse(localStorage.getItem('crystallm_user'));
        const token = storedUser?.token;
        if (!token) { setError("Authentication error. Please log in again."); setIsGenerating(false); return; }

        const response = await fetch(`http://localhost:5000/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ formula: formData.formula, targetEnergy: formData.targetEnergy, spaceGroup: formData.spaceGroup })
        });
        const data = await response.json();
        if (response.ok && data.status === 'success') {
            const cleaned = formatCIF(data.cifData);
            setCifData(cleaned);
            setExactPrompt(getExactPrompt(formData.formula, formData.targetEnergy, formData.spaceGroup));
            extractFeatures(cleaned);
        } else {
            setError(data.message || data.detail || "Generation failed due to physical instability.");
        }
    } catch (err) { setError("Network error. Could not connect to the Node.js server."); } finally { setIsGenerating(false); }
  };

  if (!cifData && !isGenerating) {
    return (
        <div className="h-[75vh] flex items-center justify-center transition-colors duration-500">
            <div className="flex flex-col items-center gap-6 text-center max-w-lg">
                <BrainCircuit size={48} className="text-black/20 dark:text-white/20 mb-2" strokeWidth={1} />
                <h3 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter opacity-90">Result Viewer</h3>
                
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 text-sm my-2 text-left w-full">
                        <AlertTriangle size={18} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <p className="text-sm text-gray-500 font-mono uppercase tracking-widest leading-relaxed mt-2 mb-4">
                    Standby mode active.<br/> Return to <Link to="/generate" className="text-red-600 dark:text-red-500 hover:text-black dark:hover:text-white transition-colors border-b border-red-500/30 hover:border-black dark:hover:border-white pb-0.5">Configuration</Link> to run a live generation, or upload a local CIF file below.
                </p>

                {/* --- THE NEW IMPORT BUTTON --- */}
                <label className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                    <Upload size={18} />
                    Import .CIF File
                    <input type="file" accept=".cif,.txt" className="hidden" onChange={handleFileUpload} />
                </label>
                {/* ----------------------------- */}
            </div>
        </div>
    );
  }

  if (isGenerating) {
    return (
        <div className="h-[75vh] flex flex-col items-center justify-center gap-8 transition-colors duration-500">
            <div className="w-24 h-24 rounded-full border-[4px] border-dashed border-red-600 dark:border-red-500 animate-[spin_3s_linear_infinite]"></div>
            <h2 className="text-3xl font-bold text-gray-600 dark:text-gray-400 tracking-tight">Computing Atomic Lattice...</h2>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-[750px] w-full pb-10 px-6 transition-colors duration-500">
        <div className="flex flex-col gap-5 h-full">
            <div className="flex-[1.5] rounded-3xl bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-3xl border border-black/10 dark:border-white/10 shadow-xl dark:shadow-2xl flex items-center justify-center relative overflow-hidden min-h-[380px]">
                <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md flex items-center gap-2 z-20">
                    <Box size={14}/> 3D Unit Cell Viewer
                </div>
                {cifData ? render3DModel(cifData) : (
                    <div className="text-center p-5 z-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-500 mx-auto mb-4"></div>
                        <p className="font-bold text-xl mb-2 text-black dark:text-white">Processing Geometry...</p>
                    </div>
                )}
            </div>
            <div className="flex-[1] rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-3xl border border-black/10 dark:border-white/10 p-5 shadow-xl flex flex-col">
                <div className="text-red-600 dark:text-red-500 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                   <TerminalSquare size={14}/> Generation Context
                </div>
                <div className="flex-1 bg-white dark:bg-black/40 text-gray-800 dark:text-gray-300 p-4 rounded-xl text-sm font-mono whitespace-pre-wrap border border-black/5 dark:border-white/5 overflow-auto custom-scrollbar shadow-inner leading-relaxed">
                    {exactPrompt}
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-5 h-full">
            <div className="flex-none rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-3xl border border-black/10 dark:border-white/10 p-5 shadow-xl flex flex-col overflow-hidden">
                <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 pb-3 border-b border-black/10 dark:border-white/5">
                   <ListTree size={16} className="text-red-600 dark:text-red-500"/> CIF Analytics
                </div>
                <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                    {extractedFeatures.map((feat, i) => (
                    <div key={i} className="bg-white dark:bg-white/[0.02] p-3.5 rounded-xl border border-black/5 dark:border-white/5 break-all shadow-sm group hover:border-red-500/30 transition-all">
                        <span className="text-red-600 dark:text-red-500 font-bold block mb-1 text-[10px] uppercase tracking-wider opacity-80">{feat.key}</span>
                        <div className="text-black dark:text-white font-bold">{feat.value}</div>
                    </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-3xl border border-black/10 dark:border-white/10 p-5 shadow-xl flex flex-col overflow-hidden min-h-[350px]">
                <div className="flex justify-between items-center mb-3 border-b border-black/10 dark:border-white/5 pb-3">
                    <div className="text-red-600 dark:text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                       <DatabaseZap size={14}/> Raw Output
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-all text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">
                            {copied ? <Check size={12} className="text-green-600 dark:text-green-400"/> : <Clipboard size={12}/>}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                        <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-600/20 border border-red-200 dark:border-red-500/30 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-600/30 transition-all">
                            <Download size={12}/> Download .cif
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-white dark:bg-black/60 text-gray-800 dark:text-gray-300 p-5 rounded-xl border border-black/5 dark:border-white/5 text-sm font-mono overflow-auto custom-scrollbar whitespace-pre-wrap shadow-inner leading-relaxed tracking-normal">
                  {cifData}
                </div>
            </div>
        </div>
    </div>
  );
}