const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


// ✅ REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, referredCode } = req.body;

  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);
  
  // Generate a unique 6-character referral code
  const referralCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  
  let referredByUserId = null;
  
  // Check if referredCode is valid
  if (referredCode) {
    const referringUser = await User.findOne({ referralCode: referredCode });
    if (referringUser) {
      referredByUserId = referringUser._id;
      // Increment points for the referrer
      referringUser.points = (referringUser.points || 0) + 50;
      await referringUser.save();
    }
  }

  user = new User({
    name,
    email,
    password: hashed,
    referralCode,
    referredBy: referredByUserId,
    points: 0
  });

  await user.save();

  const token = jwt.sign({ id: user._id }, "secretkey");

  res.json({ token });
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN:", email, password);

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(400).json({ message: "User not found" });
    }

    console.log("HASH:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user._id }, "secretkey");

    res.json({ token });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

const auth = require("../middleware/auth");

// ✅ GET PROFILE
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Lazily generate referral code for existing users who don't have one
    if (!user.referralCode) {
      user.referralCode = crypto.randomBytes(3).toString("hex").toUpperCase();
      await user.save();
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE PROFILE
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, phone, bio, avatar, neighborhood, pincode } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (neighborhood !== undefined) user.neighborhood = neighborhood;
    if (pincode !== undefined) user.pincode = pincode;

    await user.save();
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ RATE USER
router.post("/rate/:id", auth, async (req, res) => {
  try {
    const { rating } = req.body; // 1 to 5
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating value" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    // Simple moving average calculation for MVP
    const currentTotal = targetUser.ratingAverage * targetUser.ratingCount;
    const newCount = targetUser.ratingCount + 1;
    const newAverage = (currentTotal + rating) / newCount;

    targetUser.ratingAverage = newAverage;
    targetUser.ratingCount = newCount;
    await targetUser.save();

    res.json({ 
      message: "Rating saved successfully", 
      ratingAverage: targetUser.ratingAverage,
      ratingCount: targetUser.ratingCount
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET LEADERBOARD
router.get("/leaderboard", async (req, res) => {
  try {
    const topUsers = await User.find({})
      .sort({ points: -1 })
      .limit(20)
      .select("name avatar points ratingAverage currentStreak longestStreak badges isVerifiedKitchen totalMealsShared");
      
    res.json(topUsers);
  } catch (err) {
    console.error("LEADERBOARD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ SUBMIT KITCHEN VERIFICATION
router.post("/verify-kitchen", auth, async (req, res) => {
  try {
    const { kitchenPhotos } = req.body;
    if (!kitchenPhotos || kitchenPhotos.length === 0) {
      return res.status(400).json({ message: "Please upload kitchen photos" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.kitchenPhotos = kitchenPhotos;
    user.verificationStatus = "pending";
    await user.save();

    res.json({ message: "Verification submitted! We'll review your kitchen soon. 🛡️" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ APPROVE KITCHEN (admin-like, for demo purposes auto-approve)
router.post("/approve-kitchen/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerifiedKitchen = true;
    user.verificationStatus = "approved";
    await user.save();

    res.json({ message: "Kitchen verified! ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET USER BADGES
router.get("/badges/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("badges currentStreak longestStreak totalMealsShared");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET CHEF PROFILE (public)
router.get("/chef/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name avatar bio ratingAverage ratingCount currentStreak longestStreak badges isVerifiedKitchen totalMealsShared cuisinesPosted neighborhood");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;