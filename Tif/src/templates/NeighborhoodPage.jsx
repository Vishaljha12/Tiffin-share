import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../components/Toast";

export default function NeighborhoodPage() {
  const toast = useToast();
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [myHood, setMyHood] = useState(null);
  const [hoodData, setHoodData] = useState(null);
  const [meals, setMeals] = useState([]);
  const [joinName, setJoinName] = useState("");
  const [joinPincode, setJoinPincode] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [activeTab, setActiveTab] = useState("feed");
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/profile", { headers: { Authorization: token } })
      .then(r => r.json()).then(data => { if (data.neighborhood) { setMyHood(data.neighborhood); loadNeighborhood(data.neighborhood); } setIsLoading(false); })
      .catch(() => setIsLoading(false));
    fetch("http://localhost:5000/api/neighborhoods").then(r => r.json()).then(data => setNeighborhoods(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const loadNeighborhood = (name) => {
    fetch(`http://localhost:5000/api/neighborhoods/${name}`).then(r => r.json())
      .then(data => { setHoodData(data.neighborhood); setMeals(Array.isArray(data.meals) ? data.meals : []); }).catch(() => {});
  };

  const handleJoin = async () => {
    if (!joinName.trim()) { toast("Enter a neighborhood name", "warning"); return; }
    try {
      const res = await fetch("http://localhost:5000/api/neighborhoods/join", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ name: joinName, pincode: joinPincode }),
      });
      const data = await res.json();
      if (res.ok) { setMyHood(joinName.toLowerCase().trim()); loadNeighborhood(joinName.toLowerCase().trim()); toast(data.message, "success"); }
      else toast(data.message, "error");
    } catch { toast("Server error", "error"); }
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;
    try {
      await fetch(`http://localhost:5000/api/neighborhoods/${myHood}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ message: chatMessage }),
      });
      setChatMessage(""); loadNeighborhood(myHood);
    } catch { toast("Failed to send message", "error"); }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" /></div>
  );

  if (!myHood) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="text-6xl block mb-4">🏘️</motion.span>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 mb-3">Neighborhood Kitchens</h1>
          <p className="text-gray-400 text-lg">Join your local food community. Discover homemade meals from neighbors you trust.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Join or Create a Neighborhood</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input placeholder="Neighborhood Name (e.g. Andheri West)" className="w-full px-4 py-3 rounded-xl glass-input"
              value={joinName} onChange={(e) => setJoinName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleJoin()} />
            <input placeholder="Pincode (optional)" className="w-full px-4 py-3 rounded-xl glass-input"
              value={joinPincode} onChange={(e) => setJoinPincode(e.target.value)} onKeyDown={e => e.key === "Enter" && handleJoin()} />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleJoin}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg btn-ripple">Join Community 🏘️</motion.button>
        </motion.div>
        {neighborhoods.length > 0 && (
          <div><h3 className="text-lg font-bold text-white mb-4">Explore Communities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {neighborhoods.map((hood) => (
                <motion.div key={hood._id} whileHover={{ y: -3, scale: 1.01 }} className="glass-card p-4 cursor-pointer" onClick={() => setJoinName(hood.name)}>
                  <h4 className="font-bold text-white capitalize text-lg">{hood.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{hood.members?.length || 0} members{hood.pincode ? ` • ${hood.pincode}` : ""}</p>
                  {hood.topChef && <p className="text-xs text-orange-400 mt-2">👑 Top Chef: {hood.topChef.name}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const tabItems = [
    { id: "feed", label: "Local Feed", icon: "🍛" },
    { id: "chat", label: "Chat", icon: "💬" },
    { id: "members", label: "Members", icon: "👥" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 capitalize">🏘️ {myHood}</h1>
          <p className="text-gray-400 text-sm mt-1">{hoodData?.members?.length || 0} neighbors • Your local food community</p>
        </div>
        {hoodData?.topChef && (
          <div className="glass-card p-3 text-center"><p className="text-xs text-gray-400 mb-1">👑 Chef of the Week</p>
            <p className="text-sm font-bold text-orange-400">{hoodData.topChef.name}</p></div>
        )}
      </div>

      <div className="flex gap-2 mb-6 bg-black/20 p-1 rounded-2xl border border-white/5">
        {tabItems.map((tab) => (
          <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === tab.id ? "text-orange-400" : "text-gray-400 hover:text-gray-200"
            }`}>
            {activeTab === tab.id && <motion.div layoutId="hood-tab" className="absolute inset-0 bg-orange-500/15 rounded-xl" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
            <span className="relative">{tab.icon} {tab.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "feed" && (
          <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {meals.length === 0 ? (
              <div className="glass-card text-center py-12"><p className="text-gray-400">No meals in your neighborhood right now. Be the first! 🍳</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {meals.map((meal) => (
                  <motion.div key={meal._id} whileHover={{ y: -2 }} className="glass-card p-4 flex gap-4 transition-colors">
                    <img src={meal.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400"} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" alt={meal.dish} />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-white truncate">{meal.dish}</h4>
                      <p className="text-orange-400 text-sm font-semibold">₹{meal.priceMin} - ₹{meal.priceMax}</p>
                      <div className="flex items-center gap-2 mt-1"><p className="text-xs text-gray-400 truncate">{meal.userId?.name}</p>
                        {meal.userId?.isVerifiedKitchen && <span className="text-xs">✅</span>}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "chat" && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-4 mb-4 h-[400px] overflow-y-auto flex flex-col space-y-3">
              {(!hoodData?.chat || hoodData.chat.length === 0) ? (
                <div className="flex-grow flex items-center justify-center"><p className="text-gray-500 text-sm">No messages yet. Say hi! 👋</p></div>
              ) : hoodData.chat.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden border border-white/10 flex-shrink-0">
                    {msg.userAvatar ? <img src={msg.userAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">👤</div>}
                  </div>
                  <div className="flex-grow"><div className="flex items-center gap-2"><span className="text-sm font-semibold text-white">{msg.userName}</span>
                    <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                    <p className="text-sm text-gray-300 mt-0.5">{msg.message}</p></div>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder="Type a message..." className="flex-grow px-4 py-3 rounded-xl glass-input text-sm"
                value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendChat()} />
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleSendChat}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 rounded-xl font-semibold shadow-lg">Send</motion.button>
            </div>
          </motion.div>
        )}

        {activeTab === "members" && (
          <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-3">
              {(hoodData?.members || []).map((member, i) => (
                <motion.div key={member._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-white/10">
                      {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">👤</div>}
                    </div>
                    <div><div className="flex items-center gap-2"><p className="font-semibold text-white">{member.name}</p>
                      {member.isVerifiedKitchen && <span className="text-xs">✅</span>}{member.currentStreak >= 7 && <span className="text-xs">🔥</span>}</div>
                      <div className="flex items-center gap-2"><span className="text-xs text-yellow-400">★ {member.ratingAverage?.toFixed(1) || "New"}</span>
                        <span className="text-xs text-gray-500">• {member.totalMealsShared || 0} meals</span></div></div>
                  </div>
                  <div className="flex gap-1">{(member.badges || []).slice(0, 3).map((badge, j) => <span key={j} className="text-sm" title={badge.name}>{badge.icon}</span>)}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
