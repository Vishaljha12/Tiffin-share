import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "../components/Toast";

export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const initialRefCode = searchParams.get("ref") || "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    referredCode: initialRefCode,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Please fill all required fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        setIsLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("loginTime", Date.now());
      toast("Account created successfully! 🎉", "success");
      setTimeout(() => { window.location.href = "/home"; }, 500);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  const fields = [
    { key: "name", type: "text", label: "Full Name", placeholder: "John Doe", autoComplete: "name" },
    { key: "email", type: "email", label: "Email Address", placeholder: "you@example.com", autoComplete: "email" },
    { key: "password", type: "password", label: "Password", placeholder: "Min 6 characters", autoComplete: "new-password" },
  ];

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="glass-card w-full max-w-md p-8 relative overflow-hidden"
      >
        <div className="absolute top-[-60px] left-[-60px] w-36 h-36 bg-purple-500/25 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-40px] right-[-40px] w-28 h-28 bg-orange-500/15 blur-3xl rounded-full pointer-events-none"></div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 glow-text"
        >
          Create Account ✨
        </motion.h2>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-red-400 text-sm mb-4 text-center bg-red-500/10 border border-red-500/20 p-3 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          {fields.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{f.label} *</label>
              <input
                id={`register-${f.key}`}
                type={f.type}
                placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-xl glass-input"
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                onKeyDown={handleKeyDown}
                autoComplete={f.autoComplete}
              />
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Referral Code <span className="text-gray-600">(optional)</span></label>
            <input
              id="register-referral"
              type="text"
              placeholder="Enter referral code"
              value={form.referredCode}
              className="w-full px-4 py-3 rounded-xl glass-input text-orange-200 placeholder-orange-500/30"
              onChange={(e) => setForm({ ...form, referredCode: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 mt-4 btn-ripple disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Creating...
              </span>
            ) : "Register 🚀"}
          </motion.button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-400 mt-6 text-center"
        >
          Already have an account?{" "}
          <span
            className="text-orange-400 cursor-pointer hover:underline hover:text-orange-300 transition-colors"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
}