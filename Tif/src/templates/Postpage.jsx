import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../components/Toast";

export default function PostPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [mealType, setMealType] = useState("regular");
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    dish: "", priceMin: "", priceMax: "", time: "", location: "", image: "",
    cuisine: "North Indian", isMystery: false, isSwap: false, swapWanted: "",
    isPreOrder: false, preOrderDate: "", preOrderMinOrders: 3,
    isSubscription: false, weeklyPrice: "", daysPerWeek: 5, subDescription: "",
    isStory: false, storyCaption: "", isCookAlong: false,
    ingredients: "", allergens: "",
  });

  const mealTypes = [
    { id: "regular", label: "Regular Meal", icon: "🍛", color: "orange" },
    { id: "mystery", label: "Mystery Meal", icon: "🎰", color: "purple" },
    { id: "swap", label: "Meal Swap", icon: "🤝", color: "blue" },
    { id: "preorder", label: "Pre-Order", icon: "🗓️", color: "green" },
    { id: "subscription", label: "Subscription", icon: "📦", color: "pink" },
    { id: "story", label: "Tiffin Story", icon: "📸", color: "amber" },
    { id: "cookalong", label: "Cook-Along", icon: "🎉", color: "red" },
  ];

  const cuisines = [
    "North Indian", "South Indian", "Chinese", "Italian", "Street Food",
    "Bengali", "Gujarati", "Punjabi", "Maharashtrian", "Continental",
    "Snacks", "Desserts", "Beverages", "Other",
  ];

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) { toast("Please login first", "warning"); navigate("/login"); return; }
    if (!form.dish && mealType !== "mystery") { toast("Please enter dish name", "warning"); return; }
    setIsLoading(true);
    const payload = {
      dish: mealType === "mystery" ? "Mystery Meal" : form.dish,
      priceMin: Number(form.priceMin) || 0, priceMax: Number(form.priceMax) || Number(form.priceMin) || 0,
      time: form.time, location: form.location, image: form.image, cuisine: form.cuisine,
      isMystery: mealType === "mystery", isSwap: mealType === "swap", swapWanted: form.swapWanted,
      isPreOrder: mealType === "preorder", preOrderDate: form.preOrderDate || null,
      preOrderMinOrders: Number(form.preOrderMinOrders) || 3,
      isSubscription: mealType === "subscription",
      subscriptionPlan: mealType === "subscription" ? {
        weeklyPrice: Number(form.weeklyPrice) || 250, daysPerWeek: Number(form.daysPerWeek) || 5,
        description: form.subDescription,
      } : undefined,
      isStory: mealType === "story", storyCaption: form.storyCaption, storyMedia: form.image,
      isCookAlong: mealType === "cookalong",
      ingredients: form.ingredients ? form.ingredients.split(",").map(i => i.trim()) : [],
      allergens: form.allergens ? form.allergens.split(",").map(a => a.trim()) : [],
    };
    try {
      const res = await fetch("http://localhost:5000/api/meals", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.message || "Failed to post", "error"); setIsLoading(false); return; }
      toast("Meal shared successfully! 🎉", "success");
      setTimeout(() => navigate("/home"), 600);
    } catch (err) {
      console.error(err);
      toast("Server error", "error");
      setIsLoading(false);
    }
  };

  const colorMap = {
    orange: "from-orange-400 to-orange-600", purple: "from-purple-400 to-purple-600",
    blue: "from-blue-400 to-cyan-500", green: "from-green-400 to-emerald-500",
    pink: "from-pink-400 to-pink-600", amber: "from-amber-400 to-orange-500",
    red: "from-red-400 to-red-600",
  };

  const activeColor = mealTypes.find(t => t.id === mealType)?.color || "orange";

  const InputField = ({ label, required, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">{label} {required && <span className="text-orange-500">*</span>}</label>
      {children}
    </div>
  );

  return (
    <div className="flex items-center justify-center py-8 px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="glass-card w-full max-w-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-44 h-44 bg-orange-500/15 blur-3xl rounded-full pointer-events-none" />

        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`text-3xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r ${colorMap[activeColor]}`}>
          Post a Meal 🍱
        </motion.h2>

        {/* Meal Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">What type of meal?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {mealTypes.map((t) => (
              <motion.button key={t.id} onClick={() => setMealType(t.id)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className={`relative p-3 rounded-xl text-center transition-colors border text-sm font-medium overflow-hidden ${
                  mealType === t.id ? "border-orange-500/30 text-white" : "bg-white/3 border-white/5 text-gray-400 hover:bg-white/5"
                }`}>
                {mealType === t.id && (
                  <motion.div layoutId="meal-type-bg" className="absolute inset-0 bg-orange-500/12"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                )}
                <span className="relative text-xl block mb-1">{t.icon}</span>
                <span className="relative">{t.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <AnimatePresence mode="wait">
            {mealType !== "mystery" ? (
              <motion.div key="dish" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <InputField label="Dish Name" required>
                  <input placeholder="e.g. Rajma Chawal" className="w-full px-4 py-3 rounded-xl glass-input"
                    value={form.dish} onChange={(e) => setForm({ ...form, dish: e.target.value })} />
                </InputField>
              </motion.div>
            ) : (
              <motion.div key="mystery-info" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 text-center">
                <span className="text-4xl block mb-2">🎰</span>
                <p className="text-purple-300 font-medium">Mystery Meal Mode</p>
                <p className="text-xs text-purple-300/60 mt-1">Dish name & photo hidden. Only price & rating visible!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <InputField label="Cuisine">
            <select className="w-full px-4 py-3 rounded-xl glass-input" value={form.cuisine}
              onChange={(e) => setForm({ ...form, cuisine: e.target.value })}>
              {cuisines.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </InputField>

          {mealType !== "swap" && (
            <div className="grid grid-cols-2 gap-4">
              <InputField label={mealType === "subscription" ? "Daily Price (₹)" : "Min Price (₹)"}>
                <input type="number" placeholder="50" className="w-full px-4 py-3 rounded-xl glass-input"
                  value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: e.target.value })} />
              </InputField>
              <InputField label={mealType === "subscription" ? "Weekly Price (₹)" : "Max Price (₹)"}>
                <input type="number" placeholder="100" className="w-full px-4 py-3 rounded-xl glass-input"
                  value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: e.target.value })} />
              </InputField>
            </div>
          )}

          {mealType === "swap" && (
            <InputField label="What do you want in return?" required>
              <input placeholder="e.g. Pasta, any South Indian dish..." className="w-full px-4 py-3 rounded-xl glass-input"
                value={form.swapWanted} onChange={(e) => setForm({ ...form, swapWanted: e.target.value })} />
            </InputField>
          )}

          {mealType === "preorder" && (
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Pre-Order Date">
                <input type="date" className="w-full px-4 py-3 rounded-xl glass-input"
                  value={form.preOrderDate} onChange={(e) => setForm({ ...form, preOrderDate: e.target.value })} />
              </InputField>
              <InputField label="Min Orders">
                <input type="number" placeholder="3" className="w-full px-4 py-3 rounded-xl glass-input"
                  value={form.preOrderMinOrders} onChange={(e) => setForm({ ...form, preOrderMinOrders: e.target.value })} />
              </InputField>
            </div>
          )}

          {mealType === "subscription" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Weekly Price (₹)">
                  <input type="number" placeholder="250" className="w-full px-4 py-3 rounded-xl glass-input"
                    value={form.weeklyPrice} onChange={(e) => setForm({ ...form, weeklyPrice: e.target.value })} />
                </InputField>
                <InputField label="Days/Week">
                  <select className="w-full px-4 py-3 rounded-xl glass-input" value={form.daysPerWeek}
                    onChange={(e) => setForm({ ...form, daysPerWeek: e.target.value })}>
                    {[3, 4, 5, 6, 7].map(d => <option key={d} value={d}>{d} days</option>)}
                  </select>
                </InputField>
              </div>
              <InputField label="Plan Description">
                <input placeholder="Mon-Fri homemade North Indian meals" className="w-full px-4 py-3 rounded-xl glass-input"
                  value={form.subDescription} onChange={(e) => setForm({ ...form, subDescription: e.target.value })} />
              </InputField>
            </>
          )}

          {mealType === "story" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
              <p className="text-amber-300 text-sm font-medium mb-2">📸 Tiffin Story</p>
              <p className="text-xs text-amber-300/60 mb-3">Auto-expires in 4 hours. Users can swipe and claim!</p>
              <input placeholder="Add a caption..." className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                value={form.storyCaption} onChange={(e) => setForm({ ...form, storyCaption: e.target.value })} />
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Time Available">
              <input placeholder="1:00 PM - 3:00 PM" className="w-full px-4 py-3 rounded-xl glass-input"
                value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </InputField>
            <InputField label="Location">
              <input placeholder="Andheri, Mumbai" className="w-full px-4 py-3 rounded-xl glass-input"
                value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </InputField>
          </div>

          {mealType !== "mystery" && (
            <InputField label="Image URL">
              <input placeholder="https://..." className="w-full px-4 py-3 rounded-xl glass-input"
                value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              {form.image && (
                <motion.img initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 120 }}
                  src={form.image} alt="Preview" className="w-full mt-2 rounded-xl object-cover" onError={(e) => e.target.style.display = 'none'} />
              )}
            </InputField>
          )}

          {/* Meal Passport */}
          <div className="border-t border-white/5 pt-5">
            <p className="text-sm font-medium text-gray-300 mb-3">🧾 Meal Passport <span className="text-gray-500 text-xs">(optional — builds trust!)</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Ingredients (comma-separated)</label>
                <input placeholder="rice, dal, ghee, salt" className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} /></div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Allergens (comma-separated)</label>
                <input placeholder="nuts, dairy, gluten" className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  value={form.allergens} onChange={(e) => setForm({ ...form, allergens: e.target.value })} /></div>
            </div>
          </div>
        </div>

        <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
          onClick={handleSubmit} disabled={isLoading}
          className={`w-full mt-8 bg-gradient-to-r ${colorMap[activeColor]} text-white font-semibold py-4 rounded-2xl transition-all shadow-lg btn-ripple disabled:opacity-60`}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Posting...
            </span>
          ) : mealType === "story" ? "Share Story 📸" : mealType === "cookalong" ? "Start Cook-Along 🎉" : "Share Meal 🚀"}
        </motion.button>
      </motion.div>
    </div>
  );
}