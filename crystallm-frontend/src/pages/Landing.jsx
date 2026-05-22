// import React, { useRef } from 'react';
// import gsap from 'gsap';
// import { useGSAP } from '@gsap/react';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { ChevronDown, ArrowRight, Box } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// gsap.registerPlugin(ScrollTrigger);

// // ==========================================
// // CUSTOM HELPER: Splits text into individual letters
// // ==========================================
// const SplitText = ({ text }) => {
//   return text.split("").map((char, i) => (
//     char === " " 
//       ? <span key={i}> </span> 
//       : <span key={i} className="reveal-letter opacity-[0.15]">{char}</span>
//   ));
// };

// export default function Landing() {
//   const containerRef = useRef();
//   const titleRef = useRef();
//   const sectionTwoRef = useRef(); 
//   const navigate = useNavigate();

//   useGSAP(() => {
//     if (!titleRef.current) return;
    
//     // 1. Title Scaling
//     const getScale = () => {
//       const currentFontSize = parseFloat(window.getComputedStyle(titleRef.current).fontSize);
//       return 30 / currentFontSize;
//     };
    
//     gsap.to(titleRef.current, {
//       scrollTrigger: { trigger: containerRef.current, start: "top top", end: () => "+=" + window.innerHeight, scrub: 1, invalidateOnRefresh: true },
//       top: "48px", scale: getScale, ease: "power2.inOut"
//     });
    
//     // 2. Section 1 Content Fade Out
//     gsap.to(".fade-content", {
//       scrollTrigger: { trigger: containerRef.current, start: "top top", end: "+=40%", scrub: true },
//       opacity: 0, y: -30
//     });

//     // 3. LETTER-BY-LETTER SEQUENTIAL FADE IN
//     gsap.to(".reveal-letter", {
//       scrollTrigger: {
//         trigger: sectionTwoRef.current,
//         start: "top 80%",     // Starts when section hits 80% down the screen
//         end: "top 30%",       // Finishes when section hits 30% down
//         scrub: 0.5,           // Smooth, snappy scroll tracking
//       },
//       opacity: 1,             
//       stagger: 0.1,          // The magic stagger that lights them up sequentially
//       ease: "power1.out"
//     });

//     // 4. Fade in the button smoothly alongside the text
//     gsap.from(".reveal-button", {
//       scrollTrigger: {
//         trigger: sectionTwoRef.current,
//         start: "top 50%",
//         end: "center 50%",
//         scrub: 0.5
//       },
//       opacity: 0.1,
//       y: 20
//     });

//   }, { scope: containerRef });

//   return (
//     <div ref={containerRef} className="w-full min-h-[200vh] overflow-x-hidden transition-colors duration-500">
      
//       <h1 ref={titleRef} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12vw] font-black tracking-tight leading-none m-0 p-0 z-[100] origin-center drop-shadow-2xl whitespace-nowrap text-black dark:text-white transition-colors duration-500">
//         CrystaLLM
//       </h1>

//       <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] flex flex-col items-center pointer-events-none w-full fade-content">
//         <p className="mt-[18vw] text-xs md:text-sm font-mono uppercase tracking-[0.6em] text-gray-500 dark:text-gray-400">
//           Crystal Structure Generation
//         </p>
//       </div>

//       <section className="h-screen w-full relative">
//         <div className="absolute top-40 left-12 z-10 fade-content pointer-events-none text-black dark:text-white">
//           <h2 className="text-[4vw] font-medium leading-none tracking-tight">Autoregressive<br />Generation</h2>
//         </div>

//         <div className="absolute bottom-12 left-12 z-10 fade-content max-w-sm pointer-events-none">
//           <h3 className="text-3xl font-medium leading-tight mb-6 text-black dark:text-white">Your solution to<br />complex lattices</h3>
//           <div className="w-8 h-[1px] bg-black/30 dark:bg-white/30 mb-6"></div>
//           <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
//             Predicting stable crystal structures from chemical composition alone is computationally expensive and slow. We leverage LLMs to bypass traditional quantum mechanics, finding stability instantly.
//           </p>
//         </div>

//         <div className="absolute bottom-12 right-12 z-10 fade-content w-full max-w-[500px] pointer-events-none flex flex-col items-end">
//           <h2 className="text-[4vw] font-medium leading-none tracking-tight text-right mb-16 text-black dark:text-white">Absolute<br />Precision</h2>
//           <div className="flex items-center justify-between w-full border-t border-black/20 dark:border-white/20 pt-5 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
//             <div className="flex items-center gap-3 animate-pulse text-red-600 dark:text-red-500">
//               <ChevronDown size={14} className="animate-bounce" />
//               <span>Scroll Down</span>
//             </div>
//             <span className="text-gray-500">To Start The Sequence</span>
//           </div>
//         </div>
//       </section>

//       {/* --- Section 2 --- */}
//       <section className="min-h-screen flex items-center justify-center relative z-10 px-12 lg:px-24 bg-transparent transition-colors duration-500">
        
//         <div ref={sectionTwoRef} className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-16">
          
//           <div className="w-full lg:w-3/5 space-y-8 text-left">
            
//             {/* SplitText applied to Header */}
//             <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter text-black dark:text-white">
//               <SplitText text="Engineering at the " />
//               <span className="text-red-600 dark:text-red-500 font-normal italic">
//                 <SplitText text="atomic scale." />
//               </span>
//             </h2>

//             {/* SplitText applied to Paragraphs */}
//             <div className="space-y-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium max-w-2xl">
//               <p>
//                 <SplitText text="Forging stable crystalline structures requires traversing an infinite chemical space. Traditional quantum mechanics and density functional theory (DFT) simulations create an insurmountable computational bottleneck." />
//               </p>
//               <p>
//                 <SplitText text="By leveraging " />
//                 <span className="text-black dark:text-white font-bold tracking-wide">
//                   <SplitText text="Autoregressive Large Language Models " />
//                 </span>
//                 <SplitText text="trained on vast material databases, CrystaLLM bypasses physics-based constraints to predict absolute lattice stability in milliseconds." />
//               </p>
//             </div>
            
//           </div>

//           <div className="w-full lg:w-2/5 flex justify-center lg:justify-end items-center">
//             <button 
//               onClick={() => navigate('/generate')}
//               className="reveal-button px-12 py-5 rounded-full font-bold text-lg bg-black text-white hover:bg-red-600 dark:bg-white dark:text-black dark:hover:bg-red-600 dark:hover:text-white active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] group"
//             >
//               Start Generation <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
//             </button>
//           </div>

//         </div>

//         <div className="absolute bottom-12 right-12 lg:right-24 w-full max-w-[400px]">
//           <div className="w-full border-t border-black/20 dark:border-white/20 pt-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
//             <span className="text-gray-500">Made By</span>
//             <div className="flex items-center gap-2 text-black dark:text-white">
//               <span>Team-G952</span>
//               <Box size={12} className="text-red-600 dark:text-red-500 opacity-80" />
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, ArrowRight, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// CUSTOM HELPER: Splits text into individual letters
// ==========================================
const SplitText = ({ text }) => {
  return text.split("").map((char, i) => (
    char === " " 
      ? <span key={i}> </span> 
      : <span key={i} className="reveal-letter opacity-[0.15]">{char}</span>
  ));
};

export default function Landing() {
  const containerRef = useRef();
  const titleRef = useRef();
  const sectionTwoRef = useRef();
  const navigate = useNavigate();

  useGSAP(() => {
    if (!titleRef.current) return;
    
    // 1. Title Scaling
    const getScale = () => {
      const currentFontSize = parseFloat(window.getComputedStyle(titleRef.current).fontSize);
      return 30 / currentFontSize;
    };
    
    gsap.to(titleRef.current, {
      scrollTrigger: { trigger: containerRef.current, start: "top top", end: () => "+=" + window.innerHeight, scrub: 1, invalidateOnRefresh: true },
      top: "48px", scale: getScale, ease: "power2.inOut"
    });
    
    // 2. Section 1 Content Fade Out
    gsap.to(".fade-content", {
      scrollTrigger: { trigger: containerRef.current, start: "top top", end: "+=40%", scrub: true },
      opacity: 0, y: -30
    });

    // 3. FASTER Letter-by-Letter Sequential Fade In
    gsap.to(".reveal-letter", {
      scrollTrigger: {
        trigger: sectionTwoRef.current,
        start: "top 80%",     
        end: "top 30%",       // Finishes earlier in the scroll (makes it faster overall)
        scrub: 0.5,           // Reduced from 1 (less scroll lag, more snappy)
      },
      opacity: 1,             
      stagger: 0.1,          // Reduced from 0.1 (lightning fast letter-to-letter transition)
      ease: "power1.out"
    });

    // 4. Fade in the button smoothly after the text
    gsap.from(".reveal-button", {
      scrollTrigger: {
        trigger: sectionTwoRef.current,
        start: "top 40%",
        end: "center 50%",
        scrub: 0.5
      },
      opacity: 0,
      y: 20
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full min-h-[200vh] overflow-x-hidden transition-colors duration-500">
      
      <h1 ref={titleRef} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12vw] font-black tracking-tight leading-none m-0 p-0 z-[100] origin-center drop-shadow-2xl whitespace-nowrap text-black dark:text-white transition-colors duration-500">
        CrystaLLM
      </h1>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] flex flex-col items-center pointer-events-none w-full fade-content">
        <p className="mt-[18vw] text-xs md:text-sm font-mono uppercase tracking-[0.6em] text-gray-500 dark:text-gray-400">
          Crystal Structure Generation
        </p>
      </div>

      <section className="h-screen w-full relative">
        <div className="absolute top-40 left-12 z-10 fade-content pointer-events-none text-black dark:text-white">
          <h2 className="text-[4vw] font-medium leading-none tracking-tight">Autoregressive<br />Generation</h2>
        </div>

        <div className="absolute bottom-12 left-12 z-10 fade-content max-w-sm pointer-events-none">
          <h3 className="text-3xl font-medium leading-tight mb-6 text-black dark:text-white">Your solution to<br />complex lattices</h3>
          <div className="w-8 h-[1px] bg-black/30 dark:bg-white/30 mb-6"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
            Predicting stable crystal structures from chemical composition alone is computationally expensive and slow. We leverage LLMs to bypass traditional quantum mechanics, finding stability instantly.
          </p>
        </div>

        <div className="absolute bottom-12 right-12 z-10 fade-content w-full max-w-[500px] pointer-events-none flex flex-col items-end">
          <h2 className="text-[4vw] font-medium leading-none tracking-tight text-right mb-16 text-black dark:text-white">Absolute<br />Precision</h2>
          <div className="flex items-center justify-between w-full border-t border-black/20 dark:border-white/20 pt-5 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
            <div className="flex items-center gap-3 animate-pulse text-red-600 dark:text-red-500">
              <ChevronDown size={14} className="animate-bounce" />
              <span>Scroll Down</span>
            </div>
            <span className="text-gray-500">To Start The Sequence</span>
          </div>
        </div>
      </section>

      {/* --- Section 2 --- */}
      <section className="min-h-screen flex items-center justify-center relative z-10 px-12 lg:px-24 bg-transparent transition-colors duration-500">
        
        <div ref={sectionTwoRef} className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-16">
          
          <div className="w-full lg:w-3/5 space-y-8 text-left">
            
            {/* SplitText applied to Header */}
            <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter text-black dark:text-white">
              <SplitText text="Engineering at the " />
              <span className="text-red-600 dark:text-red-500 font-normal italic">
                <SplitText text="atomic scale." />
              </span>
            </h2>

            {/* SplitText applied to Paragraphs */}
            <div className="space-y-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium max-w-2xl">
              <p>
                <SplitText text="Forging stable crystalline structures requires traversing an infinite chemical space. Traditional quantum mechanics and density functional theory (DFT) simulations create an insurmountable computational bottleneck." />
              </p>
              <p>
                <SplitText text="By leveraging " />
                <span className="text-black dark:text-white font-bold tracking-wide">
                  <SplitText text="Autoregressive Large Language Models " />
                </span>
                <SplitText text="trained on vast material databases, CrystaLLM bypasses physics-based constraints to predict absolute lattice stability in milliseconds." />
              </p>
            </div>

          </div>

          <div className="w-full lg:w-2/5 flex justify-center lg:justify-end items-center">
            <button 
              onClick={() => navigate('/generate')}
              className="reveal-button px-12 py-5 rounded-full font-bold text-lg bg-black text-white hover:bg-red-600 dark:bg-white dark:text-black dark:hover:bg-red-600 dark:hover:text-white active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] group"
            >
              Start Generation <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        <div className="absolute bottom-12 right-12 lg:right-24 w-full max-w-[400px]">
          <div className="w-full border-t border-black/20 dark:border-white/20 pt-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
            <span className="text-gray-500">Made By</span>
            <div className="flex items-center gap-2 text-black dark:text-white">
              <span>Team-G952</span>
              <Box size={12} className="text-red-600 dark:text-red-500 opacity-80" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}