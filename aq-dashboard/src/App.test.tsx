import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Stub geolocation so Dashboard does not throw in jsdom
beforeEach(() => {
  Object.defineProperty(global.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: jest.fn(),
    },
  });
});

// Stub leaflet, which relies on a browser DOM unavailable in jsdom
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
}));

jest.mock('axios');

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('shows the waiting-for-location prompt while geolocation is pending', () => {
    render(<App />);
    expect(screen.getByText(/waiting for location/i)).toBeInTheDocument();
  });

  it('shows a button to enter location manually', () => {
    render(<App />);
    expect(
      screen.getByRole('button', { name: /enter location manually/i })
    ).toBeInTheDocument();
  });
});
