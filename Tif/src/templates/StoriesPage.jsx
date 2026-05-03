import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

export default function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetch("http://localhost:5000/api/meals/stories")
      .then((res) => res.json())
      .then((data) => { setStories(Array.isArray(data) ? data : []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const handleClaim = async (storyId) => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      const res = await fetch(`http://localhost:5000/api/meals/${storyId}/claim`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: token },
      });
      const data = await res.json();
      toast(res.ok ? data.message : data.message, res.ok ? "claim" : "error");
    } catch { toast("Server error", "error"); }
  };

  const goNext = () => { if (activeIndex < stories.length - 1) { setDirection(1); setActiveIndex(activeIndex + 1); } };
  const goPrev = () => { if (activeIndex > 0) { setDirection(-1); setActiveIndex(activeIndex - 1); } };

  const getTimeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m left`;
  };

  if (isLoading) return <div className="flex justify-center items-center h-[80vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" /></div>;

  if (stories.length === 0) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-[70vh] px-6">
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="text-6xl mb-4">📸</motion.span>
      <h2 className="text-2xl font-bold text-white mb-2">No Stories Yet</h2>
      <p className="text-gray-400 text-center mb-6">Be the first to post a Tiffin Story! Share what you're cooking right now.</p>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/postmeals")}
        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">Post a Story 📸</motion.button>
    </motion.div>
  );

  const story = stories[activeIndex];
  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? 200 : -200, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d) => ({ x: d > 0 ? -200 : 200, opacity: 0, scale: 0.95 }),
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex gap-1 mb-4">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
            <motion.div className={`h-full rounded-full ${i <= activeIndex ? "bg-gradient-to-r from-orange-400 to-pink-500" : ""}`}
              initial={{ width: 0 }} animate={{ width: i <= activeIndex ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
          </div>
        ))}
      </div>

      <div className="flex-grow relative rounded-2xl overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-20 flex">
          <div className="w-1/3 cursor-pointer" onClick={goPrev} /><div className="w-1/3" /><div className="w-1/3 cursor-pointer" onClick={goNext} />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={story._id} custom={direction} variants={slideVariants}
            initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0">
            <img src={story.storyMedia || story.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800"}
              alt={story.dish} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500/50 bg-gray-800">
                  {story.userId?.avatar ? <img src={story.userId.avatar} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">👨‍🍳</div>}
                </div>
                <div><p className="text-white text-sm font-semibold">{story.userId?.name || "Chef"}</p>
                  <p className="text-white/50 text-xs">{story.userId?.isVerifiedKitchen ? "✅ Verified • " : ""}{getTimeLeft(story.storyExpiresAt)}</p></div>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/home")} className="text-white/60 hover:text-white text-2xl transition-colors">✕</motion.button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <h3 className="text-2xl font-black text-white mb-1">{story.dish}</h3>
              {story.storyCaption && <p className="text-white/70 text-sm mb-3">{story.storyCaption}</p>}
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-orange-500/80 text-white text-sm font-bold px-3 py-1 rounded-full">₹{story.priceMin}{story.priceMin !== story.priceMax ? ` - ${story.priceMax}` : ""}</span>
                {story.location && <span className="text-white/60 text-sm">📍 {story.location}</span>}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => handleClaim(story._id)}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3.5 rounded-2xl shadow-2xl shadow-orange-500/30 text-lg btn-ripple">Claim Now 🔥</motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {stories.map((s, i) => (
          <motion.button key={s._id} onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
            animate={{ width: i === activeIndex ? 24 : 8 }}
            className={`h-2 rounded-full transition-colors ${i === activeIndex ? "bg-orange-500" : "bg-white/20"}`} />
        ))}
      </div>
    </div>
  );
}
