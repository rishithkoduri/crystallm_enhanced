import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Search, History as HistoryIcon, Sun, Moon, UserCircle, Settings as SettingsIcon, Box } from 'lucide-react';

// Authentication Context & Pages
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Result from './pages/Result';
import History from './pages/History';
import Auth from './pages/Auth';
import Settings from './pages/Settings'; // NEW

// --- IMAGES ---
import crystallmNetworkBg from './assets/crystallm_network_bg_1.jpg';
import crystallmNetworkBgLight from './assets/crystallm_network_bg_light.jpg'; 

// --- PROTECTED ROUTE WRAPPER ---
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

function AppLayout() {
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const isAuthPage = location.pathname === '/auth';
  const isHome = location.pathname === '/';

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate parallax offsets
  const xOffset = (mousePos.x - window.innerWidth / 2) * 0.02; 
  const yOffset = (mousePos.y - window.innerHeight / 2) * 0.02;

  // DYNAMIC GLOBAL TOGGLE & BODY STYLE 
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#010101'; 
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f1f1f1'; 
      document.body.style.color = '#000000';
    }
  }, [darkMode]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Box },
    { name: 'Generate', path: '/generate', icon: Search },
    { name: 'Result', path: '/result', icon: Box },
    { name: 'History', path: '/history', icon: HistoryIcon },
  ];

  return (
    <div className="min-h-screen relative transition-colors duration-500 overflow-x-hidden">
      
      {/* --- GLOBAL, MOUSE-TRACKED BACKGROUND --- */}
      <div 
        className="fixed inset-0 w-full h-full z-[-1] pointer-events-none transition-transform duration-100 ease-linear"
        style={{
          backgroundImage: `url(${darkMode ? crystallmNetworkBg : crystallmNetworkBgLight})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          transform: `translate3d(${xOffset}px, ${yOffset}px, 0)`,
        }}
      >
        <div className={`absolute inset-0 transition-colors duration-500 ${darkMode ? 'bg-black/70' : 'bg-transparent'}`}></div>
      </div>

      {/* --- HEADER (Completely Transparent) --- */}
      {!isAuthPage && (
        <header className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-10 z-50 bg-transparent">
          
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon; 
              return (
                <NavLink 
                  key={link.path}
                  to={link.path}
                  end
                  className={({ isActive }) => {
                    const baseClass = "flex items-center gap-2 text-sm font-bold transition-all duration-300 group";
                    if (isActive) return `${baseClass} text-red-600 dark:text-red-500`;
                    return `${baseClass} text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white`;
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={`transition-all duration-300 ${isActive ? 'opacity-100 text-red-600 dark:text-red-500' : 'opacity-50 group-hover:opacity-100 group-hover:text-red-500'}`} />
                      {link.name}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-100 pointer-events-none ${isHome ? 'opacity-0' : 'opacity-100'}`}>
            <h1 className="text-[30px] font-black tracking-tighter leading-none m-0 p-0 text-black dark:text-white transition-colors duration-500">
              CrystaLLM
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setDarkMode(!darkMode)} className="transition-colors p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user ? (
              <>
                <NavLink to="/settings" className="flex items-center gap-2 group transition-colors text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
                  <SettingsIcon size={18} className="group-hover:rotate-90 transition-transform duration-500"/>
                  <span className="font-bold text-sm hidden lg:block">Settings</span>
                </NavLink>

                <div className="flex items-center gap-4 pl-6 border-l border-black/10 dark:border-white/10 transition-colors">
                  <div className="text-right">
                    <p className="font-bold text-sm text-black dark:text-gray-200">{user.name}</p>
                    <button onClick={logout} className="text-[10px] text-red-600 dark:text-red-500 font-mono font-bold tracking-wide uppercase hover:text-black dark:hover:text-white transition-colors">
                      Terminate Session
                    </button>
                  </div>
                  
                  {/* NEW: Display Profile Pic if it exists! */}
                  {user.profilePic ? (
                      <img 
                          src={user.profilePic} 
                          alt="Profile" 
                          className="w-[38px] h-[38px] rounded-full object-cover border-2 border-black/10 dark:border-white/10 shadow-sm" 
                      />
                  ) : (
                      <UserCircle size={38} className="text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
                  )}
                  
                </div>
              </>
            ) : (
              <NavLink to="/auth" className="px-6 py-2 rounded-full font-bold text-sm bg-red-600 text-white hover:bg-black dark:hover:bg-white dark:hover:text-black transition-colors">
                Sign In
              </NavLink>
            )}
          </div>
        </header>
      )}

      {/* --- CONTENT AREA --- */}
      <main className="relative w-full">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* PROTECTED ROUTES */}
          <Route path="/generate" element={<ProtectedRoute><div className="pt-32"><Home /></div></ProtectedRoute>} />
          <Route path="/result" element={<ProtectedRoute><div className="pt-32"><Result /></div></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><div className="pt-32"><History /></div></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><div className="pt-32"><Settings /></div></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}