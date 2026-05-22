import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Upload, Trash2, AlertTriangle, X, Check, ZoomIn, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AvatarEditor from 'react-avatar-editor';

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- EDITOR STATE ---
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [scale, setScale] = useState(1.2);
  const [rotate, setRotate] = useState(0);
  const editorRef = useRef(null);

  // Triggered when user selects a file from their computer
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setEditorOpen(true); // Open the modal instead of uploading instantly
      setScale(1.2);
      setRotate(0);
    }
    e.target.value = null; // Reset input
  };

  // Triggered when user clicks "Save & Upload" inside the modal
  const handleSaveCrop = async () => {
    if (editorRef.current) {
      // Get the cropped image as a canvas, convert to Base64 (JPEG, 80% quality to save DB space)
      const canvasScaled = editorRef.current.getImageScaledToCanvas();
      const base64String = canvasScaled.toDataURL('image/jpeg', 0.8);

      setLoading(true); 
      setError('');
      setEditorOpen(false); // Close modal

      try {
        const res = await fetch(`http://localhost:5000/api/auth/profile-pic`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}` 
          },
          body: JSON.stringify({ profilePic: base64String })
        });
        
        const data = await res.json();
        if (res.ok) {
          updateUser({ profilePic: data.profilePic }); // Instantly updates UI globally!
        } else {
          setError(data.message || 'Failed to upload image.');
        }
      } catch (err) {
        setError('Network error. Could not upload image.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm("WARNING: Are you sure you want to permanently delete your account? All generation history will be wiped.");
    if (!confirm1) return;
    
    const confirm2 = window.prompt("Type 'DELETE' to confirm account termination.");
    if (confirm2 !== 'DELETE') return;

    try {
      const res = await fetch(`http://localhost:5000/api/auth/delete-account`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (res.ok) {
        logout();
        navigate('/');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete account.');
      }
    } catch (err) { setError('Network error during deletion.'); }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center px-6 pt-10 pb-24 transition-colors duration-500 relative">
      
      {/* --- IMAGE EDITOR MODAL OVERLAY --- */}
      {editorOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-200">
            
            <div className="w-full flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-black dark:text-white tracking-tight">Adjust Image</h3>
              <button onClick={() => setEditorOpen(false)} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-gray-500">
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border-2 border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 mb-6">
              <AvatarEditor
                ref={editorRef}
                image={selectedImage}
                width={250}
                height={250}
                border={30}
                borderRadius={125} // Makes the crop guide a circle!
                color={[0, 0, 0, 0.6]} // RGBA for the background outside the crop
                scale={scale}
                rotate={rotate}
              />
            </div>

            <div className="w-full space-y-5 mb-8 px-4">
              <div className="flex items-center gap-4">
                <ZoomIn size={18} className="text-gray-500 dark:text-gray-400 shrink-0" />
                <input 
                  type="range" min="1" max="3" step="0.01" value={scale} 
                  onChange={(e) => setScale(parseFloat(e.target.value))} 
                  className="w-full accent-red-600 dark:accent-red-500"
                />
              </div>
              <div className="flex items-center gap-4">
                <RotateCw size={18} className="text-gray-500 dark:text-gray-400 shrink-0" />
                <input 
                  type="range" min="0" max="360" step="1" value={rotate} 
                  onChange={(e) => setRotate(parseFloat(e.target.value))} 
                  className="w-full accent-red-600 dark:accent-red-500"
                />
              </div>
            </div>

            <button onClick={handleSaveCrop} className="w-full py-4 rounded-xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg">
              <Check size={18} /> Save & Upload Profile
            </button>
          </div>
        </div>
      )}
      {/* ---------------------------------- */}


      <div className="w-full max-w-2xl">
        
        <div className="mb-12 border-b border-black/10 dark:border-white/10 pb-8">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-black dark:text-white mb-2">
            Settings
          </h2>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest mt-5">
            Researcher Profile & Security
          </p>
        </div>

        {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono flex items-center gap-3">
                <AlertTriangle size={16} /> {error}
            </div>
        )}

        <div className="p-8 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 mb-8 flex flex-col sm:flex-row items-center gap-8 shadow-sm">
            <div className="relative group">
                {user?.profilePic ? (
                    <img src={user.profilePic} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-black/10 dark:border-white/10 shadow-xl" />
                ) : (
                    <UserCircle size={128} className="text-gray-300 dark:text-gray-700" strokeWidth={1} />
                )}
                
                <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                    <Upload size={24} className="text-white" />
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-black dark:text-white tracking-tight">{user?.name}</h3>
                <p className="text-sm font-mono text-gray-500 mb-4">{user?.email}</p>
                <button onClick={() => fileInputRef.current.click()} disabled={loading} className="px-5 py-2 rounded-lg font-bold text-xs bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors shadow-md">
                    {loading ? 'Processing...' : 'Upload New Image'}
                </button>
            </div>
        </div>

        <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30">
            <h3 className="text-red-600 dark:text-red-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                <AlertTriangle size={16} /> Danger Zone
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Permanently terminating your account will instantly wipe all generated crystal structures, saved CIF files, and your authorization credentials from the database. This action is irreversible.
            </p>
            <button onClick={handleDeleteAccount} className="px-6 py-3 rounded-xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-red-600/20">
                <Trash2 size={16} /> Terminate Account
            </button>
        </div>

      </div>
    </div>
  );
}