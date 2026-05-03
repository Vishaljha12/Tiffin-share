import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSession } from "../utils/CheckSession";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token") && checkSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't show navbar on IntroPage
  if (location.pathname === "/") return null;

  const navItems = [
    { path: "/home", label: "Explore", icon: "🍽️" },
    { path: "/stories", label: "Stories", icon: "📸" },
    { path: "/neighborhood", label: "Community", icon: "🏘️", auth: true },
    { path: "/demand", label: "Heatmap", icon: "📊" },
    { path: "/leaderboard", label: "Ranks", icon: "🏆" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-black/50 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.h1
            onClick={() => handleNavigate("/")}
            className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 font-black text-xl cursor-pointer flex items-center gap-1.5"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-2xl">🍱</span> TiffinShare
          </motion.h1>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.auth && !isLoggedIn) return null;
              const active = isActive(item.path);
              return (
                <motion.button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    active
                      ? "text-orange-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-orange-500/12 border border-orange-500/20 rounded-xl"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative text-base">{item.icon}</span>
                  <span className="relative">{item.label}</span>
                </motion.button>
              );
            })}

            <div className="w-px h-6 bg-white/8 mx-2"></div>

            {isLoggedIn ? (
              <>
                <motion.button
                  onClick={() => handleNavigate("/postmeals")}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive("/postmeals")
                      ? "text-orange-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {isActive("/postmeals") && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-orange-500/12 border border-orange-500/20 rounded-xl"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative">➕ Post</span>
                </motion.button>
                <motion.button
                  onClick={() => handleNavigate("/profile")}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-4 py-2 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Profile 👤
                </motion.button>
              </>
            ) : (
              <motion.button
                onClick={() => handleNavigate("/login")}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-4 py-2 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
              >
                Login 🔐
              </motion.button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <motion.button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2 rounded-xl hover:bg-white/8 transition"
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.path
                    key="close"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    transition={{ duration: 0.2 }}
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <motion.path
                    key="open"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    transition={{ duration: 0.2 }}
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </AnimatePresence>
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden border-t border-white/[0.04] bg-black/70 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item, i) => {
                if (item.auth && !isLoggedIn) return null;
                return (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 ${
                      isActive(item.path) ? "bg-orange-500/12 text-orange-400" : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span> {item.label}
                  </motion.button>
                );
              })}
              {isLoggedIn ? (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.05 }}
                    onClick={() => handleNavigate("/postmeals")}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 flex items-center gap-2.5"
                  >
                    <span className="text-lg">➕</span> Post Meal
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (navItems.length + 1) * 0.05 }}
                    onClick={() => handleNavigate("/profile")}
                    className="w-full mt-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/20"
                  >
                    Profile 👤
                  </motion.button>
                </>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.05 }}
                  onClick={() => handleNavigate("/login")}
                  className="w-full mt-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/20"
                >
                  Login 🔐
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}