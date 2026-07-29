// Where the whole React app starts.
// The <App /> is wrapped in providers so anything inside it can use them:
//   AppTheme     - Material UI colours/dark mode
//   BrowserRouter- page URLs
//   Notifications- the little pop-up messages
//   Dialogs      - shared confirm dialogs

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