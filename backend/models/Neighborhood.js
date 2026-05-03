const mongoose = require("mongoose");

const neighborhoodSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  pincode: String,
  
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Community chat messages
  chat: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    userAvatar: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],

  // Top Chef of the Week
  topChef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  topChefUpdatedAt: Date,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Neighborhood", neighborhoodSchema);
