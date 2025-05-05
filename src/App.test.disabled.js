// src/App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';

// react-router-dom'u virtual mock ile taklit et
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => children,
  Routes: ({ children })    => children,
  Route: ()                  => null,
  Navigate: ()               => null,
}), { virtual: true });

import App from './App';

describe('App Bileşeni', () => {
  test('CreateAccountForm içeren form DOM’da olmalıdır', () => {
    render(<App />);
    expect(screen.getByTestId('form')).toBeInTheDocument();
  });
});
