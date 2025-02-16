import { createRoot } from 'react-dom/client'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '../shared//styles/index.scss'

import { ReduxProvider, RouterProvider, ThemeProvider } from './providers'

createRoot(document.getElementById('root') as HTMLElement).render(
  <ThemeProvider>
    <ReduxProvider>
      <RouterProvider />
    </ReduxProvider>
  </ThemeProvider>
  // <StrictMode></StrictMode>
)
