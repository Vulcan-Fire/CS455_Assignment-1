const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/update-score', async (req, res) => {
  const { username, level, correctTilesSelected, totalTiles } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const levelData = {
      level,
      correctTilesSelected,
      totalTiles
    };

    if (user.levels[level - 1]) {
      user.levels[level - 1] = levelData;
    } else {
      user.levels.push(levelData);
    }

    user.tilesNow = 0;

    await user.save();
    
    res.json({ message: 'Score updated successfully', user });
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reset-tiles-now', async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalScore = user.levels.reduce((sum, levelData) => sum + levelData.correctTilesSelected, 0) + user.tilesNow;
    if(totalScore > user.maxScore)
      user.maxScore = totalScore;

    user.tilesNow = 0;
    await user.save();

    res.json({ message: 'TilesNow reset successfully' });
  } catch (error) {
    console.error('Error resetting tilesNow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/update-tiles-now', async (req, res) => {
  const { username, tilesNow } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.tilesNow = tilesNow;
    await user.save();
    
    res.json({ message: 'TilesNow updated successfully' });
  } catch (error) {
    console.error('Error updating tilesNow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const topScores = await User.find({})
      .sort({ maxScore: -1 })
      .limit(10)
      .select('username maxScore');

    res.status(200).json(topScores);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
