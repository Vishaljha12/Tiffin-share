const express = require("express");
const router = express.Router();
const Meal = require("../models/Meal");
const User = require("../models/User");
const auth = require("../middleware/auth");
const crypto = require("crypto");

// ===== BADGE DEFINITIONS =====
const BADGE_DEFS = {
  first_meal: { id: "first_meal", name: "First Meal", icon: "🌱" },
  five_star: { id: "five_star", name: "Five Star", icon: "⭐" },
  century_chef: { id: "century_chef", name: "Century Chef", icon: "💯" },
  variety_king: { id: "variety_king", name: "Variety King", icon: "🌍" },
  community_fav: { id: "community_fav", name: "Community Favorite", icon: "❤️" },
  early_bird: { id: "early_bird", name: "Early Bird", icon: "🕐" },
  night_owl: { id: "night_owl", name: "Night Owl", icon: "🌙" },
};

async function checkAndAwardBadges(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const existingIds = user.badges.map(b => b.id);
  const newBadges = [];

  // 🌱 First Meal
  if (!existingIds.includes("first_meal") && user.totalMealsShared >= 1) {
    newBadges.push(BADGE_DEFS.first_meal);
  }
  // 💯 Century Chef
  if (!existingIds.includes("century_chef") && user.totalMealsShared >= 100) {
    newBadges.push(BADGE_DEFS.century_chef);
  }
  // 🌍 Variety King
  if (!existingIds.includes("variety_king") && (user.cuisinesPosted || []).length >= 10) {
    newBadges.push(BADGE_DEFS.variety_king);
  }
  // ❤️ Community Favorite
  if (!existingIds.includes("community_fav") && (user.uniqueClaimers || []).length >= 50) {
    newBadges.push(BADGE_DEFS.community_fav);
  }

  if (newBadges.length > 0) {
    user.badges.push(...newBadges);
    await user.save();
  }
  return newBadges;
}

// Helper to update streak
async function updateStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (user.lastPostDate) {
    const lastPost = new Date(user.lastPostDate);
    const lastPostDay = new Date(lastPost.getFullYear(), lastPost.getMonth(), lastPost.getDate());
    const diffDays = Math.floor((today - lastPostDay) / (24 * 60 * 60 * 1000));

    if (diffDays === 0) {
      // Same day, no streak change
      return;
    } else if (diffDays === 1) {
      // Consecutive day!
      user.currentStreak += 1;
    } else {
      // Streak broken
      user.currentStreak = 1;
    }
  } else {
    user.currentStreak = 1;
  }

  if (user.currentStreak > user.longestStreak) {
    user.longestStreak = user.currentStreak;
  }

  user.lastPostDate = now;
  await user.save();
}

// ✅ POST MEAL (with streak, badges, mystery, swap, pre-order, story, cook-along)
router.post("/", auth, async (req, res) => {
  try {
    const createdAt = new Date();
    const hour = createdAt.getHours();

    const mealData = {
      ...req.body,
      userId: req.user.id,
      createdAt,
      expiresAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000),
    };

    // If it's a story, expires in 4 hours
    if (req.body.isStory) {
      mealData.storyExpiresAt = new Date(createdAt.getTime() + 4 * 60 * 60 * 1000);
      mealData.expiresAt = mealData.storyExpiresAt;
    }

    // If pre-order, set the preOrderDate
    if (req.body.isPreOrder && req.body.preOrderDate) {
      mealData.preOrderDate = new Date(req.body.preOrderDate);
    }

    // If gift, generate a token
    if (req.body.isGift) {
      mealData.giftToken = crypto.randomBytes(8).toString("hex");
      mealData.giftFrom = req.user.id;
    }

    const meal = new Meal(mealData);
    await meal.save();

    // Update user stats
    const user = await User.findById(req.user.id);
    if (user) {
      user.totalMealsShared = (user.totalMealsShared || 0) + 1;

      // Track cuisine
      const cuisine = req.body.cuisine || "Other";
      if (!user.cuisinesPosted) user.cuisinesPosted = [];
      if (!user.cuisinesPosted.includes(cuisine)) {
        user.cuisinesPosted.push(cuisine);
      }

      // Early Bird / Night Owl badges
      const existingIds = user.badges.map(b => b.id);
      if (hour < 7 && !existingIds.includes("early_bird")) {
        user.badges.push(BADGE_DEFS.early_bird);
      }
      if (hour >= 22 && !existingIds.includes("night_owl")) {
        user.badges.push(BADGE_DEFS.night_owl);
      }

      await user.save();
    }

    // Update streak
    await updateStreak(req.user.id);

    // Check badges
    await checkAndAwardBadges(req.user.id);

    res.json(meal);
  } catch (err) {
    console.error("POST MEAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET MEALS (Available only — excludes stories, shows mystery masked)
router.get("/", async (req, res) => {
  try {
    const { neighborhood, type } = req.query;
    
    const filter = {
      expiresAt: { $gt: new Date() },
      isClaimed: false,
      isStory: { $ne: true },
    };

    // Filter by neighborhood location if provided
    if (neighborhood) {
      filter.location = { $regex: neighborhood, $options: "i" };
    }

    // Filter by type
    if (type === "mystery") filter.isMystery = true;
    if (type === "swap") filter.isSwap = true;
    if (type === "preorder") filter.isPreOrder = true;
    if (type === "subscription") filter.isSubscription = true;
    if (type === "regular") {
      filter.isMystery = { $ne: true };
      filter.isSwap = { $ne: true };
      filter.isPreOrder = { $ne: true };
      filter.isSubscription = { $ne: true };
    }

    let meals = await Meal.find(filter)
      .populate("userId", "name avatar ratingAverage ratingCount currentStreak badges isVerifiedKitchen neighborhood")
      .sort({ createdAt: -1 });

    res.json(meals);
  } catch (err) {
    console.error("GET MEALS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET STORIES (Active stories, expires in 4 hours)
router.get("/stories", async (req, res) => {
  try {
    const stories = await Meal.find({
      isStory: true,
      storyExpiresAt: { $gt: new Date() },
    })
      .populate("userId", "name avatar ratingAverage currentStreak isVerifiedKitchen")
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET MY POSTS (Meals created by the user)
router.get("/my-posts", auth, async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.user.id })
      .populate("claimedBy", "name avatar phone") // So chef knows who claimed it
      .sort({ createdAt: -1 });

    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET MY CLAIMS (Meals claimed by the user)
router.get("/my-claims", auth, async (req, res) => {
  try {
    const meals = await Meal.find({ claimedBy: req.user.id })
      .populate("userId", "name avatar phone ratingAverage ratingCount") // So user knows chef details
      .sort({ createdAt: -1 });

    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ CLAIM A MEAL
router.post("/:id/claim", auth, async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) return res.status(404).json({ message: "Meal not found" });
    if (meal.isClaimed) return res.status(400).json({ message: "Meal already claimed" });
    if (meal.userId.toString() === req.user.id) return res.status(400).json({ message: "Cannot claim your own meal" });

    meal.isClaimed = true;
    meal.claimedBy = req.user.id;
    await meal.save();

    // Track unique claimers for badge
    const chef = await User.findById(meal.userId);
    if (chef) {
      if (!chef.uniqueClaimers) chef.uniqueClaimers = [];
      if (!chef.uniqueClaimers.includes(req.user.id)) {
        chef.uniqueClaimers.push(req.user.id);
      }
      await chef.save();
      await checkAndAwardBadges(meal.userId);
    }

    // Update claimer stats
    const claimer = await User.findById(req.user.id);
    if (claimer) {
      claimer.totalMealsClaimed = (claimer.totalMealsClaimed || 0) + 1;
      await claimer.save();
    }

    res.json({ message: "Meal claimed successfully", meal });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PRE-ORDER A MEAL
router.post("/:id/preorder", auth, async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    if (!meal.isPreOrder) return res.status(400).json({ message: "This meal doesn't support pre-order" });
    if (meal.userId.toString() === req.user.id) return res.status(400).json({ message: "Cannot pre-order your own meal" });
    if (meal.preOrderUsers.includes(req.user.id)) return res.status(400).json({ message: "Already pre-ordered" });

    meal.preOrderUsers.push(req.user.id);
    meal.preOrderCount = meal.preOrderUsers.length;

    if (meal.preOrderCount >= meal.preOrderMinOrders) {
      meal.preOrderConfirmed = true;
    }

    await meal.save();
    res.json({ message: "Pre-order placed!", meal });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ ACCEPT A MEAL SWAP
router.post("/:id/swap", auth, async (req, res) => {
  try {
    const { myDish } = req.body;
    const meal = await Meal.findById(req.params.id);

    if (!meal) return res.status(404).json({ message: "Meal not found" });
    if (!meal.isSwap) return res.status(400).json({ message: "This meal isn't for swapping" });
    if (meal.userId.toString() === req.user.id) return res.status(400).json({ message: "Cannot swap with yourself" });
    if (meal.swapAcceptedBy) return res.status(400).json({ message: "Swap already accepted" });

    meal.swapAcceptedBy = req.user.id;
    meal.swapAcceptedDish = myDish;
    meal.isClaimed = true;
    meal.claimedBy = req.user.id;
    await meal.save();

    res.json({ message: "Swap accepted! 🤝", meal });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GIFT A MEAL (Create a gift link)
router.post("/:id/gift", auth, async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    if (meal.isClaimed) return res.status(400).json({ message: "Meal already claimed" });

    meal.isGift = true;
    meal.giftFrom = req.user.id;
    meal.giftMessage = req.body.message || "Someone sent you a tiffin! 🎁";
    meal.giftToken = crypto.randomBytes(8).toString("hex");
    meal.isClaimed = true;
    meal.claimedBy = null; // Will be set when redeemed
    await meal.save();

    res.json({
      message: "Gift created!",
      giftLink: `/gift/${meal.giftToken}`,
      giftToken: meal.giftToken,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ REDEEM A GIFT
router.post("/gift/redeem/:token", auth, async (req, res) => {
  try {
    const meal = await Meal.findOne({ giftToken: req.params.token });
    if (!meal) return res.status(404).json({ message: "Gift not found" });
    if (meal.claimedBy) return res.status(400).json({ message: "Gift already redeemed" });

    meal.claimedBy = req.user.id;
    await meal.save();

    res.json({ message: "Gift redeemed! 🎉 Enjoy your meal!", meal });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ ADD COOK-ALONG UPDATE
router.post("/:id/cookalong", auth, async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    if (meal.userId.toString() !== req.user.id) return res.status(403).json({ message: "Not your meal" });

    meal.cookAlongUpdates.push({
      text: req.body.text,
      image: req.body.image || "",
      timestamp: new Date(),
    });
    await meal.save();

    res.json({ message: "Update added!", meal });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ REACT TO COOK-ALONG
router.post("/:id/cookalong/react", auth, async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });

    meal.cookAlongReactions.push({
      userId: req.user.id,
      emoji: req.body.emoji || "❤️",
    });
    await meal.save();

    res.json({ message: "Reaction added!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ ADD REVIEW AND RATING TO MEAL
router.post("/:id/review", auth, async (req, res) => {
  try {
    const { rating, reviewText } = req.body; // rating from 1 to 5

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating value" });
    }

    const meal = await Meal.findById(req.params.id);

    if (!meal) return res.status(404).json({ message: "Meal not found" });
    if (!meal.isClaimed || meal.claimedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the user who claimed this meal can review it" });
    }
    if (meal.rating) {
      return res.status(400).json({ message: "You have already reviewed this meal" });
    }

    // Save review to Meal
    meal.rating = rating;
    meal.reviewText = reviewText;
    await meal.save();

    // Update the Chef's overall rating
    const chef = await User.findById(meal.userId);
    if (chef) {
      const currentTotal = (chef.ratingAverage || 0) * (chef.ratingCount || 0);
      const newCount = (chef.ratingCount || 0) + 1;
      const newAverage = (currentTotal + rating) / newCount;

      chef.ratingAverage = newAverage;
      chef.ratingCount = newCount;

      // ⭐ Five Star badge
      if (rating === 5 && !chef.badges.find(b => b.id === "five_star")) {
        chef.badges.push(BADGE_DEFS.five_star);
      }

      await chef.save();
    }

    res.json({ message: "Review saved successfully", meal });
  } catch (err) {
    console.error("REVIEW ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DEMAND HEATMAP — What's trending in each area
router.get("/demand", async (req, res) => {
  try {
    const { location } = req.query;

    // Aggregate claimed meals by cuisine in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const demandData = await Meal.aggregate([
      {
        $match: {
          createdAt: { $gte: oneDayAgo },
          ...(location ? { location: { $regex: location, $options: "i" } } : {}),
        }
      },
      {
        $group: {
          _id: { cuisine: "$cuisine", location: "$location" },
          totalListings: { $sum: 1 },
          totalClaimed: { $sum: { $cond: ["$isClaimed", 1, 0] } },
        }
      },
      { $sort: { totalClaimed: -1 } },
      { $limit: 20 }
    ]);

    // AI-like suggestions based on time/season
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    let suggestions = [];

    if (hour < 10) {
      suggestions.push("🌅 Breakfast demand is HIGH right now! Post parathas, idli, or poha.");
    } else if (hour < 14) {
      suggestions.push("🍛 Lunch hour! Dal-rice and thalis are trending.");
    } else if (hour < 17) {
      suggestions.push("☕ Snack time! Pakoras and chai are popular.");
    } else {
      suggestions.push("🌙 Dinner time! Roti-sabzi combos are in demand.");
    }

    // Seasonal
    if (month >= 5 && month <= 8) {
      suggestions.push("🥤 Hot summer! Cold lassi and shakes are trending in your area.");
    } else if (month >= 10 || month <= 1) {
      suggestions.push("☔ Cozy season! Hot soups and halwa are in high demand.");
    }

    res.json({ demand: demandData, suggestions });
  } catch (err) {
    console.error("DEMAND ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET A SINGLE MEAL
router.get("/:id", async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id)
      .populate("userId", "name avatar ratingAverage ratingCount currentStreak badges isVerifiedKitchen")
      .populate("claimedBy", "name avatar")
      .populate("giftFrom", "name avatar")
      .populate("preOrderUsers", "name avatar");
    
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    res.json(meal);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;