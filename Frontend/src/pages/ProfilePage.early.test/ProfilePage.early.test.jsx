import React from 'react'
import axios from "axios";
import API_BASE_URL from "../../config/api.js";
import ProfilePage from '../ProfilePage';

// __tests__/ProfilePage.test.jsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import "@testing-library/jest-dom";

// __tests__/ProfilePage.test.jsx
// Mocking axios to prevent actual network requests
jest.mock("axios");

// Mocking React icons
jest.mock("react-icons/fa", () => ({
  FaUser: () => <div>FaUser Icon</div>,
  FaEnvelope: () => <div>FaEnvelope Icon</div>,
  FaBuilding: () => <div>FaBuilding Icon</div>,
  FaIdBadge: () => <div>FaIdBadge Icon</div>,
  FaLock: () => <div>FaLock Icon</div>,
}));

// Mocking useState hook
const mockSetState = jest.fn();
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: (initial) => [initial, mockSetState],
}));

describe('ProfilePage() ProfilePage method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    test('renders ProfilePage with user information', () => {
      // Render the ProfilePage component
      render(<ProfilePage />);

      // Check if user information is displayed
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('name@example.edu')).toBeInTheDocument();
      expect(screen.getByText('21BCE123')).toBeInTheDocument();
      expect(screen.getByText('Computer Engineering')).toBeInTheDocument();
      expect(screen.getByText('Student')).toBeInTheDocument();
    });

    test('successfully changes password when valid inputs are provided', async () => {
      // Mock axios response
      axios.put.mockResolvedValueOnce({ data: { message: 'Password changed successfully!' } });

      // Render the ProfilePage component
      render(<ProfilePage />);

      // Simulate user input
      fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'currentPass123!' } });
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPass123!' } });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'NewPass123!' } });

      // Simulate form submission
      fireEvent.click(screen.getByText('Save Password'));

      // Wait for the success message
      await waitFor(() => {
        expect(screen.getByText('Password changed successfully!')).toBeInTheDocument();
      });

      // Ensure axios was called with correct parameters
      expect(axios.put).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/change-password`,
        { currentPassword: 'currentPass123!', newPassword: 'NewPass123!' },
        expect.any(Object)
      );
    });
  });

  describe('Edge Cases', () => {
    test('displays error when new passwords do not match', () => {
      // Render the ProfilePage component
      render(<ProfilePage />);

      // Simulate user input
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPass123!' } });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'DifferentPass123!' } });

      // Simulate form submission
      fireEvent.click(screen.getByText('Save Password'));

      // Check for error message
      expect(screen.getByText('New passwords do not match.')).toBeInTheDocument();
    });

    test('displays error when new password is too short', () => {
      // Render the ProfilePage component
      render(<ProfilePage />);

      // Simulate user input
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'short' } });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'short' } });

      // Simulate form submission
      fireEvent.click(screen.getByText('Save Password'));

      // Check for error message
      expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
    });

    test('displays error when password does not meet strength requirements', () => {
      // Render the ProfilePage component
      render(<ProfilePage />);

      // Simulate user input
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'weakpass' } });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'weakpass' } });

      // Simulate form submission
      fireEvent.click(screen.getByText('Save Password'));

      // Check for error message
      expect(screen.getByText('Password must include uppercase, lowercase, number, and special character.')).toBeInTheDocument();
    });

    test('displays error when user is not logged in', async () => {
      // Mock localStorage to return null for token
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce(null);

      // Render the ProfilePage component
      render(<ProfilePage />);

      // Simulate user input
      fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'currentPass123!' } });
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPass123!' } });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'NewPass123!' } });

      // Simulate form submission
      fireEvent.click(screen.getByText('Save Password'));

      // Wait for the error message
      await waitFor(() => {
        expect(screen.getByText('You are not logged in. Please login again.')).toBeInTheDocument();
      });
    });

    test('displays error when API call fails', async () => {
      // Mock axios to reject the request
      axios.put.mockRejectedValueOnce({ response: { data: { message: 'Failed to change password. Please try again.' } } });

      // Render the ProfilePage component
      render(<ProfilePage />);

      // Simulate user input
      fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'currentPass123!' } });
      fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPass123!' } });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'NewPass123!' } });

      // Simulate form submission
      fireEvent.click(screen.getByText('Save Password'));

      // Wait for the error message
      await waitFor(() => {
        expect(screen.getByText('Failed to change password. Please try again.')).toBeInTheDocument();
      });
    });
  });
});