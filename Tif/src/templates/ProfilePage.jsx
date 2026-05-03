import React, { useEffect, useState } from "react";
import { logout } from "../utils/auth";
import { motion, AnimatePresence } from "framer-motion";
import RatingModal from "../components/RatingModal";
import { useToast } from "../components/Toast";

export default function ProfilePage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "", phone: "", bio: "", avatar: "", ratingAverage: 0, ratingCount: 0, badges: [], currentStreak: 0, longestStreak: 0, isVerifiedKitchen: false, verificationStatus: "none", totalMealsShared: 0, neighborhood: "", points: 0, referralCode: "" });
  const [myPosts, setMyPosts] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [mySubs, setMySubs] = useState([]);
  const [mySubscribers, setMySubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [kitchenUrl, setKitchenUrl] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const h = { headers: { Authorization: token } };
    fetch("http://localhost:5000/api/auth/profile", h).then(r => r.json()).then(d => { if (d && !d.message) setProfile(d); });
    fetch("http://localhost:5000/api/meals/my-posts", h).then(r => r.json()).then(d => setMyPosts(d || []));
    fetch("http://localhost:5000/api/meals/my-claims", h).then(r => r.json()).then(d => setMyClaims(d || []));
    fetch("http://localhost:5000/api/subscriptions/my", h).then(r => r.json()).then(d => setMySubs(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("http://localhost:5000/api/subscriptions/subscribers", h).then(r => r.json()).then(d => setMySubscribers(Array.isArray(d) ? d : [])).catch(() => {});
  }, [token]);

  const saveProfile = async () => {
    setIsLoading(true);
    await fetch("http://localhost:5000/api/auth/profile", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: token }, body: JSON.stringify(profile) });
    toast("Profile updated ✅", "success"); setIsLoading(false);
  };

  const handleReviewSubmit = async (rating, reviewText, mealId) => {
    const res = await fetch(`http://localhost:5000/api/meals/${mealId}/review`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: token }, body: JSON.stringify({ rating, reviewText }) });
    if (!res.ok) { const d = await res.json(); toast(d.message, "error"); return; }
    toast("Review submitted! 🌟", "success");
    fetch("http://localhost:5000/api/meals/my-claims", { headers: { Authorization: token } }).then(r => r.json()).then(d => setMyClaims(d || []));
  };

  const handleVerifyKitchen = async () => {
    if (!kitchenUrl.trim()) { toast("Enter a kitchen photo URL", "warning"); return; }
    const res = await fetch("http://localhost:5000/api/auth/verify-kitchen", { method: "POST", headers: { "Content-Type": "application/json", Authorization: token }, body: JSON.stringify({ kitchenPhotos: [kitchenUrl] }) });
    const d = await res.json();
    toast(d.message, res.ok ? "success" : "error");
    if (res.ok) setProfile({ ...profile, verificationStatus: "pending" });
  };

  const getStreakEmoji = (s) => s >= 100 ? "🔥🔥🔥" : s >= 30 ? "🔥🔥" : s >= 7 ? "🔥" : "💤";
  const getStreakTitle = (s) => s >= 100 ? "Legend" : s >= 30 ? "Dedicated Chef" : s >= 7 ? "On Fire" : "Build your streak!";

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" }, { id: "badges", label: "Badges", icon: "🏅" },
    { id: "posts", label: "My Posts", icon: "📝" }, { id: "claims", label: "Claims", icon: "📥" },
    { id: "subs", label: "Subs", icon: "📦" },
  ];

  const tabContent = {
    profile: (
      <motion.div key="profile" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
        <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-orange-500/50 bg-gray-800 flex-shrink-0">
            {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">👨‍🍳</div>}
          </div>
          <div className="flex-grow space-y-3 w-full">
            <div><label className="block text-xs text-gray-400 mb-1">Name</label><input value={profile.name || ""} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Phone</label><input value={profile.phone || ""} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input" /></div>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          <div><label className="block text-xs text-gray-400 mb-1">Avatar URL</label><input value={profile.avatar || ""} onChange={e => setProfile({ ...profile, avatar: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Bio</label><textarea value={profile.bio || ""} onChange={e => setProfile({ ...profile, bio: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-input min-h-[80px]" /></div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveProfile} disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-orange-500/25 mb-6 btn-ripple disabled:opacity-60">
          {isLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : "Save Profile 💾"}
        </motion.button>

        {/* Kitchen Verification */}
        <div className="p-5 rounded-2xl border border-green-500/20 bg-green-500/5 mb-6">
          <h3 className="font-bold text-white mb-2">🛡️ Kitchen Verification</h3>
          {profile.verificationStatus === "approved" ? (
            <p className="text-green-400 text-sm">✅ Your kitchen is verified! You get priority in the feed.</p>
          ) : profile.verificationStatus === "pending" ? (
            <p className="text-yellow-400 text-sm">⏳ Verification pending review...</p>
          ) : (<>
            <p className="text-gray-400 text-xs mb-3">Upload a photo of your kitchen to get the Verified badge.</p>
            <div className="flex gap-2">
              <input placeholder="Kitchen photo URL" value={kitchenUrl} onChange={e => setKitchenUrl(e.target.value)} className="flex-grow px-3 py-2 rounded-xl glass-input text-sm" />
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleVerifyKitchen} className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm font-medium border border-green-500/30 hover:bg-green-500/30 transition-colors">Submit</motion.button>
            </div></>
          )}
        </div>

        {/* Referral */}
        <div className="p-5 rounded-2xl border border-orange-500/20 bg-orange-500/5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white">🎁 Refer & Earn</h3>
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">{profile.points || 0} pts</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Earn 50 points per referral!</p>
          <div className="flex gap-2">
            <input readOnly value={`${window.location.origin}/register?ref=${profile.referralCode || ""}`} className="flex-grow px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-gray-300 text-xs" />
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/register?ref=${profile.referralCode}`); toast("Copied! 📋", "success"); }}
              className="bg-white/10 text-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/15 transition-colors">Copy</motion.button>
          </div>
        </div>
      </motion.div>
    ),
    badges: (
      <motion.div key="badges" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
        <div className="glass-card p-5 mb-6 border-l-4 border-orange-500">
          <h3 className="font-bold text-white mb-2">{getStreakEmoji(profile.currentStreak)} Cooking Streak</h3>
          <div className="flex items-center gap-6">
            <div><p className="text-3xl font-black text-orange-400">{profile.currentStreak}</p><p className="text-xs text-gray-400">Current</p></div>
            <div><p className="text-3xl font-black text-gray-300">{profile.longestStreak || 0}</p><p className="text-xs text-gray-400">Best</p></div>
            <div className="flex-grow text-right"><p className="text-sm text-gray-300 font-semibold">{getStreakTitle(profile.currentStreak)}</p><p className="text-xs text-gray-500">Post daily to keep going!</p></div>
          </div>
        </div>
        <h3 className="font-bold text-white mb-3">🏅 Your Badges ({(profile.badges || []).length})</h3>
        {(profile.badges || []).length === 0 ? <p className="text-gray-500 text-sm">No badges yet. Keep cooking!</p> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(profile.badges || []).map((b, i) => (
              <motion.div key={i} whileHover={{ y: -3 }} className="glass-card p-4 text-center"><span className="text-3xl block mb-2">{b.icon}</span>
                <p className="font-semibold text-white text-sm">{b.name}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(b.earnedAt).toLocaleDateString()}</p></motion.div>
            ))}
          </div>
        )}
        <h3 className="font-bold text-white mt-6 mb-3 text-sm text-gray-400">All Achievements</h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            { icon: "🌱", name: "First Meal", req: "Post your first meal" }, { icon: "⭐", name: "Five Star", req: "Get a 5-star review" },
            { icon: "💯", name: "Century Chef", req: "Share 100 meals" }, { icon: "🌍", name: "Variety King", req: "Post 10 different cuisines" },
            { icon: "❤️", name: "Community Favorite", req: "Claimed by 50 unique users" },
            { icon: "🕐", name: "Early Bird", req: "Post before 7 AM" }, { icon: "🌙", name: "Night Owl", req: "Post after 10 PM" },
          ].map((b, i) => {
            const earned = (profile.badges || []).find(ub => ub.name === b.name);
            return (
              <motion.div key={i} whileHover={{ x: 3 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${earned ? "bg-green-500/10 border border-green-500/20" : "bg-white/3 border border-white/5 opacity-50"}`}>
                <span className="text-2xl">{b.icon}</span>
                <div><p className="text-sm font-medium text-white">{b.name}</p><p className="text-xs text-gray-400">{b.req}</p></div>
                {earned && <span className="ml-auto text-green-400 text-sm">✅</span>}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    ),
    posts: (
      <motion.div key="posts" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
        {myPosts.length === 0 ? <p className="text-gray-500 text-center py-12">No meals posted yet.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myPosts.map(meal => (
              <motion.div key={meal._id} whileHover={{ y: -2 }} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3 transition-colors hover:border-white/15">
                <img src={meal.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400"} className="w-16 h-16 rounded-xl object-cover" alt={meal.dish} />
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2"><h4 className="font-bold text-white truncate">{meal.dish}</h4>{meal.isMystery && <span className="text-xs">🎰</span>}{meal.isSwap && <span className="text-xs">🤝</span>}</div>
                  <p className="text-orange-400 text-xs font-semibold">₹{meal.priceMin} - ₹{meal.priceMax}</p>
                  <p className="text-xs mt-1">{meal.isClaimed ? <span className="text-green-400">Claimed by {meal.claimedBy?.name || "Someone"}</span> : <span className="text-yellow-400">Available</span>}</p>
                  {meal.rating && <div className="text-yellow-400 text-xs mt-1">{"★".repeat(meal.rating)} <span className="text-gray-400 italic">"{meal.reviewText}"</span></div>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    ),
    claims: (
      <motion.div key="claims" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
        {myClaims.length === 0 ? <p className="text-gray-500 text-center py-12">No meals claimed yet.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myClaims.map(meal => (
              <motion.div key={meal._id} whileHover={{ y: -2 }} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3 transition-colors hover:border-white/15">
                <img src={meal.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400"} className="w-16 h-16 rounded-xl object-cover" alt={meal.dish} />
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-white truncate">{meal.dish}</h4>
                  <p className="text-xs text-gray-400">Chef: {meal.userId?.name || "Unknown"}</p>
                  {meal.rating ? (
                    <div className="text-yellow-400 text-xs mt-1">{"★".repeat(meal.rating)} <span className="text-gray-400 italic">"{meal.reviewText}"</span></div>
                  ) : (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setSelectedMeal(meal); setRatingModalOpen(true); }}
                      className="text-xs border border-orange-500/50 text-orange-400 hover:bg-orange-500/20 px-3 py-1.5 rounded-xl mt-1 w-full transition-colors">Leave Review ⭐</motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    ),
    subs: (
      <motion.div key="subs" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
        <h3 className="font-bold text-white mb-3">📦 My Subscriptions</h3>
        {mySubs.length === 0 ? <p className="text-gray-500 text-sm mb-6">You haven't subscribed to any chef yet.</p> : (
          <div className="space-y-3 mb-6">
            {mySubs.map(sub => (
              <motion.div key={sub._id} whileHover={{ y: -2 }} className="glass-card p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                    {sub.chefId?.avatar ? <img src={sub.chefId.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">👨‍🍳</div>}
                  </div>
                  <div><p className="font-semibold text-white text-sm">{sub.chefId?.name}'s {sub.planName}</p>
                    <p className="text-xs text-orange-400">₹{sub.weeklyPrice}/week • {sub.daysPerWeek} days</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${sub.status === "active" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>{sub.status}</span>
                  {sub.status === "active" && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={async () => {
                      await fetch(`http://localhost:5000/api/subscriptions/${sub._id}/cancel`, { method: "POST", headers: { Authorization: token } });
                      toast("Subscription cancelled", "info"); window.location.reload();
                    }} className="text-xs text-red-400 hover:underline">Cancel</motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <h3 className="font-bold text-white mb-3">👥 My Subscribers</h3>
        {mySubscribers.length === 0 ? <p className="text-gray-500 text-sm">No subscribers yet. Post a subscription plan!</p> : (
          <div className="space-y-2">
            {mySubscribers.map(sub => (
              <div key={sub._id} className="glass-card p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden"><div className="w-full h-full flex items-center justify-center text-sm">👤</div></div>
                <div><p className="text-sm text-white">{sub.subscriberId?.name}</p><p className="text-xs text-gray-400">₹{sub.weeklyPrice}/week</p></div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    ),
  };

  return (
    <div className="flex justify-center py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-[-60px] left-[-60px] w-44 h-44 bg-purple-500/15 blur-3xl rounded-full pointer-events-none" />

        <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-5">
          <div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-2">Dashboard</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-black/30 px-3 py-1 rounded-full border border-white/5 text-sm">★ {profile.ratingAverage ? profile.ratingAverage.toFixed(1) : "New"} <span className="text-gray-400 text-xs">({profile.ratingCount || 0})</span></span>
              <span className="bg-orange-500/15 px-3 py-1 rounded-full border border-orange-500/20 text-orange-400 text-sm font-semibold">{getStreakEmoji(profile.currentStreak)} {profile.currentStreak}-day</span>
              {profile.isVerifiedKitchen && <span className="bg-green-500/15 px-3 py-1 rounded-full border border-green-500/20 text-green-400 text-sm">✅ Verified</span>}
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={logout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm transition-colors">Logout 🚪</motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-black/20 p-1 rounded-2xl border border-white/5 overflow-x-auto">
          {tabs.map(t => (
            <motion.button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`relative flex-1 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors whitespace-nowrap px-2 flex items-center justify-center gap-1 ${activeTab === t.id ? "text-orange-400" : "text-gray-400 hover:text-gray-200"}`}>
              {activeTab === t.id && (
                <motion.div layoutId="profile-tab" className="absolute inset-0 bg-orange-500/15 rounded-xl"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }} />
              )}
              <span className="relative hidden sm:inline">{t.icon}</span>
              <span className="relative">{t.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">{tabContent[activeTab]}</AnimatePresence>
      </motion.div>

      {selectedMeal && <RatingModal isOpen={ratingModalOpen} onClose={() => { setRatingModalOpen(false); setTimeout(() => setSelectedMeal(null), 300); }} targetMeal={selectedMeal} onSubmit={handleReviewSubmit} />}
    </div>
  );
}