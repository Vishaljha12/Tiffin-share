const express = require("express");
const router = express.Router();
const Neighborhood = require("../models/Neighborhood");
const User = require("../models/User");
const Meal = require("../models/Meal");
const auth = require("../middleware/auth");

// ✅ GET ALL NEIGHBORHOODS
router.get("/", async (req, res) => {
  try {
    const neighborhoods = await Neighborhood.find()
      .populate("topChef", "name avatar ratingAverage currentStreak")
      .select("-chat")
      .sort({ "members.length": -1 });
    res.json(neighborhoods);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ JOIN/CREATE NEIGHBORHOOD
router.post("/join", auth, async (req, res) => {
  try {
    const { name, pincode } = req.body;
    if (!name) return res.status(400).json({ message: "Neighborhood name required" });

    let hood = await Neighborhood.findOne({ name: name.toLowerCase().trim() });

    if (!hood) {
      hood = new Neighborhood({
        name: name.toLowerCase().trim(),
        pincode: pincode || "",
        members: [req.user.id],
      });
    } else {
      if (!hood.members.includes(req.user.id)) {
        hood.members.push(req.user.id);
      }
    }

    await hood.save();

    // Update user
    const user = await User.findById(req.user.id);
    if (user) {
      user.neighborhood = hood.name;
      user.pincode = pincode || user.pincode;
      await user.save();
    }

    res.json({ message: `Joined ${hood.name}!`, neighborhood: hood });
  } catch (err) {
    console.error("JOIN NEIGHBORHOOD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET SPECIFIC NEIGHBORHOOD (with chat)
router.get("/:name", async (req, res) => {
  try {
    const hood = await Neighborhood.findOne({ name: req.params.name.toLowerCase() })
      .populate("members", "name avatar ratingAverage currentStreak totalMealsShared badges isVerifiedKitchen")
      .populate("topChef", "name avatar ratingAverage currentStreak totalMealsShared");

    if (!hood) return res.status(404).json({ message: "Neighborhood not found" });

    // Get neighborhood feed (meals from members)
    const memberIds = hood.members.map(m => m._id || m);
    const meals = await Meal.find({
      userId: { $in: memberIds },
      expiresAt: { $gt: new Date() },
      isClaimed: false,
    })
      .populate("userId", "name avatar ratingAverage currentStreak isVerifiedKitchen")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ neighborhood: hood, meals });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST CHAT MESSAGE
router.post("/:name/chat", auth, async (req, res) => {
  try {
    const hood = await Neighborhood.findOne({ name: req.params.name.toLowerCase() });
    if (!hood) return res.status(404).json({ message: "Neighborhood not found" });
    if (!hood.members.map(m => m.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: "Join this neighborhood first" });
    }

    const user = await User.findById(req.user.id);

    hood.chat.push({
      userId: req.user.id,
      userName: user.name,
      userAvatar: user.avatar || "",
      message: req.body.message,
      timestamp: new Date(),
    });

    // Keep only last 100 messages
    if (hood.chat.length > 100) {
      hood.chat = hood.chat.slice(-100);
    }

    await hood.save();
    res.json({ message: "Message sent!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE TOP CHEF OF THE WEEK
router.post("/:name/top-chef", async (req, res) => {
  try {
    const hood = await Neighborhood.findOne({ name: req.params.name.toLowerCase() });
    if (!hood) return res.status(404).json({ message: "Neighborhood not found" });

    const memberIds = hood.members;
    
    // Find top chef by most meals + highest rating this week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const topChefs = await Meal.aggregate([
      {
        $match: {
          userId: { $in: memberIds },
          createdAt: { $gte: oneWeekAgo },
        }
      },
      {
        $group: {
          _id: "$userId",
          mealCount: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        }
      },
      { $sort: { mealCount: -1, avgRating: -1 } },
      { $limit: 1 }
    ]);

    if (topChefs.length > 0) {
      hood.topChef = topChefs[0]._id;
      hood.topChefUpdatedAt = new Date();
      await hood.save();
    }

    res.json({ message: "Top chef updated", topChef: topChefs[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
