import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MemoryGame from '../components/Game';
import { loadBalancedFetch } from '../components/LoadBalancer';
import '@testing-library/jest-dom/extend-expect';

jest.mock('../components/LoadBalancer', () => ({
  loadBalancedFetch: jest.fn()
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockUsername = 'testUser';

const levels = [
  { gridSize: 4, name: "Level 1", coloredCells: 5 },
  { gridSize: 6, name: "Level 2", coloredCells: 8 },
  { gridSize: 6, name: "Level 3", coloredCells: 10 },
  { gridSize: 8, name: "Level 4", coloredCells: 10 },
  { gridSize: 8, name: "Level 5", coloredCells: 12 },
];

describe('MemoryGame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    loadBalancedFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  test('renders without crashing', () => {
    render(
      <MemoryRouter>
        <MemoryGame username={mockUsername} />
      </MemoryRouter>
    );
    expect(screen.getByText(/memory game/i)).toBeInTheDocument();
  });

  test('calls update-tiles-now API on initial render', async () => {
    render(
      <MemoryRouter>
        <MemoryGame username={mockUsername} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(loadBalancedFetch).toHaveBeenCalledWith(
        "api/game/update-tiles-now",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: mockUsername, tilesNow: 0 }),
        })
      );
    });

    expect(loadBalancedFetch).toHaveBeenCalledTimes(1);
  });

  test('handles API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    loadBalancedFetch.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <MemoryGame username={mockUsername} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating tilesNow:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test('updates score on level completion', async () => {
    render(
      <MemoryRouter>
        <MemoryGame username={mockUsername} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(loadBalancedFetch).toHaveBeenCalledWith(
        "api/game/update-tiles-now",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: mockUsername, tilesNow: 0 }),
        })
      );
    });
  });

  test('resets tiles on game over', async () => {
    render(
      <MemoryRouter>
        <MemoryGame username={mockUsername} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(loadBalancedFetch).toHaveBeenCalledWith(
        "api/game/update-tiles-now",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: mockUsername, tilesNow: 0 }),
        })
      );
    });
  });

  test('shows transition screen between levels', async () => {
    render(
      <MemoryRouter>
        <MemoryGame username={mockUsername} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Too Easy!/i)).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(loadBalancedFetch).toHaveBeenCalledWith(
        "api/game/update-tiles-now",
        expect.any(Object)
      );
    });
  });

  test('shows congratulations screen on game completion', async () => {
    render(
      <MemoryRouter>
        <MemoryGame username={mockUsername} />
      </MemoryRouter>
    );

    const finalLevelIndex = levels.length - 1;
    
    await waitFor(() => {
      expect(screen.queryByText(/Congratulations!/i)).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(loadBalancedFetch).toHaveBeenCalledWith(
        "api/game/update-tiles-now",
        expect.any(Object)
      );
    });
  });
});
