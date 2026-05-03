import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function FeedPage() {
  const [meals, setMeals] = useState([]);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [swapModal, setSwapModal] = useState(null);
  const [swapDish, setSwapDish] = useState("");
  const [giftModal, setGiftModal] = useState(null);
  const [giftMessage, setGiftMessage] = useState("");
  const [giftLink, setGiftLink] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchMeals = useCallback((type = "") => {
    setIsLoading(true);
    const params = type && type !== "all" ? `type=${type}` : "";
    fetch(`http://localhost:5000/api/meals${params ? "?" + params : ""}`)
      .then((res) => res.json())
      .then((data) => { setMeals(Array.isArray(data) ? data : []); setIsLoading(false); })
      .catch(() => { toast("Failed to load meals", "error"); setIsLoading(false); });
  }, [toast]);

  const fetchStories = useCallback(() => {
    fetch("http://localhost:5000/api/meals/stories")
      .then((res) => res.json())
      .then((data) => setStories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchMeals(); fetchStories(); }, [fetchMeals, fetchStories]);

  const handleFilterChange = (f) => { setActiveFilter(f); fetchMeals(f); };

  const getStreakBadge = (s) => s >= 100 ? "🔥🔥🔥" : s >= 30 ? "🔥🔥" : s >= 7 ? "🔥" : "";

  const requireAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return null; }
    return token;
  };

  const handleClaim = async (mealId) => {
    const token = requireAuth(); if (!token) return;
    setActionLoading(mealId);
    try {
      const res = await fetch(`http://localhost:5000/api/meals/${mealId}/claim`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: token },
      });
      const data = await res.json();
      if (!res.ok) { toast(data.message || "Failed to claim", "error"); setActionLoading(null); return; }
      toast(data.message, "claim");
      fetchMeals(activeFilter);
    } catch { toast("Server error", "error"); }
    setActionLoading(null);
  };

  const handlePreOrder = async (mealId) => {
    const token = requireAuth(); if (!token) return;
    setActionLoading(mealId);
    try {
      const res = await fetch(`http://localhost:5000/api/meals/${mealId}/preorder`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: token },
      });
      const data = await res.json();
      toast(res.ok ? data.message : (data.message || "Failed"), res.ok ? "success" : "error");
      if (res.ok) fetchMeals(activeFilter);
    } catch { toast("Server error", "error"); }
    setActionLoading(null);
  };

  const handleSwapAccept = async () => {
    if (!swapDish.trim()) { toast("Enter what you'll swap!", "warning"); return; }
    const token = requireAuth(); if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/meals/${swapModal._id}/swap`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ myDish: swapDish }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.message || "Failed", "error"); return; }
      toast(data.message, "swap");
      setSwapModal(null); setSwapDish(""); fetchMeals(activeFilter);
    } catch { toast("Server error", "error"); }
  };

  const handleGift = async () => {
    const token = requireAuth(); if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/meals/${giftModal._id}/gift`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ message: giftMessage }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.message || "Failed", "error"); return; }
      setGiftLink(window.location.origin + data.giftLink);
      toast("Gift created! Share the link 🎁", "gift");
    } catch { toast("Server error", "error"); }
  };

  const handleSubscribe = async (meal) => {
    const token = requireAuth(); if (!token) return;
    setActionLoading(meal._id);
    try {
      const res = await fetch("http://localhost:5000/api/subscriptions", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          chefId: meal.userId?._id, planName: meal.dish,
          weeklyPrice: meal.subscriptionPlan?.weeklyPrice || meal.priceMin,
          daysPerWeek: meal.subscriptionPlan?.daysPerWeek || 5,
          description: meal.subscriptionPlan?.description || "",
        }),
      });
      const data = await res.json();
      toast(res.ok ? data.message : data.message, res.ok ? "success" : "error");
    } catch { toast("Server error", "error"); }
    setActionLoading(null);
  };

  const filters = [
    { id: "all", label: "All", icon: "🍽️" }, { id: "regular", label: "Regular", icon: "🥗" },
    { id: "mystery", label: "Mystery", icon: "🎰" }, { id: "swap", label: "Swap", icon: "🤝" },
    { id: "preorder", label: "Pre-Order", icon: "🗓️" }, { id: "subscription", label: "Subscribe", icon: "📦" },
  ];

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 16, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } } };

  return (
    <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto relative">
      {/* Stories Bar */}
      {stories.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Live Stories</h3>
            <button onClick={() => navigate("/stories")} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">View All →</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {stories.slice(0, 10).map((story) => (
              <motion.div key={story._id} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/stories")} className="flex-shrink-0 cursor-pointer group">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#0a0a0f]">
                    {story.userId?.avatar ? <img src={story.userId.avatar} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gray-800 flex items-center justify-center text-lg">👨‍🍳</div>}
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center mt-1 truncate w-16 group-hover:text-white transition-colors">
                  {story.userId?.name?.split(" ")[0] || "Chef"}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">Available Meals 🍽️</h2>
        <motion.button whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/postmeals")}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-5 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-lg shadow-orange-500/20 btn-ripple">
          + Post Meal
        </motion.button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {filters.map((f) => (
          <motion.button key={f.id} onClick={() => handleFilterChange(f.id)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className={`relative flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              activeFilter === f.id ? "text-orange-400 border-orange-500/30" : "text-gray-400 border-white/5 hover:text-white"
            }`}>
            {activeFilter === f.id && (
              <motion.div layoutId="filter-pill" className="absolute inset-0 bg-orange-500/12 rounded-full"
                transition={{ type: "spring", stiffness: 350, damping: 30 }} />
            )}
            <span className="relative">{f.icon} {f.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Meals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card overflow-hidden !p-0">
              <div className="h-48 skeleton" /><div className="p-4 space-y-3">
                <div className="h-4 skeleton w-3/4" /><div className="h-3 skeleton w-1/2" /><div className="h-10 skeleton mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : meals.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card text-center py-16">
          <span className="text-5xl block mb-3">😔</span>
          <p className="text-xl text-gray-400">No meals available right now</p>
          <p className="text-sm text-gray-500 mt-2">Check back later or post one yourself!</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {meals.map((meal) => (
            <motion.div key={meal._id} variants={itemVariants} whileHover={{ y: -4 }}
              className="glass-card overflow-hidden group flex flex-col h-full !p-0 relative">
              {/* Badges */}
              <div className="absolute top-3 left-3 z-10 flex gap-1.5 flex-wrap">
                {meal.isMystery && <span className="bg-purple-500/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg badge-shine">🎰 Mystery</span>}
                {meal.isSwap && <span className="bg-blue-500/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">🤝 Swap</span>}
                {meal.isPreOrder && <span className="bg-green-500/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">🗓️ Pre-Order</span>}
                {meal.isSubscription && <span className="bg-pink-500/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">📦 Subscribe</span>}
                {meal.isCookAlong && <span className="bg-red-500/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg pulse-glow">🎉 LIVE</span>}
              </div>
              {meal.userId?.isVerifiedKitchen && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-green-500/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg" title="Verified Kitchen">✅</span>
                </div>
              )}

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                {meal.isMystery ? (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-purple-600 flex items-center justify-center">
                    <div className="text-center"><span className="text-5xl block mb-2">🎰</span>
                      <p className="text-white/80 font-semibold text-sm">Mystery Meal</p>
                      <p className="text-white/50 text-xs">What will you get?</p></div>
                  </div>
                ) : (
                  <img src={meal.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800"} alt={meal.dish}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <h3 className="text-lg font-bold text-white leading-tight max-w-[65%]">{meal.isMystery ? "???" : meal.dish}</h3>
                  <div className="bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm whitespace-nowrap">
                    {meal.isSwap ? "Swap" : `₹${meal.priceMin}${meal.priceMin !== meal.priceMax ? ` - ${meal.priceMax}` : ""}`}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                <div className="flex items-center space-x-3 pb-3 border-b border-white/5">
                  <div className="w-9 h-9 rounded-full bg-gray-800 overflow-hidden border border-white/10 flex-shrink-0">
                    {meal.userId?.avatar ? <img src={meal.userId.avatar} alt="chef" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-sm">👨‍🍳</div>}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-gray-200 truncate">{meal.userId?.name || "Anonymous Chef"}</p>
                      {getStreakBadge(meal.userId?.currentStreak) && <span className="text-xs">{getStreakBadge(meal.userId?.currentStreak)}</span>}
                      {meal.userId?.isVerifiedKitchen && <span className="text-xs">✅</span>}
                    </div>
                    <div className="flex items-center text-xs text-yellow-400"><span>★</span>
                      <span className="ml-1 text-gray-400">{meal.userId?.ratingAverage ? meal.userId.ratingAverage.toFixed(1) : "New"} {meal.userId?.ratingCount ? `(${meal.userId.ratingCount})` : ""}</span>
                    </div>
                  </div>
                </div>

                {meal.isSwap && meal.swapWanted && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5">
                    <p className="text-xs text-blue-300"><span className="font-semibold">Want in return:</span> {meal.swapWanted}</p>
                  </div>
                )}
                {meal.isPreOrder && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-2.5">
                    <div className="flex justify-between text-xs text-green-300 mb-1.5">
                      <span>{meal.preOrderCount || 0}/{meal.preOrderMinOrders || 3} orders</span>
                      <span>{meal.preOrderConfirmed ? "✅ Confirmed!" : "Needs more"}</span>
                    </div>
                    <div className="w-full h-1.5 bg-green-900/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full progress-bar"
                        style={{ width: `${Math.min(((meal.preOrderCount || 0) / (meal.preOrderMinOrders || 3)) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
                {meal.isSubscription && meal.subscriptionPlan && (
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-2.5">
                    <p className="text-xs text-pink-300"><span className="font-semibold">₹{meal.subscriptionPlan.weeklyPrice}/week</span> • {meal.subscriptionPlan.daysPerWeek} days</p>
                    {meal.subscriptionPlan.description && <p className="text-xs text-pink-200/60 mt-0.5">{meal.subscriptionPlan.description}</p>}
                  </div>
                )}
                {(meal.ingredients?.length > 0 || meal.allergens?.length > 0) && (
                  <div className="bg-white/3 border border-white/5 rounded-xl p-2.5">
                    <p className="text-xs text-gray-300 font-semibold mb-1">🧾 Meal Passport</p>
                    {meal.ingredients?.length > 0 && <p className="text-xs text-gray-400 truncate">Ingredients: {meal.ingredients.join(", ")}</p>}
                    {meal.allergens?.length > 0 && <p className="text-xs text-red-300 truncate">⚠️ {meal.allergens.join(", ")}</p>}
                  </div>
                )}
                <div className="space-y-1.5">
                  {meal.time && <div className="flex items-center text-xs text-gray-400"><span className="mr-2">⏰</span>{meal.time}</div>}
                  {meal.location && <div className="flex items-center text-xs text-gray-400"><span className="mr-2">📍</span>{meal.location}</div>}
                </div>

                {/* Actions */}
                <div className="space-y-2 mt-auto pt-2">
                  {meal.isSwap ? (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setSwapModal(meal)}
                      className="w-full bg-blue-500/10 hover:bg-blue-500 border border-blue-500/30 hover:border-blue-500 text-blue-400 hover:text-white font-medium py-2.5 rounded-xl transition-all text-sm">🤝 Offer Swap</motion.button>
                  ) : meal.isPreOrder ? (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => handlePreOrder(meal._id)} disabled={actionLoading === meal._id}
                      className="w-full bg-green-500/10 hover:bg-green-500 border border-green-500/30 hover:border-green-500 text-green-400 hover:text-white font-medium py-2.5 rounded-xl transition-all text-sm disabled:opacity-50">
                      {actionLoading === meal._id ? "..." : "🗓️ Pre-Order"}</motion.button>
                  ) : meal.isSubscription ? (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleSubscribe(meal)} disabled={actionLoading === meal._id}
                      className="w-full bg-pink-500/10 hover:bg-pink-500 border border-pink-500/30 hover:border-pink-500 text-pink-400 hover:text-white font-medium py-2.5 rounded-xl transition-all text-sm disabled:opacity-50">
                      {actionLoading === meal._id ? "..." : "📦 Subscribe Weekly"}</motion.button>
                  ) : (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleClaim(meal._id)} disabled={actionLoading === meal._id}
                      className="w-full bg-white/5 hover:bg-orange-500 border border-white/10 hover:border-orange-500 text-white font-medium py-2.5 rounded-xl transition-all text-sm disabled:opacity-50">
                      {actionLoading === meal._id ? "..." : "Claim Meal"}</motion.button>
                  )}
                  {!meal.isSwap && !meal.isSubscription && (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setGiftModal(meal); setGiftLink(""); setGiftMessage(""); }}
                      className="w-full bg-white/3 hover:bg-white/8 border border-white/5 text-gray-400 hover:text-white font-medium py-2 rounded-xl transition-all text-xs">🎁 Gift to Friend</motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Swap Modal */}
      <AnimatePresence>
        {swapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSwapModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="glass-card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">🤝 Offer a Swap</h3>
              <p className="text-center text-gray-400 text-sm mb-4">Trade your dish for <span className="text-blue-300 font-semibold">{swapModal.dish}</span></p>
              {swapModal.swapWanted && <p className="text-center text-xs text-blue-300/60 mb-4">They want: {swapModal.swapWanted}</p>}
              <input placeholder="What dish will you swap?" value={swapDish} onChange={(e) => setSwapDish(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSwapAccept()}
                className="w-full px-4 py-3 rounded-xl glass-input mb-4 text-sm" />
              <div className="flex gap-3">
                <button onClick={() => setSwapModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 text-sm transition-colors">Cancel</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSwapAccept}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm shadow-lg">Accept Swap</motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gift Modal */}
      <AnimatePresence>
        {giftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setGiftModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="glass-card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-500">🎁 Gift This Meal</h3>
              <p className="text-center text-gray-400 text-sm mb-4">Send <span className="text-pink-300 font-semibold">{giftModal.dish}</span> to a friend!</p>
              <input placeholder="Add a message (optional)" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input mb-4 text-sm" />
              {giftLink && (
                <div className="mb-4">
                  <p className="text-xs text-green-400 mb-2">✅ Gift created! Share this link:</p>
                  <div className="flex gap-2">
                    <input readOnly value={giftLink} className="flex-grow px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-gray-300 text-xs" />
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => { navigator.clipboard.writeText(giftLink); toast("Link copied! 📋", "success"); }}
                      className="px-3 py-2 bg-white/10 rounded-xl text-white text-xs font-medium hover:bg-white/15 transition-colors">Copy</motion.button>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setGiftModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 text-sm transition-colors">Close</button>
                {!giftLink && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleGift}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold text-sm shadow-lg">Create Gift 🎁</motion.button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}