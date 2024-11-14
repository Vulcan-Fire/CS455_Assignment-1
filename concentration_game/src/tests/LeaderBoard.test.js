import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Leaderboard from "../components/LeaderBoard";
import { loadBalancedFetch } from "../components/LoadBalancer";
import "@testing-library/jest-dom/extend-expect";

jest.mock("../components/LoadBalancer", () => ({
  loadBalancedFetch: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockLeaderboardData = [
  { username: "player1", maxScore: 100 },
  { username: "player2", maxScore: 80 },
  { username: "player3", maxScore: 60 },
  { username: "player4", maxScore: 40 },
];

describe("Leaderboard", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup default successful response
    loadBalancedFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockLeaderboardData),
      })
    );
  });

  test("renders without crashing", () => {
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );
    expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
  });

  test("fetches and displays leaderboard data", async () => {
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    await waitFor(async () => {
      const rows = await screen.findAllByRole("row");
      expect(rows).toHaveLength(mockLeaderboardData.length + 1); // +1 for header row

      mockLeaderboardData.forEach((player, index) => {
        expect(screen.getByText(player.username)).toBeInTheDocument();
        expect(screen.getByText(player.maxScore)).toBeInTheDocument();
        expect(screen.getByText(index + 1)).toBeInTheDocument();
      });
    });

    expect(loadBalancedFetch).toHaveBeenCalledWith("api/game/leaderboard");

    expect(loadBalancedFetch).toHaveBeenCalledTimes(1);
  });

  test("renders retry button when error occurs", async () => {
    loadBalancedFetch.mockRejectedValueOnce(new Error("API Error"));

    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      const retryButton = screen.getByRole("button", { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });
  });
});
