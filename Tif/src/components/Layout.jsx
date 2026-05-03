import React from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

export default function Layout({ children }) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative flex flex-col overflow-hidden">
      {/* Animated background orbs */}
      <div className="bg-gradient-orb bg-orange-600/25 w-[40vw] h-[40vw] top-[-10vw] left-[-10vw]" style={{ animationDelay: '0s' }}></div>
      <div className="bg-gradient-orb bg-purple-600/15 w-[30vw] h-[30vw] bottom-[-5vw] right-[-5vw]" style={{ animationDelay: '-5s' }}></div>
      <div className="bg-gradient-orb bg-indigo-600/15 w-[20vw] h-[20vw] top-[40%] left-[20%]" style={{ animationDelay: '-10s' }}></div>
      <div className="bg-gradient-orb bg-orange-500/10 w-[15vw] h-[15vw] top-[20%] right-[10%]" style={{ animationDelay: '-15s' }}></div>

      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-grow z-10 w-full"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
