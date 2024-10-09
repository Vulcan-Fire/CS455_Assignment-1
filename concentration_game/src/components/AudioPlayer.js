import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./AudioPlayer.css";

const useAudioPlayer = (audioRef, volume, isPlaying) => {
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Playback failed:", error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [volume, isPlaying]);
};

const PlayPauseButton = ({ isPlaying, togglePlayPause }) => (
  <button
    className="play-button"
    onClick={togglePlayPause}
    data-testid="play-pause-button"
  >
    {isPlaying ? "Stop Music" : "Play Music"}
  </button>
);

PlayPauseButton.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  togglePlayPause: PropTypes.func.isRequired,
};

const HomeButton = () => (
  <a href="/" className="home-link" data-testid="home-button">
    <button className="home-button">Home</button>
  </a>
);
const Logout = () => (
  <a href="/LoginPage" className="logout-link" data-testid="logout-button">
    <button className="logout-button">Logout</button>
  </a>
);

const AudioPlayer = ({ src, volume, loop }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => setIsPlaying(!isPlaying);

  useAudioPlayer(audioRef, volume, isPlaying);

  return (
    <div className="audio-player-container" data-testid="audio-player">
      <audio ref={audioRef} src={src} loop={loop} data-testid="audio-element" />
      <HomeButton />
      <Logout />
      <PlayPauseButton
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
      />
    </div>
  );
};

AudioPlayer.propTypes = {
  src: PropTypes.string.isRequired,
  volume: PropTypes.number,
  loop: PropTypes.bool,
};

AudioPlayer.defaultProps = {
  volume: 0.5,
  loop: true,
};

export default AudioPlayer;
