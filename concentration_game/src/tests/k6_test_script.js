import http from "k6/http";
import { sleep } from "k6";

// Load test options
export const options = {
  stages: [
    { duration: "180s", target: 1000 }, // Ramp-up to 10,000 users over 100 seconds
    { duration: "10s", target: 1000 }, // Hold at 10,000 users for 10 seconds
    { duration: "180s", target: 0 }, // Ramp-down to 0 users over 100 seconds
  ],
};

// Default function to be executed by K6 virtual users
export default function () {
  // Step 1: Login (POST request to /api/auth)
  const url = "https://cs455-assignment-1-khsw.onrender.com/api/auth";
  const payload = JSON.stringify({
    username: "user1",
    password: "pass123",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Make the POST request to login
  const loginResponse = http.post(url, payload, params);

  // Check if the login was successful (Status 200)
  if (loginResponse.status === 200) {
    // Step 2: Access the game page (GET request to /game)
    const gameUrl = "https://cs-455-assignment-1.vercel.app/game";
    const gameResponse = http.get(gameUrl);

    // You can optionally add some checks or logging here to ensure the game page was loaded
    if (gameResponse.status !== 200) {
      console.error("Failed to load the game page.");
    }
  } else {
    console.error("Login failed.");
  }

  // Simulate a short pause between requests to mimic user behavior
  sleep(1);
}
