import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function IntroPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => { setIsLoggedIn(!!localStorage.getItem("token")); }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 25, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
  };

  const features = [
    { icon: "📸", title: "Tiffin Stories", desc: "Swipe through live cooking stories", color: "from-pink-500 to-orange-500" },
    { icon: "🏘️", title: "Neighborhoods", desc: "Join your local food community", color: "from-blue-500 to-cyan-500" },
    { icon: "🤝", title: "Meal Swap", desc: "Trade dishes with other cooks", color: "from-green-500 to-emerald-500" },
    { icon: "🎰", title: "Mystery Meal", desc: "Surprise tiffin — what will you get?", color: "from-purple-500 to-pink-500" },
    { icon: "🔥", title: "Streak System", desc: "Build daily cooking streaks", color: "from-orange-500 to-red-500" },
    { icon: "📦", title: "Subscriptions", desc: "Subscribe to weekly meal plans", color: "from-pink-500 to-rose-500" },
    { icon: "🎁", title: "Gift a Meal", desc: "Surprise a friend with food", color: "from-red-500 to-pink-500" },
    { icon: "📊", title: "Demand Heatmap", desc: "See what your area craves", color: "from-yellow-500 to-orange-500" },
  ];

  const handleFeatureClick = (title) => {
    const routes = {
      "Neighborhoods": "/neighborhood",
      "Demand Heatmap": "/demand",
      "Tiffin Stories": "/stories",
    };
    navigate(routes[title] || "/home");
  };

  return (
    <div className="min-h-[92vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <motion.div
        className="absolute top-[10%] left-[10%] w-72 h-72 bg-orange-500/20 blur-[120px] rounded-full pointer-events-none"
        animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-purple-500/15 blur-[140px] rounded-full pointer-events-none"
        animate={{ x: [0, -15, 20, 0], y: [0, 10, -20, 0], scale: [1, 0.95, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[40%] right-[20%] w-48 h-48 bg-pink-500/12 blur-[100px] rounded-full pointer-events-none"
        animate={{ x: [0, 15, -5, 0], y: [0, -10, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center max-w-4xl z-10">
        <motion.div
          variants={itemVariants}
          className="inline-block mb-5 px-5 py-2 rounded-full glass-card border border-orange-500/25 text-orange-400 text-sm font-semibold tracking-wide uppercase badge-shine"
        >
          India's #1 Homemade Food Sharing Platform 🚀
        </motion.div>

        <motion.h2 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
          Craving{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 glow-text">
            Ghar Ka Khana?
          </span>
        </motion.h2>

        <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-300/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Share meals, swap dishes, build streaks, and join your neighborhood kitchen community.
          Not just a food app — it's a food{" "}
          <span className="text-orange-400 font-medium">movement</span>.
        </motion.p>

        <motion.div variants={itemVariants} className="flex gap-4 justify-center flex-col sm:flex-row mb-16">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/home")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-xl shadow-orange-500/25 px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-orange-500/40 transition-all text-white btn-ripple"
          >
            Explore Meals 🍽️
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => isLoggedIn ? navigate("/postmeals") : navigate("/login")}
            className="glass-card border border-white/10 hover:border-orange-400/40 px-8 py-4 rounded-2xl text-lg font-semibold transition-all text-white"
          >
            Share Your Tiffin 📦
          </motion.button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6, scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.06 }}
              className="glass-card p-4 text-center cursor-pointer group"
              onClick={() => handleFeatureClick(f.title)}
            >
              <motion.span
                className="text-2xl block mb-2"
                whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
              >
                {f.icon}
              </motion.span>
              <p className="text-xs font-bold text-white">{f.title}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}