import { Toaster } from 'sonner';
import { CorkBoard } from './components/CorkBoard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserMenu } from './components/UserMenu';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <div className="w-screen h-screen overflow-hidden bg-neutral-900">
            <UserMenu />
            <CorkBoard />
            <Toaster
              position="top-right"
              theme="dark"
              richColors
              closeButton
              duration={4000}
            />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
