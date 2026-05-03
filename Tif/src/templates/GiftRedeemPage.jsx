import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "../components/Toast";

export default function GiftRedeemPage() {
  const { token: giftToken } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [status, setStatus] = useState("loading");
  const [meal, setMeal] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = async () => {
    const authToken = localStorage.getItem("token");
    if (!authToken) { navigate(`/login?redirect=/gift/${giftToken}`); return; }
    setIsRedeeming(true);
    try {
      const res = await fetch(`http://localhost:5000/api/meals/gift/redeem/${giftToken}`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: authToken },
      });
      const data = await res.json();
      if (res.ok) { setMeal(data.meal); setStatus("redeemed"); toast("Gift redeemed! 🎉", "gift"); }
      else { setStatus("error"); toast(data.message || "Failed to redeem", "error"); }
    } catch { setStatus("error"); }
    setIsRedeeming(false);
  };

  useEffect(() => { setStatus("ready"); }, []);

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass-card w-full max-w-md p-8 text-center relative overflow-hidden">
        <div className="absolute top-[-50px] left-[-50px] w-36 h-36 bg-pink-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-[-50px] right-[-50px] w-36 h-36 bg-orange-500/20 blur-3xl rounded-full pointer-events-none" />

        {status === "loading" && <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto" />}

        {status === "ready" && (<>
          <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }} className="text-7xl block mb-4">🎁</motion.span>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-500 mb-3">Someone sent you a Tiffin!</h2>
          <p className="text-gray-400 mb-8">A friend has gifted you a delicious meal. Claim it now!</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRedeem} disabled={isRedeeming}
            className="bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-2xl shadow-pink-500/30 btn-ripple disabled:opacity-60">
            {isRedeeming ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Opening...</span> : "Open Gift 🎉"}
          </motion.button>
        </>)}

        {status === "redeemed" && (<>
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-7xl block mb-4">🎉</motion.span>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-3">Gift Redeemed!</h2>
          {meal && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 my-4 text-left">
              <p className="font-bold text-white text-lg">{meal.dish}</p>
              <p className="text-orange-400 text-sm">₹{meal.priceMin}</p>
              {meal.giftMessage && <p className="text-gray-400 text-sm mt-2 italic">"{meal.giftMessage}"</p>}
            </motion.div>
          )}
          <p className="text-gray-400 mb-6">Enjoy your meal! 😋</p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/home")}
            className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors">Browse More Meals →</motion.button>
        </>)}

        {status === "error" && (<>
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl block mb-4">😔</motion.span>
          <h2 className="text-2xl font-bold text-red-400 mb-3">Oops!</h2>
          <p className="text-gray-400 mb-6">This gift has already been redeemed or doesn't exist.</p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/home")}
            className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors">Go to Feed →</motion.button>
        </>)}
      </motion.div>
    </div>
  );
}
