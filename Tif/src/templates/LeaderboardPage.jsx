import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/leaderboard")
      .then(r => r.json())
      .then(d => { setUsers(Array.isArray(d) ? d : []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const getRankStyle = (i) => {
    if (i === 0) return "bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)]";
    if (i === 1) return "bg-gradient-to-r from-gray-300 to-gray-400 border-gray-200 shadow-[0_0_15px_rgba(209,213,219,0.4)]";
    if (i === 2) return "bg-gradient-to-r from-amber-600 to-amber-700 border-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.4)]";
    return "bg-white/5 border-white/10 hover:bg-white/10";
  };
  const getRankIcon = (i) => i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
  const getStreak = (s) => s >= 100 ? "🔥🔥🔥" : s >= 30 ? "🔥🔥" : s >= 7 ? "🔥" : "";

  return (
    <div className="min-h-screen px-4 py-10 max-w-4xl mx-auto relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-orange-500/20 blur-3xl rounded-full pointer-events-none"></div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 mb-3 glow-text">Top Chefs</h1>
        <p className="text-gray-400">Earn points, build streaks, and climb the ranks! 🚀</p>
      </motion.div>
      {isLoading ? (
        <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>
      ) : users.length === 0 ? (
        <div className="glass-card text-center py-12"><p className="text-gray-400">No one on the leaderboard yet. Be the first! 🏆</p></div>
      ) : (
        <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }} className="space-y-3">
          {users.map((user, i) => (
            <motion.div key={user._id} variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} whileHover={{ scale: 1.02 }}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${getRankStyle(i)}`}>
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${i < 3 ? "text-white" : "text-gray-400 bg-black/20"}`}>{getRankIcon(i)}</div>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 bg-gray-800">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">👤</div>}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className={`font-bold ${i < 3 ? "text-white" : "text-gray-200"}`}>{user.name || "Anonymous"}</h3>
                    {user.isVerifiedKitchen && <span className="text-xs">✅</span>}
                    {getStreak(user.currentStreak) && <span className="text-xs" title={`${user.currentStreak}-day streak`}>{getStreak(user.currentStreak)}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-yellow-300">★ {user.ratingAverage?.toFixed(1) || "New"}</span>
                    <span className={`${i < 3 ? "text-white/60" : "text-gray-500"}`}>• {user.totalMealsShared || 0} meals</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">{(user.badges || []).slice(0, 4).map((b, j) => <span key={j} className="text-sm" title={b.name}>{b.icon}</span>)}</div>
                <div className="text-right">
                  <span className={`text-xl font-black ${i < 3 ? "text-white" : "text-orange-400"}`}>{user.points || 0}</span>
                  <span className={`block text-xs uppercase tracking-wider ${i < 3 ? "text-white/70" : "text-gray-500"}`}>pts</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
