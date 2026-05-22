const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema({
  // CRITICAL: Links the generation to the User
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  formula: String,
  targetEnergy: String,
  spaceGroup: String,
  cifData: String,
}, { timestamps: true });

module.exports = mongoose.model('Generation', generationSchema);