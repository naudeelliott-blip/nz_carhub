
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ForumCategory, ForumThread, ForumPost, Listing, DirectMessage } from './types';

// --- Mock Data ---

// Pre-seeded user for easy testing if needed
const DEMO_USER: User = {
  id: 'u1',
  name: 'KiwiCruiser',
  email: 'user@example.com',
  password: 'password123',
  avatar: 'https://picsum.photos/seed/user1/200',
  role: 'user',
  joinedDate: '2023-01-15',
  reputation: 0,
  isVerified: false,
  savedListingIds: [],
};

const CATEGORIES: ForumCategory[] = [
  { id: 'c1', title: 'General Chat', description: 'Everything automotive in NZ', icon: 'message-circle' },
  { id: 'c2', title: 'JDM Legends', description: 'Skylines, Supras, and Rotary goodness', icon: 'zap' },
  { id: 'c3', title: 'Utes & 4WD', description: 'Off-road adventures and workhorses', icon: 'truck' },
  { id: 'c4', title: 'DIY & Maintenance', description: 'Wrenching tips and tricks', icon: 'tool' },
  { id: 'c5', title: 'Buy/Sell Discussion', description: 'Advice on pricing and deals', icon: 'dollar-sign' },
];

const INITIAL_THREADS: ForumThread[] = [];

const INITIAL_LISTINGS: Listing[] = [];

// --- Context Definition ---

interface AppContextType {
  currentUser: User | null;
  users: User[];
  theme: 'light' | 'dark';
  
  toggleTheme: () => void;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateUserProfile: (updatedData: Partial<User>) => void;
  verifyUser: (userId: string) => void;
  giveReputation: (userId: string) => void;
  toggleSavedListing: (listingId: string) => void;
  
  categories: ForumCategory[];
  threads: ForumThread[];
  posts: ForumPost[];
  listings: Listing[];
  directMessages: DirectMessage[];
  viewHistory: string[];

  addThread: (thread: Omit<ForumThread, 'id' | 'views' | 'replies' | 'createdAt'>) => void;
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'sellerId' | 'sellerName'>) => void;
  updateListing: (id: string, updatedData: Partial<Listing>) => void;
  addPost: (post: Omit<ForumPost, 'id' | 'createdAt' | 'authorId' | 'likes'>) => void;
  
  deleteThread: (id: string) => void;
  deletePost: (id: string) => void;
  deleteListing: (id: string) => void;
  
  incrementThreadViews: (id: string) => void;
  addToHistory: (listingId: string) => void;
  
  sendDirectMessage: (receiverId: string, receiverName: string, content: string, listingId?: string) => void;
  markAsRead: (senderId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Stable keys for future-proofing
const STORAGE_KEYS = {
  CURRENT_USER: 'nzcarhub_current_user',
  USERS: 'nzcarhub_users',
  THREADS: 'nzcarhub_threads',
  POSTS: 'nzcarhub_posts',
  LISTINGS: 'nzcarhub_listings', 
  MESSAGES: 'nzcarhub_messages',
  THEME: 'nzcarhub_theme',
  HISTORY: 'nzcarhub_history',
};

// Keys from previous deployments to migrate data from
const LEGACY_KEYS = {
  CURRENT_USER: ['nzcarhub_current_user_v1'],
  USERS: ['nzcarhub_users_v1'],
  THREADS: ['nzcarhub_threads_v3', 'nzcarhub_threads_v2', 'nzcarhub_threads_v1'],
  POSTS: ['nzcarhub_posts_v2', 'nzcarhub_posts_v1'],
  LISTINGS: ['nzcarhub_listings_v3', 'nzcarhub_listings_v2', 'nzcarhub_listings_v1'],
  MESSAGES: ['nzcarhub_messages_v1'],
  THEME: ['nzcarhub_theme_v1'],
  HISTORY: ['nzcarhub_history_v1'],
};

// Robust loader that checks current key, then falls back to legacy keys
function loadFromStorage<T>(currentKey: string, legacyKeys: string[], defaultValue: T): T {
  try {
    // 1. Try current stable key
    const saved = localStorage.getItem(currentKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Silently fail parse errors (e.g. raw strings in theme) and proceed to legacy/default
      }
    }

    // 2. Try legacy keys (recover data from previous deployments)
    for (const oldKey of legacyKeys) {
      const oldSaved = localStorage.getItem(oldKey);
      if (oldSaved) {
        try {
          const parsed = JSON.parse(oldSaved);
          // Automatically migrate to new key
          localStorage.setItem(currentKey, JSON.stringify(parsed));
          return parsed;
        } catch (e) {
          // Ignore legacy parse errors
        }
      }
    }
  } catch (e) {
    console.error(`Error loading storage for ${currentKey}`, e);
  }
  return defaultValue;
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
        // Fix for legacy raw string 'dark'/'light' values causing JSON parse errors
        const rawTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        if (rawTheme === 'dark' || rawTheme === 'light') return rawTheme;

        const saved = loadFromStorage<string>(STORAGE_KEYS.THEME, LEGACY_KEYS.THEME, '');
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch { return 'light'; }
  });

  // Initialize state using robust loader
  const [users, setUsers] = useState<User[]>(() => 
    loadFromStorage(STORAGE_KEYS.USERS, LEGACY_KEYS.USERS, [DEMO_USER])
  );

  const [currentUser, setCurrentUser] = useState<User | null>(() => 
    loadFromStorage(STORAGE_KEYS.CURRENT_USER, LEGACY_KEYS.CURRENT_USER, null)
  );

  const [categories] = useState<ForumCategory[]>(CATEGORIES);

  const [threads, setThreads] = useState<ForumThread[]>(() => 
    loadFromStorage(STORAGE_KEYS.THREADS, LEGACY_KEYS.THREADS, INITIAL_THREADS)
  );

  const [posts, setPosts] = useState<ForumPost[]>(() => 
    loadFromStorage(STORAGE_KEYS.POSTS, LEGACY_KEYS.POSTS, [])
  );

  const [listings, setListings] = useState<Listing[]>(() => 
    loadFromStorage(STORAGE_KEYS.LISTINGS, LEGACY_KEYS.LISTINGS, INITIAL_LISTINGS)
  );

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => 
    loadFromStorage(STORAGE_KEYS.MESSAGES, LEGACY_KEYS.MESSAGES, [])
  );

  const [viewHistory, setViewHistory] = useState<string[]>(() => 
    loadFromStorage(STORAGE_KEYS.HISTORY, LEGACY_KEYS.HISTORY, [])
  );

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(directMessages));
  }, [directMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(viewHistory));
  }, [viewHistory]);

  // Auth Functions
  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        setCurrentUser(user);
        return true;
    }
    return false;
  };

  const register = (name: string, email: string, password: string): boolean => {
      if (users.some(u => u.email === email)) {
          return false; // Email already exists
      }
      
      const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          password,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          role: 'user',
          joinedDate: new Date().toISOString(),
          reputation: 0,
          isVerified: false,
          savedListingIds: []
      };

      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      return true;
  };

  const logout = () => setCurrentUser(null);

  const updateUserProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    
    // Update in users list
    setUsers(prev => prev.map(u => 
      u.id === currentUser.id ? { ...u, ...updatedData } : u
    ));
    
    // Update current session
    setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
  };

  // Verification Logic
  const verifyUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, isVerified: true } : null);
    }
  };

  const giveReputation = (userId: string) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, reputation: u.reputation + 1 } : u));
      if (currentUser?.id === userId) {
          setCurrentUser(prev => prev ? { ...prev, reputation: prev.reputation + 1 } : null);
      }
  };

  const toggleSavedListing = (listingId: string) => {
    if (!currentUser) return;
    
    const currentSaved = currentUser.savedListingIds || [];
    const isSaved = currentSaved.includes(listingId);
    
    let newSaved;
    if (isSaved) {
        newSaved = currentSaved.filter(id => id !== listingId);
    } else {
        newSaved = [...currentSaved, listingId];
    }
    
    updateUserProfile({ savedListingIds: newSaved });
  };

  const addThread = (newThread: Omit<ForumThread, 'id' | 'views' | 'replies' | 'createdAt'>) => {
    const thread: ForumThread = {
      ...newThread,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      views: 0,
      replies: 0,
    };
    setThreads(prev => [thread, ...prev]);
  };

  const addListing = (newListing: Omit<Listing, 'id' | 'createdAt' | 'sellerId' | 'sellerName'>) => {
    if (!currentUser) return;
    const listing: Listing = {
      ...newListing,
      id: Math.random().toString(36).substr(2, 9),
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      createdAt: new Date().toISOString(),
      images: newListing.images && newListing.images.length > 0 ? newListing.images : ['https://picsum.photos/400/300'],
      isFeatured: newListing.isFeatured || false
    };
    setListings(prev => [listing, ...prev]);
  };

  const updateListing = (id: string, updatedData: Partial<Listing>) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...updatedData } : l));
  };

  const addPost = (newPost: Omit<ForumPost, 'id' | 'createdAt' | 'authorId' | 'likes'>) => {
    if (!currentUser) return;
    const post: ForumPost = {
      ...newPost,
      id: Math.random().toString(36).substr(2, 9),
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    setPosts(prev => [...prev, post]);
    
    // Update thread reply count
    setThreads(prev => prev.map(t => 
      t.id === newPost.threadId ? { ...t, replies: t.replies + 1 } : t
    ));
  };

  const deleteThread = (id: string) => {
    setThreads(prev => prev.filter(t => t.id !== id));
    setPosts(prev => prev.filter(p => p.threadId !== id));
  };

  const deletePost = (id: string) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      setPosts(prev => prev.filter(p => p.id !== id));
      setThreads(prev => prev.map(t => 
        t.id === post.threadId ? { ...t, replies: Math.max(0, t.replies - 1) } : t
      ));
    }
  };

  const deleteListing = (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const incrementThreadViews = (id: string) => {
    setThreads(prevThreads => prevThreads.map(t => 
      t.id === id ? { ...t, views: t.views + 1 } : t
    ));
  };

  const addToHistory = (listingId: string) => {
    setViewHistory(prev => {
        // Remove existing entry if present to move it to the top
        const filtered = prev.filter(id => id !== listingId);
        // Add new id to start, keep max 50
        return [listingId, ...filtered].slice(0, 50);
    });
  };

  const sendDirectMessage = (receiverId: string, receiverName: string, content: string, listingId?: string) => {
    if (!currentUser) return;
    
    const newMessage: DirectMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId,
      receiverName,
      content,
      listingId,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setDirectMessages(prev => [...prev, newMessage]);
  };

  const markAsRead = (senderId: string) => {
    if (!currentUser) return;
    setDirectMessages(prev => prev.map(msg => 
        (msg.senderId === senderId && msg.receiverId === currentUser.id && !msg.isRead)
            ? { ...msg, isRead: true }
            : msg
    ));
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, users, theme, toggleTheme, login, register, logout, updateUserProfile, verifyUser, giveReputation, toggleSavedListing,
      categories, threads, posts, listings, directMessages, viewHistory,
      addThread, addListing, updateListing, addPost,
      deleteThread, deletePost, deleteListing,
      incrementThreadViews, addToHistory, sendDirectMessage, markAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useStore must be used within AppProvider");
  return context;
};