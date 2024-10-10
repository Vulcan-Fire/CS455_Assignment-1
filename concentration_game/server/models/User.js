const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  maxScore: {
    type: Number,
    default: 0,
  },
  tilesNow: {
    type: Number,
    default: 0,
  },
  levels: [
    {
      level: Number,
      totalTiles: Number,
      correctTilesSelected: Number,
    },
  ],
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


UserSchema.methods.calculateTotalScore = function () {
  return this.levels.reduce((sum, level) => sum + level.correctTilesSelected, 0);
};

UserSchema.methods.updateMaxScore = function () {
  const currentScore = this.calculateTotalScore();
  if (currentScore > this.maxScore) {
    this.maxScore = currentScore;
  }
  return this.maxScore;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
