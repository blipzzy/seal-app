import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp,
  query 
} from 'firebase/firestore';

// Configuration from index.html globals
const firebaseConfig = JSON.parse(window.__firebase_config || '{}');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = window.__app_id || 'social-app';

export default function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Handle Authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sync Posts from Firestore
  useEffect(() => {
    if (!user) return;

    // RULE 1: Use strict pathing for public data
    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
    
    // RULE 2: Simple query (filtering/sorting happens in memory to avoid index requirements)
    const unsubscribe = onSnapshot(postsRef, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by timestamp descending in memory
      const sorted = fetchedPosts.sort((a, b) => 
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
      
      setPosts(sorted);
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    try {
      const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
      await addDoc(postsRef, {
        text: newPost,
        userId: user.uid,
        createdAt: serverTimestamp(),
        username: `User-${user.uid.substring(0, 5)}`
      });
      setNewPost("");
    } catch (err) {
      console.error("Error adding post:", err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading session...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-600">Seel Social</h1>
        <p className="text-sm text-gray-500">Logged in as: {user?.uid}</p>
      </header>

      <form onSubmit={handlePost} className="mb-8">
        <textarea
          className="w-full p-4 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="What's happening?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <button 
          type="submit"
          className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition"
        >
          Post
        </button>
      </form>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full mr-3"></div>
              <div>
                <p className="font-bold text-gray-800">{post.username}</p>
                <p className="text-xs text-gray-400">
                  {post.createdAt?.toDate().toLocaleString() || 'Just now'}
                </p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{post.text}</p>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-center text-gray-400 mt-10">No posts yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}

// Attach to window so index.html can find it
window.App = App;


