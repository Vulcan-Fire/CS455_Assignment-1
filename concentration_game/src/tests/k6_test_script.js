import http from "k6/http";
import { sleep } from "k6";

// Load test options
export const options = {
  stages: [
    { duration: "100s", target: 10000 }, // Ramp-up to 50 users over 30 seconds
    { duration: "10s", target: 10000 },
    { duration: "100s", target: 0 }, // Ramp-down to 0 users over 30 seconds
  ],
};

// Default function to be executed by K6 virtual users
export default function () {
  const url = "https://cs455-assignment-1-khsw.onrender.com/api/auth"; // Replace with your target URL
  const payload = JSON.stringify({
    username: "user1",
    password: "pass123",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Make the POST request
  http.post(url, payload, params);

  // Simulate a short pause between requests to mimic user behavior
  sleep(1);
}
