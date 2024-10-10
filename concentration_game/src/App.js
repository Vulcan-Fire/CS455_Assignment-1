import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";
import Home from "./components/Home";
import Instructions from "./components/Instructions";
import Game from "./components/Game";
import LoginPage from "./components/LoginPage";
import AudioPlayer from "./components/AudioPlayer";
import backgroundMusic from "./assets/background-music.mp3";
import Leaderboard from "./components/LeaderBoard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);



  const handleLogin = (username) => {
    setIsAuthenticated(true);
    localStorage.setItem("username", username);
  };

  const handleLogout = async () => {
    try {
        await fetch('/api/logout', { method: 'POST' });
        setIsAuthenticated(false);
        localStorage.removeItem("username");
    } catch (error) {
        console.error("Logout error:", error);
    }
  };

  const LoginPageWithLogout = () => {
    useEffect(() => {
      handleLogout();
    }, []);
    
    return <LoginPage onLogin={handleLogin} />;
  };

  const username = localStorage.getItem("username") || isAuthenticated;

  return (
    <Router>
      <div>
        <AudioPlayer src={backgroundMusic} volume={0.3} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/LoginPage" element={<LoginPageWithLogout />} /> {}
          <Route path="/LeaderBoard" element={username ? <Leaderboard /> : <Navigate to="/LoginPage" />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route 
            path="/game" 
            element={username ? <Game username={username}/> : <Navigate to="/LoginPage" />} 
          /> {}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
