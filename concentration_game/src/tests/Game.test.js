import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MemoryGame from '../components/Game';
import '@testing-library/jest-dom/extend-expect';

const mockUsername = 'testUser';

global.fetch = jest.fn();

describe('MemoryGame', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders without crashing', () => {
    render(
      <MemoryRouter>
        <MemoryGame username={mockUsername} />
      </MemoryRouter>
    );
    expect(screen.getByText(/memory game/i)).toBeInTheDocument();
  });

  test('calls backend API on game over', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true }),
      })
    );

    render(
      <MemoryRouter>
        <MemoryGame username={mockUsername} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/game/update-tiles-now",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: mockUsername, tilesNow: 0 }),
        })
      );
    });
    
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
