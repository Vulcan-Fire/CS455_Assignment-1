import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard';
import '@testing-library/jest-dom/extend-expect';

global.fetch = jest.fn();

const mockLeaderboardData = [
  { username: 'player1', maxScore: 100 },
  { username: 'player2', maxScore: 80 },
  { username: 'player3', maxScore: 60 },
  { username: 'player4', maxScore: 40 },
];

describe('Leaderboard', () => {
  beforeEach(() => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockLeaderboardData),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
  });

  test('fetches and displays leaderboard data', async () => {
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    await waitFor(async () => {
      const rows = await screen.findAllByRole('row');

      expect(rows).toHaveLength(mockLeaderboardData.length + 1);

      mockLeaderboardData.forEach((player, index) => {
        expect(screen.getByText(player.username)).toBeInTheDocument();
        expect(screen.getByText(player.maxScore)).toBeInTheDocument();
        expect(screen.getByText(index + 1)).toBeInTheDocument();
      });
    });
  });

  test('renders retry button', () => {
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    const retryButton = screen.getByText(/retry/i);
    expect(retryButton).toBeInTheDocument();
  });
});
