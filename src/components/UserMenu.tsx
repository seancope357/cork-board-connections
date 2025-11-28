import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { AuthModal } from './AuthModal';

export function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const notification = useNotification();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      notification.success('Signed out', 'You have been signed out successfully');
      setShowDropdown(false);
    } catch (error) {
      notification.error('Error', 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2">
          <div className="w-6 h-6 border-2 border-neutral-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="fixed top-4 right-4 z-40">
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg"
          >
            Sign In
          </button>
        </div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-40">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:inline">{user.email}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-64 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-700">
                  <p className="text-sm text-neutral-400">Signed in as</p>
                  <p className="text-white font-medium truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-700 text-white transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
