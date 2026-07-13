import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import NotificationsProvider from './hooks/useNotifications/NotificationsProvider';
import DialogsProvider from './hooks/useDialogs/DialogsProvider';
import AppTheme from './shared-theme/AppTheme';

createRoot(document.getElementById('root')).render(
  <StrictMode>
<AppTheme>
    <BrowserRouter>
      <NotificationsProvider>
        <DialogsProvider>
          <App />
        </DialogsProvider>
      </NotificationsProvider>
    </BrowserRouter>
    </AppTheme>
  </StrictMode>
);