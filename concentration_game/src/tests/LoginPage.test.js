import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import LoginPage from '../components/LoginPage';
import { useNavigate } from 'react-router-dom';


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('LoginPage', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders without crashing', () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter>
        <LoginPage onLogin={jest.fn()} />
      </MemoryRouter>
    );
    
    expect(getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  test('renders login button', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <LoginPage onLogin={jest.fn()} />
      </MemoryRouter>
    );

    expect(getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('failed login displays an error message', async () => {
    const mockOnLogin = jest.fn();
  
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      })
    );
  
    const { getByPlaceholderText, getByRole, findByText } = render(
      <MemoryRouter>
        <LoginPage onLogin={mockOnLogin} />
      </MemoryRouter>
    );
  
    fireEvent.change(getByPlaceholderText(/username/i), { target: { value: 'testUser' } });
    fireEvent.change(getByPlaceholderText(/password/i), { target: { value: 'wrongPassword' } });
    fireEvent.click(getByRole('button', { name: /login/i }));
  
    const errorMessage = await findByText(/invalid credentials/i);
    expect(errorMessage).toBeInTheDocument();
  
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockOnLogin).not.toHaveBeenCalled();
  
    global.fetch.mockRestore();
  });

  test('displays an error message if network error occurs', async () => {
    const mockOnLogin = jest.fn();
  
    global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')));
  
    const { getByPlaceholderText, getByRole, findByText } = render(
      <MemoryRouter>
        <LoginPage onLogin={mockOnLogin} />
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText(/username/i), { target: { value: 'testUser' } });
    fireEvent.change(getByPlaceholderText(/password/i), { target: { value: 'testPassword' } });
    fireEvent.click(getByRole('button', { name: /login/i }));

    const errorMessage = await findByText(/an error occurred. please try again./i);
    expect(errorMessage).toBeInTheDocument();
  
    expect(mockOnLogin).not.toHaveBeenCalled();
  
    global.fetch.mockRestore();
  });
  
  test('clears input fields after successful login', async () => {
    const mockOnLogin = jest.fn();
    const mockNavigate = jest.fn();
  
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
  
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ username: 'testUser' }),
      })
    );
  
    const { getByPlaceholderText, getByRole } = render(
      <MemoryRouter>
        <LoginPage onLogin={mockOnLogin} />
      </MemoryRouter>
    );
  
    const usernameInput = getByPlaceholderText(/username/i);
    const passwordInput = getByPlaceholderText(/password/i);
  
    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
    fireEvent.click(getByRole('button', { name: /login/i }));
  
    await waitFor(() => {
      expect(usernameInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });
  
    global.fetch.mockRestore();
    mockNavigate.mockRestore();
  });
});
