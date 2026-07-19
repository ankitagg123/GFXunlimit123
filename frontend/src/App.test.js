import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the home hero content', () => {
  render(<App />);
  expect(screen.getByText(/Discover Millions of/i)).toBeInTheDocument();
});
