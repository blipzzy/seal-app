import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  serverTimestamp,
  updateDoc, 
  increment, 
  getDoc, 
  deleteDoc
} from 'firebase/firestore';
import { 
  MessageSquare, 
  ArrowBigUp, 
  ArrowBigDown, 
  Search, 
  Menu, 
  Plus, 
  User, 
  Home, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Lock, 
  Settings, 
  Edit3, 
  Check, 
  Trash2,
  ArrowLeft,
  CornerDownRight,
  Bell,
  BellOff,
  X,
  Sparkles,
  Palette,
  LogOut
} from 'lucide-react';

// --- Configuration & Themes ---
const THEMES = {
  standard: { 
    id: 'standard',
    name: 'Seel Classic', 
    primary: '#B7C9E2', 
    dark: '#8da5c4', 
    gradient: 'linear-gradient(135deg, #B7C9E2 0%, #8da5c4 100%)', 
    bgClass: 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100',
    sidebarClass: 'bg-white/80 border-r border-white/50'
  },
  ocean: { 
    id: 'ocean',
    name: 'Deep Ocean', 
    primary: '#38bdf8', 
    dark: '#0284c7', 
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', 
    bgClass: 'bg-gradient-to-br from-cyan-50 to-blue-100',
    sidebarClass: 'bg-white/60 border-r border-white/40'
  },
  sunset: { 
    id: 'sunset',
    name: 'Sunset', 
    primary: '#f472b6', 
    dark: '#db2777', 
    gradient: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)', 
    bgClass: 'bg-gradient-to-br from-orange-50 to-rose-100',
    sidebarClass: 'bg-white/60 border-r border-white/40'
  },
  mint: { 
    id: 'mint',
    name: 'Fresh Mint', 
    primary: '#34d399', 
    dark: '#059669', 
    gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', 
    bgClass: 'bg-gradient-to-br from-green-50 to-emerald-100',
    sidebarClass: 'bg-white/60 border-r border-white/40'
  },
  ballpit: { 
    id: 'ballpit',
    name: 'Seal Ballpit 🦭', 
    primary: '#818cf8', 
    dark: '#4f46e5', 
    gradient: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)', 
    bgClass: 'bg-slate-100', 
    sidebarClass: 'bg-white/90 border-r border-white/60 backdrop-blur-xl shadow-2xl'
  }
};

const BTN_ANIMATION = "transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95";

// --- Assets Config ---
const SEAL_AVATARS = [
  { id: 0, bg: '#B7C9E2', name: 'Classic' },
  { id: 1, bg: '#FFB7B2', name: 'Coral' },
  { id: 2, bg: '#B5EAD7', name: 'Mint' },
  { id: 3, bg: '#E2F0CB', name: 'Lime' },
  { id: 4, bg: '#FFDAC1', name: 'Peach' },
  { id: 5, bg: '#C7CEEA', name: 'Periwinkle' },
  { id: 6, bg: '#475569', name: 'Midnight' },
  { id: 7, bg: '#FCD34D', name: 'Golden' },
  { id: 8, bg: '#F472B6', name: 'Bubblegum' },
  { id: 9, bg: '#6EE7B7', name: 'Seafoam' },
];

const COMMUNITY_LOGOS = [
  { id: 0, bg: 'from-blue-400 to-blue-600', name: 'Classic' },
  { id: 1, bg: 'from-yellow-400 to-orange-500', name: 'Royal' },
  { id: 2, bg: 'from-purple-500 to-indigo-600', name: 'Gamer' },
  { id: 3, bg: 'from-pink-400 to-rose-500', name: 'Artistic' },
  { id: 4, bg: 'from-green-400 to-emerald-600', name: 'Nature' },
  { id: 5, bg: 'from-slate-700 to-black', name: 'Tech' },
  { id: 6, bg: 'from-orange-400 to-red-600', name: 'Hot' },
  { id: 7, bg: 'from-cyan-400 to-blue-500', name: 'Vibes' },
];

// --- Firebase Initialization ---
// Note: We use window.__firebase_config here because it's injected by index.html
const firebaseConfig = JSON.parse(window.__firebase_config || '{}');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'default-app-id';

// --- Utils ---
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

// --- Components ---

function SealAvatar({ id, size = 'md', className = '' }) {
  const safeId = typeof id === 'number' ? id : 0;
  const config = SEAL_AVATARS[safeId] || SEAL_AVATARS[0];
  const sizeClasses = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16', xl: 'w-24 h-24', '2xl': 'w-32 h-32' };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative overflow-hidden shadow-inner ${className}`}
      style={{ backgroundColor: config.bg }}
      title={config.name}
    >
      <svg viewBox="0 0 100 100" className="w-[75%] h-[75%] opacity-90">
        <circle cx="30" cy="40" r="8" fill="#1e293b" />
        <circle cx="70" cy="40" r="8" fill="#1e293b" />
        <ellipse cx="50" cy="55" rx="12" ry="8" fill="#1e293b" />
        <path d="M20 55 L5 50 M20 60 L5 60 M80 55 L95 50 M80 60 L95 60" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <circle cx="25" cy="35" r="2" fill="white" />
        <circle cx="65" cy="35" r="2" fill="white" />
      </svg>
    </div>
  );
}

function CommunityLogo({ id, size = 'md', className = '' }) {
  const safeId = typeof id === 'number' ? id : 0;
  const config = COMMUNITY_LOGOS[safeId] || COMMUNITY_LOGOS[0];
  
  const sizeClasses = { 
    sm: 'w-6 h-6 rounded-md', 
    md: 'w-10 h-10 rounded-xl', 
    lg: 'w-16 h-16 rounded-2xl', 
    xl: 'w-24 h-24 rounded-3xl' 
  };

  return (
    <div 
      className={`${sizeClasses[size]} flex items-center justify-center relative overflow-hidden shadow-sm border border-white/20 bg-gradient-to-br ${config.bg} ${className}`}
      title={config.name}
    >
      <svg viewBox="0 0 100 100" className="w-[70%] h-[70%] opacity-90">
        <circle cx="30" cy="40" r="8" fill="#1e293b" />
        <circle cx="70" cy="40" r="8" fill="#1e293b" />
        <ellipse cx="50" cy="55" rx="12" ry="8" fill="#1e293b" />
        <path d="M20 55 L5 50 M20 60 L5 60 M80 55 L95 50 M80 60 L95 60" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <circle cx="25" cy="35" r="2" fill="white" />
        <circle cx="65" cy="35" r="2" fill="white" />
      </svg>
    </div>
  );
}

function SealBallpit() {
  const containerRef = useRef(null);
  const physicsState = useRef([]); 
  const [seals, setSeals] = useState([]); 

  useEffect(() => {
    const count = 15;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const newSeals = Array.from({ length: count }).map((_, i) => ({
      id: i,
      avatarId: Math.floor(Math.random() * 10),
      size: 60 + Math.random() * 60,
    }));
    
    physicsState.current = newSeals.map(s => ({
      ...s,
      x: Math.random() * (width - 150),
      y: Math.random() * (height - 150),
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      element: null
    }));

    setSeals(newSeals);
  }, []);

  useEffect(() => {
    let animationFrameId;

    const update = () => {
      if (!containerRef.current) return;
      
      const { clientWidth: W, clientHeight: H } = containerRef.current;
      const entities = physicsState.current;

      for (let i = 0; i < entities.length; i++) {
        const s1 = entities[i];
        s1.x += s1.vx;
        s1.y += s1.vy;

        if (s1.x <= 0) { s1.x = 0; s1.vx *= -1; } 
        else if (s1.x + s1.size >= W) { s1.x = W - s1.size; s1.vx *= -1; }
        
        if (s1.y <= 0) { s1.y = 0; s1.vy *= -1; } 
        else if (s1.y + s1.size >= H) { s1.y = H - s1.size; s1.vy *= -1; }

        for (let j = i + 1; j < entities.length; j++) {
           const s2 = entities[j];
           const dx = (s1.x + s1.size/2) - (s2.x + s2.size/2);
           const dy = (s1.y + s1.size/2) - (s2.y + s2.size/2);
           const dist = Math.sqrt(dx*dx + dy*dy);
           const minDist = (s1.size/2 + s2.size/2);

           if (dist < minDist) {
             const angle = Math.atan2(dy, dx);
             const sin = Math.sin(angle);
             const cos = Math.cos(angle);
             const vx1 = s1.vx * cos + s1.vy * sin;
             const vy1 = s1.vy * cos - s1.vx * sin;
             const vx2 = s2.vx * cos + s2.vy * sin;
             const vy2 = s2.vy * cos - s2.vx * sin;
             const vx1Final = vx2;
             const vx2Final = vx1;
             s1.vx = vx1Final * cos - vy1 * sin;
             s1.vy = vy1 * cos + vx1Final * sin;
             s2.vx = vx2Final * cos - vy2 * sin;
             s2.vy = vy2 * cos + vx2Final * sin;
             const overlap = (minDist - dist) + 1; 
             const moveX = overlap * Math.cos(angle);
             const moveY = overlap * Math.sin(angle);
             s1.x += moveX / 2; s1.y += moveY / 2;
             s2.x -= moveX / 2; s2.y -= moveY / 2;
           }
        }

        if (s1.element) {
          s1.element.style.transform = `translate3d(${s1.x}px, ${s1.y}px, 0)`;
        }
      }
      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [seals]);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-slate-100">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 opacity-50"></div>
      {seals.map((seal, index) => (
        <div 
          key={seal.id}
          ref={(el) => { if (physicsState.current[index]) physicsState.current[index].element = el; }}
          className="absolute shadow-xl rounded-full will-change-transform"
          style={{ width: seal.size, height: seal.size, left: 0, top: 0 }}
        >
          <SealAvatar id={seal.avatarId} size="xl" className="w-full h-full" />
        </div>
      ))}
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group ${active ? 'bg-white text-slate-800 shadow-md transform scale-105' : 'text-slate-500 hover:bg-white/50 hover:text-slate-800 hover:pl-5'}`}>
      <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span><span>{label}</span>
    </button>
  );
}

function PostCard({ post, communityName, communityLogoId, onClickCommunity, currentUser, onDelete, onClickPost }) {
  const [vote, setVote] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isOwner = currentUser === post.author;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-[#B7C9E2] transition-all duration-300 shadow-sm hover:shadow-xl flex overflow-hidden group cursor-pointer" onClick={onClickPost}>
       <div className="w-12 bg-slate-50/50 flex flex-col items-center py-4 space-y-1 border-r border-slate-50">
          <button onClick={(e) => { e.stopPropagation(); setVote(vote === 1 ? 0 : 1); }} className={`p-1 rounded-lg hover:bg-slate-200 transition-colors ${vote === 1 ? 'text-orange-500' : 'text-slate-400'}`}><ArrowBigUp size={26} fill={vote === 1 ? "currentColor" : "none"} strokeWidth={1.5} /></button>
          <span className={`text-sm font-black ${vote === 1 ? 'text-orange-500' : vote === -1 ? 'text-indigo-500' : 'text-slate-700'}`}>{post.upvotes + vote}</span>
          <button onClick={(e) => { e.stopPropagation(); setVote(vote === -1 ? 0 : -1); }} className={`p-1 rounded-lg hover:bg-slate-200 transition-colors ${vote === -1 ? 'text-indigo-500' : 'text-slate-400'}`}><ArrowBigDown size={26} fill={vote === -1 ? "currentColor" : "none"} strokeWidth={1.5} /></button>
       </div>
       <div className="flex-1 p-5 relative">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center space-x-2 text-xs text-slate-500">
                <CommunityLogo id={communityLogoId} size="sm" />
                <span onClick={(e) => { e.stopPropagation(); onClickCommunity(post.communityId); }} className="font-bold text-slate-800 hover:underline cursor-pointer">s/{communityName}</span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center space-x-1"><SealAvatar id={post.authorAvatarId} size="sm" className="w-4 h-4" /><span>Posted by u/{post.author}</span></div>
                <span className="text-slate-300">•</span><span>Just now</span>
             </div>
             {isOwner && <button onClick={(e) => { e.stopPropagation(); if (confirmDelete) onDelete(); else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); }}} className={`p-1.5 rounded-lg transition-colors flex items-center space-x-1 ${confirmDelete ? 'bg-red-100 text-red-600' : 'text-slate-300 hover:bg-red-50 hover:text-red-500'}`} title="Delete Post"><Trash2 size={16} />{confirmDelete && <span className="text-[10px] font-bold">Confirm?</span>}</button>}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug tracking-tight">{post.title}</h3>
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{post.content}</div>
          <div className="flex items-center space-x-2 mt-4">
             <button className="flex items-center space-x-2 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors text-slate-500 text-xs font-bold"><MessageSquare size={18} /><span>{post.commentCount || 0} Comments</span></button>
          </div>
       </div>
    </div>
  );
}

function PostDetail({ post, comments, communityName, communityLogoId, currentUser, currentUserId, onDeletePost, onComment, onDeleteComment, onBack, theme }) {
    const [commentText, setCommentText] = useState('');
    return (
        <div className="space-y-4">
            <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 font-bold mb-4 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow transition-all">
                <X size={20} /><span>Close Comments</span>
            </button>
            <div className="pointer-events-none">
               <PostCard post={post} communityName={communityName} communityLogoId={communityLogoId} currentUser={currentUser} onDelete={onDeletePost} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex gap-4 mb-8">
                    <div className="mt-1"><CornerDownRight size={24} className="text-slate-300" /></div>
                    <div className="flex-1">
                        <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-slate-50 min-h-[100px] resize-none" placeholder="What are your thoughts?" />
                        <div className="flex justify-end mt-2"><button onClick={() => { onComment(commentText, post.id); setCommentText(''); }} disabled={!commentText.trim()} className={`px-6 py-2 rounded-xl font-bold text-white text-sm ${BTN_ANIMATION} ${!commentText.trim() ? 'opacity-50' : ''}`} style={{ background: theme.gradient }}>Comment</button></div>
                    </div>
                </div>
                <div className="space-y-4">
                    {comments.length === 0 ? <div className="text-center text-slate-400 py-4 text-sm font-medium">No comments yet. Be the first!</div> : comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 group">
                            <SealAvatar id={comment.authorAvatarId} size="sm" />
                            <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-slate-700">u/{comment.author}</span>
                                    {comment.authorId === currentUserId && <button onClick={() => onDeleteComment(comment.id, post.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>}
                                </div>
                                <p className="text-sm text-slate-600">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SearchResults({ query, posts, communities, onClickCommunity, onClickPost, currentUser, onDeletePost }) {
  const lowerQuery = query.toLowerCase();
  
  const matchingCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) || 
    c.description.toLowerCase().includes(lowerQuery)
  );

  const matchingPosts = posts.filter(p => 
    p.title.toLowerCase().includes(lowerQuery) || 
    p.content.toLowerCase().includes(lowerQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
          Communities matching "{query}"
        </h2>
        {matchingCommunities.length === 0 ? (
           <div className="text-slate-400 text-sm italic">No communities found.</div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {matchingCommunities.map(c => (
                <div key={c.id} onClick={() => onClickCommunity(c.id)} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-all group hover:border-blue-200">
                   <CommunityLogo id={c.logoId} size="md" />
                   <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 group-hover:text-blue-500 truncate">s/{c.name}</div>
                      <div className="text-xs text-slate-400 truncate">{c.description}</div>
                   </div>
                </div>
             ))}
           </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
          Posts matching "{query}"
        </h2>
        {matchingPosts.length === 0 ? (
           <div className="text-slate-400 text-sm italic">No posts found.</div>
        ) : (
           <div className="space-y-4">
             {matchingPosts.map(post => {
                const comm = communities.find(c => c.id === post.communityId);
                return (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    communityName={comm?.name || 'Unknown'}
                    communityLogoId={comm?.logoId}
                    onClickCommunity={(id) => onClickCommunity(id)}
                    currentUser={currentUser}
                    onDelete={() => onDeletePost(post.id)}
                    onClickPost={() => onClickPost(post.id)}
                  />
                );
             })}
           </div>
        )}
      </div>
    </div>
  );
}

function CommunityBanner({ community, isJoined, isSilenced, onToggleJoin, onToggleSilence, currentUser, onDelete, theme }) {
  const isOwner = currentUser === community.creator;
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="mb-6 relative">
       <div className="h-32 rounded-2xl bg-slate-300 w-full shadow-inner" style={{background: theme.gradient}}></div>
       <div className="bg-white/80 backdrop-blur-md px-8 pb-6 pt-2 rounded-2xl border border-white shadow-lg mx-4 -mt-12 flex items-end justify-between relative z-10">
          <div className="flex items-end gap-4">
             <div className="w-24 h-24 bg-white rounded-2xl p-1.5 shadow-md -mt-10"><CommunityLogo id={community.logoId} size="xl" className="w-full h-full" /></div>
             <div className="mb-2"><h1 className="text-3xl font-black text-slate-800 tracking-tight">s/{community.name}</h1><p className="text-sm text-slate-500 font-bold">s/{community.id}</p></div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {isJoined && (
                <button onClick={onToggleSilence} className={`p-3 rounded-xl border-2 transition-all ${isSilenced ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white text-blue-500 border-blue-100 hover:border-blue-200'}`} title={isSilenced ? "Unsilence Community" : "Silence Community"}>
                    {isSilenced ? <BellOff size={20} /> : <Bell size={20} />}
                </button>
            )}
            {isOwner && <button onClick={() => { if (confirmDelete) onDelete(); else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); }}} className={`px-4 py-3 rounded-xl font-bold text-sm border-2 transition-all ${confirmDelete ? 'bg-red-500 text-white border-red-500' : 'border-red-100 text-red-400 hover:border-red-200 hover:bg-red-50'}`}>{confirmDelete ? 'Confirm Delete?' : 'Delete'}</button>}
            <button onClick={onToggleJoin} className={`px-8 py-3 rounded-xl font-bold text-sm ${BTN_ANIMATION} ${isJoined ? 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300' : 'text-white shadow-lg shadow-blue-200'}`} style={{ background: isJoined ? 'white' : theme.gradient }}>{isJoined ? 'Joined' : 'Join Community'}</button>
          </div>
       </div>
    </div>
  );
}

function CreatePostForm({ communities, userProfile, onPost, onCancel, preSelectedCommunity, theme }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [communityId, setCommunityId] = useState(preSelectedCommunity || '');

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-2" style={{background: theme.gradient}}></div>
       <h2 className="text-2xl font-black text-slate-800 mb-6">Create a post</h2>
       <div className="space-y-5">
          <div>
            <select value={communityId} onChange={(e) => setCommunityId(e.target.value)} className="w-full sm:w-1/2 p-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 bg-slate-50">
              <option value="" disabled>Choose a community</option>
              {communities.map(c => <option key={c.id} value={c.id}>s/{c.name}</option>)}
            </select>
          </div>
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-slate-50 placeholder-slate-400"/>
          <textarea placeholder="What's on your mind?" value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-4 h-48 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none bg-slate-50 text-slate-700 font-medium"/>
          <div className="flex justify-end space-x-3 pt-2">
             <button onClick={onCancel} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
             <button onClick={() => onPost(title, content, communityId)} className={`px-8 py-3 rounded-xl font-bold text-white ${BTN_ANIMATION} ${(!title || !communityId) ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ background: theme.gradient }} disabled={!title || !communityId}>Post</button>
          </div>
       </div>
    </div>
  );
}

function CreateCommunityForm({ onCreate, onCancel, theme }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedLogo, setSelectedLogo] = useState(0);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2" style={{background: theme.gradient}}></div>
      <h2 className="text-2xl font-black text-slate-800 mb-6">Create a Community</h2>
      <div className="space-y-6">
        <div>
           <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
           <div className="relative group">
             <span className="absolute left-4 top-3.5 text-slate-400 font-bold group-focus-within:text-blue-300 transition-colors">s/</span>
             <input type="text" value={name} onChange={(e) => setName(e.target.value.replace(/\s+/g, ''))} className="w-full p-3 pl-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-slate-50 font-medium transition-all" maxLength={21} />
           </div>
           <p className="text-xs text-slate-400 mt-2 font-medium">{21 - name.length} characters remaining</p>
        </div>
        <div>
           <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
           <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 h-32 resize-none bg-slate-50" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-4">Choose a Logo</label>
          <div className="grid grid-cols-4 gap-3">
            {COMMUNITY_LOGOS.map((logo) => (
              <button key={logo.id} onClick={() => setSelectedLogo(logo.id)} className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedLogo === logo.id ? 'border-blue-300 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}><CommunityLogo id={logo.id} size="md" /><span className="text-[10px] font-bold text-slate-500">{logo.name}</span></button>
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-4">
           <button onClick={onCancel} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
           <button onClick={() => onCreate(name, desc, selectedLogo)} className={`px-8 py-3 rounded-xl font-bold text-white ${BTN_ANIMATION} ${(!name) ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ background: theme.gradient }} disabled={!name}>Create Community</button>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ userProfile, onUpdate, onLogout, theme, currentThemeId }) {
  const [bio, setBio] = useState(userProfile.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatarId || 0);
  const [selectedTheme, setSelectedTheme] = useState(currentThemeId || 'standard');

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl max-w-3xl mx-auto relative overflow-hidden animate-in slide-in-from-bottom-4">
      <div className="absolute top-0 left-0 w-full h-2" style={{background: theme.gradient}}></div>
      
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3"><Settings size={28} className="text-slate-400"/><h2 className="text-2xl font-black text-slate-800">Profile & Settings</h2></div>
        <button onClick={onLogout} className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"><LogOut size={18}/> Log Out</button>
      </div>

      <div className="space-y-10">
        {/* Appearance Section */}
        <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Palette size={16}/> Appearance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.values(THEMES).map((t) => (
                    <button 
                        key={t.id}
                        onClick={() => setSelectedTheme(t.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedTheme === t.id ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                        <div className="h-8 w-full rounded-lg mb-3" style={{background: t.gradient}}></div>
                        <div className="font-bold text-slate-700 text-sm">{t.name}</div>
                    </button>
                ))}
            </div>
        </section>

        {/* Avatar Section */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><User size={16}/> Identity</h3>
          <label className="block text-sm font-bold text-slate-700 mb-4">Choose your Avatar</label>
          <div className="grid grid-cols-5 gap-4">
            {SEAL_AVATARS.map((avatar) => (
              <button key={avatar.id} onClick={() => setSelectedAvatar(avatar.id)} className={`relative rounded-xl p-2 transition-all duration-200 flex flex-col items-center gap-2 group ${selectedAvatar === avatar.id ? 'bg-slate-50 ring-2 ring-blue-300' : 'hover:bg-slate-50'}`}><SealAvatar id={avatar.id} size="md" className="transition-transform group-hover:scale-110"/><span className="text-[10px] font-bold text-slate-500">{avatar.name}</span>{selectedAvatar === avatar.id && <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5"><Check size={12} /></div>}</button>
            ))}
          </div>
        </section>

        {/* Bio Section */}
        <section>
           <label className="block text-sm font-bold text-slate-700 mb-2">About (Bio)</label>
           <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 h-24 resize-none bg-slate-50 font-medium" placeholder="Tell the community about yourself..." maxLength={150} />
           <p className="text-xs text-slate-400 mt-2 text-right">{150 - bio.length} chars left</p>
        </section>

        <div className="flex justify-end pt-6 border-t border-slate-100">
           <button onClick={() => onUpdate(bio, selectedAvatar, selectedTheme)} className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 ${BTN_ANIMATION}`} style={{ background: theme.gradient }}><Edit3 size={16}/>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Auth State
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Data State
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [comments, setComments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // UI State
  const [view, setView] = useState('home'); 
  const [lastView, setLastView] = useState('home'); 
  const [currentCommunityId, setCurrentCommunityId] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState('standard'); 
  const [searchQuery, setSearchQuery] = useState('');

  const currentTheme = THEMES[theme] || THEMES.standard;

  // --- Auth & Data Effects ---

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth failed", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setLoadingAuth(false);
      if (u && !activeUser) {
         setView('login');
      }
    });
    return () => unsubscribe();
  }, [activeUser]);

  useEffect(() => {
    if (!activeUser) {
      setUserProfile(null);
      return;
    }

    const userDocRef = doc(db, 'artifacts', appId, 'users', activeUser.uid, 'profile', 'main');
    const unsub = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile(data);
        if (data.theme && THEMES[data.theme]) {
            setTheme(data.theme);
        }
        if (view === 'login') setView('home');
      }
    }, (err) => console.error("Profile sync error", err));

    return () => unsub();
  }, [activeUser]);

  useEffect(() => {
    if (!firebaseUser) return;

    const commsQuery = collection(db, 'artifacts', appId, 'public', 'data', 'communities');
    const unsubComms = onSnapshot(commsQuery, (snap) => {
      const comms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCommunities(comms);
    }, (err) => console.error("Comms sync error", err));

    const postsQuery = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
    const unsubPosts = onSnapshot(postsQuery, (snap) => {
      const changes = snap.docChanges();
      
      // Handle Notifications
      changes.forEach((change) => {
        if (change.type === 'added' && userProfile) {
            const data = change.doc.data();
            const postId = change.doc.id;
            
            const isRecent = data.timestamp?.seconds > (Date.now() / 1000) - 60;
            const isJoined = userProfile.joinedCommunities?.includes(data.communityId);
            const isSilenced = userProfile.silencedCommunities?.includes(data.communityId);
            const isMe = data.authorId === activeUser?.uid;

            if (isRecent && isJoined && !isSilenced && !isMe) {
                setNotifications(prev => [{
                    id: postId,
                    type: 'post',
                    communityId: data.communityId,
                    author: data.author,
                    title: data.title,
                    timestamp: Date.now()
                }, ...prev]);
            }
        }
      });

      const allPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      allPosts.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setPosts(allPosts);
      setLoadingData(false);
    }, (err) => console.error("Posts sync error", err));

    const commentsQuery = collection(db, 'artifacts', appId, 'public', 'data', 'comments');
    const unsubComments = onSnapshot(commentsQuery, (snap) => {
        const allComments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        allComments.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0)); 
        setComments(allComments);
    });

    return () => {
      unsubComms();
      unsubPosts();
      unsubComments();
    };
  }, [firebaseUser, userProfile]);

  // --- Actions ---

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = async (username, password) => {
    if (!username || !password) return showNotification("Please enter username and password", "error");
    try {
        const usernameRef = doc(db, 'artifacts', appId, 'public', 'data', 'usernames', username.toLowerCase());
        const usernameSnap = await getDoc(usernameRef);
        const genericError = "Password or username is incorrect";
        if (!usernameSnap.exists()) return showNotification(genericError, "error");
        const data = usernameSnap.data();
        if (data.passwordHash !== simpleHash(password)) return showNotification(genericError, "error");
        setActiveUser({ uid: data.uid, username: username });
        setView('home');
    } catch (e) { showNotification("Login error: " + e.message, "error"); }
  };

  const handleSignup = async (username, password) => {
    if (!firebaseUser) return;
    if (username.length < 3) return showNotification("Username must be at least 3 chars", "error");
    if (password.length < 4) return showNotification("Password must be at least 4 chars", "error");
    const cleanUsername = username.trim();
    const usernameId = cleanUsername.toLowerCase();
    try {
      const usernameRef = doc(db, 'artifacts', appId, 'public', 'data', 'usernames', usernameId);
      const usernameSnap = await getDoc(usernameRef);
      if (usernameSnap.exists()) return showNotification("Username is already taken", "error");
      await setDoc(usernameRef, { uid: firebaseUser.uid, originalName: cleanUsername, passwordHash: simpleHash(password) });
      await setDoc(doc(db, 'artifacts', appId, 'users', firebaseUser.uid, 'profile', 'main'), {
        username: cleanUsername, avatarId: 0, bio: '', theme: 'standard', joinedCommunities: [], silencedCommunities: [], createdAt: serverTimestamp()
      });
      setActiveUser({ uid: firebaseUser.uid, username: cleanUsername });
      setView('home');
    } catch (e) { showNotification("Failed to create profile", "error"); }
  };

  const handleLogout = async () => {
      try {
          await signOut(auth);
          setActiveUser(null);
          setUserProfile(null);
          setView('login');
          setTheme('standard');
      } catch (e) {
          showNotification("Error signing out", "error");
      }
  };

  const handleUpdateSettings = async (bio, avatarId, newTheme) => {
    if (!activeUser) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'users', activeUser.uid, 'profile', 'main'), { 
          bio, 
          avatarId,
          theme: newTheme
      });
      setTheme(newTheme);
      showNotification("Settings saved!");
    } catch(e) { showNotification("Failed to save settings", "error"); }
  };

  const handleCreateCommunity = async (name, description, logoId) => {
    if (!userProfile) return;
    if (!name || !description) return showNotification("Validation Error: Missing fields", "error");
    try {
      const commId = name.toLowerCase().replace(/\s+/g, '');
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'communities', commId), {
        name, description, logoId: logoId || 0, creator: userProfile.username, memberCount: 1, createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'artifacts', appId, 'users', activeUser.uid, 'profile', 'main'), {
        joinedCommunities: [...(userProfile.joinedCommunities || []), commId]
      });
      showNotification(`s/${name} created!`); setView('community'); setCurrentCommunityId(commId);
    } catch (e) { showNotification("Error creating community", "error"); }
  };

  const handleCreatePost = async (title, content, communityId) => {
    if (!userProfile) return;
    if (!title || !content || !communityId) return showNotification("All fields required", "error");
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), {
        title, content, communityId, author: userProfile.username, authorAvatarId: userProfile.avatarId || 0,
        authorId: activeUser.uid, upvotes: 0, commentCount: 0, timestamp: serverTimestamp()
      });
      showNotification("Post created!"); setView('community'); setCurrentCommunityId(communityId);
    } catch (e) { showNotification("Failed to post", "error"); }
  };

  const handleDeletePost = async (postId) => {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId));
        showNotification("Post deleted");
        if (view === 'post_detail') setView(lastView || 'home');
      } catch (e) { showNotification("Failed to delete", "error"); }
  };

  const handleDeleteCommunity = async (communityId) => {
      if (!activeUser) return;
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'communities', communityId));
        if (userProfile?.joinedCommunities?.includes(communityId)) {
           const newJoined = userProfile.joinedCommunities.filter(id => id !== communityId);
           await updateDoc(doc(db, 'artifacts', appId, 'users', activeUser.uid, 'profile', 'main'), { joinedCommunities: newJoined });
        }
        showNotification("Community deleted"); setView('home'); setCurrentCommunityId(null);
      } catch (e) { showNotification("Failed to delete", "error"); }
  };

  const handleCreateComment = async (text, postId) => {
      if (!activeUser || !text.trim()) return;
      try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'comments'), {
              postId, text, author: userProfile.username, authorAvatarId: userProfile.avatarId || 0, authorId: activeUser.uid, timestamp: serverTimestamp()
          });
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId), { commentCount: increment(1) });
          showNotification("Comment added");
      } catch(e) { showNotification("Failed to comment", "error"); }
  };

  const handleDeleteComment = async (commentId, postId) => {
      try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comments', commentId));
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId), { commentCount: increment(-1) });
          showNotification("Comment deleted");
      } catch(e) { showNotification("Failed to delete comment", "error"); }
  };

  const toggleJoin = async (commId) => {
    if (!userProfile) return;
    const isJoined = userProfile.joinedCommunities?.includes(commId);
    let newJoined = isJoined ? userProfile.joinedCommunities.filter(id => id !== commId) : [...(userProfile.joinedCommunities || []), commId];
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'users', activeUser.uid, 'profile', 'main'), { joinedCommunities: newJoined });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'communities', commId), { memberCount: increment(isJoined ? -1 : 1) });
    } catch (e) { showNotification("Action failed", "error"); }
  };

  const toggleSilence = async (commId) => {
      if (!userProfile) return;
      const isSilenced = userProfile.silencedCommunities?.includes(commId);
      let newSilenced = isSilenced ? userProfile.silencedCommunities.filter(id => id !== commId) : [...(userProfile.silencedCommunities || []), commId];
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'users', activeUser.uid, 'profile', 'main'), { silencedCommunities: newSilenced });
          showNotification(isSilenced ? "Notifications enabled" : "Community silenced");
      } catch (e) { showNotification("Action failed", "error"); }
  };

  // --- Helpers ---
  const navigateTo = (newView, commId = null) => {
      if (newView !== 'post_detail') setLastView(newView);
      setView(newView);
      if (commId !== undefined) setCurrentCommunityId(commId);
  };

  // --- Render ---
  const currentCommunity = communities.find(c => c.id === currentCommunityId);
  const currentPost = posts.find(p => p.id === currentPostId);
  const postComments = comments.filter(c => c.postId === currentPostId);
  
  const filteredPosts = useMemo(() => {
    if (view === 'community' && currentCommunityId) return posts.filter(p => p.communityId === currentCommunityId);
    if (!userProfile?.joinedCommunities?.length) return posts;
    return posts.filter(p => userProfile.joinedCommunities.includes(p.communityId));
  }, [posts, view, currentCommunityId, userProfile]);

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-400 font-medium animate-pulse">Loading Seel...</div>;
  if (view === 'login') return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} notification={notification} theme={currentTheme} />;

  return (
    <div className={`flex h-screen text-slate-800 font-sans overflow-hidden selection:bg-[#B7C9E2] selection:text-white ${currentTheme.bgClass}`}>
      {theme === 'ballpit' && <SealBallpit />}
      
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} ${currentTheme.sidebarClass} backdrop-blur-xl border-r transition-all duration-300 flex-shrink-0 flex flex-col overflow-hidden z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
        <div className="p-6 flex items-center justify-between"><h2 className="font-extrabold text-slate-700 tracking-tight text-lg">Feeds</h2></div>
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          <NavButton icon={<Home size={20} />} label="Home" active={view === 'home'} onClick={() => navigateTo('home', null)} />
          <NavButton icon={<TrendingUp size={20} />} label="Popular" onClick={() => showNotification("Coming soon to Seel!", "info")} />
          <NavButton icon={<User size={20} />} label="Profile & Settings" active={view === 'profile'} onClick={() => navigateTo('profile')} />
          <div className="mt-8 px-4 mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Sparkles size={12}/> Your Communities</div>
          {userProfile?.joinedCommunities?.map(cId => {
            const c = communities.find(comm => comm.id === cId);
            return c ? <NavButton key={c.id} icon={<CommunityLogo id={c.logoId} size="sm" />} label={`s/${c.name}`} active={view === 'community' && currentCommunityId === c.id} onClick={() => navigateTo('community', c.id)} /> : null;
          })}
          <div className="mt-8 px-4 mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Search size={12}/> Explore</div>
          {communities.filter(c => !userProfile?.joinedCommunities?.includes(c.id)).map(c => (
             <NavButton key={c.id} icon={<CommunityLogo id={c.logoId} size="sm" />} label={`s/${c.name}`} active={view === 'community' && currentCommunityId === c.id} onClick={() => navigateTo('community', c.id)} />
          ))}
        </div>
        <div className="p-4 border-t border-slate-100/50">
           <button onClick={() => navigateTo('create_community')} className={`flex items-center justify-center space-x-2 text-sm text-slate-700 w-full p-3 rounded-xl border border-slate-200 bg-white/80 hover:bg-white transition-all hover:shadow-lg active:scale-95 group`}>
             <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /><span className="font-bold">Create Community</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-white/50 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><Menu size={20} /></button>
             <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigateTo('home', null)}>
                <SealAvatar id={0} size="md" className="shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-rotate-12 border-2 border-white" />
                <h1 className="text-xl font-black text-slate-700 hidden sm:block tracking-tight">Seel</h1>
             </div>
          </div>
          <div className="flex-1 max-w-xl mx-8 hidden md:block group">
            <div className="relative transition-all duration-300 focus-within:transform focus-within:scale-[1.02]">
              <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-[#B7C9E2] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search Seel" 
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) setView('search');
                    else setView('home');
                }}
                className="w-full bg-slate-100/50 border border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-[#B7C9E2] rounded-2xl py-2.5 pl-12 pr-4 text-sm outline-none transition-all shadow-inner focus:shadow-lg"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2 rounded-xl transition-colors ${showNotifications ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}>
                    <Bell size={24} />
                    {notifications.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>
                {/* Notification Dropdown */}
                {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2">
                        <div className="p-3 border-b border-slate-50 font-bold text-slate-700 flex justify-between items-center">
                            <span>Notifications</span>
                            <button onClick={() => setNotifications([])} className="text-xs text-blue-500 hover:underline">Clear all</button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">No new activity</div>
                            ) : (
                                notifications.map((n, i) => (
                                    <div key={i} className="p-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer transition-colors" onClick={() => { setCurrentPostId(n.id); navigateTo('post_detail'); setShowNotifications(false); }}>
                                        <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                            <span className="font-bold text-slate-700">s/{communities.find(c => c.id === n.communityId)?.name || n.communityId}</span>
                                            <span>• New Post</span>
                                        </div>
                                        <div className="font-medium text-sm text-slate-800 line-clamp-2">{n.title}</div>
                                        <div className="text-xs text-slate-400 mt-1">by u/{n.author}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
             </div>
             <button onClick={() => navigateTo('create_post')} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-all hover:scale-105 active:scale-95" title="Create Post"><Plus size={24} /></button>
             <div className="flex items-center space-x-2 bg-slate-100/50 py-1.5 px-3 rounded-full border border-slate-200/50 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => navigateTo('profile')}>
                <SealAvatar id={userProfile?.avatarId} size="sm" />
                <span className="text-xs font-bold text-slate-600 hidden sm:block">u/{activeUser?.username}</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto flex gap-8">
             <div className="flex-1 min-w-0 space-y-6">
                {notification && (
                  <div className={`p-4 rounded-2xl flex items-center text-sm font-medium shadow-lg animate-in slide-in-from-top-2 duration-300 ${notification.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                    {notification.type === 'error' ? <AlertCircle size={18} className="mr-3"/> : <ShieldCheck size={18} className="mr-3"/>}{notification.msg}
                  </div>
                )}

                {view === 'create_post' && <CreatePostForm communities={communities} userProfile={userProfile} onPost={handleCreatePost} onCancel={() => navigateTo('home')} preSelectedCommunity={currentCommunityId} theme={currentTheme} />}
                {view === 'create_community' && <CreateCommunityForm onCreate={handleCreateCommunity} onCancel={() => navigateTo('home')} theme={currentTheme} />}
                {view === 'profile' && userProfile && (
                    <SettingsPage 
                        userProfile={userProfile} 
                        onUpdate={handleUpdateSettings} 
                        onLogout={handleLogout}
                        theme={currentTheme}
                        currentThemeId={theme}
                    />
                )}

                {view === 'search' && (
                    <SearchResults 
                        query={searchQuery}
                        posts={posts}
                        communities={communities}
                        onClickCommunity={(id) => navigateTo('community', id)}
                        onClickPost={(id) => { setCurrentPostId(id); navigateTo('post_detail'); }}
                        currentUser={activeUser?.username}
                        onDeletePost={handleDeletePost}
                    />
                )}

                {view === 'post_detail' && currentPost && (
                    <PostDetail 
                        post={currentPost}
                        comments={postComments}
                        communityName={communities.find(c => c.id === currentPost.communityId)?.name || 'Unknown'}
                        communityLogoId={communities.find(c => c.id === currentPost.communityId)?.logoId}
                        currentUser={activeUser?.username}
                        currentUserId={activeUser?.uid}
                        onDeletePost={() => handleDeletePost(currentPost.id)}
                        onComment={handleCreateComment}
                        onDeleteComment={handleDeleteComment}
                        onBack={() => setView(lastView || 'home')}
                        theme={currentTheme}
                    />
                )}

                {(view === 'home' || view === 'community') && (
                  <>
                    {view === 'community' && currentCommunity && (
                      <CommunityBanner 
                        community={currentCommunity} 
                        isJoined={userProfile?.joinedCommunities?.includes(currentCommunity.id)}
                        isSilenced={userProfile?.silencedCommunities?.includes(currentCommunity.id)}
                        onToggleJoin={() => toggleJoin(currentCommunity.id)}
                        onToggleSilence={() => toggleSilence(currentCommunity.id)}
                        currentUser={activeUser?.username}
                        onDelete={() => handleDeleteCommunity(currentCommunity.id)}
                        theme={currentTheme}
                      />
                    )}
                    {view === 'home' && <div className="flex items-center space-x-2 mb-2"><h1 className="text-2xl font-black text-slate-800">Home Feed</h1><div className="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-500 rounded-md">Hot</div></div>}
                    <div className="space-y-5">
                      {filteredPosts.length === 0 ? (
                        <div className="bg-white/60 backdrop-blur-sm border border-white p-12 rounded-3xl shadow-sm text-center text-slate-400">
                           <div className="text-5xl mb-4 opacity-50">🍃</div>
                           <h3 className="text-lg font-bold text-slate-600 mb-1">It's quiet in here</h3>
                           <p className="text-sm">Be the first to post something cool!</p>
                        </div>
                      ) : (
                        filteredPosts.map(post => {
                          const comm = communities.find(c => c.id === post.communityId);
                          return (
                            <PostCard 
                              key={post.id} 
                              post={post} 
                              communityName={comm?.name || 'Unknown'}
                              communityLogoId={comm?.logoId}
                              onClickCommunity={(id) => navigateTo('community', id)}
                              currentUser={activeUser?.username}
                              onDelete={() => handleDeletePost(post.id)}
                              onClickPost={() => { setCurrentPostId(post.id); navigateTo('post_detail'); }}
                            />
                          );
                        })
                      )}
                    </div>
                  </>
                )}
             </div>

             <div className="w-80 hidden lg:block space-y-6">
                {view === 'profile' ? (
                   <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white overflow-hidden shadow-lg sticky top-6 p-6 text-center">
                      <div className="mx-auto mb-4 relative inline-block"><SealAvatar id={userProfile?.avatarId} size="xl" /></div>
                      <h2 className="text-xl font-black text-slate-800">u/{activeUser?.username}</h2>
                      <p className="text-sm text-slate-500 mb-4">{userProfile?.bio || "No bio yet."}</p>
                      <div className="grid grid-cols-2 gap-4 text-center border-t border-slate-100 pt-4"><div><div className="font-bold text-lg text-slate-800">0</div><div className="text-xs text-slate-500">Karma</div></div><div><div className="font-bold text-lg text-slate-800">{userProfile?.joinedCommunities?.length || 0}</div><div className="text-xs text-slate-500">Communities</div></div></div>
                   </div>
                ) : (view === 'community' && currentCommunity) ? (
                  <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white overflow-hidden shadow-lg sticky top-6">
                    <div className="h-12 w-full" style={{background: currentTheme.gradient}}></div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3"><div className="font-black text-xl text-slate-800">s/{currentCommunity.name}</div></div>
                      <p className="text-sm text-slate-600 mb-6 leading-relaxed">{currentCommunity.description}</p>
                      <div className="flex justify-between text-xs font-bold text-slate-400 border-t border-slate-100 pt-4"><div className="flex flex-col"><span className="text-lg text-slate-800">{currentCommunity.memberCount}</span><span>Members</span></div><div className="flex flex-col text-right"><span className="text-lg text-slate-800">Online</span><span>Status</span></div></div>
                      <button onClick={() => navigateTo('create_post')} className={`mt-6 w-full py-3 rounded-xl font-bold text-sm text-white ${BTN_ANIMATION}`} style={{ background: currentTheme.gradient }}>Create Post</button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-white p-6 shadow-lg sticky top-6">
                    <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide flex items-center gap-2"><Sparkles size={14} className="text-orange-400"/> About Seel</h3>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">Seel is a next-generation community platform built with modern web technologies. Join the conversation today.</p>
                    <div className="flex gap-2 mb-6"><div className="flex-1 bg-slate-200 h-1 rounded-full overflow-hidden"><div className="w-3/4 h-full bg-slate-400"></div></div><div className="flex-1 bg-slate-200 h-1 rounded-full"></div></div><div className="text-xs text-slate-400 font-medium">&copy; 2026 Seel Inc.</div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Render (Added for local Preview) ---
export default App;
