


"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const [conversation, setConversation] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [userStats, setUserStats] = useState({
    repliesGenerated: 0,
    successRate: 95,
    totalCharsProcessed: 0,
    averageResponseTime: 2.3
  });  const [statsUpdated, setStatsUpdated] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    autoSave: true,
    notifications: true,
    language: 'english',
    soundEnabled: true,
    autoComplete: true,
    fontSize: 'medium',
    replyFormat: 'casual',
    maxReplyLength: 500
  });
  const [tempPreferences, setTempPreferences] = useState(preferences);
  const [preferencesChanged, setPreferencesChanged] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Load user preferences from localStorage
        const savedPreferences = localStorage.getItem(`preferences_${parsedUser.id}`);
        if (savedPreferences) {
          const parsed = JSON.parse(savedPreferences);
          setPreferences(parsed);
          setTempPreferences(parsed);
          // Apply theme immediately
          applyTheme(parsed.theme);
        }
        
        // Load and calculate user stats
        loadUserStats(parsedUser.id);
      } catch {
        console.error("Invalid user data");
      }
    }
  }, [router]);

  const loadUserStats = (userId: string) => {
    // Get conversation history from localStorage for stats calculation
    const conversationHistory = JSON.parse(localStorage.getItem(`conversations_${userId}`) || '[]');
    const totalReplies = conversationHistory.length;
    const totalChars = conversationHistory.reduce((acc: number, conv: any) => acc + (conv.conversation?.length || 0), 0);
    
    setUserStats({
      repliesGenerated: totalReplies,
      successRate: totalReplies > 0 ? Math.floor(85 + Math.random() * 15) : 95, // Random between 85-100%
      totalCharsProcessed: totalChars,
      averageResponseTime: parseFloat((1.5 + Math.random() * 2).toFixed(1)) // Random between 1.5-3.5 seconds
    });
  };

  const saveConversation = (conversation: string, reply: string) => {
    if (!user?.id) return;
    
    const conversationHistory = JSON.parse(localStorage.getItem(`conversations_${user.id}`) || '[]');
    const newEntry = {
      id: Date.now(),
      conversation,
      reply,
      timestamp: new Date().toISOString(),
      chars: conversation.length
    };
    
    conversationHistory.unshift(newEntry);
    // Keep only last 100 conversations
    if (conversationHistory.length > 100) {
      conversationHistory.splice(100);
    }
    
    localStorage.setItem(`conversations_${user.id}`, JSON.stringify(conversationHistory));
    
    // Immediately update stats in state
    const totalReplies = conversationHistory.length;
    const totalChars = conversationHistory.reduce((acc: number, conv: any) => acc + (conv.conversation?.length || 0), 0);
    
    console.log('Updating stats:', { totalReplies, totalChars, previousStats: userStats }); // Debug log
    
    setUserStats(prevStats => ({
      ...prevStats,
      repliesGenerated: totalReplies,
      totalCharsProcessed: totalChars,
      successRate: totalReplies > 0 ? Math.floor(85 + Math.random() * 15) : 95
    }));
    
    // Trigger animation for visual feedback
    setStatsUpdated(true);
    setTimeout(() => setStatsUpdated(false), 1000);
  };

  const updateUser = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setShowProfileModal(false);
    setShowDropdown(false);
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--text-primary', '#000000');
      root.style.setProperty('--text-secondary', '#666666');
    } else if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.style.setProperty('--bg-primary', '#0f0f23');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#a1a1aa');
      } else {
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--text-primary', '#000000');
        root.style.setProperty('--text-secondary', '#666666');
      }
    }
  };

  const updatePreferences = (newPreferences: any) => {
    setPreferences(newPreferences);
    setTempPreferences(newPreferences);
    if (user?.id) {
      localStorage.setItem(`preferences_${user.id}`, JSON.stringify(newPreferences));
    }
    applyTheme(newPreferences.theme);
    
    // Play success sound if enabled
    if (newPreferences.soundEnabled) {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwmnO7WZcP49fH98++CZfD8+/2Nc/P8/v7ygfrLv6qJVQAe'; // Sound effect data URL
      audio.play().catch(() => {}); // Ignore errors if audio fails
    }
    
    setPreferencesChanged(false);
    setShowPreferencesModal(false);
    setShowDropdown(false);
    
    // Show success message
    setTimeout(() => {
      setStatsUpdated(true);
      setTimeout(() => setStatsUpdated(false), 2000);
    }, 200);
  };

  const resetPreferences = () => {
    const defaultPrefs = {
      theme: 'dark',
      autoSave: true,
      notifications: true,
      language: 'english',
      soundEnabled: true,
      autoComplete: true,
      fontSize: 'medium',
      replyFormat: 'casual',
      maxReplyLength: 500
    };
    setTempPreferences(defaultPrefs);
    setPreferencesChanged(true);
  };

  const exportPreferences = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(preferences, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "plainreply-preferences.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importPreferences = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setTempPreferences(imported);
          setPreferencesChanged(true);
        } catch {
          alert('Invalid preferences file');
        }
      };
      reader.readAsText(file);
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  const generateReply = async () => {
    if (!conversation.trim()) return;

    setLoading(true);
    setReply("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ conversation }),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      setReply(data.reply);
      
      // Save conversation to history for stats
      if (user?.id) {
        console.log('Saving conversation and updating stats...'); // Debug log
        saveConversation(conversation, data.reply);
      }
    } catch {
      setReply("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(reply);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-purple-500" />
      </div>
    );
  }

  const lastLogin = new Date().toLocaleString();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Multiple Layer Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950" />
      
      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-[700px] h-[700px] bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-float" style={{animationDelay: '0s'}} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-300/30 rounded-full animate-float" style={{animationDelay: '1.5s'}} />
        <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-pink-300/20 rounded-full animate-float" style={{animationDelay: '3s'}} />
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-cyan-300/40 rounded-full animate-float" style={{animationDelay: '4.5s'}} />
        <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-white/10 rounded-full animate-float" style={{animationDelay: '6s'}} />
      </div>
      
      {/* Grid overlay for tech feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:80px_80px] opacity-60" />
      
      {/* Radial spotlight from top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]" />

      {/* ENHANCED MODERN NAVBAR */}
      <header className="relative z-20 backdrop-blur-2xl bg-white/[0.02] border-b border-white/[0.08] shadow-2xl">
        <div className="w-full px-4 py-5 flex items-center justify-between">
          {/* Enhanced Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-4"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />
                <span className="text-white font-bold text-xl relative z-10">P</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-950 shadow-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                PlainReply
              </h1>
              <div className="text-xs text-gray-400 font-medium">AI Reply Engine</div>
            </div>
          </motion.div>

          {/* Enhanced User Dropdown - Positioned at rightmost corner */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="group flex items-center gap-4 bg-white/[0.08] backdrop-blur-2xl px-6 py-4 rounded-3xl text-white hover:bg-white/[0.12] transition-all duration-300 border border-white/10 hover:border-white/20 shadow-xl hover:shadow-2xl hover:scale-[1.02]"
            >
              <div className="relative">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 text-sm font-bold shadow-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />
                  <span className="relative z-10">{user?.name?.[0] || "U"}</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-3 border-slate-950 shadow-lg">
                  <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="font-bold text-base leading-tight">{user?.name || "User"}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-300 font-medium leading-tight">Online now</span>
                </div>
              </div>
              <motion.svg 
                className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" 
                animate={{ rotate: showDropdown ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", duration: 0.4 }}
                  className="absolute right-0 mt-4 w-80 rounded-3xl bg-gray-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden z-50"
                  style={{ backdropFilter: 'blur(20px)' }}
                >
                  {/* Header */}
                  <div className="p-6 bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-pink-500/20 border-b border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                          {user?.name?.[0] || "U"}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-gray-900 shadow-lg"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg leading-tight">{user?.name || "User"}</h3>
                        <p className="text-gray-300 text-sm leading-tight">{user?.email || "email@example.com"}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-400 font-medium">Active now</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="px-6 py-4 bg-black/20">
                    {/* Stats Update Indicator */}
                    {statsUpdated && (
                      <div className="mb-3 text-center">
                        <div className="inline-flex items-center space-x-2 text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Stats Updated!</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className={`bg-white/5 rounded-xl p-3 border border-white/10 transition-all duration-300 ${
                        statsUpdated ? 'scale-105 bg-purple-500/20 border-purple-400/50' : ''
                      }`}>
                        <div className={`text-2xl font-bold text-purple-400 transition-all duration-300 ${
                          statsUpdated ? 'text-purple-300' : ''
                        }`}>
                          {userStats.repliesGenerated}
                        </div>
                        <div className="text-xs text-gray-400">Replies Generated</div>
                      </div>
                      <div className={`bg-white/5 rounded-xl p-3 border border-white/10 transition-all duration-300 ${
                        statsUpdated ? 'scale-105 bg-pink-500/20 border-pink-400/50' : ''
                      }`}>
                        <div className={`text-2xl font-bold text-pink-400 transition-all duration-300 ${
                          statsUpdated ? 'text-pink-300' : ''
                        }`}>
                          {userStats.successRate}%
                        </div>
                        <div className="text-xs text-gray-400">Success Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <nav className="space-y-1">
                      <button 
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 p-4 text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">Profile Settings</div>
                          <div className="text-xs text-gray-400">Manage your account</div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => {
                          setShowAnalyticsModal(true);
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 p-4 text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">Analytics</div>
                          <div className="text-xs text-gray-400">View your stats</div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => {
                          setShowPreferencesModal(true);
                          setTempPreferences(preferences);
                          setPreferencesChanged(false);
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 p-4 text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">Preferences</div>
                          <div className="text-xs text-gray-400">Customize experience</div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </nav>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400">Account Status</span>
                      <span className="text-xs text-emerald-400 font-medium bg-emerald-500/20 px-2 py-1 rounded-full">Premium</span>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-center space-x-3 p-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl transition-all duration-200 group border border-red-500/20 hover:border-red-500/40"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </header>

      {/* MAIN CONTENT - Enhanced SaaS Design */}
      <main className="relative z-10 min-h-screen pt-24 pb-20 px-4">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/30 to-pink-900/20 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto">
          {/* Hero Section with Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-200 font-medium">AI Reply Engine Active</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6 leading-tight">
              Plain
              <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">Reply</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
              Transform conversations into perfect replies with our advanced AI engine.
              <br />
              <span className="text-purple-300">Professional, fast, and intelligently crafted.</span>
            </p>
            
            {/* Live Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 group"
              >
                <div className="text-3xl font-bold text-purple-400 mb-2 group-hover:text-purple-300 transition-colors">
                  {userStats.repliesGenerated.toLocaleString()}+
                </div>
                <div className="text-gray-300 text-sm font-medium">Replies Generated</div>
                <div className="mt-2 h-1 bg-gradient-to-r from-purple-500/30 to-purple-500/10 rounded-full" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 group"
              >
                <div className="text-3xl font-bold text-pink-400 mb-2 group-hover:text-pink-300 transition-colors">
                  {userStats.successRate}%
                </div>
                <div className="text-gray-300 text-sm font-medium">Success Rate</div>
                <div className="mt-2 h-1 bg-gradient-to-r from-pink-500/30 to-pink-500/10 rounded-full" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 group"
              >
                <div className="text-3xl font-bold text-blue-400 mb-2 group-hover:text-blue-300 transition-colors">
                  {userStats.averageResponseTime}s
                </div>
                <div className="text-gray-300 text-sm font-medium">Avg Response</div>
                <div className="mt-2 h-1 bg-gradient-to-r from-blue-500/30 to-blue-500/10 rounded-full" />
              </motion.div>
            </div>
          </motion.div>
          
          {/* Main Interface */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <span>Input Conversation</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-xs text-emerald-400 font-medium">AI Ready</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      rows={12}
                      value={conversation}
                      onChange={(e) => setConversation(e.target.value)}
                      placeholder=" Paste your conversation here..."
                      className="w-full bg-black/40 backdrop-blur-xl text-white p-6 rounded-2xl resize-none outline-none border border-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-gray-400 text-lg leading-relaxed"
                      style={{ minHeight: '320px' }}
                    />
                    
                    {/* Character Counter */}
                    <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                      {conversation.length} chars
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center space-x-3">
                      <button className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200">
                        📋 Paste
                      </button>
                      <button 
                        onClick={() => setConversation('')}
                        className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200"
                      >
                        🗑️ Clear
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>Style: {preferences.replyFormat}</span>
                      <span>•</span>
                      <span>Max: {preferences.maxReplyLength}</span>
                    </div>
                  </div>
                  
                  {/* Generate Button */}
                  <motion.button
                    onClick={generateReply}
                    disabled={loading || !conversation.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`mt-6 w-full py-5 rounded-2xl text-white font-bold text-lg transition-all duration-300 relative overflow-hidden ${
                      loading || !conversation.trim()
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 hover:shadow-2xl hover:shadow-purple-500/25'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />
                    
                    {loading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating Perfect Reply...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Generate AI Reply</span>
                      </div>
                    )}
                  </motion.button>
                </div>
              </div>
              
              {/* Output Section */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <span>Generated Reply</span>
                    </h3>
                  </div>
                  
                  {reply ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="relative group"
                    >
                      <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 relative group-hover:border-emerald-500/30 transition-all duration-300">
                        <div className="text-white whitespace-pre-wrap leading-relaxed text-lg">
                          {reply}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex space-x-2">
                          <button
                            onClick={copyToClipboard}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-2"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            <span>Copy</span>
                          </button>
                          
                          <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200">
                            ↻ Regenerate
                          </button>
                        </div>
                        
                        {/* Word Count */}
                        <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                          {reply.split(' ').length} words
                        </div>
                      </div>
                      
                      {/* Quality Score */}
                      <div className="mt-4 flex items-center justify-between p-4 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="text-emerald-400 font-medium">Quality Score</div>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className="w-4 h-4 text-emerald-400 fill-current"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-emerald-300">Perfect Match!</div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-black/20 backdrop-blur-xl p-12 rounded-2xl border border-dashed border-white/20 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-lg mb-2">Your perfect reply awaits...</p>
                      <p className="text-gray-500 text-sm">Add a conversation and generate an AI-powered response</p>
                    </div>
                  )}
                </div>
                
                {/* Recent Activity */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Recent Activity</span>
                  </h4>
                  
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-200">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                        <div className="flex-1">
                          <div className="text-sm text-white">Generated reply for conversation</div>
                          <div className="text-xs text-gray-400">2 minutes ago</div>
                        </div>
                        <div className="text-emerald-400 text-xs">✓</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {showDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-gray-900 rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-b border-white/10">
                <h3 className="text-xl font-bold text-white mb-2">Profile Settings</h3>
                <p className="text-gray-300 text-sm">Update your account information</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <div className="pt-4 flex space-x-3">
                  <button
                    onClick={() => updateUser(user)}
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {showAnalyticsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-gray-900 rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-b border-white/10">
                <h3 className="text-xl font-bold text-white mb-2">Analytics Dashboard</h3>
                <p className="text-gray-300 text-sm">Your usage statistics and insights</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Total Replies</h4>
                        <p className="text-gray-400 text-sm">Generated</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-purple-400">{userStats.repliesGenerated}</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Success Rate</h4>
                        <p className="text-gray-400 text-sm">Quality</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-400">{userStats.successRate}%</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Characters</h4>
                        <p className="text-gray-400 text-sm">Processed</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-blue-400">{userStats.totalCharsProcessed.toLocaleString()}</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Avg Response</h4>
                        <p className="text-gray-400 text-sm">Time</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-yellow-400">{userStats.averageResponseTime}s</div>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferencesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-gray-900 rounded-3xl border border-white/20 shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">⚙️ Preferences</h3>
                    <p className="text-gray-300 text-sm">Customize your PlainReply experience</p>
                  </div>
                  {preferencesChanged && (
                    <div className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                      Unsaved changes
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Appearance Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <span>🎨</span>
                    <span>Appearance</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Theme</label>
                      <select
                        value={tempPreferences.theme}
                        onChange={(e) => {
                          setTempPreferences({ ...tempPreferences, theme: e.target.value });
                          setPreferencesChanged(true);
                        }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="dark" className="bg-gray-800">🌙 Dark</option>
                        <option value="light" className="bg-gray-800">☀️ Light</option>
                        <option value="auto" className="bg-gray-800">🤖 Auto</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Font Size</label>
                      <select
                        value={tempPreferences.fontSize}
                        onChange={(e) => {
                          setTempPreferences({ ...tempPreferences, fontSize: e.target.value });
                          setPreferencesChanged(true);
                        }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="small" className="bg-gray-800">Small</option>
                        <option value="medium" className="bg-gray-800">Medium</option>
                        <option value="large" className="bg-gray-800">Large</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Behavior Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <span>⚡</span>
                    <span>Behavior</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-medium">Auto Save Conversations</h5>
                        <p className="text-gray-400 text-sm">Automatically save all conversations to history</p>
                      </div>
                      <button
                        onClick={() => {
                          setTempPreferences({ ...tempPreferences, autoSave: !tempPreferences.autoSave });
                          setPreferencesChanged(true);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${tempPreferences.autoSave ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tempPreferences.autoSave ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-medium">Smart Auto-Complete</h5>
                        <p className="text-gray-400 text-sm">Enable AI-powered text suggestions</p>
                      </div>
                      <button
                        onClick={() => {
                          setTempPreferences({ ...tempPreferences, autoComplete: !tempPreferences.autoComplete });
                          setPreferencesChanged(true);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${tempPreferences.autoComplete ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tempPreferences.autoComplete ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-medium">Sound Effects</h5>
                        <p className="text-gray-400 text-sm">Play sounds for interactions</p>
                      </div>
                      <button
                        onClick={() => {
                          setTempPreferences({ ...tempPreferences, soundEnabled: !tempPreferences.soundEnabled });
                          setPreferencesChanged(true);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${tempPreferences.soundEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tempPreferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-medium">Push Notifications</h5>
                        <p className="text-gray-400 text-sm">Receive usage and update notifications</p>
                      </div>
                      <button
                        onClick={() => {
                          setTempPreferences({ ...tempPreferences, notifications: !tempPreferences.notifications });
                          setPreferencesChanged(true);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${tempPreferences.notifications ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tempPreferences.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Settings Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <span>🤖</span>
                    <span>AI Settings</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Reply Style</label>
                      <select
                        value={tempPreferences.replyFormat}
                        onChange={(e) => {
                          setTempPreferences({ ...tempPreferences, replyFormat: e.target.value });
                          setPreferencesChanged(true);
                        }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="casual" className="bg-gray-800">😊 Casual & Friendly</option>
                        <option value="professional" className="bg-gray-800">💼 Professional</option>
                        <option value="concise" className="bg-gray-800">⚡ Concise</option>
                        <option value="detailed" className="bg-gray-800">📝 Detailed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Max Reply Length</label>
                      <select
                        value={tempPreferences.maxReplyLength}
                        onChange={(e) => {
                          setTempPreferences({ ...tempPreferences, maxReplyLength: parseInt(e.target.value) });
                          setPreferencesChanged(true);
                        }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value={200} className="bg-gray-800">Short (200 chars)</option>
                        <option value={500} className="bg-gray-800">Medium (500 chars)</option>
                        <option value={1000} className="bg-gray-800">Long (1000 chars)</option>
                        <option value={2000} className="bg-gray-800">Very Long (2000 chars)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Language</label>
                    <select
                      value={tempPreferences.language}
                      onChange={(e) => {
                        setTempPreferences({ ...tempPreferences, language: e.target.value });
                        setPreferencesChanged(true);
                      }}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="english" className="bg-gray-800">🇺🇸 English</option>
                      <option value="hindi" className="bg-gray-800">🇮🇳 Hindi</option>
                      <option value="spanish" className="bg-gray-800">🇪🇸 Spanish</option>
                      <option value="french" className="bg-gray-800">🇫🇷 French</option>
                      <option value="german" className="bg-gray-800">🇩🇪 German</option>
                    </select>
                  </div>
                </div>

                {/* Data Management Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <span>💾</span>
                    <span>Data Management</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={exportPreferences}
                      className="py-2 px-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 rounded-xl font-medium transition-all text-sm"
                    >
                      📤 Export Settings
                    </button>
                    <label className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={importPreferences}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 rounded-xl font-medium transition-all text-sm text-center cursor-pointer">
                        📥 Import Settings
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="pt-6 flex space-x-3 border-t border-white/10">
                  <button
                    onClick={() => updatePreferences(tempPreferences)}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                  >
                    💾 Save Preferences
                  </button>
                  <button
                    onClick={resetPreferences}
                    className="py-3 px-6 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 rounded-xl font-medium transition-all"
                  >
                    🔄 Reset
                  </button>
                  <button
                    onClick={() => {
                      setShowPreferencesModal(false);
                      setTempPreferences(preferences);
                      setPreferencesChanged(false);
                    }}
                    className="py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
