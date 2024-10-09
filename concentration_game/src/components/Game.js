import React, { useState, useEffect } from "react";
import PropTypes from "prop-types"; 
import { useNavigate } from "react-router-dom";
import GameBoard from "./Board";
import useGameLogic from "./FlipLogic";
import "./Game.css";

const levels = [
  { gridSize: 4, name: "Level 1", coloredCells: 5 },
  { gridSize: 6, name: "Level 2", coloredCells: 8 },
  { gridSize: 6, name: "Level 3", coloredCells: 10 },
  { gridSize: 8, name: "Level 4", coloredCells: 10 },
  { gridSize: 8, name: "Level 5", coloredCells: 12 },
];

const getLevelInfo = (currentLevelIndex) => levels[currentLevelIndex];

const handleTransition = (
  setShowTransitionScreen,
  setCurrentLevelIndex,
) => {
  setShowTransitionScreen(true);
  setTimeout(() => {
    setShowTransitionScreen(false);
    setCurrentLevelIndex((prevIndex) => prevIndex + 1);
  }, 2000);
};

const checkGameCompletion = async (
  isGameWon,
  currentLevelIndex,
  setShowTransitionScreen,
  setCurrentLevelIndex,
  setGameCompleted,
  tilesLeft,
  currentLevel,
  username
) => {
  if (isGameWon) {
    if (currentLevelIndex < levels.length - 1) {
      await handleLevelCompletion(currentLevelIndex, tilesLeft, username);
      handleTransition(
        setShowTransitionScreen,
        setCurrentLevelIndex,
      );
    } else {
      setGameCompleted(true);
      await handleLevelCompletion(currentLevelIndex, tilesLeft, username);
    }
  }
};

const handleLevelCompletion = async (currentLevelIndex, tilesLeft, username) => {
  try {
    const response = await fetch("http://localhost:5000/api/game/update-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        level: currentLevelIndex + 1,
        correctTilesSelected: levels[currentLevelIndex].coloredCells - tilesLeft,
        totalTiles: levels[currentLevelIndex].coloredCells,
      }),
    });

    await fetch("http://localhost:5000/api/game/reset-tiles-now", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    const data = await response.json();
    console.log('Score updated:', data);
    
  } catch (error) {
    console.error('Error updating score:', error);
  }
};

const handleInbetweenLevel = async (username, flippedBlocks) => {
  const selectedTiles = flippedBlocks.filter((flipped) => flipped).length;

  try {
    const response = await fetch("http://localhost:5000/api/game/update-tiles-now", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        tilesNow: selectedTiles,
      }),
    });

    const data = await response.json();
    console.log('TilesNow updated:', data);
  } catch (error) {
    console.error('Error updating tilesNow:', error);
  }
};

const calculateTilesLeft = (blocks, flippedBlocks, username, currentLevelIndex) => {
  const totalColoredTiles = blocks.filter((block) => block.isDifferent).length;
  const flippedColoredTiles = blocks
    .map((block, index) => block.isDifferent && flippedBlocks[index])
    .filter(Boolean).length;
  console.log(currentLevelIndex, totalColoredTiles - flippedColoredTiles, username);
  
  if(totalColoredTiles - flippedColoredTiles != 0)
  handleInbetweenLevel(username, flippedBlocks);
  return totalColoredTiles - flippedColoredTiles;
};

const useMemoryGame = (
  currentLevelIndex,
  setCurrentLevelIndex,
  setShowTransitionScreen,
  setGameCompleted,
  username
) => {
  const currentLevel = getLevelInfo(currentLevelIndex);
  const totalBlocks = currentLevel.gridSize * currentLevel.gridSize;
  const numDifferent = currentLevel.coloredCells;
  const {
    blocks,
    flippedBlocks,
    isGameVisible,
    isGameWon,
    isGameOver,
    handleBlockClick,
  } = useGameLogic(totalBlocks, numDifferent, currentLevel.twoColors);

  useEffect(() => {
    checkGameCompletion(
      isGameWon,
      currentLevelIndex,
      setShowTransitionScreen,
      setCurrentLevelIndex,
      setGameCompleted,
      calculateTilesLeft(blocks, flippedBlocks, username, currentLevelIndex),
      currentLevel,
      username
    );
  }, [isGameWon]);


  const tilesLeft = calculateTilesLeft(blocks, flippedBlocks, username, currentLevelIndex);
  return {
    currentLevel,
    blocks,
    flippedBlocks,
    isGameVisible,
    isGameOver,
    isGameWon,
    handleBlockClick,
    tilesLeft,
  };
};

const MemoryGame = ({ username }) => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [showTransitionScreen, setShowTransitionScreen] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const navigate = useNavigate();

  const {
    currentLevel,
    blocks,
    flippedBlocks,
    isGameVisible,
    isGameOver,
    isGameWon,
    handleBlockClick,
    tilesLeft,
  } = useMemoryGame(
    currentLevelIndex,
    setCurrentLevelIndex,
    setShowTransitionScreen,
    setGameCompleted,
    username
  );

  useEffect(() => {
    const resetTilesNowBeforeNavigate = async () => {
      try {
        await fetch("http://localhost:5000/api/game/reset-tiles-now", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        });
        navigate("/LeaderBoard");
      } catch (error) {
        console.error('Error resetting tilesNow:', error);
      }
    };

    if (isGameOver && !isGameWon) {
      resetTilesNowBeforeNavigate();
    }
  }, [isGameOver, isGameWon, navigate, username]);

  return (
    <div className="MemoryGame">
      {gameCompleted ? (
        <CongratulationsScreen />
      ) : showTransitionScreen ? (
        <TransitionScreen currentLevelIndex={currentLevelIndex} />
      ) : (
        <div className="GameContainer">
          <GameHeader
            currentLevel={currentLevel}
            tilesLeft={tilesLeft}
            totalColoredTiles={currentLevel.coloredCells}
          />
          <GameBoard
            blocks={blocks}
            flippedBlocks={flippedBlocks}
            isGameVisible={isGameVisible}
            isGameOver={isGameOver}
            handleBlockClick={handleBlockClick}
          />
          {isGameOver && !isGameWon}
        </div>
      )}
    </div>
  );
};

MemoryGame.propTypes = {
  username: PropTypes.string.isRequired,
};

const GameHeader = ({ currentLevel, tilesLeft, totalColoredTiles }) => (
  <div className="GridContainer">
    <h1 className="grid-heading">Memory Game</h1>
    <div className="game-info">
      <div className="info-item">
        Tiles Left: {tilesLeft}/{totalColoredTiles}
      </div>
      <div className="info-item">{currentLevel.name}</div>
    </div>
  </div>
);
GameHeader.propTypes = {
  currentLevel: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  tilesLeft: PropTypes.number.isRequired,
  totalColoredTiles: PropTypes.number.isRequired,
};

const TransitionScreen = ({ currentLevelIndex }) => (
  <div className="transition-screen">
    <h2>
      Too Easy! Ready for:{" "}
      {levels[currentLevelIndex + 1]?.name || "the Ultimate Challenge!"}
    </h2>
  </div>
);
TransitionScreen.propTypes = {
  currentLevelIndex: PropTypes.number.isRequired,
};

const CongratulationsScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="congratulations-page">
      <h1>Congratulations!</h1>
      <p>You&rsquo;ve conquered all the levels!</p>
      <p>You&rsquo;re a memory master!</p>
      <button
        onClick={() => navigate("/leaderboard")}
        className="play-again-button"
      >
        View Leaderboard
      </button>
    </div>
  );
};

export default MemoryGame;
