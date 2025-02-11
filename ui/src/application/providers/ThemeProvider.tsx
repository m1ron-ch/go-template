import { ReactNode } from 'react'

import { ThemeProvider as Provider, createTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'

const theme = createTheme({
  palette: {
    background: {
      default: '#f3f6f9',
    },
  },
  typography: {
    body1: { fontSize: '16px' },
    body2: { fontSize: '14px' },
    h1: { fontSize: '26px', fontWeight: 700, margin: 0 },
    h2: { fontSize: '20px', fontWeight: 700, margin: 0 },
    h3: { fontSize: '18px', fontWeight: 700, margin: 0 },
  },
})

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Provider theme={theme}>
      <CssBaseline />
      {children}
    </Provider>
  )
}
