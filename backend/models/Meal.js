const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  dish: String,
  priceMin: Number,
  priceMax: Number,
  time: String,
  location: String,
  image: String,
  cuisine: { type: String, default: "Other" },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  isClaimed: { type: Boolean, default: false },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  rating: { type: Number, min: 1, max: 5 },
  reviewText: String,

  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,

  // 🎰 Mystery Meal
  isMystery: { type: Boolean, default: false },

  // 📦 Tiffin Subscription
  isSubscription: { type: Boolean, default: false },
  subscriptionPlan: {
    daysPerWeek: { type: Number, default: 5 },
    weeklyPrice: Number,
    description: String,
  },

  // 🗓️ Pre-Order for Tomorrow
  isPreOrder: { type: Boolean, default: false },
  preOrderDate: Date,
  preOrderMinOrders: { type: Number, default: 3 },
  preOrderCount: { type: Number, default: 0 },
  preOrderUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  preOrderConfirmed: { type: Boolean, default: false },

  // 🤝 Meal Swap
  isSwap: { type: Boolean, default: false },
  swapWanted: String, // What do you want in return
  swapAcceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  swapAcceptedDish: String,

  // 🎁 Gift a Meal
  isGift: { type: Boolean, default: false },
  giftFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  giftTo: String, // email or link token
  giftMessage: String,
  giftToken: String,

  // 🍛 Tiffin Story
  isStory: { type: Boolean, default: false },
  storyExpiresAt: Date,
  storyMedia: String, // image/video url
  storyCaption: String,

  // 🧾 Meal Passport
  ingredients: [String],
  allergens: [String],
  cookedAt: Date,
  hygieneRating: { type: Number, min: 1, max: 5 },

  // 🎉 Cook-Along
  isCookAlong: { type: Boolean, default: false },
  cookAlongUpdates: [{
    text: String,
    timestamp: { type: Date, default: Date.now },
    image: String,
  }],
  cookAlongReactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: String,
  }],
});

module.exports = mongoose.model("Meal", mealSchema);