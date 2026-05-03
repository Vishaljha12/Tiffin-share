const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  phone: String,
  bio: String,
  avatar: String,

  // Rating system
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },

  // Referral system
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  points: { type: Number, default: 0 },

  // 🏘️ Neighborhood
  neighborhood: { type: String, default: "" },
  pincode: { type: String, default: "" },

  // 🔥 Streak System
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastPostDate: { type: Date, default: null },

  // 🏅 Badges & Achievements
  badges: [{
    id: String,
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],

  // 🛡️ Verified Kitchen
  isVerifiedKitchen: { type: Boolean, default: false },
  kitchenPhotos: [String],
  verificationStatus: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },

  // Stats for badges
  totalMealsShared: { type: Number, default: 0 },
  totalMealsClaimed: { type: Number, default: 0 },
  uniqueClaimers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  cuisinesPosted: [String],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);