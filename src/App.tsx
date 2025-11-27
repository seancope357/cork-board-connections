import { Toaster } from 'sonner';
import { CorkBoard } from './components/CorkBoard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationProvider } from './contexts/NotificationContext';

export default function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <div className="w-screen h-screen overflow-hidden bg-neutral-900">
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
    </ErrorBoundary>
  );
}
