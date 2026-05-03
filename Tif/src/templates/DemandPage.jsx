import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function DemandPage() {
  const [demandData, setDemandData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchDemand = (loc = "") => {
    setIsLoading(true);
    fetch(`http://localhost:5000/api/meals/demand?location=${loc}`)
      .then(r => r.json())
      .then(data => { setDemandData(data.demand || []); setSuggestions(data.suggestions || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { fetchDemand(); }, []);

  const getHeatColor = (claimed, total) => {
    const ratio = total > 0 ? claimed / total : 0;
    if (ratio > 0.7) return "from-red-500 to-orange-500";
    if (ratio > 0.4) return "from-orange-500 to-yellow-500";
    if (ratio > 0.2) return "from-yellow-500 to-green-500";
    return "from-green-500 to-emerald-500";
  };

  const getHeatLabel = (claimed, total) => {
    const ratio = total > 0 ? claimed / total : 0;
    if (ratio > 0.7) return { text: "🔥 HIGH DEMAND", color: "text-red-400" };
    if (ratio > 0.4) return { text: "🟠 MODERATE", color: "text-orange-400" };
    if (ratio > 0.2) return { text: "🟡 LOW", color: "text-yellow-400" };
    return { text: "🟢 FRESH", color: "text-green-400" };
  };

  const getCuisineIcon = (cuisine) => {
    const icons = { "South Indian": "🥘", "Chinese": "🥡", "Desserts": "🍰", "Beverages": "🥤", "Italian": "🍝", "Street Food": "🌮" };
    return icons[cuisine] || "🍛";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 relative overflow-hidden">
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-orange-500/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 mb-3">📊 Demand Heatmap</h1>
        <p className="text-gray-400 text-lg">See what food is trending in your area. Cook what people want!</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-3 mb-8">
        <input placeholder="Filter by location (e.g. Andheri, Delhi)" className="flex-grow px-4 py-3 rounded-xl glass-input"
          value={location} onChange={(e) => setLocation(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchDemand(location)} />
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => fetchDemand(location)}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 rounded-xl font-semibold shadow-lg hover:shadow-orange-500/30 transition-shadow">Search</motion.button>
      </motion.div>

      {suggestions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">🤖 Smart Suggestions</h3>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="glass-card p-4 border-l-4 border-orange-500"><p className="text-gray-200 text-sm">{s}</p></motion.div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="glass-card p-4 h-20 skeleton" />)}</div>
      ) : demandData.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card text-center py-12">
          <span className="text-5xl block mb-3">📉</span><p className="text-xl text-gray-400">No demand data yet</p>
          <p className="text-sm text-gray-500 mt-2">Post meals and claim to generate demand insights!</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">📈 Live Demand Data (Last 24h)</h3>
          {demandData.map((item, i) => {
            const heat = getHeatLabel(item.totalClaimed, item.totalListings);
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ x: 3 }} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCuisineIcon(item._id?.cuisine)}</span>
                    <div><p className="font-bold text-white">{item._id?.cuisine || "Other"}</p>
                      <p className="text-xs text-gray-400">📍 {item._id?.location || "All areas"}</p></div>
                  </div>
                  <span className={`text-xs font-bold ${heat.color}`}>{heat.text}</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-grow"><div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((item.totalClaimed / Math.max(item.totalListings, 1)) * 100, 100)}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className={`h-full bg-gradient-to-r ${getHeatColor(item.totalClaimed, item.totalListings)} rounded-full`} /></div></div>
                  <div className="text-right flex-shrink-0"><p className="text-sm text-white font-semibold">{item.totalClaimed}/{item.totalListings}</p>
                    <p className="text-xs text-gray-500">claimed</p></div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
