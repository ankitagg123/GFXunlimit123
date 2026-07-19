import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppHeader from './AppHeader';
import { ToastContainer } from 'react-toastify';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock('./LoginModal', () => () => <div data-testid="login-modal" />);
jest.mock('./JoinModal', () => () => <div data-testid="join-modal" />);
jest.mock('./NotificationsPanel', () => () => <div data-testid="notifications-panel" />);

describe('AppHeader customer navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
  });

  it('shows customer navigation links and search bar for customer users', async () => {
    localStorage.setItem('token', 'demo-token');

    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

    render(
      <>
        <AppHeader
        showNotifications={false}
        setShowNotifications={jest.fn()}
        notificationCount={0}
        setNotificationCount={jest.fn()}
        setShowLoginModal={jest.fn()}
        setShowJoinModal={jest.fn()}
        showLoginModal={false}
        showJoinModal={false}
        joinModalAccountType=""
        setJoinModalAccountType={jest.fn()}
        darkMode={false}
        notifications={[]}
        setActivePage={jest.fn()}
        setDarkMode={jest.fn()}
        userRole="customer"
        />
        <ToastContainer />
      </>
    );

    expect(screen.getByRole('button', { name: /explore/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /my collections/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /my account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add credits/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    
    // open credits menu and add 100 credits
    userEvent.click(screen.getByRole('button', { name: /add credits/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /\+100 Credits/i })).toBeInTheDocument());
    const option = screen.getByRole('button', { name: /\+100 Credits/i });
    userEvent.click(option);

    await screen.findByText(/100 credits added successfully/i);
    expect(global.fetch).toHaveBeenCalled();
    // menu should be closed after selection
    expect(screen.queryByRole('button', { name: /\+100 Credits/i })).toBeNull();

    global.fetch.mockRestore && global.fetch.mockRestore();
  });
});
