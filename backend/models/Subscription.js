const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  // The subscriber (user who subscribes)
  subscriberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // The chef (user who offers subscription)
  chefId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  planName: String,
  weeklyPrice: Number,
  daysPerWeek: { type: Number, default: 5 },
  description: String,

  status: { type: String, enum: ["active", "paused", "cancelled"], default: "active" },
  
  startDate: { type: Date, default: Date.now },
  nextRenewalDate: Date,
  
  // Track daily claims
  dailyClaims: [{
    date: Date,
    mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
    claimed: { type: Boolean, default: false }
  }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
