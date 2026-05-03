const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const auth = require("../middleware/auth");

// ✅ CREATE SUBSCRIPTION (Subscribe to a chef)
router.post("/", auth, async (req, res) => {
  try {
    const { chefId, planName, weeklyPrice, daysPerWeek, description } = req.body;

    if (chefId === req.user.id) {
      return res.status(400).json({ message: "Cannot subscribe to yourself" });
    }

    // Check if already subscribed
    const existing = await Subscription.findOne({
      subscriberId: req.user.id,
      chefId,
      status: "active",
    });
    if (existing) return res.status(400).json({ message: "Already subscribed to this chef" });

    const sub = new Subscription({
      subscriberId: req.user.id,
      chefId,
      planName: planName || "Weekly Plan",
      weeklyPrice: weeklyPrice || 250,
      daysPerWeek: daysPerWeek || 5,
      description: description || "Mon-Fri homemade meals",
      nextRenewalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await sub.save();
    res.json({ message: "Subscribed! 📦", subscription: sub });
  } catch (err) {
    console.error("SUB ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET MY SUBSCRIPTIONS (as subscriber)
router.get("/my", auth, async (req, res) => {
  try {
    const subs = await Subscription.find({ subscriberId: req.user.id })
      .populate("chefId", "name avatar ratingAverage currentStreak isVerifiedKitchen")
      .sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET MY SUBSCRIBERS (as chef)
router.get("/subscribers", auth, async (req, res) => {
  try {
    const subs = await Subscription.find({ chefId: req.user.id, status: "active" })
      .populate("subscriberId", "name avatar phone")
      .sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ CANCEL SUBSCRIPTION
router.post("/:id/cancel", auth, async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    if (sub.subscriberId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your subscription" });
    }

    sub.status = "cancelled";
    await sub.save();

    res.json({ message: "Subscription cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET SUBSCRIPTION PLANS OFFERED BY A CHEF
router.get("/chef/:chefId", async (req, res) => {
  try {
    const Meal = require("../models/Meal");
    const plans = await Meal.find({
      userId: req.params.chefId,
      isSubscription: true,
    }).populate("userId", "name avatar ratingAverage currentStreak isVerifiedKitchen");

    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
