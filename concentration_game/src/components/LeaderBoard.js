import React, { useEffect, useState } from "react";
import "./LeaderBoard.css";
import { Link } from "react-router-dom";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/game/leaderboard");
        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };
    fetchLeaderboardData();
  }, []);

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((player, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{player.username}</td>
              <td>{player.maxScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/game"><button className="retry"> Retry </button></Link>
    </div>
  );
};

export default Leaderboard;
